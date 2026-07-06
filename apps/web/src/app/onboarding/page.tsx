"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NATIVE_LANGUAGES, GOALS, LEVELS, INTERESTS, type LangCode } from "@ie/core/data/catalog";
import { savePrefs } from "@ie/core/prefs";
import {
  buildCheckWords,
  scoreLevel,
  type CheckLevel,
  type RawWord,
} from "@ie/core/levelcheck";
import { ArrowRight, Check, Spark, Sound } from "@/components/Icons";
import { speakEnglish } from "@ie/media/speech";
import b1 from "@ie/core/data/vocab-b1.json";
import b2 from "@ie/core/data/vocab-b2.json";
import c1 from "@ie/core/data/vocab-c1.json";

const STEPS = ["Родной язык", "Цель", "Темы", "Уровень"] as const;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [nativeLang, setNativeLang] = useState<LangCode>("ru");
  const [goal, setGoal] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [level, setLevel] = useState<string>("");
  const [checking, setChecking] = useState(false);

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

        {/* Шаг 2: интересы-смыслы (§8) — без методических категорий */}
        {step === 2 && (
          <Section
            title="Про что тебе интересно?"
            note="Выбери, что любишь, — слова, тексты и примеры придут из этих смыслов. Можно несколько."
          >
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((t) => {
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
        {step === 3 && !checking && (
          <Section title="Какой у тебя уровень?" note="Без экзамена. Не уверена — определим за минуту по словам.">
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
            <button
              onClick={() => setChecking(true)}
              data-testid="level-check-start"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand/40 bg-brand-soft px-5 py-3.5 font-heading text-sm font-bold text-brand-d"
            >
              <Spark className="h-4 w-4" />
              Не знаю уровень — определить за минуту
            </button>
          </Section>
        )}

        {step === 3 && checking && (
          <LevelCheck
            onDone={(lvl) => {
              setLevel(lvl);
              setChecking(false);
            }}
            onCancel={() => setChecking(false)}
          />
        )}

        {/* Навигация */}
        {!checking && (
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
        )}
      </main>
    </div>
  );
}

/* ---------- Мини-определение уровня по словам (yes/no vocabulary check) ----------
   Логика — в @ie/core/levelcheck (общая с mobile); здесь только UI. */

const CHECK_WORDS = buildCheckWords({
  b1: b1 as RawWord[],
  b2: b2 as RawWord[],
  c1: c1 as RawWord[],
});

function LevelCheck({
  onDone,
  onCancel,
}: {
  onDone: (level: string) => void;
  onCancel: () => void;
}) {
  const [i, setI] = useState(0);
  const [known, setKnown] = useState<Record<CheckLevel, number>>({
    b1: 0,
    b2: 0,
    c1: 0,
  });
  const item = CHECK_WORDS[i];
  const finished = i >= CHECK_WORDS.length;
  const result = finished ? scoreLevel(known) : null;
  const resultTitle = result ? LEVELS.find((l) => l.id === result)?.title ?? result : "";

  function answer(yes: boolean) {
    if (yes) setKnown((k) => ({ ...k, [item.lvl]: k[item.lvl] + 1 }));
    setI((p) => p + 1);
  }

  if (finished && result) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Check className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-extrabold text-ink">
            Похоже, твой уровень — {result.toUpperCase()}
          </h1>
          <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-muted">
            {resultTitle}. Это стартовая настройка, не приговор: программа сама
            подстроится по мере практики.
          </p>
        </div>
        <button
          onClick={() => onDone(result)}
          data-testid="level-check-accept"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
        >
          Принять <Check className="h-5 w-5" />
        </button>
        <button
          onClick={onCancel}
          className="mt-2 w-full rounded-2xl border border-line bg-surface px-5 py-3.5 font-heading text-sm font-bold text-muted"
        >
          Выберу сама
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>Понимаешь смысл — жми «Знаю». Честно, без словаря 🙂</span>
        <span className="tnum font-heading text-sm font-bold text-ink">
          {i + 1} / {CHECK_WORDS.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card">
        <p
          data-testid="level-check-word"
          className="max-w-full break-words font-heading text-[34px] font-extrabold leading-tight text-accent"
        >
          {item.w.en}
        </p>
        <button
          onClick={() => speakEnglish(item.w.en, { interrupt: true })}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted"
        >
          <Sound className="h-4 w-4" /> {item.w.ipa}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => answer(false)}
          data-testid="level-check-no"
          className="rounded-2xl border border-line bg-surface px-4 py-4 font-heading text-sm font-bold text-muted"
        >
          Ещё нет
        </button>
        <button
          onClick={() => answer(true)}
          data-testid="level-check-yes"
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-4 font-heading text-sm font-bold text-white"
        >
          <Check className="h-5 w-5" /> Знаю
        </button>
      </div>
      <button
        onClick={onCancel}
        className="mt-2 w-full py-2 text-center text-xs font-semibold text-muted"
      >
        ← вернуться к выбору вручную
      </button>
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
