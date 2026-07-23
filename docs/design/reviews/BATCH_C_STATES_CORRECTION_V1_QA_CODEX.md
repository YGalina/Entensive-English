# Batch C states correction v1 QA · Codex

**Date:** 2026-07-23  
**Scope:** `docs/design/exports/batch-c-states-correction-v1/` from Fable archive v21  
**Verdict:** **PASS · APPROVED AND FROZEN**

All six required corrections from `BATCH_C_STATES_V1_QA_CODEX.md` are applied consistently without changing the frozen Batch C defaults or approved visual direction.

## Verified

- R5 keeps the revealed phrase visible during retyping; no extra memory test is introduced.
- V5 truthfully discards an interrupted fragment and provides both `Записать заново` and `Дальше без записи`.
- V2 includes `Открыть настройки` while continuation without recording remains first-class.
- V8 makes no storage claim and provides retry plus continuation without recording.
- V6 visibly provides both recovery actions.
- W4 uses `Текст сохранён` and preserves the approved post-output choices.
- Ink/black task controls remain as explicitly approved by the product owner.
- Board, matrix, copy inventory, traceability and open questions agree.
- No Batch A/B, default Batch C screen, navigation, methodology or application code changed.

## Carried to implementation

- Opening device settings is platform-specific and must be validated in the native implementation.
- Static HTML does not prove microphone permissions, audio persistence, keyboard behaviour, idempotency, storage or resume semantics.
- Distractors and real learning content require curriculum review.

The superseded `batch-c-states-v1/` package is removed from the current source of truth; it remains recoverable in Git history together with its audit.
