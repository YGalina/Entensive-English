# Claude multi-agent UI/UX QA — Stage 0 Day 1 v1

**Date:** 2026-08-03  
**Reviewed branch:** `codex/stage0-day1-vertical-slice`  
**Reviewed tip:** `6f09e87`  
**Mode:** read-only; no design or implementation changes  
**Agents:** Claude `test-engineer` + `independent-reviewer`; final findings reconciled by Codex

## Verdict

**CONDITIONAL PASS for continued engineering; NOT READY for owner device acceptance.**

The Day 1 state engine, full/short completion truth, local persistence and spoken-evidence contract are materially sound. The repository test suite passed `162/162` and mobile TypeScript checking passed during the Claude test-engineer run.

No file-only finding justifies a visual redesign. Fable remains the sole owner of visual design and visual corrections. Physical Android review remains required for visual fidelity, TalkBack, keyboard, audio interruption and recording behavior.

## Reconciled findings

### P1 — release gates

1. **Stage 0 currently inherits the old in-product 28-item pretest.**
   - Evidence: `apps/mobile/src/app/entry/path-hub.tsx` checks `sliceState().pretestAt` and routes to `/entry/pretest` before `/entry/daily-session`.
   - Conflict: `DAY_01.md` says the Stage 0 pre-test is completed before the module; Stage 0 research surfaces are specified outside the learner flow.
   - Reclassification: Claude called this P0. It is not a crash or data-integrity failure, but it is a product/research-boundary conflict that must be resolved before a real Stage 0 pilot.
   - Owner: product owner decides whether Stage 0 bypasses the old S7 pretest or deliberately retains it; Codex implements the decision.

2. **Legacy isolation is startup-only, not route-complete.**
   - Evidence: legacy route files remain under `apps/mobile/src/app/` (`onboarding.tsx`, `session.tsx`, `coach.tsx`, `three.tsx`, `listen.tsx`, `youtube.tsx`, `sounds.tsx`, `block.tsx`). Direct routes/deep links can still resolve them.
   - Owner: Codex engineering. Add route-level isolation or remove the legacy route files through an explicit scoped change.

3. **Path Hub contains a dead legacy Library CTA.**
   - Evidence: `apps/mobile/src/app/entry/path-hub.tsx` routes “Открыть библиотеку” to `/(tabs)/library`; the tabs layout redirects back to `/entry`.
   - Impact: confusing bounce today and a future regression path into legacy UI.
   - Owner: Codex engineering; do not invent a replacement visual surface. Hide/disable according to the existing unavailable-state contract until the approved Library is implemented.

4. **Interrupted-recording message is unreachable.**
   - Evidence: `returnToPlan()` sets `voiceMessage` and immediately sets `showPlan=true`; the plan does not render `voiceMessage`.
   - Impact: silent loss of recording context after Back.
   - Owner: Codex engineering; behavior/copy must use already approved state `C-F5-CUT` without visual redesign.

5. **Summary contract is only partially implemented.**
   - Evidence: `corePhase === "summary"` always renders `C-S14-U`; “shown” and “saved copy” states are unreachable. The approved unavailable copy says the learner may retry, but the screen exposes only “Дальше”.
   - Reclassification: not P0 because an unavailable non-blocking summary is explicitly allowed. It is nevertheless incomplete and misleading without a retry path.
   - Owner: product owner decides whether Stage 0 ships with real summary generation. Codex then implements the chosen existing state; any new copy returns to the copy authority/Fable handoff.

### P2 — required corrections / contract clarifications

6. **Specified post-production states are absent.**
   - Missing or bypassed: `C-F4-SAVE`, conditional `C-F4-N`, and `C-F4-K` after free production.
   - Owner: Codex state coverage using approved copy and approved Fable states.

7. **Selected guided-variation slot is visual-only.**
   - Evidence: slot buttons have labels but no `accessibilityState={{ selected: ... }}`.
   - Owner: Codex accessibility.

8. **Progress grouping needs physical TalkBack verification.**
   - `DayProgress` and `PhaseProgress` have a label but not an explicit Android grouping guarantee.
   - Owner: Codex only if the physical test reproduces the issue.

9. **Back semantics are underspecified for non-first screens inside a block.**
   - Implementation sends Back from every screen to the day plan; the ratified contract specifies this only for the first screen of a block.
   - Owner: product/copy contract decision first; no visual change by Codex.

### P3 — cleanup and test debt

10. Remove or explain the dead answer heuristic `.replace(" flow", "")`; no canonical retrieval answer contains `flow`.
11. Confirm input latency on a low-end Android because each keystroke persists the full state to MMKV.
12. Decide/document the permanently-denied microphone path; recording remains optional, so this is not blocking.
13. The implementation follows States v3, while the named signed QA artifact references v2. Record the v2→v3 delta acceptance in governance.

## Confirmed PASS

- Day 1 full-path completion truth.
- Day 1 short-path completion truth and no hidden carry-over debt.
- Full↔short switching preserves completed work and drafts.
- Generic “Дальше без записи” is not treated as spoken evidence.
- Full completion requires two explicit fluency attempts.
- Local save/read-back failure handling in the state engine.
- No CEFR, percentages, streaks or research terminology in learner copy reviewed.
- No music, ambient audio, word flood or trainer CTA referenced by the canonical Entry/Stage 0 implementation.
- Checked touch targets meet the repository minimums in source.
- `162/162` repository unit tests passed in the Claude test-engineer run.
- Mobile TypeScript check passed in the Claude test-engineer run.

## Automated tests to add

1. Mobile navigation test for the selected Stage 0 entry policy (old S7 retained or bypassed).
2. Direct deep-link tests proving every legacy route resolves to canonical `/entry` or is absent.
3. RNTL test for Back during active recording and visible `C-F5-CUT` handling.
4. RNTL tests for full and short Day 1 screen flows, not only the core state engine.
5. Summary shown/unavailable/retry tests after the owner decision.
6. Accessibility-state test for guided slot selection.
7. Time-boundary test at 19:59/20:00/20:01 with injected time.

## Physical Android acceptance checklist

- Clean install lands in the canonical Entry flow; record the exact screen count before Day 1.
- Direct legacy deep links do not expose old onboarding, word flood, music, trainer or legacy tabs.
- Microphone allow/deny/permanent deny.
- Empty recording, 60-second auto-stop, playback and recording interruption.
- Back/system gesture/backgrounding during active recording.
- TalkBack focus order, selected slot announcement and progress grouping.
- 130–200% font scaling and keyboard visibility for multiline inputs.
- Full and short completion facts match activities actually completed.
- Compare visual rendering with the approved Fable Default v2 / States v3 package; visual corrections go only to Fable.

