"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useOutcome, HOURS_PER_LEVEL } from "@ie/core/outcome";
import { useWpmStats } from "@ie/core/wpm";
import { usePrefs, useUILang } from "@ie/core/prefs";
import { Check, Spark, ArrowRight, Flame } from "@/components/Icons";

// Полная программа интенсива: не «что делать сегодня» (это Путь дня), а карта
// всего маршрута: этапы → вехи → что будет в конце и почему. Статус этапов
// считается из реальных часов практики (timelog) — та же кибернетика.

type Stage = {
  id: string;
  fromH: number;
  toH: number;
  ru: { title: string; period: string; doing: string[]; result: string };
  en: { title: string; period: string; doing: string[]; result: string };
};

const STAGES: Stage[] = [
  {
    id: "sprint",
    fromH: 0,
    toH: 40,
    ru: {
      title: "Этап 1 · Спринт: снятие барьера",
      period: "первые ~2 недели · 0–40 ч",
      doing: [
        "ежедневный сеанс: настройка → киносеанс → узнавание",
        "массив 3 000–7 000 слов проходит через узнавание",
        "постановка звука фразами + первые наборы на клавиатуре",
        "вечерний круг перед сном",
      ],
      result:
        "Барьер «я не могу» снят. Тысячи слов знакомы в лицо, чтение заметно быстрее, ежедневный ритуал держится сам.",
    },
    en: {
      title: "Stage 1 · Sprint: lowering the barrier",
      period: "first ~2 weeks · 0–40 h",
      doing: [
        "daily session: attune → exposure → recognition",
        "3,000–7,000 words pass through recognition",
        "phrase-based sound production + first typing drills",
        "evening circle before sleep",
      ],
      result:
        "The “I can’t” barrier is gone. Thousands of words look familiar, reading is visibly faster, the daily ritual holds itself.",
    },
  },
  {
    id: "momentum",
    fromH: 40,
    toH: 100,
    ru: {
      title: "Этап 2 · Разгон",
      period: "~1–2 месяца · 40–100 ч",
      doing: [
        "словарь: 2 500+ слов в узнавании, повторы FSRS каждый день",
        "shadowing ежедневно — рот привыкает к английской моторике",
        "чтение массивом: скорость к 180–200 сл/мин",
        "грамматика в речи: 12 времён в готовых фразах",
      ],
      result:
        "Понимание на слух перестаёт быть кашей. Читаешь без словаря. Фразы начинают собираться сами.",
    },
    en: {
      title: "Stage 2 · Momentum",
      period: "~1–2 months · 40–100 h",
      doing: [
        "vocabulary: 2,500+ words recognized, daily FSRS reviews",
        "daily shadowing — the mouth learns English motorics",
        "bulk reading: speed toward 180–200 wpm",
        "grammar in speech: 12 tenses in ready frames",
      ],
      result:
        "Listening stops being noise. You read without a dictionary. Phrases start assembling themselves.",
    },
  },
  {
    id: "level",
    fromH: 100,
    toH: HOURS_PER_LEVEL,
    ru: {
      title: "Этап 3 · Выход на уровень",
      period: "~3–4 месяца · 100–200 ч",
      doing: [
        "словарь следующего уровня (B2 ≈ 4 000) в узнавании",
        "длинные тексты и видео без перевода",
        "скорость чтения 200+ сл/мин",
        "по Крашену (~6 мес входа) речь начинает всплывать сама",
      ],
      result:
        "≈200 направленных часов = +1 уровень CEFR (Cambridge). Уровень закреплён метриками: часы, слова, скорость — не ощущениями.",
    },
    en: {
      title: "Stage 3 · Reaching the level",
      period: "~3–4 months · 100–200 h",
      doing: [
        "next-level vocabulary (B2 ≈ 4,000) recognized",
        "long texts and videos without translation",
        "reading speed 200+ wpm",
        "per Krashen (~6 months of input) speech starts emerging",
      ],
      result:
        "≈200 guided hours = +1 CEFR level (Cambridge). The level is proven by metrics — hours, words, speed — not feelings.",
    },
  },
];

const UI = {
  ru: {
    title: "Программа",
    subtitle: (a: string, b: string) =>
      `Маршрут целиком: ${a.toUpperCase()} → ${b.toUpperCase()} за ≈${HOURS_PER_LEVEL} часов`,
    now: "ты здесь",
    doneStage: "пройден",
    metrics: "Как отслеживаем результат",
    mHours: "Часы практики",
    mWords: "Слова в узнавании",
    mWpm: "Скорость чтения",
    mStreak: "Дней в пути",
    of: "из",
    sprintDays: "14 дней спринта (Этап 1) по дням — на главной, карточка «Программа».",
    why: "Основа: guided learning hours Cambridge (≈200 ч на уровень), словарные пороги уровней, «тихий период» Крашена (~6 мес до спонтанной речи), эксперимент Петрусинского (скорость чтения ×2,5 за 2 недели).",
    cta: "К сегодняшнему шагу",
    wpmNone: "—",
  },
  en: {
    title: "Program",
    subtitle: (a: string, b: string) =>
      `The whole route: ${a.toUpperCase()} → ${b.toUpperCase()} in ≈${HOURS_PER_LEVEL} hours`,
    now: "you are here",
    doneStage: "done",
    metrics: "How we track the result",
    mHours: "Practice hours",
    mWords: "Words recognized",
    mWpm: "Reading speed",
    mStreak: "Days on the path",
    of: "of",
    sprintDays: "The 14 sprint days (Stage 1) live on Today, in the “Program” card.",
    why: "Grounding: Cambridge guided learning hours (≈200 h per level), level vocabulary thresholds, Krashen's silent period (~6 months to spontaneous speech), Petrusinsky's experiment (reading speed ×2.5 in 2 weeks).",
    cta: "To today's step",
    wpmNone: "—",
  },
} as const;

export default function ProgramPage() {
  const o = useOutcome();
  const w = useWpmStats();
  const prefs = usePrefs();
  const ui = useUILang();
  const t = UI[ui];
  const hours = Math.round(o.hoursDone * 10) / 10;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <h1 data-testid="program-title" className="font-heading text-2xl font-extrabold text-ink">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.subtitle(o.levelNow, o.levelNext)}</p>

        {/* Общий прогресс маршрута */}
        <div className="mt-4 rounded-card bg-marine p-4 text-white shadow-float">
          <div className="stripe-breton-red -mx-4 -mt-4 mb-3 h-1.5 rounded-t-card opacity-90" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-white/85">
              {hours} {t.of} {HOURS_PER_LEVEL} ч
            </span>
            <span className="tnum font-heading text-lg font-extrabold">{o.pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${o.pct}%` }} />
          </div>
        </div>

        {/* Этапы */}
        <ol className="mt-6 space-y-3">
          {STAGES.map((s) => {
            const st = s[ui];
            const done = o.hoursDone >= s.toH;
            const current = !done && o.hoursDone >= s.fromH;
            return (
              <li
                key={s.id}
                className={`rounded-card border p-4 ${
                  current
                    ? "border-brand bg-brand-soft"
                    : done
                      ? "border-line bg-surface opacity-75"
                      : "border-line bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-base font-bold text-ink">{st.title}</h2>
                    <p className="text-xs text-muted">{st.period}</p>
                  </div>
                  {done ? (
                    <span className="flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-1 text-xs font-bold text-ok">
                      <Check className="h-3.5 w-3.5" /> {t.doneStage}
                    </span>
                  ) : current ? (
                    <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">
                      {t.now}
                    </span>
                  ) : null}
                </div>
                <ul className="mt-3 space-y-1">
                  {st.doing.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: "var(--brand)" }}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-soft bg-bg px-3 py-2 text-xs leading-relaxed text-muted">
                  → {st.result}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-3 text-xs leading-relaxed text-muted">{t.sprintDays}</p>

        {/* Метрики отслеживания */}
        <section className="mt-6 rounded-card border border-line bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-ink">{t.metrics}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Metric label={t.mHours} value={`${hours} / ${HOURS_PER_LEVEL}`} />
            <Metric
              label={t.mWords}
              value={`${o.wordsLearned} / ${o.wordsTarget.toLocaleString(ui === "ru" ? "ru-RU" : "en-US")}`}
            />
            <Metric
              label={t.mWpm}
              value={
                w.last === null
                  ? t.wpmNone
                  : w.first !== null && w.count > 1 && w.first !== w.last
                    ? `${w.first} → ${w.last}`
                    : String(w.last)
              }
            />
            <Metric label={t.mStreak} value={String(o.daysPracticed)} icon={<Flame className="h-3.5 w-3.5 text-accent" />} />
          </div>
          {prefs?.level && o.levelEta && (
            <p className="mt-3 text-sm font-semibold text-ink">
              {ui === "ru"
                ? `Прогноз при текущем темпе: ${o.levelNext.toUpperCase()} к ${o.levelEta.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`
                : `Forecast at current pace: ${o.levelNext.toUpperCase()} by ${o.levelEta.toLocaleDateString("en-US", { day: "numeric", month: "long" })}`}
            </p>
          )}
        </section>

        {/* Почему мы в это верим */}
        <p className="mt-4 flex items-start gap-2 rounded-soft bg-brand-soft px-3 py-2.5 text-xs leading-relaxed text-brand-ink">
          <Spark className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {t.why}
        </p>

        <Link
          href="/"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
        >
          {t.cta}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-soft bg-bg p-3">
      <p className="flex items-center gap-1 text-[11px] text-muted">
        {icon}
        {label}
      </p>
      <p className="tnum mt-0.5 font-heading text-base font-extrabold text-ink">{value}</p>
    </div>
  );
}
