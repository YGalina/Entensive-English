// «Марина» на мобильном: единственный источник — @ie/tokens (тот же, что у web).
// Хук отдаёт цвета текущей темы + флаги навыков + радиусы.

import { useSyncExternalStore } from "react";
import { marina, marinaColors, marinaSkills, type MarinaMode } from "@ie/tokens";
import { storage } from "@ie/core/storage";
import { useColorScheme } from "@/hooks/use-color-scheme";

/* Переопределение темы из профиля: системная / светлая / тёмная.
   Хранится на устройстве (ie_theme_mode); «системная» — дефолт. */
export type ThemePref = "system" | "light" | "dark";
const THEME_KEY = "ie_theme_mode";
const themeListeners = new Set<() => void>();

export function setThemePref(v: ThemePref) {
  storage().setItem(THEME_KEY, v);
  themeListeners.forEach((l) => l());
}

function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  const un = storage().subscribeExternal(cb);
  return () => {
    themeListeners.delete(cb);
    un();
  };
}

function themeSnapshot(): ThemePref {
  const v = storage().getItem(THEME_KEY);
  // Дефолт — СВЕТЛАЯ (фидбэк Галины: тёмная «полночь» мрачновата как первое
  // впечатление). Системную/тёмную можно выбрать в профиле.
  return v === "light" || v === "dark" || v === "system" ? (v as ThemePref) : "light";
}

export function useThemePref(): ThemePref {
  return useSyncExternalStore(subscribeTheme, themeSnapshot, () => "system");
}

export function useMarina() {
  const pref = useThemePref();
  const system: MarinaMode = useColorScheme() === "dark" ? "dark" : "light";
  const mode: MarinaMode = pref === "system" ? system : pref;
  return {
    mode,
    c: marinaColors(mode),
    sk: marinaSkills(mode),
    radius: marina.radius,
  };
}

/** Флаг навыка по CSS-имени тона из @ie/core (dayplan хранит "--sk-*"). */
export function skillTone(
  tone: string,
  sk: ReturnType<typeof useMarina>["sk"],
  brand: string
): string {
  const key = tone.replace("--sk-", "") as keyof typeof sk;
  return tone === "--brand" ? brand : (sk[key] ?? brand);
}
