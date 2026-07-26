# Intensive English

Monorepository for a learning system that helps adults move from receptive knowledge to accurate, fluent, independent English use.

## Read first

The concise repository map and source-of-truth rules are in [`docs/repository/REPOSITORY_MAP.md`](docs/repository/REPOSITORY_MAP.md).

Current layers:

1. **Scientific research** — `/Users/galinayanovskaya/Intensive English Research` (external corpus).
2. **Educational methodology** — [`learning_architecture/current/`](learning_architecture/current/).
3. **Learning experience** — [`learning_experience/`](learning_experience/).
4. **Product architecture** — [`product_system/v2/`](product_system/v2/).
5. **UX and design** — [`feedback/`](feedback/) and [`docs/design/project/`](docs/design/project/).
6. **Technical implementation** — [`apps/`](apps/) and [`packages/`](packages/).

Historical Fable5 and Claude prompts are kept in [`docs/ai_handoffs/`](docs/ai_handoffs/). They are provenance, not current specifications.

## Applications

- `apps/mobile` — Expo / React Native mobile application.
- `apps/web` — Next.js web application and server routes.
- `packages/core` — shared learning logic, assessment, SRS, planning, and executable content.
- `packages/tokens` — shared visual tokens.
- `packages/media` — speech, recording, and ambient-media adapters.

## Current curriculum and exercises

- Curriculum: [`product_system/v2/curriculum_blueprint_b1_b2_v2.md`](product_system/v2/curriculum_blueprint_b1_b2_v2.md).
- Content and syllabus: [`product_system/v2/content_selection_and_syllabus_v2.md`](product_system/v2/content_selection_and_syllabus_v2.md).
- Exercise architecture: [`product_system/v2/exercise_architecture_v2.md`](product_system/v2/exercise_architecture_v2.md).
- Executable content and mechanics: `packages/core/data/` and `packages/core/*.ts`.

Product v2 is intentionally frozen pending founder decisions and validation of the smallest integrated learning unit. Do not treat an unimplemented document as proof that a feature exists; inspect `apps/` and `packages/` for implementation reality.

## Development

Install dependencies:

```bash
npm install
```

Web:

```bash
npm run web:dev
npm run web:lint
npm run web:build
npm run test:e2e
```

Mobile:

```bash
npm run mobile:start
npm run mobile:ios
npm run mobile:android
```

Core tests:

```bash
npm run test:unit
```

Before changing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` as required by `AGENTS.md`.
