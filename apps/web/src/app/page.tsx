"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingGate from "@/components/OnboardingGate";
import Horizon from "@/components/Horizon";
import { Play, Check, Layers, Moon, ArrowRight } from "@/components/Icons";
import { useUILang } from "@ie/core/prefs";
import { useDayPlan } from "@ie/core/dayplan";
import { useSrsStats } from "@ie/core/srs";
import { useOutputStats } from "@ie/core/output";

// «Сегодня» — макет 24a/v2 + 13_app_logic §3.1: ОДИН следующий шаг.
// Большая карточка «Сессия дня» (единственный терракотовый CTA), честные часы
// (Horizon), малая карточка SRS «Пора вернуть слова» и вечерний вход.
// Убрано по логике: стрик с огоньком, «цель дня N слов», видимый чек-лист
// шагов, список пачек, объяснялка метода. Dayplan остаётся под капотом.

const UI = {
  ru: {
    today: "Сегодня",
    morning: "Доброе утро, Галина",
    day: "Добрый день, Галина",
    eveningGreet: "Добрый вечер, Галина",
    sessionLabel: "Сессия дня",
    min: (m: number) => `~${m} мин`,
    sessionTitle: "Твои слова дня",
    sessionDoneTitle: "Сессия закрыта — день начат",
    sessionNote: "Поток слов · контекст · узнавание · сказать своё",
    start: "Начать",
    again: "Ещё круг",
    srsLabel: (n: number) => `Потом · ${n} к повтору`,
    srsTitle: "Пора вернуть слова",
    vocabLabel: "Словарь",
    vocabTitle: "Мои слова",
    eveningLabel: "Вечером · 3 мин",
    eveningTitle: "Статус дня",
    circleLabel: "Вечерний круг",
    circleTitle: "Тихо закроем сегодняшний день",
    circleNote: "Состояние · одна фраза о дне по-английски. Запись видна только тебе.",
    circleCta: "Закрыть день",
    circleAgain: "Открыть вечерний круг",
  },
  en: {
    today: "Today",
    morning: "Good morning, Galina",
    day: "Good afternoon, Galina",
    eveningGreet: "Good evening, Galina",
    sessionLabel: "Today’s session",
    min: (m: number) => `~${m} min`,
    sessionTitle: "Your words of the day",
    sessionDoneTitle: "Session closed — the day has begun",
    sessionNote: "Word flow · context · recognition · say your own",
    start: "Start",
    again: "One more round",
    srsLabel: (n: number) => `Later · ${n} to review`,
    srsTitle: "Time to bring words back",
    vocabLabel: "Vocabulary",
    vocabTitle: "My words",
    eveningLabel: "Evening · 3 min",
    eveningTitle: "Day status",
    circleLabel: "Evening circle",
    circleTitle: "Let's quietly close this day",
    circleNote: "How you are · one phrase about the day in English. Visible only to you.",
    circleCta: "Close the day",
    circleAgain: "Open the evening circle",
  },
} as const;

export default function Today() {
  const ui = useUILang();
  const t = UI[ui];
  const plan = useDayPlan();
  const srs = useSrsStats();
  const out = useOutputStats();

  const sessionStep = plan.steps.find((s) => s.id === "session") ?? null;
  const sessionDone = sessionStep?.done ?? false;
  const sessionHref = sessionStep?.href ?? "/session/health";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.morning : hour < 17 ? t.day : t.eveningGreet;
  // Вечерняя трансформация экрана: после 17 и когда сессия закрыта.
  const eveningView = hour >= 17 && sessionDone;

  const due = srs.produceDue + srs.dueToday;

  return (
    <OnboardingGate>
      <div className="flex min-h-dvh flex-col">
        <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
          <header className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                {t.today}
              </p>
              <h1
                data-testid="home-greeting"
                className="font-heading text-2xl font-extrabold text-ink"
              >
                {greeting}
              </h1>
            </div>
            <ThemeToggle />
          </header>

          {/* СЕССИЯ ДНЯ — единственный терракотовый CTA экрана */}
          <section className="rounded-card border-2 border-brand bg-surface p-5 shadow-float">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
                {t.sessionLabel}
              </p>
              {sessionStep && sessionStep.goalMin > 0 && (
                <span className="text-xs font-semibold text-muted">
                  {t.min(sessionStep.goalMin)}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-heading text-[24px] font-extrabold leading-tight text-ink">
              {sessionDone ? t.sessionDoneTitle : t.sessionTitle}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.sessionNote}</p>
            <Link
              href={sessionHref}
              data-testid="home-start-session"
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 font-heading text-base font-extrabold transition-transform active:scale-[0.98] ${
                sessionDone
                  ? "border border-line bg-surface text-ink"
                  : "bg-brand text-white shadow-[0_8px_20px_-6px_var(--brand)]"
              }`}
            >
              {sessionDone ? <Check className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {sessionDone ? t.again : t.start}
            </Link>
          </section>

          {/* Пора вернуть слова · Вечером */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link
              href="/vocab"
              className="rounded-card bg-surface p-4 shadow-card transition-transform active:scale-[0.98]"
            >
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-accent-d">
                <Layers className="h-3.5 w-3.5" />
                {due > 0 ? t.srsLabel(due) : t.vocabLabel}
              </p>
              <p className="mt-1.5 font-heading text-sm font-bold text-ink">
                {due > 0 ? t.srsTitle : t.vocabTitle}
              </p>
            </Link>
            <Link
              href="/evening"
              className="rounded-card bg-surface p-4 shadow-card transition-transform active:scale-[0.98]"
            >
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                <Moon className="h-3.5 w-3.5" />
                {t.eveningLabel}
              </p>
              <p className="mt-1.5 font-heading text-sm font-bold text-ink">
                {t.eveningTitle}
              </p>
            </Link>
          </div>

          {/* Вечером экран меняется: тёплая тёмная карточка «свет лампы» */}
          {eveningView && (
            <section className="mt-3 rounded-card bg-[#2e2a22] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#e8b36a]">
                {t.circleLabel}
              </p>
              <h2 className="mt-2 font-english text-xl leading-snug text-[#f5efe2]">
                {t.circleTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#9c937d]">{t.circleNote}</p>
              <Link
                href="/evening"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#e8b36a] px-5 py-3.5 font-heading text-base font-extrabold text-[#2a2214] transition-transform active:scale-[0.98]"
              >
                {out.statusToday ? t.circleAgain : t.circleCta}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </section>
          )}

          {/* Честные часы и прогноз — ориентир, не обещание */}
          <Horizon />
        </main>

        <BottomNav />
      </div>
    </OnboardingGate>
  );
}
