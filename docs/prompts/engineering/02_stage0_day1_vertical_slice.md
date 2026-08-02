# Engineering Prompt 02
# Stage 0 Day 1 Working Vertical Slice

## Role

Act as the implementation engineer for Intensive English.

Visual design is already approved. Fable/Claude Design is the sole visual-design
authority. Implement the accepted artifacts faithfully; do not redraw, simplify,
restyle or reinterpret them.

## Start

1. Work from the branch containing the accepted Stage 0 Day 1 design-freeze commit.
2. Read `.ai/AI_PROJECT.md`, `.ai/AI_RULES.md`, `.ai/SESSION.md`, `.ai/TASKS.md` and the Git Working Protocol.
3. Confirm the worktree state and preserve unrelated changes.
4. Create a new branch: `codex/stage0-day1-vertical-slice`.

## Governing inputs

- `docs/design/exports/stage0-day1-v1/README.md`
- `docs/design/exports/stage0-day1-v1/STAGE0_DAY1_DEFAULT_V2.html`
- `docs/design/exports/stage0-day1-v1/STAGE0_DAY1_STATES_V2.html`
- `docs/design/reviews/STAGE0_DAY1_DEFAULT_AND_STATES_V2_QA_CODEX.md`
- `docs/ux/stage0/STAGE0_LEARNING_EXPERIENCE_CONTRACT.md`
- `docs/ux/stage0/STAGE0_SCREEN_AND_STATE_MAP.md`
- `docs/ux/stage0/STAGE0_COPY_INVENTORY.md`
- `docs/methodology/stage0_work_conversation_v1/`
- existing accepted S5/S14 implementation and shared Living Content primitives.

If two sources conflict, stop and report the exact conflict. Do not invent a resolution.

## Implementation scope

Implement a runnable mobile-first Stage 0 Day 1 slice for **«Разговор о работе · 7 дней»**:

- pre-start day overview;
- full path;
- short path;
- the accepted Day 1 blocks and their order;
- outer day progress distinct from nested S5 phase progress;
- exact final learner copy;
- safe exit and exact resume point;
- day-not-started, full-completion and short-completion states;
- guided-variation states;
- optional spoken-production and recording lifecycle states;
- honest microphone, interrupted, empty-audio and local-save-failure states;
- continuation without recording wherever the contract allows it;
- locally persisted Day 1 progress bound to the active local path;
- completion facts generated only from activities actually completed on the selected path.

Reuse the accepted S5/S14 implementation and shared components where behavior and
visual output match. Extend them only where the Stage 0 contract requires it.

## Explicit exclusions

- No Days 2–7.
- No runtime composite-day engine beyond what Day 1 needs.
- No visual-design changes.
- No new learner copy.
- No TTS or generated production audio.
- No research forms inside the learner flow.
- No cloud sync, speech scoring, accent judgement, CEFR inference, streaks or gamification.
- No change to frozen Batch A–F behavior outside the bounded Day 1 entry.

## Required automated acceptance

Add tests that prove:

1. Full path follows the accepted block order and closes with exactly the valid full-path facts.
2. Short path follows its accepted order, is at least 15 minutes by contract, and closes only with valid short-path facts.
3. Exit/reload resumes at the exact outer block and inner S5 phase.
4. Day progress and S5 phase progress never share a misleading denominator.
5. Recording permission denial, interruption, empty audio and save failure do not falsely claim success or data recovery.
6. Optional recording can be skipped without blocking completion.
7. Progress is scoped to `ie_active_path`; a stale path cannot resume or complete the current day.
8. Copy firewall passes over every learner-visible Day 1 string.
9. Every interactive target is at least 44×44 px and primary actions remain visible at 390×844.
10. There is no horizontal overflow and no uncaught console error through both full and short paths.

Run the repository unit tests, relevant evaluation suite, mobile TypeScript check,
web production build and browser E2E at 390×844. If a check is unavailable, report
the exact attempted command and environmental blocker; do not claim it passed.

## Deliverables

- application/core code for the bounded Day 1 slice;
- unit and E2E tests;
- a short implementation handoff recording routes, state keys, events and checks;
- screenshots or browser evidence for the owner review, generated from the implementation rather than redesigned mockups.

## Stop condition

Commit the bounded implementation on its branch and stop for independent Codex QA
and product-owner device review. Do not merge, push to a store, implement Day 2 or
ask Fable for visual changes unless a concrete mismatch with the frozen artifacts is found.
