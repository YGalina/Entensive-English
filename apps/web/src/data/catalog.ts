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

// Темы изучения (паки = блоки). Расширяемо.
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

export const GOALS: Goal[] = [
  { id: "speaking", title: "Заговорить", titleEn: "Start speaking", desc: "снять барьер, говорить свободно" },
  { id: "vocab", title: "Расширить словарь", titleEn: "Grow vocabulary", desc: "много слов в пассив и актив" },
  { id: "work", title: "Для работы", titleEn: "For work", desc: "профессиональный английский" },
  { id: "travel", title: "Для путешествий", titleEn: "For travel", desc: "бытовое общение в поездках" },
  { id: "exam", title: "Подготовка к экзамену", titleEn: "Exam prep", desc: "школа, IELTS, TOEFL" },
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
