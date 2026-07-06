"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Sound, Spark, Play, Pause, Prev, Next } from "@/components/Icons";
import { speakEnglish } from "@ie/media/speech";
import { useActivityTimer } from "@ie/core/timelog";
import { READING_RULES, SPECIAL_SOUNDS } from "@ie/core/data/readingRules";
import { DRILL_LESSONS, TEMPO_STEPS, type TempoStepId } from "@ie/core/data/pronunciationDrills";
import { useUILang } from "@ie/core/prefs";

// Протокол Шестова (методичка, стр. 7): тренируем не отдельные слова, а
// ключевое слово в живой фразе — по лестнице темпа: слушай → сверхмедленно
// (артикуляция) → вместе с диктором → синхронно в полный темп.

const UI = {
  ru: {
    title: "Постановка звука",
    intro: "Метод Шестова: фраза целиком — сначала очень медленно, потом быстрее, потом как носитель.",
    tabDrill: "Тренировка",
    tabRules: "Правила",
    lesson: "урок",
    phrase: "фраза",
    steps: {
      listen: { label: "1 · Слушай", hint: "Просто слушай, глазами по тексту." },
      ultra: { label: "2 · Сверхмедленно", hint: "Повторяй за голосом, следи за артикуляцией — губы, язык." },
      slow: { label: "3 · Вместе", hint: "Проговаривай вместе с диктором. Сфальшивила — тихо подхвати со следующего слова." },
      native: { label: "4 · Носитель", hint: "Синхронно, в полный темп, с интонацией." },
    } as Record<TempoStepId, { label: string; hint: string }>,
    auto: "Автопоток",
    autoHint: "Все 4 шага сами, с паузами на повтор. Пройди фразу минимум 3 круга.",
    stop: "Стоп",
    rule: (n: number) => plural(n, "правило", "правила", "правил"),
    mainSound: "основной звук",
    playAll: "Прослушать все примеры",
    special: "Особые звуки английского",
    legend:
      "Русские значки в квадратных скобках — это аппроксимация Шестова. Вот как их произносить.",
    rulesNote: "Справочник. Тренировка звука — во вкладке «Тренировка», на целых фразах.",
  },
  en: {
    title: "Sound production",
    intro: "Shestov method: the whole phrase — very slow first, then faster, then like a native.",
    tabDrill: "Practice",
    tabRules: "Rules",
    lesson: "lesson",
    phrase: "phrase",
    steps: {
      listen: { label: "1 · Listen", hint: "Just listen, eyes on the text." },
      ultra: { label: "2 · Ultra-slow", hint: "Repeat after the voice, watch your articulation — lips, tongue." },
      slow: { label: "3 · Together", hint: "Speak along with the voice. Slipped? Rejoin quietly at the next word." },
      native: { label: "4 · Native", hint: "In sync, full speed, with intonation." },
    } as Record<TempoStepId, { label: string; hint: string }>,
    auto: "Autoflow",
    autoHint: "All 4 steps run themselves, with pauses to repeat. Do at least 3 rounds per phrase.",
    stop: "Stop",
    rule: (n: number) => (n === 1 ? "rule" : "rules"),
    mainSound: "main sound",
    playAll: "Play all examples",
    special: "Special English sounds",
    legend:
      "Russian symbols in square brackets are Shestov-style approximations for pronunciation.",
    rulesNote: "Reference. Actual sound practice lives in the Practice tab, on whole phrases.",
  },
} as const;

export default function Pronunciation() {
  useActivityTimer("pronunciation");
  const ui = useUILang();
  const t = UI[ui];
  const [tab, setTab] = useState<"drill" | "rules">("drill");

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[480px] px-5 pt-7 pb-3">
          <h1
            data-testid="pronunciation-title"
            className="font-heading text-2xl font-extrabold text-ink"
          >
            {t.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Sound className="h-4 w-4 text-brand" />
            {t.intro}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 shadow-card">
            <TabBtn on={tab === "drill"} onClick={() => setTab("drill")} testid="pron-tab-drill">
              {t.tabDrill}
            </TabBtn>
            <TabBtn on={tab === "rules"} onClick={() => setTab("rules")} testid="pron-tab-rules">
              {t.tabRules}
            </TabBtn>
          </div>
        </div>
      </div>

      {tab === "drill" ? <Drill t={t} /> : <Rules t={t} />}

      <BottomNav />
    </div>
  );
}

/* ---------- Тренировка: фразовая лестница темпа ---------- */
function Drill({ t }: { t: (typeof UI)["ru"] | (typeof UI)["en"] }) {
  const [li, setLi] = useState(0);
  const [pi, setPi] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Токен сессии озвучки: любые старые колбэки игнорируются после смены.
  const session = useRef(0);

  const lesson = DRILL_LESSONS[li];
  const phrase = lesson.phrases[pi];
  const step = TEMPO_STEPS[stepIdx];

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const stopAll = useCallback(() => {
    session.current += 1;
    clearTimer();
    setSpeaking(false);
    try {
      window.speechSynthesis?.cancel();
    } catch {}
  }, [clearTimer]);

  useEffect(() => () => stopAll(), [stopAll]);

  /** Пауза «на повтор вслух» после шага — пропорциональна длине фразы. */
  const repeatPause = useCallback(
    (text: string, stepId: TempoStepId) =>
      stepId === "listen" ? 900 : Math.max(1500, text.split(" ").length * 420),
    []
  );

  /** Проиграть фразу одним шагом лестницы; done — после окончания речи. */
  const playStep = useCallback(
    (text: string, idx: number, done?: () => void) => {
      const s = TEMPO_STEPS[idx];
      const my = ++session.current;
      clearTimer();
      setSpeaking(true);
      const finish = () => {
        if (session.current !== my) return;
        setSpeaking(false);
        done?.();
      };
      if (s.wordByWord) {
        const words = text.split(/\s+/).filter(Boolean);
        let w = 0;
        const next = () => {
          if (session.current !== my) return;
          if (w >= words.length) {
            finish();
            return;
          }
          const word = words[w++];
          speakEnglish(word, {
            rate: s.rate,
            interrupt: true,
            onEnd: () => {
              timer.current = setTimeout(next, 320);
            },
            onError: () => {
              timer.current = setTimeout(next, 320);
            },
          });
        };
        next();
      } else {
        speakEnglish(text, {
          rate: s.rate,
          interrupt: true,
          onEnd: finish,
          onError: finish,
        });
      }
    },
    [clearTimer]
  );

  /** Автопоток: шаги 1→4 с паузами на повтор, затем следующая фраза. */
  function runAuto(lessonIdx: number, phraseIdx: number, idx: number) {
    const ph = DRILL_LESSONS[lessonIdx].phrases[phraseIdx];
    setStepIdx(idx);
    playStep(ph.en, idx, () => {
      const my = session.current;
      timer.current = setTimeout(() => {
        if (session.current !== my) return;
        if (idx + 1 < TEMPO_STEPS.length) {
          runAuto(lessonIdx, phraseIdx, idx + 1);
        } else {
          const nextP = (phraseIdx + 1) % DRILL_LESSONS[lessonIdx].phrases.length;
          setPi(nextP);
          runAuto(lessonIdx, nextP, 0);
        }
      }, repeatPause(ph.en, TEMPO_STEPS[idx].id));
    });
  }

  function tapStep(idx: number) {
    setAuto(false);
    stopAll();
    setStepIdx(idx);
    playStep(phrase.en, idx);
  }

  function toggleAuto() {
    if (auto) {
      setAuto(false);
      stopAll();
    } else {
      setAuto(true);
      runAuto(li, pi, 0);
    }
  }

  function pickLesson(idx: number) {
    setAuto(false);
    stopAll();
    setLi(idx);
    setPi(0);
    setStepIdx(0);
  }

  function movePhrase(d: number) {
    setAuto(false);
    stopAll();
    setStepIdx(0);
    setPi((p) => {
      const n = lesson.phrases.length;
      return (p + d + n) % n;
    });
  }

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-4 pb-6">
      {/* Уроки */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-2">
        {DRILL_LESSONS.map((l, idx) => (
          <button
            key={l.id}
            onClick={() => pickLesson(idx)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
              idx === li ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"
            }`}
          >
            {l.title}
          </button>
        ))}
      </div>

      {/* Карточка фразы */}
      <section className="mt-2 rounded-card border border-line bg-surface p-5 text-center shadow-card">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span>
            {t.phrase} · {phrase.key}
          </span>
          <span className="tnum font-heading text-sm font-bold text-ink">
            {pi + 1} / {lesson.phrases.length}
          </span>
        </div>

        <p
          data-testid="drill-phrase"
          className="font-heading text-[24px] font-extrabold leading-snug text-accent"
        >
          {emphasize(phrase.en, phrase.key)}
        </p>
        <p className="mt-2 text-sm text-muted">{phrase.ru}</p>

        {/* Подсказка активного шага */}
        <p className="mx-auto mt-4 max-w-[320px] rounded-soft bg-brand-soft px-3 py-2 text-xs leading-relaxed text-brand-ink">
          {t.steps[step.id].hint}
        </p>

        {/* Лестница темпа */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {TEMPO_STEPS.map((s, idx) => (
            <button
              key={s.id}
              data-testid="drill-step"
              onClick={() => tapStep(idx)}
              className={`rounded-soft border px-2 py-2.5 text-center font-heading text-xs font-bold transition-colors ${
                idx === stepIdx
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-bg text-ink hover:border-brand/40"
              }`}
            >
              {t.steps[s.id].label}
            </button>
          ))}
        </div>
      </section>

      {/* Управление */}
      <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          onClick={() => movePhrase(-1)}
          aria-label="Предыдущая фраза"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-ink"
        >
          <Prev className="h-5 w-5" />
        </button>
        <button
          onClick={toggleAuto}
          data-testid="drill-auto"
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-heading text-sm font-extrabold text-white transition-colors ${
            auto ? "bg-brand" : "bg-accent shadow-[0_8px_20px_-6px_var(--accent)]"
          }`}
        >
          {auto ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {auto ? t.stop : t.auto}
        </button>
        <button
          onClick={() => movePhrase(1)}
          aria-label="Следующая фраза"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-ink"
        >
          <Next className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs leading-relaxed text-muted">
        {t.autoHint}
        {speaking && !auto ? " · 🔊" : ""}
      </p>
    </main>
  );
}

/** Ключевое слово в фразе — жирным. */
function emphasize(text: string, key: string) {
  const i = text.toLowerCase().indexOf(key.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <b className="underline decoration-2 underline-offset-4">
        {text.slice(i, i + key.length)}
      </b>
      {text.slice(i + key.length)}
    </>
  );
}

/* ---------- Справочник правил чтения (прежний экран) ---------- */
function Rules({ t }: { t: (typeof UI)["ru"] | (typeof UI)["en"] }) {
  const [active, setActive] = useState<string | null>(null);

  function speakWord(word: string, key: string) {
    setActive(key);
    speakEnglish(word, {
      interrupt: true,
      onEnd: () => setActive((k) => (k === key ? null : k)),
      onError: () => setActive((k) => (k === key ? null : k)),
    });
  }

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
    <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-4 pb-6">
      <p className="mb-3 text-xs leading-relaxed text-muted">{t.rulesNote}</p>
      <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto pb-1">
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

      {READING_RULES.map((l) => (
        <section key={l.letter} id={`ltr-${l.letter}`} className="mb-7 scroll-mt-40">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand font-heading text-xl font-extrabold text-white">
              {l.letter}
            </span>
            <span className="text-xs text-muted">
              {l.rules.length} {t.rule(l.rules.length)}
            </span>
          </div>

          <div className="space-y-2.5">
            {l.rules.map((rule, ri) => {
              const base = `${l.letter}-${ri}`;
              return (
                <div key={ri} className="rounded-card border border-line bg-surface p-3.5">
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
                        <span className="text-sm text-muted">{t.mainSound}</span>
                      )}
                    </div>
                    {rule.examples.length > 0 && (
                      <button
                        onClick={() => playAll(rule.examples, base)}
                        aria-label={t.playAll}
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

      <section className="mt-2 rounded-card border border-line bg-surface p-4">
        <div className="mb-1 flex items-center gap-2">
          <Spark className="h-4 w-4 text-brand" />
          <h2 className="font-heading text-base font-bold text-ink">{t.special}</h2>
        </div>
        <p className="mb-3 text-xs text-muted">{t.legend}</p>
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
  );
}

function TabBtn({
  on,
  onClick,
  testid,
  children,
}: {
  on: boolean;
  onClick: () => void;
  testid: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`rounded-xl py-2.5 font-heading text-sm font-bold transition-colors ${
        on ? "bg-brand text-white" : "text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
