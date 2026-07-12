# 15 · UX-аудит Intensive English

Дата: 2026-07-12  
Автор: Codex  
Источник задания: промпт UX-аудита из вложения `a7cfe491-faf9-422a-a0c1-5518e0570730/pasted-text.txt`  
Ограничение: папку `feedback/` и отчёты Fable5 не использовал. Аудит сделан по проектным документам, дизайн-хендoff и живому коду.

## Короткий вердикт

Продукт стал намного ближе к правильной методике, чем в ранней версии: мобильная и web-сессия уже имеют 4-фазный цикл, перевод на родном языке присутствует, грамматический builder уже исправлен в сторону “сначала слушать, потом собирать”, навигация почти приведена к 5 главным разделам.

Но UX всё ещё находится в опасной промежуточной фазе: новый продуктовый договор уже написан в `13_app_logic.md`, часть экранов ему следует, а часть старой архитектуры всё ещё живёт в dayplan, маршрутах, профиле, онбординге и отдельных навыках. Главный риск не визуальный. Главный риск - пользователь не почувствует один ясный путь “я уже понимаю → я начинаю говорить”, потому что приложение всё ещё периодически превращается в набор модулей.

Если сказать жёстко: сейчас Intensive English выглядит как сильная методическая лаборатория, которая почти стала продуктом. Нужно дорезать не “красоту”, а продуктовую дисциплину: один дневной цикл, один речевой финал, одна логика языков, один тон, один путь прогресса.

## Что я проверял

- Продуктовый контракт: `13_app_logic.md`, `14_landing_copy.md`, `README.md`.
- Дизайн-хендoff: `docs/design/README.md`, `docs/design/project/slices-v2/mobile/*.html`, `docs/design/project/slices-v2/web/*.html`.
- Живой код mobile: `apps/mobile/src/app`, `apps/mobile/src/lib/i18n.ts`, `apps/mobile/src/components`.
- Живой код web: `apps/web/src/app`, `apps/web/src/components`.
- Core: `packages/core/dayplan.ts`, `packages/core/output.ts`, `packages/core/srs.ts`, `packages/core/data/grammar.ts`.

## 1. First Impression

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Приложение сразу обещает “сессию дня”, но местами всё ещё показывает следы большого учебного комбайна. | High | `13_app_logic.md:24-35` требует один следующий шаг и не стрики; Today уже показывает главную сессию, но после неё остаются `GuardianCard` и coach-вход в `apps/mobile/src/app/(tabs)/index.tsx:334-362`; core dayplan всё ещё хранит 8 шагов в `packages/core/dayplan.ts:27-108`. | Первый пользователь не должен думать, “куда теперь нажать”: сессия, словарь, тренер, страж, клуб, навыки. Даже если всё полезно, ощущение перегруза остаётся. | Метод требует снижения тревоги и входа в поток. Лишние входы перед речью конкурируют за внимание и снижают вероятность завершить цикл. | Первый экран: только сессия дня, честные часы, SRS, вечерний вход. Guardian/coach показывать контекстно: после паузы, в профиле, в People, в weekly review. | Выше старт первой сессии, меньше раннего отвалива, яснее продуктовая идея. |
| Web всё ещё персонализирован под “Галину”, хотя мастер-документ запрещает именованное присутствие в приложении. | High | `13_app_logic.md:18` и `13_app_logic.md:35` говорят, что Галина только на лендинге/письмах. Web Today приветствует “Галина” в `apps/web/src/app/page.tsx:29-57`; sidebar показывает “Галина” в `apps/web/src/components/AppShell.tsx:59-69`. | Для реального пользователя это ломает магию персонализации: приложение выглядит демо-стендом, а не моим пространством. | Персональное обращение усиливает habit loop только если оно моё. Неверное имя снижает доверие к данным и адаптации. | Ввести `displayName` или нейтральное “Сегодня”; пока имени нет - не показывать имя. Убрать Галину из app shell. | Быстрый рост доверия и ощущение “это настроено под меня”. |

## 2. Onboarding

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Mobile onboarding всё ещё 10 шагов с факт-экранами вместо 4 шагов ≤90 секунд. | Critical | Мастер-документ: `13_app_logic.md:48-56`. Mobile flow: `welcome → lang → goal → hours → method → interests → skills → level → deadline → summary` в `apps/mobile/src/app/onboarding.tsx:45-69`. | Человек пришёл попробовать английский, а попадает в лекцию о методе. Это повышает стоимость входа до первого “я понял/сказал”. | До первой языковой победы нельзя грузить методологией: рабочая память занята объяснениями, не языком. | Mobile: 4 шага: родной язык + язык интерфейса, жизненная цель, время+уровень, барьер/страж. Факты перенести в лендинг, email, “Почему так работает” в профиле. | Сильное снижение drop-off до первой сессии. |
| Web onboarding короче, но фиксирует `uiLang: "ru"` и не даёт выбрать язык интерфейса отдельно. | High | Web сохраняет `savePrefs({ nativeLang, uiLang: "ru", goal, topics, level })` в `apps/web/src/app/onboarding/page.tsx:42-48`; мастер-документ требует разделить язык мышления и язык интерфейса в `13_app_logic.md:48-50`. | Русская пользовательница может хотеть английский интерфейс, но русский перевод слов; сейчас web silently ломает эту модель. | Перевод на родной язык - опора смысла. Язык интерфейса - среда. Если смешать, пользователь либо теряет опору, либо не получает immersion. | В первом шаге сделать два выбора: “Родной язык для переводов” и “Язык интерфейса”. В prefs хранить независимо. | Меньше раздражения, больше контроля, выше retention у билингвальных/экспатских пользователей. |
| В онбординге нет явного выбора “барьер/страж”, хотя психология заявлена как отличие продукта. | High | Мастер-флоу требует барьер-страж в `13_app_logic.md:48-50`; mobile `FLOW` не содержит guardian/barrier step в `apps/mobile/src/app/onboarding.tsx:57-69`; web steps только родной язык, цель, темы, уровень в `apps/web/src/app/onboarding/page.tsx:20`. | Пользователь не понимает, что приложение видит не только английский, но и “почему я бросаю/молчу”. | Без первичной гипотезы о барьере психологический слой становится случайной карточкой, а не системой поддержки привычки. | Четвёртый шаг: “Что обычно мешает говорить?” с 4 стражами. Сохранить как initial guardian tendency, не диагноз. | Лучше эмоциональный fit и сильнее отличие от LingQ/Duolingo/обычных тренажёров. |

## 3. Information Architecture

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Визуальная навигация почти правильная, но системная IA всё ещё хранит старую карту модулей. | High | Mobile tabs уже 5 в `apps/mobile/src/app/(tabs)/_layout.tsx`. Web sidebar уже 5 в `apps/web/src/components/AppShell.tsx:13-19`. Но `DAY_STEPS` всё ещё содержит pronunciation, typing, grammar, reading, shadowing, evening как дневные шаги в `packages/core/dayplan.ts:48-108`. | Пользователь может не видеть весь чеклист, но логика “день = закрыть много модулей” остаётся и просачивается в evening summary, profile, progress. | Методика должна ощущаться как один цикл с разными фазами, а не как школьное расписание предметов. | Разделить `DayCycle` и `SkillCatalog`: dayplan считает только session, SRS, evening; навыки живут как optional/library formats. | Архитектура перестанет возвращать старый UX при каждой новой фиче. |
| Legacy routes живы как самостоятельные сущности: `/produce`, `/roles`, `/three`, `/sounds`. | Medium | `13_app_logic.md:248-264` решает их слить/убрать. По коду они всё ещё есть: `apps/mobile/src/app/produce.tsx`, `apps/mobile/src/app/roles.tsx`, `apps/mobile/src/app/three.tsx`, `apps/mobile/src/app/sounds.tsx`; поиск также показывает ссылки из Library/Listen. | Даже если они спрятаны, команда и будущие экраны будут снова вытаскивать их как отдельные продукты. | Разрыв “понимаю, но не говорю” закрывается повторяемым ритуалом. Отдельные упражнения дробят ритуал. | Оставить движки, но переименовать внутренне: `phase4/produce`, `formats/dialogue`, `attune/micro`, `shadowing/sounds`; убрать прямые top-level входы из пользовательского пути. | Меньше расползания продукта, проще объяснять метод. |

## 4. Cognitive Load

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Профиль перегружен метриками и всё ещё содержит streak/flame. | High | Мастер-документ запрещает стрик-язык как мотивационную механику в `13_app_logic.md:30` и `13_app_logic.md:136`. Mobile profile использует `useStreak`, flame и milestones в `apps/mobile/src/app/(tabs)/profile.tsx`. | Профиль превращается в отчётность, а не в спокойный пульт режима. Flame ассоциируется с Duolingo-like давлением. | У взрослых с историей “я бросила” стрик усиливает shame loop. Это прямо против психологии продукта. | Оставить “постоянство” как факты: “12 честных дней практики за месяц”, “пауза не потеря”. Убрать огонь, milestone stars, язык “подряд” из главного блока. | Меньше тревоги, выше возвращаемость после пропусков. |
| Сессия mobile показывает много сущностей одновременно: слово, IPA, перевод, аудиоволна, пример, кнопки, темп. | Medium | Word card в `apps/mobile/src/app/session.tsx:503-633`. | В спокойном темпе это полезно; в быстром темпе пользователь не успевает прочитать всё, особенно перевод и пример. | Перегрузка работает только когда внимание направлено. Если всё конкурирует, мозг сканирует UI, а не впитывает язык. | Режимы отображения: sound-on = word + large native translation + audio; no-sound = word + IPA + translation; example ниже/после остановки. | Больше понимания в потоке и меньше жалоб на скорость/озвучку. |

## 5. Learning Psychology

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Психологический слой пока добавлен как карточка, а не как поведенческая система. | High | Принцип “страж появляется по детектору, не по расписанию” в `13_app_logic.md:32`; Today всегда рендерит `GuardianCard` в `apps/mobile/src/app/(tabs)/index.tsx:334-335`. | Если страж возникает на главной “просто так”, он ощущается как декоративная психология. | Состояние/барьер должен появляться в момент трения: пауза перед записью, многократный skip, долгий выход из сессии. Тогда это помогает действию. | Ввести guardian triggers: pause before mic > N sec, repeated back/skip, no output after input, return after pause. На Today показывать только краткий факт пути после события. | Психология станет инструментом продолжения, а не контентом. |
| В вечернем круге заявлена адаптация завтрашнего дня по состоянию, но в dayplan этого ещё не видно. | High | Требование: `13_app_logic.md:120-125`, `13_app_logic.md:276`; `buildDayPlan` сейчас зависит только от time/SRS в `packages/core/dayplan.ts:127-158`. | Пользователь отвечает “устала”, но завтра не видит, что приложение это уважило. | Habit loop строится на доверии: если состояние не влияет на нагрузку, чек-ин становится декоративным. | Добавить `checkinState` в dayplan: tired → shorter session/default slow; energized → more output; heavy → guardian support before mic. | Сильный рост ощущения “меня ведут”, а не “меня опрашивают”. |

## 6. Language Learning

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Главная сессия уже правильная по структуре, но контекст пока берётся из отдельных example-фраз, а не из живого пользовательского материала. | High | Mobile context берёт `words.filter((w) => !!w.exEn).slice(0, 5)` в `apps/mobile/src/app/session.tsx:640-660`; web session использует pack context, но Today defaults to `/session/health` в `apps/web/src/app/page.tsx:189-192`. | Пользователь хочет “мой английский для моей жизни”, а видит учебные примеры. | Перенос в активную речь сильнее, когда контекст смысловой и личный: подкаст, письмо, видео, статья, ситуация. | MVP: после выбора интересов формировать session context из 1 живого мини-текста/диалога; позже - import link → lesson in 1 minute. | Больше transfer to real speech, сильнее “это моё”. |
| SRS produce правильный по механике, но всё ещё отдельный экран, а не финал каждого флеш-круга. | High | Мастер: финал флеш-круга = активный вывод в `13_app_logic.md:114`; отдельный mobile `ProduceScreen` в `apps/mobile/src/app/produce.tsx:16-21`; Today ведёт в `/produce` при due в `apps/mobile/src/app/(tabs)/index.tsx:288-293`. | “Скажи сама” воспринимается как дополнительная обязанность, а не естественный конец повторения. | Productive retrieval должен быть встроен в тот же ритм, где слово вернулось. Иначе пользователь может делать recognition без speech. | Слить `/produce` в SRS flow: 3-5 карточек → одна фраза своими словами с любым словом → OutputArtifact. | Больше активных слов, меньше разрыва “узнаю, но не говорю”. |
| Грамматический паттерн “сначала слух, потом сборка” есть, но он пока isolated. | Medium | Web grammar уже говорит “Сначала прослушай...” и не показывает ответ до верного выбора в `apps/web/src/app/grammar/page.tsx:25-32`, `apps/web/src/app/grammar/page.tsx:315-390`. | Хорошая правка может остаться только в grammar page, а phase 4 formats будут развиваться несогласованно. | Грамматика через слух и трансформацию должна стать стандартным компонентом фазы 4, не отдельной страницей. | Вынести `ListenThenBuild` как общий паттерн для grammar, phrase builder, dialogue. Везде: audio first, blank, distractors, no answer until attempt, final say aloud. | Последовательный метод, меньше “почему мне сразу дали ответ?”. |

## 7. Emotional Experience

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Тон в документах взрослый, но в коде остались emoji/смайлы и местами “милые” паттерны. | Medium | Мастер-фильтр: никаких эмодзи в `13_app_logic.md:238-244`. В web onboarding result есть 🙂 в `apps/web/src/app/onboarding/page.tsx`; mobile/profile используют иконографию flame/star. | Для ЦА 30-55 это может выглядеть как детское приложение, особенно рядом с психологическим позиционированием. | Взрослый мозг легче доверяет спокойному тону без “похлопываний”. | Убрать emoji из product UI, оставить иконки только функциональные; заменить flame/star на тихие факты. | Более зрелый премиальный тон. |
| “Клуб/люди” появляются рано, хотя социальная безопасность ещё не доказана. | Medium | Today web показывает card “Разговорный клуб” в `apps/web/src/app/page.tsx:260-300`; mobile Today coach line в `apps/mobile/src/app/(tabs)/index.tsx:337-362`; правила People описаны в `13_app_logic.md:186-192`. | Пользователь с языковым стыдом может испугаться “людей” до первой личной победы. | Социальная практика должна идти после безопасного микровывода, иначе усиливает freeze. | На Day 1 People показывать как “позже, когда будет готова”; вход активнее после 3-5 OutputArtifacts. | Меньше страха, выше готовность к клубу позже. |

## 8. AI Experience

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| AI пока не имеет чёткой роли в главном цикле. | High | Мастер говорит про AI-фидбек как paid gate в `13_app_logic.md:205`; app сейчас сильнее про локальные flows/SRS/output, чем про AI conversation. | Если AI появится как отдельный “чат”, он будет конкурировать с методом. Если не появится вообще, обещание AI conversations слабее. | AI полезен после output: переформулировать, дать 1 мягкую поправку, предложить следующую реплику. До output он часто превращается в пассивное потребление. | Роль AI: “coach after you speak/write”. Формат: пользователь сказал 2-3 фразы → AI отвечает 1) понял смысл, 2) одна розовая поправка, 3) один следующий вариант. | AI усилит speech loop, а не станет игрушкой сбоку. |
| Нет отдельного UX для приватности AI-аудио/текста. | High | Output private-by-default описан в `packages/core/output.ts`; privacy-принцип в `13_app_logic.md:33`, `13_app_logic.md:232`. | Пользователь может не захотеть отправлять голос/дневник в AI без явного согласия. | Речевая практика требует уязвимости. Без ясной приватности взрослый пользователь будет меньше записывать голос. | Перед AI-feedback: “Отправить этот текст/аудио тренеру AI?” с опцией local-only. В профиле - consent center. | Больше голосовых записей и меньше скрытого недоверия. |

## 9. Daily Habit

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Dayplan считает закрытие дня по нескольким hidden modules, а не по “сделала главный цикл”. | High | `DAY_STEPS` содержит 8 шагов, `current` ищет первый незакрытый в `packages/core/dayplan.ts:27-158`; Today прячет часть, но evening summary всё ещё мапит `steps` в `apps/mobile/src/app/(tabs)/index.tsx:115-142`. | Пользователь видит, что “что-то осталось”, даже если она сделала главное. | Для привычки важна завершённость. Незакрытые хвосты создают ощущение долга. | День закрыт, если сделана сессия или SRS+output minimum; остальное - bonus practice. | Больше completed days и меньше “я опять не всё сделала”. |
| Утро/вечер хорошо задуманы, но нет ясного return route после паузы. | Medium | Return after pause прописан как край в `13_app_logic.md:79`, но в inspected app не увидел отдельного route/state. | Через 3-10 дней пропуска пользователь особенно хрупок; обычная Today может быть слишком большой. | Возвращение - ключевой habit moment. Нельзя просто возвращать в стандартный план. | Если gap > 2 days: Today becomes “Вернуться с 5 минут” + micro-session + no debt copy. | Существенно выше реактивация. |

## 10. Long-Term Engagement

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| “Что я теперь могу” есть в документах и профиле, но пока уступает часам/словам/статистике. | High | Master says progress = честные часы + capabilities in `13_app_logic.md:18`, `13_app_logic.md:68-69`; Profile has many rows before capability block in `apps/mobile/src/app/(tabs)/profile.tsx`. | Долгий путь держится не на “86 часов”, а на “я смогла заказать/ответить/объяснить”. | Outcome-based motivation поддерживает transfer. Pure metrics поддерживают только compliance. | В Progress/Profile поставить capabilities наверх: “Теперь я могу...” + evidence artifacts. Часы вторым слоем. | Более сильная долгосрочная мотивация и premium-feel. |
| История пути со стражами не связана с языковыми достижениями. | Medium | Guardians есть как data/card; output artifacts есть; явной timeline связи не видно. | Психологическая идея сильная, но пока не превращается в “я меняюсь”. | Изменение привычки закрепляется, когда человек видит: был барьер → был маленький шаг → есть новый артефакт. | Timeline: “Страж перфекционизма пришёл, ты всё равно записала 2 фразы”. | Уникальная эмоциональная память продукта. |

## 11. Conversion

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Paywall должен идти после речевого aha-moment, иначе продукт будет продавать обещание, а не опыт. | High | Монетизация: paywall after value в `13_app_logic.md:196-207`; landing copy обещает first session/free. | До первой своей фразы пользователь не понимает, за что платить. | Платить стоит за продолжение эффективного режима, не за доступ к объяснениям. | Gate после первой завершённой сессии + 1 saved OutputArtifact: “Вот твоя первая фраза. Продолжить путь”. | Выше конверсия без давления. |
| “Бесплатный режим навсегда” должен быть равноправным визуально. | Medium | Мастер требует free option same size in `13_app_logic.md:203-205`. Нужно отдельно проверить pricing implementation перед релизом. | Если free выглядит спрятанным, доверие к взрослому тону падает. | Манипулятивная монетизация вызывает avoidance, особенно у аудитории с недоверием к edtech. | Paywall layout: paid options + “Остаться на бесплатном” тем же кеглем, без shame copy. | Доверие, меньше refund/cancel frustration. |

## 12. Visual Design

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Визуальная система уже смягчилась, но конфликтует с текущим желанием “не мрачно, много цвета, motion”. | Medium | Design handoff Living Content задаёт светлые mobile/web slices; code использует Marina palette and warm cards. Но focus/вечер и старые botanical elements могут снова увести в тяжёлую “методическую” атмосферу. | Пользователь хочет ощущение движения, жизни, пути. Слишком серьёзная палитра делает продукт терапевтическим кабинетом. | Цвет и motion могут поддерживать flow, если они привязаны к фазам навыков, а не декоративны. | Оставить светлую базу. Цвета навыков использовать как навигационные сигналы. Motion: переходы фаз, progress path, word flow, living content cards. Focus dark только для evening/session focus. | Современнее, легче, ближе к “я двигаюсь”. |
| Typography logic правильная в документах, но местами интерфейсный текст становится слишком крупным/плотным для mobile. | Medium | Mobile session word+translation sizes in `apps/mobile/src/app/session.tsx:525-553`; Today uses dense cards; onboarding uses many fact screens. | На маленьком экране взрослый пользователь быстро устает от больших блоков текста. | При высокой скорости learning UI должен быть мгновенно считываемым. | Для fast mode: 2-line max, large word + equal-large translation; explanations only after pause/bottom sheet. | Выше readability, меньше “не успеваю прочитать перевод”. |

## 13. Missing Features

| Issue | Severity | Evidence | Why this hurts users | Why this hurts learning | Recommended redesign | Expected impact |
|---|---:|---|---|---|---|---|
| Нет полноценного “импорт своей ссылки → урок за минуту” как центрального promise. | High | Master Library promises import in `13_app_logic.md:151`, landing copy тоже делает “Translate your life into English” центральным. Current inspected flows больше pack/catalog based. | Без своего контента продукт менее отличается от LingQ и обычных course apps. | Own content даёт personal relevance, а relevance усиливает encoding/retrieval. | MVP import: paste URL/text → extract 12-20 words + 1 context passage + phase 4 question. Даже без идеального AI сначала можно шаблоном. | Сильный aha-moment и product differentiation. |
| Нет month assessment: понимание и речь отдельно. | Medium | Master требует monthly levelcheck + speaking sample в `13_app_logic.md:66-69`; onboarding levelcheck сейчас vocabulary yes/no. | Пользователь не видит, что “слух впереди речи” нормально и что речь догоняет. | Разделение receptive/productive progress снижает стыд и точнее ведёт тренировку. | Monthly check: vocab recognition, listening snippet, 60-sec speaking sample, 3-line writing. Result: “понимание B2, речь A2-B1 - нормальный разрыв”. | Лучше доверие к методике и долгосрочный план. |
| Нет “страж в моменте” перед микрофоном. | High | Edge state described in `13_app_logic.md:78`; session Say has voice/text but no trigger-based guardian in inspected code. | Самая трудная точка - нажать record/say. Именно там нужна психология. | Если барьер возникает перед output и продукт не помогает, пользователь обходит главный learning mechanism. | Detect hesitation before record/save; show compact card: name guardian, allow pause, continue with one phrase. | Больше voice outputs, меньше silent completion. |

## 14. Benchmark

| Benchmark | What they do well | What IE should copy | What IE should not copy |
|---|---|---|---|
| LingQ | Massive input, user content, translation always near. | Импорт своего контента, видимый known/unknown layer, библиотека по интересам. | Не становиться “читалкой со словарём”; IE должен обязательно заканчивать output. |
| Duolingo | Habit loop, tiny next action, low entry barrier. | One next step, instant first success, clear daily return. | Streak pressure, infantilizing rewards, disconnected sentences. |
| Praktika | Человеческое ощущение speaking practice, современная типографика/персонажность. | Красивый современный разговорный слой, ощущение живого ответа. | Не превращать всё в AI-avatar chat; метод IE шире и глубже. |
| Superhuman | Фокус, speed, keyboard-like mastery, premium discipline. | Minimal IA, one action per screen, powerful empty states. | Не делать cold productivity tone; IE нужен warmth. |
| Headspace/Welltory-like wellbeing apps | State-aware rituals, мягкие вечерние сценарии. | Evening circle, state → tomorrow adaptation. | Не уходить в wellness вместо English output. |

## TOP 20 UX improvements by Impact × Effort

Оценка: Impact 1-5, Effort 1-5. Чем выше `Impact / Effort`, тем раньше делать.

| # | Improvement | Impact | Effort | Why now |
|---:|---|---:|---:|---|
| 1 | Убрать имя “Галина” из app shell/web Today, заменить на нейтральное или prefs displayName. | 5 | 1 | Быстрый trust fix. |
| 2 | Web onboarding: добавить отдельный `uiLang`, не фиксировать `"ru"`. | 5 | 1 | Закрывает болезненный user-request про родной язык vs язык интерфейса. |
| 3 | Mobile onboarding сократить с 10 шагов до 4; факт-экраны вынести. | 5 | 3 | Главный drop-off до value. |
| 4 | Добавить step “что мешает говорить?” с 4 стражами. | 5 | 2 | Делает психологический слой продуктовым отличием. |
| 5 | Today mobile убрать постоянный `GuardianCard`; показывать только по trigger/после события. | 4 | 1 | Снижает шум. |
| 6 | Today mobile coach/community line перенести в People или после 3-5 outputs. | 4 | 1 | Меньше социальной тревоги на Day 1. |
| 7 | Разделить `DayCycle` и `SkillCatalog`; dayplan оставить session/SRS/evening. | 5 | 3 | Останавливает возврат старого чеклиста. |
| 8 | Переработать Profile: capabilities first, убрать flame/streak как центральный мотиватор. | 5 | 3 | Долгосрочная мотивация без shame. |
| 9 | SRS flow завершать одной своей фразой, а `/produce` сделать внутренним шагом. | 5 | 3 | Больше active vocabulary. |
| 10 | В word flow сделать режимы display: sound-on/no-sound/fast с разным количеством текста. | 4 | 2 | Решает “не успеваю прочитать перевод”. |
| 11 | Вынести `ListenThenBuild` как общий компонент для grammar/phrase/dialogue. | 4 | 2 | Фиксирует метод “сначала слух”. |
| 12 | Добавить guardian-in-moment перед mic/text save при задержке. | 5 | 3 | Бьёт в главную точку отказа. |
| 13 | Evening state реально влияет на следующий dayplan. | 5 | 3 | Чек-ин становится живым. |
| 14 | Add return route after 2+ missed days: “вернуться с 5 минут”. | 4 | 2 | Retention после пауз. |
| 15 | Убрать emoji/детские элементы из product UI. | 3 | 1 | Быстро взрослит тон. |
| 16 | Сделать import URL/text → mini lesson MVP. | 5 | 4 | Сильнейшая дифференциация. |
| 17 | AI-feedback только после user output, с consent. | 5 | 4 | AI усилит метод, а не отвлечёт. |
| 18 | Monthly assessment: recognition/listening/speaking/writing separately. | 4 | 4 | Даёт долгую картину прогресса. |
| 19 | People/club unlock after personal safety milestone, not first screen push. | 3 | 2 | Меньше freeze у стеснительных пользователей. |
| 20 | Motion system по фазам навыков: переходы, path, word flow, no decorative overload. | 3 | 3 | Современность без хаоса. |

## Как должна ощущаться world-class версия

Первый вход: “Меня не тестируют и не продают мне чудо. Меня быстро настраивают: на каком языке мне давать смысл, зачем мне английский, сколько я реально могу, что обычно меня останавливает. Через минуту я уже внутри”.

Первая сессия: “Мне не надо выбирать упражнение. Система ведёт. Я смотрю и слушаю слова, перевод крупно рядом, всё понятно. Потом те же слова всплывают в живом контексте. Потом я говорю или пишу 2-3 свои фразы. Не идеально, но я правда использовала английский”.

День 40: “Я вижу не стрик, а честный путь: сколько часов, какие слова стали моими, какие ситуации я уже могу прожить по-английски. Когда я устала, приложение становится мягче. Когда я возвращаюсь после паузы, меня не стыдят”.

День 120: “У меня есть библиотека моей жизни на английском: видео, статьи, темы, разговоры. Есть дневник моих фраз. Есть карта того, как понимание и речь расходились и как речь догоняла. Стражи уже не декоративные персонажи, а понятный язык для тех моментов, когда я хотела бросить и всё равно сделала маленький шаг”.

Почти ушедший пользователь: “Мне не говорят, что я провалилась. Мне предлагают вернуться с 5 минут. Моё место, слова, записи и часы на месте. Я могу снова начать без объяснений”.

Главное ощущение: Intensive English должен быть не школой, не игрой и не терапевтическим приложением. Это должен быть красивый, живой, взрослый тренажёр изменения: английский становится действием, а пользователь видит, как она постепенно становится человеком, который может говорить.
