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
  SLICE_HOLDOUT,
  SLICE_GRAMMAR,
  SLICE_TRANSFORMS,
  SLICE_MAIN_PROMPT,
  SLICE_NEW_CONTEXT,
  itemsForDay,
  anyAssessedItem,
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
  /**
   * Учебных сессий завершено (intro + review). Recovery сюда НЕ входит:
   * возврат не тратит программу из 14 сессий.
   */
  sessionsCompleted: number;
  /** сколько дней введения пройдено (0–5); recovery не двигает */
  introDone: number;
  /** сессий-возвратов завершено (отдельный счётчик, программу не тратит) */
  recoveriesCompleted?: number;
  /** HoldoutAssignment: ученик × набор × эксперимент (фиксируется на претесте) */
  holdout?: { experimentId: string; itemIds: string[]; assignedAt: number };
  lastSessionAt?: number;
  /** день 14, часть 1: тест 22 ТРЕНИРУЕМЫХ завершён */
  assessAt?: number;
  /** день 14, часть 2: задача нового контекста отправлена */
  newContextAt?: number;
  /** день 14, часть 3: отдельный тест 6 КОНТРОЛЬНЫХ завершён */
  holdoutAt?: number;
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
export function itemFoundInText(item: { lemmas: string[][] }, text: string): boolean {
  const n = normalize(text);
  return item.lemmas.every((group) => group.some((form) => containsForm(n, form)));
}

// ───────────────────── настоящая проверка конструкции ─────────────────────
// Слабые условия («есть been/since/made») недостаточны (код-ревью §3).
// Проверяем ФОРМУ конструкции по токенам. Это всё ещё поверхностный чек
// (не парсер): смысловую уместность в пилоте смотрит человек по экспорту.

/** -ing-слова, которые не глаголы (ловушки «has been a thing/morning…»). */
const NON_VERB_ING = new Set([
  "thing", "something", "anything", "nothing", "everything",
  "morning", "evening", "during", "interesting", "boring", "king", "spring",
]);

/** частотные неправильные прошедшие (без set/put — совпадают с настоящим) */
const IRREGULAR_PAST = new Set([
  "made", "met", "took", "ran", "came", "went", "did", "got", "had", "said",
  "found", "left", "chose", "wrote", "spoke", "gave", "began", "sent",
  "built", "brought", "thought", "held", "kept", "told", "saw", "knew",
  "grew", "sold", "bought", "taught", "felt", "lost", "won", "paid", "became",
]);

/** ed-слова, которые не past simple */
const NON_PAST_ED = new Set(["need", "indeed", "hundred", "sacred", "hatred"]);

const DAYS_EN = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MONTHS_EN = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const TIME_MARKERS: string[] = [
  "yesterday", "ago", "last week", "last month", "last year", "last night",
  "this morning", "the other day",
  ...DAYS_EN.map((d) => `last ${d}`),
  ...DAYS_EN.map((d) => `on ${d}`),
  ...MONTHS_EN.map((m) => `in ${m}`),
];

/** have/has (+ наречие) + been + V-ing — present perfect continuous. */
export function hasPresentPerfectContinuous(text: string): boolean {
  const tokens = normalize(text).split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const isAux =
      t === "have" || t === "has" || t.endsWith("'ve") || t.endsWith("'s");
    if (!isAux) continue;
    for (let j = i + 1; j <= Math.min(i + 2, tokens.length - 1); j++) {
      if (tokens[j] !== "been") continue;
      for (let k = j + 1; k <= Math.min(j + 2, tokens.length - 1); k++) {
        const w = tokens[k];
        if (w.length > 4 && w.endsWith("ing") && !NON_VERB_ING.has(w)) return true;
      }
    }
  }
  return false;
}

/** прошедшая форма глагола + явный маркер времени — past simple о факте. */
export function hasPastSimpleWithTimeMarker(text: string): boolean {
  const n = normalize(text);
  const tokens = n.split(" ");
  const hasPast = tokens.some(
    (t) =>
      IRREGULAR_PAST.has(t) ||
      (t.length > 3 && t.endsWith("ed") && !NON_PAST_ED.has(t))
  );
  const hasTime = TIME_MARKERS.some((m) => containsForm(n, m));
  return hasPast && hasTime;
}

export type GrammarSignals = { ppc: boolean; pastWithTime: boolean };

export function grammarSignals(text: string): GrammarSignals {
  return {
    ppc: hasPresentPerfectContinuous(text),
    pastWithTime: hasPastSimpleWithTimeMarker(text),
  };
}

function grammarOk(grammar: "ppc" | "past" | undefined, text: string): boolean {
  if (!grammar) return true;
  return grammar === "ppc"
    ? hasPresentPerfectContinuous(text)
    : hasPastSimpleWithTimeMarker(text);
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
  return lemmasSatisfied(t.lemmas, text) && grammarOk(t.grammar, text);
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
  const now = new Date(nowMs());
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
 * PROCESS-EVIDENCE ONLY (класс 2–3). Единственные значения:
 * «insufficient» (<2 попыток — рано судить) и «tracked» (данные копятся).
 * «tracked» НЕ означает освоенность/retention/уровень и не имеет права
 * всплывать в UI как способность — это зафиксировано тестом.
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

export const SLICE_EXPERIMENT_ID = "slice-v1-pilot";

export function isHoldoutId(itemId: string): boolean {
  return SLICE_HOLDOUT.some((h) => h.id === itemId);
}

/**
 * Порядок единиц ПРЕТЕСТА: 22 тренируемые + 6 контрольных, перемешаны вместе.
 * Фиксируется при претесте. В день 14 группы тестируются РАЗДЕЛЬНО
 * (см. day14TrainedOrder / holdoutOrder) с сохранением относительного порядка.
 */
export function assessmentOrder(): string[] {
  const s = readState();
  if (s.itemOrder?.length) return s.itemOrder;
  const seed = s.entry?.at ?? 20260716;
  const ids = [...SLICE_ITEMS.map((i) => i.id), ...SLICE_HOLDOUT.map((h) => h.id)];
  return shuffled(ids, seed);
}

/** День 14, часть 1: только 22 тренируемые, в претестовом относительном порядке. */
export function day14TrainedOrder(): string[] {
  return assessmentOrder().filter((id) => !isHoldoutId(id));
}

/** День 14, часть 3: только 6 контрольных, в претестовом относительном порядке. */
export function holdoutOrder(): string[] {
  return assessmentOrder().filter((id) => isHoldoutId(id));
}

export type AssessVerdict = "correct" | "incorrect" | "blank";

export function checkAssessmentAnswer(itemId: string, answer: string): AssessVerdict {
  const item = anyAssessedItem(itemId);
  if (!item) return "incorrect";
  if (!answer.trim()) return "blank";
  return itemFoundInText(item, answer) ? "correct" : "incorrect";
}

/**
 * Метаданные экспозиции пишутся ПРЯМО в событие (contamination — явное поле,
 * а не вывод из типа события при анализе):
 * group — trained/holdout · pretestExposed — единица уже предъявлялась на
 * претесте · intentionallyReassessed — намеренный повторный замер (день 14
 * по дизайну повторяет претест; это контролируемая, помеченная экспозиция).
 */
export function recordAssessmentItem(
  phase: "pretest" | "day14",
  itemId: string,
  answer: string,
  verdict: AssessVerdict
) {
  // Порядок дня 14 охраняется в ядре: контрольные единицы НЕ предъявляются,
  // пока задача нового контекста не отправлена — иначе экспозиция контрольных
  // могла бы загрязнить свободное производство.
  if (phase === "day14" && isHoldoutId(itemId) && !readState().newContextAt) {
    throw new Error("slice-protocol: контрольная единица дня 14 до нового контекста");
  }
  const pretestExposed = readLog().some(
    (e) =>
      e.type === "assessment-item" &&
      e.payload.phase === "pretest" &&
      e.payload.itemId === itemId
  );
  logSlice("assessment-item", {
    phase,
    itemId,
    answer,
    verdict,
    holdout: isHoldoutId(itemId),
    exposure: {
      group: isHoldoutId(itemId) ? "holdout" : "trained",
      pretestExposed,
      intentionallyReassessed: phase === "day14" && pretestExposed,
    },
  });
}

export function finishPretest() {
  const s = readState();
  s.pretestAt = nowMs();
  s.itemOrder = assessmentOrder();
  // HoldoutAssignment: ученик × набор × эксперимент — фиксируется явно.
  s.holdout = {
    experimentId: SLICE_EXPERIMENT_ID,
    itemIds: SLICE_HOLDOUT.map((h) => h.id),
    assignedAt: nowMs(),
  };
  writeState(s);
  logSlice("pretest-finished", { order: s.itemOrder });
  logSlice("holdout-assigned", {
    experimentId: SLICE_EXPERIMENT_ID,
    itemIds: s.holdout.itemIds,
  });
}

/**
 * Сводка теста: тренируемые и контрольные СТРОГО раздельно.
 * trained-retention ≠ holdout-контроль ≠ употребление в новом контексте —
 * три разных числа, не смешивать (код-ревью §2; ADR-016).
 */
export type AssessmentSummary = {
  phase: "pretest" | "day14";
  trained: { correct: number; incorrect: number; blank: number; total: number };
  holdout: { correct: number; incorrect: number; blank: number; total: number };
};

export function assessmentSummary(phase: "pretest" | "day14"): AssessmentSummary {
  const empty = () => ({ correct: 0, incorrect: 0, blank: 0, total: 0 });
  const out: AssessmentSummary = { phase, trained: empty(), holdout: empty() };
  // при повторных прохождениях считаем ПОСЛЕДНИЙ ответ по каждой единице
  const last = new Map<string, { verdict: AssessVerdict; holdout: boolean }>();
  for (const e of readLog()) {
    if (e.type !== "assessment-item" || e.payload.phase !== phase) continue;
    last.set(String(e.payload.itemId), {
      verdict: e.payload.verdict as AssessVerdict,
      holdout: Boolean(e.payload.holdout),
    });
  }
  for (const { verdict, holdout } of last.values()) {
    const bucket = holdout ? out.holdout : out.trained;
    bucket[verdict] += 1;
    bucket.total += 1;
  }
  return out;
}

/**
 * Закрыть день 14, часть 1 — тест 22 ТРЕНИРУЕМЫХ. Протокол охраняется
 * В ЯДРЕ, не порядком экранов: претест сделан · все 14 учебных сессий
 * пройдены · интервал выдержан · часть 1 ещё не закрывалась.
 * Дальше по порядку: новый контекст → отдельный тест контрольных → экспорт.
 */
export function finishDay14() {
  const s = readState();
  if (!s.pretestAt) throw new Error("slice-protocol: day14 без претеста");
  if (s.assessAt) throw new Error("slice-protocol: day14 уже завершён");
  if (s.sessionsCompleted < SLICE_TOTAL_SESSIONS)
    throw new Error(
      `slice-protocol: day14 до завершения программы (${s.sessionsCompleted}/${SLICE_TOTAL_SESSIONS})`
    );
  if (nowMs() - s.pretestAt < 14 * DAY_MS)
    throw new Error("slice-protocol: day14 раньше 14 календарных дней от претеста");
  s.assessAt = nowMs();
  writeState(s);
  logSlice("day14-finished", {});
}

/**
 * Закрыть день 14, часть 3 — отдельный тест 6 КОНТРОЛЬНЫХ. Разрешён только
 * после отправленного нового контекста и только один раз.
 */
export function finishHoldout() {
  const s = readState();
  if (!s.newContextAt)
    throw new Error("slice-protocol: тест контрольных до нового контекста");
  if (s.holdoutAt) throw new Error("slice-protocol: тест контрольных уже завершён");
  s.holdoutAt = nowMs();
  writeState(s);
  logSlice("holdout-finished", {});
}

export type OpportunityStatus = "used" | "missed" | "insufficient-opportunity";

/**
 * Порог валидной возможности: ответ короче этого числа слов не даёт
 * неиспользованным целям честного шанса появиться — их статус
 * «insufficient-opportunity», и в знаменатель они НЕ входят. `[H]`-правило,
 * значение пересматривается по данным пилота.
 */
const MIN_OPPORTUNITY_WORDS = 25;

export type NewContextResult = {
  statuses: Record<string, OpportunityStatus>;
  usedIds: string[];
  missedIds: string[];
  insufficientIds: string[];
  offTargetIds: string[];
  denominator: number;
  wordCount: number;
};

/**
 * Чистое вычисление opportunity-статусов (тестируется отдельно от
 * одноразового recordNewContext). Три статуса на каждую цель:
 * used (появилась) · missed (возможность была валидной — ответ достаточно
 * развёрнут, — но единица не всплыла) · insufficient-opportunity (ответ
 * слишком короткий, чтобы судить). Знаменатель = used + missed;
 * insufficient-opportunity в знаменатель НЕ входит.
 */
export function newContextOpportunities(text: string): NewContextResult {
  const detected = detectFoundItems(text).map((i) => i.id);
  const target = SLICE_NEW_CONTEXT.targetIds;
  const wordCount = normalize(text).split(" ").filter(Boolean).length;
  const validOpportunity = wordCount >= MIN_OPPORTUNITY_WORDS;

  const statuses: Record<string, OpportunityStatus> = {};
  for (const id of target) {
    statuses[id] = detected.includes(id)
      ? "used"
      : validOpportunity
        ? "missed"
        : "insufficient-opportunity";
  }
  const usedIds = target.filter((id) => statuses[id] === "used");
  const missedIds = target.filter((id) => statuses[id] === "missed");
  const insufficientIds = target.filter((id) => statuses[id] === "insufficient-opportunity");
  const offTargetIds = detected.filter((id) => !target.includes(id));
  return {
    statuses,
    usedIds,
    missedIds,
    insufficientIds,
    offTargetIds,
    denominator: usedIds.length + missedIds.length,
    wordCount,
  };
}

/**
 * Задача нового контекста. Протокол охраняется В ЯДРЕ (не порядком экранов):
 * только после завершённого дня 14 и только один раз.
 */
export function recordNewContext(text: string, audioRef?: string): NewContextResult {
  const s = readState();
  if (!s.assessAt) throw new Error("slice-protocol: новый контекст до завершения дня 14");
  if (s.newContextAt) throw new Error("slice-protocol: новый контекст уже отправлен");

  // Порядок: новый контекст идёт ДО экспозиции контрольных единиц дня 14.
  const hasHoldoutDay14 = readLog().some(
    (e) =>
      e.type === "assessment-item" &&
      e.payload.phase === "day14" &&
      Boolean(e.payload.holdout)
  );
  if (hasHoldoutDay14)
    throw new Error("slice-protocol: новый контекст после экспозиции контрольных дня 14");

  const res = newContextOpportunities(text);
  s.newContextAt = nowMs();
  writeState(s);
  logSlice("new-context-submitted", {
    text,
    wordCount: res.wordCount,
    targetIds: SLICE_NEW_CONTEXT.targetIds,
    statuses: res.statuses,
    usedIds: res.usedIds,
    missedIds: res.missedIds,
    insufficientIds: res.insufficientIds,
    offTargetIds: res.offTargetIds,
    denominator: res.denominator,
    grammar: grammarSignals(text),
    // голос: только ссылка на приватный артефакт, без содержимого и анализа
    voice: audioRef ? { artifactRef: audioRef, privacy: "private", analysed: false } : null,
  });
  return res;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Отложенный тест открыт, только когда выполнены ОБА условия:
 * ≥14 календарных дней от претеста И все 14 учебных сессий завершены.
 * (Recovery-сессии в счёт не входят — см. completeSession.)
 */
export function assessmentAvailable(now = nowMs()): boolean {
  const s = readState();
  return Boolean(
    s.pretestAt &&
      !s.assessAt &&
      s.sessionsCompleted >= SLICE_TOTAL_SESSIONS &&
      now - s.pretestAt >= 14 * DAY_MS
  );
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
  production: {
    kind: "item" | "transform" | "main";
    itemId?: string;
    ru: string;
    lemmas: string[][];
    /** целевая конструкция (проверяется настоящим чеком, не леммами) */
    grammar?: "ppc" | "past";
  };
};

/** Выполнено ли требование производства: содержательные леммы И конструкция. */
export function productionSatisfied(
  production: SessionPlan["production"],
  text: string
): boolean {
  return lemmasSatisfied(production.lemmas, text) && grammarOk(production.grammar, text);
}

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
        lemmas: [],
        grammar: SLICE_MAIN_PROMPT.grammar,
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
      ? { kind: "transform", ru: transform.ru, lemmas: transform.lemmas, grammar: transform.grammar }
      : { kind: "main", ru: SLICE_MAIN_PROMPT.ru, lemmas: [], grammar: SLICE_MAIN_PROMPT.grammar },
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
  if (plan.type === "recovery") {
    // Возврат НЕ тратит программу: счётчик сессий и дни введения не двигаются
    // (код-ревью §1). Обновляется только «когда была последняя практика».
    s.recoveriesCompleted = (s.recoveriesCompleted ?? 0) + 1;
  } else {
    s.sessionsCompleted = Math.min(s.sessionsCompleted + 1, SLICE_TOTAL_SESSIONS);
    if (plan.type === "intro") s.introDone = Math.min(s.introDone + 1, 5);
  }
  s.lastSessionAt = nowMs();
  writeState(s);
  logSlice("session-completed", { type: plan.type, number: plan.number });
}

export function recordEncounter(itemIds: string[], step: string) {
  logSlice("encounter", { itemIds, step, exposure: "intentional" });
}

export function recordProduction(promptKind: string, text: string, foundIds: string[], satisfied: boolean) {
  // grammar — валидированные сигналы конструкции (не «слово been в тексте»)
  logSlice("production-submitted", { promptKind, text, foundIds, satisfied, grammar: grammarSignals(text) });
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
  recoveriesCompleted: number;
  /** извлечения сегодня: без подсказки / всего */
  todayOk: number;
  todayTotal: number;
  voiceCount: number;
  /**
   * Сколько письменных ответов содержали ВАЛИДИРОВАННЫЙ present perfect
   * continuous (have/has been + V-ing), а не просто слово «been».
   * Это факт письменного текста — НЕ устная компетенция и не владение.
   */
  ppcUses: number;
  insufficientCount: number;
};

export function sliceProgress(now = nowMs()): SliceProgress {
  const s = readState();
  const log = readLog();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const today = log.filter((e) => e.type === "retrieval-attempt" && e.at >= dayStart.getTime());
  const ppcUses = log.filter(
    (e) =>
      (e.type === "production-submitted" || e.type === "new-context-submitted") &&
      Boolean((e.payload.grammar as GrammarSignals | undefined)?.ppc)
  ).length;
  return {
    sessionsCompleted: s.sessionsCompleted,
    totalSessions: SLICE_TOTAL_SESSIONS,
    recoveriesCompleted: s.recoveriesCompleted ?? 0,
    todayOk: today.filter((e) => e.payload.depth === 0).length,
    todayTotal: today.length,
    voiceCount: log.filter((e) => e.type === "voice-artifact").length,
    ppcUses,
    insufficientCount: SLICE_ITEMS.filter((i) => itemEvidence(i.id) === "insufficient").length,
  };
}

// ───────────────────────── экспорт данных пилота ─────────────────────────

/**
 * Реестр голосовых артефактов: только ССЫЛКИ (uri/идентификатор) и статус
 * приватности — без содержимого и без анализа. Ссылка нового контекста
 * сохраняется наравне с сессионными.
 */
export function voiceArtifactRefs(): {
  at: number;
  ref: string;
  promptKind: string;
  privacy: "private";
  analysed: false;
}[] {
  const out: { at: number; ref: string; promptKind: string; privacy: "private"; analysed: false }[] = [];
  for (const e of readLog()) {
    if (e.type === "voice-artifact" && typeof e.payload.uri === "string") {
      out.push({
        at: e.at,
        ref: e.payload.uri,
        promptKind: String(e.payload.promptKind ?? "slice-say"),
        privacy: "private",
        analysed: false,
      });
    }
    if (e.type === "new-context-submitted") {
      const v = e.payload.voice as { artifactRef?: string } | null | undefined;
      if (v?.artifactRef) {
        out.push({ at: e.at, ref: v.artifactRef, promptKind: "slice-new-context", privacy: "private", analysed: false });
      }
    }
  }
  return out;
}

/**
 * Финальная выгрузка пилота (JSON). Завершает протокол, поэтому охраняется:
 * доступна только когда пройдены все три части дня 14 — тест тренируемых,
 * новый контекст и тест контрольных. Для незавершённого пилота (выбыла,
 * отладка) есть exportPartialSliceData — с явной пометкой partial.
 */
export function exportSliceData(): string {
  const s = readState();
  if (!s.assessAt || !s.newContextAt || !s.holdoutAt) {
    throw new Error(
      "slice-protocol: финальный экспорт до завершения протокола " +
        "(нужны: тест тренируемых, новый контекст, тест контрольных); " +
        "для незавершённого пилота — exportPartialSliceData"
    );
  }
  const payload = {
    exportedAt: new Date(nowMs()).toISOString(),
    experimentId: SLICE_EXPERIMENT_ID,
    partial: false,
    // Классы доказательств разделены; письменное ≠ устное (код-ревью §4):
    evidenceNote:
      "Все измеряемые исходы — ПИСЬМЕННОЕ продуктивное извлечение и письменное " +
      "производство. Голосовые записи — приватные неанализируемые артефакты " +
      "опыта; ничто здесь не является свидетельством устной компетенции. " +
      "trained-retention, holdout-контроль и употребление-в-новом-контексте — " +
      "три раздельных класса; holdout не является structural generalization.",
    state: readState(),
    srs: readSrs(),
    summaries: {
      pretest: assessmentSummary("pretest"),
      day14: assessmentSummary("day14"),
    },
    voiceArtifacts: voiceArtifactRefs(),
    log: readLog(),
  };
  logSlice("export", {});
  return JSON.stringify(payload, null, 2);
}

/**
 * Частичная выгрузка незавершённого пилота (участница выбыла, отладка).
 * Явно помечена partial + причина; финальным экспортом НЕ является.
 */
export function exportPartialSliceData(reason: string): string {
  const payload = {
    exportedAt: new Date(nowMs()).toISOString(),
    experimentId: SLICE_EXPERIMENT_ID,
    partial: true,
    partialReason: reason,
    state: readState(),
    srs: readSrs(),
    summaries: {
      pretest: assessmentSummary("pretest"),
      day14: assessmentSummary("day14"),
    },
    voiceArtifacts: voiceArtifactRefs(),
    log: readLog(),
  };
  logSlice("export-partial", { reason });
  return JSON.stringify(payload, null, 2);
}
