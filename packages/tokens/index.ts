// ===== Дизайн-система «Living Content» — ЕДИНЫЙ источник истины =====
// Палитра «Бумага и чернила» (Галина, дизайн-система v1, июль 2026 — см.
// docs/design/): тёплая бумага и уверенные чернила, среда чтения и слушания,
// где английский уже живёт. Терракота — бренд и CTA; амбер подсвечивает новое
// слово, мята — знакомое и успех, роза — мягкая поправка (красного цвета
// ошибки в системе НЕТ). Взрослый продукт: без сюсюканья и без давления.
//
// ⚠️ Эта система ОСОЗНАННО заменяет прежнюю «Морскую волну»: тёплая бумага —
// теперь основа (прежний «запрет бежа» снят), фиолет разрешён для навыка
// «Письмо». Значения — из docs/design/project/…Design System.dc.html.
//
// Отсюда питаются ОБЕ платформы:
//   • web  — CSS-переменные в globals.css (значения обязаны совпадать с этим файлом;
//            marinaGlobalsCss() умеет их сгенерировать для будущего codegen-шага);
//   • mobile — ThemeProvider (useMarina) читает этот объект напрямую.

export type MarinaMode = "light" | "dark";

/** Смысловые цвета одной темы (то, что на web живёт в :root / .dark). */
export type MarinaColors = {
  /** Терракота — бренд и главный CTA. */
  brand: string;
  brandD: string;
  /** wash — тёплая бумажная подложка (пилюли, мягкие блоки). */
  brandSoft: string;
  brandInk: string;
  /** Текст/иконки ПОВЕРХ заливки brand или флага навыка. Светлая тема: белый;
   *  тёмная (focus «свет лампы»): глубокая бумага — не хардкодить #fff. */
  onBrand: string;
  /** Мята — знакомое слово, успех, прогресс усвоения. */
  accent: string;
  accentD: string;
  /** Латунь — радость, постоянство. */
  sun: string;
  /** Амбер — НОВОЕ слово (заливка-маркер). Текст поверх — тёмный ink. */
  amber: string;
  /** Роза — мягкая поправка и психологическая опора (вместо красного). */
  rose: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  ok: string;
  warn: string;
  warnSoft: string;
};

/** Сигнальные флаги навыков — «мгновенно видно, где ты» (дизайн-система §02). */
export type SkillFlags = {
  words: string;
  sounds: string;
  typing: string;
  grammar: string;
  reading: string;
  video: string;
};

const light: MarinaColors = {
  brand: "#E8623D", // терракота — бренд и CTA
  brandD: "#C94E2D", // глубже — ховеры, мелкий текст-ссылка
  brandSoft: "#EFE7D7", // wash — тёплая бумажная подложка
  brandInk: "#4A453A", // тёплый тёмный текст на wash
  onBrand: "#FFFFFF", // текст на терракотовой заливке
  accent: "#4FB286", // мята — знакомое, успех, прогресс
  accentD: "#3F9D76",
  sun: "#E8B36A", // латунь — радость, постоянство
  amber: "#FFD66B", // амбер — новое слово
  rose: "#C75A7A", // роза — мягкая поправка, психоопора
  bg: "#FAF6EE", // paper — тёплая бумага (основа)
  surface: "#FFFFFF",
  ink: "#22201B", // чернила
  muted: "#6F6857", // тёплый серо-коричневый
  line: "#E3D9C4", // линии на бумаге
  ok: "#4FB286", // мята успеха
  warn: "#C99A3B", // охра
  warnSoft: "#FDF3E3",
};

const dark: MarinaColors = {
  // Focus «при свете лампы»: тёплая тёмная бумага, не ночная глубина
  // (дизайн-система §02). Используется в сессиях и вечернем круге, а как
  // тёмная тема системы — мягкий тёплый режим на всём приложении.
  brand: "#F0906E", // терракота, осветлённая для контраста на тёмном
  brandD: "#F4A588",
  brandSoft: "#2E2A22", // тёмная бумажная подложка
  brandInk: "#F0E6D6",
  onBrand: "#211D16", // тёмный текст на СВЕТЛОЙ терракотовой заливке
  accent: "#7FC9A4", // мята focus
  accentD: "#97D6B4",
  sun: "#E8B36A", // латунь
  amber: "#F0C86A", // амбер в тёплой тьме
  rose: "#E07AA0", // роза focus
  bg: "#211D16", // focus фон — тёплая тёмная бумага
  surface: "#2E2A22",
  ink: "#F5EFE2", // тёплый светлый текст
  muted: "#9C937D",
  line: "#3A3327",
  ok: "#7FC9A4",
  warn: "#E8B36A",
  warnSoft: "#2E2A22",
};

const skillLight: SkillFlags = {
  words: "#E8623D", // Слова — терракота
  sounds: "#D99A2B", // Слух — тёплая охра/амбер
  typing: "#8A5FA8", // Письмо — фиолет (разрешён новой системой)
  grammar: "#4FB286", // Грамматика — мята
  reading: "#A8465F", // Чтение — ягодная роза
  video: "#4A7BA6", // Речь·видео — петроль-синий
};

const skillDark: SkillFlags = {
  words: "#F0906E", // терракота
  sounds: "#E8B36A", // латунь-амбер
  typing: "#B79BD8", // фиолет
  grammar: "#7FC9A4", // мята focus
  reading: "#D48BA0", // роза
  video: "#7BA9D0", // петроль
};

export const marina = {
  color: { light, dark },
  skill: { light: skillLight, dark: skillDark },
  // Радиусы дизайн-системы §05: control 12 · card 16 · sheet 22 · pill 999.
  radius: { card: 16, soft: 12, sheet: 22, pill: 999 },
  font: {
    heading: "GolosText", // Golos Text — голос интерфейса
    body: "GolosText",
    english: "Lora", // Lora — голос языка (английские слова, фразы, чтение)
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
  amber: "--amber",
  rose: "--rose",
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
