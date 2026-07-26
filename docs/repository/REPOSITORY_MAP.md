# Intensive English repository map

## Sources of truth

| Layer | Source |
|---|---|
| Scientific research | `/Users/galinayanovskaya/Intensive English Research` |
| Educational methodology | `learning_architecture/current/` |
| Learning experience | `learning_experience/` |
| Product architecture | `product_system/v2/` |
| UX decisions | `feedback/2026-07-12_SYNTHESIS_roadmap.md` plus recorded founder decisions |
| Design handoff | `docs/design/project/` |
| Technical implementation | `apps/` and `packages/` |

## Repository structure

- `apps/mobile/` — Expo / React Native application.
- `apps/web/` — Next.js web application and server routes.
- `packages/core/` — shared learning logic and current executable content.
- `packages/tokens/` — shared design tokens.
- `packages/media/` — web/native media adapters.
- `learning_architecture/current/` — current methodology dated 2026-07-14.
- `learning_architecture/translations/ru/` — Russian localizations of current methodology.
- `learning_architecture/archive/` — superseded methodology.
- `learning_experience/` — learner journey and experience orchestration.
- `product_system/v2/` — current product decisions, curriculum, exercises, data and validation model.
- `product_system/v1/` — superseded product architecture.
- `feedback/` — UX audits and synthesis.
- `docs/audits/methodology/` — historical methodology audits and reasoning.
- `docs/design/project/` — structured Claude Design handoff.
- `docs/design/exports/` — downloaded standalone exports.
- `docs/ai_handoffs/` — historical Fable5 and Claude prompts.
- `prototype/` — legacy prototype.

## Governance

1. Research evidence is not a product decision.
2. Methodology defines how learning should work.
3. Learning experience defines how the learner lives through it.
4. Product v2 defines what should be built and validated.
5. Code defines what actually exists today.
6. Archived and AI-generated documents may provide provenance but cannot override a current source of truth.
