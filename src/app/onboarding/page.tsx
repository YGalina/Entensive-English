"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NATIVE_LANGUAGES, GOALS, LEVELS, TOPICS, type LangCode } from "@/data/catalog";
import { savePrefs } from "@/lib/prefs";
import { ArrowRight, Check, Spark } from "@/components/Icons";

const STEPS = ["Родной язык", "Цель", "Темы", "Уровень"] as const;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [nativeLang, setNativeLang] = useState<LangCode>("ru");
  const [goal, setGoal] = useState<string>("");
  const [topics, setTopics] = useState<string[]>(["core"]);
  const [level, setLevel] = useState<string>("");

  const canNext =
    (step === 0 && !!nativeLang) ||
    (step === 1 && !!goal) ||
    (step === 2 && topics.length > 0) ||
    (step === 3 && !!level);

  function toggleTopic(id: string) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    savePrefs({ nativeLang, uiLang: "ru", goal, topics, level });
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-7 pb-6">
        {/* Прогресс */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Spark className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-bold text-ink">
              Настроим под тебя
            </span>
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-brand" : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Шаг 0: родной язык */}
        {step === 0 && (
          <Section
            title="Какой у тебя родной язык?"
            note="Учим только английский. Переводы слов и примеров будут на этом языке."
          >
            <div className="grid grid-cols-2 gap-2.5">
              {NATIVE_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setNativeLang(l.code)}
                  dir={l.dir}
                  className={`flex items-center gap-2.5 rounded-soft border p-3 text-left transition-colors ${
                    nativeLang === l.code
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-surface hover:border-brand/40"
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="font-heading text-sm font-bold text-ink">
                    {l.native}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Шаг 1: цель */}
        {step === 1 && (
          <Section title="Зачем тебе английский?" note="Подберём контент и темп под цель.">
            <div className="space-y-2.5">
              {GOALS.map((g) => (
                <Option
                  key={g.id}
                  active={goal === g.id}
                  title={g.title}
                  desc={g.desc}
                  onClick={() => setGoal(g.id)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Шаг 2: темы */}
        {step === 2 && (
          <Section
            title="Что интересно изучать?"
            note="Можно несколько. Слова придут пачками в контексте этих тем."
          >
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const on = topics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTopic(t.id)}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                      on
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-surface text-ink hover:border-brand/40"
                    }`}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Шаг 3: уровень */}
        {step === 3 && (
          <Section title="Какой у тебя уровень?" note="Без экзамена. Можно уточнить тестом позже.">
            <div className="space-y-2.5">
              {LEVELS.map((l) => (
                <Option
                  key={l.id}
                  active={level === l.id}
                  title={l.title}
                  desc={l.desc}
                  onClick={() => setLevel(l.id)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Навигация */}
        <div className="mt-auto flex items-center gap-2 pt-6">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-2xl border border-line bg-surface px-5 py-4 font-heading text-sm font-bold text-muted"
            >
              Назад
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {step === STEPS.length - 1 ? (
              <>
                Поехали <Check className="h-5 w-5" />
              </>
            ) : (
              <>
                Дальше <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold leading-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">{note}</p>
      {children}
    </div>
  );
}

function Option({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-soft border p-3.5 text-left transition-colors ${
        active ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/40"
      }`}
    >
      <span>
        <span className="block font-heading text-sm font-bold text-ink">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
          active ? "border-brand bg-brand text-white" : "border-line"
        }`}
      >
        {active && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
