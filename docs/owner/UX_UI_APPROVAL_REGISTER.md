# Intensive English — реестр UX/UI и утверждений владельца

Status: owner control baseline · 2026-08-08

Owner visual review file: [Figma — First Run + Day 1](https://www.figma.com/design/q1MooGkru7rssI4k72MOwl). Existing Fable boards have begun importing into this single file. It is **not yet an approval-ready end-to-end flow**; Figma Starter MCP rate limit stopped final arrangement and the missing Fable 5 screens still require design.

## Как читать статусы

- **REFERENCE** — исторический или вспомогательный материал; реализовывать нельзя.
- **FABLE READY** — Fable-пакет существует и прошёл техническую проверку Codex.
- **OWNER APPROVED PARTIAL** — владелец принимал конкретные экраны/исправления, но не весь end-to-end поток.
- **OWNER APPROVAL REQUIRED** — без явного решения владельца реализация запрещена.
- **IMPLEMENTED / NOT ACCEPTED** — код существует, но сборка не принята владельцем.
- **ACCEPTED ON DEVICE** — владелец принял цельный работающий поток на устройстве.

## Главный текущий поток: первый запуск → День 1

| № | Экран/состояние | Что должен понять/сделать пользователь | Визуальный источник | Код | Решение владельца сейчас |
|---|---|---|---|---|---|
| 1 | Первое объяснение продукта | Что это за продукт и как он помогает переносить английский в свою речь/письмо | **Нового цельного Fable-экрана нет** | Нет принятой реализации | **OWNER APPROVAL REQUIRED** |
| 2 | S2 Recognition | Узнать проблему «понимаю, но не могу сказать» | `batch-a-defaults-final/screens/S2_recognition.html` | Реализовано | OWNER APPROVED PARTIAL; недостаточно как весь onboarding |
| 3 | S3 Profile, 5 вопросов | Отметить наблюдаемые признаки без levelcheck | `batch-a-defaults-final/screens/S3_profile_entry.html`; responsive correction in prompt-14 package | Реализовано | OWNER APPROVED PARTIAL |
| 4 | Объяснение 28 ответов до начала | Понять зачем это, что оценки/уровня нет и что будет после | **Нового цельного Fable-экрана нет** | Нет принятой реализации | **OWNER APPROVAL REQUIRED** |
| 5 | S7, 28 ответов | Ответить или выбрать «Не помню» | `batch-a-defaults-final/screens/S7_pretest.html` | Реализовано | OWNER APPROVED PARTIAL |
| 6 | Завершение S7 | Понять, что сохранено и какая практика откроется | Старый вариант `stage0-owner-device-correction-v1/screens/S7_baseline_complete.html` признан владельцем непонятным | Реализован старый текст | **REJECTED FOR CURRENT FLOW** |
| 7 | Path Hub до практики | Увидеть один понятный следующий шаг | `batch-a-defaults-final/screens/S4_path_hub.html`; week-header correction | Реализовано | OWNER APPROVED PARTIAL; не заменяет onboarding |
| 8 | План Дня 1 | Понять содержание, полный 30 мин и короткий 16 мин пути | `stage0-day1-v1/` | Реализовано | **OWNER APPROVAL REQUIRED AS PART OF FULL FLOW** |
| 9 | Priming | Познакомиться с четырьмя фразами | `stage0-day1-v1/` | Реализовано | OWNER APPROVAL REQUIRED AS FULL FLOW |
| 10 | Текст дня | Прочитать контекст и открыть перевод | `stage0-day1-v1/` | Реализовано | OWNER APPROVAL REQUIRED AS FULL FLOW |
| 11 | Проверка смысла | Ответить; после ошибки получить безопасную опору | `stage0-day1-v1/` | Реализовано | OWNER APPROVAL REQUIRED AS FULL FLOW |
| 12 | Retrieval | Вернуть фразу из памяти; получить опоры по запросу | `stage0-day1-v1/`; keyboard refs in prompt-14 package | Реализовано | OWNER APPROVAL REQUIRED AS FULL FLOW |
| 13 | Своя письменная фраза | Написать свою мысль без скрытого текста | `stage0-day1-v1/`; keyboard refs | Реализовано | OWNER APPROVAL REQUIRED AS FULL FLOW |
| 14 | Голос, full path | По желанию записать локально; голос не анализируется | `stage0-day1-v1/` | Реализовано | Device QA не закрыта |
| 15 | S14 feedback | Получить честную обратную связь по написанному тексту | `stage0-owner-device-correction-v1/screens/S14_*.html` | Реализовано | Нужна проверка в полном потоке |
| 16 | Guided variation, full path | Сделать три разные фразы по рамке | `stage0-day1-v1/` | Реализовано | Нужна проверка в полном потоке |
| 17 | Fluency, full path | Сказать две версии без выдуманного scoring | `stage0-day1-v1/` | Реализовано | Device QA не закрыта |
| 18 | Завершение full/short | Увидеть только фактически выполненное | `stage0-day1-v1/` | Реализовано | Нужна проверка в полном потоке |
| 19 | Path Hub после завершения | Увидеть закрытый день и не запускать его повторно | **Fable-состояния нет** | Текущий код зацикливает completed Day 1 | **OWNER APPROVAL REQUIRED** |

## Где посмотреть существующие визуальные материалы

- Первый запуск и Path Hub: `docs/design/exports/batch-a-defaults-final/`
- Базовая daily practice и feedback: `docs/design/exports/batch-c-correction-v1/BATCH_C_CORRECTION_BOARD.dc.html`
- Stage 0 Day 1: `docs/design/exports/stage0-day1-v1/`
- Коррекции Android/feedback: `docs/design/exports/stage0-owner-device-correction-v1/REVIEW_BOARD.html`
- Исправление week header: `docs/design/exports/path-hub-week-header-device-correction-v1/screens/week_header_correction.html`
- Полный технический каталог всех ранее подготовленных продуктовых экранов: `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`

Разрозненные пакеты выше **не являются** единым UX/UI на утверждение. Следующий обязательный Fable-deliverable — одна обзорная последовательность всех 19 пунктов текущего потока с переходами и состояниями.

## Остальные продуктовые области

| Область | Где есть дизайн | Реализация сейчас | Gate |
|---|---|---|---|
| Recovery/data integrity | `docs/design/exports/recovery-integrity-v1/` | Частично | Не активный блок; отдельный owner flow approval перед расширением |
| Assessment/results S9–S13 | `docs/design/exports/batch-b-correction-v2/` | Не полный продуктовый flow | Сначала накопленные данные и protocol review |
| Words/artifacts/progress | `docs/design/exports/batch-d-final/` | Не текущий блок | Отдельное end-to-end утверждение владельца |
| Library/reader/shadowing | `docs/design/exports/batch-e-correction-v1/`, `batch-e-states-v1/` | Не текущий блок | Отдельное end-to-end утверждение владельца |
| Auth/account/payment | `docs/design/exports/batch-f-auth-monetization-correction-v1/`, states package | Не текущий блок | Provider, privacy, pricing и отдельное owner approval |
| Stage 0 Days 2–7 | Методические документы есть | Нет утверждённого UX/UI и реализации | Методическая QA → UX → Fable → owner approval |
| Web | Есть старые references | Не разрешён перенос mobile UI | Отдельный web scope и owner approval |

## Формат финального решения владельца

Для каждого нового review package Codex добавляет сюда одну строку:

`Дата · пакет/commit · УТВЕРЖДАЮ UX/UI / ВЕРНУТЬ В FABLE / ОТКЛОНЯЮ · комментарий владельца`

До появления такой строки пакет не имеет права переходить в реализацию.
