"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPack, translate, translateExample, type Word } from "@ie/core/data/packs";
import { getLevelPack } from "@ie/core/data/levelVocab";
import { useNativeLang, usePace, useUILang } from "@ie/core/prefs";
import { speakEnglish, warmEnglishVoices, speechLooksSilent } from "@ie/media/speech";
import { recordAnswer } from "@ie/core/srs";
import { useActivityTimer } from "@ie/core/timelog";
import { addArtifact } from "@ie/core/output";
import { useVoiceRecorder } from "@ie/media/recorder";
import { LANG_DIR, type LangCode } from "@ie/core/data/catalog";
import {
  Sound,
  Play,
  Pause,
  Check,
  Warning,
  Spark,
  ArrowRight,
  Prev,
  Next,
  Repeat,
  X,
} from "@/components/Icons";

// Фазы по 13_app_logic §3.2: цикл всегда заканчивается активным выводом —
// «сказать своё» вместо релаксации. Релакс-итог живёт внутри финала.
type Phase = "flash" | "context" | "recognition" | "say";
const ORDER: Phase[] = ["flash", "context", "recognition", "say"];
// Сессия начинается сразу с потока слов — без фазы дыхания/настройки
// (решение Галины 2026-07-12: медитации убраны; ориентир — пользователи).
const LABEL: Record<Phase, string> = {
  flash: "Поток слов · перегрузка",
  context: "Активизация · в контексте",
  recognition: "Узнавание",
  say: "Сказать своё · финал",
};

/** Вопрос дня для «сказать своё» — ротация по дате, те же вопросы на mobile. */
const SAY_QUESTIONS = [
  { ru: "Что тебя сейчас выматывает — и что ты с этим делаешь?", en: "What is draining you these days — and what are you doing about it?" },
  { ru: "Что ты сделала сегодня намеренно, не по привычке?", en: "What did you do on purpose today, not out of habit?" },
  { ru: "Что тебе хочется поменять в своих буднях?", en: "What would you like to change in your everyday life?" },
  { ru: "Чему ты научилась за последнее время — вне английского?", en: "What have you learned recently — outside English?" },
  { ru: "Какой разговор ты откладываешь — и почему?", en: "What conversation are you putting off — and why?" },
  { ru: "Что сегодня было проще, чем ты ожидала?", en: "What was easier today than you expected?" },
  { ru: "О чём ты думаешь перед сном в последние дни?", en: "What has been on your mind before sleep lately?" },
  { ru: "Какое место в твоём городе тебе дорого — и чем?", en: "What place in your city matters to you — and why?" },
] as const;

const SESSION_UI = {
  ru: {
    phases: LABEL,
    pack: "Пачка",
    exit: "Выйти из сеанса",
    missing: "Эта пачка ещё готовится.",
    backToday: "← На сегодня",
    readyTitle: "Ты справишься.",
    readyText: (count: number) =>
      `Сейчас будет текущая пачка: ${count} слов. Дневная цель набирается несколькими пачками, а не одним экраном. Не нужно заучивать — просто смотри и слушай.`,
    readyNote:
      "Если звук включён, поток ждёт окончания английской озвучки. Пауза и выход доступны в любой момент.",
    start: "Поехали",
    ambient: "Альфа-фон",
    ambientHint: "мягкий тон 10 Гц · лучше в наушниках",
    breathIn: "Вдох",
    breathHold: "Держи",
    breathOut: "Выдох",
    cycle: "круг",
    sound: "Звук",
    noSound: "Без звука",
    interpretation: "Толкование",
    translationExample: "Перевод и пример",
    inFlow: "усвоено в потоке",
    fastWarn:
      "Быстрый режим — по согласию. Меняется только слово, фон стабилен. Пауза и выход в любой момент.",
    silentVoice:
      "Озвучка молчит: выбранный голос не отвечает. Открой Профиль → «Голос диктора» и выбери другой (▶ — послушать).",
    sprintConfirm:
      "Разгон — очень быстрое предъявление. Если есть фоточувствительность или склонность к приступам, не используй этот режим. Меняется только слово на карточке, фон стабилен. Продолжить?",
    pause: "Пауза",
    restart: "Заново",
    watch: "Смотреть",
    resume: "Продолжить",
    toContext: "К контексту",
    skip: "Пропустить",
    speed: {
      slow: ["Медленно", "голос + пауза"],
      calm: ["Спокойно", "голос + пауза"],
      faster: ["Быстрее", "короткая пауза"],
      sprint: ["Разгон", "без чтения перевода"],
    },
    say: {
      passed: (n: number) => `Через тебя прошло ${n} слов. Финал — твоя речь.`,
      hint: "2–3 фразы. Не идеально — достаточно хорошо для контакта.",
      chips: "Опоры · клик, чтобы вставить",
      placeholder: "Today I…",
      record: "Записать голосом",
      stop: "Остановить запись",
      recorded: "Запись готова ✓ · записать заново",
      privacy: "Запись и текст видны только тебе.",
      save: "Засчитать в часы",
      skip: "Пропустить сегодня — без штрафа",
    },
  },
  en: {
    phases: {
      flash: "Word flow · overload",
      context: "Activation · in context",
      recognition: "Recognition",
      say: "Say your own · finale",
    } as Record<Phase, string>,
    pack: "Pack",
    exit: "Exit session",
    missing: "This pack is still being prepared.",
    backToday: "← Back to Today",
    readyTitle: "You can do this.",
    readyText: (count: number) =>
      `This is the current pack: ${count} words. The daily goal is reached through several packs, not one screen. No memorizing — just watch and listen.`,
    readyNote:
      "When sound is on, the flow waits for the English audio to finish. Pause and exit are always available.",
    start: "Start",
    ambient: "Alpha tone",
    ambientHint: "soft 10 Hz tone · best with headphones",
    breathIn: "Inhale",
    breathHold: "Hold",
    breathOut: "Exhale",
    cycle: "round",
    sound: "Sound",
    noSound: "No sound",
    interpretation: "Definition",
    translationExample: "Translation and example",
    inFlow: "seen in flow",
    fastWarn:
      "Fast mode requires consent. Only the word changes; the background stays stable. Pause and exit any time.",
    silentVoice:
      "The voice is silent: the selected voice is not responding. Open Profile → “Narrator voice” and pick another (▶ to preview).",
    sprintConfirm:
      "Sprint is very fast exposure. If you have photosensitivity or seizure risk, do not use it. Only the word changes; the background stays stable. Continue?",
    pause: "Pause",
    restart: "Restart",
    watch: "Watch",
    resume: "Resume",
    toContext: "To context",
    skip: "Skip",
    speed: {
      slow: ["Slow", "voice + pause"],
      calm: ["Calm", "voice + pause"],
      faster: ["Faster", "short pause"],
      sprint: ["Sprint", "no translation reading"],
    },
    say: {
      passed: (n: number) => `${n} words flowed through you. The finale is your speech.`,
      hint: "2–3 phrases. Not perfect — good enough for contact.",
      chips: "Supports · click to insert",
      placeholder: "Today I…",
      record: "Record your voice",
      stop: "Stop recording",
      recorded: "Recording ready ✓ · record again",
      privacy: "Your recording and text are visible only to you.",
      save: "Count it into my hours",
      skip: "Skip today — no penalty",
    },
  },
} as const;

type SpeedKey = keyof (typeof SESSION_UI)["ru"]["speed"];

// Безопасные скорости предъявления. Если звук включён, это минимальное время
// карточки: поток ждёт окончания английского голоса и только потом идёт дальше.
const SPEEDS: { minMs: number; key: SpeedKey; rate: number; warn: boolean }[] = [
  { minMs: 2600, key: "slow", rate: 0.78, warn: false },
  { minMs: 1900, key: "calm", rate: 0.9, warn: false },
  { minMs: 1300, key: "faster", rate: 1.0, warn: false },
  { minMs: 700, key: "sprint", rate: 1.18, warn: true },
];
// Темп фазы «Активизация»: скорость речи + пауза между фразами.
const CONTEXT_TEMPOS = [
  { label: "Обычный", rate: 0.9, pause: 900 },
  { label: "Медленно", rate: 0.8, pause: 1800 },
  { label: "Оч. медленно", rate: 0.72, pause: 3000 },
];

/** Выделяет целевое слово в примере жирным. */
function highlight(text: string, target: string) {
  const esc = target.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!esc) return text;
  const splitter = new RegExp(`(${esc}\\w*)`, "ig");
  const matcher = new RegExp(`^${esc}\\w*$`, "i");
  return text.split(splitter).map((p, i) =>
    p && matcher.test(p) ? (
      <b key={i} className="font-bold">
        {p}
      </b>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function SessionPage() {
  const params = useParams<{ pack: string }>();
  const router = useRouter();
  const pack = getPack(params.pack) ?? getLevelPack(params.pack);

  const [phase, setPhase] = useState<Phase>("flash");
  const lang = useNativeLang();
  const ui = useUILang();
  const t = SESSION_UI[ui];
  // Учёт времени по нагрузочным фазам; «сказать своё» = активность output
  useActivityTimer(
    phase === "flash" || phase === "context" || phase === "recognition"
      ? phase
      : phase === "say"
        ? "output"
        : null
  );
  // Альфа-фон, включённый в настройке, живёт весь сеанс; глушим при выходе.

  if (!pack || pack.words.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted">{t.missing}</p>
        <Link href="/" className="font-heading font-bold text-brand">
          {t.backToday}
        </Link>
      </div>
    );
  }

  // Словарные наборы по уровню — без контекстной фазы (нет примеров)
  const order: Phase[] =
    pack.kind === "vocab"
      ? ["flash", "recognition", "say"]
      : ORDER;
  const phaseIdx = order.indexOf(phase);
  const go = (from: Phase) => {
    const i = order.indexOf(from);
    setPhase(order[i + 1] ?? "say");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      {/* Шапка сеанса: прогресс фаз + выход */}
      <header className="mx-auto w-full max-w-[480px] px-5 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              {t.phases[phase]}
            </p>
            <p data-testid="session-pack-title" className="font-heading text-sm font-bold text-ink">
              {t.pack} «{pack.title}»
            </p>
          </div>
          <Link
            href="/"
            aria-label={t.exit}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-3 flex gap-1.5">
          {order.map((p, i) => (
            <span
              key={p}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= phaseIdx ? "bg-brand" : "bg-line"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 py-6">
        {phase === "flash" && (
          <Flash words={pack.words} lang={lang} ui={ui} onDone={() => go("flash")} />
        )}
        {phase === "context" && (
          <Context words={pack.words} lang={lang} onDone={() => go("context")} />
        )}
        {phase === "recognition" && (
          <Recognition
            words={pack.words}
            lang={lang}
            packId={pack.id}
            onDone={() => go("recognition")}
          />
        )}
        {phase === "say" && (
          <Say
            words={pack.words}
            count={pack.words.length}
            ui={ui}
            onFinish={() => router.push("/")}
          />
        )}
      </main>
    </div>
  );
}

/* ---------- Фаза 2: Киносеанс / перегрузка ---------- */
function Flash({
  words,
  lang,
  ui,
  onDone,
}: {
  words: Word[];
  lang: LangCode;
  ui: "ru" | "en";
  onDone: () => void;
}) {
  const pace = usePace();
  const t = SESSION_UI[ui];
  const [i, setI] = useState(0);
  // Стартуем на паузе: пользователь сам жмёт «Смотреть» (это ещё и жест для
  // разблокировки озвучки в браузере). Иначе поток пролетал до конца сам.
  const [running, setRunning] = useState(false);
  // индекс в SPEEDS: медленный темп из настроек → «Медленно», иначе «Спокойно»
  const [speed, setSpeed] = useState(pace === "slow" ? 0 : 1);
  const [soundOn, setSoundOn] = useState(true);
  const [consented, setConsented] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minMs = SPEEDS[speed].minMs;
  const w = words[i];
  const tr = translate(w, lang);
  const ex = translateExample(w, lang);
  const last = i >= words.length - 1;
  const speedText = t.speed[SPEEDS[speed].key];

  useEffect(() => {
    warmEnglishVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", warmEnglishVoices);
    return () => {
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", warmEnglishVoices);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    let done = false;
    const started = Date.now();
    const advance = () => {
      if (done) return;
      done = true;
      setI((prev) => {
        if (prev >= words.length - 1) {
          setRunning(false);
          return prev;
        }
        return prev + 1;
      });
    };

    if (soundOn) {
      const afterVoice = () => {
        const left = Math.max(260, minMs - (Date.now() - started));
        timer.current = setTimeout(advance, left);
      };
      speakEnglish(w.en, {
        rate: SPEEDS[speed].rate,
        interrupt: true,
        onEnd: afterVoice,
        onError: afterVoice,
      });
    } else {
      timer.current = setTimeout(advance, minMs);
    }

    return () => {
      done = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, minMs, running, soundOn, speed, w.en, words.length]);

  function pickSpeed(idx: number) {
    if (SPEEDS[idx].warn && !consented) {
      const ok = window.confirm(t.sprintConfirm);
      if (!ok) return;
      setConsented(true);
    }
    setSpeed(idx);
  }

  const pct = Math.round(((i + 1) / words.length) * 100);

  return (
    <div data-testid="phase-flash" className="flex flex-1 flex-col">
      {/* Карточка: меняется только содержимое, фон стабилен (безопасность) */}
      <div className="relative flex min-h-[360px] flex-1 flex-col rounded-card bg-brand-soft p-5 text-center">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              if (next) speakEnglish(w.en, { interrupt: true });
              else window.speechSynthesis?.cancel();
            }}
            className={`flex h-10 items-center gap-2 rounded-xl px-3 font-heading text-xs font-bold transition-colors ${
              soundOn ? "bg-brand text-white" : "bg-surface text-brand-d"
            }`}
          >
            <Sound className="h-4 w-4" />
            {soundOn ? t.sound : t.noSound}
          </button>
          <span className="rounded-xl bg-surface px-3 py-2 text-[11px] font-bold text-brand-d">
            {speedText[0]} · {speedText[1]}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="max-w-full break-words font-heading text-[38px] font-extrabold leading-tight text-accent">
            {w.en}
          </div>
          <div
            dir={tr.isDef ? "ltr" : LANG_DIR[lang]}
            className="mt-5 max-w-full break-words font-heading text-[38px] font-extrabold leading-tight text-brand-ink"
          >
            {tr.text}
          </div>
          {!soundOn && <div className="mt-4 text-base font-semibold text-muted">{w.ipa}</div>}
        </div>

        <div className="rounded-soft bg-surface/80 px-4 py-3 text-left shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            {tr.isDef ? t.interpretation : t.translationExample}
          </p>
          <p
            dir={tr.isDef ? "ltr" : LANG_DIR[lang]}
            className="mt-1 text-sm leading-relaxed text-ink"
          >
            {tr.text}
          </p>
          {ex.text && (
            <p
              dir={ex.isDef ? "ltr" : LANG_DIR[lang]}
              className="mt-2 text-xs leading-relaxed text-muted"
            >
              {ex.text}
            </p>
          )}
        </div>
      </div>

      {/* Прогресс потока */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{t.inFlow}</span>
          <span className="tnum font-heading text-base font-bold text-ink">
            {i + 1} / {words.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Выбор темпа */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {SPEEDS.map((s, idx) => {
          const [label, sub] = t.speed[s.key];
          return (
          <button
            key={s.key}
            onClick={() => pickSpeed(idx)}
            className={`rounded-soft border px-2 py-2 text-center transition-colors ${
              idx === speed
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink"
            }`}
          >
            <span className="block font-heading text-xs font-bold">{label}</span>
            <span className={`block text-[11px] ${idx === speed ? "text-white/80" : "text-muted"}`}>
              {sub}
            </span>
          </button>
        );
        })}
      </div>

      {/* Немой голос: подсказка сменить в профиле */}
      {soundOn && speechLooksSilent() && (
        <Link
          href="/profile"
          className="mt-3 flex items-start gap-2 rounded-soft bg-warn-soft px-3 py-2.5 text-xs leading-relaxed text-warn underline-offset-2 hover:underline"
        >
          <Warning className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{t.silentVoice}</span>
        </Link>
      )}

      {/* Безопасность */}
      <div className="mt-3 flex items-start gap-2 rounded-soft bg-warn-soft px-3 py-2.5 text-xs leading-relaxed text-warn">
        <Warning className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          {t.fastWarn}
        </span>
      </div>

      {/* Управление */}
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        {/* Слева всегда управление воспроизведением: смотреть / пауза / заново */}
        <button
          onClick={() => {
            if (running) {
              setRunning(false);
            } else {
              if (last) setI(0);
              setRunning(true);
            }
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 font-heading text-base font-extrabold text-white"
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {running ? t.pause : last ? t.restart : i === 0 ? t.watch : t.resume}
        </button>
        {/* Справа: в конце — переход к контексту, иначе — пропустить фазу */}
        {last && !running ? (
          <button
            onClick={onDone}
            data-testid="flash-skip"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 font-heading text-sm font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
          >
            {t.toContext}
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={onDone}
            data-testid="flash-skip"
            className="rounded-2xl border border-line bg-surface px-4 font-heading text-sm font-bold text-muted"
          >
            {t.skip}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Фаза 3: Активизация в контексте ---------- */
function Context({ words, lang, onDone }: { words: Word[]; lang: LangCode; onDone: () => void }) {
  const pace = usePace();
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  // индекс в CONTEXT_TEMPOS: медленный темп из настроек → «Медленно»
  const [tempo, setTempo] = useState(pace === "slow" ? 1 : 0);
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const w = words[i];
  const last = i >= words.length - 1;
  const ex = translateExample(w, lang);

  const clearNextTimer = useCallback(() => {
    if (nextTimer.current) {
      clearTimeout(nextTimer.current);
      nextTimer.current = null;
    }
  }, []);

  const next = useCallback(() => {
    clearNextTimer();
    if (last) onDone();
    // Кламп: два быстрых клика «дальше» не должны увести индекс за массив.
    else setI((p) => Math.min(p + 1, words.length - 1));
  }, [clearNextTimer, last, onDone, words.length]);

  useEffect(() => {
    warmEnglishVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", warmEnglishVoices);
    return () => {
      clearNextTimer();
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", warmEnglishVoices);
    };
  }, [clearNextTimer]);

  useEffect(() => {
    clearNextTimer();
    if (!running) {
      window.speechSynthesis?.cancel();
      return;
    }

    const t = CONTEXT_TEMPOS[tempo];
    speakEnglish(w.exEn ?? w.en, {
      rate: t.rate,
      interrupt: true,
      // Пауза между фразами — чтобы успеть повторить вслух за диктором.
      onEnd: () => {
        nextTimer.current = setTimeout(next, t.pause);
      },
      onError: () => {
        nextTimer.current = setTimeout(next, t.pause + 300);
      },
    });

    return () => {
      clearNextTimer();
      window.speechSynthesis?.cancel();
    };
  }, [clearNextTimer, next, replayKey, running, tempo, w.en, w.exEn]);

  function go(delta: number) {
    clearNextTimer();
    window.speechSynthesis?.cancel();
    setRunning(false);
    setI((p) => Math.min(Math.max(0, p + delta), words.length - 1));
  }

  function replay() {
    clearNextTimer();
    setRunning(true);
    setReplayKey((k) => k + 1);
  }

  return (
    <div data-testid="phase-context" className="flex flex-1 flex-col">
      <p className="mb-3 text-sm text-muted">
        Автопоток: слушай английскую фразу и повторяй вслух. Пауза между фразами —
        чтобы успеть повторить. Следующая включится сама.
      </p>

      {/* Темп: скорость речи и длина паузы между фразами */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {CONTEXT_TEMPOS.map((t, idx) => (
          <button
            key={t.label}
            onClick={() => setTempo(idx)}
            className={`rounded-soft border px-2 py-2 text-center font-heading text-xs font-bold transition-colors ${
              idx === tempo
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-line p-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 font-heading text-xs font-bold text-brand-d">
            <Sound className="h-4 w-4" />
            {running ? "Идёт озвучка" : "Пауза"}
          </span>
          <span className="tnum font-heading text-sm font-extrabold text-ink">
            {i + 1} / {words.length}
          </span>
        </div>

        {/* Параллельные колонки EN / L1 (как в методе — перевод рядом) */}
        <div className="grid min-h-[220px] grid-cols-1 text-sm sm:grid-cols-2">
          <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
              English
            </p>
            <p className="font-heading text-[22px] font-extrabold leading-snug text-accent">
              {highlight(w.exEn ?? w.en, w.en)}
            </p>
          </div>
          <div className="p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
              {ex.isDef ? "Толкование (англ.)" : "Перевод"}
            </p>
            <p
              dir={ex.isDef ? "ltr" : LANG_DIR[lang]}
              className="font-heading text-[22px] font-extrabold leading-snug text-ink"
            >
              {ex.isDef ? highlight(ex.text, w.en) : ex.text}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] gap-2 border-t border-line p-3">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="Предыдущая фраза"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg text-ink disabled:opacity-35"
          >
            <Prev className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              if (running) {
                setRunning(false);
                clearNextTimer();
                window.speechSynthesis?.cancel();
              } else {
                replay();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 font-heading text-sm font-bold text-white"
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? "Пауза" : "Продолжить"}
          </button>
          <button
            onClick={replay}
            aria-label="Повторить фразу"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg text-ink"
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{running ? "автопереход после озвучки" : "поток на паузе"}</span>
        <span className="tnum font-heading text-base font-bold text-ink">
          {i + 1} / {words.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${Math.round(((i + 1) / words.length) * 100)}%` }}
        />
      </div>

      <div className="mt-auto pt-5">
        <div className="grid grid-cols-[1fr_auto] gap-2.5">
          <button
            onClick={next}
            data-testid="context-next"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
          >
            {last ? "К узнаванию" : "Не ждать, дальше"}
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            disabled={last}
            aria-label="Следующая фраза"
            className="flex w-14 items-center justify-center rounded-2xl border border-line bg-surface text-ink disabled:opacity-35"
          >
            <Next className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Фаза 4: Узнавание ---------- */
function Recognition({
  words,
  lang,
  packId,
  onDone,
}: {
  words: Word[];
  lang: LangCode;
  packId: string;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [known, setKnown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const w = words[i];
  const tr = translate(w, lang);

  function answer(yes: boolean) {
    recordAnswer(packId, w.en, yes); // планируем повтор (SRS)
    if (yes) setKnown((k) => k + 1);
    setRevealed(false);
    if (i >= words.length - 1) onDone();
    else setI((p) => p + 1);
  }

  return (
    <div data-testid="phase-recognition" className="flex flex-1 flex-col">
      <p className="mb-3 text-sm text-muted">
        Спокойный темп. Всплыло — отлично. Нет — без проблем, повторим завтра.
      </p>

      <div className="flex flex-1 flex-col items-center justify-center rounded-card bg-surface p-6 text-center shadow-card">
        <div className="font-heading text-[36px] font-extrabold leading-none text-accent">
          {w.en}
        </div>
        <button
          onClick={() => speakEnglish(w.en, { interrupt: true })}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted"
        >
          <Sound className="h-4 w-4" /> Озвучить
        </button>

        <div className="mt-5 min-h-[84px]">
          {revealed ? (
            <div>
              <div
                dir={tr.isDef ? "ltr" : LANG_DIR[lang]}
                className="max-w-full break-words font-heading text-[32px] font-extrabold leading-tight text-ink"
              >
                {tr.text}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Без звука: {w.ipa}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              data-testid="recognition-reveal"
              className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
            >
              показать перевод
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>
          узнано <b className="tnum text-ink">{known}</b>
        </span>
        <span className="tnum font-heading text-base font-bold text-ink">
          {i + 1} / {words.length}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => answer(false)}
          data-testid="recognition-unknown"
          className="rounded-2xl border border-line bg-surface px-4 py-4 font-heading text-sm font-bold text-muted"
        >
          Ещё не всплыло
        </button>
        <button
          onClick={() => answer(true)}
          data-testid="recognition-known"
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-4 font-heading text-sm font-bold text-white"
        >
          <Check className="h-5 w-5" /> Знаю
        </button>
      </div>
    </div>
  );
}

/* ---------- Фаза 5: Сказать своё — активный вывод, финал цикла ---------- */
function Say({
  words,
  count,
  ui,
  onFinish,
}: {
  words: Word[];
  count: number;
  ui: "ru" | "en";
  onFinish: () => void;
}) {
  const t = SESSION_UI[ui].say;
  const rec = useVoiceRecorder();
  const [text, setText] = useState("");
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const dayIdx = Math.floor(Date.now() / 86400000) % SAY_QUESTIONS.length;
  const q = SAY_QUESTIONS[dayIdx];
  const chips = words.filter((w) => !!w.exEn).slice(0, 4).map((w) => w.en);
  const canSave = text.trim().length > 0 || !!audioUri;

  function insertChip(word: string) {
    setText((s) => (s.length === 0 || s.endsWith(" ") ? `${s}${word} ` : `${s} ${word} `));
  }

  async function toggleRecord() {
    if (rec.recording) {
      const uri = await rec.stop();
      if (uri) setAudioUri(uri);
    } else {
      setAudioUri(null);
      await rec.start();
    }
  }

  function save() {
    const usedWords = chips.filter((w) => text.toLowerCase().includes(w.toLowerCase()));
    addArtifact({
      type: audioUri ? "speech" : "essay",
      promptId: "session-say",
      text: text.trim() || undefined,
      audioRef: audioUri ?? undefined,
      words: usedWords,
    });
    onFinish();
  }

  return (
    <div data-testid="phase-say" className="flex flex-1 flex-col">
      <p className="text-xs font-semibold text-muted">{t.passed(count)}</p>

      <h2 className="mt-3 font-heading text-2xl font-extrabold leading-snug text-ink">
        {ui === "en" ? q.en : q.ru}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.hint}</p>

      {/* Чипы-опоры из слов сессии — амбер, как маркер нового слова */}
      {chips.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">
            {t.chips}
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map((w) => (
              <button
                key={w}
                onClick={() => insertChip(w)}
                className="rounded-full bg-sun px-3.5 py-2 font-english text-sm font-medium text-[#3b2c07] transition-transform active:scale-[0.97]"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        data-testid="say-text"
        rows={4}
        className="mt-4 w-full flex-1 resize-none rounded-card border border-line bg-surface p-4 font-english text-base leading-relaxed text-ink outline-none placeholder:text-muted focus:border-brand"
      />

      {rec.supported && (
        <button
          onClick={toggleRecord}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 font-heading text-sm font-bold transition-colors ${
            rec.recording
              ? "border-brand bg-brand-soft text-brand-d"
              : "border-line bg-surface text-ink"
          }`}
        >
          <Sound className="h-4 w-4" />
          {rec.recording ? t.stop : audioUri ? t.recorded : t.record}
        </button>
      )}
      <p className="mt-2 text-xs leading-relaxed text-muted">{t.privacy}</p>

      <button
        onClick={save}
        disabled={!canSave}
        data-testid="say-finish"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 font-heading text-base font-extrabold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Check className="h-5 w-5" />
        {t.save}
      </button>
      <button
        onClick={onFinish}
        data-testid="say-skip"
        className="mt-2 w-full rounded-2xl px-5 py-3 font-heading text-sm font-bold text-muted"
      >
        {t.skip}
      </button>
    </div>
  );
}
