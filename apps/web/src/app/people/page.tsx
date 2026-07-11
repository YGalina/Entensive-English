"use client";

import BottomNav from "@/components/BottomNav";
import OnboardingGate from "@/components/OnboardingGate";
import { People, Check } from "@/components/Icons";
import { useUILang } from "@ie/core/prefs";
import { saveInterest, useLatestInterest } from "@ie/core/checkin";

// «Люди» — по 13_app_logic §4.4: язык живёт между людьми. Клуб и «Кто рядом»
// требуют бэкенда — здесь честные заглушки с проговорённой приватностью и
// живая заявка в малую группу (лист ожидания = замер спроса, MVP-A).

const UI = {
  ru: {
    title: "Люди",
    subtitle: "Ты не один в этом городе",
    club: "Разговорный клуб онлайн",
    clubNote:
      "Малые группы до 6 человек, модератор держит безопасный темп. Ошибки приветствуются, можно просто слушать, выйти — без объяснений.",
    clubCta: "Хочу в группу — запишите меня",
    clubDone: "Заявка записана. Позовём, когда соберём группу.",
    near: "Кто рядом",
    nearNote:
      "Соседи твоего уровня в твоём городе. Покажем только город и район — и только тех, кто сам открылся. Отказ без объяснений.",
    soon: "скоро",
  },
  en: {
    title: "People",
    subtitle: "You are not alone in this city",
    club: "Online speaking club",
    clubNote:
      "Small groups of up to 6, a moderator keeps the pace safe. Mistakes are welcome, you can just listen, leaving needs no explanation.",
    clubCta: "I want to join — sign me up",
    clubDone: "Request saved. We'll invite you when a group forms.",
    near: "Who's nearby",
    nearNote:
      "Neighbours at your level in your city. Only city and district are shown — and only those who opened up themselves. Refusal needs no explanation.",
    soon: "soon",
  },
} as const;

export default function PeoplePage() {
  const ui = useUILang();
  const t = UI[ui];
  const interest = useLatestInterest();

  return (
    <OnboardingGate>
      <div className="flex min-h-dvh flex-col">
        <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
          <header className="mb-5">
            <h1 data-testid="people-title" className="font-heading text-3xl font-extrabold tracking-tight text-ink">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
          </header>

          {/* Клуб: заявка = честный замер спроса, никакого фейкового расписания */}
          <section className="rounded-card bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-d">
                <People className="h-5 w-5" />
              </span>
              <h2 className="font-heading text-lg font-bold text-ink">{t.club}</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.clubNote}</p>
            {interest ? (
              <p className="mt-4 flex items-center gap-2 rounded-soft bg-ok/10 px-4 py-3 text-sm font-semibold text-ok">
                <Check className="h-4 w-4 flex-shrink-0" />
                {t.clubDone}
              </p>
            ) : (
              <button
                onClick={() => saveInterest({ format: "small-group", pace: "weekly" })}
                data-testid="people-club-join"
                className="mt-4 flex w-full items-center justify-center rounded-full bg-brand px-5 py-3.5 font-heading text-sm font-extrabold text-white transition-transform active:scale-[0.98]"
              >
                {t.clubCta}
              </button>
            )}
          </section>

          {/* Кто рядом: приватность проговорена прямо в заглушке */}
          <section className="mt-3 rounded-card border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">{t.near}</h2>
              <span className="rounded-full bg-sun px-2.5 py-1 text-[10px] font-bold text-[#3b2c07]">
                {t.soon}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.nearNote}</p>
          </section>
        </main>
        <BottomNav />
      </div>
    </OnboardingGate>
  );
}
