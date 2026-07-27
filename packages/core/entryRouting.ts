// ===== Entry / Resume routing foundation (PR 2) =====
// Мост между локальным хранилищем и контрактом `computeNextStep` (PR 1).
// S1 Entry/Resume Router — это ПРОЕКЦИЯ: он читает состояние, вычисляет один
// следующий шаг и отдаёт продуктовый маршрут. Он НИКОГДА не пишет прогресс/
// свидетельства (те пишут authoritative-владельцы через progress/evidence-
// события, см. `eventCategories.ts`).
//
// Ключи ниже роутер только ЧИТАЕТ. Их authoritative-писатели появляются в
// следующих PR (Profile — профиль; Protocol — этап; Daily Engine — шаг/recovery;
// проверка целостности — integrity; Billing — entitlement-проекция).

"use client";

import { storage } from "./storage";
import { computeNextStep, type PathState, type PathNextStep, type NextStepKind } from "./pathNextStep";
import { SCREENS, type ScreenId } from "./routes";
import { needsRecovery } from "./slice";

/** Ключи хранилища, читаемые роутером входа (write — в будущих PR). */
export const ENTRY_KEYS = {
  /**
   * Активная локальная траектория. Все привязанные к пути записи (профиль и др.)
   * действительны, только если их штамп совпадает с этим id. Перезапуск после
   * повреждения создаёт НОВЫЙ id — старые записи перестают принадлежать пути.
   */
  activePath: "ie_active_path",
  integrityBlocked: "ie_integrity_blocked", // "1" — стор повреждён без восстановления
  profile: "ie_profile", // присутствие ключа = профиль записан (owner: Profile)
  profilePath: "ie_profile_path", // id пути, которому принадлежит профиль
  resumeDraft: "ie_resume_draft", // "1" — есть возобновляемый черновик
  openProtocolStage: "ie_open_protocol_stage", // ScreenId открытого этапа (owner: Protocol)
  recoveryNeeded: "ie_recovery_needed", // "1" — нужна Recovery (owner: Daily Engine)
  dailyStep: "ie_daily_step", // ScreenId следующего шага (owner: Daily Engine)
  dailyStepLocked: "ie_daily_step_locked", // "1" — шаг за подпиской (проекция Billing)
} as const;

const SCREEN_IDS: ReadonlySet<string> = new Set(SCREENS.map((s) => s.id));

/** Принять строку только если это известный ScreenId; иначе undefined. */
function asScreenId(v: string | null): ScreenId | undefined {
  return v && SCREEN_IDS.has(v) ? (v as ScreenId) : undefined;
}

function flag(key: string): boolean {
  return storage().getItem(key) === "1";
}

/** Id активной локальной траектории (null — ещё не заведена). */
export function activeLocalPath(): string | null {
  return storage().getItem(ENTRY_KEYS.activePath);
}

/**
 * Профиль засчитывается, ТОЛЬКО если он существует и принадлежит активной
 * локальной траектории (штамп профиля === активный путь). После перезапуска
 * активный путь меняется, поэтому старый профиль автоматически игнорируется —
 * никакого тихого переиспользования прежнего профиля.
 */
function hasActiveProfile(): boolean {
  const s = storage();
  if (s.getItem(ENTRY_KEYS.profile) == null) return false;
  const bound = s.getItem(ENTRY_KEYS.profilePath);
  const active = s.getItem(ENTRY_KEYS.activePath);
  return bound != null && active != null && bound === active;
}

/** Построить проекцию Path из локального хранилища (ТОЛЬКО чтение). */
export function readPathState(): PathState {
  return {
    integrityBlocked: flag(ENTRY_KEYS.integrityBlocked),
    hasProfile: hasActiveProfile(),
    hasResumableDraft: flag(ENTRY_KEYS.resumeDraft),
    openProtocolStage: asScreenId(storage().getItem(ENTRY_KEYS.openProtocolStage)),
    recoveryNeeded: flag(ENTRY_KEYS.recoveryNeeded) || needsRecovery(),
    dailyStep: asScreenId(storage().getItem(ENTRY_KEYS.dailyStep)),
    dailyStepLocked: flag(ENTRY_KEYS.dailyStepLocked),
  };
}

/**
 * Продуктовые маршруты назначения (mobile, expo-router). Destination-экраны,
 * ещё не реализованные в PR 2, ведут на нейтральный `/entry/coming-soon`
 * (вид шага передаётся параметром только для внутренней телеметрии).
 */
export const ENTRY_ROUTES = {
  "integrity-blocked": "/entry/integrity-blocked",
  onboarding: "/entry/recognition",
  "resume-draft": "/entry/coming-soon",
  "protocol-stage": "/entry/coming-soon",
  recovery: "/entry/recovery",
  "daily-cycle": "/entry/coming-soon",
  "path-hub": "/entry/path-hub",
} as const satisfies Record<NextStepKind, string>;

export type ProductRoute =
  | (typeof ENTRY_ROUTES)[NextStepKind]
  | "/entry/pretest"
  | "/entry/assessment-wait"
  | "/entry/daily-session"
  | "/entry/recovery";

/** Маршрут для вычисленного шага. */
export function routeForStep(step: PathNextStep): ProductRoute {
  if (step.kind === "protocol-stage") {
    if (step.screenId === "S7") return "/entry/pretest";
    if (step.screenId === "S8") return "/entry/assessment-wait";
  }
  if (step.kind === "daily-cycle" && step.screenId === "S5") {
    return "/entry/daily-session";
  }
  return ENTRY_ROUTES[step.kind];
}

/** Полное разрешение входа: проекция → один следующий шаг → продуктовый маршрут. */
export function resolveEntryRoute(): { step: PathNextStep; route: ProductRoute } {
  const step = computeNextStep(readPathState());
  return { step, route: routeForStep(step) };
}

/**
 * Явное подтверждение перезапуска после блокировки целостности.
 * Создаёт СВЕЖУЮ локальную траекторию (новый id) и очищает проекции, которые не
 * должны переноситься: integrity, черновик, recovery, шаг дня и открытый этап
 * протокола. Прежний профиль НЕ переиспользуется молча — он остаётся привязан к
 * старому пути и потому игнорируется. Возвращает новый путь и маршрут на S2.
 *
 * `now` инъектируется (по умолчанию Date.now()) — чистое, тестируемое поведение.
 */
export function confirmIntegrityRestart(now: number = Date.now()): {
  activePath: string;
  route: ProductRoute;
} {
  const s = storage();
  const prev = s.getItem(ENTRY_KEYS.activePath);
  let fresh = `path-${now}`;
  if (fresh === prev) fresh = `${fresh}-r`; // гарантируем отличие от прежнего пути
  s.setItem(ENTRY_KEYS.activePath, fresh);

  // Сбрасываем проекции, которые не должны пережить перезапуск.
  s.setItem(ENTRY_KEYS.integrityBlocked, "0");
  s.setItem(ENTRY_KEYS.resumeDraft, "0");
  s.setItem(ENTRY_KEYS.recoveryNeeded, "0");
  s.setItem(ENTRY_KEYS.dailyStepLocked, "0");
  s.setItem(ENTRY_KEYS.dailyStep, ""); // "" — невалидный ScreenId → игнорируется
  s.setItem(ENTRY_KEYS.openProtocolStage, "");

  // Профиль не удаляем, но он привязан к прежнему пути → hasActiveProfile() = false.
  return { activePath: fresh, route: ENTRY_ROUTES.onboarding };
}

/**
 * Learner-facing копирайт входа/целостности. Строки из замороженных дизайнов
 * (Batch A S1/S2/S4; Recovery/Integrity S1). Держатся здесь, чтобы (а) mobile-
 * оболочки не расходились в тексте и (б) copy-firewall мог их проверять в тестах.
 * Ни одного research/pilot/guardian/streak/CEFR-термина.
 */
export const ENTRY_COPY = {
  brand: "Intensive English",
  entryStatus: "Открываем твой следующий шаг…",
  recognitionKicker: "ЗНАКОМЫЙ МОМЕНТ",
  recognitionLine: "Понимаешь больше, чем можешь сказать.",
  recognitionCta: "Это про меня",
  pathHubKicker: "СЕГОДНЯ · ПЕРВЫЙ ШАГ",
  pathHubTitle: "Проверим, что уже вспоминается",
  pathHubLead: "Короткие фразы о жизни и работе — по одной на экран.",
  pathHubCta: "Начать",
  integrityTitle: "Не получилось открыть твой прежний прогресс",
  integrityLead:
    "Часть сохранённых записей повреждена, и сейчас нет подтверждённого способа их восстановить. Прежний путь на паузе, пока это не решится.",
  integrityRetry: "Попробовать позже",
  integrityRestart: "Начать заново",
  restartTitle: "Начать заново?",
  restartLead:
    "Начнётся новый путь с самого начала. Прежний прогресс не продолжится и не добавится позже. Отменить это действие будет нельзя.",
  restartAck: "Я понимаю: прежний путь не продолжится",
  restartConfirm: "Начать новый путь",
  restartCancel: "Вернуться",
  comingSoonTitle: "Этот шаг скоро откроется",
  comingSoonLead: "Мы готовим его. Пока он недоступен — вернись сюда чуть позже.",
  comingSoonBack: "Назад",
} as const;
