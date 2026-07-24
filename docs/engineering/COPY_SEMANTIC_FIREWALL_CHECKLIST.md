# Copy / Semantic Firewall Checklist

Status: v1 · 2026-07-24 · Branch: `codex/recovery-integrity-freeze`
Scope: every learner-facing string before a screen ships. Internal docs, specs and source code are **not** learner-facing and are not scanned.

Machine-checkable source: `packages/core/copyFirewall.ts` (`scanForBannedTerms`, `passesCopyFirewall`, `BANNED_LEARNER_TERMS`, `SEMANTIC_RULES`). Run it over visible copy in tests/lint before implementing a screen.

## A. Banned learner-facing terms

Reject any of these in UI copy (RU + EN). Each maps to a rule id in `copyFirewall.ts`.

- [ ] `pilot` / «пилот…»
- [ ] `vertical slice` / «вертикальный срез»
- [ ] `protocol` / «протокол…» (as a UI label)
- [ ] `holdout` / «холдаут»
- [ ] `trained group` / `control group` / «тренированная/контрольная группа»
- [ ] `artifact` / «артефакт» (as a UI label)
- [ ] `evidence class` / «класс свидетельств»
- [ ] `SRS` (say «повтор» instead)
- [ ] `core-accepted`
- [ ] `streak` / «стрик» / «N подряд»
- [ ] `guardian` / «страж»
- [ ] `levelcheck` / «проверка уровня» (CEFR from activity)
- [ ] CEFR band as a claim about the person (`A1…C2`) — material-difficulty labels on content are a **separate allowed context**, judged by a human
- [ ] `% курса` / «часы до B2» / percent-of-course
- [ ] speech/accent scoring — «оценка произношения», accent judgement
- [ ] cloud/sync promises — «в облаке», cloud sync
- [ ] fluency-by-date — «свободно за N…»

## B. Semantic rules (human review; not only vocabulary)

From `SEMANTIC_RULES` in `copyFirewall.ts`:

- [ ] Process fact (hours, activity) is not presented as competence/level.
- [ ] Public claim ≤ realized evidence class.
- [ ] Written is not passed off as spoken.
- [ ] Level only from an externally valid assessment, never from activity.
- [ ] The interface never asserts which feeling the learner had.
- [ ] Payment never gates the learner's own data and never appears inside assessment.
- [ ] Voice is private by default, not analysed, never a gate.
- [ ] Progress is a projection — not a gate, not truth.

## C. How to apply

1. Collect every visible string of the screen (default + all states).
2. Run `scanForBannedTerms` over each; a non-empty result blocks the screen.
3. Manually check the Section B semantic rules (not machine-detectable).
4. For an intentional exception (e.g. a content difficulty label), document it in the screen's design/state task; do not weaken the shared list.

## D. Related invariants (code)

- Route product-readiness: `packages/core/routes.ts` (`isProductReady`, `LEGACY_ROUTES`).
- Progress-writer invariant: `packages/core/eventCategories.ts` (`mayWriteProgress`).
- One-next-step projection: `packages/core/pathNextStep.ts` (`computeNextStep`, read-only).
