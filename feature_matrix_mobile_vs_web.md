# Feature matrix: mobile vs web

Инвентаризация существующих функций по `product_system/v1` и `v2`, `learning_experience` и текущим маршрутам `apps/mobile` / `apps/web`. Это классификация, не редизайн. `Рекомендованная платформа` в Notes означает, где функция должна быть основной по уже зафиксированной архитектуре.

| Feature | Purpose | Mobile | Web | Shared | MVP | Future | Daily | Weekly | AI | Offline | Live | Depends on | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Сегодня: один следующий шаг | Daily guidance и завершённый учебный цикл | Primary | Available/duplicate | Yes | MVP | No | Yes | No | No | Yes | No | dayplan, session, SRS | Mobile primary; web Today дублирует entry point. Рекомендовано: mobile primary, web continuation. |
| Минимальный режим 5–8 мин | Сохранить непрерывность: retrieval + одна своя фраза | Primary | Available | Yes | MVP | No | Yes | No | Optional | Yes | No | SRS, output artifact | Один и тот же daily mode реализован в двух поверхностях; не считать выполнением proficiency. |
| Стандартный интегрированный цикл 20–30 мин | Context → noticing → decoding → retrieval → output → retry | Primary | Available | Yes | MVP | No | Yes | No | Yes | Partial | No | content block, attempts, output | Mobile `/session` и web `/session/[pack]` — функциональный дубль; shared core должен быть источником состояния. |
| Deep work 45–90 мин | Длинная связанная практика и сложные артефакты | Available | Primary | Yes | Pilot | Future | No | Yes | Yes | Partial | No | writing, grammar, reading, content | Документы допускают mobile+web; web — рекомендуемая основная платформа по плотности интерфейса. |
| Recovery / return after pause | Вернуть ученика с 5 минут без наказания | Primary | Available | Yes | MVP | No | Yes | No | No | Yes | No | daily state, SRS | Маршруты `block`/Today и recovery mode пересекаются; одна recovery функция, два входа. |
| SRS flash round | Directed retrieval due items | Primary | Available | Yes | MVP | No | Yes | Yes | No | Yes | No | FSRS, exposure log | `/vocab` mobile и web — дубль; mobile primary, web review допустим. |
| Productive retrieval (meaning → form) | Сделать слово доступным в производстве | Primary | Available | Yes | MVP | No | Yes | Yes | No | Yes | No | item registry, SRS | Не смешивать с recognition; направление хранится в core. |
| Context / noticing | Связный вход и внимание к tracked constructs | Primary | Primary | Yes | MVP | No | Yes | Yes | No | Partial | No | content block, object registry | Оба клиента показывают контекст; web может быть длиннее, но функция shared. |
| Grammar proceduralization / constructor | Перевести грамматический объект в использование | Available | Primary | Yes | Pilot | Future | No | Yes | No | Partial | No | grammar construct, exercise contract | Mobile grammar route и web `/grammar` дублируют; рекомендовано web primary, mobile simplified continuation. |
| Phraseology / collocation practice | Связать форму с употреблением | Primary | Available | Yes | MVP | No | Yes | Yes | Optional | Yes | No | object registry, prompts | Может быть частью session и vocab; отдельная surface не должна стать третьим модулем. |
| Listening / decoding | Понять связную речь до imitation | Primary | Primary | Yes | MVP | No | Yes | Yes | No | Partial | No | audio/transcript, content | Mobile `/listen` и web `/video`/library перекрываются; mobile listening primary, web transcript continuation. |
| Pronunciation / prosody | Артикуляция и темп через вслух practice | Primary | Available | Yes | Pilot | Future | Yes | Yes | No | Yes | No | audio, soundlog | `/sounds` mobile и `/pronunciation` web — дубль; feedback не является voice analysis. Mobile recommended for private voice. |
| Guided speaking / “say your own” | Pushed output с опорами | Primary | Available | Yes | MVP | No | Yes | Yes | Yes | Partial | No | prompts, output artifact | Shared learning contract; mobile voice/text, web keyboard continuation. |
| Freer output artifact | Зафиксировать собственную фразу/текст | Primary | Primary | Yes | MVP | No | Yes | Yes | Optional | Yes | No | output artifact, privacy | Text и audio артефакты различать; не выдавать AI-оценку за доказательство речи. |
| Retry / second version | Улучшить output после первой попытки | Primary | Available | Yes | Pilot | Future | Yes | Yes | Yes | Partial | No | output artifact, feedback | В текущем коде есть session retry; web/mobile должны писать единый лог. |
| Writing with supports | Письменная продукция и редактура | Available | Primary | Yes | Pilot | Future | No | Yes | Yes | Partial | No | editor, output artifact | Web `/typing` и `/grammar` покрывают часть; mobile short-message ограничен. |
| Reading | Понимание и extraction из текста | Primary | Primary | Yes | MVP | No | Yes | Yes | Optional | Yes (downloaded) | No | library, content | Mobile `/read` и web `/reading`; duplicated capability, different length defaults. |
| Film scene analysis | Контекст, transcript и extraction из сцены | Available | Primary | Yes | Future | Future | No | Yes | Yes | No | No | library/video, transcript | Web recommended; mobile review only. |
| Book chapter / long-form reading | Длинное чтение и культурная интеграция | Available | Primary | Yes | Future | Future | No | Yes | Optional | Yes (downloaded) | No | library, Gutenberg | Web `/reading`/Gutenberg route; not a separate MVP daily feature. |
| YouTube search / import | Принести личный интерес в learning loop | Primary | Available | Yes | Pilot | Future | No | Yes | Optional | No | No | library, import | Mobile `/youtube`; library is shared concept, import surface is duplicated/uneven. |
| Library / content shelf | Хранение и вход в контент | Primary | Primary | Yes | MVP | No | No | Yes | No | Partial | No | content registry | Both have `/library`; duplicated navigation, shared content state. |
| Word biography / vocabulary statuses | Показать encounter → recognition → mine | Primary | Available | Yes | MVP | No | Yes | Yes | No | Yes | No | item registry, exposure log | Mobile `/vocab` is primary; web table is analysis/continuation. |
| Evening circle / reflection | State → guard → status, inform tomorrow | Primary | Available | Yes | MVP | No | Yes | Yes | No | Yes | No | daily state, consent | Mobile `/evening` primary; web `/evening` duplicates. |
| Progress / honest hours / “what I can do” | Metacognition and process visibility | Compact | Primary | Yes | Pilot | Future | No | Yes | No | Yes | No | event log, artifact log | Web `/program` is orphan/partial implementation; no CEFR/proficiency claim. |
| Path / lane map | Show current learning lane and next focus | Compact | Primary | Yes | Pilot | Future | No | Yes | No | Yes | No | curriculum map, evidence | Mobile `/path` and web `/program` overlap; web is correct dense surface. |
| Diary / artifact archive | Searchable record of learner outputs | Available | Primary | Yes | Future | Future | No | Yes | No | Partial | No | output artifact, sync | Mobile `/diary` and planned web progress overlap; web primary for search. |
| Real-world missions / check-in | Prepare and evidence transfer outside app | Primary | Available | Yes | Pilot | Future | No | Yes | No | Partial | Event | mission contract, output | Mobile `/checkup`/people fit context; web can review evidence, not replace live context. |
| Live club / pair / coach | Human interaction and transfer | Join/compact | Primary | Yes | Future | Future | No | Yes | No | No | Yes | people, consent, scheduling | Mobile `/people` and web `/people` duplicate discovery; live room is web primary, mobile join. |
| Community / people discovery | Find peers and human practice | Primary | Primary | Yes | Future | Future | No | Yes | No | No | Yes | confidence gate, consent | Both routes exist; duplicate functionality, platform split should remain join vs room. |
| AI training partner | Controlled practice after/around output | Any | Any | Yes | Pilot | Future | Yes | Yes | Yes | No | No | prompt contract, content, privacy | Architecture explicitly allows either surface; no detached free chat. |
| AI coach summary / feedback | Warm response and next focus after evidence | Primary | Available | Yes | Pilot | Future | Yes | Yes | Yes | No | No | output artifact, feedback route | Current gap audit flags missing connection; do not present as voice analysis. |
| AI writing editor | Feedback on written artifact | Available | Primary | Yes | Pilot | Future | No | Yes | Yes | No | No | text artifact, rubric | Web recommended; mobile short text only. |
| AI reflective companion | Reflection without assessment claim | Primary | Available | Yes | Future | Future | Yes | Yes | Yes | No | No | diary, privacy | Must remain distinct from assessor/tutor. |
| AI mission-prep guide | Prepare phrases and plan before real event | Primary | Available | Yes | Pilot | Future | No | Yes | Yes | Partial | Event | Mobile context primary; web planning continuation. |
| Onboarding / profile intake | Capture learner context and preferences | Primary | Primary | Yes | MVP | No | No | No | No | Partial | No | auth, profile | Both routes exist; duplicated account entry points. |
| Auth / account | Secure identity and sync boundary | Available | Primary | Yes | MVP | No | No | No | No | No | No | auth APIs, sync | Mobile auth screen and web login; shared backend contract. |
| Sync / append-only event log | Persist attempts, exposures, artifacts across devices | Shared runtime | Shared API | Yes | MVP | No | Yes | Yes | No | No | No | events, storage, sync APIs | Architectural dependency, not a learner-facing module; duplicate local/server paths are risk. |
| Privacy / consent controls | Keep voice, diary and community use explicit | Primary | Primary | Yes | MVP | No | No | No | No | Partial | Yes | profile, consents API | Existing consent route; required before live/community and public sharing. |
| Notifications / reminders | Prompt return and daily ritual | Primary | Available | Yes | Future | Future | Yes | Yes | No | No | No | profile preferences, device notifications | Mobile is correct platform; web reminder is secondary. |
| Subscription / pricing | Gate paid product access | Available | Primary | Yes | Existing shell | Future | No | No | No | No | No | auth, billing API | Web `/pricing` and billing routes; commercial shell, not learning evidence. |
| Legacy standalone module routes | Preserve older entry points while migration continues | Present | Present | Yes | Legacy | Future | No | No | Optional | Varies | No | routing, shared state | `/phrase`, `/roles`, `/three`, `/sounds` and scattered web pages duplicate core phases; misplaced until folded into canonical flows. |

## Дубли и misplaced functionality

- Дублируются: Today/session, SRS/vocab, reading, library, evening, people/community, pronunciation/sounds, grammar, progress/path/program, onboarding/auth.
- Неправильно размещены относительно зафиксированной split-модели: web `/program` как сиротский progress surface; mobile legacy top-level phase routes; web grammar/typing/reading как разрозненные инструменты вместо их уже описанного deep-work назначения; mobile и web live-discovery без явного join/room разделения.
- Рекомендация платформы следует существующей архитектуре: mobile — daily ritual, retrieval, private voice, short reflection, context missions; web — keyboard/deep work, long reading/writing, dense progress, live room. Shared core — state, contracts, logs, privacy, content.

## Источники инвентаризации

- `product_system/v1/mobile_information_architecture_v1.md`
- `product_system/v1/web_information_architecture_v1.md`
- `product_system/v2/mobile_web_learning_split_v2.md`
- `learning_experience/daily_learning_engine.md`
- `learning_experience/experience_surface_map.md`
- `learning_experience/training_block_architecture.md`
- `learning_experience/ai_relationship_model.md`
- `learning_experience/progress_experience.md`
- `apps/mobile/src/app/**`
- `apps/web/src/app/**`
- `packages/core/**`
