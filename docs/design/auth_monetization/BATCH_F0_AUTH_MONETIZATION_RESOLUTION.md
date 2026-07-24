# Batch F0 · Auth & Monetization Architecture Resolution

Status: Ratified for Batch F v1 visual design · Date: 2026-07-24
Branch: `codex/recovery-integrity-freeze`
Role: Principal Product Architect / monetization / privacy / UX systems
Prompt: `docs/prompts/design/11_batch_f0_auth_monetization_resolution.md`

This is an architecture-and-rules resolution. No visual design, no HTML, no code. It exists because `S25 Subscription / Paywall` is `[PLAN]` and Screen Specifications forbid handing it to visual design until its IA ownership and honesty rules are ratified.

## Sources actually read

`.ai/AI_PROJECT.md` · `.ai/AI_RULES.md` · `.ai/SESSION.md` · `PRODUCT_CONSTITUTION.md` · `06_monetization.md` · `17_platform_architecture.md` · `experience_architecture/03_INFORMATION_ARCHITECTURE.md` · `04_USER_JOURNEY_ARCHITECTURE.md` · `05_INTERACTION_ARCHITECTURE.md` · `06_SCREEN_SPECIFICATIONS.md` · `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`. Frozen Batch A–E packages consulted via the design index. No missing file is claimed as read.

Two source conflicts with the frozen Constitution were found and are resolved below (Constitution wins): the **streak** in the Free tier and the **outcome guarantee** wording in `06_monetization.md`.

---

## 1. Executive verdict — ready / not ready

**Ratified split verdict.**

- **Auth / account / identity / privacy entry points / profile ownership — READY** for Batch F visual design. Rules are fully ratifiable from existing frozen sources and are ratified in §3 and §2.
- **Subscription / Paywall (S25) — READY for Batch F v1 defaults** under the ratified owner defaults in §11A. Paywall states still require a separate Batch F states pass after default-screen review.

**Consequence:** Batch F can start on Auth + v1 Paywall defaults. It must not show PRO/guarantee/group intensive, must not use trial copy, and must treat mobile payment as status/management handoff only until IAP is separately scoped.

---

## 2. Ratified IA ownership

Consistent with `03_INFORMATION_ARCHITECTURE.md` (one authoritative owner per state; Profile owns preferences/privacy; projections cannot write truth):

| Concern | Authoritative owner | Notes |
|---|---|---|
| Account identity, auth method, sign-in/out | **Account** (system layer) | New object introduced by this resolution; entry points surfaced via S20. |
| Subscription entitlement (is-paid, plan, expiry) | **Billing/Entitlement** (system layer) | Backed by store/payment provider receipts; app reads, never fabricates. |
| Entry points to account + payment + privacy/terms | **S20 Profile** | Confirmed by spec S20 ("авторизация/оплата — входы [PLAN]"). S20 owns the *entrances*, not the billing truth. |
| Privacy status, reminder contract, preferences | **S20 Profile** | Unchanged from IA. |
| What is locked/unlocked | **Billing/Entitlement** read by **Path (projection)** | Path may *reflect* a locked step; it must not gate learning truth or fake progress (IA invariant). |
| Course progress / evidence | **Scheduler/Daily Engine · Protocol** | Payment never writes progress or evidence. A paywall must never appear inside assessment or alter evidence. |

**Ratified:** S20 Profile becomes the single owner of the auth/payment/privacy **entry points**. Billing entitlement is a separate authoritative system state; the paywall (S25) reads it and never becomes a second source of progress truth.

---

## 3. Auth journey rules (ratified)

| Question | Ratified rule |
|---|---|
| Sign-in required before first value? | **No.** First run is **anonymous-local**. The Free method demo must be feelable without an account (matches "Free lets the learner feel the method" and the local-only vertical slice). Account is offered at a continuation/sync/purchase boundary, never as a wall. |
| Methods in v1 | **Apple, Google, email magic-link.** Anonymous-local is the default first-run state. |
| Email/password | **Rejected for v1.** Magic-link only; no password handling (aligns with existing "пароль не нужен" sources and the platform rule against Claude/app handling passwords). May be reconsidered later via decision, not now. |
| First launch | Anonymous-local → S2 Recognition → S3 Profile Entry → Path (no auth wall). |
| Returning user | S1 Resume Router. Account-bound → restore entitlement + cross-device progress. Local-only → continue on device. |
| Magic-link fails / expires | Stay signed-out; offer resend / change address / alternate method; **local progress is never lost**. Dedicated failed/expired state required. |
| Account exists on another device | Sign-in restores account-bound data. **No silent second identity**; promise of preservation only when a confirmed restore source exists (inherits S1 data-integrity rule from `recovery-integrity-v1`). Be explicit about what transfers. |
| Local-only vs account-bound | **Local:** drafts, in-progress step, device settings, private voice artifacts (never uploaded for analysis). **Account-bound:** subscription entitlement, cross-device progress (Phase C journal), profile. Voice stays private by default on both. |

---

## 4. Paywall journey rules (ratified honesty; timing constrained)

- **Where the paywall may appear:** only **after** the learner has felt the method (at minimum the free demo cycle is available/experienced), at a natural *continuation* boundary — e.g., asking for a second/personalized pack or library depth. Reachable any time from S20 Profile.
- **Where it must never appear:** inside the assessment protocol (S7–S13), mid-session, blocking voice, blocking data export/finalization, or as a launch/interstitial wall. Payment never gates the learner's own data or the honesty of assessment.
- **On refusal:** Path **continues in a limited free mode** (one pack), not a hard stop; no guilt, no nag loop, no fake urgency. The free mode remains available "навсегда".
- **Cancellation:** safe, non-punitive, reversible; treated as a completed safe exit (spec S25). Access remains until the paid period ends, then reverts to free. No "мы скучаем" retention manipulation.
- **Data ownership:** her data remains hers on cancel/expire/refund; nothing is deleted as leverage.

---

## 5. Free → Paid boundary (ratified, with one Constitution correction)

**Free (v1):**
- One **full demo cycle** (~150-word pack, complete flow: priming → encounter → retrieval → production) so the learner feels the massive-input effect.
- One general context pack (frequency core / everyday).
- Basic honest process stats (hours, "what I can" by evidence class).
- **CORRECTION (Constitution wins):** `06_monetization.md` lists "стрик" in Free. **Rejected.** No streaks anywhere (Constitution §1 non-goals, §4 forbidden claims, design firewall). Free stats are honest process facts only.

**Never blocked (hard invariants):**
- The core method demo; voice privacy; her data and its export; safe cancellation; assessment honesty; the "one next step" experience in limited mode.

**Can be locked (paid):**
- Additional context packs; profession/interest personalization; full shadowing library and texts; all session formats and long intensive programs; deeper statistics; dark/Focus theme convenience; offline (later).

**Locked-state copy rule:** locked states explain the exchange plainly ("это в подписке «Интенсив»"), never shame, never imply the learner is failing or "behind".

**Lead-magnet caveat:** the "vocabulary-size test" lead magnet (06 §5) is a **landing/marketing** tool. It must **not** set an in-product CEFR level or gate anything (Г-1 entry by observable profile; CEFR-inference firewall). In-product entry stays S3 five-signs.

---

## 6. Platform split (ratified default; one open decision)

Per `17_platform_architecture.md` (mobile = ritual/voice; desktop/web = depth; payment web/desktop primary, "mobile IAP позже"):

- **Web/desktop:** primary checkout and subscription management surface for v1.
- **Mobile IAP:** not implemented in v1 per platform doc.
- **Ratified safe default while mobile IAP is absent:** mobile v1 does **not** present in-app purchase buttons for subscription-gated content, and does **not** hard-gate the core method. Mobile may show subscription **status** (read-only) and route account/subscription management to the owned S20 entry (informational). Mobile must not embed store-rule-violating "buy on our website" steering inside the iOS/Android app.
- **Open (owner + legal, §11):** whether v1 ships mobile IAP or stays web-checkout-only, and the exact store-compliant presentation on mobile. This is the single largest gate on the paywall surface.
- **Providers (from 06, to validate):** RU — ЮKassa / СБП / Telegram Payments; world — Stripe / Paddle, region-selected.

---

## 7. Allowed copy claims (mechanism, not effect — Г-4)

- Access/scale/personalization facts: «все контекст-паки», «персонализация под профессию/интересы», «полная библиотека shadowing», «все форматы сессий и длинные интенсивы», «глубокая статистика».
- Honest pricing patterns (canon from Batch A copy library and 06): «напоминание до списания», «отмена в два тапа», «без таймеров скидок», «бесплатный режим остаётся навсегда», «год выгоднее».
- Product premise: «Спокойный путь от "понимаю, но молчу" к живой речи» (mechanism framing, no timeframe).
- Value framing: "продаём режим и поддержку, а не чудо".

## 8. Forbidden copy claims

- «Свободно за N недель» / any timeframe-to-fluency.
- «Станешь свободно говорить, если оплатишь» / payment → transformation.
- Any CEFR level promised or inferred from payment or activity.
- **«+N слов в пассив / выход на бытовую речь» as an app-only guaranteed outcome** — CORRECTION: `06_monetization.md` §4 guarantee wording is a claim above the realized evidence class. Allowed **only** as a service-level risk-reversal (refund/extension if the tracked regime was followed) attached to a **separate human-backed PRO product**, and even then it must not promise CEFR/fluency (Г-4: до данных — механизм, не эффект). Outcome numbers require validation data before they may be stated.
- Streaks, "N подряд", guilt, fake urgency/scarcity, discount countdowns, "мы скучаем" dark patterns.
- Learner-facing research/internal terms (design firewall): pilot, vertical slice, artifact, evidence, holdout, SRS, percent-of-course, guardians, speech scoring, accent judgement, cloud/sync claims.

---

## 9. Required screens for Batch F defaults

Auth sub-scope (READY to design):
1. **F-A1 Sign-in method choice** — Apple / Google / email magic-link; entered from continuation/purchase boundary or S20. (Legacy reference: old auth screens; must be redrawn in Living Content, Galina not in-app.)
2. **F-A2 Email magic-link entry** — address input, no password.
3. **F-A3 Magic-link sent** — check-your-email, resend, change-address.
4. **F-A4 Returning sign-in** — restore account-bound data.
5. **S20 Profile · Account & Payment section** — owned entry points to account, subscription, privacy/terms, data ownership, cancellation. (Section within existing S20, not a new nav destination.)

Paywall sub-scope (design ONLY after §11):
6. **S25 Paywall default** — honest value proposition + plans (composition depends on §11: trial y/n, PRO show/hide).
7. **S25 Manage subscription** — plan, next charge, receipts, cancel-in-two-taps.

Legal/privacy surface (READY): Terms link · Privacy link · data-ownership copy · cancellation copy · receipt/invoice handling — surfaced from S20, not a standalone tour.

---

## 10. Required states for Batch F states

Auth states (READY): magic-link sent · magic-link failed/expired · returning restore · account-exists-other-device · sign-out · offline/no-network on auth · provider error (Apple/Google).

Paywall/payment states (design after §11): paywall default · trial started (if trial ratified) · checkout loading · payment success · payment failed · restore purchase · already subscribed · subscription expired · cancellation (safe, non-punitive) · manage subscription · no network · region/payment-method unavailable · **premium-locked** (honest, non-guilt) · **free-continues-limited** (Path continues in one-pack mode).

---

## 11. Open owner decisions (must resolve before S25 visual design)

| # | Decision | Why it matters | Recommendation |
|---|---|---|---|
| FD-F1 | Trial (3–7 days full access) vs pure freemium | Changes paywall composition and states (06 §7 open) | A/B later; ship **pure freemium** default v1, trial as a test |
| FD-F2 | Show or hide **PRO (guarantee)** and **Group Intensive** in v1 | PRO implies human-backed ops + a defensible guarantee; not built yet | **Hide** from v1 self-serve paywall until human-backed operations and validated claims exist |
| FD-F3 | Guarantee wording (offers skill) | Must pass Г-4; app-only outcome guarantee is forbidden | Only as service risk-reversal on a human-backed PRO; no CEFR/fluency; needs validation data |
| FD-F4 | **Mobile IAP in v1** vs web-only checkout (+ store anti-steering legal review) | Determines whether mobile shows a real paywall at all | **Web-checkout v1**, mobile status-only, until IAP scoped; confirm store compliance |
| FD-F5 | Exact Free thresholds (one pack? demo days?) | Defines the free/paid line and locked states (06 §7 open) | One full demo cycle + one pack; validate |
| FD-F6 | Price validation (Van Westendorp) + RU/world provider split | Prices are hypotheses (06) | Validate before launch; providers per region |
| FD-F7 | Confirm anonymous-local first-run is acceptable | Affects auth journey and account binding point | Recommended **yes** (matches slice + freemium premise) |

Resolved by Constitution (not owner-open): **no streak in Free**; **no app-only outcome guarantee**; **no CEFR from payment/activity**; **vocabulary test is landing-only, sets no in-product level**.

## 11A. Owner-ratified Batch F v1 defaults

The following defaults are ratified for Batch F visual design v1:

| Decision | Ratified v1 default |
|---|---|
| FD-F1 Trial | **Pure freemium** in v1. No trial screens or trial copy in Batch F defaults. Trial may be tested later. |
| FD-F2 PRO / Group Intensive | **Hidden** from self-serve v1 paywall. Do not show guarantee, PRO, cohorts, group intensive or high-ticket products in Batch F defaults. |
| FD-F3 Guarantee | **No app-only guarantee.** No outcome guarantee, CEFR, fluency, word-count result promise or timeframe promise in self-serve payment UI. |
| FD-F4 Mobile payment | **Web-checkout / account-management primary.** Mobile shows subscription status/locked state/management entry only; no mobile IAP button unless separately scoped. Avoid store-rule-violating steering copy. |
| FD-F5 Free threshold | **One full demo cycle + one general context pack.** Free mode remains available; additional packs/personalization/library depth are paid. |
| FD-F6 Prices/providers | Use existing price hypotheses only as placeholders if needed; mark as subject to validation. Do not over-design provider-specific checkout. |
| FD-F7 Anonymous-local first run | **Yes.** First value before account. Account offered at continuation/sync/purchase/profile boundary. |

These defaults allow Batch F visual design to include Auth + v1 Paywall defaults. They do not authorize implementation or payment-provider integration.

---

## 12. Exact prompt to give Claude Design / Fable after owner approval

> Execute `docs/prompts/design/12_batch_f_auth_monetization_visual_design.md` for Batch F v1 defaults: Auth + Profile Account/Payment + v1 Paywall defaults. Use the ratified defaults in §11A. Deliver default screens only, then stop for owner visual review and Codex QA. Do not create state sheets yet.

---

*Stop condition met: resolution produced; no visual design, no HTML, no application code. S25 is ratified for Batch F v1 defaults under §11A; state sheets and implementation remain separate tasks.*
