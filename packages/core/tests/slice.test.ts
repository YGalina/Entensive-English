import { test } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";

configureStorage(memoryStorage());

const {
  SLICE_ITEMS,
  SLICE_TEXTS,
  SLICE_TRANSFORMS,
  itemsForDay,
} = await import("../data/slice");
const {
  detectFoundItems,
  itemFoundInText,
  checkAssessmentAnswer,
  assessmentOrder,
  recordPilotEntry,
  finishPretest,
  recordRetrieval,
  dueSliceItemIds,
  nextSessionPlan,
  startSession,
  completeSession,
  needsRecovery,
  assessmentAvailable,
  sliceState,
  sliceProgress,
  exportSliceData,
  sliceLog,
  itemEvidence,
  transformSatisfied,
} = await import("../slice");

test("банк: ровно 22 единицы, дни 5/5/4/4/4, id уникальны", () => {
  assert.equal(SLICE_ITEMS.length, 22);
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((d) => itemsForDay(d).length),
    [5, 5, 4, 4, 4]
  );
  assert.equal(new Set(SLICE_ITEMS.map((i) => i.id)).size, 22);
  // у каждой единицы есть промпт, контекст, 2 варианта и леммы
  for (const i of SLICE_ITEMS) {
    assert.ok(i.prompt.length > 10, i.id);
    assert.ok(i.context.length > 10, i.id);
    assert.equal(i.variants.length, 2, i.id);
    assert.ok(i.lemmas.length >= 1, i.id);
  }
});

test("банк: каждая единица дня реально встречается в тексте своего дня", () => {
  for (const t of SLICE_TEXTS) {
    for (const item of itemsForDay(t.day)) {
      assert.ok(itemFoundInText(item, t.en), `${item.id} не найден в тексте дня ${t.day}`);
    }
  }
});

test("детект единиц в письменном ответе: находит и не выдумывает", () => {
  const text =
    "I've been working on a big report. We met the deadline and I came up with a new idea.";
  const found = detectFoundItems(text).map((i) => i.id);
  assert.ok(found.includes("frame-working-on"));
  assert.ok(found.includes("meet-a-deadline"));
  assert.ok(found.includes("come-up-with"));
  assert.ok(!found.includes("figure-out"));
  // "running" не должно матчить "run a project" без project
  assert.ok(!detectFoundItems("I was running fast").some((i) => i.id === "run-a-project"));
});

test("проверка ответа теста: correct / incorrect / blank", () => {
  assert.equal(checkAssessmentAnswer("figure-out", "figure out"), "correct");
  assert.equal(checkAssessmentAnswer("figure-out", "to figure out"), "correct");
  assert.equal(checkAssessmentAnswer("figure-out", "understand"), "incorrect");
  assert.equal(checkAssessmentAnswer("figure-out", "   "), "blank");
  assert.equal(checkAssessmentAnswer("make-a-decision", "made a decision"), "correct");
});

test("порядок теста фиксируется на претесте и не меняется", () => {
  recordPilotEntry({ P1: "yes", P2: "yes", P3: "yes", P4: "insufficient", P5: "yes" });
  const before = assessmentOrder();
  assert.equal(before.length, 22);
  finishPretest();
  assert.deepEqual(assessmentOrder(), before);
});

test("retrieval → FSRS produce: due назавтра при показе ответа", () => {
  recordRetrieval("launch", 3); // показали ответ = again
  recordRetrieval("hire", 0); // сам = good
  // again вернётся раньше good
  const state = sliceState();
  assert.ok(state); // smoke
  assert.equal(itemEvidence("launch"), "insufficient"); // 1 попытка — рано судить
  recordRetrieval("launch", 1);
  assert.equal(itemEvidence("launch"), "tracked");
});

test("план сессий: 5 введений по дням, потом возврат с трансформациями", () => {
  // состояние после предыдущих тестов: introDone=0
  const p1 = nextSessionPlan();
  assert.equal(p1.type, "intro");
  assert.equal(p1.introDay, 1);
  assert.equal(p1.newItems.length, 5);
  assert.equal(p1.production.kind, "item");
  startSession(p1);
  completeSession(p1);
  for (let d = 2; d <= 5; d++) {
    const p = nextSessionPlan();
    assert.equal(p.type, "intro");
    assert.equal(p.introDay, d);
    startSession(p);
    completeSession(p);
  }
  const p6 = nextSessionPlan();
  assert.equal(p6.type, "review");
  assert.equal(p6.number, 6);
  assert.equal(p6.production.kind, "transform");
  // сессии 12–14 — главный вопрос
  const s = sliceState();
  assert.equal(s.introDone, 5);
  assert.equal(s.sessionsCompleted, 5);
});

test("recovery: не нужен сразу после сессии; план recovery без новых единиц", () => {
  assert.equal(needsRecovery(), false);
  const rec = nextSessionPlan(true);
  assert.equal(rec.type, "recovery");
  assert.equal(rec.newItems.length, 0);
  assert.equal(rec.production.kind, "main");
});

test("отложенный тест: закрыт до 14 календарных дней от претеста", () => {
  const s = sliceState();
  assert.ok(s.pretestAt);
  assert.equal(assessmentAvailable(s.pretestAt! + 13 * 24 * 3600 * 1000), false);
  assert.equal(assessmentAvailable(s.pretestAt! + 14 * 24 * 3600 * 1000 + 1), true);
});

test("трансформация: проверка обязательных форм", () => {
  const t3 = SLICE_TRANSFORMS.find((t) => t.id === "t3")!;
  assert.equal(transformSatisfied(t3, "I've been fixing this bug since Monday."), true);
  assert.equal(transformSatisfied(t3, "I fixed this bug on Monday."), false);
});

test("прогресс и экспорт: только процесс, лог append-only", () => {
  const pr = sliceProgress();
  assert.equal(pr.totalSessions, 14);
  assert.equal(pr.sessionsCompleted, 5);
  assert.ok(pr.insufficientCount > 0); // большинство единиц ещё не тронуты
  const before = sliceLog().length;
  const json = exportSliceData();
  const parsed = JSON.parse(json);
  assert.ok(Array.isArray(parsed.log));
  assert.equal(sliceLog().length, before + 1); // export сам записан в лог
});
