// ===== Event categories (PR 1 · foundation) =====
// Типизированная таксономия доменных событий поверх свободной очереди `events.ts`.
// Кодирует инвариант IA: истину прогресса курса пишут ТОЛЬКО authoritative-
// владельцы (Scheduler/Daily Engine, Protocol/Evidence Store, Journal, SRS,
// Artifact Store). Всё остальное — process/navigation/system: это НЕ двигает Path
// и НЕ создаёт свидетельств (03_INFORMATION_ARCHITECTURE §владение).
//
// `progress`   — двигает прогресс курса (только PROGRESS_WRITERS).
// `evidence`   — пишет иммутабельное свидетельство/протокол (Protocol).
// `process`    — процесс-факт (часы, черновик, тап-перевод): НЕ двигает Path.
// `navigation` — переходы/маршрутизация: никогда не истина прогресса.
// `system`     — синк/аккаунт/оплата/ошибки: никогда не истина прогресса.

export type EventCategory = "progress" | "evidence" | "process" | "navigation" | "system";

/**
 * Классификация известных типов событий. Тип, которого здесь нет, по умолчанию
 * трактуется как `process` (безопасно: не двигает Path). Новые прогресс/evidence-
 * события ОБЯЗАНЫ регистрироваться здесь явно.
 */
export const EVENT_CATEGORY: Readonly<Record<string, EventCategory>> = {
  // progress — только Scheduler/Daily Engine и SRS-интервалы
  "session-completed": "progress",
  "srs-interval-updated": "progress",
  // evidence — только Protocol/Evidence Store (иммутабельно)
  "assessment-item-recorded": "evidence",
  "pretest-finished": "evidence",
  "new-context-recorded": "evidence",
  "holdout-recorded": "evidence",
  "pilot-finalized": "evidence",
  // process — факт активности, НЕ прогресс
  "time-add": "process",
  "artifact-created": "process",
  "draft-saved": "process",
  "translation-tapped": "process",
  "checkin-recorded": "process",
  "voice-artifact-saved": "process",
  // navigation
  "path-step-viewed": "navigation",
  "screen-opened": "navigation",
  // system
  "goal-set": "system",
  "reminder-scheduled": "system",
  "events-flushed": "system",
  "entitlement-changed": "system",
};

/**
 * Категории, которые МОГУТ писать истину прогресса/свидетельств.
 * Только эти события легитимно исходят от authoritative-владельцев.
 */
export const PROGRESS_WRITING_CATEGORIES: ReadonlySet<EventCategory> = new Set<EventCategory>([
  "progress",
  "evidence",
]);

/** Категория типа события (по умолчанию `process` — безопасно). */
export function categoryOf(type: string): EventCategory {
  return EVENT_CATEGORY[type] ?? "process";
}

/** Может ли это событие писать истину прогресса/свидетельств? */
export function mayWriteProgress(type: string): boolean {
  return PROGRESS_WRITING_CATEGORIES.has(categoryOf(type));
}

/**
 * Инвариант проекции: process/navigation/system-события НЕ двигают Path.
 * Возвращает true, если событие безопасно для проекции (не претендует на прогресс).
 */
export function isProjectionSafe(type: string): boolean {
  const c = categoryOf(type);
  return c === "process" || c === "navigation" || c === "system";
}

/**
 * Guard: бросает, если тип, помеченный как двигающий Path/прогресс, на самом деле
 * не относится к прогресс-категории. Используется контрактом PathNextStep, чтобы
 * проекция не могла подделать прогресс через process-событие.
 */
export function assertMayWriteProgress(type: string): void {
  if (!mayWriteProgress(type)) {
    throw new Error(
      `event-semantics: "${type}" (${categoryOf(type)}) не вправе писать прогресс; ` +
        `истину пишут только progress/evidence-владельцы (IA-инвариант).`,
    );
  }
}
