"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Sound, Check, Layers } from "@/components/Icons";
import { useSrsStats, dueCards, recordAnswer, vocabEntries, type VocabState } from "@ie/core/srs";
import { useActivityTimer } from "@ie/core/timelog";
import { speakEnglish } from "@ie/media/speech";
import { findWord, translate } from "@ie/core/data/packs";
import { useNativeLang, useUILang } from "@ie/core/prefs";
import { LANG_DIR } from "@ie/core/data/catalog";

const STATUS: Record<VocabState, { key: "new" | "learn" | "fixed" }> = {
  new: { key: "new" },
  recog: { key: "learn" },
  mine: { key: "fixed" },
};

const UI = {
  ru: {
    kicker: (n: number) => `Мой словарь · ${n} слов`,
    title: "Слова, которые ты встретила",
    review: (n: number) => `Повторить ${n} карточек`,
    reviewShort: (n: number) => `Повторить ${n}`,
    legend: { new: "новое", learn: "учу", fixed: "закреплено" },
    colWord: "Слово",
    colTr: "Перевод",
    colSrc: "Из контента",
    colStatus: "Статус",
    src: "поток слов",
    recallNote: "Повтор — через припоминание: сначала достаёшь слово из памяти сам, потом мягкая сверка. Интервалы возвращают слово ровно к моменту забывания.",
    railToday: "На сегодня",
    railWaiting: "карточек ждут",
    railMinutes: (m: number) => `≈ ${m} ${m % 10 === 1 && m % 100 !== 11 ? "минута" : m % 10 >= 2 && m % 10 <= 4 && (m % 100 < 10 || m % 100 >= 20) ? "минуты" : "минут"} · без спешки`,
    railStart: "Начать повтор",
    railBreakdown: "Расклад",
    railNew: "Новое",
    railLearn: "Учу",
    railFixed: "Закреплено",
    railNote: "Слово попадает сюда только когда ты сама тапнула перевод в контенте — свой словарь, не чужой список.",
    emptyTitle: "Здесь копятся твои слова",
    emptyNote: "Пока пусто — так и должно быть в первый день. Слово попадает сюда, когда тапаешь перевод в контенте.",
    emptyCta: "Начать сессию дня",
  },
  en: {
    kicker: (n: number) => `My vocabulary · ${n} words`,
    title: "Words you have met",
    review: (n: number) => `Review ${n} cards`,
    reviewShort: (n: number) => `Review ${n}`,
    legend: { new: "new", learn: "learning", fixed: "fixed" },
    colWord: "Word",
    colTr: "Translation",
    colSrc: "From content",
    colStatus: "Status",
    src: "word flow",
    recallNote: "Reviews go through recall: you first retrieve the word from memory, then get a gentle check. Intervals return the word right when it's about to be forgotten.",
    railToday: "For today",
    railWaiting: "cards waiting",
    railMinutes: (m: number) => `≈ ${m} min · no rush`,
    railStart: "Start review",
    railBreakdown: "Breakdown",
    railNew: "New",
    railLearn: "Learning",
    railFixed: "Fixed",
    railNote: "A word lands here only when you tapped its translation in content — your vocabulary, not someone else's list.",
    emptyTitle: "Your words gather here",
    emptyNote: "Empty for now — as it should be on day one. A word lands here when you tap its translation in content.",
    emptyCta: "Start today’s session",
  },
} as const;

// Цвет статуса. Охра навыка «слух» задаётся inline var() — arbitrary-класс
// bg-[--sk-sounds] в Tailwind v4 не применяется.
const STATUS_STYLE: Record<"new" | "learn" | "fixed", { color: string; chip: string }> = {
  new: { color: "var(--brand)", chip: "color-mix(in srgb, var(--brand) 10%, transparent)" },
  learn: { color: "var(--sk-sounds)", chip: "color-mix(in srgb, var(--sk-sounds) 12%, transparent)" },
  fixed: { color: "var(--accent-d)", chip: "color-mix(in srgb, var(--accent) 12%, transparent)" },
};

export default function Vocab() {
  const stats = useSrsStats();
  const [review, setReview] = useState(false);
  const ui = useUILang();
  const lang = useNativeLang();
  const t = UI[ui];

  const entries = useMemo(() => vocabEntries().sort((a, b) => b.touchedAt - a.touchedAt), []);
  const counts = useMemo(() => {
    const c = { new: 0, learn: 0, fixed: 0 };
    for (const e of entries) c[STATUS[e.state].key]++;
    return c;
  }, [entries]);

  if (review) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-[560px] flex-1 px-5 pt-7 pb-6">
          <Review onExit={() => setReview(false)} />
        </main>
      </AppShell>
    );
  }

  const dueMin = Math.max(1, Math.round(stats.dueToday * 0.6));

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1180px] flex-1">
        {/* Главная колонка: таблица слов */}
        <main className="min-w-0 flex-1 px-5 pb-10 pt-7 lg:px-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-[13px] font-semibold text-muted/80">
                {t.kicker(entries.length)}
              </p>
              <h1 className="mt-1 font-heading text-[26px] font-extrabold tracking-[-0.025em] text-ink lg:text-[30px]">
                {t.title}
              </h1>
            </div>
            {stats.dueToday > 0 && (
              <button
                onClick={() => setReview(true)}
                data-testid="vocab-review-start"
                style={{ background: "var(--sk-sounds)" }}
                className="flex-none rounded-xl px-5 py-3 font-heading text-[13px] font-bold text-white shadow-[0_12px_26px_-12px_rgba(217,154,43,.55)] transition-transform active:scale-[0.98] sm:px-6 sm:text-sm"
              >
                <span className="hidden sm:inline">{t.review(stats.dueToday)}</span>
                <span className="sm:hidden">{t.reviewShort(stats.dueToday)}</span>
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="mt-8">
              <EmptyHint title={t.emptyTitle} note={t.emptyNote} />
              <Link
                href="/session/health"
                className="mx-auto mt-4 flex max-w-[360px] items-center justify-center rounded-2xl bg-brand px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--brand)] transition-transform active:scale-[0.98]"
              >
                {t.emptyCta}
              </Link>
            </div>
          ) : (
            <>
              {/* Легенда статусов */}
              <div className="mt-5 flex flex-wrap gap-4 font-heading text-xs font-semibold">
                <span className="text-brand">■ {t.legend.new}</span>
                <span style={{ color: "var(--sk-sounds)" }}>■ {t.legend.learn}</span>
                <span className="text-accent-d">■ {t.legend.fixed}</span>
              </div>

              {/* Таблица */}
              <div className="mt-4 overflow-hidden rounded-[18px] bg-surface shadow-card">
                <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr] gap-0 border-b border-line px-5 py-3.5 font-heading text-[11px] font-semibold uppercase tracking-wide text-muted/80">
                  <span>{t.colWord}</span>
                  <span>{t.colTr}</span>
                  <span className="hidden sm:block">{t.colSrc}</span>
                  <span>{t.colStatus}</span>
                </div>
                {entries.slice(0, 100).map((e) => {
                  const word = findWord(e.en);
                  const tr = word ? translate(word, lang).text : "";
                  const st = STATUS[e.state].key;
                  const stStyle = STATUS_STYLE[st];
                  return (
                    <div
                      key={e.en}
                      className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr] items-center border-b border-line/60 px-5 py-4 last:border-0"
                    >
                      <button
                        onClick={() => speakEnglish(e.en, { interrupt: true })}
                        className="text-left font-english text-lg text-ink hover:text-brand"
                        title="Прослушать"
                      >
                        {e.en}
                      </button>
                      <span
                        dir={word ? LANG_DIR[lang] : "ltr"}
                        className="pr-2 font-body text-sm text-muted"
                      >
                        {tr}
                      </span>
                      <span className="hidden text-[12.5px] text-muted/70 sm:block">{t.src}</span>
                      <span>
                        <span
                          className="rounded-lg px-2.5 py-1 font-heading text-[11px] font-semibold"
                          style={{ color: stStyle.color, background: stStyle.chip }}
                        >
                          {t.legend[st]}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3.5 text-[12.5px] leading-relaxed text-muted/80">{t.recallNote}</p>

              {/* На узких экранах рейка складывается вниз */}
              <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 lg:hidden">
                <Rail t={t} stats={stats} counts={counts} dueMin={dueMin} onReview={() => setReview(true)} />
              </div>
            </>
          )}
        </main>

        {/* Правая рейка: очередь SRS + расклад */}
        {entries.length > 0 && (
          <aside className="sticky top-0 hidden h-dvh w-[320px] flex-none flex-col gap-4 border-l border-line bg-surface px-6 py-7 lg:flex">
            <Rail t={t} stats={stats} counts={counts} dueMin={dueMin} onReview={() => setReview(true)} />
          </aside>
        )}
      </div>
    </AppShell>
  );
}

/* ---------- Правая рейка: «На сегодня» + «Расклад» ---------- */
function Rail({
  t,
  stats,
  counts,
  dueMin,
  onReview,
}: {
  t: (typeof UI)["ru"] | (typeof UI)["en"];
  stats: ReturnType<typeof useSrsStats>;
  counts: { new: number; learn: number; fixed: number };
  dueMin: number;
  onReview: () => void;
}) {
  return (
    <>
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.06em] text-muted/80">
        {t.railToday}
      </p>
      <div className="rounded-[16px] bg-warn-soft px-5 py-5">
        <p className="tnum font-heading text-3xl font-bold tracking-tight" style={{ color: "var(--sk-sounds)" }}>
          {stats.dueToday}
        </p>
        <p className="mt-0.5 font-heading text-sm font-semibold text-ink">{t.railWaiting}</p>
        <p className="mt-0.5 text-xs text-muted">{t.railMinutes(dueMin)}</p>
        {stats.dueToday > 0 && (
          <button
            onClick={onReview}
            style={{ background: "var(--sk-sounds)" }}
            className="mt-3.5 w-full rounded-xl py-3 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]"
          >
            {t.railStart}
          </button>
        )}
      </div>

      <div className="rounded-[16px] bg-bg px-5 py-4">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.05em] text-muted/80">
          {t.railBreakdown}
        </p>
        <Row label={t.railNew} n={counts.new} color="var(--brand)" />
        <Row label={t.railLearn} n={counts.learn} color="var(--sk-sounds)" />
        <Row label={t.railFixed} n={counts.fixed} color="var(--accent-d)" />
      </div>

      <div className="flex-1" />
      <p className="rounded-[14px] bg-accent/10 px-4 py-4 text-[13px] leading-relaxed text-accent-d">
        {t.railNote}
      </p>
    </>
  );
}

function Row({ label, n, color }: { label: string; n: number; color: string }) {
  return (
    <div className="mt-2.5 flex justify-between font-body text-sm text-ink">
      <span>{label}</span>
      <span className="font-heading font-bold" style={{ color }}>{n}</span>
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
