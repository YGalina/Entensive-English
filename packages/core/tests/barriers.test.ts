import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import {
  detectGuardian,
  canShowGuardian,
  markGuardianShown,
  snoozeToday,
  markPracticeDone,
  donePractices,
  type GuardianFacts,
} from "../barriers";
import { GUARDIANS, PRACTICES, practicesFor } from "../data/guardians";

beforeEach(() => configureStorage(memoryStorage()));

const base: GuardianFacts = {
  recentTexts: [],
  speech7d: 1,
  texts7d: 1,
  byDayMin: {},
  dailyGoalMin: 30,
};

test("контент: 4 стража, у каждого минимум 2 практики (ru+en шаги)", () => {
  assert.equal(GUARDIANS.length, 4);
  for (const g of GUARDIANS) {
    const ps = practicesFor(g.id);
    assert.ok(ps.length >= 2, g.id);
    for (const p of ps) {
      assert.ok(p.steps.length >= 2 && p.steps.length === p.stepsEn.length, p.id);
    }
  }
  assert.equal(new Set(PRACTICES.map((p) => p.id)).size, PRACTICES.length, "id уникальны");
});

test("обесценивание: ловится в русском и английском статусе", () => {
  assert.equal(detectGuardian({ ...base, recentTexts: ["Today was hard. I can't do this."] })?.id, "devaluing");
  assert.equal(detectGuardian({ ...base, recentTexts: ["опять ничего не получается"] })?.id, "devaluing");
});

test("высмеивание: извинения за свой английский", () => {
  assert.equal(detectGuardian({ ...base, recentTexts: ["Sorry for my English, my english is bad"] })?.id, "mockery");
});

test("перфекционизм: рывок 2× плана и назавтра ноль; сегодняшний ноль не считается", () => {
  const g = detectGuardian(
    { ...base, byDayMin: { "2026-07-06": 70, "2026-07-07": 0, "2026-07-08": 20 } },
    "2026-07-09"
  );
  assert.equal(g?.id, "perfectionism");
  const today = detectGuardian(
    { ...base, byDayMin: { "2026-07-08": 70 } },
    "2026-07-09"
  );
  assert.equal(today, null, "сегодня ещё можно прийти на практику — не страж");
});

test("запугивание: пишет, но не говорит (3+ текстов, 0 голоса)", () => {
  assert.equal(detectGuardian({ ...base, texts7d: 4, speech7d: 0 })?.id, "fear");
  assert.equal(detectGuardian({ ...base, texts7d: 4, speech7d: 1 }), null);
});

test("троттлинг: 1 встреча в день, тот же страж — кулдаун 3 дня, «не сейчас» глушит день", () => {
  assert.ok(canShowGuardian("fear", "2026-07-09"));
  markGuardianShown("fear", "2026-07-09");
  assert.ok(!canShowGuardian("devaluing", "2026-07-09"), "в день — одна встреча");
  assert.ok(!canShowGuardian("fear", "2026-07-11"), "кулдаун того же стража");
  assert.ok(canShowGuardian("fear", "2026-07-13"), "после кулдауна можно");
  snoozeToday("2026-07-13");
  assert.ok(!canShowGuardian("devaluing", "2026-07-13"), "не сейчас = не сегодня");
});

test("практики: отметка «пройдена» сохраняется", () => {
  markPracticeDone("fear-breath", "2026-07-09");
  assert.equal(donePractices()["fear-breath"], "2026-07-09");
});
