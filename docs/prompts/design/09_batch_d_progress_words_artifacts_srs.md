---
id: D-09
title: Batch D defaults · Progress, My Words, My Artifacts and SRS
owner: Claude Design / Fable
status: ready
output: `docs/design/exports/batch-d-defaults/`
---

# ROLE

Act as Creative Director and Lead Product Designer for Intensive English.

Design the Batch D default-screen pass by extending the approved Living Content visual language. This is a bounded visual-design task, not a UX redesign, architecture exercise or implementation task.

# SOURCE PRIORITY

Read, in order:

1. `.ai/AI_PROJECT.md`, `.ai/AI_RULES.md`, `.ai/SESSION.md`.
2. `PRODUCT_CONSTITUTION.md`.
3. `experience_architecture/06_SCREEN_SPECIFICATIONS.md`: S16, S17, S18 and any SRS/review references.
4. `experience_architecture/03_INFORMATION_ARCHITECTURE.md`: ownership of My Words, My Artifacts, Progress and review objects.
5. `experience_architecture/04_USER_JOURNEY_ARCHITECTURE.md`: progress, returning learner, review and artifact journeys.
6. `experience_architecture/05_INTERACTION_ARCHITECTURE.md`: progress truthfulness, feedback, lateral repositories and one-next-step constraints.
7. Frozen visual sources:
   - `docs/design/exports/batch-a-defaults-final/`
   - `docs/design/exports/batch-b-correction-v2/`
   - `docs/design/exports/batch-c-correction-v1/`
   - `docs/design/exports/batch-c-states-correction-v1/`
   - `docs/design/exports/recovery-integrity-v1/`
8. Living Content source materials:
   - `docs/design/project/Intensive English - Design System.dc.html`
   - `packages/tokens/index.ts`
   - `docs/design/project/slices-v2/`
9. Corrected migration and reuse sources:
   - `docs/design/audits/VISUAL_MIGRATION_SEQUENCE_V1.md`
   - `docs/design/DESIGN_SOURCE_INVENTORY.md`

Frozen architecture and screen specifications win over historical screens.

# SCOPE

Create only the Batch D default-screen pass for:

1. **S18 Progress**
   - progress as honest capability/process evidence, not a grade;
   - no inferred CEFR level from activity;
   - no percent-of-course completion;
   - no streaks;
   - no guardian/psychological interpretation;
   - show what has been practised, what has evidence, and what is still unknown.

2. **S16 My Words**
   - learner-owned language repository;
   - words, phrases, collocations and familiar items as accumulated experience;
   - new/familiar/review-needed states;
   - route into review without competing with the primary Path.

3. **S17 My Artifacts**
   - learner-owned spoken/written outputs;
   - artifacts as private evidence of work, not proof of level;
   - drafts/submitted/saved/local-only states if required by specs;
   - no human review or AI analysis claims unless explicitly supported.

4. **SRS / review entry**
   - review as "return useful language", not streak pressure;
   - clear due items and estimated time;
   - no hidden scoring or competence claim;
   - may reuse Batch C retrieval patterns without redrawing every state.

# FORBIDDEN

Do not:

- redesign navigation;
- redesign Batch A, Batch B, Batch C or Recovery/Integrity;
- introduce CEFR inference from app activity;
- show B2 progress bars unless explicitly defined as owner-approved non-claim framing;
- show percent of course complete;
- restore streaks;
- restore guardian mechanics or psychological interpretation;
- imply diagnosis, therapy, anxiety treatment or clinical progress;
- imply speech analysis, pronunciation scoring, human listening or automatic AI evaluation unless frozen specs support it;
- invent sync, backup, cloud merge, account recovery or background processing;
- use internal terms in learner-facing copy: pilot, protocol, vertical slice, artifact, evidence, SRS, DLE, state ID, implementation, core, holdout, baseline;
- use research terminology in the app UI.

# COPY FIREWALL

Use plain adult Russian.

The language should feel:

- honest;
- calm;
- specific;
- non-schoolish;
- non-therapeutic;
- non-gamified;
- respectful of adult learners.

Prefer phrases like:

- "Что уже было в практике"
- "Что ждёт повторения"
- "Твои фразы"
- "Твои записи"
- "Пока данных мало"
- "Это ориентир, не оценка"

Avoid:

- "уровень доказан";
- "ты B2";
- "мастерство";
- "психологический барьер преодолён";
- "серия";
- "стрик";
- "страж";
- "артефакт";
- "доказательство".

# VISUAL CONSTRAINTS

- Preserve Living Content.
- 390x844 canonical mobile viewport.
- Body text normally >=16px; secondary text >=14px.
- Touch targets >=44x44.
- Primary actions normally 52-56px.
- Do not make text-heavy dashboards.
- S18 must be readable as orientation, not analytics overload.
- Repositories should feel calm and useful, not like a school gradebook.
- Use colour for orientation only; never make colour the only meaning.
- Keep approved bottom navigation treatment from Batch B where needed.

# REQUIRED OUTPUT

Save only under `docs/design/exports/batch-d-defaults/`:

1. `BATCH_D_DEFAULT_BOARD.dc.html`
2. `BATCH_D_COPY_INVENTORY.md`
3. `BATCH_D_TRACEABILITY.md`
4. `BATCH_D_ASSUMPTIONS.md`
5. `BATCH_D_OPEN_QUESTIONS.md`
6. `screens/` with individual HTML for every materially different default screen.

Update `.ai/SESSION.md`, `.ai/TASKS.md` and `docs/governance/IMPLEMENTATION_HANDOFF.md` only if the environment has real repository write access.

# ACCEPTANCE GATE

Batch D passes only if:

- every required default screen exists;
- S18 does not claim CEFR/proficiency/course percentage from activity;
- S16 and S17 are clearly repositories, not competing primary tasks;
- SRS/review is framed as useful return, not pressure;
- no forbidden internal terminology appears in learner-facing UI;
- touch targets and body text sizes meet the constraints;
- all critical actions are fully visible within 390x844;
- historical screens are reused/adapted only where they match frozen architecture.

# STOP GATE

Stop after producing Batch D defaults. Do not generate state sheets yet. Do not start implementation. Do not redesign previous approved batches. Wait for product-owner visual review and Codex QA.
