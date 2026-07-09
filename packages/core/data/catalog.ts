// Справочники для онбординга и настроек.
// Учим ТОЛЬКО английский; родной язык (L1) выбирается. См. 05_method_to_mechanics.md §7.

export type LangCode =
  | "ru"
  | "en"
  | "ar"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "pt"
  | "tr"
  | "zh"
  | "pl"
  | "fa";

export type Language = {
  code: LangCode;
  /** Самоназвание — носитель видит свой язык */
  native: string;
  flag: string;
  dir: "ltr" | "rtl";
};

export const LANGUAGES: Language[] = [
  { code: "ru", native: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "en", native: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "de", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "fr", native: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "es", native: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "it", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "pt", native: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "tr", native: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "zh", native: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "pl", native: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "fa", native: "فارسی", flag: "🇮🇷", dir: "rtl" },
];

// Родной язык нужен именно как слой перевода. Target уже English, поэтому English
// не предлагаем здесь, чтобы не путать его с языком интерфейса.
export const NATIVE_LANGUAGES: Language[] = LANGUAGES.filter((l) => l.code !== "en");

export const LANG_DIR: Record<LangCode, "ltr" | "rtl"> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.dir])
) as Record<LangCode, "ltr" | "rtl">;

export type UiLang = "ru" | "en";
export type Topic = { id: string; title: string; titleEn: string };

/**
 * ⭐ Интересы-смыслы для онбординга (§8 мастер-брифа): через любимые смыслы
 * английский заходит без сопротивления. Это ОДНА ось — «про что тебе
 * интересно», без методических категорий. Лексические слои метода (частотный
 * костяк, фразовые глаголы, коллокации, предлоги) в онбординге НЕ спрашиваются:
 * их программа включает сама. TOPICS ниже — внутренние ярлыки данных (пачек),
 * человеку в выборе не показываются.
 */
export type Interest = { id: string; title: string; titleEn: string };
export type InterestGroup = { id: string; title: string; titleEn: string; items: Interest[] };

/** Единый классификатор: рубрика → темы. Плоский INTERESTS собирается из групп. */
export const INTEREST_GROUPS: InterestGroup[] = [
  {
    id: "mind",
    title: "Душа и разум",
    titleEn: "Mind & soul",
    items: [
      { id: "psychology", title: "Психология и мозг", titleEn: "Psychology & brain" },
      { id: "spirit", title: "Духовный рост и предназначение", titleEn: "Inner growth & purpose" },
      { id: "people", title: "Люди и отношения", titleEn: "People & relationships" },
    ],
  },
  {
    id: "stories",
    title: "Истории и культура",
    titleEn: "Stories & culture",
    items: [
      { id: "stories", title: "Сказки и красивые истории", titleEn: "Fairy tales & stories" },
      { id: "film", title: "Кино и сериалы", titleEn: "Films & series" },
      { id: "culture", title: "Культура и искусство", titleEn: "Culture & art" },
      { id: "humor", title: "Английский юмор", titleEn: "British humour" },
    ],
  },
  {
    id: "life",
    title: "Жизнь и дом",
    titleEn: "Life & home",
    items: [
      { id: "parenting", title: "Дети и воспитание", titleEn: "Kids & parenting" },
      { id: "home", title: "Дом и уют", titleEn: "Home & cosiness" },
      { id: "food", title: "Еда и кухня", titleEn: "Food & cooking" },
      { id: "travel", title: "Путешествия", titleEn: "Travel" },
      { id: "beauty", title: "Стиль и красота", titleEn: "Style & beauty" },
      { id: "body", title: "Тело, спорт и здоровье", titleEn: "Body & health" },
    ],
  },
  {
    id: "work",
    title: "Дело и наука",
    titleEn: "Work & science",
    items: [
      { id: "career", title: "Работа и карьера", titleEn: "Work & career" },
      { id: "tech", title: "Технологии", titleEn: "Technology" },
      { id: "ai", title: "Искусственный интеллект", titleEn: "Artificial intelligence" },
      { id: "science", title: "Наука и космос", titleEn: "Science & space" },
    ],
  },
  {
    id: "hands",
    title: "Творчество руками",
    titleEn: "Hands & crafts",
    items: [
      { id: "crafts", title: "Рукоделие и творчество", titleEn: "Crafts & making" },
      { id: "garden", title: "Сад и растения", titleEn: "Garden & plants" },
    ],
  },
];

export const INTERESTS: Interest[] = INTEREST_GROUPS.flatMap((g) => g.items);

// Темы изучения (паки = блоки). Внутренняя разметка данных. Расширяемо.
export const TOPICS: Topic[] = [
  { id: "core", title: "Частотный костяк", titleEn: "Core frequency" },
  { id: "phrasal", title: "Фразовые глаголы", titleEn: "Phrasal verbs" },
  { id: "collocations", title: "Устойчивые сочетания", titleEn: "Collocations" },
  { id: "prepositions", title: "Глаголы с предлогами", titleEn: "Verbs + prepositions" },
  { id: "anatomy", title: "Строение организма", titleEn: "Body & anatomy" },
  { id: "health", title: "Здоровье и самочувствие", titleEn: "Health & wellbeing" },
  { id: "home", title: "Дом и быт", titleEn: "Home & daily life" },
  { id: "emotions", title: "Эмоции и чувства", titleEn: "Emotions" },
  { id: "work", title: "Работа и команда", titleEn: "Work & team" },
  { id: "design", title: "Дизайн-мышление", titleEn: "Design thinking" },
  { id: "food", title: "Еда и кухня", titleEn: "Food & cooking" },
  { id: "travel", title: "Путешествия и город", titleEn: "Travel & city" },
  { id: "money", title: "Деньги и покупки", titleEn: "Money & shopping" },
  { id: "tech", title: "Технологии и интернет", titleEn: "Tech & internet" },
  { id: "social", title: "Общение / small talk", titleEn: "Small talk" },
  { id: "nature", title: "Природа и погода", titleEn: "Nature & weather" },
];

export type Goal = { id: string; title: string; titleEn: string; desc: string };

// Жизненные цели (id = домены @ie/core/goal): человек покупает результат в
// жизни, не «учить слова». Старые id (speaking/vocab/exam) живут в prefs у
// ранних пользователей — их понимает domainFromLegacyGoal.
export const GOALS: Goal[] = [
  { id: "unlock-speech", title: "Заговорить", titleEn: "Unlock speech", desc: "понимаю, но не говорю — закрыть разрыв" },
  { id: "work", title: "Работа и собеседования", titleEn: "Work & interviews", desc: "пройти интервью, работать на английском" },
  { id: "move", title: "Переезд и жизнь в среде", titleEn: "Move & live abroad", desc: "банк, врач, школа, работа — уверенно" },
  { id: "meetings", title: "Совещания и презентации", titleEn: "Meetings & talks", desc: "говорить на встречах без паники" },
  { id: "study", title: "Учёба или экзамен", titleEn: "Study or exam", desc: "IELTS, TOEFL, учёба на английском" },
  { id: "travel", title: "Путешествия", titleEn: "Travel", desc: "бытовая свобода в поездках" },
];

export type Level = { id: string; title: string; titleEn: string; desc: string };

export const LEVELS: Level[] = [
  { id: "a1", title: "A1 — начинаю", titleEn: "A1 — beginner", desc: "почти с нуля" },
  { id: "a2", title: "A2 — базовый", titleEn: "A2 — elementary", desc: "простые фразы" },
  { id: "b1", title: "B1 — средний", titleEn: "B1 — intermediate", desc: "общаюсь, но не хватает слов" },
  { id: "b2", title: "B2 — уверенный", titleEn: "B2 — upper-intermediate", desc: "свободно на бытовые темы" },
  { id: "c1", title: "C1 — продвинутый", titleEn: "C1 — advanced", desc: "сложные тексты и нюансы" },
  { id: "unknown", title: "Не знаю", titleEn: "Not sure", desc: "определим тестом позже" },
];
