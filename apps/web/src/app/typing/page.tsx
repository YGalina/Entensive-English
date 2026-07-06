"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import BottomNav from "@/components/BottomNav";
import { Sound, Keyboard, Check, ArrowRight } from "@/components/Icons";
import { speakEnglish, speakRussian } from "@/lib/speech";
import { useActivityTimer } from "@/lib/timelog";
import { useUILang } from "@/lib/prefs";
import { DRILL_LESSONS } from "@ie/core/data/pronunciationDrills";

// Модуль «Набор» — моторный канал метода (Шестов, TypeRIGHTing):
// произнёс → безошибочно записал. Неверный символ НЕ вставляется (zero-error:
// строку нельзя «испортить»), точность важнее скорости, «нажимать, а не бить».
// Фразы — те же, что в постановке звука: один массив через второй канал.

const UI = {
  ru: {
    title: "Набор",
    intro: "Пальцы — второй мозг. Печатай фразу без ошибок: неверная буква просто не впечатается.",
    listen: "Прослушать",
    memory: "По памяти",
    memoryHint: "Текст скрыт — печатай на слух и по спеллингу.",
    finger: "палец",
    fingers: {
      lp: "левый мизинец", lr: "левый безымянный", lm: "левый средний", li: "левый указательный",
      ri: "правый указательный", rm: "правый средний", rr: "правый безымянный", rp: "правый мизинец",
      th: "большой — пробел", sh: "Shift (мизинец другой руки)",
    },
    layoutWarn:
      "Похоже, включена русская раскладка. Буквы я принимаю по клавишам, но переключись на английскую (⌘ или ⌃ + пробел) — иначе знаки препинания не совпадут.",
    coach: "Тренер",
    coachHint: "Голосовая подсказка пальца: по кнопке 🔊 и сама, если застряла.",
    soundOn: "Звук",
    soundOff: "Тихо",
    soundHint: "Автоозвучка фраз и тренера. Кнопка «Прослушать» работает всегда.",
    fingerPhrase: (shift: boolean, base: string) =>
      shift ? `Шифт — мизинец другой руки. Буква — ${base}.` : `${base}.`,
    done: "Фраза записана",
    accuracy: "точность",
    speed: "зн/мин",
    errors: "промахов",
    next: "Следующая фраза",
    tapToType: "Нажми сюда и печатай",
    phrase: "фраза",
    softHint: "Нажимай, а не бей. Ритм ровный, спокойный.",
  },
  en: {
    title: "Typing",
    intro: "Fingers are a second brain. Type the phrase with zero errors: a wrong key simply won't register.",
    listen: "Listen",
    memory: "From memory",
    memoryHint: "Text hidden — type by ear and spelling.",
    finger: "finger",
    fingers: {
      lp: "left pinky", lr: "left ring", lm: "left middle", li: "left index",
      ri: "right index", rm: "right middle", rr: "right ring", rp: "right pinky",
      th: "thumb — space", sh: "Shift (other hand's pinky)",
    },
    layoutWarn:
      "Looks like a Russian keyboard layout is on. Letters are accepted by physical key, but switch to English (⌘ or ⌃ + Space) — punctuation won't match otherwise.",
    coach: "Coach",
    coachHint: "Voice finger hint: via the 🔊 button, and automatically when you're stuck.",
    soundOn: "Sound",
    soundOff: "Muted",
    soundHint: "Auto-voice for phrases and the coach. The Listen button always works.",
    fingerPhrase: (shift: boolean, base: string) =>
      shift ? `Shift with the other hand's pinky. The letter — ${base}.` : `${base}.`,
    done: "Phrase recorded",
    accuracy: "accuracy",
    speed: "cpm",
    errors: "misses",
    next: "Next phrase",
    tapToType: "Tap here and type",
    phrase: "phrase",
    softHint: "Press, don't strike. Keep a calm, even rhythm.",
  },
} as const;

type FingerKey = keyof (typeof UI)["ru"]["fingers"];

// Стандартная слепая десятипальцевая раскладка QWERTY: символ → палец.
const FINGER: Record<string, FingerKey> = {};
(
  [
    ["qaz1", "lp"],
    ["wsx2", "lr"],
    ["edc3", "lm"],
    ["rfvtgb45", "li"],
    ["yhnujm67", "ri"],
    ["ik,8", "rm"],
    ["ol.9", "rr"],
    ["p;/'0-=?!:\"", "rp"],
    [" ", "th"],
  ] as [string, FingerKey][]
).forEach(([chars, f]) => {
  for (const ch of chars) FINGER[ch] = f;
});

/** Нормализация: типографские кавычки/апострофы → машинные. */
function norm(ch: string): string {
  return ch.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
}

/** Текущее время (вынесено из компонента: обработчикам можно быть «нечистыми»). */
function nowMs(): number {
  return Date.now();
}

/** Английское имя символа для озвучки («capital D», «space», «colon»…). */
const CHAR_NAMES: Record<string, string> = {
  " ": "space",
  "'": "apostrophe",
  ",": "comma",
  ".": "period",
  "!": "exclamation mark",
  "?": "question mark",
  ":": "colon",
  ";": "semicolon",
  '"': "quote",
  "-": "dash",
};
function charName(ch: string): string {
  const n = norm(ch);
  if (CHAR_NAMES[n]) return CHAR_NAMES[n];
  if (/[A-Z]/.test(n)) return `capital ${n}`;
  return n;
}

type Strings = (typeof UI)["ru"] | (typeof UI)["en"];

// Переключатель звука набора: хранится в localStorage, читается реактивно
// (useSyncExternalStore — без setState в эффектах и hydration-рассинхрона).
const SOUND_KEY = "ie_typing_sound";
const soundListeners = new Set<() => void>();
function soundSubscribe(cb: () => void) {
  soundListeners.add(cb);
  return () => soundListeners.delete(cb);
}
function soundSnapshot(): string {
  try {
    return localStorage.getItem(SOUND_KEY) ?? "1";
  } catch {
    return "1";
  }
}
function useTypingSound(): [boolean, () => void] {
  const raw = useSyncExternalStore(soundSubscribe, soundSnapshot, () => "1");
  const on = raw !== "0";
  const toggle = () => {
    try {
      localStorage.setItem(SOUND_KEY, on ? "0" : "1");
    } catch {}
    soundListeners.forEach((l) => l());
  };
  return [on, toggle];
}

/** Озвучить подсказку: символ — английским голосом, палец — на языке интерфейса. */
function speakFingerFor(ch: string, t: Strings, ui: "ru" | "en") {
  const needShift = /[A-Z]/.test(ch);
  const bf = FINGER[norm(ch).toLowerCase()] ?? null;
  const phrase = t.fingerPhrase(needShift, bf ? t.fingers[bf] : "");
  const sayHint = () => {
    const say = ui === "ru" ? speakRussian : speakEnglish;
    say(phrase, { interrupt: false, rate: 1.0 });
  };
  speakEnglish(charName(ch), { rate: 0.9, interrupt: true, onEnd: sayHint, onError: sayHint });
}

export default function Typing() {
  useActivityTimer("typing");
  const ui = useUILang();
  const t = UI[ui];

  const [li, setLi] = useState(0);
  const [pi, setPi] = useState(0);
  const [pos, setPos] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [layoutWarn, setLayoutWarn] = useState(false);
  // Голосовой тренер пальцев: 🔊 по кнопке и сам, когда застряла.
  const [coach, setCoach] = useState(true);
  // Общий звук набора: off — никакой автоозвучки (ручное «Прослушать» работает).
  const [soundOn, toggleSound] = useTypingSound();
  const missOnPos = useRef(0);
  const spokenPos = useRef(-1);

  // Свежее значение для колбэков вне рендера (resetPhrase, processKey).
  const soundRef = useRef(true);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lesson = DRILL_LESSONS[li];
  const phrase = lesson.phrases[pi];
  const chars = phrase.en.split("");
  const finished = doneAt !== null;
  const current = finished ? null : chars[pos];

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  // Новая фраза: сброс + озвучка (сначала произносим — потом записываем).
  const resetPhrase = useCallback((speak: boolean, text: string) => {
    setPos(0);
    setErrors(0);
    setDoneAt(null);
    setStartedAt(null);
    setLayoutWarn(false);
    if (speak && soundRef.current) speakEnglish(text, { interrupt: true, rate: 0.9 });
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, li, pi]);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  function pickLesson(idx: number) {
    setLi(idx);
    setPi(0);
    resetPhrase(true, DRILL_LESSONS[idx].phrases[0].en);
  }

  function nextPhrase() {
    const n = lesson.phrases.length;
    const np = (pi + 1) % n;
    setPi(np);
    resetPhrase(true, lesson.phrases[np].en);
  }

  function processKey(k: string, code: string, shiftKey: boolean, prevent: () => void) {
    if (finished) return;
    if (k === "Shift" || k === "CapsLock" || k === "Tab" || k.length > 1) return;
    prevent();
    const want = norm(chars[pos]);
    const got = norm(k);
    const now = nowMs();
    if (startedAt === null) setStartedAt(now);

    // Русская раскладка: Shift+D даёт «В» и совпадения не будет никогда.
    // Буквы принимаем по физической клавише (e.code), а баннер просит
    // переключить раскладку — знаки препинания по code не мапятся.
    if (/[А-Яа-яЁё]/.test(k)) setLayoutWarn(true);
    let match = got === want;
    if (!match && /[a-z]/i.test(want) && code === `Key${want.toUpperCase()}`) {
      const wantUpper = want !== want.toLowerCase();
      match = wantUpper ? shiftKey : !shiftKey;
    }

    if (match) {
      const np = pos + 1;
      setPos(np);
      if (np >= chars.length) {
        setDoneAt(now);
        // произнесение после записи — закрепление связки звук↔спеллинг
        if (soundRef.current) speakEnglish(phrase.en, { interrupt: true, rate: 0.95 });
      }
    } else {
      setErrors((x) => x + 1);
      setWrongFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setWrongFlash(false), 240);
      // Два промаха на одном символе — тренер подсказывает голосом.
      missOnPos.current += 1;
      if (coach && soundRef.current && missOnPos.current === 2 && spokenPos.current !== pos) {
        spokenPos.current = pos;
        speakFingerFor(chars[pos], t, ui);
      }
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    processKey(e.key, e.code, e.shiftKey, () => e.preventDefault());
  }

  // Клавиши ловим и на уровне окна: если скрытый input потерял фокус (клик
  // мимо, автоозвучка), набор не «умирает» — фокус не обязателен.
  const processKeyRef = useRef(processKey);
  useEffect(() => {
    processKeyRef.current = processKey;
  });
  useEffect(() => {
    const onWinKey = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return; // уже обработает input
      if (e.metaKey || e.ctrlKey || e.altKey) return; // не мешаем шорткатам
      processKeyRef.current(e.key, e.code, e.shiftKey, () => e.preventDefault());
    };
    window.addEventListener("keydown", onWinKey);
    return () => window.removeEventListener("keydown", onWinKey);
  }, []);

  const elapsedMin =
    doneAt && startedAt ? Math.max((doneAt - startedAt) / 60000, 1 / 60) : null;
  const cpm = elapsedMin ? Math.round(chars.length / elapsedMin) : 0;
  const accuracy = Math.round((chars.length / Math.max(chars.length + errors, 1)) * 100);

  // Для заглавной показываем ОБЕ клавиши: Shift + палец самой буквы.
  const needShift = current ? /[A-Z]/.test(current) : false;
  const baseFinger: FingerKey | null = current
    ? FINGER[norm(current).toLowerCase()] ?? null
    : null;

  function speakFinger() {
    if (!current) return;
    spokenPos.current = pos;
    speakFingerFor(current, t, ui);
  }

  // Застряла на символе ~3с — тренер подскажет сам (один раз на символ).
  useEffect(() => {
    if (!coach || !soundOn || finished) return;
    missOnPos.current = 0;
    const ch = phrase.en[pos];
    if (!ch) return;
    const id = setTimeout(() => {
      if (spokenPos.current !== pos) {
        spokenPos.current = pos;
        speakFingerFor(ch, t, ui);
      }
    }, 3000);
    return () => clearTimeout(id);
  }, [coach, soundOn, finished, pos, pi, li, phrase.en, t, ui]);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[480px] px-5 pt-7 pb-3">
          <h1 data-testid="typing-title" className="font-heading text-2xl font-extrabold text-ink">
            {t.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Keyboard className="h-4 w-4 text-brand" />
            {t.intro}
          </p>
          <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {DRILL_LESSONS.map((l, idx) => (
              <button
                key={l.id}
                onClick={() => pickLesson(idx)}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                  idx === li ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"
                }`}
              >
                {ui === "en" ? l.titleEn : l.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-4 pb-6">
        {/* Управление фразой */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speakEnglish(phrase.en, { interrupt: true, rate: 0.85 })}
              className="flex items-center gap-1.5 rounded-xl bg-brand-soft px-3 py-2 font-heading text-xs font-bold text-brand-d"
            >
              <Sound className="h-4 w-4" /> {t.listen}
            </button>
            <button
              onClick={() => setCoach((v) => !v)}
              title={t.coachHint}
              className={`rounded-xl px-3 py-2 font-heading text-xs font-bold transition-colors ${
                coach ? "bg-brand text-white" : "bg-surface text-ink shadow-card"
              }`}
            >
              {t.coach}
            </button>
            <button
              onClick={toggleSound}
              title={t.soundHint}
              data-testid="typing-sound-toggle"
              className={`rounded-xl px-3 py-2 font-heading text-xs font-bold transition-colors ${
                soundOn ? "bg-brand text-white" : "bg-surface text-muted shadow-card"
              }`}
            >
              {soundOn ? t.soundOn : t.soundOff}
            </button>
          </div>
          <span className="tnum text-xs font-bold text-muted">
            {t.phrase} {pi + 1} / {lesson.phrases.length}
          </span>
          <button
            onClick={() => setHidden((v) => !v)}
            title={t.memoryHint}
            className={`rounded-xl px-3 py-2 font-heading text-xs font-bold transition-colors ${
              hidden ? "bg-brand text-white" : "bg-surface text-ink shadow-card"
            }`}
          >
            {t.memory}
          </button>
        </div>

        {/* Предупреждение о раскладке */}
        {layoutWarn && (
          <div
            data-testid="layout-warn"
            className="mb-3 rounded-soft bg-warn-soft px-3 py-2.5 text-xs leading-relaxed text-warn"
          >
            {t.layoutWarn}
          </div>
        )}

        {/* Поле набора */}
        <section
          onClick={focusInput}
          className="cursor-text rounded-card border border-line bg-surface p-5 shadow-card"
        >
          <input
            ref={inputRef}
            onKeyDown={handleKey}
            aria-label={t.tapToType}
            className="sr-only"
            autoFocus
            value=""
            onChange={() => {}}
          />
          <p className="font-heading text-[22px] font-bold leading-relaxed tracking-wide">
            {chars.map((ch, i) => {
              const done = i < pos;
              const cur = i === pos && !finished;
              const show = done || !hidden ? ch : cur ? ch : "•";
              return (
                <span
                  key={i}
                  className={
                    cur
                      ? `rounded px-0.5 ${wrongFlash ? "bg-accent text-white" : "bg-brand text-white"}`
                      : done
                        ? "text-ink"
                        : hidden
                          ? "text-line"
                          : "text-muted/60"
                  }
                >
                  {cur && hidden ? "•" : show}
                </span>
              );
            })}
          </p>
          <p className="mt-3 text-sm text-muted">{phrase.ru}</p>

          {/* Подсказка пальца */}
          <div className="mt-4 flex min-h-[36px] items-center justify-between rounded-soft bg-bg px-3 py-2">
            {finished ? (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ok">
                <Check className="h-4 w-4" /> {t.done}
              </span>
            ) : (
              <>
                <span className="text-xs text-muted">
                  {t.finger}:{" "}
                  <b className="text-ink">
                    {needShift
                      ? `${t.fingers.sh}${baseFinger ? " + " + t.fingers[baseFinger] : ""}`
                      : baseFinger
                        ? t.fingers[baseFinger]
                        : "—"}
                  </b>
                </span>
                <span className="flex items-center gap-1.5">
                  <button
                    onClick={speakFinger}
                    data-testid="finger-voice"
                    aria-label={t.coachHint}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-d"
                  >
                    <Sound className="h-3.5 w-3.5" />
                  </button>
                  <span className="rounded bg-brand-soft px-2 py-0.5 font-heading text-sm font-extrabold text-brand-d">
                    {current === " " ? "␣" : current}
                  </span>
                </span>
              </>
            )}
          </div>
        </section>

        {/* Итог фразы */}
        {finished && (
          <div data-testid="typing-result" className="mt-4">
            <div className="grid grid-cols-3 gap-2.5">
              <Stat n={`${accuracy}%`} label={t.accuracy} />
              <Stat n={String(cpm)} label={t.speed} />
              <Stat n={String(errors)} label={t.errors} />
            </div>
            <button
              onClick={nextPhrase}
              data-testid="typing-next"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
            >
              {t.next}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-xs leading-relaxed text-muted">{t.softHint}</p>
      </main>

      <BottomNav />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-card bg-surface p-3.5 text-center shadow-card">
      <p className="tnum font-heading text-xl font-extrabold text-brand">{n}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
