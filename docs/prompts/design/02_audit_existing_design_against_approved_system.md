---
id: D-02
title: Audit existing design against the approved product and learning system
owner: Claude Design / Fable
status: current
output: design migration audit, screen matrix, component reuse map, redesign sequence
---

# ROLE

Act as Creative Director, Principal Product Designer and Learning Experience Designer for Intensive English.

This is an **audit and migration-planning task**, not a request to invent a new style and not yet a request to redraw screens.

The product already has an established visual language: **Living Content / “Paper and Ink.”** Preserve it. Your job is to determine how the existing designed product must evolve to express the newly approved learning programme, product architecture, UX logic and screen system.

# WHY THIS AUDIT EXISTS

Most existing screens were designed before the methodology, curriculum, Product Constitution, Experience Architecture, UX Architecture, IA, journeys, interaction rules and screen specifications were finalised.

Therefore the existing design contains four kinds of material:

1. visually and logically reusable screens;
2. visually reusable screens whose content/UX must change;
3. obsolete screens that conflict with the approved system;
4. approved new screens that do not yet have visual designs.

Do not confuse visual quality with product correctness. A beautiful legacy screen may still implement obsolete learning logic. A missing screen must be designed later in the existing style.

# REQUIRED SOURCES — READ BEFORE CONCLUSIONS

## Governance and current state

- `MASTER_INDEX.md`
- `.ai/AI_PROJECT.md`
- `.ai/AI_RULES.md`
- `.ai/SESSION.md`
- `PRODUCT_CONSTITUTION.md`
- `architecture_resolution.md`
- relevant ADRs in `adr/`

## Approved learning system

- `integrated_learning_blueprint.md`
- all current files in `learning_architecture/current/`
- `learning_experience/learning_experience_architecture_v1.md`
- `learning_experience/daily_learning_engine.md`
- `learning_experience/training_block_architecture.md`
- `learning_experience/weekly_learning_rhythms.md`
- `learning_experience/progress_experience.md`
- `learning_experience/films_books_and_life_integration.md`
- `learning_experience/human_and_community_journey.md`
- all current files in `product_system/v2/`

## Approved experience and UX system

- `experience_architecture/01_experience_architecture.md`
- `experience_architecture/UX_ARCHITECTURE.md`
- `experience_architecture/03_INFORMATION_ARCHITECTURE.md`
- `experience_architecture/04_USER_JOURNEY_ARCHITECTURE.md`
- `experience_architecture/05_INTERACTION_ARCHITECTURE.md`
- `experience_architecture/06_SCREEN_SPECIFICATIONS.md`
- `experience_architecture/07_UX_REVIEW_PRE_VISUAL.md`

Use the associated Codex audits only to understand already resolved risks; do not reopen resolved architecture.

## Existing visual system and screens

- `docs/design/project/Intensive English - Design System.dc.html`
- `docs/design/project/Дизайн-система.dc.html`
- `docs/design/project/Intensive English - Directions.dc.html`
- `docs/design/project/Экраны-v2.dc.html`
- `packages/tokens/index.ts`
- every screen in `docs/design/project/slices-v2/mobile/`
- every screen in `docs/design/project/slices-v2/web/`
- every screen in `docs/design/project/slices-v2/focus/`
- relevant prototypes in `docs/design/project/screens/`
- `docs/design/DESIGN_SOURCE_INVENTORY.md`

The existing `DESIGN_SOURCE_INVENTORY.md` is a preliminary source map, not the completed audit. Build on it; do not merely restate it.

# AUDIT EVERY EXISTING DESIGNED SCREEN

For every mobile, web and focus screen determine:

1. What current user need and approved screen/journey it maps to.
2. Whether its learning purpose still exists in the approved programme.
3. Whether its content reflects the approved B1→B2 curriculum and learning loop.
4. Whether its exercise mechanics comply with the new exercise architecture.
5. Whether it supports the receptive→productive transition correctly.
6. Whether progress, competence and psychological claims are honest.
7. Whether its place in IA and navigation remains valid.
8. Whether its entry, exit, continuation and recovery logic remain valid.
9. Whether interaction, AI, voice, feedback, save/offline and error behaviour match the approved rules.
10. Whether mobile/web ownership remains correct.
11. Whether the visual hierarchy supports one next step and acceptable cognitive load.
12. Whether the screen still fits the Living Content system consistently.
13. Whether accessibility, type scale, touch targets and responsive behaviour are implementation-ready.
14. Which components, tokens and visual patterns can be reused.
15. What exactly must change and why.

# CLASSIFICATION

Assign every existing screen exactly one status:

- **KEEP** — visually and logically valid with only production clean-up;
- **ADAPT** — visual foundation remains, but content, hierarchy, states or flow must change;
- **REBUILD IN LIVING CONTENT** — approved function remains, but the current screen embodies obsolete logic;
- **ARCHIVE** — conflicts with the approved product and has no current function;
- **FUTURE REFERENCE** — useful visual source for a planned feature, not current scope.

For every approved S1–S27/S15b screen that has no valid design, mark:

- **NEW DESIGN REQUIRED IN LIVING CONTENT**.

# REQUIRED OUTPUTS

Create:

## 1. `docs/design/audits/EXISTING_SCREEN_AUDIT_V1.md`

Detailed evidence-backed audit grouped by:

- mobile;
- web;
- focus;
- cross-platform systems.

## 2. `docs/design/audits/SCREEN_MIGRATION_MATRIX_V1.md`

Use this table:

| Existing source | Current screen | Approved destination | Learning verdict | UX verdict | Visual verdict | Status | Exact changes | Dependencies | Priority |

## 3. `docs/design/audits/COMPONENT_REUSE_MAP_V1.md`

Identify:

- canonical components to keep;
- components to adapt;
- obsolete components;
- missing component families;
- tokens that remain canonical;
- accessibility corrections needed across the system.

## 4. `docs/design/audits/SCREEN_COVERAGE_GAPS_V1.md`

Map every approved S1–S27/S15b screen to:

- valid existing design;
- design requiring adaptation;
- missing design;
- platform;
- prerequisite decision.

## 5. `docs/design/audits/VISUAL_MIGRATION_SEQUENCE_V1.md`

Recommend the order in which the existing product should be redesigned. Order by dependencies and complete user journeys, not by whichever screen is easiest.

Include:

- Pilot/Vertical Slice sequence;
- core daily-learning sequence;
- repositories and cultural immersion;
- progress and assessment;
- AI, human and community layers;
- web sequence;
- future scope.

# RULES

- Do not redraw screens during this task.
- Do not create a new brand or replace Living Content.
- Do not preserve obsolete UX because the screen looks good.
- Do not archive a screen merely because its current UX is obsolete; first determine whether its visual/components can be reused.
- Do not reduce the audit to Screen Specifications alone: learning architecture and curriculum are equally important.
- Distinguish implementation scope, approved plan and future ideas.
- Cite exact source files and exact governing documents for every material finding.
- Do not modify application code.
- Do not begin Batch 2.

# FINAL SYNTHESIS

Conclude with:

1. What percentage of the existing visual system is genuinely reusable.
2. Which existing screens are strongest and should set the quality bar.
3. Which screens are visually good but methodologically obsolete.
4. Which screens must be created from scratch in Living Content.
5. The first coherent design batch and why.
6. Decisions requiring the product owner.
7. Exact next action after audit approval.

Stop after the audit package. Do not start visual redesign until the product owner approves the migration sequence.
