# Batch F · Auth & Monetization States

## Role

Act as Claude Design / Fable visual executor for Intensive English.

You are not redesigning product architecture. You are producing the state-sheet pass for the already approved Batch F Auth & Monetization defaults.

## Required inputs

Open `YGalina/Entensive-English`, branch `codex/recovery-integrity-freeze`.

Read first:

1. `.ai/AI_PROJECT.md`
2. `.ai/AI_RULES.md`
3. `.ai/SESSION.md`
4. `docs/governance/IMPLEMENTATION_HANDOFF.md`
5. `docs/design/auth_monetization/BATCH_F0_AUTH_MONETIZATION_RESOLUTION.md`
6. `docs/design/exports/batch-f-auth-monetization-correction-v1/`
7. `docs/prompts/design/12_batch_f_auth_monetization_visual_design.md`

## Scope

Create only Batch F state screens for the already approved auth and monetization surfaces.

Cover:

### Auth/account states

- email validation error;
- magic-link sending/loading;
- magic-link sent;
- magic-link expired;
- magic-link failed;
- resend available;
- Apple/Google provider error;
- offline while attempting auth;
- returning account found;
- user chooses to continue locally without account;
- sign-out confirmation;
- signed-out/local-only clarification.

### Payment/subscription states

- paywall default preserved as baseline reference only;
- checkout handoff/loading;
- payment success;
- payment failed;
- user cancels checkout;
- restore purchase/loading;
- restore purchase success;
- restore purchase not found;
- already subscribed;
- subscription cancelled, access until end of paid period;
- subscription expired, free mode continues;
- payment method unavailable / region unavailable;
- offline during payment-management action.

## Hard rules

- Do not redesign Batch F defaults.
- Do not change Batch A, B, C, D, E or Recovery/Integrity.
- Do not introduce a trial.
- Do not introduce PRO terminology.
- Do not introduce guarantee, group intensive, CEFR-result, word-count-result, or timeframe promises.
- Do not claim cloud sync beyond approved account/payment continuation.
- Do not promise voice-recording cloud backup.
- Do not use research/pilot/internal terminology in learner-facing copy.
- Keep the Living Content visual language.
- Keep touch targets ≥44px and primary actions reachable on 390×844.
- Use the ratified prices only where price is visible: 690 ₽ / month and 3 990 ₽ / year.
- Payment UI may show state and handoff. Do not invent provider-specific implementation.

## Copy direction

Tone: calm, clear, adult, non-punitive.

Use wording like:

- “Можно продолжить в бесплатном режиме.”
- “Доступ сохранится до конца оплаченного периода.”
- “Мы не смогли найти активную подписку.”
- “Проверь интернет и попробуй ещё раз.”

Avoid:

- guilt;
- urgency timers;
- “last chance”;
- “you failed”;
- “unlock fluency”;
- “reach B2 by…”;
- “guaranteed result”.

## Output path

Save all deliverables under:

`docs/design/exports/batch-f-auth-monetization-states-v1/`

Include:

- board HTML;
- individual screen/state HTML files;
- copy inventory;
- traceability notes;
- assumptions;
- open questions, if any.

## Stop condition

Stop after producing Batch F states for owner visual review.

Do not implement application code.
Do not generate the next batch.
Do not modify frozen architecture.

## Completion report

Report:

- exact created files;
- screens/states included;
- assumptions;
- unresolved owner decisions;
- branch and commit if available.
