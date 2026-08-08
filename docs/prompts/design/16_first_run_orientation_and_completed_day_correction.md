# Fable correction — first-run orientation and completed-day state · v1

Open the existing `Intensive English дизайн-система` project and continue the accepted Living Content system. Source repository branch: `codex/stage0-day1-vertical-slice`.

Read first:

- `PRODUCT_CONSTITUTION.md`
- `docs/governance/DEVELOPMENT_CONSTITUTION.md`
- `docs/ux/stage0/STAGE0_LEARNING_EXPERIENCE_CONTRACT.md`
- `docs/ux/stage0/STAGE0_SCREEN_AND_STATE_MAP.md`
- `docs/ux/stage0/STAGE0_COPY_INVENTORY.md`
- `docs/design/exports/batch-a-defaults-final/`
- `docs/design/exports/stage0-owner-device-correction-v1/`
- `docs/design/exports/stage0-day1-v1/`

## Why this correction exists

Physical Android testing on 2026-08-08 exposed a first-run comprehension failure and a completed-session loop:

1. S2/S3 do not explain what Intensive English will do, what the initial 28 responses are for, or what the first practice contains. The owner experienced this as “no onboarding”.
2. After item 28, `Стартовая точка сохранена` does not say concretely what was saved. The following training is still unexplained.
3. Two successive start actions made the first CTA feel broken: the S7 completion CTA opened Path Hub, where another `Начать практику` was required. Engineering now routes the S7 completion CTA directly to the Day 1 plan.
4. After short Day 1 is completed, Path Hub still offers `Начать практику` and reopens the already completed Day 1. The learner sees the completion screen again and believes the controls do nothing.

These are owner findings and override the earlier acceptance of the ambiguous S7 wording. Do not reproduce `Стартовая точка сохранена` as the final headline merely because it exists in the previous package.

## Role boundary

You are Claude Design / Fable, the exclusive visual-design authority. Produce the visual/copy correction only. Do not edit application code, learning mechanics, assessment scoring or navigation architecture.

Preserve Living Content and all unaffected accepted screens. This is not permission to restore the legacy onboarding, old icon, automatic word cycling, word-flood, music, coach upsell, guardians, streaks, levelcheck, CEFR inference, old monetisation or obsolete app surfaces.

## Required correction A — first-run orientation

Add the minimum orientation necessary before the initial assessment/practice sequence. It must make these facts understandable in learner language:

- Intensive English is practice for moving familiar English into the learner's own speech and writing;
- first, 28 short responses show which phrases do not come back from memory yet;
- this is not an exam and there is no level or score;
- then the learner receives a first practice about work;
- the practice has a full path of about 30 minutes and an available short path of about 16 minutes;
- the learner writes and speaks; written production receives the already approved truthful feedback, while voice is not analysed.

Keep this orientation short enough for a first run. Decide whether it is one concise state or a very small sequence, but do not add a product tour, feature carousel, permissions, reminders, account setup or future promises.

Supply final learner-facing Russian copy in the artifact. Copy must be concrete, plain and free of internal terms such as protocol, baseline, Stage 0, pilot, target unit or vertical slice.

## Required correction B — S7 completion handoff

Replace the ambiguous completion copy after response 28. The state must answer:

- what just happened: 28 responses were saved locally;
- why: they show what is difficult to recall now;
- what happens next: the first work-themed practice opens;
- what the CTA does: it opens the Day 1 plan directly.

Per-item correctness, answers, mistakes, score, level, percentage and CEFR remain hidden. Do not praise or judge the learner. Provide one dominant CTA; there must not be a second start gate immediately afterward.

## Required correction C — Day 1 plan action semantics

Correct the plan state so both choices are unambiguous:

- the primary full-path action explicitly starts or resumes the approximately 30-minute path;
- the short-path action explicitly starts or switches to the approximately 16-minute path;
- neither action may look like informational text;
- returning to Path Hub remains possible but does not compete with the two path choices.

Do not change the accepted Day 1 exercises, order, minimum evidence or full/short mechanics.

## Required correction D — completed-day Path Hub

Create the Path Hub state for a Day 1 already completed in full and in short mode.

It must:

- truthfully show that today's Day 1 is complete and distinguish short completion when relevant;
- show the already approved completion facts without inventing progress, score or future availability;
- remove the active `Начать практику` action for the already completed Day 1;
- never reopen the completed session as if it were new;
- make clear that no additional day is currently available, without promising a release time or background delivery;
- keep Library as the existing quiet lateral action.

The engineering implementation will use this state to break the current Path Hub → completed Day 1 → Path Hub loop.

## Device evidence and states

Provide reviewable references at:

- 360 × 800 Android;
- 390 × 844 Android;
- 360 × 800 with 200% system text for the new orientation and completed-day Path Hub state.

All text and actions must be reachable by obvious vertical scrolling, with no clipping or horizontal overflow and no reduced touch targets.

## Deliverables

Save the package under:

`docs/design/exports/first-run-orientation-completed-day-v1/`

Include:

- one review board;
- individual HTML screen/state exports;
- final copy and state inventory;
- implementation handoff defining CTA destinations and full/short/completed state conditions;
- a short statement of what existing screens remain unchanged.

Stop for Codex inspection and owner visual approval. Do not alter any accepted export in place.
