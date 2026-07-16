"use client";

import { useSyncExternalStore } from "react";
import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  type Card as FsrsCard,
} from "ts-fsrs";
import { storage } from "./storage";
import { nowMs } from "./now";
import {
  SLICE_ITEMS,
  SLICE_GRAMMAR,
  SLICE_TRANSFORMS,
  SLICE_MAIN_PROMPT,
  itemsForDay,
  sliceItem,
  type SliceItem,
  type GrammarContrast,
  type TransformPrompt,
} from "./data/slice";

// Движок Vertical Slice v1 (vertical_slice_v1.md, ревизия 2).
// Отдельный контур пилота: своё состояние, свой produce-FSRS и свой
// append-only лог БЕЗ обрезки (ie_events режет старое — для пилота это
// недопустимо: экспозиция невосстановима задним числом). Гейт открыт для
// Pilot: ничего из этого не гейтит основное приложение.

// ───────────────────────── append-only лог ─────────────────────────

export type SliceEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  at: number;
};

const LOG_KEY = "ie_slice_log";
const STATE_KEY = "ie_slice_state";
const SRS_KEY = "ie_slice_srs";

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

function readLog(): SliceEvent[] {
  try {
    const raw = JSON.parse(storage().getItem(LOG_KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as SliceEvent[]) : [];
  } catch {
    return [];
  }
}

/** Записать событие пилота. Только добавление; лог никогда не режется. */
export function logSlice(type: string, payload: Record<string, unknown> = {}): SliceEvent {
  const e: SliceEvent = {
    id: `sl-${nowMs()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    at: nowMs(),
  };
  const log = readLog();
  log.push(e);
  storage().setItem(LOG_KEY, JSON.stringify(log));
  notify();
  return e;
}

export function sliceLog(): SliceEvent[] {
  return readLog();
}

// ───────────────────────── состояние пилота ─────────────────────────

export type ProfileMark = "yes" | "no" | "insufficient";
export type ProfileKey = "P1" | "P2" | "P3" | "P4" | "P5";

export type SliceState = {
  /** вход в пилот: профиль P1–P5 (наблюдаемые проверки, без порогов) */
  entry?: { at: number; profile: Record<ProfileKey, ProfileMark>; note?: string };
  /** претест: когда сделан и в каком порядке шли единицы (тот же — в день 14) */
  pretestAt?: number;
  itemOrder?: string[];
  /** сколько учебных сессий завершено (full + recovery) */
  sessionsCompleted: number;
  /** сколько дней введения пройдено (0–5); recovery не двигает */
  introDone: number;
  lastSessionAt?: number;
  assessAt?: number;
  newContextAt?: number;
};

// Снапшот для useSyncExternalStore обязан быть стабильной ссылкой, пока
// подлежащая строка не изменилась — иначе бесконечный ре-рендер.
let stateCache: { raw: string | null; value: SliceState } | null = null;

function readState(): SliceState {
  const raw = storage().getItem(STATE_KEY);
  if (stateCache && stateCache.raw === raw) return stateCache.value;
  let value: SliceState;
  try {
    value = { sessionsCompleted: 0, introDone: 0, ...(JSON.parse(raw ?? "{}") as Partial<SliceState>) };
  } catch {
    value = { sessionsCompleted: 0, introDone: 0 };
  }
  stateCache = { raw, value };
  return value;
}

function writeState(s: SliceState) {
  storage().setItem(STATE_KEY, JSON.stringify(s));
  notify();
}

export function sliceState(): SliceState {
  return readState();
}

export function useSliceState(): SliceState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const un = storage().subscribeExternal(cb);
      return () => {
        listeners.delete(cb);
        un();
      };
    },
    readState,
    readState
  );
}

// ───────────────────────── вход в пилот ─────────────────────────

export function recordPilotEntry(profile: Record<ProfileKey, ProfileMark>, note?: string) {
  const s = readState();
  s.entry = { at: nowMs(), profile, note: note?.trim() || undefined };
  writeState(s);
  logSlice("pilot-entry", { profile, note: note?.trim() || undefined });
}

// ───────────────────────── нормализация и проверка форм ─────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsForm(normalizedText: string, form: string): boolean {
  const f = normalize(form);
  if (!f) return false;
  return ` ${normalizedText} `.includes(` ${f} `);
}

/** Единица найдена в тексте: каждая группа форм дала совпадение. */
export function itemFoundInText(item: SliceItem, text: string): boolean {
  const n = normalize(text);
  return item.lemmas.every((group) => group.some((form) => containsForm(n, form)));
}

/** Все единицы банка, найденные в тексте (для резюме по написанному ответу). */
export function detectFoundItems(text: string): SliceItem[] {
  if (!text.trim()) return [];
  return SLICE_ITEMS.filter((i) => itemFoundInText(i, text));
}

/** Общая проверка: в тексте есть форма из КАЖДОЙ группы. */
export function lemmasSatisfied(lemmas: string[][], text: string): boolean {
  const n = normalize(text);
  return lemmas.every((group) => group.some((form) => containsForm(n, form)));
}

export function transformSatisfied(t: TransformPrompt, text: string): boolean {
  return lemmasSatisfied(t.lemmas, text);
}

// ───────────────────────── produce-FSRS среза ─────────────────────────

const f = fsrs(
  generatorParameters({ enable_fuzz: false, learning_steps: [], relearning_steps: [] })
);

type SliceCard = FsrsCard & { itemId: string };
type SrsStore = Record<string, SliceCard>;

function readSrs(): SrsStore {
  try {
    return JSON.parse(storage().getItem(SRS_KEY) ?? "{}") as SrsStore;
  } catch {
    return {};
  }
}

function writeSrs(s: SrsStore) {
  storage().setItem(SRS_KEY, JSON.stringify(s));
  notify();
}

function reviveCard(c: SliceCard): FsrsCard {
  return { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined };
}

export type LadderDepth = 0 | 1 | 2 | 3; // 0 сам · 1 первая буква · 2 выбор из 3 · 3 показали

/**
 * Результат извлечения (смысл → форма). Глубина лесенки честно называет
 * оценку FSRS: сам = good, с подсказками = hard, показали = again.
 * Контракт «produce в сессии введения» выполняется по построению: первая
 * попытка и есть первая produce-оценка карточки.
 */
export function recordRetrieval(itemId: string, depth: LadderDepth, latencyMs?: number) {
  const s = readSrs();
  const now = new Date();
  const prev = s[itemId];
  const card: FsrsCard = prev ? reviveCard(prev) : createEmptyCard(now);
  const rating = depth === 0 ? Rating.Good : depth === 3 ? Rating.Again : Rating.Hard;
  const { card: next } = f.next(card, now, rating);
  s[itemId] = { ...next, itemId };
  writeSrs(s);
  // латентность — только shadow-данные в логе, ни на что не влияет
  logSlice("retrieval-attempt", { itemId, depth, latencyMs });
}

/** id единиц, которым пора вернуться (produce due), отсортированы по сроку. */
export function dueSliceItemIds(limit = 10): string[] {
  const s = readSrs();
  const now = nowMs();
  return Object.values(s)
    .filter((c) => new Date(c.due).getTime() <= now)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, limit)
    .map((c) => c.itemId);
}

/**
 * Состояние единицы для честного отчёта: <2 попыток = «недостаточно данных»
 * (не освоена и не провалена — просто рано судить).
 */
export function itemEvidence(itemId: string): "insufficient" | "tracked" {
  const attempts = readLog().filter(
    (e) => e.type === "retrieval-attempt" && e.payload.itemId === itemId
  ).length;
  return attempts < 2 ? "insufficient" : "tracked";
}

// ───────────────────────── претест и отложенный тест ─────────────────────────

/** Детерминированная перестановка (mulberry32 от фиксированного зерна входа). */
function shuffled(ids: string[], seed: number): string[] {
  let a = seed >>> 0;
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Порядок единиц теста. Фиксируется при претесте и НЕ меняется в день 14. */
export function assessmentOrder(): string[] {
  const s = readState();
  if (s.itemOrder?.length) return s.itemOrder;
  const seed = s.entry?.at ?? 20260716;
  return shuffled(SLICE_ITEMS.map((i) => i.id), seed);
}

export type AssessVerdict = "correct" | "incorrect" | "blank";

export function checkAssessmentAnswer(itemId: string, answer: string): AssessVerdict {
  const item = sliceItem(itemId);
  if (!item) return "incorrect";
  if (!answer.trim()) return "blank";
  return itemFoundInText(item, answer) ? "correct" : "incorrect";
}

export function recordAssessmentItem(
  phase: "pretest" | "day14",
  itemId: string,
  answer: string,
  verdict: AssessVerdict
) {
  logSlice("assessment-item", { phase, itemId, answer, verdict });
}

export function finishPretest() {
  const s = readState();
  s.pretestAt = nowMs();
  s.itemOrder = assessmentOrder();
  writeState(s);
  logSlice("pretest-finished", { order: s.itemOrder });
}

export function finishDay14() {
  const s = readState();
  s.assessAt = nowMs();
  writeState(s);
  logSlice("day14-finished", {});
}

export function recordNewContext(text: string, foundIds: string[], audioRef?: string) {
  const s = readState();
  s.newContextAt = nowMs();
  writeState(s);
  logSlice("new-context-submitted", { text, foundIds, voice: Boolean(audioRef) });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Отложенный тест открыт: ≥14 календарных дней от претеста (интервал важнее полноты). */
export function assessmentAvailable(now = nowMs()): boolean {
  const s = readState();
  return Boolean(s.pretestAt && !s.assessAt && now - s.pretestAt >= 14 * DAY_MS);
}

// ───────────────────────── план сессии ─────────────────────────

export type SessionPlan = {
  type: "intro" | "review" | "recovery";
  /** номер учебной сессии (1..14) */
  number: number;
  /** день введения (1–5) для intro */
  introDay?: 1 | 2 | 3 | 4 | 5;
  newItems: SliceItem[];
  reviewIds: string[];
  grammar?: GrammarContrast;
  transform?: TransformPrompt;
  /** production шага 4: промпт единицы дня / трансформация / главный вопрос */
  production: { kind: "item" | "transform" | "main"; itemId?: string; ru: string; lemmas: string[][] };
};

export const SLICE_TOTAL_SESSIONS = 14;

/** Пропуск ≥2 календарных дней при незаконченной программе → маршрут возврата. */
export function needsRecovery(now = nowMs()): boolean {
  const s = readState();
  if (!s.lastSessionAt || s.sessionsCompleted === 0) return false;
  if (s.sessionsCompleted >= SLICE_TOTAL_SESSIONS) return false;
  return now - s.lastSessionAt >= 2 * DAY_MS;
}

export function nextSessionPlan(recovery = false): SessionPlan {
  const s = readState();
  const number = Math.min(s.sessionsCompleted + 1, SLICE_TOTAL_SESSIONS);

  if (recovery) {
    return {
      type: "recovery",
      number,
      newItems: [],
      reviewIds: dueSliceItemIds(8),
      production: {
        kind: "main",
        ru: SLICE_MAIN_PROMPT.ru,
        lemmas: SLICE_MAIN_PROMPT.lemmas,
      },
    };
  }

  if (s.introDone < 5) {
    const introDay = (s.introDone + 1) as 1 | 2 | 3 | 4 | 5;
    const newItems = itemsForDay(introDay);
    // production дня введения — фрейм дня (первый в банке дня)
    const lead = newItems[0];
    return {
      type: "intro",
      number,
      introDay,
      newItems,
      reviewIds: dueSliceItemIds(5).filter((id) => !newItems.some((n) => n.id === id)),
      grammar: introDay >= 2 && introDay <= 4 ? SLICE_GRAMMAR[introDay - 2] : undefined,
      production: { kind: "item", itemId: lead.id, ru: lead.prompt, lemmas: lead.lemmas },
    };
  }

  // сессии возврата 6–14: трансформации в 6–11, главный вопрос в 12–14
  const transform = number >= 6 && number <= 11 ? SLICE_TRANSFORMS[number - 6] : undefined;
  return {
    type: "review",
    number,
    newItems: [],
    reviewIds: dueSliceItemIds(10),
    transform,
    production: transform
      ? { kind: "transform", ru: transform.ru, lemmas: transform.lemmas }
      : { kind: "main", ru: SLICE_MAIN_PROMPT.ru, lemmas: SLICE_MAIN_PROMPT.lemmas },
  };
}

export function startSession(plan: SessionPlan) {
  logSlice("session-started", {
    type: plan.type,
    number: plan.number,
    introDay: plan.introDay,
    newItems: plan.newItems.map((i) => i.id),
    reviewIds: plan.reviewIds,
  });
}

export function completeSession(plan: SessionPlan) {
  const s = readState();
  s.sessionsCompleted = Math.min(s.sessionsCompleted + 1, SLICE_TOTAL_SESSIONS);
  if (plan.type === "intro") s.introDone = Math.min(s.introDone + 1, 5);
  s.lastSessionAt = nowMs();
  writeState(s);
  logSlice("session-completed", { type: plan.type, number: plan.number });
}

export function recordEncounter(itemIds: string[], step: string) {
  logSlice("encounter", { itemIds, step, exposure: "intentional" });
}

export function recordProduction(promptKind: string, text: string, foundIds: string[], satisfied: boolean) {
  logSlice("production-submitted", { promptKind, text, foundIds, satisfied });
}

export function recordVoiceArtifact(uri: string, promptKind: string) {
  logSlice("voice-artifact", { uri, promptKind });
}

export function recordSummaryShown(foundIds: string[]) {
  logSlice("summary-shown", { foundIds });
}

// ───────────────────────── прогресс (только процесс и task-performance) ─────────────────────────

export type SliceProgress = {
  sessionsCompleted: number;
  totalSessions: number;
  /** извлечения сегодня: без подсказки / всего */
  todayOk: number;
  todayTotal: number;
  voiceCount: number;
  /** сколько раз главный фрейм найден в написанных ответах */
  frameUses: number;
  insufficientCount: number;
};

export function sliceProgress(now = nowMs()): SliceProgress {
  const s = readState();
  const log = readLog();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const today = log.filter((e) => e.type === "retrieval-attempt" && e.at >= dayStart.getTime());
  const frameUses = log.filter(
    (e) =>
      (e.type === "production-submitted" || e.type === "new-context-submitted") &&
      Array.isArray(e.payload.foundIds) &&
      (e.payload.foundIds as string[]).includes("frame-working-on")
  ).length;
  return {
    sessionsCompleted: s.sessionsCompleted,
    totalSessions: SLICE_TOTAL_SESSIONS,
    todayOk: today.filter((e) => e.payload.depth === 0).length,
    todayTotal: today.length,
    voiceCount: log.filter((e) => e.type === "voice-artifact").length,
    frameUses,
    insufficientCount: SLICE_ITEMS.filter((i) => itemEvidence(i.id) === "insufficient").length,
  };
}

// ───────────────────────── экспорт данных пилота ─────────────────────────

/** Полная выгрузка пилота (JSON): состояние, лог, produce-FSRS. */
export function exportSliceData(): string {
  const payload = {
    exportedAt: new Date(nowMs()).toISOString(),
    state: readState(),
    srs: readSrs(),
    log: readLog(),
  };
  logSlice("export", {});
  return JSON.stringify(payload, null, 2);
}
