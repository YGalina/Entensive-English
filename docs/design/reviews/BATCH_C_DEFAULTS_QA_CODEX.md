# Batch C default-screen QA · Codex

**Date:** 2026-07-22  
**Scope:** candidate `docs/design/exports/batch-c-defaults/` from Fable archive v18  
**Verdict:** **CORRECTION REQUIRED BEFORE OWNER FREEZE**

The Living Content direction is preserved and should not be redesigned. The six-phase journey is visually coherent, readable and substantially stronger than the rejected early Batch 1. Required work is a bounded correction pass, not a new concept.

## Keep unchanged

- Living Content palette, typography, paper/ink materiality and restrained phase colour.
- 390×844 canonical screen size.
- Phase header and six-part progress orientation.
- Phase 1 cards and 48px listen controls.
- Phase 2 contextual text pattern.
- Phase 5 optional/private voice hierarchy and 84px recording control.
- Focus “lamp light” visual treatment; measured text contrast passes AA.
- S14 card hierarchy and the separation of curated alternatives, contextual grammar and source disclosure.

## Critical

### C1 · S14 makes a false modality and quality claim

Phase 5 explicitly allows `Дальше без записи`, while S14 says `Фраза сказана. Твоя.`. The same card also says `она работает`, although no correctness judgment or human validation has occurred. S14 is governed by the learner’s written text.

**Required correction:**

- `Фраза сказана. Твоя.` → `Твоя фраза готова.`
- `Живая фраза о твоей жизни — и она работает.` → `Ты написала фразу о своей жизни и использовала новый язык в своём контексте.` only if gendered copy is approved; otherwise use neutral `Это фраза о твоей жизни — с новым языком в твоём контексте.`
- Keep the explicit disclosure that the automatic analysis uses written text and did not analyse voice.

### C2 · Storage-unavailable promises an unimplemented delivery mechanism

`Хранилище недоступно. Можно продолжить — сохраним, когда оно вернётся.` promises deferred persistence. S27 explicitly leaves sync transport and recovery architecture unresolved.

**Required correction:** use only observable truth, for example: `Хранилище недоступно. Текст остаётся на экране — скопируй его или попробуй сохранить ещё раз.` Do not promise background saving.

## Major

### M1 · Gendered default contradicts the active copy rule

`узнаешь их сама` is knowingly left as an owner question even though D-05 required gender-neutral default copy.

**Required correction:** `Скоро эти фразы встретятся в тексте — и уже будут знакомы.` Do not add a gender selector.

### M2 · Input ergonomics are not demonstrated

Phase 3 leaves most of the screen empty and places the action at the bottom; Phase 4 uses a very tall flexible textarea. In real use the keyboard changes both compositions. The current candidate does not demonstrate that the input, scaffold control and primary action remain simultaneously reachable above a 390px mobile keyboard.

**Required correction:** add one compact keyboard-open layout reference for Phase 3 and one for Phase 4. These are ergonomic variants of the approved defaults, not a full state pass. Keep input and action visible; reduce decorative/unused vertical space rather than shrinking text or targets.

### M3 · `Готово` is ambiguous before two remaining phases

On Phase 4, `Готово` can mean the whole session is finished, although voice and summary still follow.

**Required correction:** use `Сохранить и дальше` or a clearer equivalent that communicates submission and continuation. Do not use `Готово` until the journey is actually complete.

### M4 · `Продолжить путь` is abstract

The S14 destination is Path Hub, but the learner-facing action does not explain the immediate result.

**Required correction:** use `Вернуться к плану` if it returns to Path Hub. If it opens the canonical current next step, name that step. Do not create a second learning route from S14.

### M5 · Grammar copy adds an unnecessary psychological interpretation

`без оправданий` is not a grammar explanation and can sound judgmental.

**Required correction:** `still in progress — способ сказать, что процесс ещё не закончен. Still стоит перед описанием состояния.`

## Minor / state-pass notes

- The visible first-letter hint is acceptable as an explicit learner request, but later states must enforce the order: first letter → choice of three → reveal and retype → retry. Do not expose all levels simultaneously.
- `Проверить` may remain ink in the learning task; terracotta remains the journey action colour.
- Phase 5 and S14 remain separate logical steps even if S14 is displayed as `6 из 6`.
- S27 `pending-sync`, `not-saved`, `storage-unavailable` and `sync-conflict` belong to the later state sheet; only the corrected wording is required now.
- Static HTML does not prove real keyboard, safe-area, focus or responsive behaviour. Those claims must stay marked as specifications until implementation testing.

## Acceptance gate for correction v1

Correction passes when:

1. C1–C2 and M1–M5 are resolved in the board, individual screens, copy inventory, assumptions and traceability.
2. Two keyboard-open ergonomic references are included.
3. No unrelated composition, palette, typography or earlier batch is changed.
4. No state sheets, navigation redesign or application code are added.

