// Словарный ориентир уровня (yes/no vocabulary check) — v2.
// ЧЕСТНЫЕ ГРАНИЦЫ МЕТОДА (самокритика v1: порог 50% и самоотчёт позволяли
// добраться до C1 за 18 кликов — так нельзя):
//   • это ОРИЕНТИР по словарю, не экзамен: грамматику/слух/чтение он не видит;
//   • порог зачёта яруса — ≥5 из 6 (83%), а не «больше двух»;
//   • контрольные ФАЛЬШ-слова: «знаю» на выдуманных словах = ответ ненадёжен;
//   • потолок — B2: словами выше не подтверждается, дальше решает практика.
// Чистая логика без UI и без импорта словарей (списки передаются снаружи).

export type RawWord = { en: string; ipa: string; ru: string };
export type CheckLevel = "b1" | "b2" | "c1";

export type CheckItem =
  | { kind: "real"; lvl: CheckLevel; w: RawWord }
  | { kind: "fake"; w: RawWord };

/** Псевдослова-ловушки: выглядят по-английски, но их не существует. */
export const FAKE_WORDS: RawWord[] = [
  { en: "brellick", ipa: "/ˈbrelɪk/", ru: "" },
  { en: "montrave", ipa: "/mɒnˈtreɪv/", ru: "" },
  { en: "sculpine", ipa: "/ˈskʌlpaɪn/", ru: "" },
];

/** Равномерная выборка count слов из частотного списка (без краёв). */
export function pickSample(list: RawWord[], count: number): RawWord[] {
  const step = Math.floor(list.length / (count + 1));
  return Array.from({ length: count }, (_, i) => list[(i + 1) * step]);
}

/**
 * Чек-лист: по perLevel слов на ярус (от простого к сложному) + фальш-слова,
 * детерминированно вкраплённые в середину каждого яруса.
 */
export function buildCheckItems(
  lists: Record<CheckLevel, RawWord[]>,
  perLevel = 6
): CheckItem[] {
  const items: CheckItem[] = (["b1", "b2", "c1"] as const).flatMap((lvl) =>
    pickSample(lists[lvl], perLevel).map((w) => ({ kind: "real" as const, lvl, w }))
  );
  // Вставки после 4-го, 10-го и 16-го вопроса — незаметно внутри потока.
  const withFakes = [...items];
  const positions = [4, 10, 16];
  FAKE_WORDS.forEach((w, i) => {
    const at = Math.min(positions[i] + i * 0, withFakes.length);
    withFakes.splice(Math.min(positions[i], withFakes.length), 0, { kind: "fake", w });
  });
  return withFakes;
}

export type CheckResult = {
  /** Стартовый уровень по словарю. Никогда выше b2. */
  level: "a2" | "b1" | "b2";
  /** Словарь уверенно выше B2 — но подтвердить это могут только практика/тексты. */
  cappedHigh: boolean;
  /** ≥2 «знаю» на фальш-словах: ответы ненадёжны, берём мягкий дефолт. */
  unreliable: boolean;
};

/** Оценка: ярус зачтён при ≥(perLevel−1) из perLevel — то есть ≥5 из 6. */
export function scoreCheck(
  known: Record<CheckLevel, number>,
  fakesKnown: number,
  perLevel = 6
): CheckResult {
  if (fakesKnown >= 2) return { level: "b1", cappedHigh: false, unreliable: true };
  const pass = (n: number) => n >= perLevel - 1;
  if (!pass(known.b1)) return { level: "a2", cappedHigh: false, unreliable: false };
  if (!pass(known.b2)) return { level: "b1", cappedHigh: false, unreliable: false };
  if (!pass(known.c1)) return { level: "b2", cappedHigh: false, unreliable: false };
  return { level: "b2", cappedHigh: true, unreliable: false };
}
