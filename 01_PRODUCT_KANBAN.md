---
kanban-plugin: board
kanban-plugin-settings:
  show-checkboxes: true
  lane-width: 360
  new-card-insertion-method: append
  show-relative-date: true
---

## BACKLOG

- [ ] Stage 0: production-ready content package для Дней 2–7 #content
- [ ] Спроектировать Days 2–7 после принятия Дня 1 #ux #fable
- [ ] Recovery end-to-end owner review #ux
- [ ] Progress / Words / Artifacts end-to-end owner review #ux
- [ ] Library / Reader / Shadowing end-to-end owner review #ux
- [ ] Auth / Account / Payment: provider, privacy и pricing decisions #product
- [ ] Отдельный UX/UI и scope для web #web
- [ ] Backend/data plan после Stage 0 #backend

## DISCOVERY · МЕТОДИКА

- [ ] Независимая методическая QA всей семидневной Stage 0 программы #methodology #critical
- [ ] Проверить дозировку, sequence, retrieval, production и transfer Дней 1–7 #methodology
- [ ] Проверить права и готовность текстов/аудио Stage 0 #content #rights
- [ ] Закрыть open content decisions перед производством Дней 2–7 #owner-gate

## UX · FABLE 5

- [ ] Единый flow первого запуска → оценка → День 1 → feedback → completed Path Hub #critical #fable
- [ ] Нарисовать понятное объяснение продукта до оценки #fable
- [ ] Переписать и нарисовать понятное завершение 28 ответов #fable
- [ ] Нарисовать явные full 30 мин / short 16 мин действия #fable
- [ ] Нарисовать Path Hub после полного и короткого завершения #fable
- [ ] Собрать все существующие и новые экраны на одном Figma canvas #figma

## РЕШЕНИЕ ГАЛИНЫ

- [ ] `УТВЕРЖДАЮ UX` — полный первый flow, тексты и переходы #owner-gate
- [ ] `УТВЕРЖДАЮ UX/UI` — единый Figma package #owner-gate #blocked
- [ ] Решение по полной методике Stage 0 после независимой QA #owner-gate

## READY FOR ENGINEERING

- [ ] Пусто: новые пользовательские экраны запрещены до `УТВЕРЖДАЮ UX/UI` #blocked

## ENGINEERING

- [ ] Исправить completed-Day-1 loop по утверждённому Fable state #mobile #blocked
- [ ] Реализовать approved onboarding/orientation package #mobile #blocked
- [ ] Выпустить свежую QA identity/reset после реализации полного flow #android #blocked

## QA · DEVICE

- [ ] Полный Android regression первого запуска и Дня 1 #android #blocked
- [ ] Full + short routes, resume, feedback, completed state #qa #blocked
- [ ] Keyboard, 200% text, screen reader, microphone lifecycle #accessibility #blocked
- [ ] `ПРИНИМАЮ СБОРКУ` — финальное решение Галины #owner-gate #blocked

## DONE

- [x] Product Constitution и architecture frozen #product
- [x] Stage 0 methodology source Days 1–7 written #methodology
- [x] Living Content visual identity accepted #design
- [x] Brand `ie` icon accepted and implemented #brand
- [x] Stage 0 Day 1 partial implementation #mobile
- [x] S14 written feedback correction implemented #feedback
- [x] Path Hub week header correction implemented #mobile
- [x] Owner control center and approval register created #governance
- [x] Figma owner-review file created #figma

## BLOCKED

- [ ] Figma one-canvas arrangement: Starter MCP limit reached #figma
- [ ] Missing visual screens: require Fable 5 output and owner approval #fable
- [ ] Final Android acceptance: blocked by unapproved complete UX/UI #android

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false,false,false,false,false],"show-checkboxes":true,"lane-width":360,"new-card-insertion-method":"append","show-relative-date":true}
```
%%
