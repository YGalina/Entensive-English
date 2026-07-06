"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Play, Pause, Prev, Next, Repeat, Gauge, Sound, Spark } from "@/components/Icons";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  scriptsByCategory,
  type ShadowScript,
} from "@ie/core/data/shadowing";
import { useActivityTimer } from "@ie/core/timelog";
import { useUILang } from "@ie/core/prefs";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (s: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  setPlaybackRate: (r: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: Element, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const RATES = [1, 0.75, 0.5];
const UI = {
  ru: {
    title: "Shadowing",
    intro: "Выбери ролик: слушай носителя и повторяй вслух, читая текст.",
    phrases: "фраз",
    soon:
      "Скоро: свои ролики по ссылке (Диспенза, любые TED и MOOC) — тайминги снимаем из субтитров автоматически.",
  },
  en: {
    title: "Shadowing",
    intro: "Choose a video: listen to a native speaker and repeat aloud while reading the text.",
    phrases: "phrases",
    soon:
      "Soon: add your own videos by link (Dispenza, TED, MOOCs) and extract timings from subtitles automatically.",
  },
} as const;

export default function Video() {
  const [selected, setSelected] = useState<ShadowScript | null>(null);
  const ui = useUILang();
  const t = UI[ui];

  if (selected) {
    return <ShadowPlayer script={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pt-7 pb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink">{t.title}</h1>
        <p className="mt-1 mb-5 flex items-center gap-1.5 text-sm text-muted">
          <Sound className="h-4 w-4 text-brand" />
          {t.intro}
        </p>

        {CATEGORY_ORDER.map((cat) => {
          const items = scriptsByCategory(cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} className="mb-6">
              <h2 className="mb-3 font-heading text-base font-bold text-ink">
                {CATEGORY_LABEL[cat]}
              </h2>
              <ul className="space-y-2.5">
                {items.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelected(s)}
                      className="flex w-full items-center gap-3 rounded-soft border border-line bg-surface p-3.5 text-left transition-colors hover:border-brand/40"
                    >
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Play className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-heading text-sm font-bold text-ink">
                          {s.title}
                        </span>
                        <span className="block text-xs text-muted">
                          {s.author} · {s.level} · {s.lines.length} {t.phrases}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <div className="mt-2 flex items-start gap-2 rounded-soft border border-line bg-surface p-3 text-xs leading-relaxed text-muted">
          <Spark className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
          {t.soon}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function ShadowPlayer({ script, onBack }: { script: ShadowScript; onBack: () => void }) {
  const lines = script.lines;
  const hasTr = lines.some((l) => l.ru);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(0);
  const [loop, setLoop] = useState(false);
  const [rateIdx, setRateIdx] = useState(0);
  const [showTr, setShowTr] = useState(false);
  useActivityTimer(playing ? "shadowing" : null);

  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const loopRef = useRef(false);
  const activeRef = useRef(0);

  useEffect(() => {
    let poll: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (!mountRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId: script.youtubeId,
        playerVars: { cc_load_policy: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            setReady(true);
            poll = setInterval(tick, 200);
          },
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === window.YT?.PlayerState.PLAYING);
          },
        },
      });
    }

    function tick() {
      const p = playerRef.current;
      if (!p) return;
      const t = p.getCurrentTime();
      const cur = lines[activeRef.current];
      if (loopRef.current && cur && t >= cur.end - 0.05) {
        p.seekTo(cur.start, true);
        return;
      }
      let idx = lines.findIndex((l) => t >= l.start && t < l.end);
      if (idx === -1) {
        for (let k = lines.length - 1; k >= 0; k--) {
          if (t >= lines[k].start) {
            idx = k;
            break;
          }
        }
      }
      if (idx !== -1 && idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    }

    if (window.YT && window.YT.Player) {
      start();
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = start;
    }

    return () => {
      if (poll) clearInterval(poll);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
  }, [script.youtubeId, lines]);

  function jumpTo(idx: number) {
    const p = playerRef.current;
    if (!p) return;
    activeRef.current = idx;
    setActive(idx);
    p.seekTo(lines[idx].start, true);
    p.playVideo();
  }

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }

  function step(d: number) {
    const n = Math.min(lines.length - 1, Math.max(0, activeRef.current + d));
    jumpTo(n);
  }

  function toggleLoop() {
    loopRef.current = !loopRef.current;
    setLoop(loopRef.current);
  }

  function cycleRate() {
    const next = (rateIdx + 1) % RATES.length;
    setRateIdx(next);
    playerRef.current?.setPlaybackRate(RATES[next]);
  }

  return (
    <div className="flex h-dvh flex-col">
      <main className="mx-auto flex w-full min-h-0 max-w-[480px] flex-1 flex-col px-5 pt-5 pb-4">
        <button
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1 self-start text-sm font-semibold text-muted"
        >
          <Prev className="h-4 w-4" /> к списку
        </button>

        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h1 className="truncate font-heading text-base font-extrabold text-ink">
            {script.title}
          </h1>
          <span className="tnum flex-shrink-0 text-sm font-bold text-muted">
            {active + 1} / {lines.length}
          </span>
        </div>

        {/* Реальное видео с YouTube (живой голос) */}
        <div className="relative aspect-video w-full overflow-hidden rounded-card bg-black">
          <div ref={mountRef} className="absolute inset-0 h-full w-full" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
              Загружаю видео…
            </div>
          )}
        </div>

        {/* Транскрипт для чтения и повтора */}
        <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
          {lines.map((l, idx) => {
            const on = idx === active;
            return (
              <button
                key={idx}
                onClick={() => jumpTo(idx)}
                className={`block w-full rounded-soft border p-3 text-left transition-colors ${
                  on ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface"
                }`}
              >
                <span
                  className={`block text-[16px] leading-snug ${
                    on ? "font-semibold text-brand-ink" : "text-muted"
                  }`}
                >
                  {l.en}
                </span>
                {on && showTr && l.ru && (
                  <span className="mt-1 block text-sm text-muted">{l.ru}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Панель управления */}
        <div className="mt-3 rounded-2xl border border-line bg-surface p-3 shadow-card">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => step(-1)}
              aria-label="Предыдущая строка"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink disabled:opacity-40"
              disabled={!ready || active === 0}
            >
              <Prev className="h-6 w-6" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={playing ? "Пауза" : "Смотреть"}
              disabled={!ready}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-float disabled:opacity-50"
            >
              {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Следующая строка"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink disabled:opacity-40"
              disabled={!ready || active === lines.length - 1}
            >
              <Next className="h-6 w-6" />
            </button>
          </div>

          <div className={`mt-3 grid gap-2 ${hasTr ? "grid-cols-3" : "grid-cols-2"}`}>
            <Btn on={loop} onClick={toggleLoop} icon={<Repeat className="h-4 w-4" />} label="Цикл строки" />
            <Btn on={rateIdx > 0} onClick={cycleRate} icon={<Gauge className="h-4 w-4" />} label={`${RATES[rateIdx]}×`} />
            {hasTr && (
              <Btn
                on={showTr}
                onClick={() => setShowTr((v) => !v)}
                icon={<span className="font-heading text-[11px] font-extrabold">RU</span>}
                label="Перевод"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Btn({
  on,
  onClick,
  icon,
  label,
}: {
  on?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 text-[11px] font-bold transition-colors ${
        on ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
