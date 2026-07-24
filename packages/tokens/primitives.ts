// ===== Living Content — общий контракт UI-примитивов (PR 1 · foundation) =====
// Единый, платформо-независимый источник спецификаций примитивов интерфейса.
// Обе платформы (mobile RN + web CSS) читают ОТСЮДА, чтобы кнопка, карточка,
// пилюля и роль текста были одинаковыми по геометрии и доступности.
//
// Это НЕ редизайн: значения берутся из замороженной дизайн-системы
// (`packages/tokens/index.ts` → `marina`) и из зафиксированного QA-базлайна
// (Batch A / Codex C3 / F0): вьюпорт 390×844, body ≥16, вторичный ≥14,
// хит-таргеты ≥44, один терракотовый CTA на экран. Здесь — только контракт
// (данные + типы), без рендеринга и без экранов.
//
// Правила доступности (зафиксированы): все интерактивные элементы ≥44×44;
// body-текст обычно ≥16; вторичный ≥14; видимый focus-ring для клавиатуры;
// анимации тихие и отключаемые (prefers-reduced-motion).

import { marina } from "./index";

/** Канонический вьюпорт реализации (не презентационный превью-масштаб). */
export const IMPLEMENTATION_VIEWPORT = { width: 390, height: 844 } as const;

/** Минимальные размеры (px). Ниже этих значений опускаться нельзя. */
export const A11Y = {
  /** Минимальная сторона любой интерактивной цели. */
  minTouchTarget: 44,
  /** Обычный минимум для основного текста. */
  minBodyFontSize: 16,
  /** Обычный минимум для вспомогательного текста. */
  minSecondaryFontSize: 14,
} as const;

/** Радиусы — реэкспорт из замороженной системы (§05). */
export const RADIUS = marina.radius; // { card:16, soft:12, sheet:22, pill:999 }

/** Видимое состояние фокуса клавиатуры (web); reuse-map §6.3. */
export const FOCUS_RING = { width: 2, offset: 2, colorToken: "brand" } as const;

/** Роли текста → минимальный кегль и семейство. Кегль не опускать ниже min. */
export type TextRole = "display" | "title" | "body" | "secondary" | "caption" | "english";
export const TEXT_ROLE: Record<TextRole, { minFontSize: number; family: "heading" | "body" | "english" }> = {
  display: { minFontSize: 28, family: "heading" },
  title: { minFontSize: 20, family: "heading" },
  body: { minFontSize: A11Y.minBodyFontSize, family: "body" },
  secondary: { minFontSize: A11Y.minSecondaryFontSize, family: "body" },
  caption: { minFontSize: A11Y.minSecondaryFontSize, family: "body" },
  // Английский контент всегда набирается Lora (голос языка).
  english: { minFontSize: A11Y.minBodyFontSize, family: "english" },
} as const;

/**
 * Варианты кнопки. Каждый указывает СМЫСЛОВОЙ токен цвета (ключ из marina.color),
 * а не хардкод. `assessment` — нейтральный оценочный режим: без терракоты,
 * без наград (Batch A/оценочное семейство). `primary` — единственный CTA экрана.
 */
export type ButtonVariant = "primary" | "ghost" | "quiet" | "assessment";
export const BUTTON: Record<ButtonVariant, { minHeight: number; fillToken: keyof MarinaColorKeys | "transparent" | "surface"; borderToken?: keyof MarinaColorKeys }> = {
  primary: { minHeight: 54, fillToken: "brand" },
  ghost: { minHeight: 48, fillToken: "transparent", borderToken: "line" },
  quiet: { minHeight: 48, fillToken: "surface" },
  assessment: { minHeight: 48, fillToken: "surface", borderToken: "line" },
} as const;

/** Поверхность-карточка: ведущая (2px терракота) или обычная. */
export type SurfaceVariant = "leading" | "plain";
export const SURFACE: Record<SurfaceVariant, { radius: number; borderWidth: number; borderToken?: keyof MarinaColorKeys }> = {
  leading: { radius: RADIUS.card, borderWidth: 2, borderToken: "brand" },
  plain: { radius: RADIUS.card, borderWidth: 0 },
} as const;

/** Пилюля выбора (radius 999). Выбранная — терракота/wash. */
export const PILL = { radius: RADIUS.pill, minHeight: A11Y.minTouchTarget } as const;

/** Ключи смысловых цветов темы (для типобезопасных ссылок из примитивов). */
type MarinaColorKeys = typeof marina.color.light;

/** Проверка, что размер удовлетворяет минимальной цели касания. */
export function meetsTouchTarget(px: number): boolean {
  return px >= A11Y.minTouchTarget;
}

/** Проверка, что кегль роли не ниже её минимума. */
export function fontSizeAllowed(role: TextRole, px: number): boolean {
  return px >= TEXT_ROLE[role].minFontSize;
}
