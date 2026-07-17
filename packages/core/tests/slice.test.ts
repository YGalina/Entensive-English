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
  SLICE_NEW_CONTEXT,
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
  productionSatisfied,
  hasPresentPerfectContinuous,
  hasPastSimpleWithTimeMarker,
  isHoldoutId,
  recordAssessmentItem,
  assessmentSummary,
  finishDay14,
  recordNewContext,
  newContextOpportunities,
  voiceArtifactRefs,
} = await import("../slice");

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

test("holdout: каждая контрольная подобрана парой к тренируемой и НЕ имеет учебных полей", () => {
  for (const h of SLICE_HOLDOUT) {
    assert.ok(SLICE_ITEMS.some((i) => i.id === h.matchedTo), `пара ${h.matchedTo} не найдена`);
    assert.ok(!("prompt" in h), h.id);
    assert.ok(!("day" in h), h.id);
    assert.ok(!("context" in h), h.id);
  }
  // контрольные не встречаются ни в одном учебном тексте (не тренируются даже случайно)
  for (const t of SLICE_TEXTS) {
    for (const h of SLICE_HOLDOUT) {
      assert.ok(!itemFoundInText(h, t.en), `${h.id} утёк в текст дня ${t.day}`);
    }
  }
});

test("банк: каждая единица дня реально встречается в тексте своего дня", () => {
  for (const t of SLICE_TEXTS) {
    for (const item of itemsForDay(t.day)) {
      assert.ok(itemFoundInText(item, t.en), `${item.id} не найден в тексте дня ${t.day}`);
    }
  }
});

test("грамматика: PPC ловит настоящую форму и не ловит ловушки", () => {
  assert.equal(hasPresentPerfectContinuous("I've been working on a report."), true);
  assert.equal(hasPresentPerfectContinuous("She has been interviewing candidates."), true);
  assert.equal(hasPresentPerfectContinuous("We have just been testing it."), true);
  // ловушки: been + не-глагол, просто been, просто -ing
  assert.equal(hasPresentPerfectContinuous("It has been a thing this morning."), false);
  assert.equal(hasPresentPerfectContinuous("I have been busy."), false);
  assert.equal(hasPresentPerfectContinuous("I am working on it."), false);
  assert.equal(hasPresentPerfectContinuous("The meeting has been interesting."), false);
});

test("грамматика: past simple требует прошедшую форму И маркер времени", () => {
  assert.equal(hasPastSimpleWithTimeMarker("We launched the site last week."), true);
  assert.equal(hasPastSimpleWithTimeMarker("I made a decision yesterday."), true);
  assert.equal(hasPastSimpleWithTimeMarker("We met the client in june."), true);
  // прошедшее без времени / время без прошедшего / need-ловушка
  assert.equal(hasPastSimpleWithTimeMarker("We launched the site."), false);
  assert.equal(hasPastSimpleWithTimeMarker("I work hard yesterday."), false);
  assert.equal(hasPastSimpleWithTimeMarker("I need it last week."), false);
});

test("трансформация: слабые условия больше не проходят", () => {
  const t1 = SLICE_TRANSFORMS.find((t) => t.id === "t1")!;
  // раньше хватало слова been — теперь нужна конструкция
  assert.equal(transformSatisfied(t1, "I have been happy lately."), false);
  assert.equal(transformSatisfied(t1, "I've been working on a new course."), true);
  const t4 = SLICE_TRANSFORMS.find((t) => t.id === "t4")!;
  assert.equal(transformSatisfied(t4, "made"), false); // голое made без времени
  assert.equal(transformSatisfied(t4, "Yesterday we made a decision to move."), true);
  const t3 = SLICE_TRANSFORMS.find((t) => t.id === "t3")!;
  assert.equal(transformSatisfied(t3, "I fixed this bug on Monday."), false);
  assert.equal(transformSatisfied(t3, "I've been fixing this bug since Monday."), true);
});

test("production: main-промпт требует валидированный PPC", () => {
  const plan = { kind: "main" as const, ru: "", lemmas: [], grammar: "ppc" as const };
  assert.equal(productionSatisfied(plan, "I was working on stuff."), false);
  assert.equal(productionSatisfied(plan, "I've been working on two projects."), true);
});

test("детект единиц: находит и не выдумывает", () => {
  const text =
    "I've been working on a big report. We met the deadline and I came up with a new idea.";
  const found = detectFoundItems(text).map((i) => i.id);
  assert.ok(found.includes("frame-working-on"));
  assert.ok(found.includes("meet-a-deadline"));
  assert.ok(found.includes("come-up-with"));
  assert.ok(!detectFoundItems("I was running fast").some((i) => i.id === "run-a-project"));
});

test("оценка ответа: тренируемые и контрольные резолвятся; blank честен", () => {
  assert.equal(checkAssessmentAnswer("figure-out", "to figure out"), "correct");
  assert.equal(checkAssessmentAnswer("h-turn-down", "turn down"), "correct");
  assert.equal(checkAssessmentAnswer("h-turn-down", "reject"), "incorrect");
  assert.equal(checkAssessmentAnswer("h-turn-down", ""), "blank");
  assert.ok(anyAssessedItem("h-set-a-goal"));
  assert.ok(isHoldoutId("h-set-a-goal"));
  assert.ok(!isHoldoutId("figure-out"));
});

test("порядок теста: 28 единиц, фиксируется на претесте; HoldoutAssignment записан", () => {
  recordPilotEntry({ P1: "yes", P2: "yes", P3: "yes", P4: "insufficient", P5: "yes" });
  const before = assessmentOrder();
  assert.equal(before.length, 28);
  finishPretest();
  assert.deepEqual(assessmentOrder(), before);
  const st = sliceState();
  assert.equal(st.holdout?.itemIds.length, 6);
  assert.equal(st.holdout?.experimentId, "slice-v1-pilot");
  assert.ok(sliceLog().some((e) => e.type === "holdout-assigned"));
});

test("сводка теста: тренируемые и holdout считаются РАЗДЕЛЬНО", () => {
  recordAssessmentItem("pretest", "figure-out", "figure out", "correct");
  recordAssessmentItem("pretest", "launch", "", "blank");
  recordAssessmentItem("pretest", "h-turn-down", "", "blank");
  recordAssessmentItem("pretest", "h-set-a-goal", "set a goal", "correct");
  const s = assessmentSummary("pretest");
  assert.equal(s.trained.correct, 1);
  assert.equal(s.trained.blank, 1);
  assert.equal(s.holdout.correct, 1);
  assert.equal(s.holdout.blank, 1);
  // holdout не попал в trained и наоборот
  assert.equal(s.trained.total, 2);
  assert.equal(s.holdout.total, 2);
});

test("recovery НЕ тратит программу: счётчики, день введения и план сохраняются", () => {
  // пройдём интро-день 1 обычной сессией
  const p1 = nextSessionPlan();
  assert.equal(p1.type, "intro");
  startSession(p1);
  completeSession(p1);
  const before = sliceState();
  const planBefore = nextSessionPlan();

  // возврат: завершается полностью
  const rec = nextSessionPlan(true);
  assert.equal(rec.type, "recovery");
  assert.equal(rec.newItems.length, 0);
  startSession(rec);
  completeSession(rec);

  const after = sliceState();
  assert.equal(after.sessionsCompleted, before.sessionsCompleted, "sessionsCompleted изменился");
  assert.equal(after.introDone, before.introDone, "introDone изменился");
  assert.equal(after.recoveriesCompleted, 1);
  // следующий обычный план не сдвинулся
  const planAfter = nextSessionPlan();
  assert.equal(planAfter.type, planBefore.type);
  assert.equal(planAfter.number, planBefore.number);
  assert.equal(planAfter.introDay, planBefore.introDay);
  // recovery после recovery не требуется (lastSessionAt обновлён)
  assert.equal(needsRecovery(), false);
});

test("14-сессионный кап не пробивается recovery-сессиями", () => {
  // даже десять возвратов не двигают программу
  for (let k = 0; k < 10; k++) {
    const rec = nextSessionPlan(true);
    completeSession(rec);
  }
  const st = sliceState();
  assert.equal(st.sessionsCompleted, 1);
  assert.equal(st.recoveriesCompleted, 11);
  assert.ok(st.sessionsCompleted <= 14);
});

test("itemEvidence — только процесс: два значения, «tracked» не растёт до mastery", () => {
  // даже после многих идеальных извлечений — только tracked
  for (let k = 0; k < 6; k++) recordRetrieval("hire", 0);
  assert.equal(itemEvidence("hire"), "tracked");
  const allowed = new Set(["insufficient", "tracked"]);
  for (const i of SLICE_ITEMS) assert.ok(allowed.has(itemEvidence(i.id)));
  // прогресс не содержит полей с языком владения
  const pr = sliceProgress();
  const keys = Object.keys(pr).join(" ");
  for (const bad of ["mastered", "learned", "level", "retention", "cefr", "spoken"]) {
    assert.ok(!keys.toLowerCase().includes(bad), `поле прогресса пахнет владением: ${bad}`);
  }
});

test("гейт дня 14: нужны ОБА условия; ранние переходы отвергаются ядром", () => {
  const s0 = sliceState();
  assert.ok(s0.pretestAt);
  const timeEnough = s0.pretestAt! + 15 * DAY;

  // (a) времени достаточно, сессий < 14 → закрыт
  assert.ok(s0.sessionsCompleted < 14);
  assert.equal(assessmentAvailable(timeEnough), false);
  // и ядро отвергает прямые вызовы, минуя UI
  assert.throws(() => finishDay14(), /до завершения программы/);
  assert.throws(
    () => recordNewContext("Last week I solved a problem with our monthly report."),
    /до завершения дня 14/
  );

  // докручиваем программу до 14 учебных сессий
  while (sliceState().sessionsCompleted < 14) {
    completeSession(nextSessionPlan());
  }
  assert.equal(sliceState().sessionsCompleted, 14);

  // (b) 14 сессий, времени мало → закрыт; finishDay14 отвергает по времени
  assert.equal(assessmentAvailable(s0.pretestAt! + 13 * DAY), false);
  assert.throws(() => finishDay14(), /раньше 14 календарных/);

  // (c) оба условия → открыт
  assert.equal(assessmentAvailable(timeEnough), true);
});

test("finishDay14/recordNewContext: валидный путь один раз, повторы отвергаются", () => {
  const s0 = sliceState();
  __setNowForTests(s0.pretestAt! + 15 * DAY);
  finishDay14(); // валидный переход
  assert.throws(() => finishDay14(), /уже завершён/);

  const longText =
    "Last week I was busy with many small tasks at work and I finally solved a problem with our monthly report after two long days of checking every number twice.";
  const res = recordNewContext(longText, "file://voice-test.m4a");
  assert.ok(res.denominator > 0);
  assert.throws(() => recordNewContext(longText), /уже отправлен/);
  __setNowForTests(null);
});

test("opportunity-статусы: insufficient не входит в знаменатель", () => {
  // короткий ответ: использованное — used, остальное — insufficient, не missed
  const short = newContextOpportunities("I solved a problem.");
  assert.equal(short.statuses["solve-a-problem"], "used");
  assert.equal(short.statuses["figure-out"], "insufficient-opportunity");
  assert.equal(short.missedIds.length, 0);
  assert.equal(short.denominator, short.usedIds.length);

  // развёрнутый ответ (≥25 слов): неиспользованное — честный missed
  const long = newContextOpportunities(
    "Last week I was busy with many small tasks at work and I finally solved a problem with our monthly report after two long days of checking every number twice."
  );
  assert.equal(long.statuses["figure-out"], "missed");
  assert.ok(long.wordCount >= 25);
  assert.equal(long.denominator, long.usedIds.length + long.missedIds.length);
  assert.ok(!long.insufficientIds.length);
});

test("contamination-метаданные — прямо в событии, без вывода из типа", () => {
  // figure-out был на претесте → день 14 = намеренный повторный замер
  recordAssessmentItem("day14", "figure-out", "figure out", "correct");
  let e = sliceLog().filter((x) => x.type === "assessment-item").at(-1)!;
  assert.deepEqual(e.payload.exposure, {
    group: "trained",
    pretestExposed: true,
    intentionallyReassessed: true,
  });

  // improve на претесте в ЭТОМ тест-файле не предъявлялся
  recordAssessmentItem("day14", "improve", "improve", "correct");
  e = sliceLog().filter((x) => x.type === "assessment-item").at(-1)!;
  assert.deepEqual(e.payload.exposure, {
    group: "trained",
    pretestExposed: false,
    intentionallyReassessed: false,
  });

  // holdout с претестом: группа holdout + повторный замер
  recordAssessmentItem("day14", "h-turn-down", "", "blank");
  e = sliceLog().filter((x) => x.type === "assessment-item").at(-1)!;
  assert.deepEqual(e.payload.exposure, {
    group: "holdout",
    pretestExposed: true,
    intentionallyReassessed: true,
  });
});

test("экспорт: классы доказательств разделены; voice — только ссылка и приватность", () => {
  const parsed = JSON.parse(exportSliceData());
  assert.ok(parsed.evidenceNote.includes("ПИСЬМЕННОЕ"));
  assert.ok(parsed.evidenceNote.includes("не является свидетельством устной"));
  assert.ok(parsed.summaries.pretest.trained);
  assert.ok(parsed.summaries.pretest.holdout);
  assert.ok(Array.isArray(parsed.log));
  assert.equal(parsed.experimentId, "slice-v1-pilot");
  // голос нового контекста: ссылка сохранена, содержимого и анализа нет
  const refs = parsed.voiceArtifacts as { ref: string; privacy: string; analysed: boolean; promptKind: string }[];
  const nc = refs.find((v) => v.promptKind === "slice-new-context");
  assert.ok(nc, "ссылка на голос нового контекста не сохранилась");
  assert.equal(nc!.ref, "file://voice-test.m4a");
  assert.equal(nc!.privacy, "private");
  assert.equal(nc!.analysed, false);
  assert.deepEqual(voiceArtifactRefs().find((v) => v.promptKind === "slice-new-context")?.ref, "file://voice-test.m4a");
});
