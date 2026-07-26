# План миграции легаси

Дата: 2026-07-13 · (TASK 8, часть) Правило брифа: где легаси конфликтует с методикой — НАЗВАТЬ, не сохранять молча.
Классы: KEEP · REFACTOR · REMOVE · BUILD.

## Конфликты легаси ↔ методика (полный список)
| # | Легаси (код) | Конфликт с методикой | Действие |
|---|---|---|---|
| C1 | `data/packs.ts` — единица = одиночное слово | инвариант: единица = **chunk** [R] | REFACTOR (chunk-контент) |
| C2 | `session.tsx` фаза 3 — склейка чужих example-фраз | контекст должен быть связным (массив+контекст = один блок) | REFACTOR |
| C3 | «сказать своё» — прыжок без лесенки | нужна лесенка модель→…→ретрай→ОС [R] | REDESIGN |
| C4 | `feedback.ts feedbackFor()` написан, НЕ подключён | вывод без ОС = половина эффекта [R] | BUILD (wire) |
| C5 | `dayplan.ts` — день = 8 hidden-модулей | один цикл, не расписание предметов | REFACTOR (DayCycle vs SkillCatalog) |
| C6 | `ie_evening_mood` пишется, dayplan не читает | обещанная адаптация — фикция | FIX (mood→завтра) |
| C7 | GuardianCard всегда на «Сегодня» | страж по триггеру в момент трения [R/19] | REDESIGN |
| C8 | levelcheck 18 слов узнавание | рецептив переоценивает продукцию; нужна двойная шкала | REDESIGN |
| C9 | стрик/огонёк остаточные | engagement≠proficiency; shame-loop ЦА [R] | REMOVE |
| C10 | «Галина» в web shell/Today | решение: Галина только лендинг/письма | REFACTOR (displayName) |
| C11 | `/produce`,`/roles`,`/three` как экраны | слить в фазы/форматы | REMOVE-as-screen |
| C12 | медитация/дыхание/ботаника | Лозанов-догма устарела; пользователи против | REMOVE (сделано в session; проверить остатки) |
| C13 | web-«Мастерской» нет; grammar/writing/typing врозь | deep-work дом на web | BUILD |
| C14 | «Прогресс» нет в навигации; /program сирота | capabilities = ядро мотивации | BUILD |
| C15 | /pricing,/login без входов | конверсия/вход осиротели | BUILD (входы) |
| C16 | Word+Card+Artifact расщеплены | нужен единый LearningObject для сквозных потоков | REFACTOR (вью-агрегат) |

## KEEP (позвоночник — не трогать)
FSRS-движок (recognize+produce направления), storage-adapter (local-first), журнал событий (Фаза C), вечерний круг v2, честные часы, перевод по тапу/слой, i18n ru/en, YouTube-поиск, Библиотека-каталог, музыка-фон, приватность private-by-default.

## REFACTOR (сохранить, переосмыслить)
packs→chunk-модель (C1); контекст-фаза→связный отрывок (C2); dayplan→DayCycle+SkillCatalog (C5,C6); Word/Card/Artifact→LearningObject-агрегат (C16); web-shell убрать имя (C10); Horizon→capabilities наверх.

## REMOVE
3-минутка (C11); дыхание/ботаника/медитация остатки (C12); стрик-«подряд»/огонёк (C9); роли/produce как top-level экраны (C11, движки сохранить внутри фаз).

## BUILD (новое, чего требует методика)
Лесенка «сказать своё» (C3); wire feedbackFor + тренер-резюме (C4); страж-в-момент (C7); levelcheck v3 (C8); web-Мастерская (C13); Прогресс+карта пути (C14); входы pricing/login (C15); пуши/письма-зов; диалог с персонажем (AI-ход); 4/3/2 fluency; return-route «вернуться с 5 минут»; chunk-контент-конвейер; месячный срез speaking.

## Принцип миграции
Не переписывать разом. Расширять поверх позвоночника (srs/output/dayplan/storage). Каждая правка — зелёная по проверкам (tsc mobile+web, unit, build, e2e, expo export), web не ломается. Порядок — implementation_roadmap_v1.md.
