# D-02 Existing-Design Audit · Codex QA

Verdict: **CHANGES REQUIRED**.  
Scope reviewed: five audit documents from `repo_audit_d02` archive.  
Do not begin visual redesign or Batch 2.

## What passed

- All five required deliverables exist.
- The audit covers the 39 mobile, 14 web and 2 focus slice sets at least at grouped-source level.
- Living Content is correctly preserved as the canonical visual identity.
- The five systemic conflicts are materially correct: CEFR inferred from activity, streak language, in-product guardians, in-product Galina, and word-flood/self-report mechanics.
- The strongest reusable visual sources are identified credibly.
- The KEEP / ADAPT / REBUILD / ARCHIVE / FUTURE REFERENCE framework is applied consistently in most rows.
- The approved S1–S27/S15b coverage table is present.

## Critical

### C1. The audit treats rejected Batch 1 visuals as delivered design

The current repository state says the first Batch 1 artifact was rejected as final product UI and retained only as a historical state-coverage exploration. The audit instead calls S3/S4/S7/S8 “BATCH1 (designed/on review),” says Batch 1 is delivered, and uses it as the visual basis for later screens.

This would propagate an explicitly rejected visual artifact into the migration plan.

Required correction:

- Treat the Batch 1 HTML only as a **STATE-COVERAGE REFERENCE — NOT APPROVED VISUAL DESIGN**.
- Reclassify S3, S4, S7 and S8 as requiring visual redesign/adaptation in Living Content.
- Do not count Batch 1 components as canonical unless they already exist in approved Living Content sources independently.
- Preserve its useful state inventory and discard its tiny-screen presentation and unapproved copy decisions.

### C2. The proposed migration sequence starts with the wrong next batch

`VISUAL_MIGRATION_SEQUENCE_V1.md` says Batch 1 is delivered and Batch 2 should be S9–S13 + S1 + S6. Since Batch 1 visual design is not approved, the first execution batch must establish a coherent approved visual journey that includes the rejected/missing entry and assessment-start surfaces before expanding the assessment protocol.

Required correction:

- Recompute the first executable batch from the actual current status.
- It must include the minimum coherent pilot entry journey and establish a visual quality bar in Living Content before S9–S13 expansion.
- Do not label a batch “delivered” until owner visual approval.

### C3. The audit reinstates 300×716 as a working implementation scale

The Component Reuse Map recommends “working 300×716” and permits learner-facing text down to 11 px. This contradicts the current design QA and accessibility baseline. The 300 px phone can exist only as a scaled presentation thumbnail, never as implementation dimensions.

Required correction:

- Canonical mobile implementation canvas: real target viewport, initially 390×844.
- Body text normally ≥16 px; secondary text normally ≥14 px.
- Interactive hit areas ≥44×44 px.
- If a presentation board scales screens down, label the scale explicitly and preserve the implementation specs separately.

## Major

### M1. The audit points to obsolete D-01 instead of the approved execution gate D-03

The final action says to continue Batch 2 under D-01. The current workflow requires owner approval of D-02, followed by scoped execution under `docs/prompts/design/03_redesign_approved_batch_in_living_content.md`.

Required correction: update every next-action, session, task and migration reference to D-03 and the owner-approval gate.

### M2. “Every existing designed screen” was not audited individually

The matrix groups mobile 12–16, 17–19, 28–29, 34–35/37–38 and all 28 legacy `screens/*` into collective rows. D-02 requires every existing screen to receive one explicit status. Grouping hides meaningful differences: for example mobile 12 may be near-KEEP while mobile 16 needs recovery/data-integrity work; legacy `import-video.html` and `push.html` are exceptions inside an ARCHIVE group.

Required correction:

- Provide one row per mobile 01–39, web 01–14 and focus 01–02.
- Provide one concise row per `docs/design/project/screens/*.html`, even when many share the same ARCHIVE rationale.
- Keep the synthesis grouped, but make the evidence matrix exhaustive.

### M3. Reuse percentages are not reproducible

The conclusion reports ~85–90% visual-language reuse, ~55% screens retaining visual foundation, ~25% components only and ~20% archive without showing the calculation or denominator. Grouped rows make these figures impossible to verify.

Required correction: provide exact counts and formulas, or label the numbers explicitly as qualitative estimates and remove false precision.

### M4. Resolved C1 terminology is incorrectly listed as an owner blocker

The scaffolded-retrieval versus free-production distinction is already resolved in `05_INTERACTION_ARCHITECTURE.md` and `06_SCREEN_SPECIFICATIONS.md`. It should not reappear as a pending owner decision.

Required correction: mark it resolved and cite the governing sections. Only genuinely unresolved decisions belong in the owner decision list.

## Minor

### m1. “Profile-hub.html — delete” violates task scope

D-02 is an audit and explicitly does not delete or move sources. Mark it ARCHIVE/empty; do not recommend deletion as an audit action without a separate approved cleanup task.

### m2. KEEP definition should remain strict

If a screen requires new states, changed phase labelling or interaction behaviour, clarify whether it is still KEEP with production completion or should be ADAPT. Apply the stated definitions consistently.

## Required resubmission

Revise all five audit files plus `.ai/SESSION.md`, `.ai/TASKS.md` and the handoff. Do not create visual designs. Do not overwrite or delete the rejected Batch 1 artifact. Return a corrected D-02 v1.1 package and stop for review.
