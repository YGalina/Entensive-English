"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPack, translate, translateExample, type Word } from "@/data/packs";
import { getLevelPack } from "@/data/levelVocab";
import { useNativeLang, usePace } from "@/lib/prefs";
import { speakEnglish, warmEnglishVoices } from "@/lib/speech";
import { recordAnswer } from "@/lib/srs";
import { useActivityTimer } from "@/lib/timelog";
import { LANG_DIR, type LangCode } from "@/data/catalog";
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
  ready: "Готовность",
  flash: "Киносеанс · перегрузка",
  context: "Активизация · в контексте",
  recognition: "Узнавание",
  relax: "Релаксация",
};

// Безопасные скорости предъявления (см. 04_design_system §6). У каждой — свой
// темп речи, чтобы на медленных слово успевало полностью прозвучать.
const SPEEDS = [
  { ms: 1100, label: "Медленно", sub: "1,1 с", rate: 0.8, warn: false },
  { ms: 600, label: "Спокойно", sub: "0,6 с", rate: 0.95, warn: false },
  { ms: 350, label: "Быстрее", sub: "0,35 с", rate: 1.05, warn: false },
  { ms: 120, label: "Разгон", sub: "0,12 с", rate: 1.35, warn: true },
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
  // Учёт времени по нагрузочным фазам
  useActivityTimer(
    phase === "flash" || phase === "context" || phase === "recognition" ? phase : null
  );

  if (!pack || pack.words.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted">Эта пачка ещё готовится.</p>
        <Link href="/" className="font-heading font-bold text-brand">
          ← На сегодня
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
              {LABEL[phase]}
            </p>
            <p data-testid="session-pack-title" className="font-heading text-sm font-bold text-ink">
              Пачка «{pack.title}»
            </p>
          </div>
          <Link
            href="/"
            aria-label="Выйти из сеанса"
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
          <Ready pack={pack.title} count={pack.words.length} context={pack.context} onStart={() => go("ready")} />
        )}
        {phase === "flash" && (
          <Flash words={pack.words} lang={lang} onDone={() => go("flash")} />
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
  onStart,
}: {
  pack: string;
  count: number;
  context: string;
  onStart: () => void;
}) {
  return (
    <div data-testid="phase-ready" className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Spark className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold text-ink">
          Ты справишься.
        </h2>
        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-muted">
          Сейчас будет {count} слов разом. Не нужно их заучивать — просто смотри
          и слушай. Они «всплывут» сами в контексте.
        </p>
        <p className="mt-5 rounded-soft bg-surface px-4 py-3 text-sm font-medium text-brand-ink shadow-card">
          «{pack}» — {context.toLowerCase()}
        </p>
      </div>

      <div className="rounded-soft border border-line bg-surface p-3 text-xs leading-relaxed text-muted">
        Темп выберешь на следующем шаге. По умолчанию — спокойный. Пауза и выход
        доступны в любой момент.
      </div>

      <button
        onClick={onStart}
        data-testid="phase-start"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)] transition-transform active:scale-[0.98]"
      >
        <Play className="h-5 w-5" />
        Поехали
      </button>
    </div>
  );
}

/* ---------- Фаза 2: Киносеанс / перегрузка ---------- */
function Flash({ words, lang, onDone }: { words: Word[]; lang: LangCode; onDone: () => void }) {
  const pace = usePace();
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(true);
  // индекс в SPEEDS: медленный темп из настроек → «Медленно», иначе «Спокойно»
  const [speed, setSpeed] = useState(pace === "slow" ? 0 : 1);
  const [soundOn, setSoundOn] = useState(true);
  const [consented, setConsented] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ms = SPEEDS[speed].ms;
  const w = words[i];
  const tr = translate(w, lang);
  const ex = translateExample(w, lang);
  const last = i >= words.length - 1;

  useEffect(() => {
    warmEnglishVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", warmEnglishVoices);
    return () => {
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", warmEnglishVoices);
    };
  }, []);

  useEffect(() => {
    if (!running || !soundOn) return;
    speakEnglish(w.en, { rate: SPEEDS[speed].rate, interrupt: true });
  }, [i, speed, running, soundOn, w.en]);

  useEffect(() => {
    if (!running) return;
    timer.current = setTimeout(() => {
      setI((prev) => {
        if (prev >= words.length - 1) {
          setRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, running, ms, words.length]);

  function pickSpeed(idx: number) {
    if (SPEEDS[idx].warn && !consented) {
      const ok = window.confirm(
        "Разгон 0,12 с — очень быстрое предъявление. Если есть фоточувствительность или склонность к приступам, не используй этот режим. Меняется только слово на карточке, фон стабилен. Продолжить?"
      );
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
            {soundOn ? "Звук" : "Без звука"}
          </button>
          <span className="rounded-xl bg-surface px-3 py-2 text-[11px] font-bold text-brand-d">
            {SPEEDS[speed].label} · {SPEEDS[speed].sub}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="max-w-full break-words font-heading text-[38px] font-extrabold leading-tight text-brand-ink">
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
            {tr.isDef ? "Толкование" : "Перевод и пример"}
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
          <span>усвоено в потоке</span>
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
        {SPEEDS.map((s, idx) => (
          <button
            key={s.ms}
            onClick={() => pickSpeed(idx)}
            className={`rounded-soft border px-2 py-2 text-center transition-colors ${
              idx === speed
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink"
            }`}
          >
            <span className="block font-heading text-xs font-bold">{s.label}</span>
            <span className={`block text-[11px] ${idx === speed ? "text-white/80" : "text-muted"}`}>
              {s.sub}
            </span>
          </button>
        ))}
      </div>

      {/* Безопасность */}
      <div className="mt-3 flex items-start gap-2 rounded-soft bg-warn-soft px-3 py-2.5 text-xs leading-relaxed text-warn">
        <Warning className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          Быстрый режим — по согласию. Меняется только слово, фон стабилен. Пауза
          и выход в любой момент.
        </span>
      </div>

      {/* Управление */}
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        {last && !running ? (
          <button
            onClick={onDone}
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_20px_-6px_var(--accent)]"
          >
            К контексту
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (last) setI(0);
              setRunning((r) => !r);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 font-heading text-base font-extrabold text-white"
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? "Пауза" : last ? "Заново" : "Дальше"}
          </button>
        )}
        <button
          onClick={onDone}
          data-testid="flash-skip"
          className="rounded-2xl border border-line bg-surface px-4 font-heading text-sm font-bold text-muted"
        >
          Пропустить
        </button>
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
            <p className="font-heading text-[22px] font-extrabold leading-snug text-brand-ink">
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
        <div className="font-heading text-[36px] font-extrabold leading-none text-ink">
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
            <p className="text-xs text-muted">блок к стрику</p>
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
