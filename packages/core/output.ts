"use client";

import { useSyncExternalStore } from "react";
import { storage } from "./storage";
import { nowMs } from "./now";

// Контур вывода — то, что человек ПРОИЗВЁЛ сам (Фаза A новой архитектуры,
// 09_architecture_plan.md §2.2). Наука корпуса: рецептивно-продуктивный разрыв
// закрывается только производством (pushed output, retrieval «значение→форма»).
// Артефакты приватны по умолчанию: дневник и голос — личное; синк — только
// после явного согласия (появится в Фазе C).

export type OutputType =
  | "morning-phrase" // утренняя фраза о себе — запуск речевого контура
  | "status" // вечерний статус дня, 1–3 предложения
  | "essay" // свободный текст/дневник
  | "explanation" // «объясни слово/мысль своими словами»
  | "role" // сыгранная роль в сцене (produce в маске героя)
  | "speech"; // голосовая запись (audioRef)

export type OutputArtifact = {
  id: string;
  type: OutputType;
  /** id задания-подсказки, если артефакт создан из промпта */
  promptId?: string;
  text?: string;
  /** локальный uri аудиофайла (сервера ещё нет; приватно на устройстве) */
  audioRef?: string;
  /** слова из SRS, которые человек употребил (мост узнавание → активный запас) */
  words: string[];
  createdAt: number;
  privacy: "private" | "syncable";
};

const KEY = "ie_output";
const listeners = new Set<() => void>();

type Store = OutputArtifact[];

function read(): Store {
  try {
    const raw = JSON.parse(storage().getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Store) : [];
  } catch {
    return [];
  }
}

function write(s: Store) {
  storage().setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Создать артефакт вывода. Возвращает созданную запись. */
export function addArtifact(input: {
  type: OutputType;
  text?: string;
  audioRef?: string;
  promptId?: string;
  words?: string[];
}): OutputArtifact {
  const a: OutputArtifact = {
    id: `out-${nowMs()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    promptId: input.promptId,
    text: input.text?.trim() || undefined,
    audioRef: input.audioRef,
    words: input.words ?? [],
    createdAt: nowMs(),
    privacy: "private",
  };
  write([...read(), a]);
  return a;
}

export function removeArtifact(id: string) {
  write(read().filter((a) => a.id !== id));
}

/** Все артефакты, новые сверху. */
export function listArtifacts(limit?: number): OutputArtifact[] {
  const all = [...read()].sort((a, b) => b.createdAt - a.createdAt);
  return limit ? all.slice(0, limit) : all;
}

/** Артефакты за конкретный день (dateKey = YYYY-MM-DD, по умолчанию сегодня). */
export function artifactsForDay(dateKey?: string): OutputArtifact[] {
  const d = dateKey ?? dayKey(nowMs());
  return read().filter((a) => dayKey(a.createdAt) === d);
}

export type OutputStats = {
  total: number;
  byType: Partial<Record<OutputType, number>>;
  /** сколько артефактов сегодня */
  today: number;
  /** сегодняшний статус уже написан? (для «дня v2») */
  statusToday: boolean;
  /** утренняя фраза сегодня уже была? */
  morningToday: boolean;
  /** сколько разных дней был хоть один вывод */
  activeDays: number;
  /** сколько голосовых записей всего */
  speech: number;
};

function computeStats(s: Store): OutputStats {
  const today = dayKey(nowMs());
  const byType: Partial<Record<OutputType, number>> = {};
  const days = new Set<string>();
  let todayCount = 0;
  let statusToday = false;
  let morningToday = false;
  for (const a of s) {
    byType[a.type] = (byType[a.type] ?? 0) + 1;
    days.add(dayKey(a.createdAt));
    if (dayKey(a.createdAt) === today) {
      todayCount++;
      if (a.type === "status") statusToday = true;
      if (a.type === "morning-phrase") morningToday = true;
    }
  }
  return {
    total: s.length,
    byType,
    today: todayCount,
    statusToday,
    morningToday,
    activeDays: days.size,
    speech: byType.speech ?? 0,
  };
}

/** Статистика вывода (для профиля/дашборда) — чистая функция для тестов. */
export function outputStats(): OutputStats {
  return computeStats(read());
}

const EMPTY = JSON.stringify(computeStats([]));

function snapshot(): string {
  return JSON.stringify(computeStats(read()));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

export function useOutputStats(): OutputStats {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return JSON.parse(raw) as OutputStats;
}

// Версия списка для реактивных экранов ленты вывода: сериализуем только
// лёгкий ключ (длина + последний id), сам список читается через listArtifacts.
function listVersion(): string {
  const s = read();
  return `${s.length}:${s[s.length - 1]?.id ?? ""}`;
}

export function useArtifacts(limit?: number): OutputArtifact[] {
  useSyncExternalStore(subscribe, listVersion, () => "0:");
  return listArtifacts(limit);
}
