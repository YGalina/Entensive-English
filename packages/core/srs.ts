"use client";

import { useSyncExternalStore } from "react";
import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  State,
  type Card as FsrsCard,
} from "ts-fsrs";
import { storage } from "./storage";
import { emitEvent } from "./events";

// Кибернетическое ядро метода: система планирует «узнавание» слов на будущее.
// Алгоритм — FSRS (современнее SM-2): интервалы считаются по стабильности и
// сложности памяти. Ответ в UI мягкий и бинарный (метод без штрафов):
//   «Знаю» → Good, «Ещё не всплыло» → Again.
// Внутридневные learning-шаги отключены — интенсив мыслит днями, а не минутами:
// первый Good планирует на дни вперёд, Again возвращает слово назавтра.
// Состояние — в localStorage (до появления бэкенда с PostgreSQL).

const f = fsrs(
  generatorParameters({
    enable_fuzz: false,
    learning_steps: [],
    relearning_steps: [],
  })
);

/** Карточка FSRS плюс наши поля привязки. Даты сериализуются в ISO-строки. */
export type Card = FsrsCard & {
  en: string;
  packId: string;
  /**
   * Направление извлечения (SRS v2, Фаза A). Наука: retrieval строго
   * специфичен направлению — «увидел → узнал» тренирует рецептив,
   * для речи нужно «значение → форма» (produce). Отсутствие поля = recognize
   * (все старые карточки).
   */
  direction?: "recognize" | "produce";
  /**
   * Сколько раз слово ЗАМЕЧЕНО в дикой природе — в тексте, видео, роли
   * (гипотеза замечания Шмидта: noticing = мост вход → усвоение). Замыкает
   * цикл «вал → узнал → произнёс → заметил». Живёт на produce-карте.
   */
  noticed?: number;
};

type Store = Record<string, Card>;

const KEY = "ie_srs";
const listeners = new Set<() => void>();

function read(): Store {
  try {
    return JSON.parse(storage().getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  storage().setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

/** Восстанавливает Date-поля FSRS из ISO-строк после JSON. */
function reviveFsrs(c: Card): FsrsCard {
  return {
    ...c,
    due: new Date(c.due),
    last_review: c.last_review ? new Date(c.last_review) : undefined,
  };
}

/** true, если карточку можно продолжать в FSRS (а не легаси SM-2 / seed). */
function isFsrsCard(c: Card | undefined): c is Card {
  return (
    !!c &&
    typeof c.stability === "number" &&
    c.stability > 0 &&
    typeof c.state === "number" &&
    !!c.last_review
  );
}

function dueMs(c: Card): number {
  return new Date(c.due).getTime();
}

// SRS v2: продуктивные карточки хранятся в том же сторе под ключом "p:<en>",
// чтобы не конфликтовать с рецептивной карточкой того же слова.
const PRODUCE_PREFIX = "p:";
/** Порог конвейера: слово стабильно узнано → рождается produce-карта. */
const PRODUCE_AFTER_REPS = 2;

function isProduceKey(key: string): boolean {
  return key.startsWith(PRODUCE_PREFIX);
}

/** Записать результат узнавания слова. known=true — «всплыло». */
export function recordAnswer(packId: string, en: string, known: boolean) {
  const s = read();
  const now = new Date();
  const prev = s[en];
  // Легаси SM-2 и seed-карточки конвертируем в свежую FSRS при первом ответе.
  const card: FsrsCard = isFsrsCard(prev) ? reviveFsrs(prev) : createEmptyCard(now);
  const grade = known ? Rating.Good : Rating.Again;
  const { card: next } = f.next(card, now, grade);
  s[en] = { ...next, en, packId };
  // Конвейер узнавание → активный запас: стабильно узнанное слово впервые
  // получает продуктивную карту («смысл на L1 → скажи форму»), due = сейчас.
  const pk = PRODUCE_PREFIX + en;
  if (known && next.reps >= PRODUCE_AFTER_REPS && !s[pk]) {
    s[pk] = { ...createEmptyCard(now), en, packId, direction: "produce" };
  }
  write(s);
  emitEvent("srs-answer", { en, packId, known, direction: "recognize" });
}

/** Записать результат ПРОДУКТИВНОГО извлечения (значение → форма). */
export function recordProduceAnswer(packId: string, en: string, known: boolean) {
  const s = read();
  const now = new Date();
  const pk = PRODUCE_PREFIX + en;
  const prev = s[pk];
  const card: FsrsCard = isFsrsCard(prev) ? reviveFsrs(prev) : createEmptyCard(now);
  const grade = known ? Rating.Good : Rating.Again;
  const { card: next } = f.next(card, now, grade);
  s[pk] = { ...next, en, packId, direction: "produce" };
  write(s);
  emitEvent("srs-answer", { en, packId, known, direction: "produce" });
}

/** Множество узнанных слов (reps ≥ 1) — чтобы вал не повторял их, а дополнял
 * новыми и подмешивал i+1. Отвечает на «новые дополняются?» — да. */
export function knownWordSet(): Set<string> {
  const set = new Set<string>();
  for (const [k, c] of Object.entries(read())) {
    if (!isProduceKey(k) && c.reps >= 1) set.add(c.en.toLowerCase());
  }
  return set;
}

/** Слова, которые стоит замечать в текстах: все, что вышли в produce-конвейер
 * (замечание и продуктивное извлечение усиливают друг друга параллельно). */
export function noticeableWords(): Set<string> {
  const set = new Set<string>();
  for (const [k, c] of Object.entries(read())) {
    if (isProduceKey(k)) set.add(c.en.toLowerCase());
  }
  return set;
}

/** Отметить, что слово ЗАМЕЧЕНО в дикой природе (текст/видео/роль). */
export function recordNoticed(en: string) {
  const s = read();
  const pk = PRODUCE_PREFIX + en.toLowerCase();
  // ключ мог быть с исходным регистром — ищем без учёта регистра
  const key = s[pk]
    ? pk
    : Object.keys(s).find((k) => isProduceKey(k) && k.slice(2).toLowerCase() === en.toLowerCase());
  if (!key || !s[key]) return;
  s[key] = { ...s[key], noticed: (s[key].noticed ?? 0) + 1 };
  write(s);
  emitEvent("word-noticed", { en: en.toLowerCase() });
}

/** Продуктивная очередь на сейчас: слова, которые пора произвести самой. */
export function dueProduceCards(limit?: number): Card[] {
  const now = Date.now();
  const all = Object.entries(read())
    .filter(([k, c]) => isProduceKey(k) && dueMs(c) <= now)
    .map(([, c]) => c)
    .sort((a, b) => dueMs(a) - dueMs(b));
  return limit ? all.slice(0, limit) : all;
}

/** Массовая запись результатов блока (узнавание). */
export function recordBatch(packId: string, results: { en: string; known: boolean }[]) {
  results.forEach((r) => recordAnswer(packId, r.en, r.known));
}

export type Stats = {
  total: number;
  learned: number; // reps >= 2 — «усвоено» по методу (2–3 прохода)
  dueToday: number;
  /** produce-карт в очереди сейчас (продуктивное извлечение) */
  produceDue: number;
  /** слов вышло в активный запас: произведены ≥2 раз */
  activeWords: number;
  /** слов замечено в дикой природе хоть раз (мост вход → усвоение) */
  noticedWords: number;
};

/** Рецептивные карточки стора (без produce-двойников). */
function recognizeCards(s: Store): Card[] {
  return Object.entries(s)
    .filter(([k]) => !isProduceKey(k))
    .map(([, c]) => c);
}

function snapshot(): string {
  const s = read();
  const cards = recognizeCards(s);
  const produce = Object.entries(s)
    .filter(([k]) => isProduceKey(k))
    .map(([, c]) => c);
  const now = Date.now();
  const stats: Stats = {
    total: cards.length,
    learned: cards.filter((c) => c.reps >= 2).length,
    dueToday: cards.filter((c) => dueMs(c) <= now).length,
    produceDue: produce.filter((c) => dueMs(c) <= now).length,
    activeWords: produce.filter((c) => c.reps >= 2).length,
    noticedWords: produce.filter((c) => (c.noticed ?? 0) > 0).length,
  };
  return JSON.stringify(stats);
}

export function dueCards(): Card[] {
  const now = Date.now();
  return recognizeCards(read())
    .filter((c) => dueMs(c) <= now)
    .sort((a, b) => dueMs(a) - dueMs(b));
}

/** Карточки, которых касались сегодня (материал для вечернего круга). */
export function todaysTouchedCards(): Card[] {
  const today = new Date().toISOString().slice(0, 10);
  return recognizeCards(read()).filter(
    (c) => c.last_review && String(c.last_review).slice(0, 10) === today
  );
}

/** Последние тронутые карточки (fallback, если сегодня практики не было). */
// ---- «Мой словарь»: слова как накопленный живой опыт (макет 25a) ----
// Сила слова — три состояния: new (встречено в потоке), recog (узнаю),
// mine (сказано вслух — активный вывод). SRS внутри, давления снаружи нет.

export type VocabState = "new" | "recog" | "mine";

export type VocabEntry = {
  en: string;
  state: VocabState;
  /** Сколько раз замечено «в дикой природе» (noticing). */
  noticed: number;
  /** Была ли рецептивная карточка успешно вспомнена хоть раз. */
  recogReps: number;
  /** Сказано вслух (produce reps>0). */
  said: boolean;
  /** Последнее касание (мс) — для сортировки «живой ленты». */
  touchedAt: number;
};

export function vocabEntries(): VocabEntry[] {
  const s = read();
  const map = new Map<string, VocabEntry>();
  for (const [key, card] of Object.entries(s)) {
    const en = isProduceKey(key) ? key.slice(PRODUCE_PREFIX.length) : key;
    const cur =
      map.get(en) ??
      ({ en, state: "new", noticed: 0, recogReps: 0, said: false, touchedAt: 0 } as VocabEntry);
    const touched = card.last_review ? new Date(card.last_review).getTime() : 0;
    if (touched > cur.touchedAt) cur.touchedAt = touched;
    if (isProduceKey(key)) {
      cur.noticed = card.noticed ?? 0;
      if ((card.reps ?? 0) > 0) cur.said = true;
    } else {
      cur.recogReps = card.reps ?? 0;
    }
    map.set(en, cur);
  }
  const out = [...map.values()];
  for (const e of out) {
    e.state = e.said ? "mine" : e.recogReps > 0 ? "recog" : "new";
  }
  // Живая лента: последние касания сверху.
  out.sort((a, b) => b.touchedAt - a.touchedAt);
  return out;
}

export function recentCards(limit: number): Card[] {
  return recognizeCards(read())
    .filter((c) => c.last_review)
    .sort(
      (a, b) =>
        new Date(String(b.last_review)).getTime() -
        new Date(String(a.last_review)).getTime()
    )
    .slice(0, limit);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

export function useSrsStats(): Stats {
  const raw = useSyncExternalStore(subscribe, snapshot, () =>
    JSON.stringify({ total: 0, learned: 0, dueToday: 0, produceDue: 0, activeWords: 0, noticedWords: 0 })
  );
  return JSON.parse(raw) as Stats;
}

// State реэкспортируем — пригодится, если UI захочет различать New/Review и т.п.
export { State };
