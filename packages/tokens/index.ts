// ===== Дизайн-система «Марина» — ЕДИНЫЙ источник истины =====
// Французская ривьера + Ralph Lauren preppy: глубокий navy, сигнальный красный,
// хрустящий белый, латунь. Бретонская полоска — фирменный декор. Без бежа,
// без индиго-фиолетового. У каждого навыка свой сигнальный цвет.
//
// Отсюда питаются ОБЕ платформы:
//   • web  — CSS-переменные в globals.css (значения обязаны совпадать с этим файлом;
//            marinaGlobalsCss() умеет их сгенерировать для будущего codegen-шага);
//   • mobile — конфиг NativeWind + ThemeProvider читают этот объект напрямую.
// Значения ниже 1:1 повторяют текущий apps/web/src/app/globals.css.

export type MarinaMode = "light" | "dark";

/** Смысловые цвета одной темы (то, что на web живёт в :root / .dark). */
export type MarinaColors = {
  brand: string;
  brandD: string;
  brandSoft: string;
  brandInk: string;
  accent: string;
  accentD: string;
  sun: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  ok: string;
  warn: string;
  warnSoft: string;
};

/** Сигнальные флаги навыков — «мгновенно видно, где ты». */
export type SkillFlags = {
  words: string;
  sounds: string;
  typing: string;
  grammar: string;
  reading: string;
  video: string;
};

const light: MarinaColors = {
  brand: "#1b3a6b", // морской navy
  brandD: "#12294e", // глубже — мелкий текст, ховеры
  brandSoft: "#e9f0f9", // ледяная волна — подложки пилюль
  brandInk: "#0e2240", // чернила капитана
  accent: "#d62839", // сигнальный красный (CTA)
  accentD: "#ab1f2e",
  sun: "#f2c14e", // латунь/золото фурнитуры
  bg: "#f7f9fc", // хрустящий холодный белый, НЕ беж
  surface: "#ffffff",
  ink: "#14213d",
  muted: "#5c6b84", // стальной
  line: "#e3e9f2",
  ok: "#178a50",
  warn: "#b45309",
  warnSoft: "#fef3e2",
};

const dark: MarinaColors = {
  // Ночная палуба: глубокий полночный navy + светлые сигнальные акценты
  brand: "#7ca7e8",
  brandD: "#a5c4f0",
  brandSoft: "#1b2b47",
  brandInk: "#dce8fa",
  accent: "#ff5a6e",
  accentD: "#ff8291",
  sun: "#f2c14e",
  bg: "#0b1526", // полночь над морем
  surface: "#14213a",
  ink: "#eff3fa",
  muted: "#93a3bc",
  line: "#24334e",
  ok: "#34d399",
  warn: "#f0b860",
  warnSoft: "#2c2516",
};

const skillLight: SkillFlags = {
  words: "#1b3a6b", // словарь/сеанс — navy
  sounds: "#d62839", // звуки/говорение — сигнальный красный
  typing: "#a06b1e", // набор — латунь
  grammar: "#177245", // времена — охотничий зелёный
  reading: "#8d2942", // чтение — бордо библиотеки
  video: "#0e7c7b", // shadowing — морская волна
};

const skillDark: SkillFlags = {
  words: "#7ca7e8",
  sounds: "#ff6b7a",
  typing: "#e0b252",
  grammar: "#35b37e",
  reading: "#e07a94",
  video: "#3fbdbb",
};

export const marina = {
  color: { light, dark },
  skill: { light: skillLight, dark: skillDark },
  radius: { card: 22, soft: 14 },
  font: {
    heading: "Nunito", // заголовки
    body: "Inter", // текст
  },
  /** Цвет статус-бара/темы для web-viewport, PWA-манифеста и нативного каркаса. */
  themeColor: light.brand,
} as const;

export function marinaColors(mode: MarinaMode): MarinaColors {
  return marina.color[mode];
}
export function marinaSkills(mode: MarinaMode): SkillFlags {
  return marina.skill[mode];
}

// --- Мост к web CSS-переменным (имена как в globals.css) --------------------
const CSS_NAME: Record<keyof MarinaColors, string> = {
  brand: "--brand",
  brandD: "--brand-d",
  brandSoft: "--brand-soft",
  brandInk: "--brand-ink",
  accent: "--accent",
  accentD: "--accent-d",
  sun: "--sun",
  bg: "--bg",
  surface: "--surface",
  ink: "--ink",
  muted: "--muted",
  line: "--line",
  ok: "--ok",
  warn: "--warn",
  warnSoft: "--warn-soft",
};
const SK_CSS_NAME: Record<keyof SkillFlags, string> = {
  words: "--sk-words",
  sounds: "--sk-sounds",
  typing: "--sk-typing",
  grammar: "--sk-grammar",
  reading: "--sk-reading",
  video: "--sk-video",
};

/** CSS-переменные одной темы (без селектора) — для будущего codegen globals.css. */
export function marinaThemeVars(mode: MarinaMode): string {
  const c = marinaColors(mode);
  const s = marinaSkills(mode);
  const lines = [
    ...(Object.keys(CSS_NAME) as (keyof MarinaColors)[]).map(
      (k) => `  ${CSS_NAME[k]}: ${c[k]};`,
    ),
    ...(Object.keys(SK_CSS_NAME) as (keyof SkillFlags)[]).map(
      (k) => `  ${SK_CSS_NAME[k]}: ${s[k]};`,
    ),
  ];
  return lines.join("\n");
}

/** Блоки :root{} и .dark{} — источник для генерации токен-части globals.css. */
export function marinaGlobalsCss(): string {
  return `:root {\n${marinaThemeVars("light")}\n}\n\n.dark {\n${marinaThemeVars("dark")}\n}\n`;
}
