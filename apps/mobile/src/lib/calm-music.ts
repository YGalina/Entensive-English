// Фоновая классика для психорегуляции (Лозанов/Петрусинский: спокойное
// барокко ≈60 уд/мин на фазе настройки; музыка — методический инструмент,
// а не украшение). Трек: Bach, Goldberg Aria — CC0 (см. assets/audio/LICENSE.md).

import { useEffect, useMemo, useRef } from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

// Музыка должна звучать и при боковом беззвучном переключателе:
// пользовательница явно вошла в сеанс — это намерение слышать.
let audioModeSet = false;
function ensureAudioMode() {
  if (audioModeSet) return;
  audioModeSet = true;
  void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

export type CalmMusic = {
  /** Плавно включить (громкость цели 0..1, по умолчанию мягкие 0.35) */
  start: (to?: number) => void;
  /** Плавно увести на новую громкость (например, 0.12 под голос TTS) */
  duck: (to: number) => void;
  /** Плавно выключить */
  stop: () => void;
};

export function useCalmMusic(): CalmMusic {
  ensureAudioMode();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const player = useAudioPlayer(require("../../assets/audio/bach-aria.mp3"));
  const fade = useRef<ReturnType<typeof setInterval> | null>(null);

  const api = useMemo<CalmMusic>(() => {
    const clear = () => {
      if (fade.current) clearInterval(fade.current);
      fade.current = null;
    };
    const rampTo = (target: number, thenPause = false) => {
      clear();
      fade.current = setInterval(() => {
        try {
          const v = player.volume;
          const next = v + (target > v ? 0.04 : -0.04);
          const done = Math.abs(next - target) <= 0.045;
          player.volume = done ? target : Math.min(1, Math.max(0, next));
          if (done) {
            clear();
            if (thenPause) player.pause();
          }
        } catch {
          clear();
        }
      }, 120);
    };
    return {
      start: (to = 0.35) => {
        try {
          player.loop = true;
          player.volume = 0;
          player.play();
          rampTo(to);
        } catch {}
      },
      duck: (to) => rampTo(to),
      stop: () => rampTo(0, true),
    };
    // player — стабильный объект хука expo-audio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(
    () => () => {
      if (fade.current) clearInterval(fade.current);
      try {
        player.pause();
      } catch {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return api;
}
