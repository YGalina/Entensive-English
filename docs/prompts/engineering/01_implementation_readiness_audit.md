# Engineering Prompt 01
# Implementation Readiness Audit from Frozen Design Packages

## Role

Act as Principal Engineering Architect and QA lead for Intensive English.

This is not an implementation task.
Do not write application code.
Do not redesign UX.
Do not change product methodology.
Do not reopen frozen visual design.

Your task is to inspect the current codebase and frozen design packages, then produce an implementation-readiness audit and slice-by-slice technical plan.

## Required inputs

Read first:

- `.ai/AI_PROJECT.md`
- `.ai/AI_RULES.md`
- `.ai/SESSION.md`
- `.ai/TASKS.md`
- `docs/governance/DEVELOPMENT_CONSTITUTION.md`
- `docs/governance/IMPLEMENTATION_HANDOFF.md`
- `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`
- all frozen design packages referenced by that index
- current app code structure under `apps/`, `packages/`, `prototype/` or equivalent directories
- existing route/component/state/data architecture

Do not claim to have read a missing file.

## Scope

Map the frozen design system to the existing codebase.

Identify:

1. Existing routes/components that can be reused.
2. Components that must be created.
3. Shared design tokens/components needed.
4. State machines required per slice.
5. Data models required per slice.
6. Events that write learning progress.
7. Events that are process-only and must not move Path.
8. Local persistence requirements.
9. Accessibility requirements.
10. Missing states that block implementation.
11. Owner decisions that block implementation.
12. Risks from legacy code that contradict frozen design.

## Frozen implementation order to evaluate

Evaluate and, if needed, adjust only with evidence:

1. Safe entry and first path
2. Daily cycle core
3. Recovery and data integrity
4. Progress, words and artifacts
5. Library and content wing
6. Assessment/results

Do not start with a different order unless you clearly justify why.

## Required output

Create:

`docs/engineering/IMPLEMENTATION_READINESS_AUDIT_V1.md`

The document must include:

- Executive verdict: ready / partially ready / blocked
- Codebase inventory
- Frozen design inventory
- Slice-by-slice implementation plan
- Route map
- Component map
- State/data map
- Event semantics map
- Accessibility checklist
- Legacy conflict list
- Open decisions list
- P0/P1/P2 engineering tasks
- Recommended first implementation PR

## Stop condition

Stop after producing the audit document.
Do not implement code.
Do not create PRs unless explicitly requested by the product owner.
