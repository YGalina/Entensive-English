# Аудит Screen Specifications

## Executive Summary

`06_SCREEN_SPECIFICATIONS.md` существенно конкретизирует протокол: разделяет pretest/trained/new-context/holdout, показывает двойной gate 14 sessions + 14 days, выделяет explicit finalization, сохраняет read-only repeated final export и честно отделяет письменный результат от приватного голосового артефакта.

В текущем виде спецификация ещё не готова быть прямым входом для визуального дизайна и реализации. Обычная curriculum session не имеет минимального completion contract, хотя её счётчик открывает assessment; Recovery может стать логически незавершаемым при отсутствии due-items; partial export представлен как состояние канонического Export до финализации; потеря локального store ошибочно маршрутизируется как новый пользователь при обещании сохранности evidence; удаление assessment artifacts не согласовано с immutable evidence. Дополнительно несколько экранных состояний не соответствуют фактической зрелости или остаются неполными.

## Critical Issues

### 1. Daily Session не отделяет Safe Exit от curriculum completion

**Problem**

S5 разрешает выход в любой момент, но, в отличие от Recovery, не определяет минимальное содержимое для `session-completed`. Событие completion увеличивает одну из 14 curriculum sessions и участвует в открытии day-14 assessment.

**Why it matters**

Открытие сессии и немедленный выход могут быть реализованы как завершённая curriculum session. Повторение этого пути способно разблокировать assessment без прохождения требуемого обучения.

**Minimal correction**

Зафиксировать существующий минимальный контракт обычной curriculum session и явно установить `safe exit ≠ session-completed`; progress event создаётся только после выполнения контракта.

### 2. Recovery невозможно завершить при нуле due-единиц

**Problem**

S6 получает «до 8 due-единиц», то есть допустим пустой набор, но completion требует `≥1` возврат единицы и одно производство.

**Why it matters**

При пустом SRS recovery является единственным ведущим шагом, который невозможно завершить. Пользователь попадает в навигационный тупик в самой чувствительной точке возврата.

**Minimal correction**

Определить валидный completion contract Recovery для состояния `no due items`, используя только уже существующее содержимое Recovery и не изменяя curriculum progress.

### 3. Partial export нарушает канонический порядок, если остаётся состоянием S13 Export

**Problem**

S13 предоставляет пользовательское действие «выгрузить черновик» до финализации и создаёт `export-partial`. Frozen Constitution фиксирует порядок «Finalization → Export» и говорит, что ранний export отклоняется core. Реализация имеет отдельный rescue API `exportPartialSliceData`, но спецификация объединяет его с протокольным Export screen.

**Why it matters**

UI показывает Export до обязательной финализации и размывает различие между protocol completion и аварийным извлечением данных выбывшей участницы. Следующие слои могут считать partial download легальным этапом основного пути.

**Minimal correction**

Не классифицировать partial data rescue как состояние канонического S13 Export и не ставить его в основной пользовательский протокол; финальный Export остаётся достижимым только после explicit finalization.

### 4. Потеря local store ошибочно превращает участницу в новую

**Problem**

S1 при повреждённом или очищенном store маршрутизирует пользователя «как новую» и одновременно обещает не потерять принятые evidence. В текущей локальной архитектуре удалённого authoritative backup нет.

**Why it matters**

Новый onboarding может создать вторую pilot identity, новый pretest и holdout assignment, тогда как прежнее evidence фактически утрачено или недоступно. Это разрушает протокол и contamination history.

**Minimal correction**

Не представлять потерю authoritative local state как обычный new-user flow и не обещать сохранность без подтверждённого источника восстановления; состояние должно блокировать продолжение старого протокола до честного разрешения data integrity.

### 5. Удаление assessment artifact не согласовано с immutable evidence

**Problem**

S17 даёт право удалить любой артефакт, включая отдельно помеченные assessment artifacts, но не определяет судьбу immutable evidence и artifact reference. New-context export хранит ссылку на приватный голосовой объект.

**Why it matters**

Удаление может оставить битую ссылку, молча изменить уже финализированный dataset либо фактически удалить часть evidence через пользовательскую кладовую.

**Minimal correction**

Развести lifecycle обычных пользовательских artifacts и объектов, на которые ссылается immutable assessment evidence; удаление не должно молча переписывать или фальсифицировать evidence/export.

## Major Issues

### 6. Completion обычной и Recovery-сессии не охраняется core

**Problem**

S5/S6 помечены `[IMPL·срез]` и описывают completion conditions, но текущий `completeSession(plan)` увеличивает session/recovery count без проверки выполненных retrieval/production events и без duplicate-completion guard.

**Why it matters**

Экранная последовательность остаётся единственной защитой curriculum count. Повторный вызов или двойное действие может повысить прогресс; это особенно существенно для gate 14 sessions.

**Minimal correction**

Не описывать экранный completion contract как runtime-гарантию; до реализации core guard спецификация должна явно фиксировать это как ограничение текущего `[IMPL·срез]`.

### 7. Finalization copy создаёт ложное впечатление изменяемого evidence до финала

**Problem**

S12 объясняет, что после действия «данные станут окончательными». Однако assessment evidence становится immutable при каждой однократной отправке, до финализации.

**Why it matters**

Пользователь может ожидать возможность исправить ответы до финализации или воспринимать finalization как запись evidence, хотя это отдельное protocol event.

**Minimal correction**

Экран должен отличать уже неизменяемые принятые ответы от однократного закрытия всего пилота; finalization не меняет evidence задним числом.

### 8. Assessment submit не имеет состояний pending/accepted/rejected

**Problem**

S7, S9 и S11 описывают item submission и duplicate rejection, но не задают состояние между нажатием и core acknowledgement, блокировку повторного действия и восстановление после rejected write.

**Why it matters**

Double tap создаст второй вызов, который core отклонит. Без экранного состояния это может выглядеть как потеря первого ответа или системная ошибка и побуждать к повторной отправке.

**Minimal correction**

Для assessment item определить `draft → submitting → accepted` и нейтральное `rejected/not-recorded`; переход к следующему item происходит только после accepted acknowledgement.

### 9. New-context не показывает различие input validity и opportunity sufficiency

**Problem**

S10 корректно отклоняет ответ короче 10 символов, но не определяет пользовательское состояние валидного ответа, который всё равно даёт `insufficient-opportunity` из-за порога 25 слов. Этот результат является исследовательским, а не ошибкой ввода.

**Why it matters**

Экран может либо заставить пользователя дописывать ради метрики, превращая assessment в coaching, либо показать `insufficient-opportunity` как неуспех ученицы.

**Minimal correction**

Сохранить 10 символов как единственный input-validity gate; opportunity classification не должна возвращаться как корректирующая подсказка или требование повторить.

### 10. Voice screen states отсутствуют

**Problem**

S5 и S10 упоминают запись, прослушивание и недоступность, но не содержат permission-undetermined/denied, recording, stopped, interrupted, empty recording, storage failure, playback failure и app-backgrounded.

**Why it matters**

Запись может зависнуть, оборванный файл — считаться завершённым, а отказ в разрешении — повторно запрашиваться. Это увеличивает нагрузку в наиболее чувствительном акте опыта.

**Minimal correction**

Добавить обязательные состояния жизненного цикла существующей приватной записи и безопасный выход в письменный поток без spoken claim.

### 11. `voice-artifact` analytics не совпадает с заявленным payload

**Problem**

Документ утверждает, что event names совпадают с кодом, и описывает `voice-artifact{ref,privacy,analysed:false}`. Текущий event пишет `{uri,promptKind}`; privacy и `analysed:false` добавляются только в export projection.

**Why it matters**

Будущая аналитика или QA может ожидать privacy metadata в append-only event, где её нет, и неправильно интерпретировать raw log.

**Minimal correction**

Разделить фактический event payload и поля export projection; не заявлять отсутствующие event-поля реализованными.

### 12. AI Summary обещает отложенное появление без очереди доставки

**Problem**

S14 при failure сообщает «разбор появится позже», но summary определён как transient, а механизм фоновой генерации, хранения или доставки не задан.

**Why it matters**

Экран обещает будущее состояние, которое система может никогда не создать. Это нарушает честность и оставляет непонятным повторный вход.

**Minimal correction**

Не обещать автоматическое появление без существующего delivery state; явно различить unavailable, manual retry и сохранённую копию там, где они реально поддержаны.

### 13. Shadowing gate использует неканоническое `evidence D2`

**Problem**

S22 требует «лингвистическое evidence D2», но такого канонического evidence class в Constitution нет; там определены шесть классов свидетельств, а конкретный comprehension decision rule не ратифицирован.

**Why it matters**

Неопределённый гейт может блокировать пользователя по process activity, self-report или скрытому proficiency inference. Это создаёт второй progression mechanism.

**Minimal correction**

Использовать только канонически определённый linguistic evidence class и утверждённый decision rule; до этого экран должен иметь статус недоопределённого planned gate, а не реализованной гарантии.

### 14. My Words и Library holdout filtering не покрывают Search/History states полностью

**Problem**

S16 фильтрует список My Words, S19 — контролируемый Content Bank, но не определяет поведение прямого поиска по holdout-term, истории поиска, cached results и deep links.

**Why it matters**

Protected item может не появляться в каталоге, но быть раскрыт через поиск или ранее закэшированный результат до new-context.

**Minimal correction**

Распространить существующий protected-assignment filter на все контролируемые retrieval paths и cache projections; внешнее остаётся contamination, а не гарантированно фильтруемым.

### 15. Нет общей системной поверхности сохранения и offline-state

**Problem**

Отдельные экраны упоминают local, pending-sync и not-saved, но Screen Specification не содержит общего поведения для offline, storage unavailable, sync conflict и retry across app restart.

**Why it matters**

Одинаковый сбой будет по-разному показан в profile, session, assessment и voice. Это повышает когнитивную нагрузку и риск duplicate evidence.

**Minimal correction**

Задать сквозные экранные состояния сохранения для drafts, artifacts и evidence, сохраняя различие между локально сохранённым и core-accepted.

## Minor Issues

### 16. Матрица покрытия ссылается на несуществующий Journey 16

**Problem**

Для S7–S13 указан путь `16`, тогда как User Journey Architecture содержит разделы 1–15 и отдельного assessment journey не имеет.

**Why it matters**

Прослеживаемость assessment screens к journey фактически отсутствует, хотя матрица утверждает обратное.

**Minimal correction**

Исправить ссылку только после появления канонического assessment journey; до этого обозначить gap явно.

### 17. S25 остаётся экраном без IA-объекта

**Problem**

Матрица прямо указывает для Subscription `IA object —`, а сам раздел одновременно содержит предложение об отмене и сохранении данных.

**Why it matters**

Screen Specification опережает IA и может быть воспринята как разрешение проектировать paywall до governance-решения.

**Minimal correction**

Не передавать S25 в визуальный дизайн как утверждённый экран, пока его IA-владение и правила не ратифицированы.

### 18. Inactivity frequency повторяет нератифицированный лимит

**Problem**

S26 закрепляет `≤1` контакт, хотя Constitution ратифицирует отсутствие давления и guilt, но не конкретную частоту.

**Why it matters**

Неутверждённая habit-policy продолжает наследоваться как обязательная screen behavior.

**Minimal correction**

Не считать числовой лимит frozen-инвариантом до governance-решения; opt-out и отсутствие давления остаются обязательными.
