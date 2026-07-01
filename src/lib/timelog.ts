"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";

// Учёт времени по практикам (почасовка). Кибернетика метода: система считает часы —
// это и обратная связь, и база для честной гарантии результата.
// Хранение — localStorage: дата -> практика -> секунды.

const KEY = "ie_time";
const listeners = new Set<() => void>();

type Log = Record<string, Record<string, number>>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Log {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Log;
  } catch {
    return {};
  }
}

function write(l: Log) {
  try {
    localStorage.setItem(KEY, JSON.stringify(l));
  } catch {}
  listeners.forEach((f) => f());
}

/** Добавить секунды к практике за сегодня. */
export function addTime(activity: string, seconds: number) {
  if (!(seconds > 0)) return;
  const l = read();
  const d = todayKey();
  l[d] = l[d] || {};
  l[d][activity] = (l[d][activity] || 0) + seconds;
  write(l);
}

export type TimeStats = {
  todaySec: number;
  totalSec: number;
  byActivityToday: Record<string, number>;
};

function snapshot(): string {
  const l = read();
  const byActivityToday = l[todayKey()] || {};
  const todaySec = Object.values(byActivityToday).reduce((a, b) => a + b, 0);
  let totalSec = 0;
  for (const day of Object.values(l))
    for (const s of Object.values(day)) totalSec += s;
  return JSON.stringify({ todaySec, totalSec, byActivityToday });
}

const EMPTY = JSON.stringify({ todaySec: 0, totalSec: 0, byActivityToday: {} });

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useTimeStats(): TimeStats {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return JSON.parse(raw) as TimeStats;
}

/**
 * Засекает реальное время на практике, пока компонент смонтирован и вкладка активна.
 * activity=null — не считать. Пишет фактическую дельту каждые 4 с и при размонтировании.
 */
export function useActivityTimer(activity: string | null) {
  useEffect(() => {
    if (!activity) return;
    let last = Date.now();
    const flush = () => {
      const now = Date.now();
      if (document.visibilityState === "visible") {
        addTime(activity, (now - last) / 1000);
      }
      last = now;
    };
    const id = setInterval(flush, 4000);
    return () => {
      clearInterval(id);
      flush();
    };
  }, [activity]);
}
