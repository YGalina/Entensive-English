// Корректирующая обратная связь на вывод — Фаза A (09_architecture_plan.md §2.4).
// Наука (Strong): prompts > recasts — подсказка к САМОисправлению работает лучше
// готового исправления. Поэтому здесь нет «красной ручки»: только мягкие
// подсказки по типовым ошибкам L1-русских. Ядро без i18n — возвращаем коды,
// экраны переводят через словарь (t.feedback[id]).
//
// Этап 1 — офлайн-правила (этот файл). Этап 2 (Фаза D) — LLM на сервере,
// только по согласию.

export type FeedbackHint = {
  /** код подсказки — ключ в i18n-словаре экранов */
  id: string;
  /** фрагмент текста пользователя, к которому относится подсказка */
  sample?: string;
};

type Rule = {
  id: string;
  /** возвращает найденный фрагмент или null */
  find: (text: string) => string | null;
};

function findRe(re: RegExp): (text: string) => string | null {
  return (text) => {
    const m = text.match(re);
    return m ? m[0].trim() : null;
  };
}

// Нерегулярные прошедшие формы для эвристики past-marker (наличие хотя бы
// одной считаем признаком прошедшего времени).
const PAST_FORMS =
  /\b(was|were|did|went|had|got|said|made|took|came|saw|knew|thought|felt|found|told|became|left|put|kept|began|met|paid|read|ran|spoke|spent|stood|wrote|woke|ate|drank|slept|bought|brought|taught|caught|heard|held|lost|sat|sent|won|understood|gave)\b/i;

const RULES: Rule[] = [
  // Кальки из русского — самые частые и самые «липкие»
  { id: "do-decision", find: findRe(/\b(do|did|doing|does)\s+(a\s+|the\s+)?decisions?\b/i) },
  { id: "feel-myself", find: findRe(/\bfeel(s|ing)?\s+myself\b/i) },
  { id: "depends-from", find: findRe(/\bdepend(s|ed|ing)?\s+from\b/i) },
  { id: "discuss-about", find: findRe(/\bdiscuss(es|ed|ing)?\s+about\b/i) },
  { id: "married-on", find: findRe(/\bmarried\s+on\b/i) },
  { id: "in-weekday", find: findRe(/\bin\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i) },
  { id: "very-like", find: findRe(/\bvery\s+(like|love|want|need)\b/i) },
  // Маленькое i — мгновенная победа
  { id: "capital-i", find: findRe(/(^|\s)i(\s|'m|'ve|'ll|'d)/) },
  // Маркер прошлого без прошедшего времени
  {
    id: "past-marker",
    find: (text) => {
      const marker = text.match(/\b(yesterday|last\s+(week|month|year|night)|ago)\b/i);
      if (!marker) return null;
      if (PAST_FORMS.test(text) || /\b\w{3,}ed\b/i.test(text)) return null;
      return marker[0];
    },
  },
  // «Пиши, сокращай» — одно длинное предложение без единой точки внутри
  {
    id: "shorter",
    find: (text) => {
      const t = text.trim();
      const body = t.replace(/[.!?…]+\s*$/, "");
      if (t.length > 180 && !/[.!?]/.test(body)) return t.slice(0, 40) + "…";
      return null;
    },
  },
];

/**
 * Мягкие подсказки к тексту пользователя. Максимум 2 — не заваливаем.
 * Пустой массив = «живая фраза, придраться не к чему» (UI хвалит).
 */
export function feedbackFor(text: string): FeedbackHint[] {
  const t = (text ?? "").trim();
  if (!t) return [];
  const hints: FeedbackHint[] = [];
  for (const rule of RULES) {
    const sample = rule.find(t);
    if (sample) hints.push({ id: rule.id, sample });
    if (hints.length >= 2) break;
  }
  return hints;
}

/** Все известные коды подсказок — для полноты i18n-словарей и тестов. */
export const FEEDBACK_HINT_IDS = RULES.map((r) => r.id);
