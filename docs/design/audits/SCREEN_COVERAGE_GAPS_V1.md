# SCREEN COVERAGE GAPS · V1
## D-02 · утверждённые экраны S1–S27/S15b → состояние дизайна

Дата: 2026-07-19. Статусы дизайна: ЕСТЬ (валидный) · АДАПТ (основа есть) · НЕТ (проектировать) · STATE REF (есть только неутверждённый reference состояний). Платформа — по спеке 06 / split_v2.

| Экран | Дизайн | Источник(и) | Платформа | Пререквизит-решение |
|---|---|---|---|---|
| S1 Router | АДАПТ | mobile 12–16 | mobile (web PLAN) | journey M3 (целостность данных) — специфицировать |
| S2 Recognition | АДАПТ | mobile 12; web 01 (без Галины) | mobile/web | — |
| S3 Profile Entry | **НЕТ · STATE REF** | Batch 1 только как inventory состояний | mobile | новый дизайн в Living Content |
| S4 Path Hub | **АДАПТ · STATE REF** — mobile 02 даёт визуальную основу; Batch 1 только состояния | mobile 02/web 04; Batch 1 reference | mobile; web [PLAN] | новый pilot-hub дизайн; web Path утверждение |
| S5 Daily Cycle (6 фаз) | АДАПТ | mobile 03/04/05, web 09, focus 01 | mobile дом; web/focus поверхности | C1-терминология (тишина vs лесенка) — текстовая правка |
| S6 Recovery | НЕТ (переиспользует S5-каркас) | mobile 16 + S5 | mobile | — |
| S7 Pretest | **НЕТ · STATE REF** | Batch 1 только как inventory состояний | mobile | новый дизайн в Living Content; не раскрывать holdout assignment |
| S8 Gate/Wait | **НЕТ · STATE REF** | Batch 1 только как inventory состояний | mobile | новый дизайн в Living Content |
| S9 Trained (22) | НЕТ | Batch 1 только как state reference | mobile | после утверждения assessment family в Batch A |
| S10 New-Context | НЕТ | + voice lifecycle | mobile | Batch 2 |
| S11 Holdout (6) | НЕТ | + плашка «контроль сравнения» | mobile | Batch 2 |
| S12 Finalization | НЕТ (есть только state-reference tile) | Batch 1 reference | mobile | Batch B |
| S13 Export | НЕТ (есть только state-reference tile) | Batch 1 reference | mobile | Batch B |
| S14 AI Summary | НЕТ | концепт «тренер-резюме» | mobile/web | — |
| S15 AI Dialogue | [PLAN] — не сейчас | — | — | ADR runtime-генерации |
| S15b Mini Lessons | [PLAN] — не сейчас | — | — | место в S14 зафиксировано |
| S16 My Words | АДАПТ | mobile 09/36, web 08 | mobile/web | — |
| S17 My Artifacts | НЕТ | — | mobile | lifecycle обычных vs evidence-артефактов |
| S18 Progress | REBUILD | mobile 06 / web 06 (паттерны) | mobile/web | классы свидетельств в проекции |
| S19 Library | АДАПТ | mobile 08/39, web 07, import-video | mobile/web | — |
| S20 Profile | АДАПТ | mobile 11, web 12 | mobile/web | контракт напоминаний (владелец) |
| S21 Reading | ЕСТЬ | mobile 22, web 13 | оба | — |
| S22 Shadowing | АДАПТ | mobile 23, shadowing-player | mobile | ратификация гейта понимания |
| S23 Story Engine | [PLAN] | mobile 24 (FUTURE REF) | — | ADR |
| S24 Community | [PLAN/FUT] | mobile 10/34/35/37/38, web 10 (FUTURE REF) | web live / mobile | валидация переноса [U]; операционный ADR |
| S25 Subscription | не передан в дизайн | mobile 28/29, web 11 (FUTURE REF) | — | governance IA |
| S26 Notification | АДАПТ | mobile 32, push.html | системная | частота/пороги — governance |
| S27 Save/Offline | АДАПТ→семейство | mobile 32 + Batch 1 state references | сквозная | — |
| — Evening Circle | вне 28 утверждённых | mobile 07, focus 02 (FUTURE REF) | — | **решение владельца** |
