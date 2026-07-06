import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStreak } from "../timelog";

const D = (offset: number, from = "2026-07-06") =>
  new Date(new Date(from + "T00:00:00Z").getTime() + offset * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

test("пустая история — стрик 0", () => {
  assert.equal(computeStreak({}, "2026-07-06"), 0);
});

test("сегодня занималась, вчера тоже — серия растёт", () => {
  const byDay = { [D(0)]: 300, [D(-1)]: 600, [D(-2)]: 60 };
  assert.equal(computeStreak(byDay, "2026-07-06"), 3);
});

test("сегодня ЕЩЁ не занималась — вчерашняя серия не сгорает", () => {
  const byDay = { [D(-1)]: 300, [D(-2)]: 300 };
  assert.equal(computeStreak(byDay, "2026-07-06"), 2);
});

test("пропуск позавчера обрывает серию", () => {
  const byDay = { [D(0)]: 300, [D(-1)]: 300, [D(-3)]: 300 };
  assert.equal(computeStreak(byDay, "2026-07-06"), 2);
});

test("вчера и сегодня пусто — стрик 0, даже если раньше была практика", () => {
  const byDay = { [D(-2)]: 3000, [D(-3)]: 3000 };
  assert.equal(computeStreak(byDay, "2026-07-06"), 0);
});

test("нулевые секунды за день не считаются практикой", () => {
  const byDay = { [D(0)]: 0, [D(-1)]: 300 };
  assert.equal(computeStreak(byDay, "2026-07-06"), 1);
});
