// Скрипты для shadowing: смотришь ролик с живым голосом носителя и ПОВТОРЯЕШЬ ВСЛУХ,
// читая текст/субтитры. Перевод вторичен и опционален.
// Видео — настоящий YouTube (IFrame API), родные субтитры включены.
// Тайминги строк сняты из РЕАЛЬНОЙ дорожки субтитров (yt-dlp, json3) — синхрон точный.

export type ShadowLine = {
  en: string;
  /** Вторичный перевод, по запросу (опционально) */
  ru?: string;
  /** Секунды начала/конца реплики в ролике */
  start: number;
  end: number;
};

export type Category = "commencement" | "ted" | "education";

export type ShadowScript = {
  id: string;
  title: string;
  author: string;
  category: Category;
  level: string;
  youtubeId: string;
  lines: ShadowLine[];
};

export const CATEGORY_LABEL: Record<Category, string> = {
  commencement: "Речи выпускникам",
  ted: "TED",
  education: "Психология и наука",
};

export const CATEGORY_ORDER: Category[] = ["commencement", "ted", "education"];

export const SHADOWING: ShadowScript[] = [
  {
    id: "jobs-dots",
    title: "Stay hungry, stay foolish",
    author: "Steve Jobs · Stanford, 2005",
    category: "commencement",
    level: "B1–B2",
    youtubeId: "UF8uR6Z6KLc",
    lines: [
      { en: "I'm honored to be with you today for your commencement from one of the finest universities in the world.", ru: "Для меня честь быть с вами сегодня на вашем выпускном в одном из лучших университетов мира.", start: 26.5, end: 35.6 },
      { en: "Truth be told, I never graduated from college.", ru: "По правде говоря, я так и не окончил колледж.", start: 35.8, end: 41.2 },
      { en: "And this is the closest I've ever gotten to a college graduation.", ru: "И это самое близкое, что у меня было к выпуску из колледжа.", start: 41.6, end: 47.8 },
      { en: "Today I want to tell you three stories from my life.", ru: "Сегодня я хочу рассказать вам три истории из моей жизни.", start: 48.0, end: 51.1 },
      { en: "That's it. No big deal. Just three stories.", ru: "И всё. Ничего особенного. Просто три истории.", start: 51.2, end: 55.6 },
      { en: "The first story is about connecting the dots.", ru: "Первая история — о том, как соединяются точки.", start: 55.8, end: 60.5 },
      { en: "I dropped out of Reed College after the first six months,", ru: "Я бросил Рид-колледж после первых шести месяцев,", start: 60.8, end: 64.8 },
      { en: "but then stayed around as a drop-in for another eighteen months or so before I really quit.", ru: "но ещё около восемнадцати месяцев заходил на пары как вольнослушатель, пока окончательно не ушёл.", start: 64.9, end: 69.3 },
    ],
  },
  {
    id: "mcraven-bed",
    title: "Make Your Bed",
    author: "Adm. William McRaven · UT Austin, 2014",
    category: "commencement",
    level: "B2",
    youtubeId: "pxBQLFLei70",
    lines: [
      { en: "Thank you, President Powers, Provost Fenves, deans, members of the faculty, family and friends, and most importantly, the class of 2014.", start: 4.0, end: 19.96 },
      { en: "It is indeed an honor for me to be here tonight. It's been almost 37 years to the day that I graduated from UT.", start: 19.96, end: 32.88 },
      { en: "Of all the things I remember, I don't have a clue who the commencement speaker was, and I certainly don't remember anything they said.", start: 47.52, end: 56.08 },
      { en: "So if I can't make this commencement speech memorable, I will at least try to make it short.", start: 56.08, end: 64.8 },
      { en: "The university slogan is, 'What starts here changes the world.'", start: 64.8, end: 73.84 },
      { en: "What starts here changes the world.", start: 73.84, end: 76.64 },
      { en: "If every one of you changed the lives of just ten people, and each of those people changed the lives of another ten,", start: 89.2, end: 101.44 },
      { en: "then in five generations the class of 2014 will have changed the lives of 800 million people.", start: 101.44, end: 113.96 },
    ],
  },
  {
    id: "cuddy-posture",
    title: "Your body language may shape who you are",
    author: "Amy Cuddy · TED",
    category: "ted",
    level: "B2",
    youtubeId: "Ks-_Mh1QhMc",
    lines: [
      { en: "So I want to start by offering you a free, no-tech life hack, and all it requires of you is this:", start: 13.0, end: 24.01 },
      { en: "that you change your posture for two minutes.", start: 24.01, end: 28.2 },
      { en: "But before I give it away, I want to ask you to do a little audit of your body and what you're doing with your body.", start: 28.2, end: 35.21 },
      { en: "So how many of you are sort of making yourselves smaller?", start: 35.21, end: 37.93 },
      { en: "Maybe you're hunching, crossing your legs, maybe wrapping your ankles.", start: 37.93, end: 41.27 },
      { en: "Sometimes we hold onto our arms like this.", start: 41.27, end: 45.01 },
      { en: "So I want you to pay attention to what you're doing right now.", start: 50.96, end: 53.97 },
      { en: "We're really fascinated with body language, and we're particularly interested in other people's body language.", start: 62.71, end: 71.16 },
    ],
  },
  {
    id: "brown-vulnerability",
    title: "The power of vulnerability",
    author: "Brené Brown · TED",
    category: "ted",
    level: "B1",
    youtubeId: "iCvmsMzlF7o",
    lines: [
      { en: "A couple years ago, an event planner called me because I was going to do a speaking event.", start: 16.86, end: 22.42 },
      { en: "And she said, 'I'm really struggling with how to write about you on the little flyer.'", start: 22.42, end: 27.73 },
      { en: "And I thought, 'Well, what's the struggle?'", start: 27.73, end: 30.49 },
      { en: "And she said, 'I saw you speak, and I'm going to call you a researcher, I think,", start: 30.49, end: 37.84 },
      { en: "but I'm afraid if I call you a researcher, no one will come, because they'll think you're boring and irrelevant.'", start: 37.84, end: 42.95 },
      { en: "But the thing I liked about your talk is you're a storyteller.", start: 42.95, end: 46.69 },
      { en: "So I think what I'll do is just call you a storyteller.", start: 46.69, end: 49.99 },
      { en: "And of course, the academic, insecure part of me was like, 'You're going to call me a what?'", start: 49.99, end: 55.32 },
    ],
  },
  {
    id: "crashcourse-psych",
    title: "Intro to Psychology",
    author: "CrashCourse · Psychology #1",
    category: "education",
    level: "B2",
    youtubeId: "vo4pMVb0R6M",
    lines: [
      { en: "Excluding other human minds, your mind is the most complicated piece of the universe that humans currently know about.", start: 17.23, end: 25.02 },
      { en: "The rules that govern it are mysterious and elusive.", start: 25.02, end: 30.0 },
      { en: "Maybe our brains just aren't complex enough to understand themselves. But that's not going to stop us from trying!", start: 30.0, end: 34.12 },
      { en: "The word 'psychology' comes from the Latin for the 'study of the soul.'", start: 34.12, end: 43.03 },
      { en: "Today we can safely call it the science of behavior and mental processes.", start: 43.03, end: 51.63 },
      { en: "Humans have always been curious about themselves and what's going on up here.", start: 51.63, end: 61.29 },
      { en: "Two thousand years ago, Chinese rulers conducted the world's first psychological exams,", start: 69.74, end: 79.04 },
      { en: "requiring public officials to take personality and intelligence tests.", start: 79.04, end: 88.89 },
    ],
  },
];

export function scriptsByCategory(cat: Category): ShadowScript[] {
  return SHADOWING.filter((s) => s.category === cat);
}

export function getScript(id: string): ShadowScript | undefined {
  return SHADOWING.find((s) => s.id === id);
}
