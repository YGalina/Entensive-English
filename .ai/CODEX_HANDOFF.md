# Codex Project Handoff

**Prepared:** 2026-08-04  
**Purpose:** allow a new Codex task to continue Intensive English without access to the prior ChatGPT/Codex conversation.

## Start command

Use `$intensive-english-orchestrator`. Read this file, then execute the active task in `.ai/SESSION.md`. Do not restart discovery or ask the owner to reconstruct chat history.

## Operating model

- Codex is the single project control plane and the owner's only routine task interface.
- Codex manages Git, engineering, QA, acceptance, project state and bounded delegation.
- Claude Opus / CLI is invoked by Codex for specialist UX, copy, methodology or independent review.
- Claude Design / Fable exclusively owns visual design and visual corrections in the existing `Intensive English дизайн-система` project.
- The product owner approves scope, methodology, UX direction, final visuals and release.
- Git is authoritative. Memoree is cited historical memory. ChatGPT is background only.

## Repository state at handoff

- Repository: `/Users/galinayanovskaya/Intensive English`
- Branch: `codex/stage0-day1-vertical-slice`
- Local governance commit: `4bc9290` (`governance: move project control to Codex`); verify whether it has been pushed before beginning remote-dependent work.
- The branch intentionally contains unrelated untracked Fable HTML downloads and `docs/prompts/design/13_stage0_day1_developer_handoff.md`. Preserve them unless the owner explicitly authorizes classification or removal.
- Frozen product architecture and accepted visual packages remain authoritative.

## Current product gate

Stage 0 Day 1 is implemented and independently reviewed. Automated status recorded before this handoff: mobile TypeScript clean and repository unit suite 162/162. The prompt-14 Fable artifact is stored at `docs/design/exports/stage0-owner-device-correction-v1/` and passed Codex QA for owner visual review. The active gate is product-owner visual approval. The approved artifact must then be implemented before final physical Android UX/UI regression. Do not implement Days 2–7 until this sequence is closed.

### Owner findings already reported

1. After baseline translation responses, the learner receives no visible transition or closure before training begins. Do not reveal correctness in the assessment; provide the approved neutral completion/transition state through Fable.
2. During text entry, typed content was hidden and the keyboard dismissed. Engineering correction `e1f1dbe` added keyboard-safe behavior and stopped whole-screen rerenders on every character; verify on a physical device.
3. After the learner says a phrase, the experience gives no useful feedback about what happened. Check the approved training-feedback contract; do not invent speech analysis or correctness scoring.
4. Three-choice controls do not fit on some screens. Fable must provide responsive 360×800 and 390×844 evidence with usable touch targets.

### Recent evidence

- `7acc9a7` — Claude multi-agent UI/UX QA report.
- `e1f1dbe` — text-input and keyboard behavior correction.
- `ed6b7cc` — Fable correction brief at `docs/prompts/design/14_owner_device_feedback_correction.md`.
- `4bc9290` — Codex single-control-plane governance.

Next execution step: obtain product-owner visual approval or rejection of the inspected prompt-14 package. After approval, Codex implements the accepted artifact; only then does the final physical Android UX/UI regression close the device gate. A limited early Android check of `e1f1dbe` is diagnostic only. Engineering fixes stay in Codex; visual corrections stay in Fable.

## How the project arrived here

1. Market, learning-science and competitor research exposed that the problem was not merely UI but the learning architecture for uneven adult A2–B1/B1 competence.
2. Product, experience, UX, information architecture, journeys, interactions and screen specifications were consolidated and frozen.
3. Living Content became the visual identity. Multiple design batches A–F plus Recovery/Integrity and Stage 0 were produced by Fable, audited by Codex and approved by the owner.
4. Several early design attempts were rejected for excessive text, weak visual hierarchy, cramped controls and leaked internal language. This established the permanent rule that Codex audits visuals but Fable performs every visual correction.
5. Engineering foundation, routing, profile, assessment, daily cycle, summary and Stage 0 Day 1 were implemented through tested Git commits.
6. Training-sufficiency review established that S5 is a valid block but an insufficient whole intensive day. Stage 0 is a manually produced seven-day individual module; broad composite-day architecture remains Draft pending evidence.
7. Project governance and memory were moved into Git and Memoree so the owner no longer carries context between chats.

## Permanent product boundaries

- The product develops vocabulary, chunks/collocations/phrasal verbs, grammar, listening, pronunciation, reading, writing, interaction and spontaneous speaking in a sequenced system.
- The aim is both to build missing language knowledge and repeatedly move it from recognition into productive, transferable use.
- The product is not merely AI conversation, a vocabulary list, therapy, a streak system or a tiny daily lesson presented as an intensive.
- Films, books, podcasts and shadowing are retained as integrated learning inputs, not passive standalone consumption.
- Psychological safety, habit support, coaching and future community/human practice complement learning; they do not replace systematic instruction.
- No unsupported voice analysis, CEFR inference, competence judgment, invisible save/sync, human-listening or future-delivery claims.

## Do not repeat these failures

- Do not make the owner copy prompts or reports between agents.
- Do not respond with another plan when executable work is available.
- Do not create or correct visual design in Codex.
- Do not build web screens by stretching mobile layouts; web receives its own approved scope.
- Do not accept Fable/Claude self-reports without inspecting their actual files or screens.
- Do not restore legacy app behavior: old icon/onboarding, automatic word flow, music, coach upsell, guardians, streaks, levelcheck or obsolete monetization.
- Do not expose internal research or implementation terminology to learners.
- Do not reopen frozen architecture or accepted visuals casually.
- Do not treat absence of correctness feedback during assessment as permission for a confusing transition, or use fabricated scoring during training.

## Required reading by task type

- Always: `.ai/AI_PROJECT.md`, `.ai/AI_RULES.md`, `.ai/SESSION.md`, `.ai/TASKS.md`, `.ai/DECISIONS.md`.
- Product/learning: `PRODUCT_CONSTITUTION.md`, `integrated_learning_blueprint.md`, current methodology package.
- Visual: `docs/governance/VISUAL_DESIGN_WORKFLOW.md`, approved Fable package, relevant prompt and UX/copy contract.
- Engineering: `docs/governance/IMPLEMENTATION_HANDOFF.md`, relevant accepted design package, core contracts and tests.
- Historical uncertainty: use the `use-memoree` skill, then verify against Git.

## Definition of a useful Codex turn

A useful turn produces at least one inspectable result when the task permits it: code, tests, a reviewed artifact, a saved specialist prompt, a verified verdict, a commit, a push or a clearly bounded owner decision. Commentary alone is not completion.
