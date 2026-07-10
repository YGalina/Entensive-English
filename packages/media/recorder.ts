"use client";

// Запись голоса (web): MediaRecorder + getUserMedia. Фаза A новой архитектуры —
// голосовой артефакт вывода. Приватно: запись остаётся blob-URL в памяти
// вкладки, никуда не отправляется (сервер и согласия — Фаза C).
// Контракт общий с recorder.native.ts (Metro сам выберет native-вариант).

import { useCallback, useEffect, useRef, useState } from "react";

/** Проиграть запись по uri (прослушать свой голос). Общий контракт с native. */
export async function playRecording(uri: string): Promise<void> {
  try {
    if (typeof Audio === "undefined") return;
    await new Audio(uri).play();
  } catch {}
}

export type VoiceRecorder = {
  /** платформа умеет записывать (на web — есть MediaRecorder и микрофон-API) */
  supported: boolean;
  recording: boolean;
  /** начать запись; false — нет разрешения/поддержки */
  start: () => Promise<boolean>;
  /** остановить; возвращает uri записи (blob: на web, file:// на телефоне) */
  stop: () => Promise<string | null>;
};

export function useVoiceRecorder(): VoiceRecorder {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const start = useCallback(async () => {
    if (!supported) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
      return true;
    } catch {
      return false;
    }
  }, [supported]);

  const stop = useCallback(async () => {
    const rec = mediaRef.current;
    if (!rec) return null;
    const uri = await new Promise<string | null>((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        resolve(blob.size > 0 ? URL.createObjectURL(blob) : null);
      };
      try {
        rec.stop();
      } catch {
        resolve(null);
      }
    });
    rec.stream.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    setRecording(false);
    return uri;
  }, []);

  // Размонтирование во время записи — глушим микрофон.
  useEffect(
    () => () => {
      mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    },
    []
  );

  return { supported, recording, start, stop };
}
