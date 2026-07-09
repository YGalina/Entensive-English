"use client";

// «Горизонт» — рамка результата интенсива. Отвечает на вопрос: «что будет с
// моим уровнем, за какой срок и почему». Прогноз считается не из обещаний, а
// из твоего реального темпа (timelog) — кибернетика метода.
//
// Научные основания (округлённые рабочие константы):
// • Переход на следующий уровень CEFR ≈ 180–220 направленных часов
//   (Cambridge English: guided learning hours). Берём 200 ч.
// • Словарь уровней (узнавание): B1 ≈ 2500, B2 ≈ 4000, C1 ≈ 8000 слов.
// • Речь НЕ «всплывает сама» — она строится ежедневным выводом (см. output.ts);
//   обещание «через 6 месяцев» убрано по аудиту 2026-07.
// • Скорочтение: рабочая цель — от ~120–150 к 200–250 слов/мин (носитель).

import { useTimeStats } from "./timelog";
import { useSrsStats } from "./srs";
import { usePrefs } from "./prefs";
import { nowMs } from "./now";

export const HOURS_PER_LEVEL = 200; // середина ориентира 180–220 ч (Cambridge GLH)

const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
const VOCAB_TARGET: Record<string, number> = {
  a1: 800,
  a2: 1500,
  b1: 2500,
  b2: 4000,
  c1: 8000,
  c2: 12000,
};

export type Outcome = {
  levelNow: string; // "b1"
  levelNext: string; // "b2"
  hoursDone: number; // всего часов практики
  hoursGoal: number; // 200
  pct: number; // прогресс к следующему уровню по часам
  /** Средние минуты в день за последние 7 календарных дней */
  paceMinPerDay: number;
  /** Прогноз даты перехода на следующий уровень при текущем темпе (null — темпа нет) */
  levelEta: Date | null;
  /** Слов в узнавании (усвоено по SRS) и цель следующего уровня */
  wordsLearned: number;
  wordsInWork: number;
  wordsTarget: number;
  /** Сколько дней была практика */
  daysPracticed: number;
};

export function useOutcome(): Outcome {
  const time = useTimeStats();
  const srs = useSrsStats();
  const prefs = usePrefs();

  const levelNow = (prefs?.level ?? "b1").toLowerCase();
  const idx = LEVELS.indexOf(levelNow as (typeof LEVELS)[number]);
  const levelNext = LEVELS[Math.min(idx + 1, LEVELS.length - 1)] ?? "b2";

  const hoursDone = time.totalSec / 3600;
  const pct = Math.min(100, Math.round((hoursDone / HOURS_PER_LEVEL) * 100));

  // Темп: среднее по последним 7 календарным дням (включая пустые).
  const now = nowMs();
  let last7 = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now - i * 24 * 3600 * 1000);
    last7 += time.byDay[d.toISOString().slice(0, 10)] ?? 0;
  }
  const paceMinPerDay = Math.round(last7 / 7 / 60);

  const hoursLeft = Math.max(0, HOURS_PER_LEVEL - hoursDone);
  const levelEta =
    paceMinPerDay >= 5
      ? new Date(now + ((hoursLeft * 60) / paceMinPerDay) * 24 * 3600 * 1000)
      : null;


  return {
    levelNow,
    levelNext,
    hoursDone,
    hoursGoal: HOURS_PER_LEVEL,
    pct,
    paceMinPerDay,
    levelEta,
    wordsLearned: srs.learned,
    wordsInWork: srs.total,
    wordsTarget: VOCAB_TARGET[levelNext] ?? 4000,
    daysPracticed: Object.keys(time.byDay).length,
  };
}
