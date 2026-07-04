"use client";

import { useSyncExternalStore } from "react";

// История скорости чтения (WPM). Самый наглядный измеримый результат метода:
// у Петрусинского скорость чтения — главный KPI эксперимента (×2,5 за 2 недели).
// Хранение: localStorage ie_wpm — массив замеров по датам.

const KEY = "ie_wpm";
const listeners = new Set<() => void>();

export type WpmEntry = { d: string; wpm: number; words: number };

function read(): WpmEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as WpmEntry[]) : [];
  } catch {
    return [];
  }
}

function write(list: WpmEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-200)));
  } catch {}
  listeners.forEach((l) => l());
}

/**
 * Записать замер. Фильтруем мусор: слишком короткие сессии (<20с) и
 * нереалистичные значения (открыла-закрыла) историю не портят.
 */
export function recordWpm(wpm: number, words: number, elapsedSec: number) {
  if (elapsedSec < 20) return;
  if (!(wpm >= 30 && wpm <= 600)) return;
  const list = read();
  list.push({ d: new Date().toISOString().slice(0, 10), wpm: Math.round(wpm), words });
  write(list);
}

export type WpmStats = {
  count: number;
  first: number | null;
  last: number | null;
  best: number | null;
};

function snapshot(): string {
  const list = read();
  const stats: WpmStats = {
    count: list.length,
    first: list[0]?.wpm ?? null,
    last: list[list.length - 1]?.wpm ?? null,
    best: list.length ? Math.max(...list.map((e) => e.wpm)) : null,
  };
  return JSON.stringify(stats);
}

const EMPTY = JSON.stringify({ count: 0, first: null, last: null, best: null });

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useWpmStats(): WpmStats {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return JSON.parse(raw) as WpmStats;
}
