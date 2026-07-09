// Четыре стража пути (идея Галины, 2026-07-10): изучение языка = изменение,
// и на пути изменений встречают стражи — обесценивание, запугивание,
// высмеивание, перфекционизм. Каждому — короткие психологические практики.
//
// ⚠️ ТЕКСТЫ ПРАКТИК — ЧЕРНОВИКИ для редактуры Галины (она психолог и
// бизнес-тренер; её голос и её техники здесь главные). Регистр безопасный:
// поддержка состояния в изменении, НЕ терапия и НЕ «лечим тревожность».

export type GuardianId = "devaluing" | "fear" | "mockery" | "perfectionism";

export type Practice = {
  id: string;
  guardian: GuardianId;
  title: string;
  titleEn: string;
  /** Шаги практики — короткие, на 2–4 минуты */
  steps: string[];
  stepsEn: string[];
  durationMin: number;
};

export type Guardian = {
  id: GuardianId;
  name: string;
  nameEn: string;
  /** Как страж звучит внутри — узнавание себя */
  voice: string;
  voiceEn: string;
  /** Что на самом деле происходит (психообразование, 1–2 предложения) */
  truth: string;
  truthEn: string;
};

export const GUARDIANS: Guardian[] = [
  {
    id: "devaluing",
    name: "Страж обесценивания",
    nameEn: "The Guardian of Devaluing",
    voice: "«У меня не получается. Другие быстрее. Это всё зря.»",
    voiceEn: "“I'm failing. Others are faster. This is pointless.”",
    truth:
      "Обесценивание — не правда о тебе, а способ психики сбросить напряжение изменения. Оно приходит именно тогда, когда ты реально двигаешься.",
    truthEn:
      "Devaluing is not the truth about you — it's how the psyche discharges the tension of change. It shows up precisely when you are actually moving.",
  },
  {
    id: "fear",
    name: "Страж запугивания",
    nameEn: "The Guardian of Fear",
    voice: "«Скажешь — опозоришься. Лучше молчи, пока не будешь готова.»",
    voiceEn: "“Speak and you'll embarrass yourself. Stay silent until you're ready.”",
    truth:
      "Страх охраняет старую идентичность. «Готовность» не наступает от молчания — она строится маленькими безопасными пробами голоса.",
    truthEn:
      "Fear guards the old identity. “Readiness” never arrives from silence — it is built by small, safe trials of your voice.",
  },
  {
    id: "mockery",
    name: "Страж высмеивания",
    nameEn: "The Guardian of Mockery",
    voice: "«Ну и акцент. Ну и ошибки. Слышала бы себя со стороны.»",
    voiceEn: "“That accent. Those mistakes. If only you could hear yourself.”",
    truth:
      "Высмеивание — интериоризированный чужой голос (школа, среда). Ошибка в тренировке — это данные, а не улика против тебя.",
    truthEn:
      "Mockery is an internalized outside voice (school, environment). A mistake in training is data, not evidence against you.",
  },
  {
    id: "perfectionism",
    name: "Страж перфекционизма",
    nameEn: "The Guardian of Perfectionism",
    voice: "«Либо идеально, либо не берись. Сегодня мало — значит, провал.»",
    voiceEn: "“Perfect or nothing. Too little today means failure.”",
    truth:
      "Перфекционизм маскируется под высокие стандарты, а работает как саботаж: качели «всё или ничего» выжигают привычку. Язык растёт из регулярного «достаточно».",
    truthEn:
      "Perfectionism poses as high standards but works as sabotage: all-or-nothing swings burn the habit out. Language grows from a regular “enough.”",
  },
];

export const PRACTICES: Practice[] = [
  // ——— Обесценивание ———
  {
    id: "devaluing-evidence",
    guardian: "devaluing",
    title: "Доказательства обратного",
    titleEn: "Evidence to the contrary",
    steps: [
      "Открой профиль и посмотри три числа: минуты, слова в узнавании, статусы.",
      "Скажи вслух по-русски: «Это сделала я. Ноль из этого не был случайностью».",
      "Выбери одно английское слово, которое месяц назад не узнала бы — и произнеси его.",
    ],
    stepsEn: [
      "Open your profile and look at three numbers: minutes, recognized words, statuses.",
      "Say out loud: “I did this. None of it happened by accident.”",
      "Pick one English word you wouldn't have recognized a month ago — and say it.",
    ],
    durationMin: 2,
  },
  {
    id: "devaluing-reframe",
    guardian: "devaluing",
    title: "Перевод с языка критика",
    titleEn: "Translating the critic",
    steps: [
      "Поймай фразу критика: «у меня не получается».",
      "Переведи её на язык фактов: «сегодня было трудное упражнение» или «я устала».",
      "Добавь продолжение: «…и я вернусь завтра». Факт + продолжение — вместо приговора.",
    ],
    stepsEn: [
      "Catch the critic's phrase: “I'm failing.”",
      "Translate it into facts: “today's exercise was hard” or “I'm tired.”",
      "Add a continuation: “…and I'll be back tomorrow.” Fact + continuation instead of a verdict.",
    ],
    durationMin: 3,
  },
  // ——— Запугивание ———
  {
    id: "fear-lowstakes",
    guardian: "fear",
    title: "Проба без свидетелей",
    titleEn: "A trial with no witnesses",
    steps: [
      "Запиши 10 секунд голоса — любую фразу. Запись видишь только ты.",
      "Прослушай один раз. Заметь: мир не рухнул.",
      "Хочешь — удали. Смысл был в пробе, не в результате.",
    ],
    stepsEn: [
      "Record 10 seconds of your voice — any phrase. Only you can see it.",
      "Listen once. Notice: the world didn't end.",
      "Delete it if you like. The point was the trial, not the result.",
    ],
    durationMin: 2,
  },
  {
    id: "fear-breath",
    guardian: "fear",
    title: "Вдох перед словом",
    titleEn: "A breath before the word",
    steps: [
      "Положи руку на грудь. Медленный вдох на 4, выдох на 6 — три раза.",
      "На последнем выдохе скажи одну английскую фразу — тихо, почти шёпотом.",
      "Повтори её обычным голосом. Страх снижается на втором произнесении — проверь.",
    ],
    stepsEn: [
      "Hand on your chest. Slow inhale for 4, exhale for 6 — three times.",
      "On the last exhale, say one English phrase — quietly, almost a whisper.",
      "Repeat it in your normal voice. Fear drops on the second try — test it.",
    ],
    durationMin: 3,
  },
  // ——— Высмеивание ———
  {
    id: "mockery-coach",
    guardian: "mockery",
    title: "Голос тренера вместо судьи",
    titleEn: "A coach's voice, not a judge's",
    steps: [
      "Вспомни последнюю подсказку приложения к твоей фразе.",
      "Перечитай её как слова тренера в спортзале: инструкция, не оценка.",
      "Ответь вслух: «Принято, пробую ещё раз» — и попробуй фразу ещё раз.",
    ],
    stepsEn: [
      "Recall the app's last hint about your phrase.",
      "Reread it as a gym coach's words: instruction, not judgment.",
      "Answer out loud: “Got it, trying again” — and try the phrase again.",
    ],
    durationMin: 2,
  },
  {
    id: "mockery-alive",
    guardian: "mockery",
    title: "Смешно — значит живое",
    titleEn: "Funny means alive",
    steps: [
      "Скажи английскую фразу нарочно с самым страшным акцентом, на который способна.",
      "Улыбнись. Ты только что сделала то, чего страж боится больше всего.",
      "Теперь скажи её как получается естественно. Заметь разницу — обе версии твои.",
    ],
    stepsEn: [
      "Say an English phrase deliberately in the worst accent you can manage.",
      "Smile. You just did the thing the guardian fears most.",
      "Now say it naturally. Notice the difference — both versions are yours.",
    ],
    durationMin: 2,
  },
  // ——— Перфекционизм ———
  {
    id: "perfectionism-enough",
    guardian: "perfectionism",
    title: "Правило «достаточно»",
    titleEn: "The “enough” rule",
    steps: [
      "Назови сегодняшний минимум вслух: «Одна фраза — это достаточно».",
      "Сделай ровно её. Не две, не пять — одну.",
      "Закрой приложение с недоделанным списком. Это упражнение, и ты его выполнила.",
    ],
    stepsEn: [
      "Name today's minimum out loud: “One phrase is enough.”",
      "Do exactly that. Not two, not five — one.",
      "Close the app with the list unfinished. That's the exercise, and you completed it.",
    ],
    durationMin: 2,
  },
  {
    id: "perfectionism-swing",
    guardian: "perfectionism",
    title: "Стоп-качели",
    titleEn: "Stop the swings",
    steps: [
      "Посмотри на вчера и сегодня: был рывок — стал ноль? Это качели, не лень.",
      "Выбери на завтра нагрузку В ДВА РАЗА меньше вчерашнего рывка.",
      "Запиши её как план. Ровный маленький шаг обгоняет рывки — это математика привычки.",
    ],
    stepsEn: [
      "Look at yesterday and today: a sprint, then zero? That's the swing, not laziness.",
      "For tomorrow, choose HALF of yesterday's sprint.",
      "Write it down as the plan. A steady small step outruns sprints — that's habit math.",
    ],
    durationMin: 3,
  },
];

export function guardianById(id: GuardianId): Guardian {
  return GUARDIANS.find((g) => g.id === id)!;
}

export function practicesFor(id: GuardianId): Practice[] {
  return PRACTICES.filter((p) => p.guardian === id);
}
