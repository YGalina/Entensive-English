# Batch B State Package · Codex QA

**Artifact reviewed:** `Intensive English дизайн-система_15.zip`  
**Scope:** S9–S13 state matrix, state sheets and implementation handoff  
**Verdict:** **PATCH REQUIRED** — default visual designs remain approved; do not ask Fable for another full state-generation pass.

## Critical

### C1. S10 short-input state cannot be reached

The matrix says the validation message is triggered by tapping `Отправить` with fewer than 10 non-whitespace characters. The handoff simultaneously requires the button to remain `disabled` until valid input. A disabled control cannot trigger that state.

**Correction:** keep the empty state disabled. After the first non-whitespace character, expose the 10-character requirement as inline input guidance while the action remains disabled. Enable the action only at 10 characters. Do not describe this as a language-quality error.

### C2. Invented two-second submission timeout

The handoff states `lock ≤2 s, then technical error`. No approved architecture or runtime contract establishes a two-second failure threshold. A slow local write could therefore be shown as a failure while still completing.

**Correction:** remain locked until the authoritative operation resolves or until an engineering-owned timeout constant fires. The design must not define a numeric network/storage timeout.

## Major

### M1. Voice state implies unsupported silence analysis

`Записалось только молчание` implies voice-activity or audio-content analysis, which is not an approved capability.

**Correction:** use an observable technical state such as `Запись пуста` only when no usable audio bytes/duration were captured. Do not infer that the learner was silent.

### M2. S13 overclaims successful delivery

The system share surface can often confirm that the share sheet completed or handed content to a selected target; it cannot generally prove that a recipient received the file. `Отправлено` overstates the evidence.

**Correction:** return to the unchanged results screen after the share sheet closes. If the platform exposes a reliable completion signal, use `Передано в выбранное приложение`, never a delivery claim.

### M3. Accessibility handoff conflates reading and focus order

Headings, explanatory panels and prompts are listed in the keyboard focus order even though they are not interactive controls. This can lead to unnecessary `tabindex` usage.

**Correction:** document DOM/reading order separately. Keyboard focus order contains interactive controls only. Programmatic focus moves only when a screen transition or error-summary pattern requires it.

### M4. OS share-sheet keyboard behavior is specified as app behavior

`Esc closes the system share-sheet` is owned by the operating system/browser and is not an application interaction contract.

**Correction:** state only that cancellation returns to the unchanged read-only results screen; do not prescribe the OS keyboard mechanism.

## Accepted

- Default screens were not modified.
- S9/S11 correctly preserve neutral assessment behavior and submitted-answer immutability.
- Technical failure is distinguished from an incorrect learner answer.
- Input is preserved during technical retry.
- Duplicate submission is addressed at both UI and core boundaries.
- S10 voice remains optional and never gates written completion.
- S12 correctly distinguishes answer immutability from closing the whole check.
- S13 remains read-only and repeat sharing does not mutate results.
- Reduced-motion, touch-target and non-colour status requirements are present.

## Required action

Codex should patch the state matrix and handoff directly. Fable is needed only if the corrections visibly alter a component; none of the findings requires a new creative pass.
