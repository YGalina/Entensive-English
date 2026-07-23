# Batch E · Library, Reading/Listening and Shadowing

## Role

Act as Claude Design / Fable5.

You are the visual executor, not the product architect.

The product architecture is frozen. Do not reopen it.

## Objective

Create the Batch E default-screen pass for the content wing:

- S19 Library;
- S21 Reading / Listening;
- S22 Shadowing.

This batch turns films, books, podcasts, texts and shadowing into a coherent visual system that supports the approved learning architecture:

context → comprehension → noticing → practice/output.

The Library is a repository of living language, not a passive content feed.

## Required inputs

Before designing, read:

1. `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`
2. `.ai/SESSION.md`
3. `.ai/TASKS.md`
4. `docs/governance/IMPLEMENTATION_HANDOFF.md`
5. `PRODUCT_CONSTITUTION.md`
6. `experience_architecture/UX_ARCHITECTURE.md`
7. `experience_architecture/05_INTERACTION_ARCHITECTURE.md`
8. `experience_architecture/06_SCREEN_SPECIFICATIONS.md`
9. `docs/design/DESIGN_SOURCE_INVENTORY.md`
10. Frozen visual packages:
    - `docs/design/exports/batch-a-defaults-final/`
    - `docs/design/exports/batch-b-correction-v2/`
    - `docs/design/exports/batch-c-correction-v1/`
    - `docs/design/exports/batch-c-states-correction-v1/`
    - `docs/design/exports/recovery-integrity-v1/`
    - `docs/design/exports/batch-d-final/`

Also use the existing Living Content design language as visual reference where it does not contradict the frozen architecture.

## Scope

Create only Batch E defaults.

Include:

### S19 Library

Design the default Library surface:

- repository of living language;
- material cards;
- search for material;
- quiet lateral navigation;
- visible distinction between repository browsing and learning launch;
- “bring your own material” / “переведи свою жизнь” as future/import affordance only if already supported by S19 and marked appropriately.

Library must not look like:

- a course catalog;
- a streaming feed;
- passive entertainment;
- a second Path;
- a progress driver.

### S21 Reading / Listening

Design the default material consumption surface:

- readable/listenable material;
- transcript or text;
- tap-to-listen / translation support where appropriate;
- target language cues;
- clear handoff into practice/output;
- return to Library when launched laterally;
- return to Path only when launched as the current Path step.

The screen must make clear:

- reading/listening is not the endpoint;
- material should lead to output;
- lateral launch does not move curriculum progress.

### S22 Shadowing

Design the default shadowing surface:

- material with transcript;
- comprehension gate represented carefully;
- shadowing player;
- private voice recording;
- no pronunciation score;
- no red error;
- no accent judgement;
- no claim that the voice is analysed.

The comprehension gate is planned/underdefined. Do not invent a fake implemented rule.

Represent it as:

- an approved/available state only when linguistic evidence exists;
- an insufficient-evidence state as a planned state;
- never as self-esteem, mood, confidence or psycho readiness.

## State scope

This is a default-screen pass only.

Do not generate full state sheets yet.

You may include small default-adjacent examples when necessary to show the default screen, but do not produce exhaustive states.

Stop after Batch E defaults for owner visual approval and Codex QA.

## Visual constraints

Use the approved Living Content visual direction:

- warm paper base;
- ink black for repository / secondary actions where already established;
- terracotta only for primary Path or learning-launch actions where justified;
- blue only for listening/voice modality where already established;
- mint only for quiet factual positive status, not rewards;
- no loud dashboards;
- no gamified streaks;
- no confetti;
- no “content app” entertainment aesthetic.

Keep screens mobile-first at 390×844.

Every primary touch target should be finger-safe.

Avoid large dead zones unless intentionally used for calm focus.

## Copy firewall

No learner-facing use of:

- pilot;
- vertical slice;
- protocol;
- SRS;
- artifact;
- evidence;
- holdout;
- CEFR/B2 as inferred from activity;
- percent-of-course;
- streak;
- guardian / страж;
- AI/ИИ as magical evaluator;
- speech analysis;
- pronunciation score;
- accent score;
- “native-like” promise;
- “you are ready” psychological interpretation;
- cloud/sync claims unless already approved.

Use adult, calm, warm copy.

The product should sound like:

- “this material can become yours”;
- “listen/read with support”;
- “then use something from it”;
- “shadow only what you understand”;
- “your voice is private”.

It should not sound like:

- school homework;
- Netflix;
- Duolingo;
- therapy;
- exam prep;
- productivity dashboard.

## Methodological rules

Do not design passive consumption as success.

Do not imply that watching, reading or listening alone creates productive competence.

Do not claim that shadowing improves grammar, vocabulary or spontaneous speaking by itself.

Do not allow shadowing without a comprehension condition.

Do not evaluate voice quality.

Do not create a second learning route outside the approved Daily Cycle / Path logic.

## Required outputs

Save all deliverables under:

`docs/design/exports/batch-e-defaults/`

Include:

- `BATCH_E_DEFAULT_BOARD.dc.html`
- `BATCH_E_COPY_INVENTORY.md`
- `BATCH_E_TRACEABILITY.md`
- `BATCH_E_ASSUMPTIONS.md`
- `BATCH_E_OPEN_QUESTIONS.md`
- `screens/S19_library.html`
- `screens/S21_reading_listening.html`
- `screens/S22_shadowing.html`
- `support.js`

## Required report

At completion report:

- exact files created;
- screens included;
- what existing visual sources were reused;
- assumptions;
- unresolved owner decisions;
- confirmation that no frozen batch was modified;
- confirmation that no application code was modified.

Stop for owner visual approval and Codex QA.

