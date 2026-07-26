# PRODUCT_CONSTITUTION v1.2 — architecture governance audit

## Executive Summary

Overall assessment: **Not ready**

Architecture maturity: **8/10**

Estimated governance stability: **7/10**

## Findings

### Finding 1

- **Severity:** Critical
- **Section(s):** §3 Practice; §5.2 Daily Learning Engine; §4.1; Architecture Resolution ADR-010/011
- **Explanation:** The Constitution mandates that every practice unit ends in the learner's own production and that production is never cancelled. Architecture Resolution explicitly allows receptive-only sessions and defines same-session produce as a property of content packaging, not a mandate on learner completion. The learner may complete the produce task later without being gated.
- **Why this is an architectural issue:** Future DLE and scheduler implementations can legitimately derive incompatible runtime contracts: mandatory output before session completion from the Constitution, or legal receptive-only completion from the authoritative Resolution.
- **Minimal correction:** Align the constitutional invariant with ADR-010/011: every introduced unit is supplied with a produce task; learner completion timing is not a progression gate, and receptive-only session types remain legal.

### Finding 2

- **Severity:** Critical
- **Section(s):** §6 Vertical Slice current implementation; §4.1; §12 Frozen Architecture; `packages/core/slice.ts`
- **Explanation:** Section 6 states that the canonical sequence is enforced by core and that early, repeated and incomplete steps are rejected. Actual core guards assessment stages, new context, holdout, finalization and export, but does not guard the curriculum-session transition. `completeSession(plan)` can run before pretest, accepts caller-supplied plans, and repeated completion of the same normal plan increments `sessionsCompleted` and `introDone` until their caps. `recordPilotEntry()` is also repeatable and can mutate entry state after later stages.
- **Why this is an architectural issue:** The Constitution freezes “core, not UI, enforces protocol” while the implemented state machine does not enforce the full protocol it claims. Future components can treat forged session progress as constitutional state and unlock the otherwise-correct day-14 gate.
- **Minimal correction:** Either narrow the “current implementation” claim to the transitions actually guarded, or bring entry/session transitions under the frozen core state-machine invariant before treating §6 as authoritative current state.

### Finding 3

- **Severity:** Major
- **Section(s):** §5.7 Community and live interaction; §3 prohibition on inferred psychological readiness; §8; Architecture Resolution ADR-006/013; Linguistic & Psychological Progression Model
- **Explanation:** Community admission is described as based on “readiness and choice.” Resolution rejected a confidence/readiness gate pending validation, and the governing methodology prohibits psychological readiness from controlling progression. The Constitution provides no separate observable, non-psychological definition of readiness.
- **Why this is an architectural issue:** A future community implementation could treat inferred readiness as an admission gate, while another implementation could rely only on explicit learner choice. Both could claim constitutional compliance.
- **Minimal correction:** Remove readiness as an admission authority unless and until a separately ratified, observable, non-psychological policy exists; preserve explicit learner choice and the validated protocol requirements.

### Finding 4

- **Severity:** Major
- **Section(s):** §5.14 Psychological support layer; §3 Progression; §12 Frozen Architecture; Linguistic & Psychological Progression Model
- **Explanation:** The subsystem card assigns “conservative defaults by T states,” while the Constitution elsewhere states that runtime T predicates do not exist and that T labels belong to object × task × domain × modality × social condition, never to a learner. The progression model describes T-linked defaults as methodological candidates, not an implemented stage selector.
- **Why this is an architectural issue:** Future task adaptation could be built around a learner-level T state even though the frozen architecture expressly prohibits that representation.
- **Minimal correction:** Bind defaults to explicit task/evidence conditions, or mark T-linked mappings as future methodology that cannot execute until object-scoped predicates are specified and validated.

### Finding 5

- **Severity:** Major
- **Section(s):** §6 Vertical Slice evidence model; §12 Frozen MVP; §5.11 Analytics; Architecture Resolution ADR-015; current event runtime
- **Explanation:** The Constitution states that the Vertical Slice journal contains both intentional and uncontrolled exposure. The current Slice runtime only emits `encounter` events with `exposure: "intentional"`; no uncontrolled-exposure write path exists.
- **Why this is an architectural issue:** Governance and later analysis may assume that absence of an uncontrolled event means absence of external exposure, although the runtime currently cannot record it.
- **Minimal correction:** Classify intentional/uncontrolled exposure as the frozen target event schema rather than completed Vertical Slice behavior, unless a real uncontrolled-exposure path is present.

### Finding 6

- **Severity:** Minor
- **Section(s):** §4.10; §9.1; §6 current mobile implementation
- **Explanation:** “Exactly one next step” is a permanent principle, but the missed-day hub currently exposes both Recovery and the normal curriculum session. The Constitution does not classify this as a temporary implementation exception.
- **Why this is an architectural issue:** It creates a small mismatch between the navigation invariant and the current surface used as the reference implementation, though it does not compromise protocol integrity because both paths are legal.
- **Minimal correction:** Record the current dual legal choice as an implementation exception, or reserve “one next step” for required protocol progression rather than optional recovery.

## Explicit statement

The document should not yet be considered the governing architecture document because it contains incompatible session-output contracts, overstates core enforcement of the current Pilot protocol, and leaves readiness/T-state adaptation ambiguous enough to permit conflicting future implementations.

