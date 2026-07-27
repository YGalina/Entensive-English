import { test } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import { __setNowForTests } from "../now";

configureStorage(memoryStorage());

const DAY = 24 * 3600 * 1000;

const {
  SLICE_ITEMS,
  SLICE_HOLDOUT,
  SLICE_TEXTS,
  SLICE_TRANSFORMS,
  itemsForDay,
  anyAssessedItem,
} = await import("../data/slice");
const {
  detectFoundItems,
  itemFoundInText,
  checkAssessmentAnswer,
  assessmentOrder,
  recordPilotEntry,
  finishPretest,
  recordRetrieval,
  recordProduction,
  nextSessionPlan,
  startSession,
  completeSession,
  completeSessionGuarded,
  needsRecovery,
  assessmentAvailable,
  sliceState,
  sliceProgress,
  exportSliceData,
  sliceLog,
  itemEvidence,
  transformSatisfied,
  productionSatisfied,
  hasPresentPerfectContinuous,
  hasPastSimpleWithTimeMarker,
  isHoldoutId,
  recordAssessmentItem,
  recordedAssessmentIds,
  assessmentSummary,
  finishDay14,
  finishHoldout,
  finalizePilot,
  recordNewContext,
  newContextOpportunities,
  voiceArtifactRefs,
  day14TrainedOrder,
  holdoutOrder,
  exportPartialSliceData,
  SLICE_NEW_CONTEXT_MIN_CHARS,
} = await import("../slice");

// ───────────────────────── чистые тесты банка и проверок ─────────────────────────

test("банк: 22 тренируемые (5/5/4/4/4) + 6 контрольных, id уникальны", () => {
  assert.equal(SLICE_ITEMS.length, 22);
  assert.equal(SLICE_HOLDOUT.length, 6);
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((d) => itemsForDay(d).length),
    [5, 5, 4, 4, 4]
  );
  const allIds = [...SLICE_ITEMS.map((i) => i.id), ...SLICE_HOLDOUT.map((h) => h.id)];
  assert.equal(new Set(allIds).size, 28);
  for (const i of SLICE_ITEMS) {
    assert.ok(i.prompt.length > 10, i.id);
    assert.equal(i.variants.length, 2, i.id);
  }
});

test("holdout: пары к тренируемым, без учебных полей, не встречаются в текстах", () => {
  for (const h of SLICE_HOLDOUT) {
    assert.ok(SLICE_ITEMS.some((i) => i.id === h.matchedTo), `пара ${h.matchedTo} не найдена`);
    assert.ok(!("prompt" in h), h.id);
    assert.ok(!("day" in h), h.id);
  }
  for (const t of SLICE_TEXTS) {
    for (const h of SLICE_HOLDOUT) {
      assert.ok(!itemFoundInText(h, t.en), `${h.id} утёк в текст дня ${t.day}`);
    }
  }
});

test("банк: каждая единица дня встречается в тексте своего дня", () => {
  for (const t of SLICE_TEXTS) {
    for (const item of itemsForDay(t.day)) {
      assert.ok(itemFoundInText(item, t.en), `${item.id} не найден в тексте дня ${t.day}`);
    }
  }
});

test("грамматика: PPC ловит форму, не ловит ловушки", () => {
  assert.equal(hasPresentPerfectContinuous("I've been working on a report."), true);
  assert.equal(hasPresentPerfectContinuous("She has been interviewing candidates."), true);
  assert.equal(hasPresentPerfectContinuous("It has been a thing this morning."), false);
  assert.equal(hasPresentPerfectContinuous("I have been busy."), false);
  assert.equal(hasPresentPerfectContinuous("The meeting has been interesting."), false);
});

test("грамматика: past simple = прошедшая форма И маркер времени", () => {
  assert.equal(hasPastSimpleWithTimeMarker("We launched the site last week."), true);
  assert.equal(hasPastSimpleWithTimeMarker("I made a decision yesterday."), true);
  assert.equal(hasPastSimpleWithTimeMarker("We launched the site."), false);
  assert.equal(hasPastSimpleWithTimeMarker("I need it last week."), false);
});

test("трансформации и main-промпт: слабые условия не проходят", () => {
  const t1 = SLICE_TRANSFORMS.find((t) => t.id === "t1")!;
  assert.equal(transformSatisfied(t1, "I have been happy lately."), false);
  assert.equal(transformSatisfied(t1, "I've been working on a new course."), true);
  const plan = { kind: "main" as const, ru: "", lemmas: [], grammar: "ppc" as const };
  assert.equal(productionSatisfied(plan, "I was working on stuff."), false);
  assert.equal(productionSatisfied(plan, "I've been working on two projects."), true);
});

test("детект и проверка ответов: пуры", () => {
  const found = detectFoundItems("I've been working on a big report. We met the deadline.").map((i) => i.id);
  assert.ok(found.includes("frame-working-on"));
  assert.ok(found.includes("meet-a-deadline"));
  assert.equal(checkAssessmentAnswer("figure-out", "to figure out"), "correct");
  assert.equal(checkAssessmentAnswer("h-turn-down", "turn down"), "correct");
  assert.equal(checkAssessmentAnswer("h-turn-down", ""), "blank");
  assert.ok(anyAssessedItem("h-set-a-goal"));
});

test("opportunity-статусы (классификация валидной задачи): insufficient не в знаменателе", () => {
  const short = newContextOpportunities("I solved a problem.");
  assert.equal(short.statuses["solve-a-problem"], "used");
  assert.equal(short.statuses["figure-out"], "insufficient-opportunity");
  assert.equal(short.denominator, short.usedIds.length);
  const long = newContextOpportunities(
    "Last week I was busy with many small tasks at work and I finally solved a problem with our monthly report after two long days of checking every number twice."
  );
  assert.equal(long.statuses["figure-out"], "missed");
  assert.equal(long.denominator, long.usedIds.length + long.missedIds.length);
});

// ───────────────────────── протокол: претест ─────────────────────────

test("претест: неизвестная единица отклоняется", () => {
  recordPilotEntry({ P1: "yes", P2: "yes", P3: "yes", P4: "insufficient", P5: "yes" });
  assert.throws(
    () => recordAssessmentItem("pretest", "no-such-item", "", "blank"),
    /неизвестная единица/
  );
});

test("претест: полнота, иммутабельность и идемпотентность завершения", () => {
  const order = assessmentOrder();
  assert.equal(order.length, 28);

  // ноль ответов → завершение отклонено
  assert.throws(() => finishPretest(), /неполон/);

  // первая запись проходит; дубликат отклонён, свидетельство неизменно
  recordAssessmentItem("pretest", "figure-out", "figure out", "correct");
  assert.throws(
    () => recordAssessmentItem("pretest", "figure-out", "wrong", "incorrect"),
    /повторная запись/
  );
  const figEvents = sliceLog().filter(
    (e) => e.type === "assessment-item" && e.payload.itemId === "figure-out"
  );
  assert.equal(figEvents.length, 1);
  assert.equal(figEvents[0].payload.verdict, "correct");

  // частичное заполнение → завершение отклонено
  assert.throws(() => finishPretest(), /неполон/);

  // добиваем остальные 27: h-set-a-goal верно, прочие blank
  for (const id of order) {
    if (id === "figure-out") continue;
    const answer = id === "h-set-a-goal" ? anyAssessedItem(id)!.en : "";
    recordAssessmentItem("pretest", id, answer, checkAssessmentAnswer(id, answer));
  }
  finishPretest();
  const st = sliceState();
  assert.ok(st.pretestAt);
  assert.equal(st.itemOrder?.length, 28);
  assert.equal(st.holdout?.itemIds.length, 6);

  // повторное завершение отклонено, штамп не перезаписан
  const stamp = st.pretestAt;
  assert.throws(() => finishPretest(), /уже завершён/);
  assert.equal(sliceState().pretestAt, stamp);

  // запись претеста после завершения отклонена (guard состояния, не дубликата)
  assert.throws(
    () => recordAssessmentItem("pretest", "improve", "improve", "correct"),
    /после его завершения/
  );
});

test("сводка претеста: trained и holdout строго раздельно", () => {
  const s = assessmentSummary("pretest");
  assert.equal(s.trained.total, 22);
  assert.equal(s.holdout.total, 6);
  assert.equal(s.trained.correct, 1); // figure-out
  assert.equal(s.holdout.correct, 1); // h-set-a-goal
  assert.equal(s.trained.blank, 21);
  assert.equal(s.holdout.blank, 5);
});

// ───────────────────────── recovery и процесс ─────────────────────────

test("recovery НЕ тратит программу", () => {
  const p1 = nextSessionPlan();
  assert.equal(p1.type, "intro");
  startSession(p1);
  completeSession(p1);
  const before = sliceState();
  const rec = nextSessionPlan(true);
  assert.equal(rec.type, "recovery");
  startSession(rec);
  completeSession(rec);
  const after = sliceState();
  assert.equal(after.sessionsCompleted, before.sessionsCompleted);
  assert.equal(after.introDone, before.introDone);
  assert.equal(after.recoveriesCompleted, 1);
  assert.equal(needsRecovery(), false);
});

test("product completion guard requires learning evidence and is one-shot", () => {
  const plan = nextSessionPlan(true);
  const started = startSession(plan);
  const first = completeSessionGuarded(plan, started.id);
  assert.equal(
    first.completed ? "completed" : first.reason,
    plan.reviewIds.length ? "missing-retrieval" : "missing-production"
  );
  if (plan.reviewIds.length) recordRetrieval(plan.reviewIds[0], 0);
  assert.deepEqual(completeSessionGuarded(plan, started.id), {
    completed: false,
    reason: "missing-production",
  });
  recordProduction("main", "I have been working on this.", [], true);
  assert.deepEqual(completeSessionGuarded(plan, started.id), { completed: true });
  assert.deepEqual(completeSessionGuarded(plan, started.id), {
    completed: false,
    reason: "already-completed",
  });
});

test("itemEvidence — только процесс", () => {
  for (let k = 0; k < 6; k++) recordRetrieval("hire", 0);
  assert.equal(itemEvidence("hire"), "tracked");
  const pr = sliceProgress();
  const keys = Object.keys(pr).join(" ").toLowerCase();
  for (const bad of ["mastered", "learned", "level", "retention", "cefr", "spoken"]) {
    assert.ok(!keys.includes(bad));
  }
});

// ───────────────────────── протокол: день 14, часть 1 ─────────────────────────

test("тренируемые дня 14 закрыты, пока не выполнены сессии И интервал", () => {
  const s0 = sliceState();
  const timeEnough = s0.pretestAt! + 15 * DAY;

  // (a) сессий < 14: тест закрыт, записи и завершение отклонены
  assert.ok(s0.sessionsCompleted < 14);
  assert.equal(assessmentAvailable(timeEnough), false);
  assert.throws(() => finishDay14(), /до завершения программы/);
  assert.throws(
    () => recordAssessmentItem("day14", "improve", "improve", "correct"),
    /до завершения программы/
  );
  assert.throws(
    () =>
      recordNewContext(
        "Last week I solved a problem with our monthly report and it took two days."
      ),
    /до завершения дня 14/
  );

  // докручиваем программу
  while (sliceState().sessionsCompleted < 14) completeSession(nextSessionPlan());

  // (b) 14 сессий, интервал мал: закрыт (реальное «сейчас» ≈ претест)
  assert.equal(assessmentAvailable(s0.pretestAt! + 13 * DAY), false);
  assert.throws(() => finishDay14(), /раньше 14 календарных/);
  assert.throws(
    () => recordAssessmentItem("day14", "improve", "improve", "correct"),
    /раньше 14 календарных/
  );

  // (c) оба условия → открыт
  assert.equal(assessmentAvailable(timeEnough), true);
});

test("тест тренируемых: полнота, дубликаты, однократное завершение", () => {
  const s0 = sliceState();
  __setNowForTests(s0.pretestAt! + 15 * DAY);

  // контрольная в части 1 отклонена (тест тренируемых ещё не завершён)
  assert.throws(
    () => recordAssessmentItem("day14", "h-set-a-goal", "", "blank"),
    /до завершения теста тренируемых/
  );

  // ноль ответов → завершение отклонено
  assert.throws(() => finishDay14(), /неполон/);

  recordAssessmentItem("day14", "improve", "improve", "correct");
  assert.throws(
    () => recordAssessmentItem("day14", "improve", "better", "incorrect"),
    /повторная запись/
  );
  assert.equal(
    sliceLog().filter(
      (e) =>
        e.type === "assessment-item" &&
        e.payload.phase === "day14" &&
        e.payload.itemId === "improve"
    ).length,
    1
  );

  // частично → завершение отклонено
  assert.throws(() => finishDay14(), /неполон/);

  for (const id of day14TrainedOrder()) {
    if (id === "improve") continue;
    const item = anyAssessedItem(id)!;
    recordAssessmentItem("day14", id, item.en, checkAssessmentAnswer(id, item.en));
  }
  finishDay14();
  assert.throws(() => finishDay14(), /уже завершён/);
  // тренируемая после завершения части 1 — отклонена guard'ом состояния
  assert.throws(
    () => recordAssessmentItem("day14", "launch", "launch", "correct"),
    /после завершения теста тренируемых/
  );
});

// ───────────────────────── протокол: новый контекст ─────────────────────────

test("новый контекст: валидность входа и одноразовость", () => {
  // контрольные всё ещё закрыты (нового контекста нет)
  assert.throws(
    () => recordAssessmentItem("day14", "h-set-a-goal", "", "blank"),
    /до нового контекста/
  );
  assert.throws(() => finishHoldout(), /до нового контекста/);

  // валидность входа: пустота/пробелы/короче минимума — отклонение,
  // НЕ insufficient-opportunity
  assert.equal(SLICE_NEW_CONTEXT_MIN_CHARS, 10);
  assert.throws(() => recordNewContext(""), /пустой ответ/);
  assert.throws(() => recordNewContext("    "), /пустой ответ/);
  assert.throws(() => recordNewContext("short one"), /короче минимума/); // 9 символов

  const longText =
    "Last week I was busy with many small tasks at work and I finally solved a problem with our monthly report after two long days of checking every number twice.";
  const res = recordNewContext(longText, "file://voice-test.m4a");
  assert.ok(res.denominator > 0);
  assert.throws(() => recordNewContext(longText), /уже отправлен/);
});

// ───────────────────────── протокол: контрольные и финализация ─────────────────────────

test("контрольные: полнота, дубликаты, завершение; финализация однократна", () => {
  // ноль контрольных → завершение отклонено
  assert.throws(() => finishHoldout(), /неполон/);
  // финализация до контрольных → отклонена; экспорт до финализации → отклонён
  assert.throws(() => finalizePilot(), /до завершения протокола/);
  assert.throws(() => exportSliceData(), /до финализации/);
  // черновик доступен и помечен
  const draft = JSON.parse(exportPartialSliceData("до контрольных"));
  assert.equal(draft.partial, true);

  const order = holdoutOrder();
  assert.equal(order.length, 6);
  assert.ok(order.every(isHoldoutId));

  // частично: 3 из 6 → завершение отклонено; дубликат отклонён
  for (const id of order.slice(0, 3)) recordAssessmentItem("day14", id, "", "blank");
  assert.throws(() => finishHoldout(), /неполон/);
  assert.throws(
    () => recordAssessmentItem("day14", order[0], "again", "incorrect"),
    /повторная запись/
  );

  for (const id of order.slice(3)) recordAssessmentItem("day14", id, "", "blank");
  finishHoldout();
  assert.throws(() => finishHoldout(), /уже завершён/);
  // контрольная после завершения — отклонена guard'ом состояния
  assert.throws(
    () => recordAssessmentItem("day14", "h-carry-out", "", "blank"),
    /после завершения теста контрольных/
  );

  // экспорт НЕ финализирует неявно: до finalizePilot он отклоняется
  assert.throws(() => exportSliceData(), /до финализации/);
  assert.equal(sliceState().finalizedAt, undefined);

  // явная финализация: однократна, иммутабельна
  finalizePilot();
  assert.ok(sliceState().finalizedAt);
  assert.throws(() => finalizePilot(), /уже финализирован/);
  const finals = () => sliceLog().filter((e) => e.type === "pilot-finalized").length;
  assert.equal(finals(), 1);

  // повторные выгрузки после финализации — чистое чтение (без событий/мутаций)
  const parsed = JSON.parse(exportSliceData());
  assert.equal(parsed.partial, false);
  assert.ok(parsed.finalizedAt);
  const stampFinal = sliceState().finalizedAt;
  const logLen = sliceLog().length;
  const again = JSON.parse(exportSliceData());
  assert.equal(again.finalizedAt, parsed.finalizedAt);
  assert.equal(finals(), 1);
  assert.equal(sliceLog().length, logLen, "повторная выгрузка мутировала лог");
  assert.equal(sliceState().finalizedAt, stampFinal, "повторная выгрузка сдвинула штамп финализации");
  __setNowForTests(null);
});

test("сводка дня 14: trained и holdout раздельно; contamination-метаданные в событиях", () => {
  const s = assessmentSummary("day14");
  assert.equal(s.trained.total, 22);
  assert.equal(s.trained.correct, 22);
  assert.equal(s.holdout.total, 6);
  assert.equal(s.holdout.blank, 6);

  const events = sliceLog().filter((e) => e.type === "assessment-item");
  const preFig = events.find(
    (e) => e.payload.phase === "pretest" && e.payload.itemId === "figure-out"
  )!;
  assert.deepEqual(preFig.payload.exposure, {
    group: "trained",
    pretestExposed: false,
    intentionallyReassessed: false,
  });
  const d14Improve = events.find(
    (e) => e.payload.phase === "day14" && e.payload.itemId === "improve"
  )!;
  assert.deepEqual(d14Improve.payload.exposure, {
    group: "trained",
    pretestExposed: true,
    intentionallyReassessed: true,
  });
  const d14Hold = events.find(
    (e) => e.payload.phase === "day14" && e.payload.itemId === "h-set-a-goal"
  )!;
  assert.equal(d14Hold.payload.exposure.group, "holdout");
  assert.equal(d14Hold.payload.exposure.intentionallyReassessed, true);
});

test("экспорт: письменное ≠ устное; voice — только ссылка и приватность", () => {
  const parsed = JSON.parse(exportSliceData());
  assert.ok(parsed.evidenceNote.includes("ПИСЬМЕННОЕ"));
  assert.ok(parsed.evidenceNote.includes("не является свидетельством устной"));
  const refs = parsed.voiceArtifacts as { ref: string; privacy: string; analysed: boolean; promptKind: string }[];
  const nc = refs.find((v) => v.promptKind === "slice-new-context");
  assert.ok(nc);
  assert.equal(nc!.ref, "file://voice-test.m4a");
  assert.equal(nc!.privacy, "private");
  assert.equal(nc!.analysed, false);
  assert.equal(voiceArtifactRefs().some((v) => v.promptKind === "slice-new-context"), true);
  assert.equal(recordedAssessmentIds("day14").length, 28);
});
