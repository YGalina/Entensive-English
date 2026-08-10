# Target-user Day 1 feedback · accepted gate

Date: 2026-08-10

Status: **accepted by product owner**
Scope: current first run through S2/S3, 28-response baseline, Stage 0 Day 1, completion return and Library entry.

## Evidence boundary

The traversal was performed as a target user in the live Expo web build with think-aloud notes. It covered the complete visible path and local state transitions. It did not validate audio quality, physical Android keyboard behavior, microphone lifecycle or screen-reader output; those remain device checks.

The product owner independently recognised the same problems and accepted the findings as work input. This document records product defects and acceptance gates, not proficiency evidence or research results.

## What is retained

- The first promise is emotionally accurate and relevant to an adult who understands more than they can say.
- S3 asks meaningful questions; the three choices are understandable and fit vertically in the tested mobile-web viewport.
- Day 1 is not sparse: it contains context, comprehension, retrieval, free production, guided variation, two spoken attempts and factual closure.
- The adult Living Content direction and absence of streaks, scores and childish rewards remain correct.

## Accepted findings and disposition

| ID | Severity | Finding | Disposition | Acceptance criterion |
|---|---|---|---|---|
| TU-01 | P0 | Expo web fails before the first screen because the shared layout imports `resetOwnerQaProgressOnce`, but the web storage adapter did not export it. | Codex engineering now. | Fresh Expo web load renders `/entry` without an import/runtime error. |
| TU-02 | P0 | After Day 1 is complete, Path Hub still presents the first practice as active and reopens the completed day, creating a loop. | Existing Fable prompt 16 becomes active; implementation only after owner-approved artifact. | Full and short completion have truthful completed states; no active start CTA reopens Day 1; exactly one honest next state remains. |
| TU-03 | P0 | The visible Library action points to a legacy route that the canonical root guard correctly blocks, so the action appears broken. | Engineering/design contract correction; do **not** weaken legacy-route containment and do not expose the legacy Library. | The action either opens a product-ready S19 implementation or is honestly unavailable; it never silently returns to Entry/Day 1 and never exposes a legacy surface. |
| TU-04 | P1 | Structured retrieval treats one canonical string as the answer and rejects natural, meaningful alternatives. | Claude Opus learning-feedback contract, then Codex implementation and benchmark. | Every item distinguishes target-form retrieval, meaning-correct alternative and incorrect/insufficient response; feedback explains the distinction without calling a valid sentence wrong. |
| TU-05 | P1 | Free production can miss obvious errors and return only generic “on topic” feedback. Example: `I working on launch new product. I should meet deadline next month.` | Claude Opus contract + deterministic/LLM evaluation benchmark before code change. | The response gets a useful, bounded self-correction prompt or an explicit honest “cannot assess this part” state; silence is not presented as correctness. |
| TU-06 | P1 | The 28-response baseline takes effort but ends without a concrete explanation of what was recorded and what happens next. | Existing Fable prompt 16, S7 handoff correction. | Completion says 28 local responses were recorded, that they show current recall difficulty, and that the CTA opens the first work-themed practice directly; no score or per-item teaching appears. |
| TU-07 | P1 recheck | Earlier physical-device feedback reported obscured text input/keyboard behavior and three-choice fitting problems. Relevant corrections already exist in the current branch. | Repeat on physical Android; do not redesign unless the defect reproduces. | Typed text and active controls remain visible with the keyboard open; all three choices are reachable at 360 dp and 200% text without horizontal clipping. |
| TU-08 | P2 | The learning sequence is substantial, but the user cannot always tell why a step judged an answer a certain way or what changed after the work. | Include in feedback contract and final device regression. | Every evaluative transition states what was checked, what was not checked and the next useful action. |

## Examples that must enter the benchmark

1. `I've been working on a new onboarding lately.`
2. `We have to meet the deadline.`
3. `I came up with a way to remove one step.`
4. `I working on launch new product. I should meet deadline next month.`
5. A corrected production using `I've been working on…` that should not receive an invented error.

These examples are regression fixtures, not the complete evaluation set.

## Work order

1. Restore web runtime parity (TU-01).
2. Produce and ratify the learning-feedback contract and benchmark for TU-04/TU-05/TU-08.
3. Run Fable prompt 16 for TU-02/TU-06; visual execution remains Fable-only.
4. Resolve the product-ready Library destination without exposing the legacy tab (TU-03).
5. Implement only ratified behavior and owner-approved visuals.
6. Run automated regression plus one complete physical Android traversal covering TU-02 through TU-08.

## Release consequence

External learner testing and store preparation remain blocked while TU-02 through TU-06 are open. The amount of Day 1 practice is not the blocker; truthful evaluation, orientation and state continuity are.
