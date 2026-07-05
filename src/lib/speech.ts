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

/** Голос — «мусорный» (novelty-шутки и роботы Eloquence)? Таких не существует для нас. */
function isJunkVoice(v: SpeechSynthesisVoice): boolean {
  const name = v.name.toLowerCase();
  if (BAD_VOICE_NAMES.some((b) => name.includes(b))) return true;
  if (ROBOTIC_VOICE_NAMES.some((r) => name === r || name.startsWith(r + " "))) return true;
  return false;
}

/**
 * Английские голоса системы: от лучшего к худшему. Novelty-голоса
 * («пьяные роботы» macOS) исключены НАВСЕГДА — их нет ни в выборе, ни в списке.
 */
export function listEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const all = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const decent = all.filter((v) => !isJunkVoice(v));
  // Если нормальных нет вовсе — лучше молчание с советом, чем «бомж»: пусто.
  return decent.sort((a, b) => voiceScore(b) - voiceScore(a));
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

// Подряд идущие «не стартовавшие» реплики — признак немого голоса
// (например, network-голос без сети). UI может показать подсказку.
let silentStreak = 0;
export function speechLooksSilent(): boolean {
  return silentStreak >= 2;
}

export function speakEnglish(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.();
    return;
  }
  const clean = text.trim();
  if (!clean) {
    options.onEnd?.();
    return;
  }

  try {
    const synth = window.speechSynthesis;
    const interrupt = options.interrupt ?? true;
    const rate = options.rate ?? 0.92;
    const voice = pickVoice(options.voiceName);
    // Достойных голосов нет (в системе только novelty-мусор или пусто):
    // молчим и сигналим об ошибке — браузерный «дефолтный бомж» не пройдёт.
    if (!voice) {
      silentStreak += 1;
      options.onError?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Гарантия колбэка: браузер может не прислать ни onend, ни onerror
    // (немой network-голос, прерывание). Страхуемся таймерами, колбэк — один раз.
    let settled = false;
    let startedFlag = false;
    let startGuard: ReturnType<typeof setTimeout> | null = null;
    let endGuard: ReturnType<typeof setTimeout> | null = null;
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    const settle = (cb?: () => void) => {
      if (settled) return;
      settled = true;
      if (startGuard) clearTimeout(startGuard);
      if (endGuard) clearTimeout(endGuard);
      if (keepAlive) clearInterval(keepAlive);
      cb?.();
    };
    utterance.onstart = () => {
      startedFlag = true;
      silentStreak = 0;
    };
    utterance.onend = () => settle(options.onEnd);
    utterance.onerror = () => settle(options.onError);

    const speakNow = () => {
      try {
        // Chrome иногда «залипает» в состоянии paused → полная тишина. resume()
        // безвреден, если не на паузе, и восстанавливает звук, если завис.
        synth.resume();
        synth.speak(utterance);
        // Известный баг Chrome: речь длиннее ~15с глохнет без периодического
        // resume(). Держим движок живым, пока фраза не закончилась.
        keepAlive = setInterval(() => {
          try {
            if (!settled && synth.speaking) synth.resume();
          } catch {}
        }, 10000);
        // Не начал говорить за 2.8с → голос немой: снимаем и отдаём onError.
        startGuard = setTimeout(() => {
          if (!startedFlag && !settled) {
            silentStreak += 1;
            try {
              synth.cancel();
            } catch {}
            settle(options.onError);
          }
        }, 2800);
        // onend потерялся → закрываем по КОНСЕРВАТИВНОЙ оценке длительности
        // (медленнее реальной речи), чтобы страховка никогда не обрезала фразу
        // раньше голоса — иначе текст «убегает» от озвучки.
        const estMs = 2800 + (clean.length * 1000) / (8 * rate);
        endGuard = setTimeout(() => settle(options.onEnd), estMs + 3500);
      } catch {
        settle(options.onError);
      }
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

/** Лучший русский голос системы (для голосовых подсказок тренера). */
function pickRussianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("ru"));
  if (voices.length === 0) return null;
  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    let s = 0;
    if (/premium|enhanced|natural|neural|milena|google/.test(n)) s += 50;
    if (n.includes("compact")) s -= 40;
    return s;
  };
  return voices.sort((a, b) => score(b) - score(a))[0] ?? null;
}

/** Русская озвучка (подсказки тренера). Те же гарантии колбэка, что и у английской. */
export function speakRussian(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.();
    return;
  }
  const clean = text.trim();
  if (!clean) {
    options.onEnd?.();
    return;
  }
  try {
    const synth = window.speechSynthesis;
    const rate = options.rate ?? 1.0;
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "ru-RU";
    const v = pickRussianVoice();
    if (v) u.voice = v;
    u.rate = rate;

    let settled = false;
    let started = false;
    let startGuard: ReturnType<typeof setTimeout> | null = null;
    let endGuard: ReturnType<typeof setTimeout> | null = null;
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    const settle = (cb?: () => void) => {
      if (settled) return;
      settled = true;
      if (startGuard) clearTimeout(startGuard);
      if (endGuard) clearTimeout(endGuard);
      if (keepAlive) clearInterval(keepAlive);
      cb?.();
    };
    u.onstart = () => {
      started = true;
    };
    u.onend = () => settle(options.onEnd);
    u.onerror = () => settle(options.onError);

    const go = () => {
      try {
        synth.resume();
        synth.speak(u);
        keepAlive = setInterval(() => {
          try {
            if (!settled && synth.speaking) synth.resume();
          } catch {}
        }, 10000);
        startGuard = setTimeout(() => {
          if (!started && !settled) {
            try {
              synth.cancel();
            } catch {}
            settle(options.onError);
          }
        }, 2800);
        const estMs = 2800 + (clean.length * 1000) / (8 * rate);
        endGuard = setTimeout(() => settle(options.onEnd), estMs + 3500);
      } catch {
        settle(options.onError);
      }
    };

    if ((options.interrupt ?? true) && (synth.speaking || synth.pending)) {
      synth.cancel();
      setTimeout(go, 90);
    } else {
      go();
    }
  } catch {}
}
