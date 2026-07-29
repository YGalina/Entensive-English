# ADR-001 · Composite learning day

Status: **Draft — candidate direction, not approved for implementation**

Date: 2026-07-29

Owner gate: Stage 0 individual learning pilot

## Context/problem

The frozen S5 Daily Cycle is a valid lexical-retrieval and short-production block, but it does not cover the complete daily learning architecture already defined by the project. As a whole intensive day it is too thin: listening decoding, pronunciation, guided variation, fluency work, sufficient retrieval volume, weekly recycling and transfer are not consistently composed into the learner's next step.

Accepted methodology package:

- `docs/methodology/training_revision_v1/DAILY_TRAINING_DOSE_AUDIT.md`
- `docs/methodology/training_revision_v1/THREE_LOAD_MODES.md`
- `docs/methodology/training_revision_v1/SEVEN_DAY_INTENSIVE_MODULE_V1.md`
- `docs/methodology/training_revision_v1/TRAINING_SUFFICIENCY_EXPERIMENT_V1.md`

## Considered options

1. Keep S5 as the complete day.
2. Expand S5 into one increasingly large flow.
3. Treat the day as a composition of learning blocks, with S5 retained as one reusable block.

## Candidate decision

Adopt option 3 **only if Stage 0 produces a credible convergent signal**.

Candidate model:

`day = learner load mode × scheduled learning blocks`

S5 remains unchanged as the context → retrieval → short-production block. A future Daily Engine composer would select and order additional blocks according to the chosen load mode, weekly balance, prerequisites and unfinished work.

This draft does not approve:

- implementation of the composer;
- changes to frozen S5 screens;
- new visual-design batches;
- a multi-module content pipeline;
- Stage 1 comparative research.

## Rationale

The candidate preserves the strongest existing S5 mechanics while restoring the breadth already required by the learning architecture. It also avoids one oversized, repetitive lesson flow and permits lighter and deeper days without changing learning ethics.

## Consequences if approved later

- S5 changes ownership from “complete day” to “learning block”.
- Path Hub represents one composed day as the single next step.
- Resume semantics operate at block level.
- The Daily Engine gains a block plan and weekly-balancing responsibility.
- New learning blocks require methodology, content, design and engineering contracts.
- Recovery remains separate from planned load modes.
- Assessment S7–S13 remains separate from learning.

## Validation/follow-up

Before this ADR may become Accepted:

1. Produce one complete seven-day “Work Conversation” module manually.
2. Run Stage 0 with 5–8 target learners, individually and independently.
3. Review learning, delayed retention, transfer, workload, completion and willingness to continue.
4. Record the owner decision: accept, revise or reject the composite-day direction.

Until then, this ADR is documentation of a candidate only.
