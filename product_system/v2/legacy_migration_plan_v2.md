# План миграции легаси · v2

Дата: 2026-07-13 · (PHASE 11 доп.) Обновляет v1-миграцию под пересмотренные уровни. Классы: KEEP·REFACTOR·REMOVE·BUILD·VALIDATE-FIRST.

## Изменения относительно legacy_migration v1
| Пункт | Было v1 | Стало v2 | Почему |
|---|---|---|---|
| Chunk-контент | «единица=chunk» REFACTOR | REFACTOR: **добавить многословные единицы наряду со словом** (таксономия v2), не заменять | I1 понижен |
| 4/3/2 | BUILD (центральный) | BUILD как ОДНА техника fluency, VALIDATE-FIRST на сформ. фреймах | I4 понижен |
| Стрик | REMOVE все | REFACTOR: непунитивная consistency; убрать «подряд/сгорит», не «всё» | I6 понижен |
| Тренер-резюме после | BUILD (инвариант) | BUILD как ДЕФОЛТ; immediate prompts в controlled practice тоже допустимы | I3 понижен |
| Free AI chat | (не было) | VALIDATE-FIRST (структурировать) | Phase 5 |
| «Сказать своё» | REDESIGN (лесенка) | REDESIGN + варианты лесенки по уровню/объекту | Phase 5 |
| Стражи | REDESIGN (триггер) | REDESIGN + границы (Phase 9): метафора keep, терапию не имитировать | Phase 9 |
| LearningObject | REFACTOR (единый) | REFACTOR: **разделить 7 сущностей** (канон/состояние/событие/…) | Phase 7 |
| levelcheck | REDESIGN | REDESIGN v3 + untrained transfer items | Phase 8/10 |

## KEEP (позвоночник)
FSRS (направленно), storage local-first, журнал событий, вечерний круг v2, честные часы, перевод по тапу, i18n, YouTube-поиск, Библиотека, музыка-фон, приватность.

## REFACTOR
packs→контент разных типов (не только слово); контекст→связный отрывок; dayplan→DayCycle+SkillCatalog+mood-влияние; Word/Card/Artifact→7 сущностей (вью-агрегат→БД); web-shell убрать имя; consistency вместо стрика; retrievalMs+стабильность вместо reps-порога.

## REMOVE
3-минутка; дыхание/ботаника остатки (сделано в session, проверить); стрик-«подряд»/огонёк; роли/produce/three как top-level.

## BUILD
Лесенка «сказать своё»; wire feedbackFor + тренер-резюме; страж-в-момент (в границах Phase 9); levelcheck v3; web-Мастерская; Прогресс/карта; входы pricing/login; пуши/письма; диалог с персонажем; task repetition; return-route; интегрированный микро-юнит (срез).

## VALIDATE-FIRST (не строить в полную, сперва проверить)
4/3/2; структурированный AI-диалог; формат стражей; навигация по режимам; баланс вход:выход; chunk-vs-слово выход.

## Принцип
Расширять поверх позвоночника, зелёные проверки, web не ломается. Порядок — roadmap_v2.
