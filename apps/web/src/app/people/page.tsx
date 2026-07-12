"use client";

import AppShell from "@/components/AppShell";
import OnboardingGate from "@/components/OnboardingGate";
import { Check } from "@/components/Icons";
import { useUILang } from "@ie/core/prefs";
import { saveInterest, useLatestInterest } from "@ie/core/checkin";

// «Сообщество» на web — 1:1 по макету «Веб-приложение · СООБЩЕСТВО»: карта
// города с пинами-заглушкой (только город и район), рядом — клубы (встреча
// офлайн + клуб онлайн), внизу зелёная плашка про право на отказ. Клуб и
// встреча требуют бэкенда — заявка честно уходит в лист ожидания (MVP-A).

const UI = {
  ru: {
    kicker: (city: string) => `Сообщество · ${city}`,
    title: "Ты не один в этом городе",
    city: "твой город",
    mapBadge: "14 человек твоего уровня рядом",
    mapNote: "Показываем только город и район — и только тех, кто сам открылся. Точных адресов нет никогда.",
    mapSoon: "скоро",
    meetTitle: "Клубная встреча",
    meetGoing: "собираем",
    meetNote: "Суббота 11:00 · кофейня · «Small talk, который не болит»",
    meetCta: "Пойду",
    meetDone: "Записали — позовём, когда соберём встречу",
    clubTitle: "Клуб онлайн · вторник",
    clubSlots: "малые группы",
    clubNote: "Малые группы до 6 · модератор держит безопасный темп · можно просто слушать",
    clubCta: "Записаться",
    clubDone: "Заявка записана — позовём, когда соберём группу",
    privacy: "Отказаться можно без объяснений в любой момент — просто закрой профиль для соседей. Никто не увидит, что ты был открыт.",
  },
  en: {
    kicker: (city: string) => `Community · ${city}`,
    title: "You are not alone in this city",
    city: "your city",
    mapBadge: "14 people at your level nearby",
    mapNote: "We show only city and district — and only those who opened up themselves. Exact addresses, never.",
    mapSoon: "soon",
    meetTitle: "Club meetup",
    meetGoing: "forming",
    meetNote: "Saturday 11:00 · a café · “Small talk that doesn't hurt”",
    meetCta: "I'll come",
    meetDone: "Saved — we'll invite you when a meetup forms",
    clubTitle: "Online club · Tuesday",
    clubSlots: "small groups",
    clubNote: "Small groups up to 6 · a moderator keeps the pace safe · you can just listen",
    clubCta: "Sign up",
    clubDone: "Request saved — we'll invite you when a group forms",
    privacy: "You can opt out any time, no explanation — just close your profile to neighbours. No one will see that you were open.",
  },
} as const;

// Пины на карте — капли цветов навыков (петроль · мята · охра).
const PINS = [
  { left: "32%", top: "38%", color: "var(--sk-video)" },
  { left: "56%", top: "52%", color: "var(--accent)" },
  { left: "44%", top: "66%", color: "var(--sk-sounds)" },
];

export default function PeoplePage() {
  const ui = useUILang();
  const t = UI[ui];
  const interest = useLatestInterest();
  const city = t.city;

  return (
    <OnboardingGate>
      <AppShell>
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 pb-10 pt-7 lg:px-10">
          <p className="font-heading text-[13px] font-semibold text-muted/80">{t.kicker(city)}</p>
          <h1
            data-testid="people-title"
            className="mt-1 font-heading text-[26px] font-extrabold tracking-[-0.025em] text-ink lg:text-[30px]"
          >
            {t.title}
          </h1>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            {/* Карта города — заглушка с пинами (только район) */}
            <div className="overflow-hidden rounded-[18px] bg-surface shadow-card">
              <div
                className="relative h-[220px]"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, color-mix(in srgb, var(--line) 55%, var(--bg)) 0 14px, var(--bg) 14px 28px)",
                }}
              >
                {PINS.map((p, i) => (
                  <span
                    key={i}
                    className="absolute h-6 w-6"
                    style={{
                      left: p.left,
                      top: p.top,
                      background: p.color,
                      borderRadius: "50% 50% 50% 0",
                      transform: "rotate(-45deg)",
                      boxShadow: "0 6px 12px -4px rgba(60,40,15,.45)",
                    }}
                  />
                ))}
                <span className="absolute bottom-3.5 left-3.5 rounded-[10px] bg-surface/90 px-3 py-2 font-heading text-xs font-semibold text-ink">
                  {t.mapBadge}
                </span>
                <span className="absolute right-3.5 top-3.5 rounded-full bg-sun px-2.5 py-1 text-[10px] font-bold text-[#3b2c07]">
                  {t.mapSoon}
                </span>
              </div>
              <p className="px-5 py-4 text-[13px] leading-relaxed text-muted">{t.mapNote}</p>
            </div>

            {/* Клубы: встреча офлайн + клуб онлайн */}
            <div className="flex flex-col gap-3">
              <div className="rounded-[16px] bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-ink">{t.meetTitle}</span>
                  <span className="font-heading text-[11px] font-semibold text-accent-d">{t.meetGoing}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.meetNote}</p>
                {interest ? (
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-ok">
                    <Check className="h-4 w-4 flex-none" />
                    {t.meetDone}
                  </p>
                ) : (
                  <button
                    onClick={() => saveInterest({ format: "small-group", pace: "weekly" })}
                    data-testid="people-meet-join"
                    className="mt-3 rounded-[10px] bg-brand px-5 py-2.5 font-heading text-xs font-bold text-white transition-transform active:scale-[0.97]"
                  >
                    {t.meetCta}
                  </button>
                )}
              </div>

              <div className="rounded-[16px] bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-ink">{t.clubTitle}</span>
                  <span className="font-heading text-[11px] font-semibold" style={{ color: "var(--sk-sounds)" }}>
                    {t.clubSlots}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.clubNote}</p>
                {interest ? (
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-ok">
                    <Check className="h-4 w-4 flex-none" />
                    {t.clubDone}
                  </p>
                ) : (
                  <button
                    onClick={() => saveInterest({ format: "small-group", pace: "weekly" })}
                    data-testid="people-club-join"
                    className="mt-3 rounded-[10px] border border-line bg-surface px-5 py-2.5 font-heading text-xs font-bold text-muted transition-colors hover:text-ink"
                  >
                    {t.clubCta}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Плашка приватности — зелёная, как в макете */}
          <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-accent/10 px-5 py-4">
            <span className="h-2.5 w-2.5 flex-none rounded-full bg-accent" />
            <p className="text-[13.5px] leading-relaxed text-accent-d">{t.privacy}</p>
          </div>
        </main>
      </AppShell>
    </OnboardingGate>
  );
}
