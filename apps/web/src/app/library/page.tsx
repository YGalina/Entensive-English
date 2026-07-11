"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import OnboardingGate from "@/components/OnboardingGate";
import { Text, Play, Sound, Chat, Keyboard, ArrowRight } from "@/components/Icons";
import { useUILang } from "@ie/core/prefs";

// «Библиотека» — по 13_app_logic §4.2: один вход в контент и навыки.
// Чтение, видео/shadowing, звуки, времена, набор — внутри Библиотеки,
// не в главной навигации. Сетка B1–C1 с «% моего» и импортом — следующий шаг.

const UI = {
  ru: {
    title: "Библиотека",
    subtitle: "Контент, который тебе по силам",
    items: [
      { href: "/reading", title: "Читать", note: "тексты с переводом по тапу · замер скорости", Icon: Text, tone: "--sk-reading" },
      { href: "/video", title: "Видео · shadowing", note: "слушай → повторяй в тени голоса", Icon: Play, tone: "--sk-video" },
      { href: "/pronunciation", title: "Звуки", note: "лестница темпа: слушай → повтори → вместе", Icon: Sound, tone: "--sk-sounds" },
      { href: "/grammar", title: "Времена", note: "закон из фразы — и собери своё", Icon: Chat, tone: "--sk-grammar" },
      { href: "/typing", title: "Набор", note: "моторный канал: рука помнит слово", Icon: Keyboard, tone: "--sk-typing" },
    ],
    own: "Своё видео или статья — вставь ссылку внутри раздела, соберём урок.",
  },
  en: {
    title: "Library",
    subtitle: "Content that is within your reach",
    items: [
      { href: "/reading", title: "Read", note: "texts with tap-to-translate · speed check", Icon: Text, tone: "--sk-reading" },
      { href: "/video", title: "Video · shadowing", note: "listen → repeat in the shadow of a voice", Icon: Play, tone: "--sk-video" },
      { href: "/pronunciation", title: "Sounds", note: "tempo ladder: listen → repeat → together", Icon: Sound, tone: "--sk-sounds" },
      { href: "/grammar", title: "Tenses", note: "the law from a phrase — then build your own", Icon: Chat, tone: "--sk-grammar" },
      { href: "/typing", title: "Typing", note: "motor channel: the hand remembers the word", Icon: Keyboard, tone: "--sk-typing" },
    ],
    own: "Your own video or article — paste a link inside a section, we'll build a lesson.",
  },
} as const;

export default function LibraryPage() {
  const ui = useUILang();
  const t = UI[ui];

  return (
    <OnboardingGate>
      <AppShell>
        <main className="mx-auto w-full max-w-[560px] flex-1 px-5 pt-7 pb-6">
          <header className="mb-5">
            <h1 data-testid="library-title" className="font-heading text-3xl font-extrabold tracking-tight text-ink">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
          </header>

          <ul className="space-y-2.5">
            {t.items.map(({ href, title, note, Icon, tone }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3.5 rounded-card bg-surface p-4 shadow-card transition-transform active:scale-[0.98]"
                >
                  <span
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in srgb, var(${tone}) 14%, transparent)`,
                      color: `var(${tone})`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-base font-bold text-ink">{title}</span>
                    <span className="block text-xs leading-relaxed text-muted">{note}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-soft bg-brand-soft px-4 py-3 text-sm leading-relaxed text-brand-ink">
            {t.own}
          </p>
        </main>
      </AppShell>
    </OnboardingGate>
  );
}
