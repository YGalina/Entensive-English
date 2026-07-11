"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingGate from "@/components/OnboardingGate";
import { Play, Check } from "@/components/Icons";
import { useNativeLang, useUILang } from "@ie/core/prefs";
import { translate } from "@ie/core/data/packs";
import { useDayPlan } from "@ie/core/dayplan";
import { useSrsStats } from "@ie/core/srs";
import { useOutputStats } from "@ie/core/output";
import { useTimeStats } from "@ie/core/timelog";
import { getPack } from "@ie/core/data/packs";

import { getLevelPack } from "@ie/core/data/levelVocab";

// «Сегодня» — 1:1 по макету «Веб-приложение · РАБОЧИЙ СТОЛ»: сайдбар (в
// AppShell), в центре приветствие + карточка «Сессия дня» с полосками фаз и
// единственным терракотовым CTA + карточки SRS и клуба; справа рейка —
// честные часы столбиками, слово дня, вечерний круг «ждёт свет лампы».

const WEEKDAYS_RU = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_GEN_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_NOM_RU = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const UI = {
  ru: {
    morning: "Доброе утро, Галина!",
    day: "Добрый день, Галина!",
    eveningGreet: "Добрый вечер, Галина!",
    sessionLabel: (m: number) => `Сессия дня · ${m} мин`,
    sessionTitle: "Твои слова дня —\nв потоке и в твоей речи",
    sessionDoneTitle: "Сессия закрыта —\nдень начат",
    sessionNote: "Поток слов · контекст · узнавание · сказать своё",
    start: "Начать",
    again: "Ещё круг",
    srsTitle: "Пора вернуть слова",
    srsNote: (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "карточка ждёт" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "карточки ждут" : "карточек ждут"} · ~${Math.max(1, Math.round(n * 0.6))} мин`,
    vocabTitle: "Мой словарь",
    vocabNote: "твои слова из практики",
    clubTitle: "Разговорный клуб",
    clubNote: "малые группы — собираем сейчас",
    hoursLabel: (month: string) => `Честные часы · ${month}`,
    hoursNote: "Пустой день — тихий столбик. Пауза, не потеря.",
    wordLabel: "Слово дня",
    circleTitle: "Вечерний круг",
    circleWait: "откроется после 20:00",
    circleOpen: "открыт — закрой день",
    circleDone: "день закрыт · твоя запись на месте",
  },
  en: {
    morning: "Good morning, Galina!",
    day: "Good afternoon, Galina!",
    eveningGreet: "Good evening, Galina!",
    sessionLabel: (m: number) => `Today’s session · ${m} min`,
    sessionTitle: "Your words of the day —\nin the flow and in your speech",
    sessionDoneTitle: "Session closed —\nthe day has begun",
    sessionNote: "Word flow · context · recognition · say your own",
    start: "Start",
    again: "One more round",
    srsTitle: "Time to bring words back",
    srsNote: (n: number) => `${n} card${n === 1 ? "" : "s"} waiting · ~${Math.max(1, Math.round(n * 0.6))} min`,
    vocabTitle: "My vocabulary",
    vocabNote: "your words from practice",
    clubTitle: "Speaking club",
    clubNote: "small groups — forming now",
    hoursLabel: (month: string) => `Honest hours · ${month}`,
    hoursNote: "An empty day is a quiet bar. A pause, not a loss.",
    wordLabel: "Word of the day",
    circleTitle: "Evening circle",
    circleWait: "opens after 20:00",
    circleOpen: "open — close your day",
    circleDone: "day closed · your record is safe",
  },
} as const;

function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Правая рейка макета: честные часы · слово дня · вечерний круг. */
function Rail({ t, ui }: { t: (typeof UI)["ru"] | (typeof UI)["en"]; ui: "ru" | "en" }) {
  const time = useTimeStats();
  const out = useOutputStats();
  const plan = useDayPlan();
  const nativeLang = useNativeLang();
  const now = new Date();
  const hour = now.getHours();

  const monthName = ui === "en" ? MONTHS_EN[now.getMonth()] : MONTHS_NOM_RU[now.getMonth()];
  const monthPrefix = dayKey(now).slice(0, 7);
  const monthSec = Object.entries(time.byDay)
    .filter(([d]) => d.startsWith(monthPrefix))
    .reduce((s, [, v]) => s + v, 0);
  const monthH = Math.floor(monthSec / 3600);
  const monthM = Math.round((monthSec % 3600) / 60);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return time.byDay[dayKey(d)] ?? 0;
  });
  const weekMax = Math.max(...week, 60);

  // Слово дня — первое слово пачки сегодняшней сессии.
  const sessionHref = plan.steps.find((s) => s.id === "session")?.href ?? "/session/health";
  const packId = sessionHref.split("/").pop() ?? "health";
  const pack = getPack(packId) ?? getLevelPack(packId);
  const word = pack?.words[0];

  return (
    <>
      {/* Честные часы — столбики недели, пустой день тихий */}
      <div>
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.06em] text-muted/80">
          {t.hoursLabel(monthName)}
        </p>
        <p className="tnum mt-1.5 font-heading text-3xl font-bold tracking-tight text-ink">
          {monthH > 0 ? `${monthH} ч ${String(monthM).padStart(2, "0")}` : `${monthM} мин`}
        </p>
        <div className="mt-3.5 flex h-14 items-end gap-1.5">
          {week.map((sec, i) => {
            const pct = sec > 0 ? Math.max(18, Math.round((sec / weekMax) * 100)) : 14;
            return (
              <span
                key={i}
                className={`flex-1 rounded ${sec > 0 ? "bg-brand" : "bg-line"}`}
                style={{ height: `${pct}%` }}
              />
            );
          })}
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted/70">{t.hoursNote}</p>
      </div>

      {/* Слово дня */}
      {word && (
        <div className="border-t border-line pt-4">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.06em] text-muted/80">
            {t.wordLabel}
          </p>
          <div className="mt-2.5 rounded-[14px] bg-bg px-4.5 py-4">
            <p className="font-english text-2xl font-medium text-ink">{word.en}</p>
            <p className="mt-0.5 font-heading text-sm font-medium text-brand">
              {translate(word, nativeLang).text}
            </p>
            {word.exEn && (
              <p className="mt-2 font-english text-[13px] italic leading-relaxed text-muted">
                “{word.exEn}”
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Вечерний круг — «ждёт свет лампы» */}
      <Link
        href="/evening"
        className="flex items-center gap-3 rounded-[14px] bg-[#211D16] px-4.5 py-4 transition-transform active:scale-[0.98]"
      >
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-[#e8b36a] font-heading text-[15px] font-bold text-[#2a2214]">
          ☾
        </span>
        <span>
          <span className="block font-heading text-[13px] font-semibold text-[#f5efe2]">
            {t.circleTitle}
          </span>
          <span className="block text-[11px] text-[#9c937d]">
            {out.statusToday ? t.circleDone : hour >= 20 ? t.circleOpen : t.circleWait}
          </span>
        </span>
      </Link>
    </>
  );
}

export default function Today() {
  const ui = useUILang();
  const t = UI[ui];
  const plan = useDayPlan();
  const srs = useSrsStats();

  const sessionStep = plan.steps.find((s) => s.id === "session") ?? null;
  const sessionDone = sessionStep?.done ?? false;
  const sessionHref = sessionStep?.href ?? "/session/health";
  const due = srs.produceDue + srs.dueToday;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? t.morning : hour < 17 ? t.day : t.eveningGreet;
  const dateLine =
    ui === "en"
      ? `${WEEKDAYS_EN[now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`
      : `${WEEKDAYS_RU[now.getDay()]}, ${now.getDate()} ${MONTHS_GEN_RU[now.getMonth()]}`;

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto flex w-full max-w-[1180px] flex-1">
          {/* Центр */}
          <main className="min-w-0 flex-1 px-5 pb-8 pt-7 lg:px-9">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-[13px] font-semibold text-muted/80">{dateLine}</p>
                <h1
                  data-testid="home-greeting"
                  className="mt-1 font-heading text-[28px] font-extrabold leading-[1.14] tracking-[-0.025em] text-ink lg:text-[30px]"
                >
                  {greeting}
                </h1>
              </div>
              <ThemeToggle />
            </div>

            {/* СЕССИЯ ДНЯ — единственный яркий CTA (макет: рамка, полоски фаз) */}
            <section className="mt-6 rounded-[22px] border-2 border-brand bg-surface p-6 shadow-[0_22px_44px_-26px_rgba(232,98,61,.5)] lg:p-7">
              <div className="lg:flex lg:items-end lg:justify-between lg:gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                    <span className="font-heading text-xs font-semibold uppercase tracking-[0.07em] text-brand">
                      {t.sessionLabel(sessionStep?.goalMin ?? 15)}
                    </span>
                  </div>
                  <h2 className="mt-3 whitespace-pre-line font-heading text-[24px] font-bold leading-[1.16] tracking-[-0.02em] text-ink lg:text-[26px]">
                    {sessionDone ? t.sessionDoneTitle : t.sessionTitle}
                  </h2>
                  <div className="mt-4 flex max-w-[360px] gap-1.5">
                    {["--brand", "--accent", "--sk-sounds", "--sk-video"].map((v) => (
                      <span
                        key={v}
                        className="h-1.5 flex-1 rounded-md"
                        style={{ background: `var(${v})` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2.5 text-[13px] text-muted/85">{t.sessionNote}</p>
                </div>
                <Link
                  href={sessionHref}
                  data-testid="home-start-session"
                  className={`mt-5 flex items-center justify-center gap-2 rounded-[14px] px-10 py-4 font-heading text-base font-bold transition-transform active:scale-[0.98] lg:mt-0 lg:flex-none ${
                    sessionDone
                      ? "border border-line bg-surface text-ink"
                      : "bg-brand text-white shadow-[0_14px_28px_-10px_rgba(232,98,61,.55)]"
                  }`}
                >
                  {sessionDone ? <Check className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {sessionDone ? t.again : t.start}
                </Link>
              </div>
            </section>

            {/* SRS + клуб — две карточки, как в макете */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link
                href="/vocab"
                className="flex items-center gap-3.5 rounded-[18px] bg-warn-soft px-5 py-5 transition-transform active:scale-[0.98]"
              >
                <span
                  className="tnum flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[13px] font-heading text-[19px] font-bold text-white"
                  style={{ background: "var(--sk-sounds)" }}
                >
                  {due > 0 ? due : "Aa"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-base font-bold text-ink">
                    {due > 0 ? t.srsTitle : t.vocabTitle}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted/85">
                    {due > 0 ? t.srsNote(due) : t.vocabNote}
                  </span>
                </span>
                <span className="font-heading text-[22px] font-bold" style={{ color: "var(--sk-sounds)" }}>›</span>
              </Link>
              <Link
                href="/people"
                className="flex items-center gap-3.5 rounded-[18px] bg-surface px-5 py-5 shadow-card transition-transform active:scale-[0.98]"
              >
                <span
                  className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[13px] font-heading text-[17px] font-bold"
                  style={{
                    background: "color-mix(in srgb, var(--sk-video) 14%, transparent)",
                    color: "var(--sk-video)",
                  }}
                >
                  ▶
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-base font-bold text-ink">{t.clubTitle}</span>
                  <span className="mt-0.5 block text-[13px] text-muted/85">{t.clubNote}</span>
                </span>
                <span className="font-heading text-[22px] font-bold" style={{ color: "var(--sk-video)" }}>›</span>
              </Link>
            </div>

            {/* На узких экранах рейка складывается под основную колонку */}
            <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 lg:hidden">
              <Rail t={t} ui={ui} />
            </div>
          </main>

          {/* Правая рейка — как в макете: 300px, белая, тонкая линия */}
          <aside className="sticky top-0 hidden h-dvh w-[300px] flex-none flex-col gap-4 border-l border-line bg-surface px-6 py-7 lg:flex">
            <Rail t={t} ui={ui} />
          </aside>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}
