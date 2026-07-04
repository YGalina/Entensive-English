"use client";

// Звуковой фон фазы «Настройка»: мягкий дрон с бинауральным альфа-биением.
// Левое ухо 200 Гц, правое 210 Гц → мозг воспринимает разницу 10 Гц (альфа)
// и подстраивается к ней (частотное следование). Плюс тихая октава ниже для
// тепла. Генерируется Web Audio API — без аудиофайлов. Лучше в наушниках.

type AmbientHandle = {
  ctx: AudioContext;
  master: GainNode;
};

let handle: AmbientHandle | null = null;

const ALPHA_HZ = 10;
const CARRIER_HZ = 200;
const VOLUME = 0.045; // едва слышный фон, не мешает голосу установок

function makeVoice(
  ctx: AudioContext,
  freq: number,
  pan: number,
  gainValue: number,
  out: GainNode
) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = gainValue;
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  osc.connect(g).connect(p).connect(out);
  osc.start();
  return osc;
}

/** Включить фон (нужен пользовательский жест). Возвращает false, если Web Audio недоступен. */
export function startAmbient(): boolean {
  if (handle) return true;
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return false;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Бинауральная пара: 200 Гц слева, 210 Гц справа → 10 Гц альфа-биение.
    makeVoice(ctx, CARRIER_HZ, -1, 1, master);
    makeVoice(ctx, CARRIER_HZ + ALPHA_HZ, 1, 1, master);
    // Тёплая тихая октава ниже, по центру.
    makeVoice(ctx, CARRIER_HZ / 2, 0, 0.4, master);

    // Плавный вход ~2.5с, чтобы звук «проявился», а не включился.
    master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 2.5);

    void ctx.resume();
    handle = { ctx, master };
    return true;
  } catch {
    return false;
  }
}

/** Выключить фон с плавным затуханием. */
export function stopAmbient() {
  const h = handle;
  if (!h) return;
  handle = null;
  try {
    const t = h.ctx.currentTime;
    h.master.gain.cancelScheduledValues(t);
    h.master.gain.setValueAtTime(h.master.gain.value, t);
    h.master.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(() => {
      try {
        void h.ctx.close();
      } catch {}
    }, 1400);
  } catch {
    try {
      void h.ctx.close();
    } catch {}
  }
}

export function isAmbientOn(): boolean {
  return handle !== null;
}
