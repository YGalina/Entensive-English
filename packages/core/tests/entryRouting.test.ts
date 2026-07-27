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
  confirmIntegrityRestart,
  activeLocalPath,
} from "../entryRouting";
import { computeNextStep, type NextStepKind } from "../pathNextStep";
import { passesCopyFirewall, scanForBannedTerms } from "../copyFirewall";

function fresh() {
  configureStorage(memoryStorage());
}
function set(key: string, value = "1") {
  storage().setItem(key, value);
}
/** A valid product profile must belong to the active local path. */
function setProfile(pathId = "p1") {
  storage().setItem(ENTRY_KEYS.activePath, pathId);
  storage().setItem(ENTRY_KEYS.profile, "1");
  storage().setItem(ENTRY_KEYS.profilePath, pathId);
}

test("first launch (empty storage) routes to recognition", () => {
  fresh();
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "onboarding");
  assert.equal(route, "/entry/recognition");
});

test("profile present routes to path hub", () => {
  fresh();
  setProfile();
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "path-hub");
  assert.equal(route, "/entry/path-hub");
});

test("integrity block wins over profile and daily step", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.dailyStep, "S5");
  set(ENTRY_KEYS.integrityBlocked);
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "integrity-blocked");
  assert.equal(step.screenId, "S1");
  assert.equal(route, "/entry/integrity-blocked");
});

test("resumable draft routes ahead of protocol/daily", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.resumeDraft);
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "resume-draft");
  assert.equal(route, "/entry/coming-soon");
});

test("valid open protocol stage is honoured; invalid id is ignored", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.openProtocolStage, "S9");
  let r = resolveEntryRoute();
  assert.equal(r.step.kind, "protocol-stage");
  assert.equal(r.step.screenId, "S9");

  fresh();
  setProfile();
  set(ENTRY_KEYS.openProtocolStage, "S99"); // not a real ScreenId
  r = resolveEntryRoute();
  assert.equal(r.step.kind, "path-hub"); // ignored → falls through
});

test("implemented S7/S8 protocol stages resolve to their product routes", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.openProtocolStage, "S7");
  assert.equal(resolveEntryRoute().route, "/entry/pretest");

  set(ENTRY_KEYS.openProtocolStage, "S8");
  assert.equal(resolveEntryRoute().route, "/entry/assessment-wait");
});

test("recovery flag routes to recovery step", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.recoveryNeeded);
  const { step } = resolveEntryRoute();
  assert.equal(step.kind, "recovery");
});

test("daily step with entitlement lock is projected, not gated", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.dailyStep, "S5");
  set(ENTRY_KEYS.dailyStepLocked);
  const { step } = resolveEntryRoute();
  assert.equal(step.kind, "daily-cycle");
  assert.equal(step.locked, true);
});

test("implemented S5 daily step resolves to the product session route", () => {
  fresh();
  setProfile();
  set(ENTRY_KEYS.dailyStep, "S5");
  assert.equal(resolveEntryRoute().route, "/entry/daily-session");
});

test("readPathState reflects raw storage", () => {
  fresh();
  setProfile();
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
  setProfile();
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

// ---- Active local path boundary + integrity restart ----

test("old profile is ignored after the active local path changes", () => {
  fresh();
  setProfile("p1");
  assert.equal(resolveEntryRoute().step.kind, "path-hub");
  // Active path moves to a new id; the old profile no longer belongs to it.
  storage().setItem(ENTRY_KEYS.activePath, "p2");
  assert.equal(readPathState().hasProfile, false);
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "onboarding");
  assert.equal(route, "/entry/recognition");
});

test("integrity restart creates a fresh local path and routes to onboarding", () => {
  fresh();
  setProfile("p1");
  set(ENTRY_KEYS.integrityBlocked);
  set(ENTRY_KEYS.resumeDraft);
  set(ENTRY_KEYS.recoveryNeeded);
  set(ENTRY_KEYS.dailyStep, "S5");
  set(ENTRY_KEYS.openProtocolStage, "S9");

  const NOW = 1_700_000_000_000;
  const res = confirmIntegrityRestart(NOW);
  assert.equal(res.route, "/entry/recognition");
  assert.equal(res.activePath, `path-${NOW}`);
  assert.notEqual(res.activePath, "p1");
  assert.equal(activeLocalPath(), `path-${NOW}`);

  // Fresh path: old profile, draft, protocol stage, daily step and recovery
  // are all ignored — nothing silently reused.
  const st = readPathState();
  assert.equal(st.hasProfile, false);
  assert.equal(st.integrityBlocked, false);
  assert.equal(st.hasResumableDraft, false);
  assert.equal(st.recoveryNeeded, false);
  assert.equal(st.openProtocolStage, undefined);
  assert.equal(st.dailyStep, undefined);

  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "onboarding");
  assert.equal(route, "/entry/recognition");
});

test("integrity restart id differs even when now equals the current path id", () => {
  fresh();
  storage().setItem(ENTRY_KEYS.activePath, "path-5");
  const res = confirmIntegrityRestart(5);
  assert.notEqual(res.activePath, "path-5");
});
