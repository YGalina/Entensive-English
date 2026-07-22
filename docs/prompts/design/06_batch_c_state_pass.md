---
id: D-06
title: Batch C — bounded state pass
owner: Claude Design / Fable
status: ready
input: `docs/design/exports/batch-c-correction-v1/`
output: `docs/design/exports/batch-c-states-v1/`
---

# ROLE

Act as Creative Director and Lead Product Designer for Intensive English. Extend the **frozen** Batch C defaults with their required interaction and failure states. This is state completion, not visual redesign.

# SOURCE PRIORITY

Read, in order:

1. `PRODUCT_CONSTITUTION.md`, `.ai/AI_RULES.md`, `.ai/SESSION.md`.
2. `experience_architecture/06_SCREEN_SPECIFICATIONS.md`: S5, S14, S27.
3. `experience_architecture/05_INTERACTION_ARCHITECTURE.md`: scaffolded retrieval, free production, voice lifecycle, feedback timing and error rules.
4. Frozen visual source: `docs/design/exports/batch-c-correction-v1/`.
5. Acceptance review: `docs/design/reviews/BATCH_C_CORRECTION_V1_QA_CODEX.md`.
6. Approved cross-batch patterns only where Batch C has no pattern: `batch-a-defaults-final/` and `batch-b-correction-v2/`.

If any source conflicts, frozen architecture and screen specifications win. Do not silently resolve an architecture conflict: record it and stop on that state.

# FROZEN BASELINE

Do not change the approved Batch C:

- composition, spacing, typography, palette or materiality;
- learner-facing default copy;
- six-step sequence and phase orientation;
- control hierarchy, target sizes or keyboard-open compositions;
- Focus mechanics;
- S14 source disclosure;
- separation between `saved-local` and accepted/completed work.

Each new state must look like the same screen changing state, not a replacement screen.

# REQUIRED STATE COVERAGE

## 1. Phase 3 · Scaffolded retrieval

Show the ordered state chain:

1. empty input, `Проверить` disabled;
2. typed attempt, `Проверить` enabled;
3. incorrect attempt → first-letter support;
4. next unsuccessful attempt → choice of three;
5. next unsuccessful attempt → reveal and required retype;
6. retry after support;
7. accepted attempt → neutral continuation.

Rules: English answer is absent before its legitimate reveal; do not expose all support levels at once; no red, shame, score or celebratory reward; colour does not encode correctness. Autocorrection and predictive suggestions are off. Preserve the approved keyboard-open ergonomics.

## 2. Phase 4 · Free production and resume

Show:

- active writing with local draft saved;
- post-submit target-form nudge, only after output;
- explicit `Оставить как есть` path;
- safe exit with draft preserved;
- resumed draft after interruption;
- submission in progress with duplicate action blocked;
- submission failure that preserves the text and offers manual retry.

Rules: no hint, correction or AI interruption while writing. Safe exit is not session completion. Do not imply acceptance until it is confirmed.

## 3. Phase 5 · Voice lifecycle

Show:

- permission-undetermined request;
- permission-denied with device-settings route and first-class `Дальше без записи`;
- recording;
- stopped with playback and re-record;
- interrupted/app-backgrounded;
- empty recording;
- voice storage failure;
- playback failure;
- continue without recording.

Rules: voice is optional and private. Never imply human listening, pronunciation scoring or speech analysis. Interrupted or empty audio is not a completed recording. Every failure has a safe route into the already completed written flow.

## 4. S14 · AI Summary delivery

Show:

- non-blocking loading after written production;
- shown (reference the frozen default; do not redraw it);
- unavailable;
- manual retry initiated by the learner;
- stored copy on re-entry.

Rules: written production remains completed even when AI is unavailable. Do not promise background generation or future delivery. Do not analyse or mention voice as analysed. `Вернуться к плану` remains the canonical exit.

## 5. S27 · Save/offline manifestations

Show these in the relevant Batch C surfaces, not as a new destination screen:

- `saved-local`;
- `pending-sync` as a clearly labelled target/future transport state;
- `not-saved` with preserved text where observable;
- `storage-unavailable` with copy/retry action;
- `sync-conflict` as a target/future reference only, without inventing merge rules or backend behaviour.

Rules: never call local save accepted/completed. Retry must not visually suggest creation of a second submission. Do not promise background sync unless the state explicitly says it is a future contract reference.

## 6. Session-level continuity

Provide a compact state map for:

- partial session;
- safe exit;
- resume into the exact phase and preserved draft;
- session completion only after at least one retrieval and one production;
- voice skipped and AI unavailable while the session still completes correctly.

This map documents continuity; it does not redesign Path Hub or create a new screen.

# COPY FIREWALL

Use plain, adult Russian. Never expose implementation or research terms including: pilot, protocol, vertical slice, artifact, evidence, core, SRS, DLE, state name, pending-sync, storage-unavailable, sync-conflict, idempotent, retry queue. Internal state IDs may appear only in annotations outside the phone frame.

No gendered default address, guardian interpretation, streak, CEFR inference, shame, pressure or therapy language.

# ACCESSIBILITY AND ERGONOMICS

- Target viewport: 390×844.
- Learner body text normally ≥16px; secondary text ≥14px.
- Touch targets ≥44×44; primary actions 52–56 high.
- Keyboard-open actions remain reachable above the keyboard.
- Permission, failure and retry states must not rely on colour alone.
- Focus indicators, disabled states and contrast must remain distinguishable.
- No three equal actions in one narrow row.

# REQUIRED DELIVERABLE

Save only under `docs/design/exports/batch-c-states-v1/`:

1. `BATCH_C_STATE_MATRIX.md`: state ID, trigger, visible copy, available action, data consequence, recovery path, specification source.
2. `BATCH_C_STATE_BOARD.dc.html`: grouped state boards at 390×844.
3. `screens/`: individual HTML only for materially different states.
4. `BATCH_C_STATE_COPY_INVENTORY.md`: every new learner-facing string.
5. `BATCH_C_STATE_TRACEABILITY.md`: state → governing rule → frozen default → intentional delta.
6. `BATCH_C_STATE_OPEN_QUESTIONS.md`: unresolved owner/architecture decisions; do not decide them.

Update `.ai/SESSION.md`, `.ai/TASKS.md` and `docs/governance/IMPLEMENTATION_HANDOFF.md` according to the Git Working Protocol.

# ACCEPTANCE GATE

The pass is acceptable only if:

- every required state above is covered exactly once in the matrix;
- all recovery paths preserve truthful data semantics;
- default screens remain pixel-structurally unchanged;
- no new feature, navigation route, AI capability, sync mechanism or learning mechanic is invented;
- all new copy passes the firewall;
- the output is visually reviewable and traceable.

# STOP GATE

Stop after the Batch C state deliverables. Do not modify Batch A, Batch B or `batch-c-correction-v1`. Do not implement application code. Do not proceed to another batch. Wait for product-owner visual review and Codex QA.
