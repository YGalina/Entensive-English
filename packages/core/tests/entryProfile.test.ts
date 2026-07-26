import { test } from "node:test";
import assert from "node:assert/strict";

import { configureStorage, memoryStorage, storage, type StorageAdapter } from "../storage";
import { ENTRY_KEYS, resolveEntryRoute, confirmIntegrityRestart, activeLocalPath } from "../entryRouting";
import {
  saveProfile,
  readProfile,
  isComplete,
  type ProfileSigns,
} from "../entryProfile";

const SIGNS: ProfileSigns = { s1: "yes", s2: "yes", s3: "no", s4: "insufficient", s5: "yes" };

function fresh() {
  configureStorage(memoryStorage());
}

test("isComplete requires all five signs (insufficient counts)", () => {
  assert.equal(isComplete({ s1: "yes", s2: "no", s3: "insufficient", s4: "yes" }), false);
  assert.equal(isComplete(SIGNS), true);
});

test("saveProfile creates the active local path and unlocks path hub", () => {
  fresh();
  assert.equal(activeLocalPath(), null);
  const res = saveProfile(SIGNS, "стендапы по средам", 1_700_000_000_000);
  assert.equal(res.ok, true);
  assert.equal(activeLocalPath(), "path-1700000000000");
  assert.deepEqual(readProfile()?.signs, SIGNS);
  assert.equal(readProfile()?.note, "стендапы по средам");
  // Router now routes to the hub (profile belongs to the active path).
  assert.equal(resolveEntryRoute().step.kind, "path-hub");
});

test("PR3 acceptance criterion: saving writes both keys and they match", () => {
  fresh();
  // 1. first ordinary path creates or obtains an active local path
  assert.equal(activeLocalPath(), null);
  const res = saveProfile(SIGNS, "", 7);
  assert.equal(res.ok, true);
  const active = storage().getItem(ENTRY_KEYS.activePath);
  assert.ok(active, "ie_active_path must exist after saving");
  // 2. saving S3 writes both ie_profile and ie_profile_path
  assert.ok(storage().getItem(ENTRY_KEYS.profile), "ie_profile must be written");
  assert.ok(storage().getItem(ENTRY_KEYS.profilePath), "ie_profile_path must be written");
  // 3. ie_profile_path must equal ie_active_path
  assert.equal(storage().getItem(ENTRY_KEYS.profilePath), active);
  // 4. after saving, resolveEntryRoute() must route to Path Hub
  const { step, route } = resolveEntryRoute();
  assert.equal(step.kind, "path-hub");
  assert.equal(route, "/entry/path-hub");
});

test("saveProfile reuses an existing active path", () => {
  fresh();
  storage().setItem(ENTRY_KEYS.activePath, "p1");
  const res = saveProfile(SIGNS, "", 42);
  assert.equal(res.ok, true);
  assert.equal(activeLocalPath(), "p1");
  assert.equal(readProfile()?.path, "p1");
});

test("profile from a previous path is ignored after integrity restart", () => {
  fresh();
  saveProfile(SIGNS, "", 1);
  assert.ok(readProfile());
  confirmIntegrityRestart(2); // new active path
  assert.equal(readProfile(), null); // old profile no longer belongs to the path
  assert.equal(resolveEntryRoute().step.kind, "onboarding");
  // A fresh profile can be saved into the new path.
  const res = saveProfile(SIGNS, "", 3);
  assert.equal(res.ok, true);
  assert.equal(resolveEntryRoute().step.kind, "path-hub");
});

test("saveProfile reports storage-unavailable honestly", () => {
  // Adapter whose writes are dropped (private mode / quota) → read-back fails.
  const failing: StorageAdapter = {
    getItem: () => null,
    setItem: () => {},
    subscribeExternal: () => () => {},
  };
  configureStorage(failing);
  const res = saveProfile(SIGNS, "", 5);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.reason, "storage-unavailable");
});
