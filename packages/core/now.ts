// Текущее время одним вызовом. Вынесено в отдельный модуль, чтобы хукам можно
// было получать «сейчас» без прямых impure-вызовов в рендере (react-hooks/purity).
export function nowMs(): number {
  return Date.now();
}
