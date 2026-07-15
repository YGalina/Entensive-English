# Модель данных обучения · v2

Дата: 2026-07-13 · (PHASE 7) v1 смешивал канон-контент, состояние ученика, встречи, SRS, ошибки, артефакты, оценки, перенос в одном LearningObject. Разделяем на 7 сущностей.

## Сущности (концептуально, не код)

### 1. ContentObject (канон, общий для всех)
`id, kind (таксономия v2), surface, lemma?, ipa?, gloss{lang}, l1Trap?, cefr{level,relevance}, register(spoken/written), frequencyBand, sourceRefs[]`. Иммутабелен. НЕ персональные данные. Синк — общий справочник.

### 2. LearnerObjectState (на ученика × объект)
`learnerId, contentId, familiarity, receptive:DirState, productive:DirState, status(new/recog/mine), lastSeen`. Производное от событий. Персональное, приватное, удаляемое, синк.

### 3. EncounterEvent (где/как встретил)
`learnerId, contentId, at, surface(film/book/podcast/pack/club/user_link), ref, mode(saw/heard/noticed)`. Append-only, иммутабельно. Приватное. Питает LearnerObjectState.

### 4. PracticeAttempt (конкретный ответ)
`learnerId, contentId, at, direction(recog/produce), exerciseType, result(again/hard/good), latencyMs, hintsUsed, feedbackGiven`. Append-only. Приватное. Источник retrievalMs+стабильности.

### 5. Artifact (значимый вывод)
`learnerId, at, type(status/essay/speech/dialogue), text?, audioRef?, objectsUsed[], promptId`. Иммутабельно. **ПДн (голос/дневник) — private-by-default, синк по согласию, удаляемо.**

### 6. AssessmentEvidence (для вывода компетенции/переноса)
`learnerId, at, kind(levelcheck/monthly/speaking-sample/transfer-task), trackScores{track:level}, sampleRef?, external?`. Иммутабельно. Приватное.

### 7. ReviewSchedule (планирование, направленно)
`learnerId, contentId, recognize?{due,stability,difficulty}, produce?{due,stability,difficulty}`. Производное (FSRS). Локально-first, синк.

## Отношения
ContentObject 1—N EncounterEvent/PracticeAttempt/ReviewSchedule (по contentId). LearnerObjectState — агрегат событий+попыток. Artifact N—M ContentObject (objectsUsed). AssessmentEvidence ссылается на Artifact/sample. transferEvidence = запросом: объект в Artifact/Assessment на НОВОМ контексте (не хранимое «proof», а выводимое).

## Канон vs персональное · иммутабельное vs производное
- **Канон (общий):** ContentObject.
- **Персональное:** всё остальное.
- **Иммутабельное (события):** Encounter, Attempt, Artifact, Assessment.
- **Производное:** LearnerObjectState, ReviewSchedule, transfer (пересчитываемо из событий).

## Приватность/ПДн/удаление
- Голос/дневник/тексты артефактов — приватные, синк по явному согласию, экспорт+полное удаление с первого дня (152-ФЗ).
- Attempt-латентности — приватные (поведенческие).
- ContentObject — не ПДн.

## Кросс-платформенная синхронизация
Нужны: EncounterEvent, PracticeAttempt, Artifact (метаданные), LearnerObjectState, ReviewSchedule, AssessmentEvidence. Механизм — журнал событий (append-only, идемпотентный merge — Фаза C заложена), не last-write-wins.

## Local-first
Всё ядро работает офлайн (state/schedule/attempts локально), синк догоняет.

## Чего НЕ строить в первом срезе валидации
НЕ БД-миграция; НЕ полный 7-сущностный сток. Для среза достаточно: ContentObject (вручную), LearnerObjectState + PracticeAttempt + Artifact поверх существующих srs.ts/output.ts. Остальное — после сигнала.

## Правка относительно v1
v1 «единый LearningObject со всеми полями» — удобно, но смешивал канон и персональное → мешает синку/приватности/переносу. v2 разделяет. Реализация — вью-агрегат поверх текущих сторов, затем БД.
