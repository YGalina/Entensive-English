# Stage 0 · Work Conversation module content production

## Role

Act as the Chief Learning Content Architect and senior adult-L2 curriculum writer for Intensive English.

This is a **content-production task**, not another strategy document.

The product is an individual self-study application. Do not introduce classes, cohorts, required clubs, peer work or group instruction.

## Repository and authority

Open `YGalina/Entensive-English`.

Base your work on branch `codex/training-sufficiency-accepted`, commit `2449f1f`.

Read first:

1. `.ai/AI_PROJECT.md`
2. `.ai/AI_RULES.md`
3. `.ai/SESSION.md`
4. `.ai/TASKS.md`
5. `docs/governance/DEVELOPMENT_CONSTITUTION.md`
6. `docs/adr/ADR-001-composite-learning-day.md`
7. every file in `docs/methodology/training_revision_v1/`
8. `product_system/v2/curriculum_blueprint_b1_b2_v2.md`
9. `product_system/v2/learning_object_taxonomy_v2.md`
10. `product_system/v2/exercise_architecture_v2.md`
11. `product_system/v2/validation_experiments_v2.md`
12. `learning_experience/daily_learning_engine.md`
13. `learning_experience/training_block_architecture.md`
14. `learning_experience/weekly_learning_rhythms.md`
15. the current vertical-slice language bank and Batch C S5 content.

Current repository sources override summaries and chat history.

## Frozen boundaries

Do not:

- redesign screens or produce visual layouts;
- modify application code;
- approve or implement Draft ADR-001;
- create a runtime Daily Engine composer;
- create Stage 1;
- alter frozen S5 mechanics or assessment S7–S13;
- use protocol holdout items as learning content;
- copy wording or exercises from “English with Daniel”;
- introduce learner-facing pilot, research, experiment, evidence or protocol terminology;
- claim CEFR progress, mastery or psychological interpretation;
- analyze private voice recordings inside the product.

Fable owns final learner-facing copy and visual execution after methodology QA. Write precise content drafts and interaction scripts, not visual design.

## Objective

Produce one complete, manually deliverable, seven-day individual self-study module:

**Work Conversation — explain what I am working on, what I completed and what happens next.**

The module must be sufficient to run Stage 0 with 5–8 learners without inventing missing content during the pilot.

Target experience:

- adult learner with uneven A2–B1/B1 competence;
- 35–50 minutes per day;
- individual and asynchronous;
- one coherent domain across seven days;
- approximately 12 new productive lexical/formulaic targets plus explicitly identified reactivated items;
- one weekly grammar contrast, proceduralised rather than taught as a long rule;
- daily retrieval and meaningful production;
- listening decoding and pronunciation;
- guided variation before freer output;
- fluency only after the frame has been formed;
- delayed retrieval and novel-context transfer on Day 7.

## Required production work

### 1. Ratify the language inventory

For every proposed word, collocation, phrasal verb, chunk, discourse marker and construction:

- source or corpus/programme rationale;
- new or reactivated status;
- meaning and register;
- natural example;
- Russian explanation draft;
- pronunciation/stress information;
- day first encountered;
- later retrieval days;
- production and transfer uses.

Remove targets that are unnatural, redundant, too difficult, weakly useful or not supported by the seven-day narrative.

### 2. Write all source texts

Write final English drafts for:

- all dialogues and monologues used on Days 1–7;
- the two missing core texts;
- scenario-partner turns;
- the writing model;
- the novel transfer situation;
- normal-speed and fluent-speed audio scripts.

Language must be natural contemporary English suitable for the target level. Do not produce textbook dialogue merely to contain every target.

For every text provide:

- communicative purpose;
- word count;
- target and reactivated items;
- estimated lexical coverage;
- likely comprehension difficulty;
- normal-speed script;
- fluent delivery notes;
- Russian meaning support draft;
- rights/source status.

All newly written material must be original project content.

### 3. Produce every exercise

Write the exact prompts, target answers or acceptable-answer criteria, support ladder, feedback logic and retry logic for:

- priming;
- comprehension and noticing;
- meaning→form retrieval;
- SRS recognition and production;
- guided substitution/transformation;
- listen-then-build;
- decoding;
- pronunciation and rhythm;
- scenario turns and repair;
- writing;
- task repetition/fluency;
- freer speaking or writing;
- Day 7 transfer.

For open production, define evaluation boundaries without scripting one “correct” personal answer.

### 4. Build the seven daily sessions

For every day specify:

- learner goal in plain language;
- prerequisite;
- ordered blocks;
- exact content objects;
- estimated minutes per block;
- new versus returned material;
- required and optional production;
- completion contract;
- safe shorter path if the learner runs out of time;
- what is scheduled for tomorrow;
- observable learning events;
- required manual-delivery assets.

The 35–50 minute duration is a product hypothesis. If a day cannot honestly fit, correct the composition and record the reason.

### 5. Build the retrieval schedule

Create an item-level schedule for:

- first encounter;
- supported retrieval;
- unsupported retrieval;
- Day +1 return;
- later weekly returns;
- Day 7 delayed retrieval;
- post-module +7 test.

Protect all assessment holdout items. Learning transfer content and assessment evidence must remain distinct.

### 6. Build the Stage 0 measurement pack

Produce complete drafts for:

- screening checklist;
- pre-test;
- immediate post-test;
- delayed +7 test;
- Day 7 novel-context transfer task;
- daily sufficiency/workload questions;
- completion/stop-reason capture;
- final individual interview guide;
- willingness-to-continue question;
- human scoring guide;
- optional speech-sample consent text for an external research process.

Do not use statistical significance language. Do not let an LLM decide whether learning occurred.

### 7. Production and QA manifest

List every required:

- text;
- audio recording;
- decoding clip;
- pronunciation asset;
- card;
- prompt;
- feedback rule;
- research instrument;
- human review;
- unresolved owner decision.

Clearly distinguish:

- ready;
- draft needing Fable copy;
- requires human recording;
- requires methodology review;
- blocked.

## Required output

Create:

`docs/methodology/stage0_work_conversation_v1/`

with:

1. `README.md`
2. `MODULE_MANIFEST.md`
3. `LANGUAGE_INVENTORY.md`
4. `CONTENT_AND_RIGHTS_REGISTER.md`
5. `DAY_01.md`
6. `DAY_02.md`
7. `DAY_03.md`
8. `DAY_04.md`
9. `DAY_05.md`
10. `DAY_06.md`
11. `DAY_07.md`
12. `AUDIO_AND_PRONUNCIATION_SCRIPTS.md`
13. `EXERCISE_AND_FEEDBACK_SCRIPTS.md`
14. `SRS_AND_RETRIEVAL_SCHEDULE.md`
15. `STAGE0_MEASUREMENT_PACK.md`
16. `HUMAN_SCORING_GUIDE.md`
17. `PRODUCTION_QA_CHECKLIST.md`
18. `OPEN_CONTENT_DECISIONS.md`

Use cross-links rather than duplicating content.

## Quality gates

Before completion, verify:

- every target item appears naturally in context;
- every new target is retrieved and produced later;
- grammar is proceduralised through use;
- listening is not transcript reading with audio attached;
- pronunciation work has a perceptual step before production;
- freer output follows sufficient scaffolding;
- Day 7 transfer is genuinely novel and was not rehearsed;
- no holdout contamination;
- no unsupported learning claims;
- no group-learning dependency;
- no Daniel text copied;
- workload totals are arithmetically plausible;
- all seven days are fully executable from the written package.

## Git and stop condition

Create a new branch from commit `2449f1f`.

Commit only the Stage 0 content package and necessary governance updates. Do not modify frozen design, code or Draft ADR-001.

At completion report:

- branch and commit;
- exact files created;
- final target inventory;
- per-day estimated duration;
- missing human recordings;
- unresolved content decisions;
- QA checks performed.

Stop for independent methodology and Codex review. Do not send work to Fable yet.
