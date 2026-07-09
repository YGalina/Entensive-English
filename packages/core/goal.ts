"use client";

import { useSyncExternalStore } from "react";
import { storage } from "./storage";
import { HOURS_PER_LEVEL } from "./outcome";

// Цель → Программа → Способности (Фаза B, 09_architecture_plan.md §2.1, §2.5).
// Пользователь покупает не «учить слова», а жизненный результат. Программа
// генерируется из цели; часы — честный ориентир Cambridge GLH (диапазон),
// прогресс отвечает на вопрос «что я теперь могу», а не «сколько стрик».

export type GoalDomain =
  | "move" // переезд и жизнь в среде
  | "work" // работа и собеседования
  | "meetings" // совещания и презентации
  | "study" // учёба или экзамен
  | "travel" // путешествия и бытовая свобода
  | "unlock-speech"; // «понимаю, но не говорю»

export type Level = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";

export type Goal = {
  /** жизненная цель словами пользователя (или выбранная формула) */
  lifeGoal: string;
  domain: GoalDomain;
  currentLevel: Level;
  targetLevel: Level;
  /** ISO-дата дедлайна; необязательна — тогда считаем от темпа */
  deadline?: string;
  weeklyMinutes: number;
};

/** Честный часовой ориентир (Cambridge GLH): диапазон на шаг уровня. */
export const HOURS_PER_LEVEL_RANGE: [number, number] = [180, 220];

const LEVELS: Level[] = ["a1", "a2", "b1", "b2", "c1", "c2"];

export function levelSteps(from: Level, to: Level): number {
  return Math.max(0, LEVELS.indexOf(to) - LEVELS.indexOf(from));
}

export type HoursBudget = {
  /** диапазон часов до цели [мин, макс] */
  range: [number, number];
  /** месяцы при заданном недельном темпе (по середине диапазона) */
  months: number | null;
  /** недельный темп, при котором цель успевается к дедлайну (если он есть) */
  weeklyMinutesForDeadline: number | null;
};

/** Бюджет часов до цели — арифметика ориентира, не обещание. */
export function hoursBudget(goal: Goal, now = Date.now()): HoursBudget {
  const steps = levelSteps(goal.currentLevel, goal.targetLevel);
  const range: [number, number] = [
    steps * HOURS_PER_LEVEL_RANGE[0],
    steps * HOURS_PER_LEVEL_RANGE[1],
  ];
  const midHours = steps * HOURS_PER_LEVEL;
  const weeklyHours = goal.weeklyMinutes / 60;
  const months =
    weeklyHours > 0 && steps > 0 ? Math.round((midHours / weeklyHours / 4.345) * 10) / 10 : null;
  let weeklyMinutesForDeadline: number | null = null;
  if (goal.deadline && steps > 0) {
    const weeks = (new Date(goal.deadline).getTime() - now) / (7 * 24 * 3600 * 1000);
    if (weeks > 1) weeklyMinutesForDeadline = Math.ceil((midHours * 60) / weeks / 5) * 5;
  }
  return { range, months, weeklyMinutesForDeadline };
}

// ——— Способности: «что я теперь могу» вместо «сколько слов» ———

export type Capability = {
  id: string;
  domain: GoalDomain;
  /** условие разблокировки — считается по фактам вывода/практики */
  need: { statuses?: number; activeWords?: number; speech?: number };
};

/** Стартовый набор вех по доменам (растёт с контентом; проверяется тестами). */
export const CAPABILITIES: Capability[] = [
  // Универсальные первые вехи речевого контура
  { id: "canWriteDailyStatus", domain: "unlock-speech", need: { statuses: 3 } },
  { id: "canSpeakOnRecord", domain: "unlock-speech", need: { speech: 3 } },
  { id: "canUseActiveWords", domain: "unlock-speech", need: { activeWords: 20 } },
  // Быт и среда
  { id: "canDescribeSymptom", domain: "move", need: { activeWords: 40, statuses: 7 } },
  { id: "canHandleAppointment", domain: "move", need: { activeWords: 60, speech: 5 } },
  // Работа
  { id: "canIntroduceMyself", domain: "work", need: { statuses: 5, speech: 3 } },
  { id: "canAnswerFollowUp", domain: "work", need: { activeWords: 50, speech: 7 } },
  // Совещания
  { id: "canSummarizeMeeting", domain: "meetings", need: { statuses: 10, activeWords: 60 } },
  // Учёба
  { id: "canRetellText", domain: "study", need: { statuses: 7, activeWords: 40 } },
  // Путешествия
  { id: "canAskDirections", domain: "travel", need: { activeWords: 25, speech: 3 } },
];

export type CapabilityProgress = { id: string; unlocked: boolean; pct: number };

/** Прогресс вех для домена цели + универсальных. Факты — из output/SRS. */
export function capabilityProgress(
  domain: GoalDomain,
  facts: { statuses: number; activeWords: number; speech: number }
): CapabilityProgress[] {
  return CAPABILITIES.filter((c) => c.domain === domain || c.domain === "unlock-speech").map(
    (c) => {
      const parts: number[] = [];
      if (c.need.statuses) parts.push(Math.min(1, facts.statuses / c.need.statuses));
      if (c.need.activeWords) parts.push(Math.min(1, facts.activeWords / c.need.activeWords));
      if (c.need.speech) parts.push(Math.min(1, facts.speech / c.need.speech));
      const pct = parts.length ? Math.round((parts.reduce((a, b) => a + b) / parts.length) * 100) : 0;
      return { id: c.id, unlocked: pct >= 100, pct };
    }
  );
}

// ——— Хранение цели (local-first, ключ ie_goal) ———

const KEY = "ie_goal";
const listeners = new Set<() => void>();

export function saveGoal(g: Goal) {
  storage().setItem(KEY, JSON.stringify(g));
  listeners.forEach((l) => l());
}

export function loadGoal(): Goal | null {
  try {
    const raw = storage().getItem(KEY);
    return raw ? (JSON.parse(raw) as Goal) : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

export function useGoal(): Goal | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => storage().getItem(KEY) ?? "",
    () => ""
  );
  try {
    return raw ? (JSON.parse(raw) as Goal) : null;
  } catch {
    return null;
  }
}
