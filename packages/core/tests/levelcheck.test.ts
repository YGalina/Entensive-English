import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pickSample,
  buildCheckItems,
  scoreCheck,
  FAKE_WORDS,
  type RawWord,
} from "../levelcheck";

function fakeList(prefix: string, n: number): RawWord[] {
  return Array.from({ length: n }, (_, i) => ({
    en: `${prefix}${i}`,
    ipa: "",
    ru: "",
  }));
}

const LISTS = {
  b1: fakeList("b1_", 100),
  b2: fakeList("b2_", 100),
  c1: fakeList("c1_", 100),
};

test("pickSample: ровно count слов, без краёв списка, без повторов", () => {
  const list = fakeList("w", 300);
  const sample = pickSample(list, 6);
  assert.equal(sample.length, 6);
  assert.ok(!sample.includes(list[0]));
  assert.ok(!sample.includes(list[list.length - 1]));
  assert.equal(new Set(sample.map((w) => w.en)).size, 6);
});

test("buildCheckItems: 18 реальных + 3 фальш-слова, вкраплены в середину", () => {
  const items = buildCheckItems(LISTS);
  assert.equal(items.length, 21);
  const fakes = items.filter((i) => i.kind === "fake");
  assert.equal(fakes.length, 3);
  assert.deepEqual(
    fakes.map((f) => f.w.en).sort(),
    FAKE_WORDS.map((f) => f.en).sort()
  );
  // Не в начале и не подряд в конце
  assert.notEqual(items[0].kind, "fake");
  const fakeIdx = items.map((i, n) => (i.kind === "fake" ? n : -1)).filter((n) => n >= 0);
  assert.ok(fakeIdx[0] >= 3 && fakeIdx[2] <= 19);
});

test("порог строгий: 4 из 6 на ярусе НЕ зачитывается (v1-баг с 50% закрыт)", () => {
  assert.equal(scoreCheck({ b1: 4, b2: 0, c1: 0 }, 0).level, "a2");
  assert.equal(scoreCheck({ b1: 5, b2: 4, c1: 0 }, 0).level, "b1");
  assert.equal(scoreCheck({ b1: 6, b2: 5, c1: 4 }, 0).level, "b2");
});

test("потолок B2: даже идеальные ответы словами C1 не подтверждают", () => {
  const r = scoreCheck({ b1: 6, b2: 6, c1: 6 }, 0);
  assert.equal(r.level, "b2");
  assert.equal(r.cappedHigh, true, "флаг «возможно выше — покажет практика»");
});

test("фальш-слова: ≥2 «знаю» на выдуманных → ненадёжно, мягкий дефолт B1", () => {
  const r = scoreCheck({ b1: 6, b2: 6, c1: 6 }, 2);
  assert.equal(r.unreliable, true);
  assert.equal(r.level, "b1");
  // одна ловушка — прощаем (могла показаться знакомой)
  assert.equal(scoreCheck({ b1: 6, b2: 5, c1: 0 }, 1).unreliable, false);
});

test("честный новичок: мало b1 → A2 без флагов", () => {
  const r = scoreCheck({ b1: 2, b2: 0, c1: 0 }, 0);
  assert.deepEqual(r, { level: "a2", cappedHigh: false, unreliable: false });
});
