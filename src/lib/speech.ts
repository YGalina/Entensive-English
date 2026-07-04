"use client";

type SpeakOptions = {
  rate?: number;
  interrupt?: boolean;
  onEnd?: () => void;
  onError?: () => void;
  /** Явное имя голоса (для прослушивания в настройках) */
  voiceName?: string;
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

// Novelty-голоса macOS (звучат как шутка/пьяный робот) — никогда не выбирать сами.
const BAD_VOICE_NAMES = [
  "albert",
  "bad news",
  "good news",
  "bahh",
  "bells",
  "boing",
  "bubbles",
  "cellos",
  "deranged",
  "fred",
  "hysterical",
  "jester",
  "junior",
  "organ",
  "ralph",
  "superstar",
  "trinoids",
  "whisper",
  "wobble",
  "zarvox",
];
// Eloquence-семейство (Eddy, Flo…) — роботизированные, тоже вниз списка.
const ROBOTIC_VOICE_NAMES = ["eddy", "flo", "grandma", "grandpa", "reed", "rocko", "sandy", "shelley", "kathy"];

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang === "en-us") score += 40;
  else if (lang === "en-gb") score += 34;
  else if (lang.startsWith("en-")) score += 24;
  else if (lang.startsWith("en")) score += 12;

  // Премиальные движки — сильный бонус.
  if (/premium|enhanced|natural|neural|siri/.test(name)) score += 70;
  if (name.includes("compact")) score -= 40;

  const goodIndex = GOOD_VOICE_NAMES.findIndex((v) => name.includes(v));
  if (goodIndex >= 0) score += 80 - goodIndex;
  if (BAD_VOICE_NAMES.some((v) => name.includes(v))) score -= 500;
  if (ROBOTIC_VOICE_NAMES.some((v) => name === v || name.startsWith(v + " "))) score -= 60;
  if (voice.localService) score += 4;

  return score;
}

/** Все английские голоса системы, отсортированные от лучшего к худшему. */
export function listEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

/** Имя голоса, выбранного пользователем в профиле (ie_prefs.voiceName). */
function savedVoiceName(): string | null {
  try {
    const raw = localStorage.getItem("ie_prefs");
    if (!raw) return null;
    const p = JSON.parse(raw) as { voiceName?: string };
    return p.voiceName || null;
  } catch {
    return null;
  }
}

function pickVoice(explicit?: string): SpeechSynthesisVoice | null {
  const voices = listEnglishVoices();
  if (voices.length === 0) return null;
  const wanted = explicit ?? savedVoiceName();
  if (wanted) {
    const exact = voices.find((v) => v.name === wanted);
    if (exact) return exact;
  }
  return voices[0] ?? null;
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
    utterance.voice = pickVoice(options.voiceName);
    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = () => options.onError?.();

    const speakNow = () => {
      try {
        // Chrome иногда «залипает» в состоянии paused → полная тишина. resume()
        // безвреден, если не на паузе, и восстанавливает звук, если завис.
        synth.resume();
        synth.speak(utterance);
      } catch {}
    };

    // Chrome/Safari баг: cancel() сразу перед speak() часто «глотает» новую
    // реплику — поэтому при быстрой смене слов в киносеансе звука не было.
    // Прерываем, затем говорим на следующем тике, дав движку сброситься.
    const busy = synth.speaking || synth.pending;
    if (interrupt && busy) {
      synth.cancel();
      setTimeout(speakNow, 90);
    } else {
      speakNow();
    }
  } catch {}
}

export function warmEnglishVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
}
