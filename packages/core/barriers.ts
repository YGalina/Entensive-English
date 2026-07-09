"use client";

import { useSyncExternalStore } from "react";
import { storage } from "./storage";
import { nowMs } from "./now";
import type { GuardianId } from "./data/guardians";

// Стражи пути: детекторы психологических барьеров из РЕАЛЬНОГО поведения
// (не по расписанию). Мягкий режим: максимум одна встреча в день, тот же
// страж не приходит чаще раза в 3 дня. Психообразование и практика —
// в data/guardians.ts (тексты редактирует Галина).

export type GuardianFacts = {
  /** тексты последних артефактов вывода, новые первыми (статусы/фразы) */
  recentTexts: string[];
  /** голосовых записей за последние 7 дней */
  speech7d: number;
  /** текстовых артефактов за последние 7 дней */
  texts7d: number;
  /** минуты практики по дням: YYYY-MM-DD → мин */
  byDayMin: Record<string, number>;
  dailyGoalMin: number;
};

const DEVALUING =
  /i can'?t do (this|it)|i('?m| am) (so )?(stupid|hopeless)|не получается|я не могу|ничего не (выходит|получается)|у меня не выйдет|бесполезно|i give up|это (всё )?зря/i;
const MOCKERY =
  /sorry for my english|my english is (so |very )?bad|excuse my english|стыдно за (мой|свой)|извини(те)? за мой|ужасный акцент|smeshno|позор/i;

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Какой страж встретился сейчас. Чистая функция — для тестов.
 * Приоритет: слова о себе (обесценивание/высмеивание) > качели > молчание.
 */
export function detectGuardian(
  facts: GuardianFacts,
  todayKey = dayKey(nowMs())
): { id: GuardianId; evidence: string } | null {
  const fresh = facts.recentTexts.slice(0, 5);
  for (const t of fresh) {
    if (DEVALUING.test(t)) return { id: "devaluing", evidence: t.slice(0, 60) };
  }
  for (const t of fresh) {
    if (MOCKERY.test(t)) return { id: "mockery", evidence: t.slice(0, 60) };
  }
  // Перфекционизм: рывок ≥2× плана, а на следующий день — ноль (в последней неделе).
  const days = Object.keys(facts.byDayMin).sort();
  const recent = days.slice(-8);
  for (let i = 0; i < recent.length - 1; i++) {
    const d = recent[i];
    const nextDay = dayKey(new Date(d + "T00:00:00Z").getTime() + 864e5);
    if (nextDay >= todayKey) break; // сегодняшний ноль — ещё не ноль
    if (
      facts.byDayMin[d] >= facts.dailyGoalMin * 2 &&
      (facts.byDayMin[nextDay] ?? 0) === 0
    ) {
      return { id: "perfectionism", evidence: `${d}: ${Math.round(facts.byDayMin[d])} мин → 0` };
    }
  }
  // Запугивание: пишет (≥3 текстов за неделю), но голоса нет совсем.
  if (facts.texts7d >= 3 && facts.speech7d === 0) {
    return { id: "fear", evidence: `${facts.texts7d} текстов, 0 голосом` };
  }
  return null;
}

// ——— Троттлинг показа и журнал встреч (ключ ie_guardians) ———

type GuardianLog = {
  lastShownDay?: string;
  /** дата последнего показа каждого стража */
  lastByGuardian: Partial<Record<GuardianId, string>>;
  /** пройденные практики: practiceId → дата */
  done: Record<string, string>;
  /** отложенные на сегодня ("не сейчас") */
  snoozedDay?: string;
  /** активный страж дня — карточка живёт до «прошла»/«не сейчас» */
  activeId?: GuardianId;
  activeDay?: string;
};

const KEY = "ie_guardians";
const listeners = new Set<() => void>();

function read(): GuardianLog {
  try {
    return {
      lastByGuardian: {},
      done: {},
      ...(JSON.parse(storage().getItem(KEY) ?? "{}") as Partial<GuardianLog>),
    };
  } catch {
    return { lastByGuardian: {}, done: {} };
  }
}

function write(l: GuardianLog) {
  storage().setItem(KEY, JSON.stringify(l));
  listeners.forEach((f) => f());
}

const SAME_GUARDIAN_COOLDOWN_DAYS = 3;

/** Можно ли показать этого стража сегодня (1 встреча/день, кулдаун 3 дня). */
export function canShowGuardian(id: GuardianId, todayKey = dayKey(nowMs())): boolean {
  const l = read();
  if (l.snoozedDay === todayKey) return false;
  if (l.lastShownDay === todayKey) return false;
  const last = l.lastByGuardian[id];
  if (last) {
    const daysSince = (new Date(todayKey).getTime() - new Date(last).getTime()) / 864e5;
    if (daysSince < SAME_GUARDIAN_COOLDOWN_DAYS) return false;
  }
  return true;
}

export function markGuardianShown(id: GuardianId, todayKey = dayKey(nowMs())) {
  const l = read();
  l.lastShownDay = todayKey;
  l.lastByGuardian[id] = todayKey;
  l.activeId = id;
  l.activeDay = todayKey;
  write(l);
}

/** Страж, активный сегодня (уже показан, но встреча не завершена). */
export function activeGuardian(todayKey = dayKey(nowMs())): GuardianId | null {
  const l = read();
  return l.activeDay === todayKey && l.activeId ? l.activeId : null;
}

function clearActive(l: GuardianLog) {
  delete l.activeId;
  delete l.activeDay;
}

export function snoozeToday(todayKey = dayKey(nowMs())) {
  const l = read();
  l.snoozedDay = todayKey;
  clearActive(l);
  write(l);
}

export function markPracticeDone(practiceId: string, todayKey = dayKey(nowMs())) {
  const l = read();
  l.done[practiceId] = todayKey;
  clearActive(l);
  write(l);
}

export function donePractices(): Record<string, string> {
  return read().done;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

/** Версия журнала — для реактивности карточки. */
export function useGuardianLogVersion(): string {
  return useSyncExternalStore(subscribe, () => storage().getItem(KEY) ?? "", () => "");
}
