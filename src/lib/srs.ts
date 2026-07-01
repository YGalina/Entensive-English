"use client";

import { useSyncExternalStore } from "react";

// SRS-lite (упрощённый SM-2). Реализует кибернетическое ядро метода:
// система планирует «узнавание» слов на будущее; усвоение за 2–3 повтора.
// Состояние — в localStorage (до появления бэкенда с PostgreSQL).

export type Card = {
  en: string;
  packId: string;
  reps: number;
  intervalDays: number;
  ease: number;
  /** epoch ms, когда слово снова к повтору */
  due: number;
  lapses: number;
};

type Store = Record<string, Card>;

const KEY = "ie_srs";
const DAY = 24 * 60 * 60 * 1000;
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

/** Записать результат узнавания слова. known=true — «всплыло». */
export function recordAnswer(packId: string, en: string, known: boolean) {
  const s = read();
  const key = en;
  const prev: Card =
    s[key] ?? { en, packId, reps: 0, intervalDays: 0, ease: 2.5, due: 0, lapses: 0 };

  let card: Card;
  if (known) {
    const reps = prev.reps + 1;
    const intervalDays =
      reps === 1 ? 1 : reps === 2 ? 3 : Math.round(prev.intervalDays * prev.ease);
    card = {
      ...prev,
      packId,
      reps,
      intervalDays,
      ease: Math.min(2.8, prev.ease + 0.05),
      due: Date.now() + intervalDays * DAY,
    };
  } else {
    card = {
      ...prev,
      packId,
      reps: 0,
      intervalDays: 0,
      ease: Math.max(1.6, prev.ease - 0.2),
      due: Date.now(), // снова сегодня
      lapses: prev.lapses + 1,
    };
  }
  s[key] = card;
  write(s);
}

/** Массовая запись результатов блока (узнавание). */
export function recordBatch(packId: string, results: { en: string; known: boolean }[]) {
  results.forEach((r) => recordAnswer(packId, r.en, r.known));
}

export type Stats = {
  total: number;
  learned: number; // reps >= 2 — «усвоено» по методу
  dueToday: number;
};

function snapshot(): string {
  const s = read();
  const cards = Object.values(s);
  const now = Date.now();
  const stats: Stats = {
    total: cards.length,
    learned: cards.filter((c) => c.reps >= 2).length,
    dueToday: cards.filter((c) => c.due <= now).length,
  };
  return JSON.stringify(stats);
}

export function dueCards(): Card[] {
  const now = Date.now();
  return Object.values(read())
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due);
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
