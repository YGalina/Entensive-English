# Collaboration contract

## Authority

| Role | Owns | Must not do |
|---|---|---|
| Product owner | Scope, methodology, UX direction, visual approval, release | Act as courier between agents |
| Codex | Orchestration, Git, engineering, QA, acceptance, task state, specialist dispatch | Create or apply visual design |
| Claude Opus / CLI | Bounded UX, copy, methodology analysis and independent review | Run a parallel backlog or declare its own work accepted |
| Claude Design / Fable | All visual design and all visual corrections in the existing design-system project | Reopen frozen behavior or methodology |
| Memoree | Cited durable historical recall | Replace current Git or specifications |

## Owner working preferences

- Use Russian and lead with the outcome.
- Act instead of repeatedly explaining the plan.
- Give a prompt only when another tool genuinely must perform the work; otherwise execute in Codex.
- Do not ask the owner to shuttle files, reports or prompts between Codex and Claude when local orchestration is available.
- Avoid repeated permission lectures. Use the required approval mechanism only for a real external, destructive or security boundary.
- Show inspectable work: commit, diff, tests, screen, runtime path or exact saved prompt.
- Continue after a passed gate instead of stopping ceremonially. Ask only for decisions that change the product or require owner taste.
- Never take over visual design. Fable is the creative authority, including corrections.

## Dispatch contract

Before dispatching Claude or Fable, save or identify:

1. exact branch/ref;
2. authoritative inputs;
3. bounded output path;
4. required work;
5. forbidden work;
6. acceptance criteria;
7. stop gate.

After delivery, inspect the actual artifact. A creator report is not acceptance evidence.

## Design workflow

1. Codex derives a bounded design brief from frozen methodology, UX, copy and states.
2. Fable creates or corrects visuals in the existing `Intensive English дизайн-система` project.
3. Codex performs read-only logic, copy, accessibility, state-coverage and implementation QA.
4. The owner judges the visual result.
5. Fable applies any visual correction.
6. Codex implements only the approved artifact and runs device/runtime QA.

Codex may specify a defect and functional constraint but never replacement composition, styling or aesthetic taste.

## Engineering workflow

1. Resolve current accepted source and branch.
2. Implement the smallest vertical slice.
3. Add automated checks for contracts and regressions.
4. Verify target viewport/device behavior when UI is involved.
5. Run independent review for material changes.
6. Correct engineering findings directly; route visual findings to Fable.
7. Commit, push and update the project state when the gate is closed.

## Product lessons retained from prior work

- Intensive English is not a collection of short screens. A day must provide credible training volume, sequencing and transfer.
- S5 is a valid training block but not a sufficient complete intensive day; Stage 0 tests a manually assembled seven-day individual module before a runtime composer is authorized.
- The product is individual learning, not group instruction. Community and human practice are later complementary layers, not the Stage 0 teaching format.
- Living Content is the accepted visual identity. Early text-heavy, low-expression redesigns were rejected even when logically complete.
- Assessment and training differ: assessment does not reveal correctness item by item; training must provide the approved feedback and truthful next state.
- Learner copy must not leak research terms such as pilot, protocol, vertical slice, target unit or internal IDs.
- Runtime behavior must match the approved product, not the legacy prototype. Old icon, old onboarding, automatic word flow, music and coach upsell are not current product authority.

## Git and memory

- Preserve unrelated untracked downloads and owner work.
- Commit only bounded task files.
- Never call a Fable export or chat result authoritative before storing and reviewing it in Git.
- Query Memoree for historical decisions only; cite results and verify them against current source.
- Record only durable decisions and outcomes in Memoree, never credentials, transcripts or routine progress.
