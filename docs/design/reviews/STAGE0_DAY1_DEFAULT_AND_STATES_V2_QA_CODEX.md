# Stage 0 Day 1 · Default v2 + States v2 · Codex QA

Date: 2026-08-02

Verdict: **PASS — accepted for implementation**

## Inputs

- `docs/design/exports/stage0-day1-v1/STAGE0_DAY1_DEFAULT_V2.html`
- `docs/design/exports/stage0-day1-v1/STAGE0_DAY1_STATES_V2.html`
- UX/copy contract commit `1f647ba`

## Verification

- Default v2 is the owner-approved default-screen source.
- States v2 contains 34 unique `data-screen-label` values and 34 phone frames.
- Compared with States v1, exactly one state was added: `F5 · Запись без пригодного звука`.
- Nine existing state screens changed: A4, A5, A6, E7, E9, F2, F4, F8 and F13.
- The other 24 existing state screens remained unchanged.
- All 12 learner-copy additions ratified in contract v1.4 are represented in the appropriate states.
- Resume labels use `Три фразы по одной рамке` and `Своя фраза вслух`.
- Day-not-started, full-completion and short-completion semantics are distinct.
- Microphone permission, interrupted recording, empty recording and failed local save are represented honestly.
- Recording remains optional and affected states allow continuation without a recording.
- 49 button elements were checked; none declares a target height below 44 px.
- No unresolved Day 1 copy blocker remains.
- Learner-facing copy contains no forbidden research/protocol terminology.

## Implementation gate

Engineering may implement only the accepted Day 1 scope. Visual discrepancies,
missing states or copy changes must be returned to Fable/Opus through the existing
workflow; Codex does not patch the visual design.
