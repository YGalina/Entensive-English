// Нативная озвучка (iOS/Android) через expo-speech. Metro выбирает этот файл
// вместо speech.ts автоматически (конвенция *.native.ts). API-контракт — тот же,
// что у web-реализации; зависимость expo-speech приходит из apps/mobile
// (hoisted в корень воркспейса).

import * as Speech from "expo-speech";

type SpeakOptions = {
  rate?: number;
  interrupt?: boolean;
  onEnd?: () => void;
  onError?: () => void;
  /** Идентификатор голоса платформы (Voice.identifier из expo-speech) */
  voiceName?: string;
};

/** Упрощённая форма голоса — для будущего выбора голоса в профиле mobile. */
export type NativeVoice = { name: string; lang: string; identifier: string };

let voicesCache: NativeVoice[] = [];

/**
 * Английские голоса системы. На native список асинхронный — прогреваем кэш
 * warmEnglishVoices() и отдаём то, что уже известно (пусто до прогрева).
 */
export function listEnglishVoices(): NativeVoice[] {
  return voicesCache;
}

export function warmEnglishVoices() {
  void Speech.getAvailableVoicesAsync()
    .then((voices) => {
      voicesCache = voices
        .filter((v) => (v.language ?? "").toLowerCase().startsWith("en"))
        .map((v) => ({ name: v.name, lang: v.language, identifier: v.identifier }));
    })
    .catch(() => {});
}

/** Системный TTS всегда «звучит» — веб-детектор немых голосов тут не нужен. */
export function speechLooksSilent(): boolean {
  return false;
}

function speak(text: string, lang: string, options: SpeakOptions, defaultRate: number) {
  const clean = text.trim();
  if (!clean) {
    options.onEnd?.();
    return;
  }
  const go = () => {
    let settled = false;
    const settle = (cb?: () => void) => {
      if (settled) return;
      settled = true;
      cb?.();
    };
    Speech.speak(clean, {
      language: lang,
      rate: options.rate ?? defaultRate,
      // На native сохранённое web-имя голоса не совпадает с identifier —
      // используем только явно переданный идентификатор, иначе голос системы.
      voice: options.voiceName,
      onDone: () => settle(options.onEnd),
      onStopped: () => settle(options.onEnd),
      onError: () => settle(options.onError),
    });
  };
  if (options.interrupt ?? true) {
    // stop() чистит и очередь, и текущую реплику — как cancel() на web.
    void Speech.stop().then(go, go);
  } else {
    go();
  }
}

export function speakEnglish(text: string, options: SpeakOptions = {}) {
  speak(text, "en-US", options, 0.92);
}

/** Русская озвучка (подсказки тренера). */
export function speakRussian(text: string, options: SpeakOptions = {}) {
  speak(text, "ru-RU", options, 1.0);
}
