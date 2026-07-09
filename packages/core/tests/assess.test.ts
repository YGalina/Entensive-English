import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import {
  addAssessment,
  lastSpeaking,
  listAssessments,
  speakingDue,
  SPEAKING_PROMPTS,
} from "../assess";

beforeEach(() => configureStorage(memoryStorage()));

test("speakingDue: первый срез — после 7 дней вывода, не раньше", () => {
  assert.equal(speakingDue(3), false, "рано — пусть речевой контур приживётся");
  assert.equal(speakingDue(7), true);
});

test("speakingDue: после среза — кулдаун ~месяц", () => {
  addAssessment({ kind: "speaking-sample", selfScores: { fluency: 2, confidence: 2, vocabulary: 3 } });
  assert.equal(speakingDue(30), false, "только что сделали");
  const monthLater = Date.now() + 29 * 864e5;
  assert.equal(speakingDue(30, monthLater), true);
});

test("lastSpeaking возвращает свежайший; промпты билингвальны", () => {
  addAssessment({ kind: "speaking-sample", selfScores: { fluency: 1, confidence: 1, vocabulary: 1 } });
  addAssessment({ kind: "speaking-sample", selfScores: { fluency: 4, confidence: 3, vocabulary: 4 } });
  assert.equal(lastSpeaking()?.selfScores?.fluency, 4);
  assert.equal(listAssessments().length, 2);
  assert.ok(SPEAKING_PROMPTS.length >= 4);
  for (const p of SPEAKING_PROMPTS) assert.ok(p.en && p.ru, p.id);
});
