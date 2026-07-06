"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { storage } from "./storage";

// Учёт времени по практикам (почасовка). Кибернетика метода: система считает часы —
// это и обратная связь, и база для честной гарантии результата.
// Хранение — storage-адаптер: дата -> практика -> секунды.

const KEY = "ie_time";
const listeners = new Set<() => void>();

type Log = Record<string, Record<string, number>>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Log {
  try {
    return JSON.parse(storage().getItem(KEY) ?? "{}") as Log;
  } catch {
    return {};
  }
}

function write(l: Log) {
  storage().setItem(KEY, JSON.stringify(l));
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
  /** Сумма секунд по дням: дата → сек (для темпа и прогнозов) */
  byDay: Record<string, number>;
  /** Первая дата практики (старт пути) */
  firstDay: string | null;
};

function snapshot(): string {
  const l = read();
  const byActivityToday = l[todayKey()] || {};
  const todaySec = Object.values(byActivityToday).reduce((a, b) => a + b, 0);
  let totalSec = 0;
  const byDay: Record<string, number> = {};
  for (const [d, day] of Object.entries(l)) {
    let s = 0;
    for (const v of Object.values(day)) s += v;
    byDay[d] = s;
    totalSec += s;
  }
  const days = Object.keys(byDay).sort();
  return JSON.stringify({
    todaySec,
    totalSec,
    byActivityToday,
    byDay,
    firstDay: days[0] ?? null,
  });
}

const EMPTY = JSON.stringify({
  todaySec: 0,
  totalSec: 0,
  byActivityToday: {},
  byDay: {},
  firstDay: null,
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

export function useTimeStats(): TimeStats {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return JSON.parse(raw) as TimeStats;
}

/**
 * Стрик: сколько дней ПОДРЯД была практика, считая от сегодня (или от вчера,
 * если сегодня ещё не занималась — утренний вид не обнуляет вчерашнюю серию).
 * Мягкая механика постоянства: хвалим серию, никогда не стыдим за пропуск.
 */
export function computeStreak(byDay: Record<string, number>, today = todayKey()): number {
  const dayMs = 24 * 3600 * 1000;
  const t = new Date(today + "T00:00:00Z").getTime();
  const has = (ms: number) => (byDay[new Date(ms).toISOString().slice(0, 10)] ?? 0) > 0;
  let start = t;
  if (!has(start)) {
    if (!has(start - dayMs)) return 0;
    start -= dayMs;
  }
  let n = 0;
  while (has(start - n * dayMs)) n++;
  return n;
}

export function useStreak(): number {
  const { byDay } = useTimeStats();
  return computeStreak(byDay);
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
      // На web считаем только видимую вкладку; в среде без document (React
      // Native) экран смонтирован = практика идёт.
      if (typeof document === "undefined" || document.visibilityState === "visible") {
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
