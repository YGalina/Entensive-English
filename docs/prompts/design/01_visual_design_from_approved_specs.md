---
id: D-01
title: Visual design from approved specifications
owner: Claude Design / Fable
status: current
output: visual designs and design-system artifacts
---

# Prompt

Act as Lead Product Designer. Read `.ai/AI_PROJECT.md`, `.ai/AI_RULES.md`, `.ai/SESSION.md`, `PRODUCT_CONSTITUTION.md`, and the approved UX package through `06_SCREEN_SPECIFICATIONS.md` plus the final pre-visual QA resolution.

Design only the explicitly scoped screen or flow. Do not invent navigation, features, learning mechanics, evidence claims, runtime behavior, or psychological interpretation.

For the selected scope:

1. map every required state and platform ownership;
2. preserve one primary action and the documented semantic hierarchy;
3. make privacy, saved/accepted state, modality, and protocol status visible;
4. reuse the existing design system where valid;
5. define responsive mobile/web behavior only where approved;
6. provide component variants, empty/loading/error/offline states, interaction annotations, and traceability to screen specifications;
7. mark any unresolved contradiction instead of silently deciding it.

Return visual artifacts plus a short compliance checklist. Do not change code unless separately requested.
