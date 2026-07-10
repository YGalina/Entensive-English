"use client";

import { useSyncExternalStore } from "react";
import { storage } from "./storage";
import { nowMs } from "./now";
import { emitEvent } from "./events";

// Живые тренерские чекпоинты (MVP-A из рыночного синтеза — приоритет №1:
// «человеческая подотчётность → удержание»). Живого тренера пока нет —
// это ЧЕСТНЫЙ каркас: запись интереса с предпочтениями, чтобы измерить
// спрос до постройки. Никаких обещаний конкретной сессии.

export type CheckinFormat = "one" | "pair" | "small-group";
export type CheckinPace = "weekly" | "biweekly" | "monthly";

export type CheckinInterest = {
  id: string;
  format: CheckinFormat;
  pace: CheckinPace;
  /** что хочет разобрать — свободный текст (опц.) */
  note?: string;
  at: number;
};

const KEY = "ie_checkins";
const listeners = new Set<() => void>();

function read(): CheckinInterest[] {
  try {
    const raw = JSON.parse(storage().getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as CheckinInterest[]) : [];
  } catch {
    return [];
  }
}

function write(list: CheckinInterest[]) {
  storage().setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

/** Записать интерес к живому разбору. Событие уходит в синк — это и есть замер спроса. */
export function saveInterest(input: { format: CheckinFormat; pace: CheckinPace; note?: string }): CheckinInterest {
  const c: CheckinInterest = {
    id: `ci-${nowMs()}-${Math.random().toString(36).slice(2, 8)}`,
    format: input.format,
    pace: input.pace,
    note: input.note?.trim() || undefined,
    at: nowMs(),
  };
  write([c, ...read()]);
  // note не шлём в событие (может быть личным) — только формат/ритм для замера.
  emitEvent("checkin-interest", { format: c.format, pace: c.pace });
  return c;
}

/** Последняя заявка (чтобы показать «ты в листе ожидания»). */
export function latestInterest(): CheckinInterest | null {
  return read()[0] ?? null;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

export function useLatestInterest(): CheckinInterest | null {
  const raw = useSyncExternalStore(subscribe, () => storage().getItem(KEY) ?? "", () => "");
  try {
    const list = raw ? (JSON.parse(raw) as CheckinInterest[]) : [];
    return list[0] ?? null;
  } catch {
    return null;
  }
}
