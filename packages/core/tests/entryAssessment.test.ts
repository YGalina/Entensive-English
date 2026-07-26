import assert from "node:assert/strict";
import test from "node:test";
import { assessmentGateView } from "../entryAssessment";
import { ENTRY_ASSESSMENT_COPY } from "../entryAssessment";
import { scanForBannedTerms } from "../copyFirewall";

const DAY = 24 * 60 * 60 * 1000;

test("S8 stays closed until both 14 sessions and 14 days are complete", () => {
  const started = 1_700_000_000_000;
  assert.equal(assessmentGateView(started, 14, started + 13 * DAY).available, false);
  assert.equal(assessmentGateView(started, 13, started + 14 * DAY).available, false);
  assert.equal(assessmentGateView(started, 14, started + 14 * DAY).available, true);
});

test("S8 projection clamps display values and reports exact remainder", () => {
  const started = 1_700_000_000_000;
  const view = assessmentGateView(started, 11, started + 8 * DAY);
  assert.deepEqual(
    {
      sessions: view.sessions,
      sessionsRemaining: view.sessionsRemaining,
      days: view.days,
      daysRemaining: view.daysRemaining,
    },
    { sessions: 11, sessionsRemaining: 3, days: 8, daysRemaining: 6 }
  );
  assert.equal(view.opensAt, started + 14 * DAY);
});

test("S7/S8 learner-facing copy passes the semantic firewall", () => {
  for (const text of Object.values(ENTRY_ASSESSMENT_COPY)) {
    assert.deepEqual(scanForBannedTerms(text), []);
  }
});
