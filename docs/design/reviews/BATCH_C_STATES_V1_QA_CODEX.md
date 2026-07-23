# Batch C states v1 QA · Codex

**Date:** 2026-07-23  
**Scope:** `docs/design/exports/batch-c-states-v1/` from Fable archive v20  
**Verdict:** **BOUNDED CORRECTION REQUIRED**

The state set is visually coherent with the frozen Batch C defaults and covers the requested groups. The product owner explicitly approved ink/black controls for task-level actions inside exercises; this is not a finding. Do not redesign the visual direction.

## Accepted

- R1–R7 are represented as an ordered scaffold rather than simultaneous help.
- Writing, submit, failure, exit and resume states preserve the learner's text.
- Voice remains optional and private; no scoring or human-listening claim was introduced.
- S14 loading, unavailable, manual retry and stored-copy states keep written production complete.
- S27 manifestations remain embedded references rather than a new navigation destination.
- Session continuity distinguishes safe exit from completion.
- Approved defaults, Batch A/B, navigation and application code were not changed.

## Critical

### C1 · R5 silently changes the approved learning mechanic

The package states that the revealed phrase is hidden when the input receives focus. The frozen specification says `показ + перепечатать`; it does not authorize an additional memory test after reveal. The state pass must implement the literal approved scaffold, not choose a “methodologically stricter” variant.

**Required correction:** keep the revealed phrase visible while the learner retypes it. Remove the unresolved owner question and every claim that it hides on focus. Any future hide-after-delay experiment requires a methodology decision outside this task.

### C2 · Interrupted recording makes an unsupported persistence claim

V5 says `Сохранённая часть на месте`, although interrupted/backgrounded audio is explicitly not a completed recording and the architecture does not guarantee that a partial file is valid or persisted.

**Required correction:** use observable truth only: `Запись прервалась и не была сохранена. Можно записать заново или продолжить без записи.` Provide both actions. Do not retain or count the interrupted artifact.

## Major

### M1 · Permission denied lacks the required settings route

D-06 required a device-settings route plus first-class continuation without recording. V2 only offers continuation.

**Required correction:** add a secondary `Открыть настройки` action and keep `Дальше без записи` clearly available. Do not block written-flow completion on permission.

### M2 · Playback failure has no safe written-flow exit and overclaims storage

V8 says `Запись на месте` and offers only retry. Neither file integrity nor successful storage is guaranteed merely by a playback failure, and every voice failure must have a safe route to the written flow.

**Required correction:** use `Не получилось воспроизвести запись. Попробуй ещё раз или продолжи без записи.` Provide `Повторить` and `Дальше без записи`. Do not promise that the file is safely stored.

### M3 · Empty recording needs explicit actions in the visual state

V6 describes the condition but the board does not show the two required recovery actions.

**Required correction:** show `Записать заново` and `Дальше без записи` on V6.

## Minor copy clarification

In W4, replace `Фраза записана` with `Текст сохранён` to avoid sounding like a voice recording immediately before the voice phase. Keep the post-output nudge and both legal choices unchanged.

## Acceptance gate

Correction passes when C1–C2, M1–M3 and the W4 clarification are updated consistently in the board, matrix, copy inventory, traceability, open questions and materially different individual screens. No other copy, composition, palette, controls, state coverage or default screen may change.
