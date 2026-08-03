import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SCREENS,
  LEGACY_ROUTES,
  PRODUCT_ENTRY_ROUTE,
  isProductReady,
  productReadyScreens,
  isLegacyRoute,
  screen,
} from "../routes";
import {
  categoryOf,
  mayWriteProgress,
  isProjectionSafe,
  assertMayWriteProgress,
} from "../eventCategories";
import { computeNextStep, type PathState } from "../pathNextStep";
import { scanForBannedTerms, passesCopyFirewall } from "../copyFirewall";
import { A11Y, TEXT_ROLE, RADIUS, BUTTON, meetsTouchTarget, fontSizeAllowed } from "../../tokens/primitives";

// ---- Route registry ----

test("route ids are unique", () => {
  const ids = SCREENS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("product-ready screens carry a frozen design source", () => {
  for (const s of productReadyScreens()) {
    assert.ok(s.frozenDesign, `${s.id} product-ready but has no frozen design source`);
    assert.equal(s.status, "frozen-design");
  }
});

test("planned screens are not product-ready, while frozen Batch F S25 is ready", () => {
  assert.equal(isProductReady("S25"), true);
  assert.equal(isProductReady("S23"), false);
  assert.equal(isProductReady("S1"), true);
});

test("legacy pilot/guardian/streak/levelcheck routes are marked not product-ready", () => {
  const reasons = new Set(LEGACY_ROUTES.map((r) => r.reason));
  assert.ok(reasons.has("pilot-research"));
  assert.ok(reasons.has("guardian"));
  assert.ok(reasons.has("levelcheck"));
  for (const r of LEGACY_ROUTES) assert.equal(r.productReady, false);
  assert.ok(isLegacyRoute("apps/mobile/src/app/slice/index.tsx"));
  assert.ok(isLegacyRoute("apps/mobile/src/app/block.tsx"));
  assert.ok(isLegacyRoute("apps/mobile/src/app/checkup.tsx"));
  assert.equal(isLegacyRoute("apps/mobile/src/app/(tabs)/index.tsx"), true);
  assert.ok(isLegacyRoute("apps/mobile/src/app/session.tsx"));
  assert.ok(isLegacyRoute("apps/mobile/src/app/coach.tsx"));
  assert.equal(PRODUCT_ENTRY_ROUTE, "/entry");
});

test("screen() resolves and notes S20 ownership of auth/payment entry", () => {
  assert.match(screen("S20")?.notes ?? "", /auth\/payment/);
});

// ---- Event categories ----

test("only progress/evidence events may write progress", () => {
  assert.equal(mayWriteProgress("session-completed"), true);
  assert.equal(mayWriteProgress("assessment-item-recorded"), true);
  assert.equal(mayWriteProgress("time-add"), false);
  assert.equal(mayWriteProgress("path-step-viewed"), false);
  assert.equal(mayWriteProgress("entitlement-changed"), false);
});

test("unknown event defaults to process and is projection-safe", () => {
  assert.equal(categoryOf("something-new"), "process");
  assert.equal(isProjectionSafe("something-new"), true);
  assert.equal(isProjectionSafe("session-completed"), false);
});

test("assertMayWriteProgress rejects process events", () => {
  assert.throws(() => assertMayWriteProgress("time-add"), /event-semantics/);
  assert.doesNotThrow(() => assertMayWriteProgress("srs-interval-updated"));
});

// ---- PathNextStep contract ----

const base: PathState = {
  integrityBlocked: false,
  hasProfile: true,
  hasResumableDraft: false,
  recoveryNeeded: false,
};

test("next step follows S1 router precedence", () => {
  assert.equal(computeNextStep({ ...base, integrityBlocked: true }).kind, "integrity-blocked");
  assert.equal(computeNextStep({ ...base, hasProfile: false }).kind, "onboarding");
  assert.equal(computeNextStep({ ...base, hasResumableDraft: true }).kind, "resume-draft");
  assert.equal(computeNextStep({ ...base, openProtocolStage: "S9" }).kind, "protocol-stage");
  assert.equal(computeNextStep({ ...base, recoveryNeeded: true }).kind, "recovery");
  assert.equal(computeNextStep({ ...base, dailyStep: "S5" }).kind, "daily-cycle");
  assert.equal(computeNextStep(base).kind, "path-hub");
});

test("integrity block wins over everything (no silent second identity)", () => {
  const step = computeNextStep({ ...base, integrityBlocked: true, hasProfile: false, dailyStep: "S5" });
  assert.equal(step.kind, "integrity-blocked");
  assert.equal(step.screenId, "S1");
});

test("locked daily step is projected, not gated", () => {
  const step = computeNextStep({ ...base, dailyStep: "S5", dailyStepLocked: true });
  assert.equal(step.kind, "daily-cycle");
  assert.equal(step.locked, true);
});

// ---- Copy / semantic firewall ----

test("firewall catches banned learner-facing terms", () => {
  assert.equal(passesCopyFirewall("Начать сессию дня"), true);
  assert.ok(scanForBannedTerms("Войти в пилот").some((f) => f.id === "pilot"));
  assert.ok(scanForBannedTerms("28 подряд").some((f) => f.id === "streak"));
  assert.ok(scanForBannedTerms("Твой внутренний страж").some((f) => f.id === "guardian"));
  assert.ok(scanForBannedTerms("Проверка уровня").some((f) => f.id === "levelcheck"));
  assert.ok(scanForBannedTerms("86 ч из ~200 до B2").some((f) => f.id === "percent-of-course"));
});

// ---- Shared UI primitives ----

test("primitives honour accessibility minimums", () => {
  assert.equal(A11Y.minTouchTarget, 44);
  assert.ok(TEXT_ROLE.body.minFontSize >= 16);
  assert.ok(TEXT_ROLE.secondary.minFontSize >= 14);
  assert.ok(BUTTON.primary.minHeight >= A11Y.minTouchTarget);
  assert.equal(RADIUS.pill, 999);
  assert.equal(meetsTouchTarget(44), true);
  assert.equal(meetsTouchTarget(34), false);
  assert.equal(fontSizeAllowed("body", 15), false);
  assert.equal(fontSizeAllowed("body", 16), true);
});
