// Нативный альфа-фон: пока честная заглушка. Web Audio (осцилляторы) в React
// Native нет; бинауральный дрон на телефоне потребует сгенерированный
// аудио-ассет + expo-audio с loop — запланировано на фазу рецептивного ядра.
// Контракт совпадает с web: startAmbient() -> false означает «фон недоступен»,
// и UI настройки уже умеет это показывать.

export function startAmbient(): boolean {
  return false;
}

export function stopAmbient() {}

export function isAmbientOn(): boolean {
  return false;
}
