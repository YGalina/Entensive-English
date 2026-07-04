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
};

type Store = Record<string, Card>;

const KEY = "ie_srs";
const listeners = new Set<() => void>();

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
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
  write(s);
}

/** Массовая запись результатов блока (узнавание). */
export function recordBatch(packId: string, results: { en: string; known: boolean }[]) {
  results.forEach((r) => recordAnswer(packId, r.en, r.known));
}

export type Stats = {
  total: number;
  learned: number; // reps >= 2 — «усвоено» по методу (2–3 прохода)
  dueToday: number;
};

function snapshot(): string {
  const s = read();
  const cards = Object.values(s);
  const now = Date.now();
  const stats: Stats = {
    total: cards.length,
    learned: cards.filter((c) => c.reps >= 2).length,
    dueToday: cards.filter((c) => dueMs(c) <= now).length,
  };
  return JSON.stringify(stats);
}

export function dueCards(): Card[] {
  const now = Date.now();
  return Object.values(read())
    .filter((c) => dueMs(c) <= now)
    .sort((a, b) => dueMs(a) - dueMs(b));
}

/** Карточки, которых касались сегодня (материал для вечернего круга). */
export function todaysTouchedCards(): Card[] {
  const today = new Date().toISOString().slice(0, 10);
  return Object.values(read()).filter(
    (c) => c.last_review && String(c.last_review).slice(0, 10) === today
  );
}

/** Последние тронутые карточки (fallback, если сегодня практики не было). */
export function recentCards(limit: number): Card[] {
  return Object.values(read())
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
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSrsStats(): Stats {
  const raw = useSyncExternalStore(subscribe, snapshot, () =>
    JSON.stringify({ total: 0, learned: 0, dueToday: 0 })
  );
  return JSON.parse(raw) as Stats;
}

// State реэкспортируем — пригодится, если UI захочет различать New/Review и т.п.
export { State };
