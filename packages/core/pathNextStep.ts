// ===== PathNextStep contract (PR 1 · foundation) =====
// Контракт «одного следующего шага». Path — НАВИГАЦИОННАЯ ПРОЕКЦИЯ над
// authoritative-состояниями (Scheduler/Daily Engine — прогресс; Protocol —
// оценочный этап; Profile — предпочтения). Он ВЫЧИСЛЯЕТ следующий шаг и НЕ
// является источником истины: не пишет прогресс, не создаёт свидетельств, не
// «телепортирует» через прямой переход (03_INFORMATION_ARCHITECTURE §владение).
//
// Здесь — контракт (типы) + чистая детерминированная функция приоритета,
// повторяющая порядок S1 Resume Router. Полные экраны и реальная навигация —
// в следующих PR; эта функция даёт им единый безопасный контракт.

import type { ScreenId } from "./routes";

/** Вид следующего шага (для UI и телеметрии; не learner-facing строка). */
export type NextStepKind =
  | "integrity-blocked" // повреждён стор без источника восстановления — блок
  | "onboarding" // не онбордена
  | "resume-draft" // есть возобновляемый черновик
  | "protocol-stage" // открыт оценочный/протокольный этап (owner: Protocol)
  | "recovery" // возврат после паузы — предложить Recovery
  | "daily-cycle" // обычный следующий шаг обучения
  | "path-hub"; // нет ведущего шага — показать хаб-ориентир

export type PathNextStep = {
  kind: NextStepKind;
  /** Экран назначения (только продуктовый id). */
  screenId: ScreenId;
  /** Внутренняя причина выбора (не learner-facing). */
  reason: string;
  /** Шаг заблокирован платным доступом (проекция entitlement; не гейтит истину). */
  locked?: boolean;
};

/**
 * Проекция authoritative-состояния — ТОЛЬКО для чтения. Path не владеет ничем
 * из этого; поля заполняются владельцами (Profile/Protocol/Daily Engine/Journal).
 */
export type PathState = Readonly<{
  /** Локальный стор повреждён и нет подтверждённого источника восстановления. */
  integrityBlocked: boolean;
  /** Профиль ученицы создан (онбординг завершён). */
  hasProfile: boolean;
  /** Есть возобновляемый черновик прерванного шага. */
  hasResumableDraft: boolean;
  /** Открыт протокольный этап (owner: Protocol); id этапа-экрана, если есть. */
  openProtocolStage?: ScreenId;
  /** Возврат после паузы — нужна ли Recovery-сессия. */
  recoveryNeeded: boolean;
  /** Следующий обучающий шаг (проекция Daily Engine), если есть. */
  dailyStep?: ScreenId;
  /** Шаг доступен только по подписке (проекция entitlement). */
  dailyStepLocked?: boolean;
}>;

/**
 * Детерминированный приоритет одного следующего шага (порядок S1 Router):
 * целостность → онбординг → черновик → протокол → recovery → обучение → хаб.
 *
 * ЧИСТАЯ функция: читает проекцию, ничего не пишет. Прогресс/свидетельства
 * создаются исключительно authoritative-владельцами через progress/evidence-
 * события (см. `eventCategories.ts`).
 */
export function computeNextStep(state: PathState): PathNextStep {
  if (state.integrityBlocked) {
    // Не создаётся вторая pilot-identity; блок до честного разрешения целостности.
    return { kind: "integrity-blocked", screenId: "S1", reason: "local store corrupted without restore source" };
  }
  if (!state.hasProfile) {
    return { kind: "onboarding", screenId: "S2", reason: "no profile — recognition first" };
  }
  if (state.hasResumableDraft) {
    return { kind: "resume-draft", screenId: "S5", reason: "resumable interrupted draft" };
  }
  if (state.openProtocolStage) {
    // Порядок протокола неотменяем; переход только через валидацию Protocol.
    return { kind: "protocol-stage", screenId: state.openProtocolStage, reason: "open protocol stage (owner: Protocol)" };
  }
  if (state.recoveryNeeded) {
    return { kind: "recovery", screenId: "S6", reason: "return after pause — offer recovery" };
  }
  if (state.dailyStep) {
    return { kind: "daily-cycle", screenId: state.dailyStep, reason: "next daily learning step", locked: state.dailyStepLocked };
  }
  return { kind: "path-hub", screenId: "S4", reason: "no leading step — orientation hub" };
}
