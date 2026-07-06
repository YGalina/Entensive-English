// Программа интенсива по дням (по логике эксперимента Петрусинского:
// массивный ввод нарастающими объёмами, ~7000 слов за две недели, скорость чтения ×2,5).
// Содержание дней опирается на уже готовые практики (киносеанс, узнавание, чтение, shadowing).

export type ProgramDay = {
  day: number;
  title: string;
  /** Цель дня в словах (массив) */
  goalWords: number;
  /** Рекомендованные часы интенсива */
  goalHours: number;
  /** Фокус дня — какие практики */
  focus: string[];
};

export type Program = {
  id: string;
  title: string;
  days: ProgramDay[];
};

export const PROGRAM: Program = {
  id: "intensive-2w",
  title: "Интенсив: английский за 14 дней",
  days: [
    { day: 1, title: "Старт: снятие барьеров", goalWords: 200, goalHours: 3, focus: ["Готовность", "Киносеанс"] },
    { day: 2, title: "Массив B1", goalWords: 400, goalHours: 4, focus: ["Киносеанс", "Узнавание"] },
    { day: 3, title: "Массив + контекст", goalWords: 500, goalHours: 4, focus: ["Киносеанс", "Активизация", "Узнавание"] },
    { day: 4, title: "Фразовые глаголы", goalWords: 400, goalHours: 4, focus: ["Киносеанс", "Узнавание"] },
    { day: 5, title: "Скорочтение", goalWords: 400, goalHours: 4, focus: ["Скорочтение", "Узнавание"] },
    { day: 6, title: "Shadowing", goalWords: 400, goalHours: 4, focus: ["Shadowing", "Узнавание"] },
    { day: 7, title: "Повтор недели", goalWords: 300, goalHours: 3, focus: ["Повторы", "Скорочтение"] },
    { day: 8, title: "Массив B2", goalWords: 600, goalHours: 5, focus: ["Киносеанс", "Узнавание"] },
    { day: 9, title: "Контекст + видео", goalWords: 600, goalHours: 5, focus: ["Активизация", "Shadowing"] },
    { day: 10, title: "Скорочтение: ускорение", goalWords: 500, goalHours: 4, focus: ["Скорочтение"] },
    { day: 11, title: "Массив C1", goalWords: 700, goalHours: 5, focus: ["Киносеанс", "Узнавание"] },
    { day: 12, title: "Shadowing + речь", goalWords: 600, goalHours: 5, focus: ["Shadowing", "Активизация"] },
    { day: 13, title: "Повтор + чтение", goalWords: 400, goalHours: 4, focus: ["Повторы", "Скорочтение"] },
    { day: 14, title: "Финиш интенсива", goalWords: 500, goalHours: 4, focus: ["Узнавание", "Shadowing"] },
  ],
};

export function programDay(n: number): ProgramDay {
  const i = Math.min(Math.max(1, n), PROGRAM.days.length) - 1;
  return PROGRAM.days[i];
}
