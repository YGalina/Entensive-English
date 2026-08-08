# Intensive English — Master Index

> Главная точка входа для владельца продукта, Claude, Codex и Obsidian.

## Начать владельцу здесь

- [Центр управления владельца](00_OWNER_CONTROL_CENTER.md) — текущее состояние, стоп-сигнал, порядок утверждений и следующий gate.
- [Product Kanban](01_PRODUCT_KANBAN.md) — рабочие карточки по колонкам от backlog до Done.
- [Product Roadmap](02_PRODUCT_ROADMAP.md) — этапы разработки и критерии перехода.
- [Risks, dependencies and release](03_RISKS_DEPENDENCIES_RELEASE.md) — риски, зависимости и release gates.
- [Полный план продукта и разработки](docs/owner/PRODUCT_DELIVERY_PLAN.md) — аналитика, программа, контент, UX/UI, инженерия, QA, пилот и релиз.
- [Реестр UX/UI и утверждений](docs/owner/UX_UI_APPROVAL_REGISTER.md) — все области и текущий end-to-end поток с визуальными источниками и статусом реализации.

## Текущая фаза

**Product architecture:** frozen. Изменения — только через ADR или подтверждённый критический дефект.

**Current phase:** visual product design and implementation.

**Current status:** см. [Project State](docs/governance/PROJECT_STATE.md).

## Управляющие документы

- [Product Constitution](PRODUCT_CONSTITUTION.md) — что представляет собой продукт и какие принципы обязательны.
- [Development Constitution](docs/governance/DEVELOPMENT_CONSTITUTION.md) — как Claude, Codex и владелец работают с проектом.
- [Repository Map](docs/repository/REPOSITORY_MAP.md) — фактическая структура и источники истины.
- [Implementation Handoff](docs/governance/IMPLEMENTATION_HANDOFF.md) — последняя передача работы на ревью.
- [Review Log](docs/governance/REVIEW_LOG.md) — журнал решений и проверок.

## Product & learning

- [Integrated Learning Blueprint](integrated_learning_blueprint.md)
- [Learning Architecture](learning_architecture/README.md)
- [Learning Experience](learning_experience/README.md)
- [Product System v2](product_system/v2/README.md)
- [Architecture Resolution](architecture_resolution.md)
- [Architecture Decisions](adr/README.md)

## UX & design

- [Experience Architecture](experience_architecture/01_experience_architecture.md)
- [UX Architecture](experience_architecture/UX_ARCHITECTURE.md)
- [Information Architecture](experience_architecture/03_INFORMATION_ARCHITECTURE.md)
- [User Journeys](experience_architecture/04_USER_JOURNEY_ARCHITECTURE.md)
- [Interaction Architecture](experience_architecture/05_INTERACTION_ARCHITECTURE.md)
- [Screen Specifications](experience_architecture/06_SCREEN_SPECIFICATIONS.md)
- [Pre-visual UX Review](experience_architecture/07_UX_REVIEW_PRE_VISUAL.md)
- [Design workspace](docs/design/README.md)

## Implementation

- `apps/mobile/` — Expo / React Native.
- `apps/web/` — Next.js.
- `packages/core/` — learning logic, protocol, SRS and assessment.
- `packages/tokens/` — shared design tokens.
- `packages/media/` — media adapters.

## Prompts and AI work

- [Prompt Library](docs/prompts/README.md) — approved reusable prompts and links to historical prompts.
- [AI Handoffs](docs/ai_handoffs/README.md) — provenance and earlier prompt artifacts.
- [Review Log](docs/governance/REVIEW_LOG.md) — review outcomes, not chat history.

## Obsidian

Open the repository root as the vault:

`/Users/galinayanovskaya/Intensive English`

Start from this file. Obsidian is a view/editor over the same Git-tracked Markdown files; it is not a second source of truth.
