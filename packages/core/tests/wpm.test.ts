import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage, storage } from "../storage";
import { recordWpm } from "../wpm";

beforeEach(() => configureStorage(memoryStorage()));

function stored(): { d: string; wpm: number; words: number }[] {
  return JSON.parse(storage().getItem("ie_wpm") ?? "[]");
}

test("валидный замер записывается с округлением и датой", () => {
  recordWpm(147.6, 320, 130);
  const list = stored();
  assert.equal(list.length, 1);
  assert.equal(list[0].wpm, 148);
  assert.equal(list[0].words, 320);
  assert.match(list[0].d, /^\d{4}-\d{2}-\d{2}$/);
});

test("мусор не портит историю: короткие сессии и нереальные значения", () => {
  recordWpm(150, 40, 10); // < 20 c — открыла-закрыла
  recordWpm(20, 300, 120); // < 30 wpm — нереально медленно
  recordWpm(900, 300, 120); // > 600 wpm — нереально быстро
  assert.equal(stored().length, 0);
});

test("история ограничена последними 200 замерами", () => {
  for (let i = 0; i < 210; i++) recordWpm(100 + (i % 50), 250, 60);
  assert.equal(stored().length, 200);
});
