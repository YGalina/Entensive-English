"use client";

type SpeakOptions = {
  rate?: number;
  interrupt?: boolean;
  onEnd?: () => void;
  onError?: () => void;
};

const GOOD_VOICE_NAMES = [
  "samantha",
  "ava",
  "allison",
  "nicky",
  "daniel",
  "serena",
  "moira",
  "tessa",
  "karen",
  "google us english",
  "google uk english",
  "microsoft aria",
  "microsoft jenny",
  "microsoft guy",
  "microsoft libby",
  "microsoft sonia",
];

const BAD_VOICE_NAMES = [
  "albert",
  "bahh",
  "bells",
  "boing",
  "bubbles",
  "cellos",
  "deranged",
  "fred",
  "hysterical",
  "junior",
  "organ",
  "ralph",
  "trinoids",
  "whisper",
  "zarvox",
];

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang === "en-us") score += 40;
  else if (lang === "en-gb") score += 34;
  else if (lang.startsWith("en-")) score += 24;
  else if (lang.startsWith("en")) score += 12;

  const goodIndex = GOOD_VOICE_NAMES.findIndex((v) => name.includes(v));
  if (goodIndex >= 0) score += 80 - goodIndex;
  if (BAD_VOICE_NAMES.some((v) => name.includes(v))) score -= 100;
  if (voice.localService) score += 4;

  return score;
}

function bestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (english.length === 0) return null;
  return english.sort((a, b) => voiceScore(b) - voiceScore(a))[0] ?? null;
}

export function speakEnglish(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = text.trim();
  if (!clean) return;

  try {
    const synth = window.speechSynthesis;
    const interrupt = options.interrupt ?? true;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.voice = bestEnglishVoice();
    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = () => options.onError?.();

    // Chrome/Safari баг: cancel() сразу перед speak() часто «глотает» новую
    // реплику — поэтому при быстрой смене слов в киносеансе звука не было.
    // Прерываем, затем говорим на следующем тике, дав движку сброситься.
    const busy = synth.speaking || synth.pending;
    if (interrupt && busy) {
      synth.cancel();
      setTimeout(() => {
        try {
          synth.speak(utterance);
        } catch {}
      }, 90);
    } else {
      synth.speak(utterance);
    }
  } catch {}
}

export function warmEnglishVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
}
