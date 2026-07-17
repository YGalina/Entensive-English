import { test } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import { __setNowForTests } from "../now";

// Интеграционный сценарий пилота ЦЕЛИКОМ, в том порядке и теми же вызовами,
// какими его исполняют экраны /slice: вход → претест(28) → сессии →
// пропуск дней → recovery → оставшиеся сессии → день 14 → новый контекст →
// экспорт. Время путешествует через __setNowForTests. Плюс регрессия:
// контур пилота не трогает основное приложение (ie_srs / ie_output / ie_prefs).

configureStorage(memoryStorage());

const DAY = 24 * 3600 * 1000;
const T0 = Date.UTC(2026, 6, 1, 9, 0, 0); // 2026-07-01 09:00 UTC
__setNowForTests(T0);

const { storage } = await import("../storage");

// «Основное приложение»: сентинелы, которые срез не имеет права менять
storage().setItem("ie_srs", JSON.stringify({ hello: { en: "hello", packId: "p1" } }));
storage().setItem("ie_output", JSON.stringify([{ id: "out-1", type: "essay", words: [], createdAt: 1, privacy: "private" }]));
storage().setItem("ie_prefs", JSON.stringify({ goal: "work", dailyGoalMin: 20 }));
const mainSnapshot = {
  srs: storage().getItem("ie_srs"),
  output: storage().getItem("ie_output"),
  prefs: storage().getItem("ie_prefs"),
};

const {
  recordPilotEntry,
  assessmentOrder,
  checkAssessmentAnswer,
  recordAssessmentItem,
  finishPretest,
  nextSessionPlan,
  startSession,
  completeSession,
  recordEncounter,
  recordRetrieval,
  recordProduction,
  recordSummaryShown,
  detectFoundItems,
  productionSatisfied,
  needsRecovery,
  assessmentAvailable,
  finishDay14,
  finishHoldout,
  recordNewContext,
  day14TrainedOrder,
  holdoutOrder,
  sliceState,
  sliceProgress,
  sliceLog,
  exportSliceData,
  isHoldoutId,
  SLICE_TOTAL_SESSIONS,
} = await import("../slice");
const { anyAssessedItem, SLICE_NEW_CONTEXT } = await import("../data/slice");

/** Проходит одну сессию так, как это делает экран session.tsx. */
function runSession(recovery = false) {
  const plan = nextSessionPlan(recovery);
  startSession(plan);
  if (plan.type === "intro") {
    recordEncounter(plan.newItems.map((i) => i.id), "prime");
    recordEncounter(plan.newItems.map((i) => i.id), "text");
  }
  for (const item of [...plan.newItems]) recordRetrieval(item.id, 0, 900);
  for (const id of plan.reviewIds) recordRetrieval(id, 1, 1400);
  // производство: валидный текст под требование плана (единица дня / конструкция)
  const target = plan.production.itemId
    ? plan.newItems.find((i) => i.id === plan.production.itemId)
    : undefined;
  const text = target
    ? `${target.en.replace(/…$/, "")} my new report. I've been working on it all week.`
    : plan.transform
      ? plan.transform.sample
      : plan.production.grammar === "past"
        ? "Yesterday we made a decision and launched the update last week."
        : "I've been working on a big client report and I've been trying to figure out one bug.";
  const ok = productionSatisfied(plan.production, text);
  assert.ok(ok, `production не прошёл в сессии ${plan.number} (${plan.production.kind})`);
  recordProduction(plan.production.kind, text, detectFoundItems(text).map((i) => i.id), ok);
  recordSummaryShown([]);
  completeSession(plan);
  return plan;
}

test("полный поток пилота: вход → претест → 5+recovery+9 → день 14 → новый контекст → экспорт", () => {
  // ── вход ──
  recordPilotEntry({ P1: "yes", P2: "yes", P3: "yes", P4: "yes", P5: "insufficient" }, "интеграционный прогон");

  // ── претест: все 28, тем же вызовом, что экран ──
  const order = assessmentOrder();
  assert.equal(order.length, 28);
  for (const id of order) {
    const item = anyAssessedItem(id)!;
    // базовая линия: почти всё blank, два известных
    const answer = id === "figure-out" || id === "h-turn-down" ? item.en : "";
    recordAssessmentItem("pretest", id, answer, checkAssessmentAnswer(id, answer));
  }
  finishPretest();
  assert.deepEqual(assessmentOrder(), order, "порядок поплыл после претеста");

  // ── сессии 1–5 (введение), по одной в день ──
  for (let d = 0; d < 5; d++) {
    __setNowForTests(T0 + d * DAY);
    const plan = runSession();
    assert.equal(plan.type, "intro");
  }
  assert.equal(sliceState().sessionsCompleted, 5);
  assert.equal(sliceState().introDone, 5);

  // ── пропуск трёх дней → recovery рекомендован ──
  __setNowForTests(T0 + 8 * DAY);
  assert.equal(needsRecovery(), true);
  const rec = runSession(true);
  assert.equal(rec.type, "recovery");
  // программа НЕ потрачена
  assert.equal(sliceState().sessionsCompleted, 5);
  assert.equal(sliceState().introDone, 5);
  assert.equal(sliceState().recoveriesCompleted, 1);
  assert.equal(needsRecovery(), false);

  // ── сессии 6–14 (возврат/трансформации/главный вопрос) ──
  for (let k = 0; k < 9; k++) {
    __setNowForTests(T0 + (9 + k) * DAY);
    const plan = runSession();
    assert.equal(plan.type, "review");
  }
  assert.equal(sliceState().sessionsCompleted, SLICE_TOTAL_SESSIONS);

  // ── день 14: тест открывается строго по календарю ──
  __setNowForTests(T0 + 13 * DAY);
  assert.equal(assessmentAvailable(), false);
  __setNowForTests(T0 + 15 * DAY);
  assert.equal(assessmentAvailable(), true);

  // ── день 14, часть 1: ТОЛЬКО 22 тренируемые (контрольные ядром закрыты) ──
  const trained = day14TrainedOrder();
  assert.equal(trained.length, 22);
  assert.ok(trained.every((id) => !isHoldoutId(id)));
  assert.throws(
    () => recordAssessmentItem("day14", holdoutOrder()[0], "", "blank"),
    /контрольная дня 14/,
    "контрольная не должна предъявляться до нового контекста"
  );
  for (const id of trained) {
    const item = anyAssessedItem(id)!;
    recordAssessmentItem("day14", id, item.en, checkAssessmentAnswer(id, item.en));
  }
  finishDay14();
  // финальный экспорт закрыт, пока не пройдены новый контекст и контрольные
  assert.throws(() => exportSliceData(), /до завершения протокола/);

  // ── часть 2: новый контекст СТРОГО до экспозиции контрольных ──
  const holdoutDay14Before = sliceLog().filter(
    (e) =>
      e.type === "assessment-item" &&
      e.payload.phase === "day14" &&
      Boolean(e.payload.holdout)
  );
  assert.equal(holdoutDay14Before.length, 0, "контрольные экспонированы до нового контекста");
  const ctxText =
    "Last week I solved a problem with our report. The thing is, nobody could figure out the numbers. It turned out that one system was wrong, so I sorted out the data.";
  const res = recordNewContext(ctxText);
  assert.equal(res.denominator, SLICE_NEW_CONTEXT.targetIds.length);
  assert.ok(res.usedIds.includes("solve-a-problem"));
  assert.ok(res.usedIds.includes("figure-out"));
  assert.ok(res.usedIds.includes("sort-out"));
  assert.ok(res.missedIds.length > 0, "missed opportunity должен быть явным состоянием");
  assert.equal(res.usedIds.length + res.missedIds.length, res.denominator);
  assert.throws(() => exportSliceData(), /до завершения протокола/);

  // ── часть 3: контрольные — отдельной последовательностью ──
  for (const id of holdoutOrder()) {
    recordAssessmentItem("day14", id, "", checkAssessmentAnswer(id, ""));
  }
  finishHoldout();

  // ── часть 4: финализация однократна, повторная выгрузка — чистое чтение ──
  const parsed = JSON.parse(exportSliceData());
  assert.equal(parsed.partial, false);
  assert.ok(parsed.finalizedAt);
  const finals = sliceLog().filter((e) => e.type === "pilot-finalized");
  assert.equal(finals.length, 1);
  const logLenAfterFirstExport = sliceLog().length;
  JSON.parse(exportSliceData()); // повторная выгрузка
  assert.equal(sliceLog().filter((e) => e.type === "pilot-finalized").length, 1);
  assert.equal(sliceLog().length, logLenAfterFirstExport);
  assert.equal(parsed.summaries.day14.trained.correct, 22);
  assert.equal(parsed.summaries.day14.holdout.blank, 6);
  assert.equal(parsed.summaries.pretest.trained.correct, 1);
  assert.equal(parsed.summaries.pretest.holdout.correct, 1);
  // по любой единице из лога восстановимо: где встречалась и какие попытки
  const encounters = parsed.log.filter((e: { type: string }) => e.type === "encounter");
  assert.ok(encounters.length >= 10);
  const nc = parsed.log.find((e: { type: string }) => e.type === "new-context-submitted");
  assert.ok(nc.payload.grammar.pastWithTime, "грамматика нового контекста валидируется");

  // прогресс остался процессным
  const pr = sliceProgress();
  assert.equal(pr.sessionsCompleted, 14);
  assert.equal(pr.recoveriesCompleted, 1);
  assert.ok(pr.ppcUses > 0);
});

test("регрессия: контур пилота не тронул основное приложение", () => {
  assert.equal(storage().getItem("ie_srs"), mainSnapshot.srs, "ie_srs изменился");
  assert.equal(storage().getItem("ie_output"), mainSnapshot.output, "ie_output изменился");
  assert.equal(storage().getItem("ie_prefs"), mainSnapshot.prefs, "ie_prefs изменился");
});

test("время возвращено реальному миру", async () => {
  __setNowForTests(null);
  const { nowMs } = await import("../now");
  assert.ok(Math.abs(Date.now() - nowMs()) < 1000);
});
