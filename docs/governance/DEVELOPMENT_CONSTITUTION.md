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

Owns visual direction, art direction, composition, typography, colour, imagery, motion language, component expression and the emotional character of the interface. It may challenge or replace the current visual system when that system does not express the product vision. It must preserve frozen product behaviour, learning methodology, required states and accessibility constraints, but visual decisions do not require approval from ChatGPT or Codex. Final selection belongs to the product owner.

### Codex

Inspects the repository, tests actual behavior, reviews diffs and implements approved tasks. During design QA it checks specification integrity, accessibility, state coverage and implementation risk. It does not direct aesthetics, select a visual style or redesign Claude Design's creative concept.

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

## Change policy

- Frozen architecture changes require an ADR or confirmed critical defect.
- Reviews do not add features or redesign the product.
- Process evidence must never be promoted to proficiency or psychological claims.
- Existing user work is preserved; unrelated dirty-worktree changes are excluded.
- No files are moved or deleted merely to satisfy a preferred folder structure.

## Document statuses

`Draft` · `Review` · `Approved` · `Frozen` · `Deprecated` · `Archived`

Only Approved or Frozen documents govern implementation.

## Obsidian and GitHub

Obsidian opens the repository root directly. GitHub stores the versioned truth. Personal Obsidian UI state and third-party plugins are not required for project operation.
