import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import { recordAnswer, recordBatch, dueCards, todaysTouchedCards } from "../srs";

// Каждый тест — со свежим хранилищем в памяти (адаптер подменяется целиком).
beforeEach(() => configureStorage(memoryStorage()));

test("«Знаю» (Good) планирует на дни вперёд — сегодня в очереди пусто", () => {
  recordAnswer("health", "recover", true);
  assert.equal(dueCards().length, 0, "после Good слово не должно висеть в due");
  const touched = todaysTouchedCards();
  assert.equal(touched.length, 1);
  assert.equal(touched[0].en, "recover");
  const daysAhead = (new Date(touched[0].due).getTime() - Date.now()) / 86400000;
  assert.ok(daysAhead >= 1, `Good ≥ +1 день (получили ${daysAhead.toFixed(2)})`);
});

test("«Ещё не всплыло» (Again) возвращает слово назавтра, не сегодня", () => {
  recordAnswer("health", "ankle", false);
  assert.equal(dueCards().length, 0, "Again — не сегодня (учебных шагов нет)");
  const [card] = todaysTouchedCards();
  const daysAhead = (new Date(card.due).getTime() - Date.now()) / 86400000;
  assert.ok(daysAhead > 0.5 && daysAhead < 2, `Again ≈ завтра (${daysAhead.toFixed(2)} дн.)`);
});

test("recordBatch пишет весь блок; повторный Good отодвигает дальше", () => {
  recordBatch("health", [
    { en: "recover", known: true },
    { en: "ankle", known: false },
    { en: "surgeon", known: true },
  ]);
  assert.equal(todaysTouchedCards().length, 3);

  const firstDue = new Date(
    todaysTouchedCards().find((c) => c.en === "recover")!.due
  ).getTime();
  recordAnswer("health", "recover", true);
  const secondDue = new Date(
    todaysTouchedCards().find((c) => c.en === "recover")!.due
  ).getTime();
  assert.ok(secondDue > firstDue, "интервал растёт с каждым Good");
});
