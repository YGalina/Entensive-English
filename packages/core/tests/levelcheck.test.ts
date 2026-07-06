import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pickSample,
  buildCheckWords,
  scoreLevel,
  type RawWord,
} from "../levelcheck";

function fakeList(prefix: string, n: number): RawWord[] {
  return Array.from({ length: n }, (_, i) => ({
    en: `${prefix}${i}`,
    ipa: "",
    ru: "",
  }));
}

test("pickSample: ровно count слов, без краёв списка, без повторов", () => {
  const list = fakeList("w", 300);
  const sample = pickSample(list, 6);
  assert.equal(sample.length, 6);
  assert.ok(!sample.includes(list[0]), "первое слово списка не берём");
  assert.ok(!sample.includes(list[list.length - 1]), "последнее не берём");
  assert.equal(new Set(sample.map((w) => w.en)).size, 6, "без дублей");
});

test("buildCheckWords: 18 слов, по 6 на ярус, от простого к сложному", () => {
  const words = buildCheckWords({
    b1: fakeList("b1_", 100),
    b2: fakeList("b2_", 100),
    c1: fakeList("c1_", 100),
  });
  assert.equal(words.length, 18);
  assert.deepEqual(
    words.map((w) => w.lvl),
    [...Array(6).fill("b1"), ...Array(6).fill("b2"), ...Array(6).fill("c1")]
  );
  for (const w of words) assert.ok(w.w.en.startsWith(w.lvl + "_"));
});

test("scoreLevel: пороги «2 из 6» на каждом ярусе", () => {
  assert.equal(scoreLevel({ b1: 0, b2: 0, c1: 0 }), "a2");
  assert.equal(scoreLevel({ b1: 2, b2: 6, c1: 6 }), "a2");
  assert.equal(scoreLevel({ b1: 3, b2: 2, c1: 6 }), "b1");
  assert.equal(scoreLevel({ b1: 6, b2: 3, c1: 2 }), "b2");
  assert.equal(scoreLevel({ b1: 6, b2: 6, c1: 3 }), "c1");
});
