"use client";

// «Горизонт»: зачем всё это и что будет. Цель-уровень, честный прогноз от
// реального темпа, вехи (слова, речевой контур) и строка «почему мы так
// считаем». Не обещание — обратная связь: темп твой, прогноз пересчитывается.
// «Речь всплывёт сама» убрано по аудиту: речь показываем фактами вывода.

import Link from "next/link";
import { useOutcome } from "@ie/core/outcome";
import { useOutputStats } from "@ie/core/output";
import { useSrsStats } from "@ie/core/srs";
import { useWpmStats } from "@ie/core/wpm";
import { useUILang } from "@ie/core/prefs";
import { Spark, ArrowRight } from "./Icons";

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
    speech: "Речь (твой вывод)",
    speechVal: (statuses: number, active: number) =>
      `${statuses} статусов · ${active} слов в активе`,
    speechNone: "начнётся с первого статуса дня — вечером, 1–3 предложения",
    days: "Дней в пути",
    program: "вся программа",
    wpm: "Скорость чтения",
    wpmRange: (f: number, l: number) => `${f} → ${l} сл/мин`,
    wpmOne: (l: number) => `${l} сл/мин`,
    wpmNone: "появится после первого текста в «Чтении»",
    why: "Почему так: ≈180–220 направленных часов = +1 уровень CEFR (ориентир Cambridge, не обещание); словарь B2 ≈ 4 000 слов в узнавании; вход даёт материал, а речь строится ежедневным маленьким выводом — статус, фразы, голос.",
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
    speech: "Speech (your output)",
    speechVal: (statuses: number, active: number) =>
      `${statuses} statuses · ${active} active words`,
    speechNone: "starts with your first status of the day — 1–3 sentences tonight",
    days: "Days on the path",
    program: "full program",
    wpm: "Reading speed",
    wpmRange: (f: number, l: number) => `${f} → ${l} wpm`,
    wpmOne: (l: number) => `${l} wpm`,
    wpmNone: "appears after your first text in Reading",
    why: "Why: ≈180–220 guided hours = +1 CEFR level (a Cambridge benchmark, not a promise); B2 vocabulary ≈ 4,000 recognized words; input supplies the material — speech is built by a small daily output: status, phrases, voice.",
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
  const out = useOutputStats();
  const srs = useSrsStats();
  const w = useWpmStats();
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
      <Link
        href="/program"
        data-testid="horizon-program-link"
        className="inline-flex items-center gap-1 text-xs font-bold text-brand underline-offset-2 hover:underline"
      >
        {t.program} <ArrowRight className="h-3.5 w-3.5" />
      </Link>

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
            {(out.byType.status ?? 0) > 0 || srs.activeWords > 0
              ? t.speechVal(out.byType.status ?? 0, srs.activeWords)
              : t.speechNone}
          </span>
        </li>
        <li className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted">{t.wpm}</span>
          <span className="tnum text-right font-medium text-ink">
            {w.last === null
              ? t.wpmNone
              : w.count > 1 && w.first !== null && w.first !== w.last
                ? t.wpmRange(w.first, w.last)
                : t.wpmOne(w.last)}
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
