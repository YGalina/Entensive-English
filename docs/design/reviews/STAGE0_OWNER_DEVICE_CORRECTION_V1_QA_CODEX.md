# Stage 0 owner-device correction v1 — Codex QA

Date: 2026-08-05  
Source branch: `codex/stage0-day1-vertical-slice`  
Fable package: `docs/design/exports/stage0-owner-device-correction-v1/`  
Governing brief: `docs/prompts/design/14_owner_device_feedback_correction.md` (`ed6b7cc`)

## Evidence inspected

- downloaded archive `Intensive English дизайн-система.zip` (567700 bytes; modified 2026-08-05 09:34:49);
- self-contained review board;
- 15 individual HTML screen exports;
- copy/state inventory;
- implementation handoff;
- QA package and regression matrix.

The archive contains no application code and did not alter any previously accepted export.

## Coverage verdict

PASS for owner visual review:

1. S7 includes a neutral completion transition after item 28 and before training, with the four owner-specified strings and no correctness, score, level or mistake disclosure.
2. Keyboard-open references cover retrieval, free production and guided variation at 360×800 and 390×844.
3. S14 contains the four required written-text feedback states A/B/C/D, preserves the learner's text and makes no claim about analysis of voice or pronunciation.
4. S3 contains three equal vertical choices, including explicit 360×800 evidence at 100% and 200% system text plus the scrolled third-choice state.
5. Output paths, state names and learner-facing copy match prompt 14; the package contains no replacement product concept.

## Implementation clarifications

- The keyboard drawings are reference evidence for occupied viewport, focus and reachability. Android/iOS supply the real keyboard; application code must not reproduce or recolour system keys.
- The package's expanded device matrix marks 200% coverage beyond S3, but separate 200% exports exist only for S3. Runtime QA must therefore verify the remaining 200% intersections after implementation.
- `CODEX_QA_PACKAGE.md` names a `.dc.html` source file that is not present in the downloaded archive. This is not a prompt-14 deliverable blocker because the review board and individual HTML exports are present, but the missing design-project source cannot be treated as repository evidence.

## Gate

The package is internally consistent and ready for product-owner visual review. It is not approved for implementation until the owner accepts the visual result. After approval, Codex may implement only this bounded delta and then run the final physical Android regression.

