import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDayPlan, DAY_STEPS } from "../dayplan";

test("пустой день: ни один шаг не закрыт, кроме повторов при пустой очереди", () => {
  const plan = buildDayPlan({}, 0, 0);
  assert.equal(plan.total, DAY_STEPS.length);
  const review = plan.steps.find((s) => s.kind === "review")!;
  assert.equal(review.done, true, "пустая очередь FSRS = повторы закрыты");
  assert.equal(plan.doneCount, 1);
  assert.equal(plan.current?.id, DAY_STEPS[0].id, "первый шаг — текущий");
});

test("шаг закрывается реальными минутами практики, прогресс капится на 100", () => {
  const session = DAY_STEPS.find((s) => s.id === "session")!;
  const half = { [session.activities[0]]: (session.goalMin / 2) * 60 };
  const halfPlan = buildDayPlan(half, 5, 0);
  const halfStep = halfPlan.steps.find((s) => s.id === "session")!;
  assert.equal(halfStep.pct, 50);
  assert.equal(halfStep.done, false);

  const over = { [session.activities[0]]: session.goalMin * 60 * 3 };
  const overStep = buildDayPlan(over, 5, 0).steps.find((s) => s.id === "session")!;
  assert.equal(overStep.pct, 100, "перевыполнение не раздувает процент");
  assert.equal(overStep.done, true);
});

test("минуты суммируются по всем активностям шага; очередь SRS видна в due", () => {
  const session = DAY_STEPS.find((s) => s.id === "session")!;
  assert.ok(session.activities.length >= 2, "у сеанса несколько активностей");
  const spread: Record<string, number> = {};
  for (const a of session.activities) spread[a] = (session.goalMin * 60) / session.activities.length;
  const step = buildDayPlan(spread, 7, 1234).steps.find((s) => s.id === "session")!;
  assert.equal(step.done, true, "сумма активностей закрывает шаг");
  const review = buildDayPlan(spread, 7, 1234).steps.find((s) => s.kind === "review")!;
  assert.equal(review.due, 7);
  assert.equal(review.done, false);
});

test("день собран: current = null, todayMin округляется", () => {
  const full: Record<string, number> = {};
  for (const s of DAY_STEPS) for (const a of s.activities) full[a] = s.goalMin * 60;
  const plan = buildDayPlan(full, 0, 90);
  assert.equal(plan.current, null);
  assert.equal(plan.doneCount, plan.total);
  assert.equal(plan.todayMin, 2, "90 сек → 2 мин (Math.round)");
});
