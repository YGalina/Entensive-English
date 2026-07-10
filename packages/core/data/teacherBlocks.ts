import { getScript, type ShadowScript } from "./shadowing";

// Блоки преподавателя (аудит §8): живой ролик носителя/преподавателя —
// «контекстная половина блока». Полный блок метода:
//   1) разогрев: 6–8 ключевых слов/фраз из ролика (chunks, с переводом);
//   2) смотри и повторяй: официальный YouTube-embed + ключевые строки;
//   3) объясни: одну мысль ролика своими словами (pushed output → артефакт).
//
// Правовой режим (аудит §8): только официальный embed + атрибуция, никакого
// рехостинга. Ролики public-friendly (TED/выпускные речи/CrashCourse).
// Список роликов Галины заменит/дополнит этот набор.

export type TeacherChunk = {
  en: string;
  ru: string;
  /** секунда в ролике, где фраза звучит (для «прыжка» плеера) */
  at?: number;
};

export type TeacherBlock = {
  id: string;
  /** id скрипта из shadowing.ts — оттуда берём ролик, тайминги, строки */
  shadowingId: string;
  /** О чём блок — почему стоит смотреть (одна фраза) */
  topic: string;
  topicEn: string;
  /** 6–8 ключевых chunks — разогрев перед просмотром */
  chunks: TeacherChunk[];
  /** Задание на вывод после ролика */
  outputPrompt: string;
  outputPromptEn: string;
};

export const TEACHER_BLOCKS: TeacherBlock[] = [
  {
    id: "block-mcraven",
    shadowingId: "mcraven-bed",
    topic: "Как маленькое действие меняет весь день",
    topicEn: "How one small act changes the whole day",
    chunks: [
      { en: "make your bed", ru: "заправить кровать" },
      { en: "the first task of the day", ru: "первое дело за день" },
      { en: "a sense of pride", ru: "чувство гордости" },
      { en: "one task will lead to another", ru: "одно дело потянет за собой другое" },
      { en: "by the end of the day", ru: "к концу дня" },
      { en: "the little things in life matter", ru: "мелочи в жизни имеют значение" },
      { en: "if you can't do the little things right", ru: "если не умеешь делать мелочи как надо" },
      { en: "you'll never do the big things", ru: "ты никогда не сделаешь большое" },
    ],
    outputPrompt: "Объясни своими словами, почему McRaven советует начинать с заправленной кровати. Одна-две фразы по-английски.",
    outputPromptEn: "Explain in your own words why McRaven says to start by making your bed. One or two English sentences.",
  },
  {
    id: "block-brown",
    shadowingId: "brown-vulnerability",
    topic: "Почему уязвимость — это сила, а не слабость",
    topicEn: "Why vulnerability is strength, not weakness",
    chunks: [
      { en: "the courage to be imperfect", ru: "смелость быть несовершенной" },
      { en: "connection is why we're here", ru: "связь — то, ради чего мы здесь" },
      { en: "to let ourselves be seen", ru: "позволить себя увидеть" },
      { en: "a sense of worthiness", ru: "чувство собственной ценности" },
      { en: "they were willing to let go of who they thought they should be", ru: "они были готовы отпустить того, кем «должны были» быть" },
      { en: "vulnerability is the core of shame and fear", ru: "уязвимость — сердцевина стыда и страха" },
      { en: "but also the birthplace of joy and belonging", ru: "но и колыбель радости и принадлежности" },
    ],
    outputPrompt: "Как связаны уязвимость и настоящая связь между людьми? Объясни своими словами по-английски.",
    outputPromptEn: "How are vulnerability and real human connection linked? Explain in your own words in English.",
  },
  {
    id: "block-cuddy",
    shadowingId: "cuddy-posture",
    topic: "Как поза влияет на уверенность",
    topicEn: "How posture shapes confidence",
    chunks: [
      { en: "our body language shapes who we are", ru: "язык тела формирует то, кто мы есть" },
      { en: "power posing", ru: "поза силы" },
      { en: "fake it till you make it", ru: "притворяйся, пока не станет правдой" },
      { en: "fake it till you become it", ru: "притворяйся, пока сама этим не станешь" },
      { en: "tiny tweaks can lead to big changes", ru: "маленькие правки ведут к большим переменам" },
      { en: "don't fake it till you make it", ru: "не «притворяйся, пока не выйдет»" },
      { en: "our bodies change our minds", ru: "тело меняет разум" },
    ],
    outputPrompt: "Что значит «fake it till you become it»? Объясни мысль Кадди своими словами по-английски.",
    outputPromptEn: "What does “fake it till you become it” mean? Explain Cuddy's idea in your own words in English.",
  },
  {
    id: "block-jobs",
    shadowingId: "jobs-dots",
    topic: "Как соединяются точки твоего пути",
    topicEn: "How the dots of your path connect",
    chunks: [
      { en: "connecting the dots", ru: "соединять точки" },
      { en: "I dropped out of college", ru: "я бросил колледж" },
      { en: "you can't connect the dots looking forward", ru: "нельзя соединить точки, глядя вперёд" },
      { en: "you can only connect them looking backwards", ru: "их можно соединить, только оглядываясь назад" },
      { en: "you have to trust that the dots will connect", ru: "нужно верить, что точки соединятся" },
      { en: "trust in something — your gut, destiny, life", ru: "верить во что-то — в чутьё, судьбу, жизнь" },
      { en: "this approach has never let me down", ru: "этот подход меня ни разу не подвёл" },
    ],
    outputPrompt: "Почему Джобс говорит, что точки соединяются только «оглядываясь назад»? Объясни своими словами по-английски.",
    outputPromptEn: "Why does Jobs say the dots connect only “looking backwards”? Explain in your own words in English.",
  },
  {
    id: "block-crashcourse",
    shadowingId: "crashcourse-psych",
    topic: "Что вообще изучает психология",
    topicEn: "What psychology actually studies",
    chunks: [
      { en: "the study of the mind and behavior", ru: "наука о разуме и поведении" },
      { en: "why we think and feel the way we do", ru: "почему мы думаем и чувствуем именно так" },
      { en: "nature versus nurture", ru: "природа против воспитания" },
      { en: "how the brain works", ru: "как работает мозг" },
      { en: "it's a science, not just common sense", ru: "это наука, а не просто здравый смысл" },
      { en: "we're going to look at the evidence", ru: "мы будем смотреть на доказательства" },
    ],
    outputPrompt: "Что для тебя интереснее — «природа» или «воспитание» — и почему? Ответь по-английски своими словами.",
    outputPromptEn: "What's more interesting to you — “nature” or “nurture” — and why? Answer in English in your own words.",
  },
];

export function teacherBlockById(id: string): TeacherBlock | undefined {
  return TEACHER_BLOCKS.find((b) => b.id === id);
}

/** Блок + его shadowing-скрипт (ролик, тайминги, строки). null, если скрипт пропал. */
export function resolveBlock(id: string): { block: TeacherBlock; script: ShadowScript } | null {
  const block = teacherBlockById(id);
  if (!block) return null;
  const script = getScript(block.shadowingId);
  return script ? { block, script } : null;
}
