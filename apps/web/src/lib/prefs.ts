"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { LangCode } from "@/data/catalog";

export type Prefs = {
  /** Родной язык ученика (слой перевода). Target всегда English. */
  nativeLang: LangCode;
  /** Язык интерфейса (пока ru; архитектура под расширение) */
  uiLang: "ru" | "en";
  goal: string;
  topics: string[];
  level: string;
  /** Текущий день программы интенсива (1..N) */
  programDay?: number;
  /** Темп прохождения сеанса по умолчанию: обычный или медленный */
  pace?: "normal" | "slow";
  /** Имя выбранного голоса озвучки (SpeechSynthesisVoice.name) */
  voiceName?: string;
};

const KEY = "ie_prefs";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Возвращаем сырую строку — стабильный снапшот для useSyncExternalStore. */
function getSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(normalizePrefs(p)));
  } catch {}
  emit();
}

export function loadPrefs(): Prefs | null {
  const raw = getSnapshot();
  return raw ? normalizePrefs(JSON.parse(raw) as Prefs) : null;
}

/** Точечно обновить настройки (merge с текущими). */
export function updatePrefs(patch: Partial<Prefs>) {
  const cur = loadPrefs();
  if (!cur) return;
  savePrefs({ ...cur, ...patch });
}

/** Реактивный доступ к настройкам. null = онбординг не пройден. */
export function usePrefs(): Prefs | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "");
  return useMemo(() => (raw ? normalizePrefs(JSON.parse(raw) as Prefs) : null), [raw]);
}

export function useNativeLang(): LangCode {
  const prefs = usePrefs();
  return prefs?.nativeLang ?? "ru";
}

/** Язык интерфейса приложения. Не влияет на язык перевода слов. */
export function useUILang(): "ru" | "en" {
  const prefs = usePrefs();
  return prefs?.uiLang === "en" ? "en" : "ru";
}

/** Темп сеанса по умолчанию (обычный/медленный). */
export function usePace(): "normal" | "slow" {
  const prefs = usePrefs();
  return prefs?.pace === "slow" ? "slow" : "normal";
}

function normalizePrefs(p: Prefs): Prefs {
  // Legacy fix: older profile UI accidentally wrote nativeLang="en" when the user
  // only wanted an English interface. Since target language is English, translations
  // should default back to Russian instead of English definitions.
  if (p.nativeLang === "en") return { ...p, nativeLang: "ru" };
  return p;
}
