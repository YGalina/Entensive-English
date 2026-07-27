import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage, storage } from "../storage";
import {
  clearS5SessionDraft,
  loadS5SessionDraft,
  nextSessionPlan,
  saveS5SessionDraft,
  startSession,
} from "../slice";

beforeEach(() => {
  configureStorage(memoryStorage());
  storage().setItem("ie_active_path", "path-a");
});

test("S5 draft round-trips the exact phase and learner text", () => {
  const plan = nextSessionPlan();
  const started = startSession(plan);
  assert.equal(
    saveS5SessionDraft(plan, {
      step: "produce",
      retrieveIndex: 3,
      retrievalInput: "",
      productionText: "My project is still in progress.",
      foundIds: ["in-progress"],
      startedEventId: started.id,
    }),
    true
  );

  const draft = loadS5SessionDraft(plan);
  assert.equal(draft?.step, "produce");
  assert.equal(draft?.retrieveIndex, 3);
  assert.equal(draft?.productionText, "My project is still in progress.");
  assert.equal(draft?.startedEventId, started.id);
});

test("S5 draft never crosses an active local path boundary", () => {
  const plan = nextSessionPlan();
  const started = startSession(plan);
  saveS5SessionDraft(plan, {
    step: "text",
    retrieveIndex: 0,
    retrievalInput: "",
    productionText: "",
    foundIds: [],
    startedEventId: started.id,
  });
  storage().setItem("ie_active_path", "path-b");
  assert.equal(loadS5SessionDraft(plan), null);
});

test("S5 draft is ignored for a different curriculum session and clears explicitly", () => {
  const plan = nextSessionPlan();
  const started = startSession(plan);
  saveS5SessionDraft(plan, {
    step: "voice",
    retrieveIndex: 1,
    retrievalInput: "",
    productionText: "A saved sentence.",
    foundIds: [],
    startedEventId: started.id,
  });

  clearS5SessionDraft();
  assert.equal(loadS5SessionDraft(plan), null);
});
