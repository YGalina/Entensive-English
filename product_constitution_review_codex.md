# Product Constitution v1.0 — independent architecture review

## Critical inconsistencies

- The document turns a Pilot/MVP audience decision into a permanent whole-product exclusion. Section 1 declares scope “entire product” and says the product does not teach from zero or replace a full A2→B2 curriculum. The Integrated Blueprint and `product_system/v2/curriculum_blueprint_b1_b2_v2.md` still define structured A2→B2/B1→B2 progression. `architecture_resolution.md` limits the profile decision to MVP/Pilot; it does not delete the broader product architecture. This is a hidden scope redesign.
- The same permanence error applies to live practice and community. Г-2 places live practice outside core MVP; the Constitution makes that a product-level “does not solve” rule while the Blueprint and post-Pilot roadmap retain live interaction as a later learning layer.
- The Constitution says every early, repeated, or incomplete protocol transition is rejected by core. Current `completeSession(plan)` has no session identity/idempotency guard: completing the same non-recovery plan repeatedly increments `sessionsCompleted` until the cap and can advance `introDone`. Therefore curriculum progress can be forged despite the constitutional claim that protocol invariants are fully enforced in core.
- “Holdout remains uncontaminated” is scientifically and operationally inaccurate. Holdout items are intentionally exposed during the pretest and reassessed later. The runtime records this as `pretestExposed` and `intentionallyReassessed`; what is protected is absence from training and absence before new-context at day 14, not absence of contamination/exposure.
- Section 12 freezes “separate produce/recognize states” as part of the Pilot architecture. The isolated Vertical Slice store `ie_slice_srs` contains produce cards only. Recognize/produce separation exists in the main application’s `packages/core/srs.ts`, not inside the frozen Pilot runtime.

## High-priority issues

- UX principle “exactly one next step” does not match the mobile hub. After a missed day it displays both Recovery and the normal curriculum-session action.
- UX principle “interruption does not lose work; resume from the stopping point” is not implemented in Vertical Slice screens. Session, pretest and assessment indices/text are component-local state; leaving the screen loses the in-progress position and unsaved input.
- “No red error state exists” contradicts the mobile implementation: retrieval retry feedback uses `c.rose`. The same token is used for active recording, so the constitutional statement is broader than the runtime.
- The claim that the pilot log represents both intentional and uncontrolled exposure is not implemented. `recordEncounter()` writes only `exposure: "intentional"`; there is no uncontrolled-exposure runtime path.
- Profile-based eligibility is described as the product entrance contract, but core `recordPilotEntry()` only stores P1–P5 marks. It does not enforce eligibility or prevent progression for a profile outside the target audience.
- “Every session ends with the learner’s own utterance” is not literally enforced as spoken output: voice is optional and unanalysed. The implementation guarantees written production; spoken repetition is an optional experience.
- The Constitution presents the current full microcycle as a permanent product philosophy while `daily_learning_engine.md` defines four modes, including Minimum and Recovery. This collapses Pilot implementation into whole-product law.
- The Constitution claims assessment evidence is immutable generally, but the immutable one-write contract exists specifically for Pilot assessment events. Main-product output/event models do not universally implement the same invariant.
- The stated evidence hierarchy of six classes is not represented as a canonical runtime type. The Pilot separates event families, but neither event nor export schemas carry an explicit evidence-class identifier.
- “Status: active” and the claimed source hierarchy are premature while authoritative documents still diverge on audience scope, curriculum scope and future live practice. A constitution cannot resolve those differences merely by declaring itself the binder.

## Minor improvements

- Replace absolute scientific formulations with their actual epistemic strength. “Input by itself does not create speech,” “prompting feedback is more effective than recasts,” “motivation predicts attendance, not language,” and “success experience is produced only by a feasible task” are broader than the cited evidence and the more careful wording in `linguistic_psychological_progression_model.md`.
- “Anxiety and linguistic effort share one working-memory account” is a useful model but is phrased as a settled mechanism. The governing methodology describes task design as one contribution among several and marks exact effects unknown.
- “Automaticity = speed + stability” should remain a measurement framework, not a complete definition.
- Clarify that repeated final exports are read-only with respect to protocol/evidence, while `exportedAt` naturally differs between downloads.
- Clarify that partial draft export before finalization is allowed and is not the canonical final export.
- Distinguish current Pilot behavior, ratified MVP constraints, whole-product principles and post-Pilot options. The document currently mixes these authority levels.
- “Fixed pretest order” is per participant after seeded assignment, not one universal order.
- The reference to `psychological_coaching_boundaries_v2` should use its actual repository path under `product_system/v2/`.

## Verdict

Needs revision

