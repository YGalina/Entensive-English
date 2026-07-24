# Design Prompt 11
# Batch F0 · Auth & Monetization Architecture Resolution

## Role

Act as Principal Product Architect, monetization strategist, privacy reviewer, and UX systems architect for Intensive English.

This is not a visual-design task.
Do not draw screens.
Do not generate HTML.
Do not implement code.
Do not create a paywall yet.

Your task is to ratify the minimum product, UX, monetization, platform and honesty rules required before Auth & Monetization can be sent to Claude Design / Fable.

## Required inputs

Read first:

- `.ai/AI_PROJECT.md`
- `.ai/AI_RULES.md`
- `.ai/SESSION.md`
- `PRODUCT_CONSTITUTION.md`
- `06_monetization.md`
- `17_platform_architecture.md`
- `experience_architecture/03_INFORMATION_ARCHITECTURE.md`
- `experience_architecture/04_USER_JOURNEY_ARCHITECTURE.md`
- `experience_architecture/05_INTERACTION_ARCHITECTURE.md`
- `experience_architecture/06_SCREEN_SPECIFICATIONS.md`
- `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`
- frozen Batch A–E packages as needed for context

Do not claim a file was read if it is missing.

## Context

S25 Subscription / Paywall is currently `[PLAN]`.

The screen specifications explicitly state:

> S25 must NOT be handed to visual design as an approved screen until its IA ownership and rules are ratified.

Therefore, this task exists to define those rules before Batch F visual design.

## Scope

Resolve only the architecture and product rules for:

1. Auth / registration / login
2. Account identity
3. Privacy and terms entry points
4. Subscription / paywall
5. Trial / free access boundary
6. Payment platform split
7. Subscription management
8. Restore purchase
9. Failed payment
10. Expired subscription
11. Premium locked states
12. Profile ownership of account/payment settings

## Non-negotiable product constraints

- No dark patterns.
- No guilt.
- No fake urgency.
- No “you will become fluent if you pay”.
- No CEFR promises from payment.
- Do not gate the core learning method in a way that destroys the product premise.
- Free should let the learner feel the method.
- Paid should unlock continuation, personalization, scale, library depth and/or support.
- Payment is an exchange of access and support, not a guarantee of transformation unless a separate human-backed PRO product is explicitly defined.
- Voice remains private by default.
- Payment cancellation must be safe and non-punitive.
- User data remains hers.

## Required decisions

Produce explicit decisions for:

### Auth

- Is sign-in required before first value?
- Which methods are v1: Apple, Google, email magic link, email/password, anonymous local?
- What happens on first launch?
- What happens on returning user?
- What happens if magic link fails?
- What happens if account exists on another device?
- What is local-only vs account-bound?

### Profile ownership

- Where do account settings live?
- Where do payment/subscription settings live?
- Where do privacy/terms links live?
- Does S20 Profile become the owner of auth/payment entry points?

### Free → Paid boundary

- What exactly is free in v1?
- When can the paywall appear?
- What is never blocked?
- What can be locked?
- What happens if the learner refuses payment?
- Does Path continue in a limited mode or stop at a clear boundary?

### Subscription / Paywall

- What is the honest value proposition?
- What plans are shown in v1?
- Monthly vs yearly?
- Trial or no trial?
- Is PRO shown or hidden?
- Is group intensive shown or hidden?
- Which claims are allowed?
- Which claims are forbidden?

### Platform split

- Web payment vs mobile IAP.
- If mobile IAP is not implemented, what does mobile show?
- Is web checkout a v1 requirement or future?
- What is allowed by platform rules?

### Payment states

Define states for:

- paywall default
- trial started
- checkout loading
- payment success
- payment failed
- restore purchase
- already subscribed
- subscription expired
- cancellation
- manage subscription
- no network
- region/payment method unavailable

### Legal/privacy surface

- Terms link
- Privacy link
- data ownership copy
- cancellation copy
- receipt/invoice handling if relevant

## Required output

Create:

`docs/design/auth_monetization/BATCH_F0_AUTH_MONETIZATION_RESOLUTION.md`

Include:

1. Executive verdict: ready / not ready for visual design
2. Ratified IA ownership
3. Auth journey rules
4. Paywall journey rules
5. Free/Paid boundary
6. Platform split
7. Allowed copy claims
8. Forbidden copy claims
9. Required screens for Batch F defaults
10. Required states for Batch F states
11. Open owner decisions
12. Exact prompt to give Claude Design / Fable after owner approval

## Stop condition

Stop after producing the resolution document.
Do not generate visual design.
Do not implement application code.
