"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Sound, Check, Layers, Play } from "@/components/Icons";
import { useSrsStats, dueCards, recordAnswer } from "@ie/core/srs";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@/lib/speech";
import { findWord, translate } from "@ie/core/data/packs";
import { LEVEL_PACKS } from "@ie/core/data/levelVocab";
import { useNativeLang, useUILang } from "@ie/core/prefs";
import { LANG_DIR } from "@ie/core/data/catalog";

const UI = {
  ru: {
    title: "Словарь",
    intro: "Система сама планирует повторы — узнавание закрепляется за 2–3 прохода.",
    inWork: "в работе",
    learned: "усвоено",
    due: "к повтору",
    emptyTitle: "Пока пусто",
    emptyNote: "Пройди сеанс на «Сегодня» — слова попадут сюда и встанут в план повторов.",
    review: (n: number) => `Повторить ${n}`,
    allDoneTitle: "На сегодня всё",
    allDoneNote: "Повторов нет — система покажет слова, когда придёт срок. Можно пройти новую пачку.",
    levelSets: "Наборы по уровням",
    levelNote: "Большие частотные списки. Киносеанс грузит массив, узнавание ставит слова в план повторов.",
    words: "слов",
    session: "киносеанс + узнавание",
  },
  en: {
    title: "Words",
    intro: "The system schedules reviews automatically: recognition settles after 2–3 passes.",
    inWork: "active",
    learned: "learned",
    due: "due",
    emptyTitle: "Nothing here yet",
    emptyNote: "Complete a Today session — words will appear here and enter the review plan.",
    review: (n: number) => `Review ${n}`,
    allDoneTitle: "All done today",
    allDoneNote: "No reviews are due. The system will show words when it is time, or you can start a new pack.",
    levelSets: "Level word sets",
    levelNote: "Large frequency lists. Exposure loads the array; recognition puts words into spaced review.",
    words: "words",
    session: "exposure + recognition",
  },
} as const;

export default function Vocab() {
  const stats = useSrsStats();
  const [review, setReview] = useState(false);
  const ui = useUILang();
  const t = UI[ui];

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        {!review ? (
          <>
            <h1 className="font-heading text-2xl font-extrabold text-ink">{t.title}</h1>
            <p className="mt-1 mb-5 text-sm text-muted">
              {t.intro}
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <Stat n={stats.total} label={t.inWork} />
              <Stat n={stats.learned} label={t.learned} tone="ok" />
              <Stat n={stats.dueToday} label={t.due} tone="accent" />
            </div>

            {stats.total === 0 ? (
              <EmptyHint
                title={t.emptyTitle}
                note={t.emptyNote}
              />
            ) : stats.dueToday > 0 ? (
              <button
                onClick={() => setReview(true)}
                data-testid="vocab-review-start"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
              >
                {t.review(stats.dueToday)}
              </button>
            ) : (
              <EmptyHint
                title={t.allDoneTitle}
                note={t.allDoneNote}
              />
            )}

            {/* Наборы по уровням — массивный ввод киносеансом */}
            <section className="mt-8">
              <h2 className="mb-1 font-heading text-base font-bold text-ink">
                {t.levelSets}
              </h2>
              <p className="mb-3 text-xs text-muted">
                {t.levelNote}
              </p>
              <ul className="space-y-2.5">
                {LEVEL_PACKS.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/session/${p.id}`}
                      className="flex items-center gap-3 rounded-soft border border-line bg-surface p-3.5 transition-colors hover:border-brand/40"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft font-heading text-xs font-extrabold text-brand-d">
                        {p.title.replace("Словарь ", "")}
                      </span>
                      <span className="flex-1">
                        <span className="block font-heading text-sm font-bold text-ink">
                          {p.title}
                        </span>
                        <span className="block text-xs text-muted">
                          {p.words.length} {t.words} · {t.session}
                        </span>
                      </span>
                      <Play className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <Review onExit={() => setReview(false)} />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone?: "ok" | "accent" }) {
  const color = tone === "ok" ? "text-ok" : tone === "accent" ? "text-accent-d" : "text-brand";
  return (
    <div className="rounded-card bg-surface p-4 text-center shadow-card">
      <p className={`tnum font-heading text-2xl font-extrabold ${color}`}>{n}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function EmptyHint({ title, note }: { title: string; note: string }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-card border border-line bg-surface p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Layers className="h-6 w-6" />
      </span>
      <p className="mt-3 font-heading text-base font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-[280px] text-sm leading-relaxed text-muted">{note}</p>
    </div>
  );
}

function Review({ onExit }: { onExit: () => void }) {
  const lang = useNativeLang();
  useActivityTimer("review");
  // Снимок очереди фиксируем один раз на старте сессии повторов.
  const [queue] = useState(() => dueCards());
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);

  const card = queue[i];
  const word = card ? findWord(card.en) : undefined;
  const tr = word ? translate(word, lang) : null;

  if (!card || !word) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ok/15 text-ok">
          <Check className="h-9 w-9" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold text-ink">Повтор завершён</h2>
        <p className="mt-2 max-w-[300px] text-sm text-muted">
          Узнано {known} из {queue.length}. Остальные вернутся в плане раньше.
        </p>
        <button
          onClick={onExit}
          data-testid="review-done"
          className="mt-6 rounded-2xl bg-accent px-6 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
        >
          Готово
        </button>
      </div>
    );
  }

  function answer(yes: boolean) {
    recordAnswer(card.packId, card.en, yes);
    if (yes) setKnown((k) => k + 1);
    setRevealed(false);
    setI((p) => p + 1);
  }

  return (
    <div data-testid="review-active" className="flex min-h-[70dvh] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">Повтор</span>
        <span className="tnum font-heading text-sm font-bold text-ink">
          {i + 1} / {queue.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card">
        <div className="font-heading text-[34px] font-extrabold leading-none text-accent">
          {word.en}
        </div>
        <button
          onClick={() => speakEnglish(word.en, { interrupt: true })}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted"
        >
          <Sound className="h-4 w-4" /> {word.ipa}
        </button>
        <div className="mt-5 min-h-[84px]">
          {revealed && tr ? (
            <div>
              <div
                dir={tr.isDef ? "ltr" : LANG_DIR[lang]}
                className="max-w-full break-words font-heading text-[32px] font-extrabold leading-tight text-ink"
              >
                {tr.text}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Без звука: {word.ipa}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              data-testid="review-reveal"
              className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
            >
              показать перевод
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => answer(false)}
          data-testid="review-unknown"
          className="rounded-2xl border border-line bg-surface px-4 py-4 font-heading text-sm font-bold text-muted"
        >
          Ещё не всплыло
        </button>
        <button
          onClick={() => answer(true)}
          data-testid="review-known"
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-4 font-heading text-sm font-bold text-white"
        >
          <Check className="h-5 w-5" /> Знаю
        </button>
      </div>
    </div>
  );
}
