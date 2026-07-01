"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Sound, Spark } from "@/components/Icons";
import { speakEnglish } from "@/lib/speech";
import { useActivityTimer } from "@/lib/timelog";
import { useUILang } from "@/lib/prefs";
import { GRAMMAR, assemble } from "@/data/grammar";

const UI = {
  ru: {
    title: "Грамматика в речи",
    intro: "Не зубри таблицы — собирай готовые фразы и проговаривай вслух.",
    when: "Когда",
    formula: "Формула",
    markers: "Маркеры",
    models: "Модели — послушай и повтори",
    build: "Собери фразу",
    buildHint: "Нажми слово → услышишь фразу → повтори вслух.",
  },
  en: {
    title: "Grammar in speech",
    intro: "Don't cram tables — build ready phrases and say them aloud.",
    when: "When",
    formula: "Formula",
    markers: "Markers",
    models: "Models — listen and repeat",
    build: "Build a phrase",
    buildHint: "Tap a word → hear the phrase → repeat aloud.",
  },
} as const;

export default function Grammar() {
  useActivityTimer("grammar");
  const ui = useUILang();
  const t = UI[ui];
  const [ti, setTi] = useState(0);
  const [fi, setFi] = useState(0);

  const pat = GRAMMAR[ti];
  const fill = pat.fills[fi];
  const builtEn = assemble(pat.frame.en, fill.en);
  const builtRu = assemble(pat.frame.ru, fill.ru);

  function pickTense(idx: number) {
    setTi(idx);
    setFi(0);
  }

  function pickFill(idx: number) {
    setFi(idx);
    speakEnglish(assemble(pat.frame.en, pat.fills[idx].en), { interrupt: true });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Шапка + выбор времени (липкая) */}
      <div className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[480px] px-5 pt-7 pb-3">
          <h1
            data-testid="grammar-title"
            className="font-heading text-2xl font-extrabold text-ink"
          >
            {t.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Spark className="h-4 w-4 text-brand" />
            {t.intro}
          </p>
          <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {GRAMMAR.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => pickTense(idx)}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                  idx === ti
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-ink"
                }`}
              >
                {ui === "en" ? p.tense : p.tenseRu}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-4 pb-6">
        {/* Установка */}
        <section className="rounded-card border border-line bg-surface p-4">
          <h2 className="font-heading text-lg font-extrabold text-ink">
            {pat.tense}
            <span className="ml-2 text-sm font-semibold text-muted">{pat.tenseRu}</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">{pat.cue}</p>
          <div className="mt-3 space-y-1.5">
            <Row label={t.formula} value={pat.formula} />
            <Row label={t.markers} value={pat.markers} />
          </div>
        </section>

        {/* Модели */}
        <section className="mt-5">
          <h3 className="mb-2 font-heading text-sm font-bold text-ink">{t.models}</h3>
          <ul className="space-y-2">
            {pat.examples.map((ex, i) => (
              <li key={i}>
                <button
                  onClick={() => speakEnglish(ex.en, { interrupt: true })}
                  className="flex w-full items-start gap-3 rounded-soft border border-line bg-surface p-3 text-left transition-colors hover:border-brand/40"
                >
                  <Sound className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  <span className="flex-1">
                    <span className="block font-heading text-base font-bold text-accent">
                      {ex.en}
                    </span>
                    <span className="block text-sm text-muted">{ex.ru}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Конструктор */}
        <section className="mt-6 rounded-card border border-line bg-surface p-4 shadow-card">
          <h3 className="font-heading text-sm font-bold text-ink">{t.build}</h3>
          <p className="mt-0.5 mb-3 text-xs text-muted">{t.buildHint}</p>

          {/* Собранная фраза */}
          <div className="rounded-card bg-brand-soft p-4 text-center">
            <button
              onClick={() => speakEnglish(builtEn, { interrupt: true })}
              aria-label="Послушать"
              className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"
            >
              <Sound className="h-4 w-4" />
            </button>
            <p className="font-heading text-[22px] font-extrabold leading-snug text-accent">
              {builtEn}
            </p>
            <p className="mt-1 text-sm text-brand-ink/80">{builtRu}</p>
          </div>

          {/* Подстановки */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pat.fills.map((f, idx) => (
              <button
                key={idx}
                data-testid="grammar-fill"
                onClick={() => pickFill(idx)}
                className={`rounded-lg border px-2.5 py-1 text-sm transition-colors ${
                  idx === fi
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-bg text-ink hover:border-brand/40"
                }`}
              >
                {f.en}
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="flex-shrink-0 font-heading text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
