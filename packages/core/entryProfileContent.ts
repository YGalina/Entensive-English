// ===== S3 Profile Entry · learner-facing content (PR 3) =====
// Пять наблюдаемых признаков входа как ВОПРОСЫ на языке ученицы.
// Формат повторяет замороженный Batch A S3 (v4): один вопрос на экран, карточка
// «в разговоре», три равноправных ответа, счётчик «N из 5», заметка — в конце.
//
// Наблюдаемые признаки (семантика — `experience_architecture/06_SCREEN_SPECIFICATIONS.md`,
// S3): понимание связного текста · узнавание конструкции · дефицит извлечения ·
// посильность устной задачи с опорой · наличие конкретной живой цели.
//
// ВАЖНО про источник копирайта:
// • Вопрос 3 (`retrieval`) взят ДОСЛОВНО из замороженного экрана
//   `docs/design/exports/batch-a-defaults-final/screens/S3_profile_entry.html`.
// • Вопросы 1, 2, 4, 5 и состояния скрытого перевода утверждены владельцем
//   по `docs/design/exports/s3-copy-ratification-v3/`.
//
// Никаких заявлений об уровне (CEFR), никакой research/pilot/страж/стрик-лексики:
// это наблюдаемые признаки, а не оценка человека.

import type { ProfileSigns } from "./entryProfile";

/** Ключ признака = поле в `ProfileSigns`. */
export type SignKey = keyof ProfileSigns;

export type SignQuestion = {
  key: SignKey;
  /** Заголовок-вопрос. */
  title: string;
  /** Метка карточки-контекста (капсом, как во фрозене). */
  kicker: string;
  /** Ситуация перед примером. */
  lead: string;
  /** Английская реплика; `highlight` подсвечивается амбером. */
  english: { before: string; highlight: string; after: string };
  /** Перевод реплики. */
  translation: string;
  /** Подписи трёх равноправных ответов: да / нет / не могу оценить. */
  options: { yes: string; no: string; insufficient: string };
  /** true — копирайт выведен инженерно и ждёт утверждения (см. шапку файла). */
  pendingRatification: boolean;
  /** Известное методологическое возражение к этой формулировке, если есть. */
  pendingNote?: string;
};

export const S3_QUESTIONS: readonly SignQuestion[] = [
  {
    key: "s1",
    title: "Читаешь несколько предложений — общий смысл понятен?",
    kicker: "В ТЕКСТЕ",
    lead: "Два связанных предложения из подкаста о работе:",
    english: {
      before: "I stayed in that job for six years. Then ",
      highlight: "something shifted",
      after: " — I stopped waiting for permission.",
    },
    translation: "— Шесть лет на той работе. А потом что-то сдвинулось — и ждать разрешения стало незачем.",
    options: {
      yes: "Да, понимаю общий смысл",
      no: "Нет, к концу теряю нить",
      insufficient: "Не могу оценить",
    },
    pendingRatification: false,
  },
  {
    key: "s2",
    title: "Чувствуешь, что это два разных смысла?",
    kicker: "ДВЕ ФОРМЫ",
    lead: "Одно и то же дело, сказано по-разному:",
    english: { before: "I worked on it yesterday.\n", highlight: "I've been working on it all week.", after: "" },
    translation: "— Действие было вчера. · — Действие продолжается всю неделю.",
    options: {
      yes: "Да, смыслы разные",
      no: "Нет, для меня это одно и то же",
      insufficient: "Не могу оценить",
    },
    pendingRatification: false,
  },
  {
    // ДОСЛОВНО из замороженного Batch A S3 (v4).
    key: "s3",
    title: "Знакомая фраза — а вслух не выходит?",
    kicker: "В РАЗГОВОРЕ",
    lead: "Планёрка. Речь заходит о сроках:",
    english: { before: "We ", highlight: "met the deadline", after: "." },
    translation: "— Мы уложились в срок.",
    options: {
      yes: "Да, такое бывает",
      no: "Нет, обычно получается",
      insufficient: "Не могу оценить",
    },
    pendingRatification: false,
  },
  {
    key: "s4",
    title: "Когда слова перед глазами — сказать выходит?",
    kicker: "ФРАЗА ПЕРЕД ГЛАЗАМИ",
    lead: "Та же планёрка, но фраза лежит перед тобой:",
    english: { before: "We ", highlight: "met the deadline", after: " on Friday." },
    translation: "— Мы уложились в срок в пятницу.",
    options: {
      yes: "Да, так получается",
      no: "Нет, даже так не получается",
      insufficient: "Не могу оценить",
    },
    pendingRatification: false,
  },
  {
    key: "s5",
    title: "Есть разговор, ради которого всё это?",
    kicker: "ЖИВАЯ ЦЕЛЬ",
    lead: "Например: планёрка по средам, где спрашивают:",
    english: { before: "So, ", highlight: "what have you been working on", after: "?" },
    translation: "— И над чем ты сейчас работаешь?",
    options: {
      yes: "Да, такой разговор есть",
      no: "Нет, пока не назову",
      insufficient: "Не могу оценить",
    },
    pendingRatification: false,
  },
] as const;

/** Прочий learner-facing копирайт S3 (шапка, заметка, сохранение, сбой). */
export const S3_COPY = {
  screenTitle: "Несколько вопросов",
  counter: (n: number, total: number) => `${n} из ${total}`,
  back: "Предыдущий ответ",
  noteHint: "Заметка — в конце",
  noteTitle: "Хочешь что-то добавить?",
  noteLead: "Не обязательно. Пара слов о том, где английский нужен прямо сейчас.",
  notePlaceholder: "Например: планёрки по средам",
  noteSkipHint: "Можно оставить пустым.",
  save: "Сохранить и начать",
  saving: "Сохраняем…",
  /**
   * Обещание ДО сохранения (будущее время): где окажутся ответы, если сохранение
   * пройдёт. Это не подтверждение записи. Подтверждения «сохранено» в UI нет
   * вовсе: успешное сохранение сразу уводит в Path Hub, а неуспешное показывает
   * честный отказ — придумывать сообщение об успехе не требуется и нельзя.
   */
  saveLocalHint: "Ответы останутся только на этом телефоне.",
  saveFailedTitle: "Не сохранилось",
  saveFailedLead: "Ответы остались на экране. Попробуй сохранить ещё раз.",
  saveFailedRetry: "Сохранить ещё раз",
} as const;

/** Все строки S3 одним списком — для прогона через copy-firewall в тестах. */
export function s3CopyStrings(): string[] {
  const out: string[] = [
    S3_COPY.screenTitle,
    S3_COPY.counter(3, 5),
    S3_COPY.back,
    S3_COPY.noteHint,
    S3_COPY.noteTitle,
    S3_COPY.noteLead,
    S3_COPY.notePlaceholder,
    S3_COPY.noteSkipHint,
    S3_COPY.save,
    S3_COPY.saving,
    S3_COPY.saveLocalHint,
    S3_COPY.saveFailedTitle,
    S3_COPY.saveFailedLead,
    S3_COPY.saveFailedRetry,
  ];
  for (const q of S3_QUESTIONS) {
    out.push(q.title, q.kicker, q.lead, q.translation, q.options.yes, q.options.no, q.options.insufficient);
  }
  return out;
}
