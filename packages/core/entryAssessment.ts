"use client";

import { ENTRY_KEYS } from "./entryRouting";
import { storage } from "./storage";

export const ASSESSMENT_TOTAL_DAYS = 14;
export const ASSESSMENT_TOTAL_SESSIONS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

export const ENTRY_ASSESSMENT_COPY = {
  pretestTitle: "Что вспоминается сейчас",
  pretestInstruction: "НАПИШИ ПО-АНГЛИЙСКИ",
  pretestContract:
    "Это не экзамен, а стартовая точка. «Не помню» — нормальный ответ. Здесь нет оценки тебя.",
  inputPlaceholder: "Ответ по-английски",
  autocorrectOff: "Автоисправление выключено",
  skip: "Не помню",
  next: "Дальше",
  duplicate: "Этот ответ уже записан. Переходим дальше.",
  recordFailed: "Ответ не записался. Попробуй ещё раз.",
  waitTitle: "Следующая проверка",
  sessions: "Сессии практики",
  days: "Прошло дней",
  waitNote:
    "Проверка покажет, что удержалось со временем. Практика продолжается как обычно.",
  backToPractice: "Вернуться к практике",
} as const;

export type AssessmentGateView = {
  sessions: number;
  sessionsRemaining: number;
  days: number;
  daysRemaining: number;
  opensAt: number;
  available: boolean;
};

/** Pure S8 projection. It never writes course truth. */
export function assessmentGateView(
  pretestAt: number,
  sessionsCompleted: number,
  now = Date.now()
): AssessmentGateView {
  const sessions = Math.max(0, Math.min(ASSESSMENT_TOTAL_SESSIONS, sessionsCompleted));
  const elapsed = Math.max(0, now - pretestAt);
  const days = Math.max(0, Math.min(ASSESSMENT_TOTAL_DAYS, Math.floor(elapsed / DAY_MS)));
  const opensAt = pretestAt + ASSESSMENT_TOTAL_DAYS * DAY_MS;
  return {
    sessions,
    sessionsRemaining: ASSESSMENT_TOTAL_SESSIONS - sessions,
    days,
    daysRemaining: ASSESSMENT_TOTAL_DAYS - days,
    opensAt,
    available: sessions === ASSESSMENT_TOTAL_SESSIONS && now >= opensAt,
  };
}

/** Protocol owns this projection; Path only reads it. */
export type AssessmentStage = "S7" | "S8" | "S9" | "S10" | "S11" | "S12" | "S13";

export function setOpenAssessmentStage(stage: AssessmentStage | null): void {
  storage().setItem(ENTRY_KEYS.openProtocolStage, stage ?? "");
}

/** After a complete S7, Protocol closes and Daily Engine exposes S5. */
export function handoffFromPretestToFirstSession(): void {
  const s = storage();
  s.setItem(ENTRY_KEYS.openProtocolStage, "");
  s.setItem(ENTRY_KEYS.dailyStep, "S5");
}
