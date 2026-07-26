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
// • Вопросы 1, 2, 4, 5 в замороженном пакете отсутствуют (там показан только
//   один из пяти). Их формулировки ВЫВЕДЕНЫ инженерно из утверждённой семантики
//   признаков и голоса замороженного экрана и помечены `pendingRatification`.
//   Они требуют утверждения Fable/владельцем и могут быть заменены без изменения
//   логики: экран читает этот список, а не хардкодит текст.
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
};

export const S3_QUESTIONS: readonly SignQuestion[] = [
  {
    key: "s1",
    title: "Читаешь — и смысл держится?",
    kicker: "В ТЕКСТЕ",
    lead: "Абзац из подкаста о работе:",
    english: { before: "I had to ", highlight: "figure out", after: " what I actually wanted." },
    translation: "— Мне нужно было понять, чего я на самом деле хочу.",
    options: {
      yes: "Да, смысл понятен",
      no: "Нет, теряю нить",
      insufficient: "Не могу оценить",
    },
    pendingRatification: true,
  },
  {
    key: "s2",
    title: "Видишь разницу между этими двумя?",
    kicker: "ДВЕ ФОРМЫ",
    lead: "Одно и то же событие, два способа сказать:",
    english: { before: "I did it. / ", highlight: "I've been doing", after: " it." },
    translation: "— Сделал. / Занимаюсь этим уже какое-то время.",
    options: {
      yes: "Да, разницу вижу",
      no: "Нет, для меня одинаково",
      insufficient: "Не могу оценить",
    },
    pendingRatification: true,
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
    title: "С опорой перед глазами — получается сказать?",
    kicker: "С ПОДСКАЗКОЙ",
    lead: "Те же слова, но они лежат перед тобой:",
    english: { before: "We ", highlight: "met the deadline", after: " on Friday." },
    translation: "— Мы уложились в срок в пятницу.",
    options: {
      yes: "Да, с опорой выходит",
      no: "Нет, всё равно молчу",
      insufficient: "Не могу оценить",
    },
    pendingRatification: true,
  },
  {
    key: "s5",
    title: "Есть разговор, ради которого всё это?",
    kicker: "ЖИВАЯ ЦЕЛЬ",
    lead: "Например, планёрка по средам:",
    english: { before: "So, ", highlight: "what have you been working on", after: "?" },
    translation: "— Ну и над чем ты работаешь?",
    options: {
      yes: "Да, знаю такой разговор",
      no: "Нет, пока не назову",
      insufficient: "Не могу оценить",
    },
    pendingRatification: true,
  },
] as const;

/** Прочий learner-facing копирайт S3 (шапка, заметка, сохранение, сбой). */
export const S3_COPY = {
  screenTitle: "Несколько вопросов",
  counter: (n: number, total: number) => `${n} из ${total}`,
  back: "Предыдущий ответ",
  noteHint: "Заметка — в конце",
  noteTitle: "Хочешь что-то добавить?",
  noteLead: "Не обязательно. Пара слов о том, где английский нужен тебе прямо сейчас.",
  notePlaceholder: "Например: планёрки по средам",
  noteSkipHint: "Можно оставить пустым.",
  save: "Сохранить и начать",
  saving: "Сохраняем…",
  savedLocal: "Сохранено на этом устройстве.",
  saveFailedTitle: "Не сохранилось",
  saveFailedLead: "Твои ответы остались на экране. Попробуй сохранить ещё раз.",
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
    S3_COPY.savedLocal,
    S3_COPY.saveFailedTitle,
    S3_COPY.saveFailedLead,
    S3_COPY.saveFailedRetry,
  ];
  for (const q of S3_QUESTIONS) {
    out.push(q.title, q.kicker, q.lead, q.translation, q.options.yes, q.options.no, q.options.insufficient);
  }
  return out;
}
