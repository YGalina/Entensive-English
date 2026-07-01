"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Sound, Spark } from "@/components/Icons";
import { speakEnglish } from "@/lib/speech";
import { useActivityTimer } from "@/lib/timelog";
import { READING_RULES, SPECIAL_SOUNDS } from "@/data/readingRules";

export default function Pronunciation() {
  useActivityTimer("pronunciation");
  // Ключ последнего озвученного примера — для мягкой подсветки.
  const [active, setActive] = useState<string | null>(null);

  function speakWord(word: string, key: string) {
    setActive(key);
    speakEnglish(word, {
      interrupt: true,
      onEnd: () => setActive((k) => (k === key ? null : k)),
      onError: () => setActive((k) => (k === key ? null : k)),
    });
  }

  // Проиграть все примеры правила подряд.
  function playAll(examples: string[], base: string) {
    let i = 0;
    const step = () => {
      if (i >= examples.length) {
        setActive(null);
        return;
      }
      const key = `${base}:${i}`;
      setActive(key);
      const w = examples[i];
      const advance = () => {
        i += 1;
        setTimeout(step, 220);
      };
      speakEnglish(w, { interrupt: true, onEnd: advance, onError: advance });
    };
    step();
  }

  function jump(letter: string) {
    document.getElementById(`ltr-${letter}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Шапка + алфавитная навигация (липкая) */}
      <div className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[480px] px-5 pt-7 pb-3">
          <h1
            data-testid="pronunciation-title"
            className="font-heading text-2xl font-extrabold text-ink"
          >
            Правила чтения
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Sound className="h-4 w-4 text-brand" />
            Метод Шестова: сначала звук. Жми на слово — услышишь произношение.
          </p>
          <div className="-mx-1 mt-3 flex gap-1 overflow-x-auto pb-1">
            {READING_RULES.map((l) => (
              <button
                key={l.letter}
                onClick={() => jump(l.letter)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-surface font-heading text-sm font-bold text-brand-d shadow-card transition-colors hover:bg-brand-soft"
              >
                {l.letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-4 pb-6">
        {READING_RULES.map((l) => (
          <section key={l.letter} id={`ltr-${l.letter}`} className="mb-7 scroll-mt-32">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand font-heading text-xl font-extrabold text-white">
                {l.letter}
              </span>
              <span className="text-xs text-muted">
                {l.rules.length} {plural(l.rules.length, "правило", "правила", "правил")}
              </span>
            </div>

            <div className="space-y-2.5">
              {l.rules.map((rule, ri) => {
                const base = `${l.letter}-${ri}`;
                return (
                  <div
                    key={ri}
                    className="rounded-card border border-line bg-surface p-3.5"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {rule.sound && (
                          <span className="inline-block rounded-lg bg-brand-soft px-2.5 py-1 font-heading text-sm font-bold text-brand-d">
                            {rule.sound}
                          </span>
                        )}
                        {rule.context && (
                          <span className="ml-2 text-sm text-muted">{rule.context}</span>
                        )}
                        {!rule.sound && !rule.context && (
                          <span className="text-sm text-muted">основной звук</span>
                        )}
                      </div>
                      {rule.examples.length > 0 && (
                        <button
                          onClick={() => playAll(rule.examples, base)}
                          aria-label="Прослушать все примеры"
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
                        >
                          <Sound className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {rule.examples.map((w, wi) => {
                        const key = `${base}:${wi}`;
                        const on = active === key;
                        return (
                          <button
                            key={wi}
                            data-testid="pron-example"
                            onClick={() => speakWord(w, key)}
                            className={`rounded-lg border px-2.5 py-1 text-sm transition-colors ${
                              on
                                ? "border-brand bg-brand text-white"
                                : "border-line bg-bg text-ink hover:border-brand/40"
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Легенда особых звуков */}
        <section className="mt-2 rounded-card border border-line bg-surface p-4">
          <div className="mb-1 flex items-center gap-2">
            <Spark className="h-4 w-4 text-brand" />
            <h2 className="font-heading text-base font-bold text-ink">
              Особые звуки английского
            </h2>
          </div>
          <p className="mb-3 text-xs text-muted">
            Русские значки в квадратных скобках — это аппроксимация Шестова. Вот как их
            произносить.
          </p>
          <ul className="space-y-2">
            {SPECIAL_SOUNDS.map((s) => (
              <li
                key={s.sound}
                className="flex items-start gap-3 border-b border-line pb-2 last:border-0"
              >
                <span className="flex-shrink-0 rounded-lg bg-brand-soft px-2.5 py-1 font-heading text-sm font-bold text-brand-d">
                  {s.sound}
                </span>
                <span className="text-sm leading-relaxed text-muted">{s.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
