// Установки для фазы «Настройка» (суггестопедия Лозанова + аффективный фильтр
// Крашена). Цель — снять барьеры восприятия взрослого: стыд («все знают, а я
// нет»), обесценивание своего опыта, перфекционизм, спешку. Формулировки:
// настоящее время, от первого лица, разрешающие — не требующие. На родном
// языке: установка должна лечь без сопротивления и перевода.

export type Affirmation = { ru: string; en: string };

export const AFFIRMATIONS: Affirmation[] = [
  {
    ru: "Мне ничего не нужно доказывать. Я просто смотрю и слушаю.",
    en: "I have nothing to prove. I simply watch and listen.",
  },
  {
    ru: "Мой мозг сам впитывает английский — без усилий.",
    en: "My brain absorbs English on its own — effortlessly.",
  },
  {
    ru: "Мне можно ошибаться. Ошибки — это мои шаги.",
    en: "I am allowed to make mistakes. Mistakes are my steps.",
  },
  {
    ru: "Я разрешаю словам просто течь через меня.",
    en: "I let the words simply flow through me.",
  },
  {
    ru: "Весь мой опыт со мной. Я умею учиться.",
    en: "All my experience is with me. I know how to learn.",
  },
  {
    ru: "Английский уже живёт во мне и всплывает сам.",
    en: "English already lives in me and surfaces on its own.",
  },
  {
    ru: "Я в безопасности. Здесь меня никто не оценивает.",
    en: "I am safe here. No one is judging me.",
  },
  {
    ru: "Сегодня достаточно просто быть здесь.",
    en: "Today it is enough just to be here.",
  },
];

/**
 * Дыхательный паттерн альфа-входа: вдох 4с — пауза 2с — выдох 6с.
 * Удлинённый выдох включает парасимпатику и замедляет ритмы мозга.
 */
export const BREATH = { inhale: 4000, hold: 2000, exhale: 6000 } as const;
export const BREATH_CYCLE_MS = BREATH.inhale + BREATH.hold + BREATH.exhale;
/** Рекомендуемое число дыхательных кругов перед сеансом. */
export const BREATH_CYCLES_GOAL = 6;
