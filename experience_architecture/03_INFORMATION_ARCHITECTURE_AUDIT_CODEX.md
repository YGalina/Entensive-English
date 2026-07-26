# Аудит Information Architecture

## Executive Summary

`03_INFORMATION_ARCHITECTURE.md` исправляет ряд проблем предыдущего UX-слоя: отделяет drafts от evidence, выделяет assessment как самостоятельную поверхность, разводит AI Summary и AI Dialogue, определяет безопасный выход и формально отделяет финализацию от экспорта.

В текущем виде IA ещё не является непротиворечивой картой владения и достижимости. Обнаружены четыре критические проблемы: два авторитетных владельца Reminder Contract; назначение навигационному Path владения curriculum progress вместо runtime-системы; отсутствие 14 curriculum sessions в формальной последовательности Assessment Protocol; безусловная доступность Reference, способная нарушить защиту holdout. Дополнительно имеются расхождения статусов зрелости и несколько конфликтов entry/exit.

## Critical Issues

### 1. Reminder Contract имеет двух авторитетных владельцев

**Problem**

В §3 Profile назван владельцем предпочтений и напоминаний. В §5 D5 Profile также «владеет Reminder Contract». Одновременно в дереве и §5 E владельцем Reminder Contract назван Path.

**Why it matters**

Это прямо нарушает собственный IA-инвариант «ровно один владелец на состояние». Изменение времени, opt-out или permission state может расходиться между Profile и Path.

**Minimal correction**

Оставить одного authoritative-владельца состояния Reminder Contract; второй объект должен только читать его или инициировать команду изменения.

### 2. Path ошибочно объявлен источником истины curriculum progress

**Problem**

§§1–5 назначают Path авторитетом curriculum progress, хотя Path определён как ведущая информационно-навигационная ось. Конституция разделяет DLE/планировщик, протокол, recovery, assessment и прогрессию; ядро, а не UI/навигация, исполняет протокольные инварианты.

**Why it matters**

Навигационная проекция становится вторым runtime-источником сессий и прогресса. Прямой переход, восстановление UI или рассинхронизация устройств могут изменить либо подделать progress вне канонического DLE/protocol state.

**Minimal correction**

Оставить authoritative curriculum state существующему runtime-владельцу Daily Engine/планировщику, protocol state — Protocol; Path должен вычислять Current Step как проекцию этих состояний.

### 3. Формальная последовательность Assessment Protocol пропускает 14 curriculum sessions

**Problem**

§4 и C2 задают: Pretest → Wait-until-date → Trained Assessment → New Context → Holdout → Finalization → Export. Обязательные 14 curriculum sessions отсутствуют внутри последовательности и не указаны как одновременный guard Trained Assessment. Ожидание даты представлено отдельным следующим этапом сразу после pretest.

**Why it matters**

IA допускает трактовку, при которой после pretest пользователь находится только в ожидании даты, либо trained assessment открывается по календарю без 14 завершённых сессий. Это нарушает замороженный протокол «14 sessions AND ≥14 days».

**Minimal correction**

В формальной модели достижимости Trained Assessment закрепить оба обязательных условия: 14 curriculum sessions и 14 календарных дней; ожидание даты не должно заменять учебный путь.

### 4. Безусловно доступные Reference могут нарушить holdout-защиту

**Problem**

Reference объявлены «всегда доступными». My Words проецирует Learner Object States и «биографию слова», Library — Content Bank. Holdout-единицы намеренно предъявляются на pretest, но должны быть защищены от дальнейшего предъявления до new-context. IA не задаёт фильтра защищённых объектов для My Words, Library, Search или AI-поверхностей.

**Why it matters**

После pretest контрольная единица может появиться в словаре, истории экспозиций, библиотечном материале или поиске. Это загрязнит holdout до нового контекста и уничтожит assessment integrity, хотя протокольная навигация формально останется правильной.

**Minimal correction**

Закрепить существующую holdout-защиту на всех проекциях и путях предъявления: protected assignment не должен становиться доступным через Reference или генерируемые/поисковые поверхности до разрешённого этапа.

## Major Issues

### 5. Resume Router обходит правило входа в Protocol только через Path

**Problem**

Entry Gateway и §7 разрешают Resume Router направлять непосредственно в прерванную Workspace. Одновременно C2 и §7 утверждают, что protocol stages не имеют прямых входов кроме Path.

**Why it matters**

Возобновление assessment может обойти повторную проверку текущего stage guard, даты, полноты или финализированного состояния.

**Minimal correction**

Протокольное возобновление должно сначала валидироваться Protocol/Path и только затем возвращать в разрешённое промежуточное состояние; Resume Router не является самостоятельным входом в assessment.

### 6. Library → учебный запуск имеет конфликтующую семантику Back

**Problem**

Reference по общему правилу возвращает в источник входа. C5 говорит, что Reading/Listening, запущенный из Library, возвращает в Library. D4 и §8 одновременно утверждают, что учебный запуск из Library ведёт обратно в Path.

**Why it matters**

Один и тот же переход получает два разных destination. Реализация может потерять контекст библиотеки, создать ложный curriculum step либо зациклить Library и Daily Cycle.

**Minimal correction**

Установить одну семантику для латерального запуска и отдельно одну для Path-owned шага; источник запуска должен однозначно определять возврат и отсутствие/наличие curriculum effect.

### 7. Artifact Store отсутствует в полном IA-дереве скрытых объектов

**Problem**

Artifact Store назван authoritative-владельцем текстов и голоса, используется Daily Cycle и My Artifacts и включён в список персистентных объектов, но отсутствует в ветке F System/Hidden Objects и в её спецификации.

**Why it matters**

Полное дерево не содержит одного из собственных источников истины. Нельзя однозначно определить его приватность, lifecycle, связь с drafts/evidence и удаление пользовательских артефактов.

**Minimal correction**

Включить Artifact Store в канонический список скрытых authoritative-объектов и согласовать его существующие связи без добавления новой функции.

### 8. New-context evidence не связан с Artifact Store и voice reference

**Problem**

Assessment Protocol пишет Evidence Store и Journal, но не имеет ребра к Artifact Store. New-context включает письменную продукцию и допустимую приватную голосовую ссылку; IA не показывает, где хранится артефакт и как evidence ссылается на него, не анализируя голос.

**Why it matters**

Реализация может встроить голос или изменяемый текст прямо в evidence, потерять permitted artifact reference либо смешать assessment artifact с обычными My Artifacts.

**Minimal correction**

Зафиксировать существующую связь: assessment evidence хранит неизменяемую ссылку на соответствующий Artifact Store object; голос остаётся отдельным приватным, неанализируемым артефактом.

### 9. Несколько статусов `[IMPL]` противоречат Product Maturity Matrix

**Problem**

IA помечает полную Path/Protocol-модель, Resume Router, Resumable Drafts, Privacy Status, Path Reachability и полный Assessment Protocol как реализованные. Конституция называет DLE и assessment частичными, аналитику частичной, синхронизацию/бэкенд целевыми, а гарантии текущего протокола ограничивает конкретным Vertical Slice.

**Why it matters**

Следующие архитектурные документы могут принять целевую модель за уже существующую и опереться на несуществующие гарантии сохранения, маршрутизации или кросс-девайс состояния.

**Minimal correction**

Привести maturity tags к конституционной матрице и отделить реализованный объём Vertical Slice от запланированной общей IA.

### 10. Library import-to-lesson ошибочно обозначен реализованным

**Problem**

Library имеет статус `[IMPL]` вместе с импортом «переведи свою жизнь», превращающим материал в мини-урок. Конституция фиксирует Library и YouTube search как реализованные, но import-to-lesson и Story Builder — как будущее.

**Why it matters**

IA скрывает незавершённую зависимость content pipeline и создаёт ложное ожидание, что пользовательский импорт уже безопасно становится учебным объектом.

**Minimal correction**

Разделить зрелость реализованной Library/search и будущего import-to-lesson внутри существующего объекта.

### 11. Reminder state model неполон для заявленного habit contract

**Problem**

Reminder Contract содержит opt-in/out и delivered/missed/disabled, но не содержит scheduled/timezone, permission denied, tapped/dismissed и stale reminder после изменения Path.

**Why it matters**

Напоминание может вести в устаревший шаг, повторно просить запрещённое разрешение или путать отсутствие доставки с сознательным отказом. Это создаёт давление и нарушает мягкую habit-модель.

**Minimal correction**

Добавить только необходимые состояния исполнения уже заявленного reminder-контракта и всегда разрешать маршрут по актуальному Path, а не по сохранённой цели уведомления.

### 12. Не определены недоступность хранения и конфликт синхронизации

**Problem**

IA объявляет drafts, artifacts, protocol state и evidence персистентными, а продукт — кросс-девайсным в целевой архитектуре, но не содержит состояний write failure, offline persistence, sync conflict или storage unavailable.

**Why it matters**

Обещание «прерывание не теряет работу» и иммутабельность evidence невозможно гарантировать без различения сохранённого, ожидающего синхронизации и не сохранённого состояния. Повторная отправка после сбоя может создать duplicate evidence.

**Minimal correction**

Зафиксировать обязательные информационные состояния сохранения и синхронизации для drafts, artifacts и evidence, не определяя новую техническую архитектуру.

## Minor Issues

### 13. AI Summary назван владельцем «AI», но authoritative-состояние ответа не определено

**Problem**

C3 назначает владельцем AI, хотя AI является производителем ответа, а не каноническим хранилищем или IA-доменом. Не указано, является summary transient, artifact или событием.

**Why it matters**

Повторный вход может регенерировать иной текст либо показать, что summary исчезло, без ясного нарушения или допустимого поведения.

**Minimal correction**

Классифицировать AI Summary в уже заданных терминах authoritative/projection/transient и определить, сохраняется ли принятый результат.

### 14. Определение Transient внутренне противоречиво

**Problem**

Transient определён как объект, существующий только в потоке и не являющийся истиной, но пример drafts одновременно назван персистентным.

**Why it matters**

Следующие документы могут ошибочно считать transient равным ephemeral и не сохранять draft либо, наоборот, принимать любой persistent object за источник истины.

**Minimal correction**

Развести две независимые характеристики: persistence и authority; draft может быть persistent non-authoritative без противоречивого класса.
