# Batch 1 · Codex Design QA

Status: changes required before approval.  
Scope: S3 Profile Entry · S4 Path Hub · S7 Pretest · S8 Assessment Gate/Wait.  
Constraints: do not redesign, reopen frozen architecture, or change assessment mechanics.

## Critical

### C1. Pretest copy leaks and misstates training assignment

In the empty S7 item state the copy says: “Именно эти единицы придут в сессиях.” The completion state says: “Всё, что сегодня не вспомнилось, придёт в сессиях.” Pretest contains 22 trained items and 6 control items; control items must not be promised or exposed as future training. This copy can reveal or falsely imply group assignment and contradicts the holdout protocol.

Minimal correction: use neutral wording that does not say whether a particular item will appear in training. Example: “Не вспомнилось — это нормальная часть стартового фото. Ответ записан без оценки.” At completion: “Стартовое фото сохранено. Дальше начнётся практика по программе.”

## Major

### M1. Shadow retrieval-depth metric is shown to the learner

S4 says: “Вчера 6 из 8 достались без подсказки.” Screen Specification S5 explicitly marks support depth/latency as shadow data that is not shown. This turns an internal diagnostic into a learner-facing score and may create performance pressure.

Minimal correction: replace it with an approved process fact that does not expose support depth, for example: “Вчера возвращались 8 единиц” or omit the line.

### M2. S3 partial state clips required controls

The phone body uses `overflow:hidden`; only P1–P3 and the beginning of P4 are visible. P5 and the note cannot be reached in the artifact, and no scrolling behavior is specified. A literal implementation would make completion impossible.

Minimal correction: define the content area as vertically scrollable while keeping the completion counter and CTA anchored; show the scroll behavior in the annotation.

### M3. Mobile canvas and type scale are not implementation-ready

The artifact declares a 300 px phone canvas and uses core learner-facing text at 10.5–12.5 px, plus 34 px back controls. If these are literal CSS dimensions, they are too small for the target audience and below common mobile touch-target guidance.

Minimal correction: state explicitly whether the canvas is a scaled presentation. Provide implementation dimensions at an approved mobile viewport (for example 390 px), body text normally at least 16 px, secondary text at least 14 px, and interactive hit areas at least 44×44 px. Do not change hierarchy or content.

## Minor

### m1. Waiting-state terminology is inconsistent

The recovery state uses “Вернуться с 5 минут”; the waiting state uses “Поддерживающий возврат” / “Вернуть единицы · 5 минут.”

Minimal correction: choose one user-facing vocabulary before implementation while preserving the separate protocol meaning.

## Passed

- S4 preserves one visually dominant leading action.
- S8 explains both guard conditions without an extra curriculum CTA.
- S7 normalises “Не помню” without hints, answers, correction, or retry.
- Required loading, accepted, rejected, partial/resume, local-save, storage, and projection states are represented.
- No CEFR, streak, guardian, levelcheck, skills catalogue, or in-app Galina greeting was introduced.

## Gate

Do not start Batch 2 yet. Apply only the corrections above, update the Batch 1 compliance note, and return the same four-screen scope for re-review.
