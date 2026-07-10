"use client";

// Запись голоса (iOS/Android) через expo-audio. Контракт — как у recorder.ts.
// Файл остаётся в sandbox приложения (file://…), никуда не уходит — приватность
// по умолчанию (09_architecture_plan.md §4.3).
//
// iOS: на время записи включаем allowsRecording, после — выключаем, чтобы
// плеер (музыка настройки) не переключался на «телефонный» маршрут звука.

import { useCallback, useState } from "react";
import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";

/** Проиграть запись по uri (прослушать свой голос). Общий контракт с web. */
export async function playRecording(uri: string): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    const player = createAudioPlayer({ uri });
    player.play();
  } catch {}
}

export type VoiceRecorder = {
  supported: boolean;
  recording: boolean;
  start: () => Promise<boolean>;
  stop: () => Promise<string | null>;
};

export function useVoiceRecorder(): VoiceRecorder {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);

  const start = useCallback(async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) return false;
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
      return true;
    } catch {
      return false;
    }
  }, [recorder]);

  const stop = useCallback(async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri ?? null;
      setRecording(false);
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
      return uri;
    } catch {
      setRecording(false);
      return null;
    }
  }, [recorder]);

  return { supported: true, recording, start, stop };
}
