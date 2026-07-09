import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import { addArtifact, listArtifacts, artifactsForDay, outputStats, removeArtifact } from "../output";
import { feedbackFor, FEEDBACK_HINT_IDS } from "../feedback";
import { recordAnswer, recordProduceAnswer, dueProduceCards } from "../srs";

beforeEach(() => configureStorage(memoryStorage()));

// ——— output.ts ———

test("addArtifact сохраняет статус, он виден в списке и в дневной выборке", () => {
  const a = addArtifact({ type: "status", text: "Today I practiced for 20 minutes." });
  assert.ok(a.id.startsWith("out-"));
  assert.equal(a.privacy, "private", "артефакты приватны по умолчанию");
  assert.equal(listArtifacts().length, 1);
  assert.equal(artifactsForDay().length, 1);
});

test("outputStats: считает типы, сегодняшний статус и утреннюю фразу", () => {
  addArtifact({ type: "morning-phrase", text: "I need to stay calm today." });
  addArtifact({ type: "status", text: "I noticed English sounds less sharp." });
  addArtifact({ type: "speech", audioRef: "file://rec1.m4a" });
  const s = outputStats();
  assert.equal(s.total, 3);
  assert.equal(s.today, 3);
  assert.equal(s.statusToday, true);
  assert.equal(s.morningToday, true);
  assert.equal(s.speech, 1);
  assert.equal(s.activeDays, 1);
});

test("пустой текст не сохраняется как text; words сохраняются", () => {
  const a = addArtifact({ type: "explanation", text: "   ", words: ["steady"] });
  assert.equal(a.text, undefined);
  assert.deepEqual(a.words, ["steady"]);
});

test("removeArtifact удаляет запись", () => {
  const a = addArtifact({ type: "essay", text: "My day was long." });
  removeArtifact(a.id);
  assert.equal(listArtifacts().length, 0);
});

// ——— feedback.ts ———

test("feedbackFor ловит кальки: do decision, feel myself, depends from", () => {
  assert.equal(feedbackFor("I did a decision yesterday morning")[0]?.id, "do-decision");
  assert.equal(feedbackFor("I feel myself good")[0]?.id, "feel-myself");
  assert.equal(feedbackFor("It depends from weather")[0]?.id, "depends-from");
});

test("feedbackFor: маленькое i и маркер прошлого без прошедшего времени", () => {
  assert.ok(feedbackFor("Today i am happy").some((h) => h.id === "capital-i"));
  const past = feedbackFor("Yesterday I work and study");
  assert.ok(past.some((h) => h.id === "past-marker"));
  // а с прошедшей формой — подсказки нет
  assert.ok(!feedbackFor("Yesterday I went to work").some((h) => h.id === "past-marker"));
});

test("feedbackFor: не больше двух подсказок; чистая фраза — ноль", () => {
  const many = feedbackFor("i did a decision and it depends from my mood in monday");
  assert.ok(many.length <= 2, "максимум 2 подсказки за раз");
  assert.deepEqual(feedbackFor("Today I practiced and I feel calm."), []);
  assert.ok(FEEDBACK_HINT_IDS.length >= 8, "реестр кодов для i18n полон");
});

// ——— SRS v2: конвейер узнавание → produce ———

test("стабильно узнанное слово рождает produce-карту, due сразу", () => {
  recordAnswer("health", "recover", true);
  assert.equal(dueProduceCards().length, 0, "после первого Good produce ещё нет");
  recordAnswer("health", "recover", true);
  const due = dueProduceCards();
  assert.equal(due.length, 1, "после второго Good слово выходит в продуктив");
  assert.equal(due[0].en, "recover");
  assert.equal(due[0].direction, "produce");
});

test("produce-ответ планирует produce-карту вперёд, рецептивная не трогается", () => {
  recordAnswer("health", "steady", true);
  recordAnswer("health", "steady", true);
  recordProduceAnswer("health", "steady", true);
  assert.equal(dueProduceCards().length, 0, "после Good produce уходит в будущее");
});

test("Again в produce возвращает слово в продуктивную очередь назавтра", () => {
  recordAnswer("mind", "gentle", true);
  recordAnswer("mind", "gentle", true);
  recordProduceAnswer("mind", "gentle", false);
  const all = dueProduceCards();
  assert.equal(all.length, 0, "не сегодня — интенсив мыслит днями");
});
