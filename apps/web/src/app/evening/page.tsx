"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { speakEnglish } from "@ie/media/speech";
import { startAmbient, stopAmbient } from "@ie/media/ambient";
import { useActivityTimer } from "@ie/core/timelog";
import { useNativeLang, useUILang } from "@ie/core/prefs";
import { addArtifact, outputStats } from "@ie/core/output";
import { feedbackFor, type FeedbackHint } from "@ie/core/feedback";
import { todaysTouchedCards, recentCards } from "@ie/core/srs";
import { findWord, getPack, translate, type Word } from "@ie/core/data/packs";
import { LEVEL_PACKS } from "@ie/core/data/levelVocab";
import { LANG_DIR } from "@ie/core/data/catalog";
import { Moon, Play, Pause, Sound, X } from "@/components/Icons";

// Вечерний круг: тихий повтор дневного материала перед сном. Ничего не нужно
// отвечать — память консолидируется во сне (гиппокамп «проигрывает» последнее).
// Слова дня → спокойный голос → пауза на дыхание. Без счёта и оценок.

const UI = {
  ru: {
    title: "Вечерний круг",
    intro: "Тихий повтор перед сном. Ничего не отвечай — просто смотри и слушай.",
    start: "Начать круг",
    pause: "Пауза",
    resume: "Дальше",
    ambient: "Альфа-фон",
    exit: "Выйти",
    done: "Спокойной ночи",
    doneNote:
      "Круг пройден. Дальше — работа сна: мозг сам проиграет и уложит сегодняшние слова. Увидимся утром.",
    home: "Домой",
    words: (n: number) => `${n} слов дня`,
    statusTitle: "Статус дня",
    statusIntro: "1–3 предложения по-английски: как прошёл день. Это твой артефакт дня — приватный.",
    statusPlaceholder: "Today I practiced… I noticed…",
    statusSave: "Сохранить и спать",
    statusSkip: "Не сегодня",
    hintTitle: "Мягкая подсказка — поправь сама:",
    praise: "Живая фраза. Именно так рождается речь.",
    hints: {
      "do-decision": "Решение по-английски «делают» иначе: make a decision.",
      "feel-myself": "После feel — сразу состояние: I feel good (без myself).",
      "depends-from": "Depends дружит с on: it depends on…",
      "discuss-about": "Discuss — без about: discuss the plan.",
      "married-on": "Married to: she is married to…",
      "in-weekday": "Дни недели — с on: on Monday.",
      "very-like": "Глагол усиливает really: I really like it.",
      "capital-i": "«Я» по-английски всегда с большой: I.",
      "past-marker": "Вчера — прошедшее время: попробуй V2 (did, went, was).",
      shorter: "Разбей на короткие предложения — «Пиши, сокращай».",
    } as Record<string, string>,
  },
  en: {
    title: "Evening circle",
    intro: "A quiet replay before sleep. Answer nothing — just watch and listen.",
    start: "Start the circle",
    pause: "Pause",
    resume: "Resume",
    ambient: "Alpha tone",
    exit: "Exit",
    done: "Good night",
    doneNote:
      "The circle is complete. Sleep does the rest: your brain will replay today's words and settle them. See you in the morning.",
    home: "Home",
    words: (n: number) => `${n} words of the day`,
    statusTitle: "Status of the day",
    statusIntro: "1–3 sentences in English: how the day went. Your artifact of the day — private.",
    statusPlaceholder: "Today I practiced… I noticed…",
    statusSave: "Save and sleep",
    statusSkip: "Not tonight",
    hintTitle: "A gentle hint — fix it yourself:",
    praise: "A living phrase. This is how speech is born.",
    hints: {
      "do-decision": "In English decisions are made: make a decision.",
      "feel-myself": "After feel goes the state itself: I feel good (no myself).",
      "depends-from": "Depends pairs with on: it depends on…",
      "discuss-about": "Discuss takes no about: discuss the plan.",
      "married-on": "Married to: she is married to…",
      "in-weekday": "Weekdays take on: on Monday.",
      "very-like": "Boost a verb with really: I really like it.",
      "capital-i": "The English 'I' is always capital.",
      "past-marker": "Yesterday means past tense: try V2 (did, went, was).",
      shorter: "Split it into short sentences.",
    } as Record<string, string>,
  },
} as const;

/** Сколько мс держим слово на экране (спокойно, но без затягивания). */
const STEP_MS = 4500;
const MAX_WORDS = 24;

export default function Evening() {
  const ui = useUILang();
  const lang = useNativeLang();
  const t = UI[ui];

  const [stage, setStage] = useState<"intro" | "flow" | "status" | "done">("intro");
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(false);
  const [amb, setAmb] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [hints, setHints] = useState<FeedbackHint[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useActivityTimer(stage === "flow" && running ? "evening" : null);

  // Слова дня: тронутые сегодня → недавние → стартовый пак (для новичка).
  const words = useMemo<Word[]>(() => {
    const levelIndex = new Map<string, Word>();
    for (const p of LEVEL_PACKS) {
      if (p.id === "level-mega") continue;
      for (const w of p.words) levelIndex.set(w.en.toLowerCase(), w);
    }
    const lookup = (en: string): Word | undefined =>
      findWord(en) ?? levelIndex.get(en.toLowerCase());

    const cards = todaysTouchedCards();
    if (cards.length < 6) {
      const seen = new Set(cards.map((c) => c.en));
      for (const c of recentCards(MAX_WORDS)) {
        if (!seen.has(c.en)) cards.push(c);
        if (cards.length >= MAX_WORDS) break;
      }
    }
    const resolved = cards
      .slice(0, MAX_WORDS)
      .map((c) => lookup(c.en))
      .filter((w): w is Word => Boolean(w));
    if (resolved.length > 0) return resolved;
    return (getPack("health")?.words ?? []).slice(0, 12);
  }, []);

  const w = words[Math.min(i, words.length - 1)];
  const tr = w ? translate(w, lang) : null;

  // Автопоток: озвучили слово → подержали → дальше. Никаких действий.
  useEffect(() => {
    if (stage !== "flow" || !running || !w) return;
    speakEnglish(w.en, { rate: 0.9, interrupt: true });
    timer.current = setTimeout(() => {
      setI((p) => {
        if (p >= words.length - 1) {
          // После тихого круга — маленький вывод: статус дня (артефакт).
          // Если статус сегодня уже написан, сразу «Спокойной ночи».
          setStage(outputStats().statusToday ? "done" : "status");
          setRunning(false);
          return p;
        }
        return p + 1;
      });
    }, STEP_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [stage, running, i, w, words.length]);

  useEffect(
    () => () => {
      stopAmbient();
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    },
    []
  );

  function toggleAmbient() {
    if (amb) {
      stopAmbient();
      setAmb(false);
    } else if (startAmbient()) {
      setAmb(true);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-ink/95">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 py-6 text-white">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-heading text-sm font-bold text-white/85">
            <Moon className="h-4 w-4" /> {t.title}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbient}
              className={`rounded-xl px-2.5 py-1.5 font-heading text-[11px] font-bold transition-colors ${
                amb ? "bg-white text-brand-ink" : "bg-white/15 text-white"
              }`}
            >
              {t.ambient}
            </button>
            <Link
              href="/"
              aria-label={t.exit}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {stage === "intro" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Moon className="h-8 w-8 text-white/90" />
            </span>
            <h1
              data-testid="evening-title"
              className="mt-5 font-heading text-2xl font-extrabold"
            >
              {t.title}
            </h1>
            <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-white/75">
              {t.intro}
            </p>
            <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/85">
              {t.words(words.length)}
            </p>
            <button
              onClick={() => {
                setI(0);
                setRunning(true);
                setStage("flow");
              }}
              data-testid="evening-start"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-heading text-base font-extrabold text-brand-ink transition-transform active:scale-[0.98]"
            >
              <Play className="h-5 w-5" />
              {t.start}
            </button>
          </div>
        )}

        {stage === "flow" && w && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <button
                onClick={() => speakEnglish(w.en, { rate: 0.9, interrupt: true })}
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80"
                aria-label="Озвучить"
              >
                <Sound className="h-5 w-5" />
              </button>
              <p
                data-testid="evening-word"
                className="max-w-full break-words font-heading text-[40px] font-extrabold leading-tight text-accent"
              >
                {w.en}
              </p>
              {tr && (
                <p
                  dir={tr.isDef ? "ltr" : LANG_DIR[lang]}
                  className="mt-4 max-w-[320px] text-lg leading-relaxed text-white/85"
                >
                  {tr.text}
                </p>
              )}
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-white/60">
              <span className="tnum">
                {i + 1} / {words.length}
              </span>
              <span>{t.intro}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white/70 transition-[width] duration-500"
                style={{ width: `${Math.round(((i + 1) / words.length) * 100)}%` }}
              />
            </div>
            <button
              onClick={() => setRunning((r) => !r)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-3.5 font-heading text-sm font-bold text-white"
            >
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? t.pause : t.resume}
            </button>
          </div>
        )}

        {stage === "status" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="font-heading text-2xl font-extrabold">{t.statusTitle}</h2>
            <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-white/75">
              {t.statusIntro}
            </p>
            <textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder={t.statusPlaceholder}
              rows={3}
              data-testid="evening-status-input"
              className="mt-5 w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
            />
            <button
              onClick={() => {
                const text = statusText.trim();
                if (text) {
                  const low = text.toLowerCase();
                  addArtifact({
                    type: "status",
                    text,
                    words: todaysTouchedCards()
                      .map((c) => c.en)
                      .filter((en) => low.includes(en.toLowerCase())),
                  });
                  setHints(feedbackFor(text));
                }
                setStage("done");
              }}
              disabled={!statusText.trim()}
              data-testid="evening-status-save"
              className="mt-5 w-full rounded-2xl bg-white px-5 py-4 font-heading text-base font-extrabold text-brand-ink transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              {t.statusSave}
            </button>
            <button
              onClick={() => setStage("done")}
              className="mt-3 rounded-full px-4 py-1.5 text-xs font-bold text-white/60 hover:text-white/85"
            >
              {t.statusSkip}
            </button>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Moon className="h-8 w-8 text-white/90" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-extrabold">{t.done}</h2>
            <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-white/75">
              {t.doneNote}
            </p>
            {hints !== null &&
              (hints.length > 0 ? (
                <div className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-3 text-left">
                  <p className="text-xs font-bold text-white/70">{t.hintTitle}</p>
                  {hints.map((h) => (
                    <p key={h.id} className="mt-1 text-sm leading-relaxed text-white/85">
                      • {t.hints[h.id] ?? h.id}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/85">
                  {t.praise}
                </p>
              ))}
            <Link
              href="/"
              className="mt-8 w-full rounded-2xl bg-white px-5 py-4 text-center font-heading text-base font-extrabold text-brand-ink"
            >
              {t.home}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
