// Контент-банк Vertical Slice v1 (vertical_slice_v1.md §11).
// Одна коммуникативная задача: «So what have you been working on lately?»
// 22 объекта (6 слов · 6 коллокаций · 4 фрейма · 6 фразовых) + конструкция
// present perfect continuous ↔ past simple. Банк курируемый: runtime-генерации
// в срезе нет, всё написано заранее и вычитывается человеком до пилота.
// ⚠️ Черновик уровня B1 — до запуска вычитывает Галина/SLA-специалист.

export type SliceKind = "word" | "collocation" | "frame" | "phrasal";

export type SliceItem = {
  /** стабильный id — ключ FSRS, логов и claim'ов */
  id: string;
  kind: SliceKind;
  /** каноническая форма (показ после лесенки, озвучка) */
  en: string;
  /** русский смысл — реплика извлечения (смысл → форма) */
  ru: string;
  /** заметка: регистр / RU-ловушка */
  note?: string;
  /** живое вхождение из текста дня */
  context: string;
  /** «а ещё так говорят» — 2 курируемых варианта для резюме */
  variants: string[];
  /** task-essential промпт производства (письменно, о своей работе) */
  prompt: string;
  /**
   * Группы форм для проверки: единица «найдена», если КАЖДАЯ группа дала
   * совпадение (любая из форм группы, по границам слов). Формы могут быть
   * многословными («been working on»).
   */
  lemmas: string[][];
  /** день введения 1–5 */
  day: 1 | 2 | 3 | 4 | 5;
};

export type SliceText = {
  day: 1 | 2 | 3 | 4 | 5;
  title: string;
  /** связный текст дня; **маркеры** выделяют единицы дня */
  en: string;
  ru: string;
};

export type GrammarContrast = {
  id: string;
  /** процесс, который ещё идёт */
  ppc: string;
  /** завершённый факт со временем */
  past: string;
  note: string;
};

export type TransformPrompt = {
  id: string;
  ru: string;
  /** какие формы обязаны появиться в ответе */
  lemmas: string[][];
  /** подсказка-образец (показывается после отправки, не до) */
  sample: string;
};

export const SLICE_ITEMS: SliceItem[] = [
  // ───────── День 1 — запуск и сроки ─────────
  {
    id: "frame-working-on", kind: "frame", day: 1,
    en: "I've been working on…",
    ru: "последнее время работаю над… (процесс ещё идёт)",
    note: "главный фрейм задачи среза",
    context: "I've been working on a mobile app for a new client.",
    variants: ["I've been busy with…", "Most of my time goes to…"],
    prompt: "Ответь на вопрос среза: What have you been working on lately? Начни с I've been working on…",
    lemmas: [["been working on", "been busy with"]],
  },
  {
    id: "run-a-project", kind: "collocation", day: 1,
    en: "run a project",
    ru: "вести проект",
    note: "run нейтральнее, чем lead",
    context: "It's the first time I run a project alone.",
    variants: ["manage a project", "lead a project"],
    prompt: "Какой проект ты ведёшь или вела? Скажи с run a project.",
    lemmas: [["run", "runs", "running", "ran"], ["project", "projects"]],
  },
  {
    id: "meet-a-deadline", kind: "collocation", day: 1,
    en: "meet a deadline",
    ru: "уложиться в срок",
    note: "«успеть к дедлайну» → meet",
    context: "We met the deadline, and the client was happy.",
    variants: ["finish on time", "hit the deadline"],
    prompt: "Расскажи про срок, в который вы уложились (или не уложились). Скажи с deadline.",
    lemmas: [["meet", "met", "meeting", "meets", "miss", "missed", "hit"], ["deadline", "deadlines"]],
  },
  {
    id: "launch", kind: "word", day: 1,
    en: "launch",
    ru: "запустить (продукт, версию)",
    context: "Last week we launched the first version.",
    variants: ["roll out", "go live"],
    prompt: "Что вы запускали или запустите в этом году? Скажи с launch.",
    lemmas: [["launch", "launched", "launching", "launches"]],
  },
  {
    id: "come-up-with", kind: "phrasal", day: 1,
    en: "come up with",
    ru: "придумать",
    note: "RU-L1 избегает и говорит invent",
    context: "The team came up with a simple idea.",
    variants: ["think of", "invent"],
    prompt: "Что тебе приходилось придумывать на работе? Скажи с came up with.",
    lemmas: [["come up with", "comes up with", "coming up with", "came up with"]],
  },
  // ───────── День 2 — разобраться в проблеме ─────────
  {
    id: "frame-thing-is", kind: "frame", day: 2,
    en: "The thing is…",
    ru: "дело в том, что…",
    note: "открывает объяснение загвоздки",
    context: "The thing is, the data comes from three different systems.",
    variants: ["The problem is…", "Here's the tricky part:"],
    prompt: "Объясни одну загвоздку в твоей работе. Начни с The thing is,…",
    lemmas: [["the thing is", "the problem is"]],
  },
  {
    id: "figure-out", kind: "phrasal", day: 2,
    en: "figure out",
    ru: "разобраться, вычислить",
    note: "не understand — активное распутывание",
    context: "I've been trying to figure out where the error comes from.",
    variants: ["work out", "get to the bottom of it"],
    prompt: "В чём тебе нужно разобраться на этой неделе? Скажи с figure out.",
    lemmas: [["figure out", "figures out", "figured out", "figuring out"]],
  },
  {
    id: "solve-a-problem", kind: "collocation", day: 2,
    en: "solve a problem",
    ru: "решить проблему",
    context: "Yesterday we finally solved the first problem.",
    variants: ["fix an issue", "deal with a problem"],
    prompt: "Какую проблему ты недавно решила? Скажи с solved a problem.",
    lemmas: [["solve", "solves", "solved", "solving"], ["problem", "problems"]],
  },
  {
    id: "challenging", kind: "word", day: 2,
    en: "challenging",
    ru: "непростой (уважительно, без жалобы)",
    note: "вежливее, чем hard/difficult",
    context: "This week has been quite challenging.",
    variants: ["tough", "demanding"],
    prompt: "Что сейчас самое непростое в твоей работе? Скажи с challenging.",
    lemmas: [["challenging"]],
  },
  {
    id: "estimate", kind: "word", day: 2,
    en: "estimate",
    ru: "оценить срок или объём",
    note: "глагол; ударение Estimate",
    context: "The client asked me to estimate how much time the rest will take.",
    variants: ["roughly how long…", "give a rough estimate"],
    prompt: "Оцени письменно: сколько времени займёт твоя ближайшая задача? Начни с I estimate…",
    lemmas: [["estimate", "estimated", "estimating"]],
  },
  // ───────── День 3 — перенять и решить ─────────
  {
    id: "frame-turned-out", kind: "frame", day: 3,
    en: "It turned out that…",
    ru: "оказалось, что…",
    note: "рассказ о неожиданном",
    context: "It turned out that the project was in better shape than everyone thought.",
    variants: ["As it turned out,…", "In the end it was…"],
    prompt: "Расскажи, что оказалось не таким, как ты думала. Начни с It turned out that…",
    lemmas: [["turned out", "turns out"]],
  },
  {
    id: "take-over", kind: "phrasal", day: 3,
    en: "take over",
    ru: "принять на себя (чужое дело)",
    note: "в рабочем контексте — без оттенка «захватить»",
    context: "I had to take over his project.",
    variants: ["step in", "take charge of"],
    prompt: "Что тебе доводилось перенимать у коллеги? Скажи с take over.",
    lemmas: [["take over", "takes over", "taking over", "took over", "taken over"]],
  },
  {
    id: "make-a-decision", kind: "collocation", day: 3,
    en: "make a decision",
    ru: "принять решение",
    note: "ловушка: НЕ accept a decision",
    context: "Somebody had to make a decision fast.",
    variants: ["decide", "make up your mind"],
    prompt: "Какое решение тебе пришлось принять недавно? Скажи с made a decision.",
    lemmas: [["make", "makes", "making", "made"], ["decision", "decisions"]],
  },
  {
    id: "hire", kind: "word", day: 3,
    en: "hire",
    ru: "нанять",
    context: "We hired one great developer on Friday.",
    variants: ["take on", "bring in"],
    prompt: "Кого вы нанимали или хотите нанять? Скажи с hire.",
    lemmas: [["hire", "hired", "hiring", "hires"]],
  },
  // ───────── День 4 — наладить и улучшить ─────────
  {
    id: "frame-trying-to-do", kind: "frame", day: 4,
    en: "What I'm trying to do is…",
    ru: "я пытаюсь сделать вот что…",
    note: "фокусирует внимание слушателя",
    context: "What I'm trying to do is protect two quiet hours every morning.",
    variants: ["My goal is to…", "I'm aiming to…"],
    prompt: "Что ты сейчас пытаешься наладить? Начни с What I'm trying to do is…",
    lemmas: [["trying to do is", "goal is to", "aiming to"]],
  },
  {
    id: "sort-out", kind: "phrasal", day: 4,
    en: "sort out",
    ru: "разгрести, уладить",
    note: "живее, чем solve — про бардак",
    context: "Last week I finally sorted out the biggest time-eater.",
    variants: ["fix", "put in order"],
    prompt: "Что ты недавно разгребла или уладила? Скажи с sorted out.",
    lemmas: [["sort out", "sorts out", "sorted out", "sorting out"]],
  },
  {
    id: "give-feedback", kind: "collocation", day: 4,
    en: "give feedback",
    ru: "дать обратную связь",
    note: "не say feedback",
    context: "I've been learning to give feedback in a new way.",
    variants: ["share my thoughts on", "review someone's work"],
    prompt: "Кому и о чём ты даёшь обратную связь? Скажи с give feedback.",
    lemmas: [["give", "gives", "giving", "gave"], ["feedback"]],
  },
  {
    id: "improve", kind: "word", day: 4,
    en: "improve",
    ru: "улучшить",
    context: "First what works, then one thing to improve.",
    variants: ["make it better", "polish"],
    prompt: "Что ты хочешь улучшить в своей работе? Скажи с improve.",
    lemmas: [["improve", "improved", "improving", "improves"]],
  },
  // ───────── День 5 — ответственность и темп ─────────
  {
    id: "put-off", kind: "phrasal", day: 5,
    en: "put off",
    ru: "откладывать",
    note: "RU-L1 избегает и говорит postpone",
    context: "There is one task I've been putting off for a month.",
    variants: ["postpone", "delay"],
    prompt: "Что ты давно откладываешь? Скажи с put off или putting off.",
    lemmas: [["put off", "puts off", "putting off"]],
  },
  {
    id: "keep-up-with", kind: "phrasal", day: 5,
    en: "keep up with",
    ru: "успевать за",
    context: "Now I'm trying to keep up with everything else.",
    variants: ["stay on top of", "not fall behind"],
    prompt: "За чем тебе трудно успевать? Скажи с keep up with.",
    lemmas: [["keep up with", "keeps up with", "keeping up with", "kept up with"]],
  },
  {
    id: "take-responsibility", kind: "collocation", day: 5,
    en: "take responsibility",
    ru: "взять ответственность",
    note: "+ for",
    context: "This year it's my turn to take responsibility for it.",
    variants: ["be in charge of", "own it"],
    prompt: "За что ты отвечаешь на работе? Скажи с responsibility.",
    lemmas: [["responsibility"]],
  },
  {
    id: "negotiate", kind: "word", day: 5,
    en: "negotiate",
    ru: "договариваться об условиях",
    note: "не только «переговоры» — любой торг об условиях",
    context: "I had to negotiate a new deadline with the finance team.",
    variants: ["agree on", "work out a deal"],
    prompt: "О чём тебе приходилось договариваться? Скажи с negotiate.",
    lemmas: [["negotiate", "negotiated", "negotiating"]],
  },
];

export const SLICE_TEXTS: SliceText[] = [
  {
    day: 1,
    title: "Первый запуск",
    en: "— So what have you been working on lately?\n— Quite a lot, actually. I've been working on a mobile app for a new client. It's the first time I run a project alone, so it means a lot to me. We started in May, and last week we launched the first version. The hardest part was the deadline: we had two weeks less than we planned. In the end the team came up with a simple idea — cut everything that is not necessary — and we met the deadline. The client was happy. Since then I've been collecting feedback and planning version two. Ask me about it in a month!",
    ru: "— Так над чем ты работаешь в последнее время?\n— Да много над чем. Я делаю мобильное приложение для нового клиента. Я впервые веду проект одна, так что для меня это важно. Мы начали в мае, а на прошлой неделе запустили первую версию. Самым трудным был срок: у нас было на две недели меньше, чем планировали. В итоге команда придумала простую вещь — убрать всё лишнее — и мы уложились в срок. Клиент был доволен. С тех пор я собираю отзывы и планирую вторую версию. Спроси меня о ней через месяц!",
  },
  {
    day: 2,
    title: "Числа, которые врут",
    en: "This week has been quite challenging. On Monday a client wrote that the numbers in his report looked wrong. The thing is, the data comes from three different systems, and nobody could say which one was lying. I've been trying to figure out where the error comes from since Tuesday morning. Yesterday we finally solved the first problem: one system used a different date format. Today the client asked me to estimate how much time the rest will take. I said two days. I hope I was right, because he is not a patient man.",
    ru: "Эта неделя выдалась непростой. В понедельник клиент написал, что числа в его отчёте выглядят неправильно. Дело в том, что данные приходят из трёх разных систем, и никто не мог сказать, какая из них врёт. Со вторника я пытаюсь разобраться, откуда ошибка. Вчера мы наконец решили первую проблему: одна система использовала другой формат дат. Сегодня клиент попросил оценить, сколько времени займёт остальное. Я сказала: два дня. Надеюсь, что не ошиблась, потому что человек он нетерпеливый.",
  },
  {
    day: 3,
    title: "Чужой проект",
    en: "Last month our team lead left the company, and I had to take over his project. Honestly, I didn't want to. But somebody had to make a decision fast, and my manager chose me. It turned out that the project was in better shape than everyone thought: the code was clean, the client was calm. The real problem was people — we were two developers short. So for the last three weeks I've been interviewing candidates. We hired one great developer on Friday, and I've been looking for the second one ever since.",
    ru: "В прошлом месяце наш тимлид ушёл из компании, и мне пришлось принять его проект. Честно — я не хотела. Но кто-то должен был быстро принять решение, и мой руководитель выбрал меня. Оказалось, что проект в лучшей форме, чем все думали: код чистый, клиент спокоен. Настоящая проблема была в людях — нам не хватало двух разработчиков. Так что последние три недели я собеседую кандидатов. В пятницу мы наняли одного отличного разработчика, а второго я ищу до сих пор.",
  },
  {
    day: 4,
    title: "Два тихих часа",
    en: "My calendar is a mess: meetings, reviews, two projects. What I'm trying to do is protect two quiet hours every morning for real work. It sounds simple, but it isn't. Last week I finally sorted out the biggest time-eater — a daily status meeting that nobody needed. We replaced it with a short message in the chat. I've also been learning to give feedback in a new way: first what works, then one thing to improve. My team noticed the difference immediately. One developer said our reviews stopped feeling like exams. That was the best thing I heard all month.",
    ru: "Мой календарь — хаос: встречи, ревью, два проекта. Я пытаюсь сделать вот что: защитить два тихих часа каждое утро для настоящей работы. Звучит просто, но это не так. На прошлой неделе я наконец разгребла главного пожирателя времени — ежедневный статус-митинг, который был никому не нужен. Мы заменили его коротким сообщением в чате. Ещё я учусь давать обратную связь по-новому: сначала что работает, потом одну вещь, которую стоит улучшить. Команда заметила разницу сразу. Один разработчик сказал, что наши ревью перестали быть похожи на экзамен. Это лучшее, что я слышала за месяц.",
  },
  {
    day: 5,
    title: "Годовой отчёт",
    en: "There is one task I've been putting off for a month: the yearly report. Nobody likes it, but this year it's my turn to take responsibility for it. The funny thing — once I started, it took only two evenings. The hard part was different: I had to negotiate a new deadline with the finance team, because they wanted everything by Friday. We agreed on Tuesday. Now I'm trying to keep up with everything else: emails, reviews, and a new client who writes at midnight. It has been a long week — but a good one.",
    ru: "Есть одна задача, которую я откладываю уже месяц: годовой отчёт. Его никто не любит, но в этом году моя очередь брать за него ответственность. Забавно: стоило начать — и он занял всего два вечера. Трудное было в другом: пришлось договариваться с финансовым отделом о новом сроке, потому что они хотели всё к пятнице. Сошлись на вторнике. Теперь я стараюсь успевать за всем остальным: письма, ревью и новый клиент, который пишет в полночь. Неделя выдалась длинной — но хорошей.",
  },
];

/** Контрасты конструкции (показ в сессиях 2–4). */
export const SLICE_GRAMMAR: GrammarContrast[] = [
  {
    id: "g1",
    ppc: "I've been working on the report all week.",
    past: "I wrote the report last week.",
    note: "Процесс, который ещё идёт ↔ законченный факт со временем. В русском обе фразы — одно прошедшее.",
  },
  {
    id: "g2",
    ppc: "She's been interviewing candidates since Monday.",
    past: "She interviewed five candidates yesterday.",
    note: "since/for + ещё не закончено → I've been …-ing. Есть «когда» и точка — past simple.",
  },
  {
    id: "g3",
    ppc: "We've been testing the new version lately.",
    past: "We tested it on Friday and found two bugs.",
    note: "lately/recently о процессе → perfect continuous. Конкретный день — past simple.",
  },
];

/** Трансформации (по одной в сессиях 6–11, письменно). */
export const SLICE_TRANSFORMS: TransformPrompt[] = [
  {
    id: "t1",
    ru: "Чем ты занята на работе в последнее время? Ответь одним предложением, начни с I've been…",
    lemmas: [["been"]],
    sample: "I've been working on a new report for our client.",
  },
  {
    id: "t2",
    ru: "Назови одно дело, которое ты закончила на прошлой неделе. Past simple + last week.",
    lemmas: [["last week", "yesterday", "on monday", "on tuesday", "on wednesday", "on thursday", "on friday"]],
    sample: "I finished the presentation last week.",
  },
  {
    id: "t3",
    ru: "Ты с понедельника разбираешься с одной проблемой, и она ещё не решена. Скажи это через I've been… since Monday.",
    lemmas: [["been"], ["since"]],
    sample: "I've been trying to figure out this bug since Monday.",
  },
  {
    id: "t4",
    ru: "Вчера вы приняли решение. Скажи это одним предложением в past simple.",
    lemmas: [["decided", "made"]],
    sample: "Yesterday we made a decision to change the plan.",
  },
  {
    id: "t5",
    ru: "Расскажи, что ты давно откладываешь: I've been putting off… for…",
    lemmas: [["putting off"], ["for"]],
    sample: "I've been putting off the yearly report for a month.",
  },
  {
    id: "t6",
    ru: "Скажи, что вы запустили и когда (past simple + время).",
    lemmas: [["launched", "released", "started"]],
    sample: "We launched the new site in June.",
  },
];

/** Главный вопрос среза — производство в сессиях 12–14 и репетиция финала. */
export const SLICE_MAIN_PROMPT = {
  id: "main-question",
  en: "So what have you been working on lately?",
  ru: "Ответь письменно, 3–5 предложений: над чем ты работаешь в последнее время? Смешай процесс (I've been…) и законченные факты (past simple).",
  lemmas: [["been"]],
};

/** Задача нового контекста (после отложенного теста). */
export const SLICE_NEW_CONTEXT = {
  id: "new-context",
  en: "Tell me about a problem you solved at work recently.",
  ru: "Расскажи письменно о проблеме, которую ты недавно решила на работе. 3–5 предложений.",
};

export function sliceItem(id: string): SliceItem | undefined {
  return SLICE_ITEMS.find((i) => i.id === id);
}

export function itemsForDay(day: number): SliceItem[] {
  return SLICE_ITEMS.filter((i) => i.day === day);
}
