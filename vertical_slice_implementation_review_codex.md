# Review of Vertical Slice Implementation

Роль: независимый Chief Learning Architect и Product Architect  
Ревьюер: Codex  
Дата: 2026-07-16  
Проверяемый коммит: `3d9bda0`  
Проверяемый артефакт: `vertical_slice_v1.md`

Источники проверки:

- `integrated_learning_blueprint.md`;
- `adr/ADR-001…020`;
- `architecture_resolution.md`;
- `architecture_resolution_review_codex.md`;
- `learning_experience/`;
- существующий код `apps/mobile/`, `apps/web/`, `packages/core/`.

## Итоговый вердикт

**Vertical Slice ещё не реализован.** Коммит `3d9bda0` добавляет один файл — `vertical_slice_v1.md`, 198 строк. Изменений в `apps/mobile`, `apps/web` или `packages/core` в коммите нет.

Поэтому фактическое соответствие runtime-поведения Blueprint, ADR, Resolution и Learning Experience подтвердить нельзя. Можно проверить только соответствие **спецификации будущей реализации**.

Оценка спецификации:

| Источник | Вердикт |
|---|---|
| Integrated Blueprint | **Partially follows** |
| ADR | **Partially follows** |
| Architecture Resolution | **Does not yet pass the implementation gate** |
| Learning Experience | **Partially follows; material experience regressions remain** |
| Actual code | **Not implemented in reviewed commit** |

Спецификацию нельзя передавать в реализацию как полностью утверждённую без закрытия критических пунктов ниже.

---

## Critical findings

### 1. Reviewed commit contains no implementation

**Status:** Not implemented  
**Severity:** Critical

Коммит добавляет только `vertical_slice_v1.md`. Заявленные элементы отсутствуют как новые реализации:

- новый 14-дневный session flow;
- pretest/day-14 assessment;
- holdout assignment;
- ladder with retries;
- `insufficient evidence`;
- trainer summary;
- новый progress screen;
- vertical-slice data contract;
- append-only encounter/evidence model с указанными сущностями.

Существующий код содержит отдельные предпосылки — FSRS, produce-direction, output artifacts, session screen, voice recording, — но это не доказывает, что они собраны в описанный Vertical Slice.

**Exact reason:** невозможно проверить «implementation still follows», потому что implementation в проверяемом коммите отсутствует.

### 2. Architecture Resolution gate has not been passed

**Status:** Still unresolved  
**Severity:** Critical

`vertical_slice_v1.md` утверждает, что Blueprint, ADR, Resolution и LX «приняты как утверждённые». Но `architecture_resolution.md` требует ратификации Г-1…Г-4 до старта Production. В репозитории нет зафиксированных подписей или изменения статуса этих решений.

Кроме того, `specifications/README.md` прямо задаёт порядок разблокировки:

1. подписи Г-1…Г-4;
2. исправление mechanism-claim;
3. SPEC-01;
4. затем SPEC-02 Vertical Slice с зависимостями от SPEC-01, SPEC-05, SPEC-06 и SLA-review.

Эти спецификации не созданы. Вместо предусмотренного `specifications/vertical_slice_definition.md` появился корневой `vertical_slice_v1.md`, который объявляет себя specification for build.

**Exact reason:** Pilot specification создана до обязательных upstream specifications и без зафиксированного SLA-review.

### 3. Spoken target is measured mainly through text

**Status:** New contradiction introduced  
**Severity:** Critical

Целевая задача определена как связный **устный** ответ 60–90 секунд. Однако:

- T2 измеряется текстовым вводом;
- production проверяется лемматизацией текста;
- pretest и day-14 retention выполняются текстом;
- voice artifact не оценивается;
- ASR и speaking rubric отсутствуют;
- слух и произнесение исключены из наблюдаемых конструктов.

При этом документ говорит, что срез доказывает «доступ к языку в речевой задаче» и заявляет законченный речевой результат.

Фактически измеряется продуктивное письменное извлечение и наличие целевых форм в текстовом ответе. Сам факт записи голоса доказывает только создание артефакта, а не устный доступ, связность или 60–90-секундный речевой результат.

**Blueprint impact:** A3/C2 могут проверяться контролируемо, но E1 speaking и устный transfer не доказаны.  
**LX impact:** обещание «сказала своё и меня услышали» не подтверждается измерением.

### 4. Target grammar does not match the task prompt

**Status:** New contradiction introduced  
**Severity:** Critical

Основной вопрос — `What have you been working on lately?` — естественно вызывает **present perfect continuous**: `I've been working on…`.

Но трекаемый C2-конструкт определён как:

- present perfect для опыта/результата;
- past simple для завершённого времени.

В контенте одновременно используется фрейм `I've been working on…`, то есть другая грамматическая форма и другое aspectual значение.

Следовательно, задача не делает заявленный C2-контраст task-essential. Ученик может успешно ответить через present perfect continuous и past simple, не процедурализируя заявленный present perfect experience/result.

**Exact reason:** prompt, target frame и измеряемая grammar construction не совпадают.

### 5. Holdout design does not yet implement ADR-016 correctly

**Status:** Still unresolved  
**Severity:** Critical

Шесть holdout-единиц проходят pretest на дне 0 и тот же тест на дне 14. Поэтому они уже не являются полностью неэкспонированными: pretest сам является exposure и retrieval event.

Повтор тех же единиц на day 14 может измерять:

- test–retest effect;
- retention от pretest exposure;
- prior knowledge;
- uncontrolled exposure;

но не автоматически structural generalization.

Дополнительно три новые коллокации и три фразовых глагола не образуют structural generalization без явно определённой общей структуры и matched-set protocol. SPEC-04, который должен был операционализировать эти определения, отсутствует.

**Exact reason:** label `structural generalization` присвоен тесту, измерительный конструкт которого ещё не определён.

---

## High-severity alignment findings

### 6. T4 is named without the required evidence

**Status:** Partially follows  
**Source:** Blueprint + Resolution

Шаг 5 помечен `T4-зачаток` и просит сказать то же самое быстрее. Но Blueprint связывает T4 с повторением с вариацией и снижением controlled-processing load, а Resolution запрещает T4 claims до валидного измерителя.

Документ не выдаёт полноценный T4 outcome-claim, что правильно. Однако переход всё равно маркируется как T4 внутри session contract, хотя voice attempt не оценивается и would-be T4 gate находится в Shadow Mode.

**Implementation risk:** разработка или аналитика позднее может начать трактовать завершение шага 5 как прохождение T4.

### 7. The slice drops the four-mode and recovery experience

**Status:** Does not follow Learning Experience  
**Severity:** High

Learning Experience определяет четыре режима дня, включая минимум 5–8 минут и recovery. Vertical Slice разрешает ровно один полный session type и требует один и тот же полный микроцикл на протяжении 14 дней.

Это устраняет прежнее противоречие mechanism-claim только ценой удаления:

- minimum day;
- retrieval-only day;
- recovery after interruption;
- adaptation to available time and energy;
- graceful return after a missed day.

Для 5–10 человек и validation pilot такое сужение возможно, но документ не должен утверждать полное соответствие LX. Это сознательный экспериментальный отступ от LX.

**Long-term implementation risk:** завершение «14 дней без вмешательства» будет смешивать качество методики с выносливостью пользователя к единственному полному режиму.

### 8. Feedback summary cannot truthfully describe the voice output

**Status:** Implementation risk  
**Severity:** High

Шаг 6 обещает показать:

- что ученик сказал;
- какие единицы «у него вышли»;
- альтернативные формулировки.

Но runtime AI отсутствует, ASR отсутствует, voice artifact не оценивается. Следовательно, резюме может быть основано только на текстовом шаге 4 или на заранее заданном шаблоне.

Если UI визуально связывает резюме с голосовой записью, он создаёт ложное впечатление, что система услышала и поняла речь.

**LX impact:** принцип «меня услышали» превращается в симуляцию, если источник summary не обозначен честно.

### 9. Progress screen mixes process evidence and capability language

**Status:** Partially follows  
**Severity:** High

Корректные process facts:

- количество голосовых артефактов;
- количество употреблений конструкции;
- количество дней практики.

Но заголовок говорит «Наверху — способности», хотя приведённые показатели в основном относятся к evidence classes 2–3. Формулировка `9 из 22 достаются от смысла без подсказки` может быть task-performance, но не устойчивая способность без delayed evidence.

`Present perfect вышел 6 раз` также требует grammar-validity check, которого в спецификации нет.

**Blueprint/Resolution risk:** локальный task performance может быть показан как capability до day-14 retention.

### 10. B3 was added beyond the resolved bearing tracks

**Status:** Partially follows ADR/Resolution  
**Severity:** High

Architecture Resolution называет несущими треками A3+B1/B2+одну зону C2. Vertical Slice добавляет B3 и сразу выделяет под него шесть из 22 объектов.

B3 может быть методически уместен, но в репозитории нет зафиксированного SLA-review, который подтверждает состав вертикального среза. Поэтому добавление пока является не разрешённым архитектурным нарушением, а непроверенным Pilot-решением.

### 11. Content alignment cannot be verified

**Status:** Not verifiable  
**Severity:** High

Спецификация требует:

- шесть A3-единиц;
- пять связных текстов;
- task-essential prompts;
- grammar contrasts;
- matched holdout sets;
- register notes;
- lemma patterns.

Этого контент-банка в коммите нет. Поэтому невозможно проверить:

- частотность и dispersion;
- уровень и coverage текстов;
- соответствие RU-L1;
- естественность коллокаций и фразовых;
- task-essentiality;
- matched quality holdout-наборов;
- пригодность для одного 60–90-секундного ответа.

---

## Existing-code conflicts

Эти пункты не являются дефектами коммита `3d9bda0`, потому что он не меняет код. Они показывают, что существующая система ещё не соответствует новой спецификации.

### 12. Existing FSRS pipeline does not implement same-session produce for new units

В `packages/core/srs.ts` produce-card создаётся только после двух successful recognition repetitions (`PRODUCE_AFTER_REPS = 2`). Vertical Slice требует produce-attempt в той же сессии введения.

Без отдельного slice flow существующий pipeline нарушает ADR-011/Vertical Slice timing contract.

### 13. Current data structures are not the resolved contract

В существующем коде нет найденных реализаций:

- `ContentObject` с `contentVersionId`;
- `HoldoutAssignment`;
- `AssessmentEvidence` с transfer type;
- `insufficient evidence` state;
- ladder depth/retry attempt schema;
- pretest/day-14 protocol.

Текущие SRS и output stores полезны, но не эквивалентны ADR-015 contract.

### 14. Current session is not the six-step Vertical Slice session

Существующий mobile session использует иной набор фаз и существующие level packs. Изменений, связывающих его с 22 objects, five texts, pretest, holdout и day-14 flow, нет.

---

## Alignment matrix

| Requirement | Blueprint | ADR | Resolution | LX | Spec status |
|---|---:|---:|---:|---:|---|
| Один вертикальный communicative slice | да | да | Pilot | совместимо | **Aligned in intent** |
| A3/B1/B2/C2 as core | да | да | Pilot | да | **Aligned, B3 added without review** |
| T1→T3 with output same session | да | да | да | да | **Aligned in specification, not implemented** |
| T4/T5 claims prohibited | да | да | да | да | **T5 excluded; T4 label remains risky** |
| No affective stakes | — после Resolution | да | да | безопасный выход | **Aligned** |
| AI runtime excluded | допустимо | да | да | narrower than LX | **Aligned** |
| Feedback after output | да | да | да | да | **Aligned in timing; source of summary unclear** |
| Curated sequence, adaptation in Shadow | да | да | да | partially | **Aligned** |
| Append-only exposure/evidence | да | да | да | да | **Specified, not implemented** |
| Pretest + transfer taxonomy | да | да | Pilot | да | **Conceptually aligned; protocol invalid/incomplete** |
| No proficiency claim | да | да | да | да | **Aligned** |
| Four modes/minimum/recovery | да | modified by ADR | not prohibited | explicit | **Not followed in slice** |
| Manual pilot entry | compatible | compatible | G-1 pending | compatible | **Reasonable pilot shortcut; gate not ratified** |
| Voice as central experience | да | compatible | compatible | explicit | **Present as artifact, not as measured outcome** |

---

## What is correctly preserved

Следующие решения перенесены корректно:

- одна коммуникативная задача вместо горизонтального набора модулей;
- directed meaning→form retrieval;
- английская форма скрыта до попытки;
- связный контекст вместо россыпи предложений;
- собственное содержание ученика в production;
- feedback после output, без перебивания;
- curated content bank вместо runtime generation;
- отсутствие CEFR/proficiency claims;
- отсутствие T5, ставок, ASR-scoring, community и live-transfer claims;
- separate recognize/produce state как намерение модели;
- append-only exposure/evidence как обязательное требование;
- latency и would-be gates только в Shadow;
- real-world transfer честно не заявляется;
- процесс не называется «выучено»;
- нет streak language, баллов и пустой похвалы.

---

## Release verdict

### Specification review

**Partially compliant. Do not treat as implementation-ready yet.**

Перед передачей в код должны быть закрыты как минимум:

1. статус и ratification implementation gate;
2. SLA-review состава Vertical Slice;
3. согласование target prompt с C2 grammar construct;
4. точное разграничение письменного retrieval outcome и устного target experience;
5. корректный transfer/holdout protocol;
6. честный источник trainer summary без ASR/AI-runtime;
7. статус minimum/recovery mode для 14-дневного пилота;
8. content bank, без которого curriculum alignment не проверяется.

### Code review

**Not reviewable as Vertical Slice implementation.** В проверяемом коммите нет кода Vertical Slice. После появления реализации требуется отдельная проверка:

- session state machine;
- persistence/event model;
- FSRS direction and scheduling;
- pretest/day-14 comparability;
- holdout contamination;
- voice artifact privacy and recovery;
- progress copy versus evidence classes;
- end-to-end 14-day simulation;
- failure/restart/offline/export behavior.
