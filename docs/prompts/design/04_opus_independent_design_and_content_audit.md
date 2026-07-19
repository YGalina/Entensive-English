---
id: D-04
title: Independent Opus design, UX-copy and learning-system audit
owner: Claude Opus
status: current
output: independent audit only
---

# ROLE

Act as an independent multidisciplinary review board for Intensive English, combining:

- Principal Product Designer;
- Principal UX Architect;
- Learning Experience Designer;
- adult second-language acquisition specialist;
- Design Systems Lead;
- senior UX Writer / Content Designer;
- mobile and web accessibility specialist.

This is an independent audit. Do not defend work produced by Claude, Fable, Codex, ChatGPT or the founder. Do not redesign screens during this task.

# REQUIRED SKILL ROUTING

Before acting, inspect the skills/tools available in the current Claude environment and invoke all relevant skills for this audit, including where available:

- product design / UX review;
- design-system analysis;
- UX writing / content design / copywriting;
- accessibility;
- information architecture and interaction design;
- learning experience / instructional design;
- research and evidence synthesis.

Do not claim a skill was used if it was unavailable. At the beginning of the report, list the skills actually invoked and what each contributed. A generic reasoning pass is not a substitute for an available specialist skill.

# AUTHORITATIVE CURRENT STATUS

1. Product, learning and UX architecture are frozen.
2. Living Content / “Paper and Ink” is the established visual identity and remains canonical.
3. Earlier designed mobile/web/focus screens are valuable visual and copy sources, but some contain obsolete product logic.
4. The first generated Batch 1 for S3/S4/S7/S8 was rejected as final UI. It is only a state-coverage reference.
5. The current task is to audit the entire existing design and user-facing language against the approved system.
6. No visual redesign starts during this audit.

# REQUIRED INPUTS

Read the project entry points and follow their current links:

- `MASTER_INDEX.md`
- `.ai/AI_PROJECT.md`
- `.ai/AI_RULES.md`
- `.ai/SESSION.md`
- `PRODUCT_CONSTITUTION.md`
- `architecture_resolution.md`
- relevant ADRs;
- `integrated_learning_blueprint.md`;
- all current files in `learning_architecture/current/`;
- all current files in `learning_experience/`;
- all current files in `product_system/v2/`;
- Experience, UX, IA, Journeys, Interaction and Screen Specifications in `experience_architecture/`;
- all mobile/web/focus sources in `docs/design/project/slices-v2/`;
- the complete Living Content design-system sources and tokens;
- relevant legacy screen prototypes;
- current design inventories, audits and Codex reviews.

Create an inventory of what you actually read. Do not claim to have read missing or inaccessible files.

# CENTRAL QUESTION

For every existing screen determine:

> Does this screen — including its user-facing language — correctly express the approved Intensive English product, learning programme, UX architecture and Living Content identity?

Evaluate the complete chain:

learning objective → learning mechanic → journey → interaction → screen → user-facing copy → visual hierarchy → emotional experience → honest outcome.

# USER-FACING LANGUAGE FIREWALL

Internal architecture vocabulary must not leak into the learner interface.

Unless a term is explicitly required for informed consent, research administration or an owner-approved learner explanation, treat the following as internal-only language:

- pilot;
- vertical slice;
- S1/S2/S3 or other screen IDs;
- protocol;
- guard / gate;
- trained group / holdout / control group;
- learning object / unit ID;
- artifact / evidence class;
- curriculum effect;
- scheduler / projection / core-accepted;
- support depth / shadow metric;
- implementation status such as `[IMPL]`, `[PLAN]`, `[FUT]`;
- DLE, SRS internals and database terminology.

In particular:

- `PILOT · VERTICAL SLICE` must never appear as a learner-facing badge.
- Internal research status belongs in researcher/admin documentation, consent material or a separate programme-information surface — not in routine learning screens.
- “Assessment Gate”, “protocol unavailable”, “trained items” and similar labels are specifications, not UX copy.
- Do not expose which items are holdouts or promise that every missed pretest item will be trained.

Audit every screen for specification-language leakage.

# COPY SOURCE PRIORITY

The earlier Claude Design screens often contain stronger, warmer and more human user-facing language than the later specification-driven Batch 1.

Therefore:

1. Inspect the copy in all earlier approved visual sources.
2. Identify specific phrases worth preserving.
3. Separate good copy from obsolete product mechanics around it.
4. Do not discard strong language merely because the old screen flow is obsolete.
5. Do not replace clear human language with architecture terminology.

For every reusable phrase state:

- exact source;
- original wording;
- why it works;
- whether it remains truthful under the new methodology;
- where it may be reused;
- any required correction.

# UX-COPY PRINCIPLES

User-facing copy must be:

- written for an adult learner aged approximately 30–55;
- clear on first reading;
- warm without therapy language;
- intelligent without academic jargon;
- confident without unsupported promises;
- concise enough for mobile;
- concrete about the next action;
- non-shaming;
- honest about uncertainty and progress;
- consistent across mobile and web;
- focused on the learner’s action and experience, not the system’s internal state.

Avoid:

- childish encouragement;
- corporate LMS language;
- research-protocol language;
- technical implementation language;
- fake intimacy;
- psychological diagnosis;
- motivational clichés;
- excessive explanation of the method on routine screens;
- repetitive “this is not a test / this is not about you” defensive copy;
- claims that activity equals competence;
- CEFR inferred from app activity;
- streaks and guilt;
- “hours until B2”;
- vague AI-generated praise.

# AUDIT DIMENSIONS

Audit every individual mobile, web, focus and relevant legacy screen for:

1. Product-purpose alignment.
2. B1→B2 curriculum alignment.
3. Exercise and receptive→productive mechanics.
4. Experience Architecture and emotional safety.
5. UX, IA, navigation and one-next-step hierarchy.
6. Interaction, AI, voice, feedback, save/offline and recovery rules.
7. Progress and evidence honesty.
8. Psychological/coaching boundaries.
9. Living Content visual consistency.
10. Accessibility and implementation readiness.
11. Mobile/web allocation and continuity.
12. User-facing copy quality and terminology leakage.

# SCREEN CLASSIFICATION

Give every source screen exactly one status:

- KEEP;
- ADAPT;
- REBUILD IN LIVING CONTENT;
- ARCHIVE;
- FUTURE REFERENCE.

For approved screens with no valid visual design use:

- NEW DESIGN REQUIRED IN LIVING CONTENT.

Do not group screens into broad ranges in the evidence matrix.

# FINDING FORMAT

For every material finding include:

- Severity: Critical / Major / Minor;
- exact screen and source path;
- governing source;
- current visual/interaction/copy;
- problem;
- effect on user experience;
- effect on learning;
- what must be preserved;
- smallest correction;
- classification;
- confidence.

# REQUIRED COPY DELIVERABLES

Include three dedicated sections:

## A. Internal-language leakage register

| Screen | Current internal term | Why inappropriate | Learner-facing meaning that should be communicated |

Do not write final replacement copy yet unless an obvious correction is necessary to explain the finding.

## B. Strong legacy copy library

| Exact source | Existing phrase | Why it works | Keep / adapt / archive | Approved future use |

## C. Copy-system recommendations

Define:

- product voice;
- tone by context;
- terminology rules;
- naming rules for learning actions;
- error and recovery language;
- assessment language;
- progress language;
- AI language;
- community language;
- banned internal terminology.

# REQUIRED FINAL OUTPUT

Create one independent report:

`docs/design/audits/OPUS_INDEPENDENT_DESIGN_AND_COPY_AUDIT_V1.md`

It must contain:

1. Sources and specialist skills actually used.
2. Executive verdict.
3. Critical/Major/Minor findings.
4. One-row-per-screen audit matrix.
5. Approved-screen coverage matrix S1–S27/S15b.
6. Component/design-system audit.
7. Internal-language leakage register.
8. Strong legacy copy library.
9. Copy-system recommendations.
10. Corrected journey-based migration sequence.
11. Genuine founder decisions only.
12. Exact next design assignment for Fable after approval.

# STOP CONDITIONS

- Do not redraw screens.
- Do not create a replacement visual identity.
- Do not modify application code.
- Do not rewrite existing audits.
- Do not begin a visual batch.
- Do not update `.ai/SESSION.md`, `.ai/TASKS.md` or handoff.
- Produce the independent report and stop.
