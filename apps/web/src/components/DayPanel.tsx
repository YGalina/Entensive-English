"use client";

import { usePrefs, updatePrefs, useUILang } from "@/lib/prefs";
import { useTimeStats } from "@/lib/timelog";
import { PROGRAM, programDay } from "@ie/core/data/program";
import { ArrowRight, Check } from "./Icons";

const UI = {
  ru: {
    title: "Программа",
    day: (n: number, total: number) => `День ${n} из ${total}`,
    dayGoal: "Цель дня",
    words: "слов",
    todayPractice: "Сегодня в практике",
    empty: "Время по практикам появится здесь, как начнёшь сеанс.",
    done: "Интенсив пройден",
    advance: "День пройден",
    h: "ч",
    m: "м",
    activities: {
      flash: "Киносеанс",
      recognition: "Узнавание",
      context: "Активизация",
      grammar: "Грамматика",
      reading: "Скорочтение",
      shadowing: "Shadowing",
      review: "Повторы",
    } as Record<string, string>,
  },
  en: {
    title: "Program",
    day: (n: number, total: number) => `Day ${n} of ${total}`,
    dayGoal: "Daily goal",
    words: "words",
    todayPractice: "Practice today",
    empty: "Practice time will appear here once you start a session.",
    done: "Intensive complete",
    advance: "Mark day complete",
    h: "h",
    m: "m",
    activities: {
      flash: "Exposure",
      recognition: "Recognition",
      context: "Activation",
      grammar: "Grammar",
      reading: "Speed reading",
      shadowing: "Shadowing",
      review: "Review",
    } as Record<string, string>,
  },
};

const FOCUS_EN: Record<string, string> = {
  Киносеанс: "Exposure",
  Узнавание: "Recognition",
  Активизация: "Activation",
  Скорочтение: "Speed reading",
  Shadowing: "Shadowing",
  Релаксация: "Relaxation",
};

function fmt(sec: number, t: { h: string; m: string }): string {
  const m = Math.floor(sec / 60);
  if (m < 1) return "—";
  const h = Math.floor(m / 60);
  return h > 0 ? `${h} ${t.h} ${m % 60} ${t.m}` : `${m} ${t.m}`;
}

export default function DayPanel() {
  const prefs = usePrefs();
  const time = useTimeStats();
  const ui = useUILang();
  const t = UI[ui];

  const dayNum = Math.min(Math.max(1, prefs?.programDay ?? 1), PROGRAM.days.length);
  const pd = programDay(dayNum);
  const goalSec = pd.goalHours * 3600;
  const pct = Math.min(100, Math.round((time.todaySec / goalSec) * 100));
  const focus = pd.focus.map((x) => (ui === "en" ? FOCUS_EN[x] ?? x : x)).join(" · ");

  const breakdown = Object.entries(time.byActivityToday)
    .filter(([, s]) => s >= 30)
    .sort((a, b) => b[1] - a[1]);

  function advance() {
    updatePrefs({ programDay: Math.min(dayNum + 1, PROGRAM.days.length) });
  }

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-heading text-lg font-bold text-ink">{t.title}</h2>
        <span className="text-xs text-muted">
          {t.day(dayNum, PROGRAM.days.length)}
        </span>
      </div>

      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="font-heading text-base font-bold text-ink">
          {pd.title}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {t.dayGoal}: <span className="tnum">{pd.goalWords}</span> {t.words} ·{" "}
          <span className="tnum">{pd.goalHours}</span> {t.h} · {focus}
        </p>

        {/* Полоса дней */}
        <div className="mt-4 flex gap-1">
          {PROGRAM.days.map((d) => (
            <span
              key={d.day}
              className={`h-1.5 flex-1 rounded-full ${
                d.day < dayNum ? "bg-brand" : d.day === dayNum ? "bg-accent" : "bg-line"
              }`}
            />
          ))}
        </div>

        {/* Почасовка */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{t.todayPractice}</span>
            <span className="tnum font-heading text-base font-bold text-ink">
              {fmt(time.todaySec, t)} / {pd.goalHours} {t.h}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Разбивка по практикам */}
        {breakdown.length > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {breakdown.map(([act, sec]) => (
              <li key={act} className="flex items-center justify-between text-sm">
                <span className="text-muted">{t.activities[act] ?? act}</span>
                <span className="tnum font-medium text-ink">{fmt(sec, t)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-muted">
            {t.empty}
          </p>
        )}

        <button
          onClick={advance}
          disabled={dayNum >= PROGRAM.days.length}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-bg px-5 py-3 font-heading text-sm font-bold text-ink transition-colors hover:border-brand/40 disabled:opacity-50"
        >
          {dayNum >= PROGRAM.days.length ? (
            <>
              <Check className="h-4 w-4" /> {t.done}
            </>
          ) : (
            <>
              {t.advance} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
