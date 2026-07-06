"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Sound, Spark, Play, Pause, Next, Repeat } from "@/components/Icons";
import { speakEnglish } from "@/lib/speech";
import { useActivityTimer } from "@/lib/timelog";
import { useUILang } from "@/lib/prefs";
import { GRAMMAR, assemble } from "@ie/core/data/grammar";

type DrillStep = {
  en: string;
  ru: string;
  kind: "model" | "build";
};

const UI = {
  ru: {
    title: "Грамматика в речи",
    intro: "Не зубри таблицы — собирай готовые фразы и проговаривай вслух.",
    when: "Когда",
    formula: "Формула",
    markers: "Маркеры",
    models: "Модели — послушай и повтори",
    build: "Собери на слух",
    buildHint: "Сначала прослушай полную фразу. Потом выбери, что было в пропуске.",
    frame: "рамка",
    listen: "Прослушать фразу",
    choose: "Что было в пропуске?",
    result: "получилось",
    correct: "Верно. Теперь повтори вслух всю фразу.",
    tryAgain: "Почти. Правильный ответ не показываю — послушай ещё раз.",
    drill: "Речевой автопоток",
    drillHint: "Фраза звучит сама. Повтори вслух в паузу — следующая включится автоматически.",
    model: "модель",
    phrase: "фраза",
    start: "Старт",
    pause: "Пауза",
    resume: "Дальше",
    replay: "Повторить",
    next: "Следующая",
  },
  en: {
    title: "Grammar in speech",
    intro: "Don't cram tables — build ready phrases and say them aloud.",
    when: "When",
    formula: "Formula",
    markers: "Markers",
    models: "Models — listen and repeat",
    build: "Build by ear",
    buildHint: "First listen to the full phrase. Then choose what you heard in the blank.",
    frame: "frame",
    listen: "Listen to the phrase",
    choose: "What was in the blank?",
    result: "result",
    correct: "Correct. Now repeat the full phrase aloud.",
    tryAgain: "Almost. I will not show the answer yet — listen again.",
    drill: "Speech autoflow",
    drillHint: "The phrase plays automatically. Repeat aloud during the pause; the next one starts by itself.",
    model: "model",
    phrase: "phrase",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    replay: "Replay",
    next: "Next",
  },
} as const;

export default function Grammar() {
  useActivityTimer("grammar");
  const ui = useUILang();
  const t = UI[ui];
  const [ti, setTi] = useState(0);
  const [fi, setFi] = useState(0);
  const [selectedFi, setSelectedFi] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pat = GRAMMAR[ti];
  const fill = pat.fills[fi];
  const builtEn = assemble(pat.frame.en, fill.en);
  const builtRu = assemble(pat.frame.ru, fill.ru);
  const drill = useMemo<DrillStep[]>(
    () => [
      ...pat.examples.map((ex) => ({ ...ex, kind: "model" as const })),
      ...pat.fills.map((f) => ({
        en: assemble(pat.frame.en, f.en),
        ru: assemble(pat.frame.ru, f.ru),
        kind: "build" as const,
      })),
    ],
    [pat]
  );
  const current = drill[drillIndex] ?? drill[0];

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  function pickTense(idx: number) {
    clearTimer();
    window.speechSynthesis?.cancel();
    setTi(idx);
    setFi(0);
    setSelectedFi(null);
    setSolved(false);
    setDrillIndex(0);
    setRunning(false);
  }

  function pickFill(idx: number) {
    clearTimer();
    setRunning(false);
    setSelectedFi(idx);
    if (idx === fi) {
      setSolved(true);
      speakEnglish(builtEn, { interrupt: true, rate: 0.86 });
    } else {
      setSolved(false);
      setTimeout(() => speakEnglish(builtEn, { interrupt: true, rate: 0.82 }), 260);
    }
  }

  function listenBuild() {
    clearTimer();
    setRunning(false);
    speakEnglish(builtEn, { interrupt: true, rate: 0.82 });
  }

  function nextBuild() {
    clearTimer();
    window.speechSynthesis?.cancel();
    setSelectedFi(null);
    setSolved(false);
    setFi((i) => (i + 1 >= pat.fills.length ? 0 : i + 1));
  }

  const nextDrill = useCallback(() => {
    clearTimer();
    setDrillIndex((i) => (i + 1 >= drill.length ? 0 : i + 1));
  }, [clearTimer, drill.length]);

  const replay = useCallback(() => {
    clearTimer();
    setRunning(true);
    setReplayKey((k) => k + 1);
  }, [clearTimer]);

  useEffect(() => {
    if (!running || !current) return;
    clearTimer();
    speakEnglish(current.en, {
      interrupt: true,
      rate: 0.86,
      onEnd: () => {
        timer.current = setTimeout(nextDrill, 1800);
      },
      onError: () => {
        timer.current = setTimeout(nextDrill, 2200);
      },
    });
    return () => {
      clearTimer();
      window.speechSynthesis?.cancel();
    };
  }, [clearTimer, current, nextDrill, replayKey, running]);

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

        {/* Речевой автопоток */}
        <section className="mt-6 rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-ink">{t.drill}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.drillHint}</p>
            </div>
            <span className="tnum flex-shrink-0 rounded-xl bg-bg px-3 py-2 font-heading text-xs font-bold text-muted">
              {drillIndex + 1} / {drill.length}
            </span>
          </div>

          <div className="rounded-card bg-brand-soft p-4 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-brand-d">
              {current.kind === "model" ? t.model : t.phrase}
            </p>
            <p className="font-heading text-[25px] font-extrabold leading-tight text-accent">
              {current.en}
            </p>
            <p className="mt-2 text-base font-semibold leading-snug text-brand-ink">
              {current.ru}
            </p>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.round(((drillIndex + 1) / drill.length) * 100)}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-[1fr_48px_48px] gap-2">
            <button
              onClick={() => {
                if (running) {
                  setRunning(false);
                  clearTimer();
                  window.speechSynthesis?.cancel();
                } else {
                  replay();
                }
              }}
              data-testid="grammar-autoflow-toggle"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-heading text-sm font-bold text-white"
            >
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? t.pause : drillIndex === 0 ? t.start : t.resume}
            </button>
            <button
              onClick={replay}
              aria-label={t.replay}
              className="flex h-12 items-center justify-center rounded-xl border border-line bg-bg text-ink"
            >
              <Repeat className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                clearTimer();
                window.speechSynthesis?.cancel();
                setRunning(false);
                nextDrill();
              }}
              aria-label={t.next}
              className="flex h-12 items-center justify-center rounded-xl border border-line bg-bg text-ink"
            >
              <Next className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Конструктор */}
        <section className="mt-6 rounded-card border border-line bg-surface p-4 shadow-card">
          <h3 className="font-heading text-sm font-bold text-ink">{t.build}</h3>
          <p className="mt-0.5 mb-3 text-xs text-muted">{t.buildHint}</p>

          {/* Рамка с пропуском */}
          <div className="rounded-card border border-line bg-bg p-4 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">
              {t.frame}
            </p>
            <p className="font-heading text-[22px] font-extrabold leading-snug text-ink">
              {pat.frame.en.replace("___", "_____")}
            </p>
            <p className="mt-1 text-sm text-muted">{pat.frame.ru.replace("___", "_____")}</p>
            <button
              onClick={listenBuild}
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-heading text-sm font-bold text-white"
            >
              <Sound className="h-4 w-4" />
              {t.listen}
            </button>
          </div>

          {/* Подстановки */}
          <p className="mt-4 mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">
            {t.choose}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pat.fills.map((f, idx) => (
              <button
                key={idx}
                data-testid="grammar-fill"
                onClick={() => pickFill(idx)}
                className={`rounded-lg border px-2.5 py-1 text-sm transition-colors ${
                  solved && idx === fi
                    ? "border-brand bg-brand text-white"
                    : selectedFi === idx
                      ? "border-warn bg-warn-soft text-warn"
                    : "border-line bg-bg text-ink hover:border-brand/40"
                }`}
              >
                {f.en}
              </button>
            ))}
          </div>

          {selectedFi !== null && (
            <p className={`mt-3 text-sm font-semibold ${solved ? "text-ok" : "text-warn"}`}>
              {solved ? t.correct : t.tryAgain}
            </p>
          )}

          {/* Правильная фраза появляется только после верного выбора */}
          {solved && (
            <div className="mt-3 rounded-card bg-brand-soft p-4 text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-brand-d">
                {t.result}
              </p>
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
              <button
                onClick={nextBuild}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 font-heading text-sm font-bold text-ink"
              >
                {t.next}
                <Next className="h-4 w-4" />
              </button>
            </div>
          )}
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
