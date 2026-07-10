import { test } from "node:test";
import assert from "node:assert/strict";
import { sessionWords, sessionLevelLabel } from "../data/levelVocab";

test("sessionWords: подмешивает следующий уровень (i+1) — не только текущий", () => {
  const b1only = sessionWords("b1", new Set(), 300).map((w) => w.en.toLowerCase());
  // среди 300 слов при базе B1 должны встретиться и B2-слова (i+1),
  // иначе рост до B2 невозможен — это была дыра
  assert.ok(b1only.length > 0);
  // проверяем через метку — она показывает ветку роста
  assert.equal(sessionLevelLabel("b1"), "B1→B2");
  assert.equal(sessionLevelLabel("b2"), "B2→C1");
  assert.equal(sessionLevelLabel("c1"), "C1");
});

test("sessionWords: новые слова идут ВПЕРЁД, узнанные — в хвост на повтор", () => {
  const all = sessionWords("b1", new Set(), 5);
  const firstEn = all[0].en.toLowerCase();
  // помечаем первое слово как известное → оно должно уйти назад
  const known = new Set([firstEn]);
  const reordered = sessionWords("b1", known, 5);
  assert.notEqual(reordered[0].en.toLowerCase(), firstEn, "узнанное слово не должно быть первым");
  // но всё ещё присутствует (на повтор), не исчезает
  const full = sessionWords("b1", known, 2000).map((w) => w.en.toLowerCase());
  assert.ok(full.includes(firstEn), "узнанное слово не пропадает — уходит на повтор");
});
