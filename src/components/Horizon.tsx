"use client";

// «Горизонт»: зачем всё это и что будет. Цель-уровень, честный прогноз от
// реального темпа, вехи (слова, речь по Крашену) и строка «почему мы так
// считаем». Не обещание — обратная связь: темп твой, прогноз пересчитывается.

import { useOutcome } from "@/lib/outcome";
import { useUILang } from "@/lib/prefs";
import { Spark } from "./Icons";

const UI = {
  ru: {
    title: "Горизонт",
    toLevel: (a: string, b: string) => `${a.toUpperCase()} → ${b.toUpperCase()}`,
    hours: (d: number, g: number) => `${d} из ${g} ч направленной практики`,
    etaAt: (pace: number, date: string) =>
      `При темпе ~${pace} мин/день выйдешь на уровень к ${date}`,
    etaNone:
      "Позанимайся несколько дней — появится честный прогноз даты по твоему темпу.",
    words: "Слова в узнавании",
    wordsVal: (l: number, w: number, t: number) =>
      `${l} усвоено · ${w} в работе · цель ${t.toLocaleString("ru-RU")}`,
    speech: "Речь",
    speechVal: (date: string) =>
      `начнёт всплывать сама ~к ${date} (тихий период по Крашену)`,
    speechNone: "начнёт всплывать сама через ~6 месяцев входа (Крашен)",
    days: "Дней в пути",
    why: "Почему так: ≈200 направленных часов = +1 уровень CEFR (Cambridge); словарь B2 ≈ 4 000 слов в узнавании; при постоянном понятном входе речь появляется сама через ~6 месяцев — её не надо выдавливать.",
  },
  en: {
    title: "Horizon",
    toLevel: (a: string, b: string) => `${a.toUpperCase()} → ${b.toUpperCase()}`,
    hours: (d: number, g: number) => `${d} of ${g} h of guided practice`,
    etaAt: (pace: number, date: string) =>
      `At ~${pace} min/day you reach the level by ${date}`,
    etaNone: "Practice a few days — an honest date forecast will appear from your pace.",
    words: "Words recognized",
    wordsVal: (l: number, w: number, t: number) =>
      `${l} learned · ${w} in work · target ${t.toLocaleString("en-US")}`,
    speech: "Speech",
    speechVal: (date: string) => `emerges on its own ~by ${date} (Krashen's silent period)`,
    speechNone: "emerges on its own after ~6 months of input (Krashen)",
    days: "Days on the path",
    why: "Why: ≈200 guided hours = +1 CEFR level (Cambridge); B2 vocabulary ≈ 4,000 recognized words; with steady comprehensible input, speech emerges by itself after ~6 months — it must not be forced.",
  },
} as const;

function fmtDate(d: Date, ui: "ru" | "en"): string {
  return d.toLocaleDateString(ui === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
  });
}

export default function Horizon() {
  const o = useOutcome();
  const ui = useUILang();
  const t = UI[ui];
  const hoursDone = Math.round(o.hoursDone * 10) / 10;

  return (
    <section className="mt-6 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-ink">{t.title}</h2>
        <span className="rounded-full bg-brand px-3 py-1 font-heading text-xs font-extrabold text-white">
          {t.toLevel(o.levelNow, o.levelNext)}
        </span>
      </div>

      {/* Часы до уровня */}
      <p className="mt-3 text-sm text-muted">{t.hours(hoursDone, o.hoursGoal)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${o.pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-ink">
        {o.levelEta ? t.etaAt(o.paceMinPerDay, fmtDate(o.levelEta, ui)) : t.etaNone}
      </p>

      {/* Вехи */}
      <ul className="mt-4 space-y-2 border-t border-line pt-3">
        <li className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted">{t.words}</span>
          <span className="tnum text-right font-medium text-ink">
            {t.wordsVal(o.wordsLearned, o.wordsInWork, o.wordsTarget)}
          </span>
        </li>
        <li className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted">{t.speech}</span>
          <span className="text-right font-medium text-ink">
            {o.speechEta ? t.speechVal(fmtDate(o.speechEta, ui)) : t.speechNone}
          </span>
        </li>
        <li className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted">{t.days}</span>
          <span className="tnum font-medium text-ink">{o.daysPracticed}</span>
        </li>
      </ul>

      {/* Почему мы так считаем */}
      <p className="mt-4 flex items-start gap-2 rounded-soft bg-brand-soft px-3 py-2.5 text-xs leading-relaxed text-brand-ink">
        <Spark className="mt-0.5 h-4 w-4 flex-shrink-0" />
        {t.why}
      </p>
    </section>
  );
}
