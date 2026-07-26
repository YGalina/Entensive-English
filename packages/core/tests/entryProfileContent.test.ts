import { test } from "node:test";
import assert from "node:assert/strict";

import { S3_QUESTIONS, S3_COPY, s3CopyStrings, type SignKey } from "../entryProfileContent";
import { passesCopyFirewall, scanForBannedTerms } from "../copyFirewall";
import { isComplete, type ProfileSigns } from "../entryProfile";

test("S3 asks exactly five observable signs, one per sign key", () => {
  assert.equal(S3_QUESTIONS.length, 5);
  const keys = S3_QUESTIONS.map((q) => q.key);
  assert.deepEqual([...keys].sort(), ["s1", "s2", "s3", "s4", "s5"]);
  assert.equal(new Set(keys).size, 5);
});

test("every question offers exactly three answers: yes / no / insufficient", () => {
  for (const q of S3_QUESTIONS) {
    for (const label of [q.options.yes, q.options.no, q.options.insufficient]) {
      assert.ok(label.trim().length > 0, `${q.key} has an empty option label`);
    }
    // "Не могу оценить" must stay a first-class, non-apologetic option.
    assert.match(q.options.insufficient, /не могу оценить/i);
  }
});

test("answering all five questions satisfies profile completeness", () => {
  const answers = {} as ProfileSigns;
  for (const q of S3_QUESTIONS) answers[q.key as SignKey] = "insufficient";
  assert.equal(isComplete(answers), true);
});

test("the frozen question is reproduced verbatim from Batch A S3", () => {
  const frozen = S3_QUESTIONS.find((q) => q.key === "s3");
  assert.ok(frozen);
  assert.equal(frozen.title, "Знакомая фраза — а вслух не выходит?");
  assert.equal(frozen.kicker, "В РАЗГОВОРЕ");
  assert.equal(frozen.lead, "Планёрка. Речь заходит о сроках:");
  assert.equal(frozen.english.highlight, "met the deadline");
  assert.equal(frozen.translation, "— Мы уложились в срок.");
  assert.equal(frozen.options.yes, "Да, такое бывает");
  assert.equal(frozen.options.no, "Нет, обычно получается");
  assert.equal(frozen.pendingRatification, false);
});

test("derived questions are explicitly flagged as pending ratification", () => {
  const derived = S3_QUESTIONS.filter((q) => q.pendingRatification).map((q) => q.key);
  assert.deepEqual(derived, ["s1", "s2", "s4", "s5"]);
});

test("all S3 learner-facing copy passes the copy firewall", () => {
  for (const s of s3CopyStrings()) {
    assert.ok(s, "empty copy string");
    assert.ok(
      passesCopyFirewall(s),
      `S3 copy tripped firewall: ${JSON.stringify(s)} → ${JSON.stringify(scanForBannedTerms(s))}`,
    );
  }
});

test("save-failure copy is honest and does not over-promise", () => {
  assert.match(S3_COPY.saveFailedTitle, /Не сохранилось/);
  // Claims only what is technically true: the answers are still on screen.
  assert.match(S3_COPY.saveFailedLead, /остались на экране/);
  assert.ok(passesCopyFirewall(S3_COPY.saveFailedLead));
  // Local save is described as local — no cloud/sync promise.
  assert.match(S3_COPY.savedLocal, /на этом устройстве/);
});

test("counter renders as N из 5", () => {
  assert.equal(S3_COPY.counter(1, 5), "1 из 5");
  assert.equal(S3_COPY.counter(5, 5), "5 из 5");
});
