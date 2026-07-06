"use client";

import Link from "next/link";
import { today } from "@/data/packs";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingGate from "@/components/OnboardingGate";
import DayPanel from "@/components/DayPanel";
import Horizon from "@/components/Horizon";
import { Flame, Play, Spark, Check, ArrowRight } from "@/components/Icons";
import { useUILang } from "@/lib/prefs";
import { useDayPlan } from "@/lib/dayplan";

function pluralRu(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const UI = {
  ru: {
    today: "Сегодня",
    greeting: "Добрый день, Галина",
    dailyGoal: "Цель дня по методике",
    intensive: (hours: number) => `интенсив ${hours} ч`,
    words: "слов",
    readyNow: (total: number) => `В приложении сейчас готово ${total} слов. Проходи пачками: одна пачка = один законченный сеанс.`,
    start: "Начать сеанс",
    videos: "видео",
    field: "сверхнасыщенное поле",
    pathTitle: "Путь дня",
    pathNote: "Шаги закрываются сами — реальным временем практики. Порядок — подсказка, не приказ.",
    step: (n: number, total: number) => `Шаг ${n} из ${total}`,
    minToday: (m: number) => `${m} мин сегодня`,
    allDone: "День собран. Всё остальное — в удовольствие.",
    allDoneCta: "Взять ещё пачку",
    due: (n: number) => `${n} к повтору`,
    minGoal: (m: number) => `~${m} мин`,
    packsTitle: "Пачки дня",
    ready: "слов готово",
    pack: "Пачка",
    videoReading: "видео + чтение",
    soon: "скоро · готовим контекст",
    methodTitle: "Сеанс, а не карточки",
    methodText:
      "Цель дня может быть 600 слов, но приложение ведёт к ней готовыми пачками. Перегрузка массивом → активизация в контексте → узнавание.",
    noPenalty: "Без штрафов за ошибки. Темп — твой.",
    packCount: (n: number) => `${n} ${pluralRu(n, "пачка", "пачки", "пачек")}`,
    cycle: [
      { n: "01", t: "Готовность", d: "настрой, снятие барьера" },
      { n: "02", t: "Киносеанс", d: "массивный ввод всей пачки" },
      { n: "03", t: "Активизация", d: "те же слова в речи" },
      { n: "04", t: "Узнавание", d: "спокойный темп, 2–3 прохода" },
    ],
  },
  en: {
    today: "Today",
    greeting: "Good afternoon, Galina",
    dailyGoal: "Method goal for today",
    intensive: (hours: number) => `${hours}h intensive`,
    words: "words",
    readyNow: (total: number) => `${total} words are ready in the app now. Work pack by pack: one pack is one complete session.`,
    start: "Start session",
    videos: "videos",
    field: "intensive field",
    pathTitle: "Today’s path",
    pathNote: "Steps complete themselves — by real practice time. The order is a hint, not an order.",
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    minToday: (m: number) => `${m} min today`,
    allDone: "The day is complete. Everything else is pure pleasure.",
    allDoneCta: "Take another pack",
    due: (n: number) => `${n} to review`,
    minGoal: (m: number) => `~${m} min`,
    packsTitle: "Today's packs",
    ready: "words ready",
    pack: "Pack",
    videoReading: "video + reading",
    soon: "soon · preparing context",
    methodTitle: "Session, not single cards",
    methodText:
      "The daily goal may be 600 words, but the app moves toward it through ready packs. Bulk exposure → context activation → recognition.",
    noPenalty: "No penalties for mistakes. Your pace.",
    packCount: (n: number) => `${n} ${n === 1 ? "pack" : "packs"}`,
    cycle: [
      { n: "01", t: "Readiness", d: "settle in, lower resistance" },
      { n: "02", t: "Exposure", d: "bulk input of the whole pack" },
      { n: "03", t: "Activation", d: "the same words in speech" },
      { n: "04", t: "Recognition", d: "calm pace, 2–3 passes" },
    ],
  },
} as const;

export default function Today() {
  const { goalWords, hours, streak, packs } = today;
  const filled = packs.filter((p) => p.words.length > 0);
  const total = filled.reduce((s, p) => s + p.words.length, 0);
  const ui = useUILang();
  const t = UI[ui];
  const plan = useDayPlan();
  const cur = plan.current;
  const curIdx = cur ? plan.steps.findIndex((s) => s.id === cur.id) : -1;

  return (
    <OnboardingGate>
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              {t.today}
            </p>
            <h1 data-testid="home-greeting" className="font-heading text-2xl font-extrabold text-ink">
              {t.greeting}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Латунный чип: текст всегда тёмный — на жёлтом светлое нечитаемо */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-2 text-sm font-bold text-[#3b2c07] shadow-card">
              <Flame className="h-4 w-4" />
              <span className="tnum">{streak}</span>
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Цель дня — метод мыслит сотнями слов, но приложение ведёт пачками */}
        <section className="relative overflow-hidden rounded-card bg-marine p-6 text-white shadow-float">
          {/* Бретонская лента — фирменная полоска тельняшки */}
          <div className="stripe-breton-red absolute inset-x-0 top-0 h-2 opacity-90" />
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-sm text-white/85">
            {t.dailyGoal} · {t.intensive(hours)}
          </p>
          <p className="mt-1 font-heading text-[44px] font-extrabold leading-none tnum">
            {goalWords} {t.words}
          </p>
          <p className="mt-2 text-sm text-white/90">
            {t.packCount(packs.length)} · {packs.length} {t.videos} · {t.field}
          </p>
          <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm leading-relaxed text-white/95">
            {t.readyNow(total)}
          </p>
          {/* Одна следующая кнопка: дирижёр ведёт по шагам дня */}
          {cur ? (
            <Link
              href={cur.href}
              data-testid="home-start-session"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
            >
              <Play className="h-5 w-5" />
              {cur[ui].title}
              <span className="text-sm font-bold text-white/75">
                · {t.step(curIdx + 1, plan.total)}
              </span>
            </Link>
          ) : (
            <Link
              href="/vocab"
              data-testid="home-start-session"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-4 font-heading text-base font-extrabold text-white"
            >
              <Check className="h-5 w-5" />
              {t.allDone} {t.allDoneCta} →
            </Link>
          )}
        </section>

        {/* Горизонт: цель, прогноз от реального темпа, почему мы так считаем */}
        <Horizon />

        {/* Путь дня: шаги закрываются реальным временем практики */}
        <section className="mt-6">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-ink">{t.pathTitle}</h2>
            <span className="tnum text-xs font-bold text-muted">
              {plan.doneCount}/{plan.total} · {t.minToday(plan.todayMin)}
            </span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted">{t.pathNote}</p>
          <ol className="space-y-2">
            {plan.steps.map((s, i) => {
              const isCur = cur?.id === s.id;
              return (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    data-testid="day-step"
                    className={`flex items-center gap-3 rounded-soft border p-3 transition-colors ${
                      isCur
                        ? "border-brand bg-brand-soft"
                        : s.done
                          ? "border-line bg-surface opacity-70"
                          : "border-line bg-surface hover:border-brand/40"
                    }`}
                  >
                    {/* Чип шага — в сигнальном цвете навыка */}
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-heading text-sm font-extrabold ${
                        s.done ? "bg-ok/15 text-ok" : isCur ? "text-white" : ""
                      }`}
                      style={
                        s.done
                          ? undefined
                          : isCur
                            ? { background: `var(${s.tone})` }
                            : {
                                background: `color-mix(in srgb, var(${s.tone}) 12%, transparent)`,
                                color: `var(${s.tone})`,
                              }
                      }
                    >
                      {s.done ? <Check className="h-5 w-5" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          isCur ? "text-brand-ink" : "text-ink"
                        }`}
                      >
                        {s[ui].title}
                      </span>
                      <span className="block truncate text-xs text-muted">{s[ui].note}</span>
                    </span>
                    <span className="tnum flex-shrink-0 text-xs font-bold text-muted">
                      {s.kind === "review"
                        ? s.done
                          ? "✓"
                          : t.due(s.due)
                        : s.done
                          ? "✓"
                          : s.doneMin > 0.5
                            ? `${Math.round(s.doneMin)}/${s.goalMin}м`
                            : t.minGoal(s.goalMin)}
                    </span>
                    {isCur && <ArrowRight className="h-4 w-4 flex-shrink-0 text-brand" />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Программа по дням + почасовка */}
        <DayPanel />

        {/* Пачки дня = блоки метода */}
        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-ink">{t.packsTitle}</h2>
            <span className="text-xs text-muted">
              <span className="tnum">{total}</span> {t.ready}
            </span>
          </div>
          <ul className="space-y-2.5">
            {packs.map((p, i) => {
              const ready = p.words.length > 0;
              return (
                <li key={p.id}>
                  <Link
                    href={ready ? `/session/${p.id}` : "#"}
                    aria-disabled={!ready}
                    className={`flex items-center gap-3 rounded-soft border border-line bg-surface p-3 transition-colors ${
                      ready ? "hover:border-brand/40" : "pointer-events-none opacity-55"
                    }`}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft font-heading text-sm font-extrabold text-brand-d">
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {t.pack} «{p.title}»
                      </span>
                      <span className="block text-xs text-muted">
                        {ready
                          ? `${p.words.length} ${t.words} · ${t.videoReading}`
                          : t.soon}
                      </span>
                    </span>
                    {ready ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-ok" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-line" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Цикл метода — почему это не карточки по одной */}
        <section className="mt-7 rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Spark className="h-4 w-4 text-brand" />
            <h2 className="font-heading text-base font-bold text-ink">
              {t.methodTitle}
            </h2>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted">
            {t.methodText}
          </p>
          <ol className="grid grid-cols-2 gap-2.5">
            {t.cycle.map((c) => (
              <li key={c.n} className="rounded-xl bg-bg p-3">
                <span className="font-heading text-xs font-extrabold text-brand">
                  {c.n}
                </span>
                <span className="mt-0.5 block font-heading text-sm font-bold text-ink">
                  {c.t}
                </span>
                <span className="block text-xs leading-snug text-muted">
                  {c.d}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ok">
            <Check className="h-4 w-4" />
            {t.noPenalty}
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
    </OnboardingGate>
  );
}
