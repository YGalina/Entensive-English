# Batch C correction v1 QA · Codex

**Date:** 2026-07-22  
**Scope:** `docs/design/exports/batch-c-correction-v1/` from Fable archive v19  
**Verdict:** **PASS — READY FOR PRODUCT-OWNER VISUAL APPROVAL**

The correction closes all critical and major findings from `BATCH_C_DEFAULTS_QA_CODEX.md` without changing the approved Living Content direction or expanding scope.

## Accepted corrections

- S14 no longer implies that voice was recorded or assessed: `Твоя фраза готова.`
- S14 recognition is limited to observable written output and contextual use.
- S14 explicitly says the automatic analysis used written text and did not analyse voice.
- `storage-unavailable` no longer promises deferred/background saving.
- The Phase 1 bridge is gender-neutral.
- Phase 4 CTA is now `Сохранить и дальше`.
- S14 CTA is now `Вернуться к плану`.
- The grammar explanation no longer adds the judgmental phrase `без оправданий`.
- Compact keyboard-open references exist for Phase 3 and Phase 4; the input, scaffold/action and keyboard remain visible without shrinking learner text or tap targets.

## Visual and scope checks

- The six-step S5 journey remains coherent; S14 is the sixth visible step after written production.
- Focus 01 preserves the same retrieval mechanics and only changes presentation.
- Living Content palette, typography and materiality remain unchanged.
- No Batch A/B screen, navigation architecture or application code was modified.
- No full state sheet was added; S27 examples remain supporting references for the later state pass.
- Two stale CTA descriptions in supporting Markdown were corrected during QA to match the actual screens. No visual was altered.

## Known limits carried forward

- Static HTML is a design specification, not proof of native keyboard, focus, safe-area or persistence behaviour.
- Graduated retrieval order, voice lifecycle, offline/save failures and retry behaviour must be verified in the separate state pass and later in implementation.
- Illustrative learning content remains placeholder and must be replaced by curriculum-approved content that does not contaminate the baseline assessment.

## Gate

No further Fable correction is required for the default-screen pass. After the product owner approves the visual result, Batch C defaults may be frozen and the bounded Batch C state-pass brief may be issued.
