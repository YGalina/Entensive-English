# Intensive English: учебная архитектура v1

Дата: 2026-07-14

Роль: Chief Learning Architect

Область: только методология. Без редизайна экранов, без implementation tickets, без изменений кода приложения.

## 0. Сначала инвентарь источников

### Прочитанный исследовательский корпус

| Источник | Путь | Для чего использован |
|---|---|---|
| Отчёт об интегрированной L2-компетенции | `/Users/galinayanovskaya/Intensive English Research/05_receptive_productive_gap/DEEP_RESEARCH_BRIEF_Building_Integrated_L2_Compet.pdf` | рецептивно-продуктивный разрыв, словарь, процедуризация грамматики, говорение, аудирование, произношение, обратная связь, интенсивность, перенос |
| Сравнение программ для взрослых intermediate-учеников | `/Users/galinayanovskaya/Intensive English Research/07_comparative_programmes/_COMPARATIVE_RESEARCH_BRIEF_Adult_Intermediate.pdf` | прецеденты программ, архитектура упражнений, слабые паттерны упражнений, требования к mobile/web |
| Рыночный и доказательный синтез | `/Users/galinayanovskaya/Intensive English Research/04_layer3_synthesis/L3_EXECUTIVE_2pages_RU.md` | рыночные разрывы, запреты на обещания, границы доказательности |
| Отчёт о рецептивно-продуктивном разрыве | `/Users/galinayanovskaya/Intensive English Research/05_receptive_productive_gap/GAP_gemini_2026-07-09_RU.md` | механизмы разрыва, фразеология, устная и письменная продукция |
| Продуктовый аудит | `/Users/galinayanovskaya/Intensive English Research/06_product_audit/AUDIT_intensive-english_2026-07-09_RU.md` | риски текущего продукта и предыдущая методическая критика |
| Исследования Layer 2/3 | `/Users/galinayanovskaya/Intensive English Research/02_layer2_reports/*.md`, `/Users/galinayanovskaya/Intensive English Research/04_layer3_synthesis/*.md` | карта подтверждений и неопределённостей |
| DOCX-отчёт по рынку | `/Users/galinayanovskaya/Intensive English Research/02_layer2_reports/L2_chatgpt_2026-07-08_EN.docx` | кросс-проверка продуктового ландшафта через локальное извлечение текста |

PDF-эквиваленты найдены, но не все удалось локально извлечь машинно: `pdftotext` недоступен. Там, где PDF, судя по структуре, дублирует markdown или DOCX-версию, markdown/DOCX считался доступным эквивалентом источника. Это отмечено как ограничение обработки источников, а не скрыто.

### Прочитанные документы продукта и методологии

| Источник | Путь | Для чего использован |
|---|---|---|
| Исследование метода Петрусинского/Лозанова | `01_research_method.md` | исходная пятиуровневая рамка и методическое наследование |
| Концепция продукта | `02_concept.md` | продуктовая предпосылка и модули |
| Спецификация MVP | `03_spec_MVP.md` | текущий предполагаемый объём |
| Методика → механика | `05_method_to_mechanics.md` | текущая теория блока/сессии |
| Продуктовый аудит v3 | `08_product_audit_v3_codex.md` | карта рисков и предыдущих решений |
| План архитектуры | `09_architecture_plan.md` | output-слой, SRS v2, feedback, assessment |
| Психологический слой | `10_psychology_layer.md` | стражи и аффективный слой |
| Логика приложения | `13_app_logic.md` | дневной цикл, фазы сессии, состояния пользователя |
| Архитектура платформ | `17_platform_architecture.md` | разделение mobile/web |
| SLA-аудит | `docs/audits/methodology/17_learning_architecture_sla_audit_2026-07-12.md` | предыдущий аудит упражнений |
| Карта “понимаю → говорю автоматически” | `docs/audits/methodology/18_understand_to_automatic_speech_map_2026-07-12.md` | лестница когнитивных переходов |
| UX-фидбэк | `15_ux_audit_codex_2026-07-12.md`, `16_target_user_simulation_codex_2026-07-12.md`, `feedback/*.md` | путаница, перегрузка и риски доверия |

### Прочитанные текущие определения контента и упражнений

| Источник | Путь | Для чего использован |
|---|---|---|
| План дня | `packages/core/dayplan.ts` | текущая последовательность активностей и цели по времени |
| Пачки и словарь | `packages/core/data/packs.ts` | модель лексических данных, переводы, word/chunk packs |
| SRS | `packages/core/srs.ts` | механики узнавания и продуктивного извлечения |
| Грамматика | `packages/core/data/grammar.ts` | грамматика как frame/fill construction |
| Обратная связь | `packages/core/feedback.ts` | prompt-based correction |
| Assessment | `packages/core/assess.ts` | speaking sample и самооценка |
| Shadowing | `packages/core/data/shadowing.ts` | видео/аудио shadowing-контент |
| Ролевые сцены | `packages/core/data/roleScenes.ts` | role-mask dialogue practice |
| Чтение/библиотека | `packages/core/data/reading.ts`, `packages/core/data/library.ts` | reading и book flows |
| Mobile/web flows | `apps/mobile/src/app/*`, `apps/web/src/app/*`, `docs/design/project/screens/*.html`, `docs/design/project/slices-v2/**/*` | текущие пользовательские потоки и размещение по платформам |

## 1. Используемые метки доказательности

Каждое решение ниже использует одну или несколько меток:

| Метка | Значение |
|---|---|
| Поддержано исследованиями | Подтверждено исследовательским корпусом или устойчивыми SLA/когнитивными механизмами |
| Прецедент программ | Встречается в серьёзных программах, учебниках, тьюторинге, FSI/DLI-подобных системах или зрелых app-паттернах |
| Продуктовая гипотеза | Правдоподобно, но должно быть проверено на пользователях Intensive English |
| Предпочтение основателя | Отражает позиционирование Галины, вкус, психологическую рамку или наследие Петрусинского |
| Неизвестно | Требует исследования, данных или пилота |

Идеи основателя могут формировать идентичность продукта. Но они не считаются научным доказательством без независимой поддержки.

## 2. Правильная продуктовая предпосылка

Ученик - не скрытый B2 speaker, которому нужна только уверенность.

Типичный ученик Intensive English имеет неровную компетентность:

- A2/B1 или B1 в продуктивном словаре;
- более сильное пассивное чтение, чем говорение;
- неполные коллокации и формульный язык;
- знание грамматики, которое рушится под давлением времени;
- неровное аудирование, особенно connected speech;
- медленную сборку фраз;
- стыд за произношение/просодию;
- реальный страх ошибок;
- хрупкую привычку.

Поэтому продукт должен делать две вещи одновременно:

1. строить недостающую языковую компетентность;
2. переводить эту компетентность в самостоятельное использование.

## 3. Ядро архитектуры

Единица обучения - не карточка и не свободная беседа.

Единица обучения - это **языковая единица, проведённая через путь использования**:

```
значимая встреча
→ понимание
→ замечание формы
→ произношение/восприятие
→ контролируемое извлечение
→ управляемая продукция
→ личное использование
→ взаимодействие/перенос
→ отложенное извлечение
→ повторное использование в изменённом контексте
```

Система никогда не должна помечать единицу как “выученную” после одного узнавания. Возможные состояния:

- увидено;
- понято;
- узнано в контексте;
- извлечено из памяти по смыслу;
- сказано вслух в контролируемой рамке;
- использовано в личной фразе;
- использовано во взаимодействии или задаче;
- повторно использовано после задержки.

## 4. Хребет программы

Intensive English должен стать **системой моста от input к речи**, а не библиотекой контента с упражнениями вокруг.

Хребет:

1. Диагностический профиль, а не один грубый уровень.
2. Ежедневный input-блок.
3. Замечание и извлечение полезных chunks.
4. Продуктивное извлечение из памяти.
5. Грамматика и произношение только как усилители использования.
6. Pushed output в каждой сессии.
7. Feedback через подсказки и повторную попытку.
8. Перенос в human/AI/community tasks.
9. Периодический assessment по samples, а не только streaks.

## 5. Что здесь значит “интенсив”

Поддержано исследованиями: интенсивность - это высокий объём плюс обратная связь, retrieval, output и assessment. Это не мистический эффект быстрого предъявления.

Прецедент программ: серьёзные интенсивные программы используют много часов в неделю, контакт с преподавателем, тестирование и реальный output.

Продуктовая гипотеза: Intensive English может создать гуманную consumer-версию через режимы:

- устойчивый ежедневный: 20-45 мин/день;
- ускоренный: 7-10 ч/неделю;
- bootcamp: 15-25 ч/неделю в короткой когорте;
- поддерживающий: 10-15 мин/день после уровня;
- восстановительный: 3-8 мин после пропусков.

Предпочтение основателя: вдохновлённые Петрусинским overload, rhythm, readiness и psychological safety остаются как идентичность, но claims должны формулироваться осторожно.

## 6. Неприкосновенные правила метода

1. Нет обещания “поняла = заговорила”.
2. Нет “придумай своё предложение” до моделей, ограничений, cues, feedback и повторной попытки.
3. Нет грамматического quiz, оторванного от речи.
4. Нет AI conversation без задачи, target language, feedback, retry и recycling.
5. Нет пассивного потребления фильмов/книг как “training”, если оно не создаёт extraction, recall, output и later reuse.
6. Нет streak как evidence of progress.
7. Нет одного level label для неровного ученика.
8. Нет участия native speakers без moderation, role clarity и safety design.

## 7. Выходные файлы этого пакета архитектуры

1. `learning_architecture_v1.md` - этот overview и source inventory.
2. `current_methodology_audit.md` - item-by-item audit.
3. `competence_model.md` - complete competence model.
4. `b1_to_b2_progression.md` - progression architecture.
5. `exercise_redesign_matrix.md` - weak exercise redesign.
6. `content_integration_films_books_shadowing.md` - content-to-learning flows.
7. `human_ai_community_model.md` - human, AI and community layer.
8. `mobile_web_learning_split.md` - platform assignment by learning requirement.
9. `evidence_and_hypotheses_register.md` - evidence map and product hypotheses.
10. `open_research_questions.md` - unresolved decisions.

## 8. Полные learning loops по типам языковой единицы

### Отдельное слово

`встреча в контексте → L1 meaning и audio → noticing произношения/формы → recognition во втором контексте → recall по смыслу → использование в фиксированной фразе → личная фраза → delayed productive SRS → transfer в новый контекст`

Критерий mastery: learner retrieves the word from meaning and uses it naturally in a short phrase.

### Коллокация

`встреча как цельной фразы → объяснение word partnership → контраст с L1-calque → collocation gap → meaning-to-collocation recall → personalization → spoken/written use → changed-topic recycle`

Критерий mastery: learner chooses the natural combination without literal translation.

### Phrasal verb

`scenario encounter → meaning mapping → natural examples → polysemy contrast if needed → scenario choice → retrieval from meaning → role-play use → delayed scenario cue`

Критерий mastery: learner uses the phrasal verb in a plausible situation.

### Формульная последовательность

`hear/read chunk → understand function → repeat with prosody → complete missing part → retrieve whole chunk → vary one slot → use in interaction → later use with different interlocutor`

Критерий mastery: the chunk comes as one unit under pressure.

### Грамматическая конструкция

`meaning contrast → model examples → structured input → choose form → listen and reconstruct → transform → say aloud → personalize → unannounced later use`

Критерий mastery: learner uses the construction while communicating, not only in a quiz.

### Pronunciation feature

`perception contrast → articulatory cue → model phrase → slow production → natural speed → record/compare → own phrase → intelligibility check`

Критерий mastery: the feature improves comprehensibility in a real phrase.

### Listening feature

`natural audio → identify problem such as reduction/linking/stress → transcript reveal → repeat segment → dictation or ordering → listen without text → summarize → new speaker transfer`

Критерий mastery: learner recognizes the feature in new audio.

### Discourse strategy

`context example → function label → 2-4 phrases → controlled role-play → complication → AI/peer interaction → feedback → live use`

Критерий mastery: learner manages the conversation, not only isolated sentences.
