# Intensive English design source of truth

## Approved product screens

- `exports/batch-a-defaults-final/` — approved and frozen Batch A: S1, S2, S3, S4, S7, S8.
- `exports/batch-b-correction-v2/` — current approved Batch B: S9–S13, including corrected copy, states and accessibility contract.

Only these two export packages may govern implementation today.

## Visual-language source

`project/` contains the Living Content design system and earlier visual explorations. It is retained as a component, typography, palette and composition library. Screens inside it are **not automatically approved product screens** and must not override the approved exports or frozen UX specifications.

## Supporting material

- `DESIGN_SOURCE_INVENTORY.md` maps historical sources to approved specifications.
- `audits/` and `reviews/` preserve decision evidence and review history; they are not implementation sources.
- `assets/` holds repository-safe approved assets.

The rejected first Batch 1 and the superseded Batch B defaults package were removed. Their history remains recoverable through Git.
