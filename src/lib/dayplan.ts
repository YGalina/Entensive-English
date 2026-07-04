"use client";

// Дирижёр дня. Метод требует поступательности: один понятный следующий шаг,
// а не выбор из восьми табов. План собирается из всех модулей; шаг закрывается
// НЕ галочкой, а реальным временем практики (timelog) — кибернетика метода:
// обратная связь по фактическим часам. Повторы закрываются пустой очередью FSRS.
// Порядок — методический: состояние → массив → повторы → звук → моторика →
// грамматика → чтение → имитация. Порядок рекомендательный, не принудительный.

import { useTimeStats } from "./timelog";
import { useSrsStats } from "./srs";

export type DayStep = {
  id: string;
  href: string;
  /** Минут практики, чтобы шаг закрылся (для kind=time) */
  goalMin: number;
  /** Ключи активностей timelog, которые засчитываются в шаг */
  activities: string[];
  kind: "time" | "review";
  /** CSS-переменная сигнального цвета навыка (дизайн-система «Марина») */
  tone: string;
  ru: { title: string; note: string };
  en: { title: string; note: string };
};

export const DAY_STEPS: DayStep[] = [
  {
    id: "session",
    tone: "--sk-words",
    href: "/session/health",
    goalMin: 15,
    activities: ["flash", "context", "recognition"],
    kind: "time",
    ru: { title: "Сеанс дня", note: "настройка → киносеанс → контекст → узнавание" },
    en: { title: "Today’s session", note: "attune → exposure → context → recognition" },
  },
  {
    id: "review",
    tone: "--sk-words",
    href: "/vocab",
    goalMin: 0,
    activities: ["review"],
    kind: "review",
    ru: { title: "Повторы", note: "то, что система запланировала на сегодня" },
    en: { title: "Reviews", note: "what the system scheduled for today" },
  },
  {
    id: "pronunciation",
    tone: "--sk-sounds",
    href: "/pronunciation",
    goalMin: 5,
    activities: ["pronunciation"],
    kind: "time",
    ru: { title: "Постановка звука", note: "фраза: медленно → как носитель" },
    en: { title: "Sound production", note: "phrase: slow → native" },
  },
  {
    id: "typing",
    tone: "--sk-typing",
    href: "/typing",
    goalMin: 5,
    activities: ["typing"],
    kind: "time",
    ru: { title: "Набор", note: "произнёс → безошибочно записал" },
    en: { title: "Typing", note: "say it → type it clean" },
  },
  {
    id: "grammar",
    tone: "--sk-grammar",
    href: "/grammar",
    goalMin: 5,
    activities: ["grammar"],
    kind: "time",
    ru: { title: "Времена", note: "собери фразу и проговори вслух" },
    en: { title: "Tenses", note: "build a phrase and say it aloud" },
  },
  {
    id: "reading",
    tone: "--sk-reading",
    href: "/reading",
    goalMin: 7,
    activities: ["reading"],
    kind: "time",
    ru: { title: "Чтение", note: "массив текста, не застревая на словах" },
    en: { title: "Reading", note: "text flow, no word-by-word stalls" },
  },
  {
    id: "shadowing",
    tone: "--sk-video",
    href: "/video",
    goalMin: 7,
    activities: ["shadowing"],
    kind: "time",
    ru: { title: "Shadowing", note: "повторяй вслух за носителем" },
    en: { title: "Shadowing", note: "repeat aloud after a native" },
  },
];

export type DayStepState = DayStep & {
  doneMin: number;
  pct: number;
  done: boolean;
  /** Для review: сколько карточек ждёт */
  due: number;
};

export type DayPlanState = {
  steps: DayStepState[];
  /** Первый незакрытый шаг (null — день собран) */
  current: DayStepState | null;
  doneCount: number;
  total: number;
  todayMin: number;
};

export function useDayPlan(): DayPlanState {
  const { byActivityToday, todaySec } = useTimeStats();
  const srs = useSrsStats();

  const steps: DayStepState[] = DAY_STEPS.map((s) => {
    const sec = s.activities.reduce((a, k) => a + (byActivityToday[k] || 0), 0);
    const doneMin = sec / 60;
    if (s.kind === "review") {
      const done = srs.dueToday === 0;
      return { ...s, doneMin, pct: done ? 100 : 0, done, due: srs.dueToday };
    }
    const pct = Math.min(100, Math.round((doneMin / s.goalMin) * 100));
    return { ...s, doneMin, pct, done: pct >= 100, due: 0 };
  });

  const current = steps.find((x) => !x.done) ?? null;
  return {
    steps,
    current,
    doneCount: steps.filter((x) => x.done).length,
    total: steps.length,
    todayMin: Math.round(todaySec / 60),
  };
}
