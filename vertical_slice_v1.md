# VERTICAL SLICE v1 — ревизия 2

Дата: 2026-07-16 · Статус: спецификация сборки · Срок: 2–4 недели
Ревизия 2 закрывает ревью `vertical_slice_implementation_review_codex.md` (пункты 1–10 списка Галины).

---

## 0. Гейт и ратификация

**Ратификация Галины, 2026-07-16 (зафиксировано):**
- **Г-1 принято** — вход по профилю из пяти наблюдаемых признаков, не по уровню.
- **Г-2 принято** — живая практика вне core MVP; обещание сужено.
- **Г-3 принято** — пилот без аффективных ставок; целевую политику пишет Галина.
- **Г-4 принято** — маркетинг продаёт механизм, не эффект, до данных пилота.

**Статус гейта: открыт для PILOT, не для полного Production.** Всё в этом документе — пилотная сборка на 5–10 человек с ручным сопровождением. Ничто из построенного не становится production-обязательством без данных пилота и SLA-ревью состава (ожидается; состав среза, включая слой B3, помечен как Pilot-решение).

---

## 1. Одной фразой

> Один взрослый, который **понимает, но не говорит**, за ~2 недели проходит одну законченную речевую задачу: от «знаю эти слова» до «написала и произнесла это своими словами» — и мы можем **доказать данными письменного извлечения**, что осталось в доступе, а что нет.

---

## 2. Аудитория пилота — наблюдаемый профиль (Г-1)

Отбор **вручную**: Галина говорит с каждым кандидатом. Никаких численных порогов — только наблюдаемые проверки с тремя исходами: `да / нет / недостаточно данных`. `недостаточно данных` — легальный исход: кандидат не отсеивается автоматически, решение принимает Галина.

| # | Признак | Наблюдаемая проверка на собеседовании |
|---|---|---|
| P1 | Рецептивное понимание достаточно | читает текст дня 1 вслух про себя и пересказывает по-русски суть без словаря |
| P2 | Декларативное знание конструкции есть | узнаёт разницу «I've been doing / I did» при показе контраста («какая про процесс, какая про факт?») |
| P3 | Дефицит продуктивного извлечения | при просьбе «скажи по-английски: мы уложились в срок» — пауза/калька/отказ, при том что `meet a deadline` в тексте узнала |
| P4 | Минимальная устная задача с опорой посильна | с карточкой-фреймом перед глазами произносит 1–2 предложения о своей работе |
| P5 | Конкретная коммуникативная цель | называет реальную ситуацию, где ей зададут вопрос среза |
Результат фиксируется на экране входа в пилот (5 переключателей `да/нет/недостаточно данных` + заметка) — это данные пилота, не гейт приложения.

---

## 3. Коммуникативная задача и грамматика (согласованы)

**Вопрос:** *«So what have you been working on lately?»* · **Целевой опыт:** связный ответ 60–90 секунд.

**Трекаемая конструкция C2: present perfect continuous ↔ past simple.**
Выбран вариант «поменять конструкцию под промпт», а не промпт под конструкцию, потому что: (а) вопрос — самый естественный в реальной жизни, менять его — ломать задачу; (б) он **сам вызывает** `I've been working on…` — конструкция становится task-essential без принуждения; (в) контраст «процесс, который ещё идёт (I've been fixing…) ↔ завершённый факт со временем (we launched last month)» — ровно та зона, где RU-L1 ломается (в русском одно прошедшее); (г) естественный ответ на вопрос **обязан** смешивать обе формы — контраст встроен в задачу, а не в упражнение.

---

## 4. Состав среза

### Несущие конструкты (трекаются)
| Трек | Единицы | Объём |
|---|---|---|
| A3 слова | launch · improve · hire · estimate · challenging · negotiate | 6 |
| B1 коллокации | run a project · meet a deadline · solve a problem · make a decision · give feedback · take responsibility | 6 |
| B2 фреймы | I've been working on… · The thing is… · It turned out that… · What I'm trying to do is… | 4 |
| B3 фразовые | come up with · figure out · take over · sort out · put off · keep up with | 6 |
| C2 | present perfect continuous ↔ past simple | 1 |

**22 объекта + 1 конструкция. Holdout-набора нет** (см. §7).

### Что измеряется, а что проживается (Г-4, пункт 4)
- **Измеряемый исход = письменное продуктивное извлечение** (смысл→форма текстом) и **присутствие целевых единиц в письменном ответе**. Всё. Никаких заявлений об устной компетенции: ASR нет, человеческой рубрики речи нет.
- **Голос = опытный артефакт.** Запись финала — приватный артефакт «я это произнесла», ядро опыта, но **не данные об умении говорить**. В отчётах пилота голосовые артефакты считаются штуками, не оцениваются.
- Слух — среда (озвучка): не конструкт, не метрика.

---

## 5. Сессия — один цикл, 6 шагов

Единственный **полный** тип сессии + один служебный (возврат, §8). Меток T4 в контракте сессии нет: шаг 5 — опыт, не переход.

| # | Шаг | Время | Что происходит |
|---|---|---|---|
| 1 | Прайминг | 60–90 с | 4–5 единиц дня, крупно, с озвучкой |
| 2 | Встреча | 2–3 мин | связный текст дня; тап — озвучка, тап — перевод |
| 3 | Извлечение (T2) | 2–3 мин | русский смысл → английская форма, **ввод текстом, английского на экране нет**. Провал → лесенка: первая буква → выбор из 3 → показ+перепечатать; затем ретрай |
| 4 | Производство (T3) | 3–4 мин | task-essential промпт о **её** работе; письменный ответ; проверка присутствия целевой единицы по леммам; мягкий ретрай |
| 5 | **Повтор вслух** | 1–2 мин | «скажи то, что написала, вслух, целиком» — голос, приватный артефакт. **Не оценивается, ничего не измеряет** |
| 6 | Резюме | после | тёплая карточка **по письменному ответу шага 4** (пункт 6): что написала → какие единицы найдены в тексте → «а ещё так говорят» из банка. Плашка честности: «Разбор — по твоему написанному ответу. Голос остаётся личным, мы его не анализируем» |

Ритм: 14 учебных сессий. Сессии 1–5 — введение (по 4–5 единиц), 6–14 — возврат (FSRS по produce-стороне) + производство + грамматические трансформации.

---

## 6. Режим пилота и восстановление (пункт 7)

**Единственный полный режим — сознательное упрощение пилота, отступ от LX** (там четыре режима дня). Фиксируем как экспериментальное ограничение: завершение 14 сессий будет смешивать методику с выносливостью к единственному режиму — принято, когорте 5–10 это ок.

**Recovery-маршрут:** пропуск ≥2 календарных дней → хаб предлагает «Вернуться с 5 минут»: короткая сессия-возврат (до 8 due-единиц + 1 производство, без нового материала). Она **считается** учебной сессией (тип `recovery` в логе). Последовательность введения идёт по счёту сессий, не по календарю; пропуски не наказываются и нигде не называются «разрывом».

---

## 7. Измерение (пункты 4–5)

**`structural generalization` удалён** — тест на 6 нетренированных единицах после pretest-экспозиции измерял бы test–retest и prior knowledge, а не генерализацию. В пилоте измеряем **только два конструкта**:

| Когда | Что | Конструкт |
|---|---|---|
| День 0 | Претест: письменное извлечение всех 22 тренируемых единиц (смысл→форма, без подсказок; «не помню» — легальная кнопка) | базовая линия |
| ≥ день 14 (календарных от претеста) | Тот же тест, те же 22 единицы, тот же порядок | **retention тренированных** (дельта к претесту) |
| Сразу после | Новый промпт: *«Tell me about a problem you solved at work recently»* — письменный ответ + опциональный голос | **употребление тренированных в новом контексте** (какие единицы всплыли без запроса) |

Отложенный тест открывается по календарю (≥14 дней от претеста), даже если сессий меньше 14 — интервал удержания важнее полноты программы. Real-world transfer — не измеряется, нечем.

**Shadow (копится, не гейтит, в UI не показывается):** латентность ввода, глубина лесенки, would-be пороги.

---

## 8. Адаптация (только легальная)

1. **Направленный FSRS по produce-стороне** — возврат единиц планируется по извлечению смысл→форма. Отдельный store среза: контракт «produce-попытка в сессии введения» выполняется по построению.
2. **Лесенка подсказок** внутри шага 3 — адаптация в моменте, ретрай обязателен.
3. **`недостаточно данных`** — третье состояние единицы (<2 попыток): идёт в возврат, в отчёте не считается ни освоенной, ни проваленной.

Никаких bottleneck-движков, латентность ничего не решает, T5/ставок нет.

---

## 9. Хранение

Append-only лог пилота (`ie_slice_log`, без обрезки, с экспортом): `pilot-entry` (профиль P1–P5) · `pretest-item` · `session-started/completed` (тип full/recovery) · `encounter` (единица×шаг, intentional) · `retrieval-attempt` (исход, глубина лесенки, ретрай, латентность-shadow) · `production-submitted` (найденные леммы) · `voice-artifact` (факт+uri, без анализа) · `summary-shown` · `assessment-item` · `new-context-submitted` · `export`. Плюс: slice-FSRS store (produce), состояние пилота, артефакты через существующий `output.ts`. Всё локально; выгрузка — кнопкой (JSON).

## 10. Экран прогресса — только процесс и task-performance (пункт 9)

- «Сессия 9 из 14» · «Сегодня 4 из 5 достались без подсказки» (сегодняшний факт, не способность)
- «11 голосовых записей — твои, приватные»
- «I've been … появилось в твоих написанных ответах 6 раз»
- «По 3 единицам данных пока мало» (честное `недостаточно данных`)
Запрещено: «способности», «что могу», «выучено», «стало твоим», уровни, проценты курса, стрики, «молодец».

---

## 11. Контент-банк (пункт 10 — полный, курируемый)

Формат единицы: EN · RU-смысл · заметка · контекст · «а ещё так говорят» ×2 · production-промпт · леммы проверки.

### День 1 — запуск и сроки
| EN | RU | Заметка | Контекст | Ещё так говорят | Промпт (письменно, о себе) | Леммы |
|---|---|---|---|---|---|---|
| **I've been working on…** | последнее время работаю над… (процесс ещё идёт) | ГЛАВНЫЙ фрейм задачи | I've been working on a mobile app for a new client. | I've been busy with… · Most of my time goes to… | Ответь на вопрос среза: What have you been working on lately? Начни с I've been working on… | been working on |
| **run a project** | вести проект | не *lead the project* по умолчанию — run нейтральнее | It's the first time I run a project alone. | manage a project · lead a project | Какой проект ты ведёшь или вела? | run/runs/running/ran + project |
| **meet a deadline** | уложиться в срок | калька «успеть к дедлайну» → *meet* | We met the deadline, and the client was happy. | finish on time · hit the deadline | Расскажи про срок, в который вы уложились (или не уложились). | meet/met/meeting + deadline |
| **launch** | запустить (продукт/версию) | шире, чем «start» | Last week we launched the first version. | roll out · go live | Что вы запускали или запустите в этом году? | launch/launched/launching/launches |
| **come up with** | придумать | RU-L1 избегает → говорит invent | The team came up with a simple idea. | think of · invent | Что тебе приходилось придумывать на работе? | come/comes/coming/came + up + with |

**Текст дня 1** (112 слов):
> — So what have you been working on lately?
> — Quite a lot, actually. **I've been working on** a mobile app for a new client. It's the first time I **run a project** alone, so it means a lot to me. We started in May, and last week we **launched** the first version. The hardest part was the deadline: we had two weeks less than we planned. In the end the team **came up with** a simple idea — cut everything that is not necessary — and we **met the deadline**. The client was happy. Since then I've been collecting feedback and planning version two. Ask me about it in a month!

### День 2 — разобраться в проблеме
| EN | RU | Заметка | Контекст | Ещё так говорят | Промпт | Леммы |
|---|---|---|---|---|---|---|
| **The thing is…** | дело в том, что… | открывает объяснение загвоздки | The thing is, the data comes from three different systems. | The problem is… · Here's the tricky part: | Объясни одну загвоздку в твоей работе. Начни с The thing is,… | thing + is |
| **figure out** | разобраться, вычислить | не *understand* — активное распутывание | I've been trying to figure out where the error comes from. | work out · get to the bottom of it | В чём тебе нужно разобраться на этой неделе? | figure/figures/figured/figuring + out |
| **solve a problem** | решить проблему | — | Yesterday we finally solved the first problem. | fix an issue · deal with a problem | Какую проблему ты недавно решила? | solve/solved/solving/solves + problem |
| **challenging** | непростой (уважительно, без жалобы) | вежливее, чем hard/difficult | This week has been quite challenging. | tough · demanding | Что сейчас самое непростое в твоей работе? | challenging |
| **estimate** | оценить срок/объём | глагол; ударение estImate | The client asked me to estimate how much time the rest will take. | roughly how long… · give a rough estimate | Оцени письменно: сколько времени займёт твоя ближайшая задача? Начни с I estimate… | estimate/estimated/estimating |

**Текст дня 2** (103 слова):
> This week has been quite **challenging**. On Monday a client wrote that the numbers in his report looked wrong. **The thing is**, the data comes from three different systems, and nobody could say which one was lying. **I've been trying to figure out** where the error comes from since Tuesday morning. Yesterday we finally **solved** the first **problem**: one system used a different date format. Today the client asked me to **estimate** how much time the rest will take. I said two days. I hope I was right, because he is not a patient man.

### День 3 — перенять и решить
| EN | RU | Заметка | Контекст | Ещё так говорят | Промпт | Леммы |
|---|---|---|---|---|---|---|
| **It turned out that…** | оказалось, что… | прошедшее; рассказ о неожиданном | It turned out that the project was in better shape than everyone thought. | As it turned out,… · In the end it was… | Расскажи, что оказалось не таким, как ты думала. Начни с It turned out that… | turned + out |
| **take over** | принять на себя (чужое дело) | без агрессии «захватить» в рабочем контексте | I had to take over his project. | step in · take charge of | Что тебе доводилось перенимать у коллеги? | take/takes/taking/took/taken + over |
| **make a decision** | принять решение | ловушка: НЕ *accept a decision* | Somebody had to make a decision fast. | decide · make up your mind | Какое решение тебе пришлось принять недавно? | make/makes/making/made + decision |
| **hire** | нанять | — | We hired one great developer on Friday. | take on · bring in | Кого вы нанимали или хотите нанять? | hire/hired/hiring/hires |

**Текст дня 3** (98 слов):
> Last month our team lead left the company, and I had to **take over** his project. Honestly, I didn't want to. But somebody had to **make a decision** fast, and my manager chose me. **It turned out that** the project was in better shape than everyone thought: the code was clean, the client was calm. The real problem was people — we were two developers short. So for the last three weeks **I've been interviewing** candidates. We **hired** one great developer on Friday, and I've been looking for the second one ever since.

### День 4 — наладить и улучшить
| EN | RU | Заметка | Контекст | Ещё так говорят | Промпт | Леммы |
|---|---|---|---|---|---|---|
| **What I'm trying to do is…** | я пытаюсь сделать вот что… | фокусирует внимание слушателя | What I'm trying to do is protect two quiet hours every morning. | My goal is to… · I'm aiming to… | Что ты сейчас пытаешься наладить? Начни с What I'm trying to do is… | trying + to + do |
| **sort out** | разгрести, уладить | живее, чем solve, про бардак | Last week I finally sorted out the biggest time-eater. | fix · put in order | Что ты недавно разгребла или уладила? | sort/sorts/sorting/sorted + out |
| **give feedback** | дать обратную связь | не *say feedback* | I've been learning to give feedback in a new way. | share my thoughts on · review someone's work | Кому и о чём ты даёшь обратную связь? | give/gives/giving/gave + feedback |
| **improve** | улучшить | — | First what works, then one thing to improve. | make it better · polish | Что ты хочешь улучшить в своей работе? | improve/improved/improving/improves |

**Текст дня 4** (101 слово):
> My calendar is a mess: meetings, reviews, two projects. **What I'm trying to do is** protect two quiet hours every morning for real work. It sounds simple, but it isn't. Last week I finally **sorted out** the biggest time-eater — a daily status meeting that nobody needed. We replaced it with a short message in the chat. **I've also been learning** to **give feedback** in a new way: first what works, then one thing to **improve**. My team noticed the difference immediately. One developer said our reviews stopped feeling like exams. That was the best thing I heard all month.

### День 5 — ответственность и темп
| EN | RU | Заметка | Контекст | Ещё так говорят | Промпт | Леммы |
|---|---|---|---|---|---|---|
| **put off** | откладывать | RU-L1 избегает → говорит postpone | There is one task I've been putting off for a month. | postpone · delay | Что ты давно откладываешь? Скажи с put off / putting off. | put/puts/putting + off |
| **keep up with** | успевать за | — | Now I'm trying to keep up with everything else. | stay on top of · not fall behind | За чем тебе трудно успевать? | keep/keeps/keeping/kept + up + with |
| **take responsibility** | взять ответственность | + for | This year it's my turn to take responsibility for it. | be in charge of · own it | За что ты отвечаешь на работе? Скажи с responsibility. | take/takes/taking/took/taken + responsibility |
| **negotiate** | договариваться | не только «переговоры» — любой торг об условиях | I had to negotiate a new deadline with the finance team. | agree on · work out a deal | О чём тебе приходилось договариваться? | negotiate/negotiated/negotiating |

**Текст дня 5** (97 слов):
> There is one task **I've been putting off** for a month: the yearly report. Nobody likes it, but this year it's my turn to **take responsibility** for it. The funny thing — once I started, it took only two evenings. The hard part was different: I had to **negotiate** a new deadline with the finance team, because they wanted everything by Friday. We agreed on Tuesday. Now I'm trying to **keep up with** everything else: emails, reviews, and a new client who writes at midnight. It has been a long week — but a good one.

### Грамматика C2: три контраста + шесть трансформаций
Контрасты (показываются в сессиях 2–4):
1. *I've been working on the report all week* (процесс, ещё идёт) ↔ *I wrote the report last week* (закончено, есть время).
2. *She's been interviewing candidates since Monday* ↔ *She interviewed five candidates yesterday*.
3. *We've been testing the new version lately* ↔ *We tested it on Friday and found two bugs*.

Трансформации (по одной в сессиях 6–11, письменно):
Т1 «Чем ты занята последнее время? — начни с I've been …» · Т2 «Одно дело, которое ты закончила на прошлой неделе — past simple + last week» · Т3 «С понедельника разбираешься с проблемой, она не решена — I've been … since Monday» · Т4 «Вчера вы приняли решение — одним предложением в past simple» · Т5 «Что давно откладываешь — I've been putting off … for …» · Т6 «Что вы запустили и когда — We launched … in/on …»

**Новый контекст (после дня 14):** *Tell me about a problem you solved at work recently.*

⚠️ Банк написан мной как черновик уровня B1 — **до запуска пилота его вычитывает Галина/SLA-специалист** (частотность и RU-ловушки выбраны по профилю из content_selection_v2, но это ревьюится).

---

## 12. Вырезано (замок)
Веб целиком · Библиотека/Словарь/Люди/Профиль-переделки · вечерний круг · YouTube/импорт · лендинг/оплата/авторизация · онбординг · уведомления · движок узких мест · стражи и ставки · T5/сжатие · живая практика · AI-runtime · ASR · holdout-набор · стрики · миграции общей БД.

## 13. Готово, когда
1. Человек проходит претест → 14 сессий (с возвратами) → отложенный тест → новый контекст без нашего вмешательства.
2. Из `ie_slice_log` для любой единицы восстанавливается: где встречалась, какие попытки, в каком направлении.
3. Претест и отложенный тест сравнимы по тем же 22 единицам в том же порядке.
4. Ни один экран не заявляет способность/устную компетенцию; резюме явно помечено «по написанному ответу».
5. Shadow-метрики не видны и не влияют.

## 14. Что срез НЕ доказывает
Устную компетенцию (нет ASR/рубрики) · автоматизм · уровень · перенос в жизнь · произношение · удержание дольше окна теста. **Доказывает:** дельту письменного продуктивного доступа к 22 единицам через ≥14 дней + употребление их в новом письменном контексте.
