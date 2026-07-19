---
id: D-02
title: Extend the approved Living Content visual system
owner: Claude Design / Fable
status: current
output: one polished canonical screen, then its required states
---

# ROLE

Act as Creative Director and Lead Product Designer for Intensive English.

You have creative authority over the execution of the **existing** visual identity. Do not invent a replacement brand and do not turn the screen specification into an annotated documentation board.

# CANONICAL VISUAL SOURCES — READ FIRST

Read these completely before designing:

1. `docs/design/project/Intensive English - Design System.dc.html`
2. `docs/design/project/Дизайн-система.dc.html`
3. `packages/tokens/index.ts`
4. `docs/design/project/Intensive English - Directions.dc.html`
5. `docs/design/project/Экраны-v2.dc.html`
6. the relevant approved examples in `docs/design/project/slices-v2/`
7. `docs/design/DESIGN_SOURCE_INVENTORY.md`
8. the relevant frozen Screen Specification.

The style is **Living Content / “Paper and Ink”**:

- warm paper and confident ink;
- terracotta as brand and primary action;
- mint for familiarity/success;
- brass/amber for warmth and new material;
- rose for gentle correction, never alarming red;
- Golos Text for the interface;
- Lora for English-language content;
- adult, cultured, warm, intensive and non-childish;
- light reading environment plus the established warm-dark Focus mode.

Reuse the existing tokens, radii, typographic relationship, content materiality and component family. New screens must unmistakably belong to the product already designed.

# CREATIVE AUTHORITY

You may:

- create new compositions and component variants needed by approved screens;
- improve spacing, hierarchy, rhythm, responsiveness and motion;
- evolve weak legacy components while preserving family resemblance;
- choose the strongest visual treatment within Living Content;
- propose a token/component change separately with a clear reason.

You may not:

- replace Living Content with a new visual direction;
- change the brand palette or Golos/Lora relationship silently;
- copy obsolete UX from legacy screens;
- add features, navigation, learning mechanics or evidence claims;
- make documentation annotations the main deliverable.

# CURRENT TASK — VISUAL RESET OF BATCH 1

The previous Batch 1 artifact is retained only as a state-coverage reference. Do not patch its tiny 300 px phones or use its presentation layout as the new starting point.

First design **one canonical Path Hub default state (S4)** as a real product screen:

- mobile viewport: 390 × 844;
- use the existing Living Content style and the closest approved sources: mobile slice 02 “Сегодня”, web slice 04 “Рабочий стол”, and the design system;
- preserve the frozen “one next step” hierarchy;
- remove obsolete streak/CEFR/percentage/dashboard logic;
- make it feel like a finished Intensive English screen, not a wireframe or specification diagram;
- show the screen at useful viewing scale, without a phone bezel and without surrounding annotation cards.

Alongside it provide a compact design rationale with only:

- reused canonical components;
- newly created component variants;
- intentional deviations from the existing sources;
- unresolved visual decisions requiring owner choice.

Stop after this single screen for owner review.

# AFTER OWNER APPROVAL

Proceed in this order:

1. Path Hub alternate states.
2. S7 Pretest framing and default item.
3. S3 Profile Entry.
4. S8 Gate/Wait.
5. Required loading/error/offline states in a separate state sheet.

Do not start the next group until the canonical Path Hub establishes the visual quality bar.

# IMPLEMENTATION-READY BASELINE

- body text normally at least 16 px;
- secondary text normally at least 14 px;
- interactive hit areas at least 44 × 44 px;
- scrolling and fixed regions explicit;
- contrast and text scaling viable;
- mobile design uses real viewport dimensions, not a scaled miniature.

# OUTPUT GATE

Return only the polished S4 Path Hub default state and its compact rationale. No complete state catalogue. No Batch 2. No new brand directions.
