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
