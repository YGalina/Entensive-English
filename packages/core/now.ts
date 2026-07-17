// Текущее время одним вызовом. Вынесено в отдельный модуль, чтобы хукам можно
// было получать «сейчас» без прямых impure-вызовов в рендере (react-hooks/purity).

let testNow: number | null = null;

export function nowMs(): number {
  return testNow ?? Date.now();
}

/**
 * ТОЛЬКО ДЛЯ ТЕСТОВ: заморозить «сейчас» — путешествие во времени для
 * интеграционных сценариев вида «пропуск дня → возврат → день 14».
 * null — вернуть реальное время. В продуктовом коде не вызывать.
 */
export function __setNowForTests(ms: number | null) {
  testNow = ms;
}
