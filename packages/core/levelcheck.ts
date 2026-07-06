// Мини-определение уровня по словам (yes/no vocabulary check).
// Классический приём оценки словаря: узнавание частотных слов трёх уровней.
// Не экзамен: «знаю» = понимаешь смысл без перевода. ~1 минута, 18 слов.
// Чистая логика без UI и без импорта словарей: списки слов передаются снаружи
// (web и mobile подставляют свои JSON) — модуль работает и в Node-тестах.

export type RawWord = { en: string; ipa: string; ru: string };
export type CheckLevel = "b1" | "b2" | "c1";
export type CheckWord = { lvl: CheckLevel; w: RawWord };

/** Равномерная выборка count слов из частотного списка (без краёв). */
export function pickSample(list: RawWord[], count: number): RawWord[] {
  const step = Math.floor(list.length / (count + 1));
  return Array.from({ length: count }, (_, i) => list[(i + 1) * step]);
}

/** Собрать чек-лист: по perLevel слов из каждого уровня, от простого к сложному. */
export function buildCheckWords(
  lists: Record<CheckLevel, RawWord[]>,
  perLevel = 6
): CheckWord[] {
  return (["b1", "b2", "c1"] as const).flatMap((lvl) =>
    pickSample(lists[lvl], perLevel).map((w) => ({ lvl, w }))
  );
}

/** Оценка уровня по числу узнанных слов на каждом ярусе (порог — 2 из 6). */
export function scoreLevel(known: Record<CheckLevel, number>): string {
  if (known.b1 <= 2) return "a2";
  if (known.b2 <= 2) return "b1";
  if (known.c1 <= 2) return "b2";
  return "c1";
}
