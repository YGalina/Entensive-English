// Локализация интерфейса mobile: русский + английский (переключается в
// профиле, prefs.uiLang — общий с web). Без библиотек: типизированный словарь,
// ключи проверяет tsc. Язык ПЕРЕВОДОВ СЛОВ сюда не относится — он задан
// родным языком ученицы (prefs.nativeLang).

import { usePrefs } from "@ie/core/prefs";

export type UiLang = "ru" | "en";

const ru = {
  common: {
    next: "Дальше",
    back: "Назад",
    start: "Начать",
    done: "Готово",
    skip: "пропустить →",
    ready: "я готова →",
    retry: "Попробовать снова",
    minutes: "мин",
  },
  onb: {
    title: "Настроим под тебя",
    welcomeTitle: "Это приложение — про результат",
    welcomeBody:
      "Не про очки, стрики и красивые графики для инвесторов. Про то, чтобы английский действительно встроился — у тех, кому он нужен в короткий срок.",
    welcomeScience:
      "Внутри — интегрированный интенсивный метод на научной базе: суггестопедия, массивный ввод, понятный вход, моторные каналы. Так готовят к языку разведчиков: погружение, состояние, большие объёмы.",
    welcomeCta: "Покажи, как это работает",
    qLangTitle: "Какой у тебя родной язык?",
    qLangNote: "Учим только английский. Переводы слов и примеров будут на этом языке.",
    qLangChange: "изменить",
    qLangSheet: "Родной язык",
    qLangHint: "переводы слов — на этом языке",
    factHoursTitle: "Сколько времени это займёт?",
    factHoursBody:
      "Международный стандарт (Cambridge English): переход на следующий уровень — примерно 200 часов направленной практики. Не магия и не «за 3 дня», а честная арифметика, которую интенсив ускоряет качеством входа.",
    factHoursAsk: "Сколько минут в день ты реально готова заниматься?",
    factHoursResult: (min: number, months: number) =>
      `${min} мин в день ≈ следующий уровень за ~${months} мес`,
    factHoursNote: "Это ориентир, не обещание. Приложение считает твой реальный темп и честно показывает прогноз.",
    qGoalTitle: "Зачем тебе английский?",
    qGoalNote: "Подберём контент и темп под цель.",
    factMethodTitle: "На чём стоит метод",
    factMethodItems: [
      {
        name: "Георгий Лозанов — суггестопедия",
        text: "Барьеры «я не способна» блокируют память сильнее, чем незнание слов. Сначала состояние: расслабление, музыка ~60 уд/мин, разрешение на ошибку. Усвоение ускоряется в 2–10 раз.",
      },
      {
        name: "Вячеслав Петрусинский — массивный ввод",
        text: "Не по слову в день, а валом: до 1000 слов за сеанс. Сознание не должно всё «выучить» — массив ложится в узнавание и всплывает сам. Скорость чтения в его экспериментах — ×2,5 за 2 недели.",
      },
      {
        name: "Стивен Крашен — понятный вход",
        text: "Язык усваивается из входа чуть выше твоего уровня — чтение и слушание того, что интересно. Речь приходит сама, примерно через 6 месяцев входа. Её нельзя форсировать — и не нужно.",
      },
      {
        name: "Моторно-фонетический канал",
        text: "Произношение ставится на целых фразах лестницей темпа: очень медленно → вместе → как носитель. Мышцы лица и рук запоминают язык надёжнее зубрёжки.",
      },
    ],
    factMethodFoot:
      "Похоже на подготовку разведчиков — и не случайно: интенсивная иммерсия, работа с состоянием и большие массивы пришли из тех же программ.",
    qInterestsTitle: "Про что тебе интересно?",
    qInterestsNote: "Выбери, что любишь, — слова, тексты и примеры придут из этих смыслов. Можно несколько.",
    factSkillsTitle: "Что будем тренировать каждый день",
    factSkillsBody:
      "Язык — не один навык, а система. Каждый день понемногу работают все каналы:",
    factSkillsItems: [
      { icon: "ear", text: "Слух: декодирование живой беглой речи" },
      { icon: "mic", text: "Звук: артикуляция, просодия, ритм" },
      { icon: "book", text: "Чтение: массив текста, скорость (WPM)" },
      { icon: "layers", text: "Словарь: узнавание → интервальные повторы" },
      { icon: "chatbubbles", text: "Грамматика: в живых фразах, не в таблицах" },
      { icon: "sparkles", text: "Состояние: настройка, дыхание, установки" },
    ] as { icon: string; text: string }[],
    qLevelTitle: "Какой у тебя уровень?",
    qLevelNote: "Без экзамена. Не уверена — определим за минуту по словам.",
    qLevelCheckCta: "Не знаю уровень — определить за минуту",
    checkHint: "Понимаешь смысл — жми «Знаю». Честно, без словаря 🙂",
    checkKnow: "Знаю",
    checkNotYet: "Ещё нет",
    checkBack: "← вернуться к выбору вручную",
    checkResult: (lvl: string) => `Похоже, твой уровень — ${lvl}`,
    checkResultNote: "Это стартовая настройка, не приговор: программа сама подстроится по мере практики.",
    checkAccept: "Принять",
    checkManual: "Выберу сама",
    speakWord: "Озвучить слово",
    summaryTitle: "Твой план готов",
    summaryLevel: "Уровень сейчас",
    summaryTarget: "Следующий уровень",
    summaryPace: "Твой темп",
    summaryEta: "Ориентир перехода",
    summaryDaily: (min: number) => `${min} мин в день`,
    summaryFoot:
      "Каждый день — один понятный следующий шаг. Без штрафов и чувства вины: пропустила — просто вернись.",
    summaryCta: "Начать путь",
  },
  sounds: {
    intro: "Моторно-фонетический метод: фраза целиком — сначала очень медленно, потом быстрее, потом как носитель.",
  },
  profile: {
    title: "Профиль",
    afterSetup: "после настройки",
    myCourse: "Мой курс",
    levelNow: "Уровень сейчас",
    goal: "Цель",
    dailyPlan: "План на день",
    dailyPlanVal: (min: number) => `${min} мин`,
    inSetup: "в настройке",
    hours: "Часов практики",
    days: "Дней с практикой",
    program: "Программа и горизонт",
    progressCaption: (done: number, goal: number, per: number) =>
      `${done} из ${goal} ч направленной практики (стандарт Cambridge ≈${per} ч/уровень). Прогноз — из твоего реального темпа.`,
    pace7: "Темп за 7 дней",
    paceVal: (min: number) => `${min} мин/день`,
    paceGathering: "ещё копится",
    forecast: "Уровень — прогноз",
    needPace: "нужен темп от 5 мин/день",
    wordsRecog: "Слов в узнавании",
    wordsVal: (n: number, target: number) => `${n} · цель ${target}`,
    speechSelf: "Речь всплывёт сама",
    speechFrom: "с первого дня практики",
    benchmarks: (m30: number, m60: number, m120: number) =>
      `Ориентир: 30 мин в день ≈ ${m30} мес на уровень · 60 мин ≈ ${m60} мес · 120 мин ≈ ${m120} мес. Говорение не форсируем: по Крашену оно приходит само после ~6 месяцев хорошего входа.`,
    consistency: "Постоянство",
    streakN: (n: number, word: string) => `${n} ${word} подряд`,
    dayWords: ["день", "дня", "дней"] as [string, string, string],
    streakStart: "серия начнётся сегодня",
    regular: "Английский любит регулярность больше, чем подвиги.",
    noBurn: "Пропустила день — ничего не сгорает и никто не ругает. Просто вернись: следующий маленький шаг важнее идеальной серии.",
    ui: "Интерфейс",
    appLang: "Язык приложения",
    langNote: "Язык переводов слов не меняется — он задан родным языком.",
    theme: "Тема",
    themeSystem: "Системная",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    themeNow: "Сейчас",
    themeNowDark: "ночь над морем",
    themeNowLight: "морской белый",
    testVoice: "Проверить голос",
    speaking: "Говорю…",
    testVoiceA11y: "Проверить английский голос",
    redo: "Пройти настройку заново",
    foot: "Вход по волшебной ссылке и облачный синк прогресса появятся в следующем шаге. Полный кабинет — в веб-версии.",
  },
  today: {
    title: "Сегодня",
    streak: (n: number) => `Серия: ${n} дней подряд`,
    ringOf: (done: number, goal: number) => `${done} из ${goal} мин`,
    ringA11y: (done: number, goal: number) => `План дня: ${done} из ${goal} минут`,
    wpmLabel: "скорость чтения",
    wordsLabel: "слов в узнавании",
    nextStep: (min: number) => `следующий шаг · ${min} мин`,
    nextStepReviews: "следующий шаг · повторы",
    dayDone: "день собран",
    allDone: "Всё на сегодня сделано ✔",
    allDoneNote: "Мозг доучит ночью — вечерний круг и сон делают своё.",
    start: "Начать",
    three: "Есть 3 минуты?",
    threeNote: "дыхание под музыку → две фразы вслух → установка",
    threeA11y: "Три минутки: дыхание, две фразы, установка",
    trail: "Дорожка дня",
    stepDone: "готово",
    stepCurrent: "текущий шаг",
    soonTitle: "Скоро на телефоне",
    soonBody:
      "Этот шаг скоро появится в мобильной версии. Сейчас он ждёт тебя в веб-версии — а здесь уже можно смотреть дорожку дня.",
    ok: "Хорошо",
    insightPace: (min: number, lvl: string, when: string) =>
      `Твой темп за неделю — ${min} мин/день. Это дорога к ${lvl} к ${when}.`,
    insightNoPace: (goal: number) =>
      `Прогноз уровня появится после первых дней практики — план на сегодня ${goal} мин.`,
    insightLeft: (min: number, step: string) =>
      `Сегодня осталось ${min} мин — лучший шаг: ${step}.`,
    insightDone: "План на сегодня собран. Вечерний круг перед сном закрепит день.",
  },
};

type Dict = typeof ru;

const en: Dict = {
  common: {
    next: "Next",
    back: "Back",
    start: "Start",
    done: "Done",
    skip: "skip →",
    ready: "I'm ready →",
    retry: "Try again",
    minutes: "min",
  },
  onb: {
    title: "Let's set things up",
    welcomeTitle: "This app is about results",
    welcomeBody:
      "Not about points, streaks and investor-friendly charts. It's for people who genuinely need English to take root — fast.",
    welcomeScience:
      "Inside is an integrated intensive method built on science: suggestopedia, massive input, comprehensible input, motor channels. The way intelligence officers learn languages: immersion, state, big volumes.",
    welcomeCta: "Show me how it works",
    qLangTitle: "What is your native language?",
    qLangNote: "We only teach English. Word and example translations will use this language.",
    qLangChange: "change",
    qLangSheet: "Native language",
    qLangHint: "word translations use this language",
    factHoursTitle: "How long will it take?",
    factHoursBody:
      "The international benchmark (Cambridge English): moving up one level takes about 200 hours of guided practice. No magic, no “3 days” — honest arithmetic that intensive input accelerates.",
    factHoursAsk: "How many minutes a day can you really practise?",
    factHoursResult: (min: number, months: number) =>
      `${min} min a day ≈ next level in ~${months} months`,
    factHoursNote: "A reference, not a promise. The app tracks your real pace and shows an honest forecast.",
    qGoalTitle: "Why do you need English?",
    qGoalNote: "We'll match content and pace to your goal.",
    factMethodTitle: "What the method stands on",
    factMethodItems: [
      {
        name: "Georgi Lozanov — suggestopedia",
        text: "“I'm not capable” blocks memory harder than missing words. State first: relaxation, ~60 bpm music, permission to make mistakes. Learning speeds up 2–10×.",
      },
      {
        name: "Vyacheslav Petrusinsky — massive input",
        text: "Not a word a day but a wave: up to 1000 words per session. Consciousness isn't meant to memorise it all — the mass settles into recognition and surfaces on its own. Reading speed in his experiments: ×2.5 in 2 weeks.",
      },
      {
        name: "Stephen Krashen — comprehensible input",
        text: "Language is acquired from input slightly above your level — reading and listening to what you love. Speech emerges by itself after about 6 months of input. It can't be forced — and needn't be.",
      },
      {
        name: "The motor-phonetic channel",
        text: "Pronunciation is set on whole phrases via a tempo ladder: very slow → together → native speed. Face and hand muscles remember language better than cramming.",
      },
    ],
    factMethodFoot:
      "It resembles intelligence-officer training for a reason: immersion, state work and massive input came from those very programmes.",
    qInterestsTitle: "What do you love?",
    qInterestsNote: "Pick what you enjoy — words, texts and examples will come from these worlds. Choose several.",
    factSkillsTitle: "What we train every day",
    factSkillsBody: "Language isn't one skill but a system. Every day, a little of every channel:",
    factSkillsItems: [
      { icon: "ear", text: "Listening: decoding fast natural speech" },
      { icon: "mic", text: "Sound: articulation, prosody, rhythm" },
      { icon: "book", text: "Reading: text volume and speed (WPM)" },
      { icon: "layers", text: "Vocabulary: recognition → spaced review" },
      { icon: "chatbubbles", text: "Grammar: in live phrases, not tables" },
      { icon: "sparkles", text: "State: attunement, breathing, mindset" },
    ],
    qLevelTitle: "What's your level?",
    qLevelNote: "No exam. Not sure — we'll estimate it in a minute from words.",
    qLevelCheckCta: "Not sure — estimate in a minute",
    checkHint: "If you understand the meaning — tap “I know”. Honestly, no dictionary 🙂",
    checkKnow: "I know",
    checkNotYet: "Not yet",
    checkBack: "← back to manual choice",
    checkResult: (lvl: string) => `Looks like your level is ${lvl}`,
    checkResultNote: "A starting point, not a verdict: the programme adapts as you practise.",
    checkAccept: "Accept",
    checkManual: "I'll choose myself",
    speakWord: "Play the word",
    summaryTitle: "Your plan is ready",
    summaryLevel: "Level now",
    summaryTarget: "Next level",
    summaryPace: "Your pace",
    summaryEta: "Level-up estimate",
    summaryDaily: (min: number) => `${min} min a day`,
    summaryFoot:
      "One clear next step every day. No penalties, no guilt: missed a day — just come back.",
    summaryCta: "Start the journey",
  },
  sounds: {
    intro: "The motor-phonetic method: the whole phrase — very slow first, then faster, then like a native.",
  },
  profile: {
    title: "Profile",
    afterSetup: "after setup",
    myCourse: "My course",
    levelNow: "Level now",
    goal: "Goal",
    dailyPlan: "Daily plan",
    dailyPlanVal: (min: number) => `${min} min`,
    inSetup: "in setup",
    hours: "Hours practised",
    days: "Days with practice",
    program: "Programme and horizon",
    progressCaption: (done: number, goal: number, per: number) =>
      `${done} of ${goal} hours of guided practice (Cambridge benchmark ≈${per} h/level). The forecast comes from your real pace.`,
    pace7: "7-day pace",
    paceVal: (min: number) => `${min} min/day`,
    paceGathering: "still gathering",
    forecast: "Level forecast",
    needPace: "needs a 5 min/day pace",
    wordsRecog: "Words recognised",
    wordsVal: (n: number, target: number) => `${n} · target ${target}`,
    speechSelf: "Speech emerges",
    speechFrom: "from the first day of practice",
    benchmarks: (m30: number, m60: number, m120: number) =>
      `Reference: 30 min a day ≈ ${m30} months per level · 60 min ≈ ${m60} · 120 min ≈ ${m120}. We don't force speaking: per Krashen it emerges by itself after ~6 months of good input.`,
    consistency: "Consistency",
    streakN: (n: number, word: string) => `${n} ${word} in a row`,
    dayWords: ["day", "days", "days"] as [string, string, string],
    streakStart: "your streak starts today",
    regular: "English loves regularity more than heroics.",
    noBurn: "Missed a day? Nothing burns and nobody scolds. Just come back: the next small step matters more than a perfect streak.",
    ui: "Interface",
    appLang: "App language",
    langNote: "Word translations don't change — they follow your native language.",
    theme: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    themeNow: "Now",
    themeNowDark: "night over the sea",
    themeNowLight: "sea white",
    testVoice: "Test the voice",
    speaking: "Speaking…",
    testVoiceA11y: "Test the English voice",
    redo: "Redo the setup",
    foot: "Magic-link sign-in and cloud sync are coming next. The full account lives in the web version.",
  },
  today: {
    title: "Today",
    streak: (n: number) => `Streak: ${n} days in a row`,
    ringOf: (done: number, goal: number) => `${done} of ${goal} min`,
    ringA11y: (done: number, goal: number) => `Daily plan: ${done} of ${goal} minutes`,
    wpmLabel: "reading speed",
    wordsLabel: "words recognised",
    nextStep: (min: number) => `next step · ${min} min`,
    nextStepReviews: "next step · reviews",
    dayDone: "day complete",
    allDone: "Everything's done for today ✔",
    allDoneNote: "Your brain finishes the job overnight — the evening circle and sleep do their part.",
    start: "Start",
    three: "Got 3 minutes?",
    threeNote: "breathing with music → two phrases aloud → a mindset line",
    threeA11y: "Three minutes: breathing, two phrases, mindset",
    trail: "Day trail",
    stepDone: "done",
    stepCurrent: "current step",
    soonTitle: "Coming to mobile",
    soonBody:
      "This step is coming to the mobile app soon. For now it lives in the web version — and you can already follow your day trail here.",
    ok: "Got it",
    insightPace: (min: number, lvl: string, when: string) =>
      `Your 7-day pace is ${min} min/day. That's the road to ${lvl} by ${when}.`,
    insightNoPace: (goal: number) =>
      `Your level forecast appears after the first days of practice — today's plan is ${goal} min.`,
    insightLeft: (min: number, step: string) =>
      `${min} min left today — best next step: ${step}.`,
    insightDone: "Today's plan is complete. An evening circle before sleep will seal the day.",
  },
};

const DICTS: Record<UiLang, Dict> = { ru, en };

export function useT(): { t: Dict; lang: UiLang } {
  const prefs = usePrefs();
  const lang: UiLang = prefs?.uiLang === "en" ? "en" : "ru";
  return { t: DICTS[lang], lang };
}

/** Для экранов до сохранения prefs (онбординг): язык по выбранному в квизе. */
export function dict(lang: UiLang): Dict {
  return DICTS[lang];
}
