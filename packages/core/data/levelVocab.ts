// Наборы слов по уровням (из PDF-списков курса, импортированы pypdf).
// Это «сырьё» для массивного ввода: киносеанс + узнавание (без контекстной фазы).
// Слова: en + ipa + перевод (ru). Часть слов обогащена аутентичными
// предложениями из корпуса Шестова (Words and Sentences) — пример виден в
// киносеансе и словаре.

import type { Pack, Word } from "./packs";
import b1 from "./vocab-b1.json";
import b2 from "./vocab-b2.json";
import c1 from "./vocab-c1.json";
import shestovExamples from "./shestovExamples.json";

type Raw = { en: string; ipa: string; ru: string };

const EXAMPLES = shestovExamples as Record<string, string>;

function toWords(raw: Raw[]): Word[] {
  return raw.map((r) => {
    const exEn = EXAMPLES[r.en.toLowerCase().trim()];
    return {
      en: r.en,
      ipa: r.ipa,
      ...(exEn ? { exEn } : {}),
      tr: { ru: { tr: r.ru, ex: "" } },
    };
  });
}

const B1 = toWords(b1 as Raw[]);
const B2 = toWords(b2 as Raw[]);
const C1 = toWords(c1 as Raw[]);

export const LEVEL_PACKS: Pack[] = [
  // Мега-поток — сверхнасыщенный массив по Петрусинскому: все уровни разом.
  // Мозг не должен «выучить» его за раз; массив кладётся в узнавание.
  {
    id: "level-mega",
    topic: "core",
    title: "Мега-поток B1–C1",
    context: "Сверхнасыщенный массив: все частотные списки одним потоком",
    kind: "vocab",
    words: [...B1, ...B2, ...C1],
  },
  { id: "level-b1", topic: "core", title: "Словарь B1", context: "Частотный список уровня B1", kind: "vocab", words: B1 },
  { id: "level-b2", topic: "core", title: "Словарь B2", context: "Частотный список уровня B2", kind: "vocab", words: B2 },
  { id: "level-c1", topic: "core", title: "Словарь C1", context: "Частотный список уровня C1", kind: "vocab", words: C1 },
];

export function getLevelPack(id: string): Pack | undefined {
  return LEVEL_PACKS.find((p) => p.id === id);
}

// Списки по уровням в порядке роста — для подбора «i+1» (Крашен: вход чуть
// ВЫШЕ уровня). Отвечает на «как я выучу B2, если дают только B1»: вал берёт
// твой уровень И подмешивает следующий, приоритет — ещё не узнанным словам.
const LEVEL_LISTS: { level: string; words: Word[] }[] = [
  { level: "b1", words: B1 },
  { level: "b2", words: B2 },
  { level: "c1", words: C1 },
];

function baseLevelIndex(level?: string): number {
  const l = (level ?? "b1").toLowerCase();
  if (l === "c1" || l === "c2") return 2;
  if (l === "b2") return 1;
  return 0; // a1/a2/b1
}

/**
 * Слова для сеанса (вал) с ростом i+1. Берёт текущий уровень + следующий,
 * ставит ВПЕРЁД ещё не узнанные (known — множество en в нижнем регистре),
 * освоенные уходят в конец на повтор. Так новые слова дополняются, а массив
 * ведёт вверх по уровням, а не топчется на месте.
 */
export function sessionWords(level: string | undefined, known: Set<string>, limit = 40): Word[] {
  const base = baseLevelIndex(level);
  const cur = LEVEL_LISTS[base]?.words ?? B1;
  const next = LEVEL_LISTS[base + 1]?.words ?? []; // i+1: следующий уровень
  // Пул: сперва текущий, затем подмешиваем следующий (i+1).
  const pool = [...cur, ...next];
  const fresh: Word[] = [];
  const seen: Word[] = [];
  for (const w of pool) {
    if (known.has(w.en.toLowerCase())) seen.push(w);
    else fresh.push(w);
  }
  // Новые вперёд (в т.ч. i+1), освоенные — хвостом на повтор.
  const ordered = [...fresh, ...seen];
  return ordered.slice(0, limit);
}

/** Метка уровня для заголовка сеанса — показывает, что массив ведёт вверх. */
export function sessionLevelLabel(level: string | undefined): string {
  const base = baseLevelIndex(level);
  const cur = LEVEL_LISTS[base]?.level.toUpperCase() ?? "B1";
  const nxt = LEVEL_LISTS[base + 1]?.level.toUpperCase();
  return nxt ? `${cur}→${nxt}` : cur;
}
