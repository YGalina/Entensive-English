import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import {
  hoursBudget,
  levelSteps,
  capabilityProgress,
  saveGoal,
  loadGoal,
  type Goal,
} from "../goal";

beforeEach(() => configureStorage(memoryStorage()));

const goal: Goal = {
  lifeGoal: "К декабрю выйти на B2, чтобы работать в среде",
  domain: "work",
  currentLevel: "b1",
  targetLevel: "b2",
  weeklyMinutes: 210, // 30 мин/день
};

test("levelSteps: b1→b2 = 1 шаг, c1→a2 = 0 (не отрицательный)", () => {
  assert.equal(levelSteps("b1", "b2"), 1);
  assert.equal(levelSteps("b1", "c1"), 2);
  assert.equal(levelSteps("c1", "a2"), 0);
});

test("hoursBudget: диапазон 180–220 ч на шаг, месяцы от темпа — ориентир", () => {
  const b = hoursBudget(goal);
  assert.deepEqual(b.range, [180, 220]);
  // 200 ч при 3.5 ч/нед ≈ 57 нед ≈ 13 мес — честно, без «за 30 дней»
  assert.ok(b.months !== null && b.months > 11 && b.months < 15, `months=${b.months}`);
});

test("hoursBudget: дедлайн даёт требуемый недельный темп", () => {
  const now = Date.UTC(2026, 0, 1);
  const b = hoursBudget(
    { ...goal, deadline: new Date(Date.UTC(2026, 11, 31)).toISOString() },
    now
  );
  // 200 ч за ~52 недели ≈ 3.8 ч/нед ≈ 230 мин (кратно 5)
  assert.ok(
    b.weeklyMinutesForDeadline !== null && b.weeklyMinutesForDeadline >= 220 && b.weeklyMinutesForDeadline <= 245,
    `weekly=${b.weeklyMinutesForDeadline}`
  );
});

test("capabilityProgress: вехи домена + универсальные; разблокировка от фактов", () => {
  const empty = capabilityProgress("work", { statuses: 0, activeWords: 0, speech: 0 });
  assert.ok(empty.length >= 4, "work + unlock-speech вехи");
  assert.ok(empty.every((c) => !c.unlocked));

  const some = capabilityProgress("work", { statuses: 5, activeWords: 10, speech: 3 });
  const intro = some.find((c) => c.id === "canIntroduceMyself");
  assert.ok(intro?.unlocked, "5 статусов + 3 записи открывают canIntroduceMyself");
  const daily = some.find((c) => c.id === "canWriteDailyStatus");
  assert.ok(daily?.unlocked);
});

test("saveGoal/loadGoal: цель хранится локально", () => {
  assert.equal(loadGoal(), null);
  saveGoal(goal);
  assert.equal(loadGoal()?.domain, "work");
  assert.equal(loadGoal()?.lifeGoal, goal.lifeGoal);
});
