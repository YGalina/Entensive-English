# Development Constitution v1.0

## Purpose

This document governs how Intensive English is designed, implemented, reviewed and evolved. Product behavior remains governed by `PRODUCT_CONSTITUTION.md`.

## Source of truth

The Git repository is authoritative. ChatGPT, Claude, Codex, Obsidian and design tools are working environments. A decision becomes authoritative only when recorded in the repository.

## Roles

### Product owner

Approves product scope, priorities, methodology changes, UX direction, release decisions and new capabilities.

### Claude Opus

Owns UX logic, flows, interaction copy and specification maintenance within approved product architecture. It does not choose the final visual language.

### Claude Design / Fable — Creative Director

Owns all visual design and all visual corrections: art direction, composition, typography application, imagery, motion language, component expression and the emotional character of the interface **within the existing Living Content design language**. Work continues as pages inside the existing `Intensive English дизайн-система` Claude Design project. The canonical visual sources are `docs/design/project/Intensive English - Design System.dc.html`, `packages/tokens/index.ts`, and approved examples in `docs/design/project/slices-v2/`. Claude Design may extend the system for new screens and propose controlled improvements, but it may not replace the established visual identity, palette or type system without an explicit owner-approved visual decision. It must preserve frozen product behaviour, learning methodology, required states and accessibility constraints. Final visual approval belongs to the product owner.

### Codex

Inspects the repository, tests actual behavior, reviews diffs and implements approved tasks. During design QA it performs read-only checks of specification integrity, learning logic, accessibility, state coverage and implementation risk, then reports findings. It never applies visual corrections and never edits or prescribes layout, composition, typography, colour, spacing, visual hierarchy or component expression. Every visual finding returns to Claude Design / Fable; engineering proceeds only after product-owner approval of the corrected visual.

### ChatGPT product task

Helps the owner evaluate product, learning, UX and prioritization decisions using repository evidence. It does not act as art director and cannot overrule Claude Design on visual taste. Decisions still require owner approval and repository capture.

## Required workflow

1. Read `AGENTS.md`, `MASTER_INDEX.md` and `PROJECT_STATE.md`.
2. Identify the exact source document, implementation scope and current branch.
3. Make the smallest approved change; do not reopen frozen architecture.
4. Run proportionate checks.
5. Update `IMPLEMENTATION_HANDOFF.md`.
6. Review the actual diff/commit independently.
7. Record verdict and follow-up in `REVIEW_LOG.md`.
8. For visual work: Codex reports findings → Claude Design / Fable corrects in the existing design project → product owner approves → engineering implements exactly the approved visual.

## Change policy

- Frozen architecture changes require an ADR or confirmed critical defect.
- Reviews do not add features or redesign the product.
- Design QA is read-only; no visual correction may be applied outside Claude Design / Fable.
- Process evidence must never be promoted to proficiency or psychological claims.
- Existing user work is preserved; unrelated dirty-worktree changes are excluded.
- No files are moved or deleted merely to satisfy a preferred folder structure.

## Document statuses

`Draft` · `Review` · `Approved` · `Frozen` · `Deprecated` · `Archived`

Only Approved or Frozen documents govern implementation.

## Obsidian and GitHub

Obsidian opens the repository root directly. GitHub stores the versioned truth. Personal Obsidian UI state and third-party plugins are not required for project operation.
