// Ролевые сцены (идея Галины, 2026-07-10): говорить в РОЛИ героя — эмоция +
// безопасность (ошибается не «я», а Алиса) + новая англоговорящая идентичность.
// Ролевая рамка — из суггестопедии Лозанова и метода активизации Китайгородской.
//
// Источники — только public domain (Gutenberg); реплики адаптированы под
// уровень (упрощение PD-текста легально). Механика: реплику партнёра читает
// голос, СВОЮ реплику человек произносит сам — produce в маске.

export type RoleLine = {
  /** кто говорит: "a" | "b" */
  who: "a" | "b";
  en: string;
  ru: string;
};

export type RoleScene = {
  id: string;
  /** источник для честной атрибуции */
  source: string;
  level: "a2" | "b1" | "b2";
  title: string;
  titleEn: string;
  /** имена ролей */
  roleA: string;
  roleB: string;
  lines: RoleLine[];
};

export const ROLE_SCENES: RoleScene[] = [
  {
    id: "alice-cat",
    source: "Lewis Carroll — Alice's Adventures in Wonderland (public domain, adapted)",
    level: "a2",
    title: "Алиса и Чеширский Кот",
    titleEn: "Alice and the Cheshire Cat",
    roleA: "Alice",
    roleB: "Cheshire Cat",
    lines: [
      { who: "a", en: "Would you tell me, please, which way I ought to go from here?", ru: "Скажите, пожалуйста, куда мне отсюда идти?" },
      { who: "b", en: "That depends a good deal on where you want to get to.", ru: "Это во многом зависит от того, куда ты хочешь попасть." },
      { who: "a", en: "I don't much care where.", ru: "Мне почти всё равно куда." },
      { who: "b", en: "Then it doesn't matter which way you go.", ru: "Тогда неважно, какой дорогой идти." },
      { who: "a", en: "But I want to get somewhere.", ru: "Но я же хочу попасть хоть куда-нибудь." },
      { who: "b", en: "Oh, you're sure to do that, if you only walk long enough.", ru: "О, туда ты точно попадёшь — если будешь идти достаточно долго." },
    ],
  },
  {
    id: "holmes-watson",
    source: "Arthur Conan Doyle — The Adventures of Sherlock Holmes (public domain, adapted)",
    level: "b1",
    title: "Холмс и Ватсон",
    titleEn: "Holmes and Watson",
    roleA: "Watson",
    roleB: "Holmes",
    lines: [
      { who: "a", en: "How did you know all that? You saw him for one minute.", ru: "Откуда вы всё это узнали? Вы видели его одну минуту." },
      { who: "b", en: "I did not know. I saw. You look, my dear Watson, but you do not observe.", ru: "Я не узнал — я увидел. Вы смотрите, дорогой Ватсон, но не наблюдаете." },
      { who: "a", en: "Then tell me, what is the difference?", ru: "Тогда объясните: в чём разница?" },
      { who: "b", en: "You have seen the steps to this room a hundred times. How many are there?", ru: "Вы сто раз видели ступени в эту комнату. Сколько их?" },
      { who: "a", en: "How many? I have no idea, to be honest.", ru: "Сколько? Честно говоря, понятия не имею." },
      { who: "b", en: "Exactly. You have seen, but not observed. There are seventeen.", ru: "Вот именно. Видели — но не наблюдали. Их семнадцать." },
      { who: "a", en: "Seventeen! I will count them today, I promise you.", ru: "Семнадцать! Сегодня же пересчитаю, обещаю." },
    ],
  },
  {
    id: "peter-wendy",
    source: "J. M. Barrie — Peter Pan (public domain, adapted)",
    level: "a2",
    title: "Питер и Венди",
    titleEn: "Peter and Wendy",
    roleA: "Wendy",
    roleB: "Peter Pan",
    lines: [
      { who: "a", en: "Boy, why are you crying?", ru: "Мальчик, почему ты плачешь?" },
      { who: "b", en: "I wasn't crying. And anyway, my shadow won't stick on.", ru: "Я не плакал. И вообще — моя тень не приклеивается." },
      { who: "a", en: "Your shadow? Let me see it. I can sew it on for you.", ru: "Твоя тень? Покажи. Я могу пришить её тебе." },
      { who: "b", en: "Sew it on? What does that mean?", ru: "Пришить? А что это значит?" },
      { who: "a", en: "You are terribly ignorant. It means to fix it with a needle.", ru: "Ты ужасно необразованный. Это значит закрепить её иголкой." },
      { who: "b", en: "Oh! Then please do it quickly. I need my shadow tonight.", ru: "О! Тогда, пожалуйста, поскорее. Тень нужна мне сегодня ночью." },
    ],
  },
  {
    id: "dorothy-scarecrow",
    source: "L. Frank Baum — The Wonderful Wizard of Oz (public domain, adapted)",
    level: "a2",
    title: "Дороти и Страшила",
    titleEn: "Dorothy and the Scarecrow",
    roleA: "Dorothy",
    roleB: "Scarecrow",
    lines: [
      { who: "a", en: "Good day. Did you speak, or am I dreaming?", ru: "Добрый день. Это вы сказали — или мне снится?" },
      { who: "b", en: "Certainly I spoke. How do you do?", ru: "Конечно, я сказал. Как поживаете?" },
      { who: "a", en: "I'm pretty well, thank you. And who are you?", ru: "Неплохо, спасибо. А вы кто?" },
      { who: "b", en: "I am a Scarecrow. And I want brains more than anything.", ru: "Я — Страшила. И больше всего на свете я хочу мозги." },
      { who: "a", en: "Then come with me. The Wizard of Oz can help you.", ru: "Тогда идём со мной. Волшебник из Оз может тебе помочь." },
      { who: "b", en: "Really? Then I will go with you, wherever the road leads.", ru: "Правда? Тогда я пойду с тобой, куда бы ни вела дорога." },
    ],
  },
  {
    id: "darcy-elizabeth",
    source: "Jane Austen — Pride and Prejudice (public domain, adapted)",
    level: "b2",
    title: "Элизабет и мистер Дарси",
    titleEn: "Elizabeth and Mr Darcy",
    roleA: "Elizabeth",
    roleB: "Mr Darcy",
    lines: [
      { who: "b", en: "May I have the honour of the next dance, Miss Bennet?", ru: "Могу ли я иметь честь пригласить вас на следующий танец, мисс Беннет?" },
      { who: "a", en: "You surprise me, sir. I thought you found this evening rather dull.", ru: "Вы меня удивляете, сэр. Я думала, этот вечер кажется вам довольно скучным." },
      { who: "b", en: "An evening may improve. Company changes everything.", ru: "Вечер может стать лучше. Общество меняет всё." },
      { who: "a", en: "And yet an hour ago you would not dance with anyone.", ru: "И всё же час назад вы не желали танцевать ни с кем." },
      { who: "b", en: "An hour ago I had not heard you laugh at me.", ru: "Час назад я ещё не слышал, как вы надо мной смеётесь." },
      { who: "a", en: "Then I shall laugh more often. It seems to do you good.", ru: "Тогда я буду смеяться чаще. Похоже, вам это на пользу." },
      { who: "b", en: "In that case, Miss Bennet, I shall try to deserve it.", ru: "В таком случае, мисс Беннет, я постараюсь этого заслуживать." },
    ],
  },
];

export function sceneById(id: string): RoleScene | undefined {
  return ROLE_SCENES.find((s) => s.id === id);
}
