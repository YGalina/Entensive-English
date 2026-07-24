// ===== Copy / semantic firewall (PR 1 · foundation) =====
// Машинно-проверяемый список запрещённой learner-facing лексики и семантических
// правил. Источник: PRODUCT_CONSTITUTION (не-цели, честность заявлений), design
// firewall из `IMPLEMENTATION_READY_DESIGN_INDEX.md`, D-04 §7 leakage register.
//
// Использование: прогонять видимые строки экранов через `scanForBannedTerms`
// в тестах/линте перед реализацией экрана. Внутренние доки/спеки/этот код —
// не learner-facing и не сканируются.

export type BannedTerm = {
  /** Метка правила. */
  id: string;
  /** Регэксп (i, юникод) по learner-facing тексту. */
  pattern: RegExp;
  /** Почему запрещено. */
  why: string;
};

/**
 * Запрещённая learner-facing лексика. RU + EN. Пограничные слова (protocol/
 * artifact/evidence) запрещены как ИНТЕРФЕЙСНЫЕ ярлыки; в коде/спеках допустимы.
 */
// Примечание: с флагом `u` классы `\b`/`\w` — ASCII-only, поэтому для кириллицы
// используются юникод-границы (?<!\p{L}) / (?!\p{L}) и буквенный класс \p{L}.
export const BANNED_LEARNER_TERMS: readonly BannedTerm[] = [
  { id: "pilot", pattern: /(?<!\p{L})(?:пилот\p{L}*|pilot)(?!\p{L})/iu, why: "research-рамка вместо рамки обучения" },
  { id: "vertical-slice", pattern: /vertical\s*slice|вертикальн\p{L}*\s+срез/iu, why: "внутренний research-термин" },
  { id: "protocol", pattern: /(?<!\p{L})(?:protocol|протокол\p{L}*)(?!\p{L})/iu, why: "язык спецификации, не UI" },
  { id: "holdout", pattern: /(?<!\p{L})(?:holdout|холдаут\p{L}*)(?!\p{L})/iu, why: "раскрывает контрольную группу" },
  { id: "trained-group", pattern: /trained\s+(?:group|items?)|тренированн\p{L}*\s+групп\p{L}*/iu, why: "групповое назначение эксперимента" },
  { id: "control-group", pattern: /control\s+group|контрольн\p{L}*\s+групп\p{L}*/iu, why: "research-термин" },
  { id: "artifact", pattern: /(?<!\p{L})(?:artifact|артефакт\p{L}*)(?!\p{L})/iu, why: "внутренний термин хранилища" },
  { id: "evidence-class", pattern: /evidence\s*class|класс\p{L}*\s+свидетельств\p{L}*/iu, why: "внутренняя таксономия оценки" },
  { id: "srs", pattern: /(?<!\p{L})SRS(?!\p{L})/u, why: "внутренний термин; в UI — «повтор»" },
  { id: "core-accepted", pattern: /core[-\s]?accepted/iu, why: "внутреннее состояние данных" },
  { id: "streak", pattern: /(?<!\p{L})(?:streak|стрик\p{L}*|подряд)(?!\p{L})|N\s*подряд/iu, why: "стрик запрещён (игрофикация)" },
  { id: "guardian", pattern: /(?<!\p{L})(?:guardian|страж\p{L}*)(?!\p{L})/iu, why: "IFS-стражи вне продукта (Г-3)" },
  { id: "levelcheck", pattern: /levelcheck|проверк\p{L}*\s+уровн\p{L}*/iu, why: "CEFR-уровень из активности запрещён" },
  { id: "cefr", pattern: /(?<![\p{L}\p{N}])(?:A1|A2|B1|B2|C1|C2)(?![\p{L}\p{N}])/u, why: "CEFR как заявление о человеке (метки сложности материала — отдельно)" },
  { id: "percent-of-course", pattern: /%\s*(?:курса|до\s*B2)|percent\s*of\s*course|до\s*B2/iu, why: "процент курса / часы до уровня — обещание уровня" },
  { id: "speech-scoring", pattern: /оцен\p{L}*\s+произношени\p{L}*|speech\s*scor|accent\s*(?:score|judg)/iu, why: "оценка произношения/акцента не валидна" },
  { id: "cloud-sync", pattern: /облач\p{L}*\s+синхрон\p{L}*|cloud\s*sync|в\s+облак\p{L}*/iu, why: "cloud/sync-обещания вне доказанного" },
  { id: "fluency-promise", pattern: /свободно\s+(?:за|через)\s+\d|fluent\s+in\s+\d/iu, why: "обещание беглости к сроку" },
] as const;

export type FirewallFinding = { id: string; match: string; why: string };

/** Найти запрещённые learner-facing термины в строке. Пусто — чисто. */
export function scanForBannedTerms(text: string): FirewallFinding[] {
  const out: FirewallFinding[] = [];
  for (const t of BANNED_LEARNER_TERMS) {
    const m = text.match(t.pattern);
    if (m) out.push({ id: t.id, match: m[0], why: t.why });
  }
  return out;
}

/** true, если learner-facing строка проходит firewall. */
export function passesCopyFirewall(text: string): boolean {
  return scanForBannedTerms(text).length === 0;
}

/**
 * Семантические правила (не только лексика). Проверяются ревью/дизайном; здесь —
 * канонический список для чек-листа и будущих автоматических проверок.
 */
export const SEMANTIC_RULES: readonly string[] = [
  "Процесс-факт (часы, активность) не выдаётся за компетенцию/уровень.",
  "Публичное заявление ≤ реализованного класса свидетельства.",
  "Письменное не выдаётся за устное.",
  "Уровень — только из внешне-валидного среза, не из активности.",
  "Интерфейс не утверждает, какое чувство пришло к человеку.",
  "Оплата не гейтит данные пользовательницы и не появляется внутри оценки.",
  "Голос приватен по умолчанию, не анализируется, не гейтит.",
  "Прогресс — проекция, не гейт и не истина.",
] as const;
