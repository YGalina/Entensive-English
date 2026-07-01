// Наборы слов по уровням (из PDF-списков курса, импортированы pypdf).
// Это «сырьё» для массивного ввода: киносеанс + узнавание (без контекстной фазы).
// Слова: en + ipa + перевод (ru). Примеров нет — контекст берётся из тематических
// паков, чтения и shadowing.

import type { Pack, Word } from "./packs";
import b1 from "./vocab-b1.json";
import b2 from "./vocab-b2.json";
import c1 from "./vocab-c1.json";

type Raw = { en: string; ipa: string; ru: string };

function toWords(raw: Raw[]): Word[] {
  return raw.map((r) => ({
    en: r.en,
    ipa: r.ipa,
    tr: { ru: { tr: r.ru, ex: "" } },
  }));
}

export const LEVEL_PACKS: Pack[] = [
  { id: "level-b1", topic: "core", title: "Словарь B1", context: "Частотный список уровня B1", kind: "vocab", words: toWords(b1 as Raw[]) },
  { id: "level-b2", topic: "core", title: "Словарь B2", context: "Частотный список уровня B2", kind: "vocab", words: toWords(b2 as Raw[]) },
  { id: "level-c1", topic: "core", title: "Словарь C1", context: "Частотный список уровня C1", kind: "vocab", words: toWords(c1 as Raw[]) },
];

export function getLevelPack(id: string): Pack | undefined {
  return LEVEL_PACKS.find((p) => p.id === id);
}
