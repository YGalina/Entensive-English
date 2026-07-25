import { test } from "node:test";
import assert from "node:assert/strict";

import { configureStorage, memoryStorage, storage } from "../storage";
import {
  ENTRY_KEYS,
  ENTRY_ROUTES,
  ENTRY_COPY,
  readPathState,
  routeForStep,
  resolveEntryRoute,
} from "../entryRouting";
import { computeNextStep, type NextStepKind } from "../pathNextStep";
import { passesCopyFirewall, scanForBannedTerms } from "../copyFirewall";

function fresh() {
  configureStorage(memoryStorage());
}
function set(key: string, value = "1") {
  storage().setItem(key, value);
}

test("first launch (empty storage) routes to recognition", () => {
  fresh();
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "onboarding");
  assert.equal(route, "/entry/recognition");
});

test("profile present routes to path hub", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "path-hub");
  assert.equal(route, "/entry/path-hub");
});

test("integrity block wins over profile and daily step", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  set(ENTRY_KEYS.dailyStep, "S5");
  set(ENTRY_KEYS.integrityBlocked);
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "integrity-blocked");
  assert.equal(step.screenId, "S1");
  assert.equal(route, "/entry/integrity-blocked");
});

test("resumable draft routes ahead of protocol/daily", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  set(ENTRY_KEYS.resumeDraft);
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "resume-draft");
  assert.equal(route, "/entry/coming-soon");
});

test("valid open protocol stage is honoured; invalid id is ignored", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  set(ENTRY_KEYS.openProtocolStage, "S9");
  let r = resolveEntryRoute();
  assert.equal(r.step.kind, "protocol-stage");
  assert.equal(r.step.screenId, "S9");

  fresh();
  set(ENTRY_KEYS.profile);
  set(ENTRY_KEYS.openProtocolStage, "S99"); // not a real ScreenId
  r = resolveEntryRoute();
  assert.equal(r.step.kind, "path-hub"); // ignored → falls through
});

test("recovery flag routes to recovery step", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  set(ENTRY_KEYS.recoveryNeeded);
  const { step } = resolveEntryRoute();
  assert.equal(step.kind, "recovery");
});

test("daily step with entitlement lock is projected, not gated", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  set(ENTRY_KEYS.dailyStep, "S5");
  set(ENTRY_KEYS.dailyStepLocked);
  const { step } = resolveEntryRoute();
  assert.equal(step.kind, "daily-cycle");
  assert.equal(step.locked, true);
});

test("readPathState reflects raw storage", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  const s = readPathState();
  assert.equal(s.hasProfile, true);
  assert.equal(s.integrityBlocked, false);
  assert.equal(s.dailyStep, undefined);
});

test("routeForStep covers every NextStepKind", () => {
  const kinds: NextStepKind[] = [
    "integrity-blocked",
    "onboarding",
    "resume-draft",
    "protocol-stage",
    "recovery",
    "daily-cycle",
    "path-hub",
  ];
  for (const kind of kinds) {
    assert.ok(ENTRY_ROUTES[kind], `no route for ${kind}`);
    const route = routeForStep({ kind, screenId: "S1", reason: "t" });
    assert.equal(route, ENTRY_ROUTES[kind]);
  }
});

test("resolveEntryRoute agrees with computeNextStep on the same state", () => {
  fresh();
  set(ENTRY_KEYS.profile);
  const { step } = resolveEntryRoute();
  assert.equal(step.kind, computeNextStep(readPathState()).kind);
});

test("all learner-facing entry copy passes the copy firewall", () => {
  for (const [key, value] of Object.entries(ENTRY_COPY)) {
    assert.ok(
      passesCopyFirewall(value),
      `ENTRY_COPY.${key} tripped firewall: ${JSON.stringify(scanForBannedTerms(value))}`,
    );
  }
});
