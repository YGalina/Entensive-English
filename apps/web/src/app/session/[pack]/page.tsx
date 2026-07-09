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
import { LANG_DIR, type LangCode } from "@ie/core/data/catalog";
import { AFFIRMATIONS, BREATH, BREATH_CYCLES_GOAL } from "@ie/core/data/affirmations";
import { startAmbient, stopAmbient } from "@ie/media/ambient";
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

type Phase = "ready" | "flash" | "context" | "recognition" | "relax";
const ORDER: Phase[] = ["ready", "flash", "context", "recognition", "relax"];
const LABEL: Record<Phase, string> = {
  ready: "Настройка · вход в состояние",
  flash: "Киносеанс · перегрузка",
  context: "Активизация · в контексте",
  recognition: "Узнавание",
  relax: "Релаксация",
};

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
    attune: "Настроиться · 1 минута",
    attuneSkip: "Сразу к словам",
    attuneHint: "Дыши вместе с кругом. Установку читай про себя или шёпотом.",
    attuneDone: "Ты готова. Слова лягут сами.",
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
  },
  en: {
    phases: {
      ready: "Readiness",
      flash: "Exposure · overload",
      context: "Activation · in context",
      recognition: "Recognition",
      relax: "Relax",
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
    attune: "Attune · 1 minute",
    attuneSkip: "Straight to words",
    attuneHint: "Breathe with the circle. Read the affirmation silently or in a whisper.",
    attuneDone: "You are ready. The words will settle on their own.",
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

  const [phase, setPhase] = useState<Phase>("ready");
  const lang = useNativeLang();
  const ui = useUILang();
  const t = SESSION_UI[ui];
  // Учёт времени по нагрузочным фазам
  useActivityTimer(
    phase === "flash" || phase === "context" || phase === "recognition" ? phase : null
  );
  // Альфа-фон, включённый в настройке, живёт весь сеанс; глушим при выходе.
  useEffect(() => () => stopAmbient(), []);

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
      ? ["ready", "flash", "recognition", "relax"]
      : ORDER;
  const phaseIdx = order.indexOf(phase);
  const go = (from: Phase) => {
    const i = order.indexOf(from);
    setPhase(order[i + 1] ?? "relax");
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
        {phase === "ready" && (
          <Ready
            pack={pack.title}
            count={pack.words.length}
            context={pack.context}
            ui={ui}
            onStart={() => go("ready")}
          />
        )}
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
        {phase === "relax" && (
          <Relax count={pack.words.length} onFinish={() => router.push("/")} />
        )}
      </main>
    </div>
  );
}

/* ---------- Фаза 1: Готовность ---------- */
function Ready({
  pack,
  count,
  context,
  ui,
  onStart,
}: {
  pack: string;
  count: number;
  context: string;
  ui: "ru" | "en";
  onStart: () => void;
}) {
  const t = SESSION_UI[ui];
  // Настройка (суггестопедия + Крашен): дыхание 4–2–6 с установками снимает
  // барьер восприятия перед массивом. Пропуск всегда доступен — не принуждаем.
  const [stage, setStage] = useState<"intro" | "breathe">("intro");
  const [bp, setBp] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(0);
  const [amb, setAmb] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggleAmbient() {
    if (amb) {
      stopAmbient();
      setAmb(false);
    } else if (startAmbient()) {
      setAmb(true);
    }
  }

  useEffect(() => {
    if (stage !== "breathe") return;
    let alive = true;
    const step = (phase: "in" | "hold" | "out") => {
      if (!alive) return;
      setBp(phase);
      const dur =
        phase === "in" ? BREATH.inhale : phase === "hold" ? BREATH.hold : BREATH.exhale;
      timer.current = setTimeout(() => {
        if (!alive) return;
        if (phase === "in") step("hold");
        else if (phase === "hold") step("out");
        else {
          setCycle((c) => c + 1);
          step("in");
        }
      }, dur);
    };
    step("in");
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [stage]);

  if (stage === "breathe") {
    const aff = AFFIRMATIONS[cycle % AFFIRMATIONS.length];
    const expanded = bp !== "out";
    const durMs = bp === "in" ? BREATH.inhale : bp === "hold" ? 0 : BREATH.exhale;
    const goalReached = cycle >= BREATH_CYCLES_GOAL;
    const breathLabel =
      bp === "in" ? t.breathIn : bp === "hold" ? t.breathHold : t.breathOut;
    return (
      <div data-testid="phase-ready" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {t.cycle}{" "}
            <b className="tnum text-ink">{Math.min(cycle + 1, BREATH_CYCLES_GOAL)}</b> /{" "}
            {BREATH_CYCLES_GOAL}
          </span>
          <button
            onClick={toggleAmbient}
            data-testid="ambient-toggle"
            title={t.ambientHint}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-heading text-[11px] font-bold transition-colors ${
              amb ? "bg-brand text-white" : "bg-surface text-brand-d shadow-card"
            }`}
          >
            <Sound className="h-3.5 w-3.5" />
            {t.ambient}
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Дыхательный круг: вдох 4с — пауза 2с — выдох 6с */}
          <div className="flex h-56 w-56 items-center justify-center">
            <div
              className="flex h-36 w-36 items-center justify-center rounded-full bg-brand-soft shadow-card transition-transform ease-in-out"
              style={{
                transform: `scale(${expanded ? 1.35 : 1})`,
                transitionDuration: `${durMs}ms`,
              }}
            >
              <span className="font-heading text-base font-bold text-brand-d">
                {breathLabel}
              </span>
            </div>
          </div>

          {/* Установка: родной язык — главным, английская пара — тихой строкой */}
          <div key={cycle} className="mt-6 min-h-[84px] max-w-[320px]">
            <p className="font-heading text-lg font-bold leading-snug text-ink">
              {aff.ru}
            </p>
            <p className="mt-2 text-sm italic leading-relaxed text-muted">{aff.en}</p>
          </div>
        </div>

        <p
          className={`mb-3 text-center text-xs leading-relaxed ${
            goalReached ? "font-semibold text-ok" : "text-muted"
          }`}
        >
          {goalReached ? t.attuneDone : t.attuneHint}
        </p>
        <button
          onClick={onStart}
          data-testid="phase-start"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
        >
          <Play className="h-5 w-5" />
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div data-testid="phase-ready" className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Spark className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold text-ink">
          {t.readyTitle}
        </h2>
        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-muted">
          {t.readyText(count)}
        </p>
        <p className="mt-5 rounded-soft bg-surface px-4 py-3 text-sm font-medium text-brand-ink shadow-card">
          «{pack}» — {context.toLowerCase()}
        </p>
      </div>

      <div className="rounded-soft border border-line bg-surface p-3 text-xs leading-relaxed text-muted">
        {t.readyNote}
      </div>

      <button
        onClick={() => setStage("breathe")}
        data-testid="attune-start"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
      >
        <Spark className="h-5 w-5" />
        {t.attune}
      </button>
      <button
        onClick={onStart}
        data-testid="phase-start"
        className="mt-2 w-full rounded-2xl border border-line bg-surface px-5 py-3.5 font-heading text-sm font-bold text-muted"
      >
        {t.attuneSkip}
      </button>
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
    else setI((p) => p + 1);
  }, [clearNextTimer, last, onDone]);

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

/* ---------- Фаза 5: Релаксация / итог ---------- */
function Relax({ count, onFinish }: { count: number; onFinish: () => void }) {
  return (
    <div data-testid="phase-relax" className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ok/15 text-ok">
          <Check className="h-9 w-9" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold text-ink">
          Пачка пройдена
        </h2>
        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-muted">
          Через тебя прошло {count} слов. Сделай вдох-выдох — и можно дальше. Эти
          слова система покажет на повторе завтра.
        </p>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-card bg-surface p-4 shadow-card">
            <p className="tnum font-heading text-2xl font-extrabold text-brand">
              {count}
            </p>
            <p className="text-xs text-muted">слов в потоке</p>
          </div>
          <div className="rounded-card bg-surface p-4 shadow-card">
            <p className="tnum font-heading text-2xl font-extrabold text-accent-d">
              +1
            </p>
            <p className="text-xs text-muted">блок в режим дня</p>
          </div>
        </div>
      </div>

      <button
        onClick={onFinish}
        data-testid="relax-finish"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
      >
        Готово
      </button>
    </div>
  );
}
