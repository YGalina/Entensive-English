# Design Prompt 12
# Batch F · Auth & Monetization Visual Design

## Use only after Batch F0 is approved

Do not run this prompt until:

- `docs/design/auth_monetization/BATCH_F0_AUTH_MONETIZATION_RESOLUTION.md` exists;
- the product owner has approved it;
- S25 rules are ratified.

## Role

Act as Claude Design / Fable: Lead Product Designer.

You are a visual executor, not a product strategist.

Do not redesign product architecture.
Do not invent monetization rules.
Do not change the learning method.
Do not reopen Batch A–E.

## Required inputs

Read:

- `.ai/AI_PROJECT.md`
- `.ai/AI_RULES.md`
- `.ai/SESSION.md`
- `docs/design/auth_monetization/BATCH_F0_AUTH_MONETIZATION_RESOLUTION.md`
- `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`
- frozen Batch A visual language
- frozen Batch D Profile/Progress package if relevant
- `06_monetization.md`
- `17_platform_architecture.md`

## Visual scope

Create only Batch F default screens for:

### Auth

- S28 Welcome / Auth Choice
- S29 Email Magic Link Request
- S30 Magic Link Sent
- S31 Returning User / Continue
- S32 Auth Error / Link Expired

### Subscription / Payment

- S25 Paywall default
- S33 Plan Selection
- S34 Checkout Handoff / Web Checkout or IAP Handoff
- S35 Payment Success
- S36 Restore Purchase
- S37 Manage Subscription entry from Profile
- S38 Premium Locked State

Use the exact screen list from the approved F0 resolution if it differs.

## Ratified Batch F v1 monetization defaults

Use these defaults unless the approved F0 resolution says otherwise:

- Pure freemium; no trial screens in the default pass.
- Free = one full demo cycle + one general context pack.
- Paid = continuation, additional packs, personalization, full library depth, deeper stats/support/scale.
- Hide PRO, guarantee, group intensive and high-ticket offers from the self-serve v1 paywall.
- No app-only guarantee.
- No CEFR, fluency, word-count result or timeframe promise.
- Mobile payment is status/management handoff only until IAP is separately scoped.
- Web/desktop checkout is the primary payment route.
- Anonymous-local first run is allowed; account is offered at continuation/sync/purchase/profile boundary.

## Design constraints

- Use the approved Living Content visual language.
- Keep copy human, adult, quiet and concrete.
- No dark patterns.
- No fake urgency.
- No shame.
- No guilt.
- No “limited time”.
- No exaggerated transformation promises.
- No CEFR/payment promise.
- No “pay to become fluent”.
- Payment is framed as continuation, personalization, library depth, support and scale.
- Cancellation and refusal are safe.
- Free user is not punished.
- The app remains emotionally safe.

## Required output

Save everything under:

`docs/design/exports/batch-f-auth-monetization-defaults/`

Include:

- board HTML
- individual screen HTML files
- copy inventory
- traceability
- assumptions
- open owner decisions

## Stop condition

Stop after default screens.
Do not create state sheets.
Do not implement code.
Stop for owner visual review and Codex QA.
