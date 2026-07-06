// Постановочные фразы по методу Шестова. Единица тренировки — НЕ отдельное
// слово, а ключевое слово + живое предложение с ним (из корпуса Words and
// Sentences сборника SupremeLearning). Протокол «лестницы темпа» (методичка,
// стр. 7): 1) слушай на обычной скорости, глазами по тексту; 2) проговаривай
// сверхмедленно, следя за артикуляцией; 3) проговаривай на разгоне вместе с
// диктором (сфальшивил — замолчи, подхвати со следующего слова); 4) синхронно.
// Цикл повторяется минимум 3 раза, варьируя ритм, интонацию, громкость.

export type DrillPhrase = {
  /** Ключевое слово (выделяется в предложении) */
  key: string;
  en: string;
  ru: string;
};

export type DrillLesson = {
  id: string;
  title: string;
  titleEn: string;
  phrases: DrillPhrase[];
};

export const DRILL_LESSONS: DrillLesson[] = [
  {
    id: "warm",
    title: "Урок 1 · Тёплый разговор",
    titleEn: "Lesson 1 · Warm talk",
    phrases: [
      {
        key: "aboard",
        en: "Dear passengers: welcome aboard!",
        ru: "Дорогие пассажиры, добро пожаловать на борт!",
      },
      {
        key: "books",
        en: "Read any good books lately?",
        ru: "Читала что-нибудь хорошее в последнее время?",
      },
      {
        key: "abroad",
        en: "When are you going abroad?",
        ru: "Когда ты едешь за границу?",
      },
      {
        key: "happiness",
        en: "Happiness is the most important thing in life.",
        ru: "Счастье — самое важное в жизни.",
      },
      {
        key: "beauty",
        en: "Beauty is in the eye of the beholder.",
        ru: "Красота — в глазах смотрящего.",
      },
      {
        key: "friend",
        en: "My very best friend is visiting the city today.",
        ru: "Моя самая близкая подруга сегодня приезжает в город.",
      },
      {
        key: "loving",
        en: "You are so loving and caring!",
        ru: "Ты такая любящая и заботливая!",
      },
      {
        key: "smile",
        en: "You have a beautiful smile. May I take your picture?",
        ru: "У тебя красивая улыбка. Можно тебя сфотографировать?",
      },
    ],
  },
  {
    id: "learning",
    title: "Урок 2 · Учёба и рост",
    titleEn: "Lesson 2 · Learning & growth",
    phrases: [
      {
        key: "learning",
        en: "Do you like my learning materials?",
        ru: "Тебе нравятся мои учебные материалы?",
      },
      {
        key: "learnt",
        en: "I’ve never learnt English.",
        ru: "Я никогда не учила английский.",
      },
      {
        key: "knowledge",
        en: "I’ve acquired a lot of knowledge by reading books.",
        ru: "Я получила много знаний, читая книги.",
      },
      {
        key: "teaching",
        en: "I love teaching younger children but not teenagers.",
        ru: "Обожаю учить младших детей, но не подростков.",
      },
      {
        key: "teacher",
        en: "She is a wonderful teacher but a terrible wife.",
        ru: "Она чудесный учитель, но ужасная жена.",
      },
      {
        key: "ability",
        en: "You have many different abilities, but not the ability to dance.",
        ru: "У тебя много разных способностей — но не способность танцевать.",
      },
      {
        key: "imagination",
        en: "Use your imagination to picture how this room will look.",
        ru: "Включи воображение и представь, как будет выглядеть эта комната.",
      },
      {
        key: "history",
        en: "We can learn many things from history, but mainly that we don’t learn from history.",
        ru: "История учит многому — прежде всего тому, что мы у неё не учимся.",
      },
    ],
  },
  {
    id: "soul",
    title: "Урок 3 · Душа и вдохновение",
    titleEn: "Lesson 3 · Soul & inspiration",
    phrases: [
      {
        key: "beautiful",
        en: "The valley is beautiful in the spring when the flowers are blooming.",
        ru: "Весной, когда цветут цветы, долина прекрасна.",
      },
      {
        key: "dream",
        en: "I had a dream about you last night.",
        ru: "Прошлой ночью ты мне снилась.",
      },
      {
        key: "soul",
        en: "Oh my gosh! I don’t know a single soul at this party.",
        ru: "Боже мой! Я не знаю ни души на этой вечеринке.",
      },
      {
        key: "energy",
        en: "I’m sorry but I just don’t have the energy to accompany you to the theater.",
        ru: "Прости, у меня просто нет сил идти с тобой в театр.",
      },
      {
        key: "wonderful",
        en: "It was a wonderful performance but I wouldn’t want to go again.",
        ru: "Это было чудесное представление, но второй раз я бы не пошла.",
      },
      {
        key: "delight",
        en: "Having you join our group tonight has been such a delight.",
        ru: "То, что ты сегодня с нами, — настоящая радость.",
      },
      {
        key: "grew",
        en: "The plant grew and grew until one day it was taller than me!",
        ru: "Растение росло и росло, пока однажды не стало выше меня!",
      },
      {
        key: "journey",
        en: "Their journey would have been even more tedious had they not sat in first class.",
        ru: "Их путешествие было бы ещё утомительнее, не сиди они в первом классе.",
      },
    ],
  },
];

/**
 * Лестница темпа по протоколу Шестова. wordByWord — сверхмедленный сегмент:
 * фраза по словам с паузами (веб-приближение 10–30-кратного замедления).
 */
export const TEMPO_STEPS = [
  { id: "listen", rate: 0.95, wordByWord: false },
  { id: "ultra", rate: 0.55, wordByWord: true },
  { id: "slow", rate: 0.7, wordByWord: false },
  { id: "native", rate: 1.0, wordByWord: false },
] as const;

export type TempoStepId = (typeof TEMPO_STEPS)[number]["id"];
