# Intensive English — product roadmap

## Stage gates

| Phase | Результат | Состояние | Следующий gate | Финальное решение |
|---|---|---|---|---|
| 0. Product foundation | Конституция, learning architecture, UX architecture | Завершено / frozen | Изменения только через ADR | Галина утверждает изменение концепции |
| 1. Stage 0 methodology | Семидневная индивидуальная программа | Исходники Дней 1–7 есть | Независимая methodology QA | Галина принимает методику |
| 2. First-run + Day 1 UX | Полный flow со всеми состояниями и текстами | Не принят | Fable 5 + единый Figma canvas | `УТВЕРЖДАЮ UX/UI` |
| 3. Day 1 engineering | Работающая mobile-сборка утверждённого flow | Частично реализовано / не принято | Исправить только после phase 2 | `ПРИНИМАЮ СБОРКУ` |
| 4. Days 2–7 production | Контент, UX/UI и код остальных дней | Не начато как продуктовый flow | По одному дню через те же gates | Отдельное принятие каждого дня/пакета |
| 5. Stage 0 pilot | 5–8 learners, retention/transfer/workload | Не начат | Consent, protocol, measurement | Галина разрешает пилот |
| 6. Beta foundation | Recovery, progress, library, accounts, backend | Частичные design sources | Scope после результата Stage 0 | Отдельные product/UX/UI gates |
| 7. Beta QA | Цельный продукт, privacy, analytics, support | Не готово | Release readiness | `ПРИНИМАЮ BETA` |
| 8. Release | Stores/distribution/monitoring | Не готово | Release dossier | `РАЗРЕШАЮ РЕЛИЗ` |

## Workstreams

| Workstream | Owner исполнения | Owner решения | Активен сейчас |
|---|---|---|---|
| Product & scope | Codex prepares; Opus may review | Галина | Да |
| Methodology & curriculum | Specialist analysis coordinated by Codex | Галина | Да |
| UX & copy | Opus/Fable brief coordinated by Codex | Галина | Да |
| Visual UI | Fable 5 | Галина | Да |
| Engineering & Git | Codex | Галина approves scope/build | Заморожено до UX/UI approval |
| QA & acceptance | Codex + physical device | Галина | После implementation |
| Pilot & research | Codex prepares protocol | Галина | Нет |
| Release | Codex prepares readiness | Галина | Нет |

## Definition of Ready

Карточка может перейти в Engineering только если:

- есть связанный product/method contract;
- нарисованы default и required states;
- определены переходы каждой кнопки;
- есть 360×800, 390×844 и 200% evidence;
- Codex проверил package;
- в реестре записано явное `УТВЕРЖДАЮ UX/UI` Галины.

## Definition of Done

- код соответствует утверждённому Figma package;
- unit/type/accessibility checks прошли;
- собрана отличимая QA build identity;
- flow пройден на физическом Android;
- дефекты закрыты или приняты;
- Галина сказала `ПРИНИМАЮ СБОРКУ`.
