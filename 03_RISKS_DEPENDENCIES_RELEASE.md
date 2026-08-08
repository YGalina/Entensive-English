# Intensive English — risks, dependencies and release

## Active risks

| ID | Риск | Вероятность / влияние | Mitigation | Owner | Статус |
|---|---|---|---|---|---|
| R1 | Разрозненные экраны создают непонятный продуктовый flow | High / Critical | Один Figma canvas и end-to-end approval | Codex + Fable 5 | Open |
| R2 | Реализация начинается до финального решения владельца | High / Critical | Kanban owner gate + Definition of Ready | Codex | Controlled |
| R3 | Stage 0 недостаточен как интенсив | Medium / Critical | Независимая QA всей 7-day программы и pilot evidence | Methodology | Open |
| R4 | Отсутствует честная voice analysis pipeline | High / High | Не заявлять voice scoring; проверять только текст | Engineering/UX | Controlled |
| R5 | Android Expo Go скрывает native icon/build identity | High / Medium | Отдельная native delivery plan перед beta | Engineering | Open |
| R6 | Figma Starter MCP limit тормозит автоматическую сборку | High / Medium | Продолжить после reset/upgrade; не выдавать partial file за approval-ready | Codex | Open |
| R7 | Legacy surfaces могут вернуться в product flow | Medium / Critical | Route containment + copy firewall + regression | Engineering | Controlled |

## Critical dependencies

| Deliverable | Блокирует | Нужен от |
|---|---|---|
| Methodology QA Days 1–7 | production Days 2–7, pilot | methodology reviewer |
| Fable 5 full first-run/Day 1 package | engineering correction, Android acceptance | Fable 5 |
| Owner `УТВЕРЖДАЮ UX/UI` | all new learner-facing implementation | Галина |
| Approved content/audio package | reliable daily experience | content/audio production |
| Physical Android acceptance | Stage 0 pilot | Галина + Codex QA |

## Release gates

- [ ] Complete product scope for release is named.
- [ ] Every included flow has owner-approved Figma UX/UI.
- [ ] Privacy/data/storage behavior is documented and verified.
- [ ] Native Android/iOS build identities and update path exist.
- [ ] Accessibility and device matrix pass.
- [ ] Analytics and failure monitoring are approved and working.
- [ ] Support, rollback and incident path exist.
- [ ] Store assets and product copy are approved.
- [ ] Owner decision: `РАЗРЕШАЮ РЕЛИЗ`.
