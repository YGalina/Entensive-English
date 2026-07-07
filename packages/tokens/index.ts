// ===== Дизайн-система «Марина» — ЕДИНЫЙ источник истины =====
// Палитра «Морская волна» (утв. Галиной 2026-07-07): тёплый teal морской волны,
// живой коралл для CTA, латунь для радости, тёплый морской белый. Женственно,
// спокойно, с воздухом — НЕ сухо и не по-мужски. Без бежа, без индиго/фиолета,
// без неона. У каждого навыка свой сигнальный цвет, гармоничный с teal+коралл.
//
// Отсюда питаются ОБЕ платформы:
//   • web  — CSS-переменные в globals.css (значения обязаны совпадать с этим файлом;
//            marinaGlobalsCss() умеет их сгенерировать для будущего codegen-шага);
//   • mobile — ThemeProvider (useMarina) читает этот объект напрямую.

export type MarinaMode = "light" | "dark";

/** Смысловые цвета одной темы (то, что на web живёт в :root / .dark). */
export type MarinaColors = {
  brand: string;
  brandD: string;
  brandSoft: string;
  brandInk: string;
  /** Текст/иконки ПОВЕРХ заливки brand или флага навыка. В светлой теме тона
   *  тёмные → белый; в тёмной тона светлые → глубокий морской. Никогда не
   *  хардкодить #fff на цветной заливке — иначе в тёмной теме не читается. */
  onBrand: string;
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
  brand: "#147e86", // teal морской волны
  brandD: "#0e5f66", // глубже — мелкий текст, ховеры
  brandSoft: "#e1f1f0", // пена волны — подложки пилюль
  brandInk: "#0c4a50", // морская глубина
  onBrand: "#ffffff", // текст на тёмной teal-заливке
  accent: "#f26a54", // живой коралл (CTA)
  accentD: "#d9503f",
  sun: "#e8b36a", // латунь/золото — радость, стрик
  bg: "#f5f9f8", // тёплый морской белый, НЕ беж
  surface: "#ffffff",
  ink: "#17383a", // чернила с teal-подтоном
  muted: "#5e7a7b", // морская сталь
  line: "#e2efed",
  ok: "#0f9c79", // морская зелень успеха
  warn: "#b4791f",
  warnSoft: "#fbf0de",
};

const dark: MarinaColors = {
  // Ночь над морем: глубокая СИНЯЯ морская ночь (не зелёно-мятная!) +
  // голубая волна и тёплый коралл. Фидбэк Галины 2026-07-07: прежняя тёмная
  // уходила в мяту и текст на светлых тонах не читался (см. onBrand).
  brand: "#54b9d8", // голубая волна (не мятный)
  brandD: "#7ecde6",
  brandSoft: "#0f3346", // глубокая волна — подложки
  brandInk: "#d7eef7",
  onBrand: "#07222c", // тёмный морской текст на СВЕТЛОЙ заливке волны
  accent: "#ff7a63",
  accentD: "#ff9683",
  sun: "#ecbe77",
  bg: "#0a1b26", // синяя ночь над морем
  surface: "#122735",
  ink: "#e9f2f7",
  muted: "#8fa9b8", // сине-серый
  line: "#224052",
  ok: "#37d0a0",
  warn: "#f0b860",
  warnSoft: "#2c2516",
};

const skillLight: SkillFlags = {
  words: "#147e86", // словарь/сеанс — teal (бренд)
  sounds: "#e0553d", // звуки/говорение — коралл
  typing: "#b7791f", // набор — латунь/охра
  grammar: "#2e8b6b", // времена — морская зелень
  reading: "#a8465f", // чтение — ягодная роза
  video: "#1e6e8c", // shadowing — петроль (глубокая вода)
};

const skillDark: SkillFlags = {
  words: "#54b9d8", // голубая волна
  sounds: "#ff8a73", // коралл
  typing: "#e2b45e", // латунь
  grammar: "#45c69b", // морская зелень (только флаг, не общий тон)
  reading: "#e88ba6", // ягодная роза
  video: "#6fbede", // петроль-голубой
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
  onBrand: "--on-brand",
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
