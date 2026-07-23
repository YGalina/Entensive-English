---
id: D-07
title: Batch C states v1 — bounded correction
owner: Claude Design / Fable
status: ready
input: `docs/design/exports/batch-c-states-v1/`
output: `docs/design/exports/batch-c-states-correction-v1/`
---

# TASK

Apply only the accepted corrections from:

`docs/design/reviews/BATCH_C_STATES_V1_QA_CODEX.md`

The current visual direction is approved. Ink/black task controls inside exercises are explicitly approved by the product owner. This is not a redesign.

# REQUIRED PATCHES

1. **R5 reveal + retype:** keep the revealed phrase visible while retyping. Remove hide-on-focus behaviour and the corresponding open question.
2. **V5 interrupted recording:** use `Запись прервалась и не была сохранена. Можно записать заново или продолжить без записи.` Show `Записать заново` and `Дальше без записи`. Do not retain/count partial audio.
3. **V2 permission denied:** add secondary `Открыть настройки`; keep first-class `Дальше без записи`.
4. **V8 playback failure:** use `Не получилось воспроизвести запись. Попробуй ещё раз или продолжи без записи.` Show `Повторить` and `Дальше без записи`; remove the storage claim.
5. **V6 empty recording:** visibly show `Записать заново` and `Дальше без записи`.
6. **W4 clarification:** `Фраза записана.` → `Текст сохранён.` Keep the existing nudge and choices.

Update the board, matrix, copy inventory, traceability, open questions and materially different individual state screens consistently.

# DO NOT CHANGE

- frozen Batch C defaults;
- approved composition, palette, typography or spacing;
- black/ink task controls;
- any other state or copy;
- Batch A, Batch B, navigation, methodology or application code.

# OUTPUT

Save only under:

`docs/design/exports/batch-c-states-correction-v1/`

Stop after the correction package and report exact files and all six applied patches.
