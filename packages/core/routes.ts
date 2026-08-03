// ===== Frozen screen route registry (PR 1 · foundation) =====
// Единый источник истины о том, КАКИЕ экраны продукта существуют, каков их
// статус и какие маршруты приложения НЕ готовы к продукту (legacy: pilot /
// guardian / streak / levelcheck). Это реестр-контракт: он не рендерит и не
// навигирует, он классифицирует. Экранные спецификации — в
// `experience_architecture/06_SCREEN_SPECIFICATIONS.md`; замороженные дизайны —
// в `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`.
//
// Правило: продуктовым может считаться только экран из SCREENS с productReady:true.
// Всё в LEGACY_ROUTES — не продуктовое (см. copy/semantic firewall).

/** Идентификатор утверждённого экрана продукта (спека 06: S1…S27, S15b). */
export type ScreenId =
  | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10"
  | "S11" | "S12" | "S13" | "S14" | "S15" | "S15b" | "S16" | "S17" | "S18"
  | "S19" | "S20" | "S21" | "S22" | "S23" | "S24" | "S25" | "S26" | "S27";

export type ScreenStatus = "implemented" | "planned" | "frozen-design";
export type Platform = "mobile" | "web" | "both";

export type ScreenRoute = {
  id: ScreenId;
  /** Внутреннее имя (не learner-facing). */
  name: string;
  platform: Platform;
  status: ScreenStatus;
  /** Готов к реализации как продуктовый экран. */
  productReady: boolean;
  /** Путь к замороженному дизайн-пакету, если есть. */
  frozenDesign?: string;
  notes?: string;
};

/**
 * Утверждённые экраны продукта. Статус и productReady согласованы со спекой 06 и
 * `IMPLEMENTATION_READY_DESIGN_INDEX.md`. Экраны без замороженного дизайна или в
 * статусе [PLAN] помечены productReady:false, пока их дизайн/правила не заморожены.
 */
export const SCREENS: readonly ScreenRoute[] = [
  { id: "S1", name: "Entry / Resume Router", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-a-defaults-final/" },
  { id: "S2", name: "Recognition", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-a-defaults-final/" },
  { id: "S3", name: "Profile Entry", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-a-defaults-final/" },
  { id: "S4", name: "Path Hub", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-a-defaults-final/" },
  { id: "S5", name: "Daily Cycle Session", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-c-correction-v1/" },
  { id: "S6", name: "Recovery Session", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/recovery-integrity-v1/" },
  { id: "S7", name: "Pretest", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-a-defaults-final/" },
  { id: "S8", name: "Assessment Gate / Wait", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-a-defaults-final/" },
  { id: "S9", name: "Trained Assessment", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-b-correction-v2/" },
  { id: "S10", name: "New-Context Task", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-b-correction-v2/" },
  { id: "S11", name: "Holdout Assessment", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-b-correction-v2/" },
  { id: "S12", name: "Finalization", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-b-correction-v2/" },
  { id: "S13", name: "Export", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-b-correction-v2/" },
  { id: "S14", name: "AI Summary", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-c-correction-v1/" },
  { id: "S15", name: "AI Structured Dialogue", platform: "both", status: "planned", productReady: false, notes: "PLAN; ADR runtime-генерации" },
  { id: "S15b", name: "AI Mini Lessons", platform: "both", status: "planned", productReady: false, notes: "PLAN; не проектируется" },
  { id: "S16", name: "My Words", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-d-final/" },
  { id: "S17", name: "My Artifacts", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-d-final/" },
  { id: "S18", name: "Progress", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-d-final/" },
  { id: "S19", name: "Library", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-e-correction-v1/" },
  { id: "S20", name: "Profile", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-d-final/", notes: "owns auth/payment/privacy entry points (F0)" },
  { id: "S21", name: "Reading / Listening", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-e-correction-v1/" },
  { id: "S22", name: "Shadowing", platform: "mobile", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-e-correction-v1/" },
  { id: "S23", name: "Story Engine", platform: "both", status: "planned", productReady: false, notes: "PLAN; ADR" },
  { id: "S24", name: "Community Ladder", platform: "both", status: "planned", productReady: false, notes: "PLAN/FUT; validation [U]" },
  { id: "S25", name: "Subscription / Paywall", platform: "both", status: "frozen-design", productReady: true, frozenDesign: "docs/design/exports/batch-f-auth-monetization-correction-v1/", notes: "Batch F defaults + states frozen; web checkout primary, mobile status/manage handoff" },
  { id: "S26", name: "Notification", platform: "mobile", status: "planned", productReady: false, notes: "PLAN" },
  { id: "S27", name: "Save / Offline States", platform: "both", status: "planned", productReady: false, notes: "cross-cutting state family, not a screen" },
] as const;

/**
 * Legacy маршруты приложения, помеченные КАК НЕ ПРОДУКТОВЫЕ.
 * Причина: конфликт с замороженной архитектурой (pilot/research-язык, стражи,
 * стрики, CEFR-levelcheck, удаляемые роли/3-минутка). Код не удаляется
 * деструктивно (AI_RULES §5/§6); он изолируется этим реестром и firewall'ом.
 */
export type LegacyReason = "pilot-research" | "guardian" | "streak" | "levelcheck" | "removed-concept";
export type LegacyRoute = {
  /** Путь файла-маршрута в apps/mobile (или web). */
  route: string;
  reason: LegacyReason;
  productReady: false;
  note: string;
};

/** Canonical application startup. The legacy tab group also redirects here. */
export const PRODUCT_ENTRY_ROUTE = "/entry" as const;

export const LEGACY_ROUTES: readonly LegacyRoute[] = [
  { route: "apps/mobile/src/app/(tabs)/index.tsx", reason: "removed-concept", productReady: false, note: "Legacy Today dashboard; root startup redirects to product S1." },
  { route: "apps/mobile/src/app/(tabs)/library.tsx", reason: "removed-concept", productReady: false, note: "Legacy tab implementation; does not govern frozen S19." },
  { route: "apps/mobile/src/app/(tabs)/vocab.tsx", reason: "removed-concept", productReady: false, note: "Legacy tab implementation; does not govern frozen S16." },
  { route: "apps/mobile/src/app/(tabs)/people.tsx", reason: "removed-concept", productReady: false, note: "Legacy coach/community shell; not a product-ready S24 implementation." },
  { route: "apps/mobile/src/app/(tabs)/profile.tsx", reason: "removed-concept", productReady: false, note: "Legacy profile tab; does not govern frozen S20." },
  { route: "apps/mobile/src/app/slice/index.tsx", reason: "pilot-research", productReady: false, note: "Vertical-slice/pilot hub — research scaffold, not learner-facing product." },
  { route: "apps/mobile/src/app/slice/entry.tsx", reason: "pilot-research", productReady: false, note: "Pilot entry; superseded by product S3 (frozen)." },
  { route: "apps/mobile/src/app/slice/pretest.tsx", reason: "pilot-research", productReady: false, note: "Pilot pretest; superseded by product S7 (frozen)." },
  { route: "apps/mobile/src/app/slice/session.tsx", reason: "pilot-research", productReady: false, note: "Pilot session; superseded by product S5 (frozen)." },
  { route: "apps/mobile/src/app/slice/assess.tsx", reason: "pilot-research", productReady: false, note: "Pilot assessment; superseded by product S9–S13 (frozen)." },
  { route: "apps/mobile/src/app/block.tsx", reason: "guardian", productReady: false, note: "Guardian-in-the-moment / barrier intervention — banned in product (Г-3)." },
  { route: "apps/mobile/src/app/onboarding.tsx", reason: "guardian", productReady: false, note: "Old onboarding with barrier-guardian and self-selected level (Г-1/Г-3)." },
  { route: "apps/mobile/src/app/checkup.tsx", reason: "levelcheck", productReady: false, note: "CEFR levelcheck — level from activity is banned; replaced by S3 + external slice." },
  { route: "apps/mobile/src/app/roles.tsx", reason: "removed-concept", productReady: false, note: "Roles screen — removed concept (13_app_logic / platform doc)." },
  { route: "apps/mobile/src/app/three.tsx", reason: "removed-concept", productReady: false, note: "3-minute screen — dissolved into session (platform doc)." },
  { route: "apps/mobile/src/app/session.tsx", reason: "removed-concept", productReady: false, note: "Old auto-advancing word-flow session with music; excluded from product startup." },
  { route: "apps/mobile/src/app/coach.tsx", reason: "removed-concept", productReady: false, note: "Old trainer surface; excluded from the current product architecture." },
] as const;

const legacyRouteSet: ReadonlySet<string> = new Set(LEGACY_ROUTES.map((r) => r.route));

/** Экран продукта готов к реализации? */
export function isProductReady(id: ScreenId): boolean {
  return SCREENS.find((s) => s.id === id)?.productReady ?? false;
}

/** Все продуктово-готовые экраны. */
export function productReadyScreens(): readonly ScreenRoute[] {
  return SCREENS.filter((s) => s.productReady);
}

/** Помечен ли файл-маршрут как legacy (не продуктовый)? */
export function isLegacyRoute(route: string): boolean {
  return legacyRouteSet.has(route);
}

/** Найти экран по id. */
export function screen(id: ScreenId): ScreenRoute | undefined {
  return SCREENS.find((s) => s.id === id);
}
