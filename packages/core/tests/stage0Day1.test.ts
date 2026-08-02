import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage, storage, type StorageAdapter } from "../storage";
import {
  DAY1_FULL_BLOCKS,
  DAY1_FULL_FACTS,
  DAY1_MINUTES,
  DAY1_SHORT_BLOCKS,
  DAY1_SHORT_FACTS,
  answerStage0Day1Comprehension,
  completeStage0Day1,
  confirmStage0Day1FluencyVersion,
  continueStage0Day1AfterComprehension,
  continueStage0Day1AfterGuidedVariation,
  day1FullMinimumMet,
  firstIncompleteStage0Day1,
  loadStage0Day1,
  isStage0Day1GuidedAnswer,
  markStage0Day1TextRead,
  saveStage0Day1,
  saveStage0Day1GuidedSlot,
  skipStage0Day1GuidedVariation,
  stage0Day1Facts,
  startStage0Day1,
  submitStage0Day1GuidedVariation,
  submitStage0Day1Production,
  submitStage0Day1Retrieval,
  switchStage0Day1Mode,
} from "../stage0Day1";

beforeEach(() => {
  configureStorage(memoryStorage());
  storage().setItem("ie_active_path", "path-a");
});

function completeShortMinimum() {
  startStage0Day1("full", 1);
  saveStage0Day1({ evidence: { primeSeen: true } }, 2);
  markStage0Day1TextRead(3);
  answerStage0Day1Comprehension(true, 4);
  submitStage0Day1Retrieval("I've been working on the new onboarding.", 5);
  submitStage0Day1Production("I've been working on my kitchen.", 6);
}

test("full and short paths have fixed order and honest minutes", () => {
  assert.deepEqual(DAY1_FULL_BLOCKS, ["core", "guided-variation", "fluency-mini", "closing"]);
  assert.deepEqual(DAY1_SHORT_BLOCKS, ["core", "closing"]);
  assert.equal(DAY1_MINUTES.full, 30);
  assert.equal(DAY1_MINUTES.short, 16);
  assert.ok(DAY1_MINUTES.short >= 15);
});

test("resume preserves the exact outer block, inner phase and drafts", () => {
  startStage0Day1("full", 1);
  saveStage0Day1(
    {
      block: "core",
      corePhase: "produce",
      productionText: "I've been working on my kitchen.",
      retrievalDraft: "We should meet",
      evidence: { textRead: true, retrievalsCompleted: 2 },
    },
    2
  );
  const restored = loadStage0Day1();
  assert.equal(restored?.corePhase, "produce");
  assert.equal(restored?.productionText, "I've been working on my kitchen.");
  assert.equal(restored?.retrievalDraft, "We should meet");
  assert.equal(restored?.evidence.retrievalsCompleted, 2);
});

test("malformed or stale state cannot resume", () => {
  startStage0Day1("full", 1);
  storage().setItem("ie_active_path", "path-b");
  assert.equal(loadStage0Day1(), null);
  storage().setItem("ie_active_path", "path-a");
  storage().setItem("ie_stage0_day1", JSON.stringify({ version: 2, activePath: "path-a" }));
  assert.equal(loadStage0Day1(), null);
});

test("short completion exposes only the two short-path facts", () => {
  startStage0Day1("short", 1);
  saveStage0Day1({ evidence: { primeSeen: true } }, 2);
  markStage0Day1TextRead(3);
  answerStage0Day1Comprehension(true, 4);
  submitStage0Day1Retrieval("We should meet the deadline.", 5);
  submitStage0Day1Production("I've been working on my kitchen.", 6);
  const ready = loadStage0Day1()!;
  assert.deepEqual(stage0Day1Facts(ready), DAY1_SHORT_FACTS);
  const done = completeStage0Day1(5)!;
  assert.equal(done.completionMode, "short");
  assert.deepEqual(stage0Day1Facts(done), DAY1_SHORT_FACTS);
});

test("meaning gate retries once, then reveals and never blocks the day", () => {
  startStage0Day1("short", 1);
  saveStage0Day1({ evidence: { primeSeen: true } }, 2);
  markStage0Day1TextRead(3);
  const retry = answerStage0Day1Comprehension(false, 4)!;
  assert.equal(retry.comprehension, "retry");
  assert.equal(retry.corePhase, "text");
  const shown = answerStage0Day1Comprehension(false, 5)!;
  assert.equal(shown.comprehension, "shown");
  assert.equal(shown.corePhase, "text");
  const continued = continueStage0Day1AfterComprehension(6)!;
  assert.equal(continued.comprehension, "resolved");
  assert.equal(continued.corePhase, "retrieve");
});

test("full completion requires submitted guided slots and two spoken versions", () => {
  completeShortMinimum();
  submitStage0Day1Retrieval("We should meet the deadline.", 5);
  submitStage0Day1Retrieval("I came up with a way to cut one step.", 6);
  saveStage0Day1GuidedSlot(0, "I've been working on the new onboarding.", 7);
  saveStage0Day1GuidedSlot(1, "I've been working on the schedule.", 8);
  saveStage0Day1GuidedSlot(2, "I've been working on my kitchen.", 9);
  assert.equal(day1FullMinimumMet(loadStage0Day1()!), false);
  submitStage0Day1GuidedVariation(10);
  continueStage0Day1AfterGuidedVariation(10.5);
  confirmStage0Day1FluencyVersion("said-aloud-confirmed", 11);
  assert.equal(completeStage0Day1(12), null);
  confirmStage0Day1FluencyVersion("recorded", 13);
  const done = completeStage0Day1(14)!;
  assert.equal(done.completionMode, "full");
  assert.deepEqual(stage0Day1Facts(done), DAY1_FULL_FACTS);
});

test("a generic optional voice skip cannot become spoken evidence", () => {
  completeShortMinimum();
  const current = loadStage0Day1()!;
  assert.deepEqual(current.evidence.fluencyVersions, [null, null]);
  assert.equal(day1FullMinimumMet(current), false);
});

test("switching paths preserves drafts and continues at first unmet requirement", () => {
  startStage0Day1("full", 1);
  saveStage0Day1({ retrievalDraft: "unfinished", productionText: "draft" }, 2);
  const short = switchStage0Day1Mode("short", 3)!;
  assert.equal(short.mode, "short");
  assert.equal(short.corePhase, "prime");
  assert.equal(short.retrievalDraft, "unfinished");
  assert.equal(short.productionText, "draft");
  const full = switchStage0Day1Mode("full", 4)!;
  assert.equal(full.mode, "full");
  assert.equal(full.corePhase, "prime");
});

test("switching to short after its minimum goes directly to closing", () => {
  completeShortMinimum();
  const next = switchStage0Day1Mode("short", 5)!;
  assert.equal(next.block, "closing");
  assert.deepEqual(firstIncompleteStage0Day1(next), { kind: "closing" });
});

test("skipping guided variation closes short only when short minimum exists", () => {
  startStage0Day1("full", 1);
  const missing = skipStage0Day1GuidedVariation(2)!;
  assert.equal(missing.mode, "full");
  assert.deepEqual(firstIncompleteStage0Day1(missing, "short"), { kind: "core", phase: "prime" });

  configureStorage(memoryStorage());
  storage().setItem("ie_active_path", "path-a");
  completeShortMinimum();
  const closed = skipStage0Day1GuidedVariation(5)!;
  assert.equal(closed.mode, "short");
  assert.equal(closed.block, "closing");
  assert.deepEqual(stage0Day1Facts(closed), DAY1_SHORT_FACTS);
});

test("guided drafts remain editable until submission and lock afterwards", () => {
  completeShortMinimum();
  submitStage0Day1Retrieval("second", 5);
  submitStage0Day1Retrieval("third", 6);
  saveStage0Day1GuidedSlot(0, "I've been working on the first task.", 7);
  saveStage0Day1GuidedSlot(0, "I've been working on the edited task.", 8);
  saveStage0Day1GuidedSlot(1, "I've been working on the second task.", 9);
  saveStage0Day1GuidedSlot(2, "I've been working on the third task.", 10);
  const submitted = submitStage0Day1GuidedVariation(11)!;
  assert.equal(submitted.guidedDrafts[0], "I've been working on the edited task.");
  assert.equal(saveStage0Day1GuidedSlot(0, "too late", 12), null);
  assert.equal(loadStage0Day1()?.guidedDrafts[0], "I've been working on the edited task.");
});

test("guided variation accepts only three instances of the fixed frame", () => {
  completeShortMinimum();
  submitStage0Day1Retrieval("second", 5);
  submitStage0Day1Retrieval("third", 6);
  saveStage0Day1GuidedSlot(0, "first", 7);
  saveStage0Day1GuidedSlot(1, "second", 8);
  saveStage0Day1GuidedSlot(2, "third", 9);
  assert.equal(submitStage0Day1GuidedVariation(10), null);
  assert.equal(isStage0Day1GuidedAnswer("first"), false);
  assert.equal(isStage0Day1GuidedAnswer("I've been working on the migration."), true);
});

test("a dropped draft write reports failure and preserves the last verified state", () => {
  const values = new Map<string, string>();
  let dropDayWrites = false;
  const adapter: StorageAdapter = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (!(dropDayWrites && key === "ie_stage0_day1")) values.set(key, value);
    },
    subscribeExternal: () => () => {},
  };
  configureStorage(adapter);
  storage().setItem("ie_active_path", "path-a");
  startStage0Day1("full", 1);
  saveStage0Day1({ productionText: "verified draft" }, 2);
  dropDayWrites = true;
  assert.equal(saveStage0Day1({ productionText: "visible but not persisted" }, 3), null);
  assert.equal(loadStage0Day1()?.productionText, "verified draft");
});
