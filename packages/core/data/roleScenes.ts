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
  {
    id: "dorothy-scarecrow-2",
    source: "L. Frank Baum — The Wonderful Wizard of Oz (public domain, adapted)",
    level: "a2",
    title: "Дороти и Трусливый Лев",
    titleEn: "Dorothy and the Cowardly Lion",
    roleA: "Dorothy",
    roleB: "Lion",
    lines: [
      { who: "b", en: "Don't you dare to bite Toto! You ought to be ashamed of yourself!", ru: "Не смей кусать Тото! Как тебе не стыдно!" },
      { who: "a", en: "I didn't bite him. Why are you such a coward?", ru: "Я его не укусил. Почему ты такой трус?" },
      { who: "b", en: "I was born that way. But my heart beats fast every time I'm in danger.", ru: "Я таким родился. Но сердце колотится всякий раз, когда я в опасности." },
      { who: "a", en: "Perhaps you have heart trouble.", ru: "Может, у тебя что-то с сердцем." },
      { who: "b", en: "Maybe. If there is, it only proves I have a heart at all.", ru: "Может быть. Если так — это лишь доказывает, что сердце у меня всё-таки есть." },
      { who: "a", en: "Come with us. The Wizard might give you courage.", ru: "Идём с нами. Волшебник, может, даст тебе смелости." },
    ],
  },
  {
    id: "scrooge-nephew",
    source: "Charles Dickens — A Christmas Carol (public domain, adapted)",
    level: "b1",
    title: "Скрудж и племянник",
    titleEn: "Scrooge and his Nephew",
    roleA: "Nephew",
    roleB: "Scrooge",
    lines: [
      { who: "a", en: "A merry Christmas, uncle! God save you!", ru: "Счастливого Рождества, дядя! Храни вас Бог!" },
      { who: "b", en: "Bah! Humbug! What reason have you to be merry? You're poor enough.", ru: "Вздор! Чепуха! С чего тебе радоваться? Ты и так беден." },
      { who: "a", en: "What reason have you to be dismal? You're rich enough.", ru: "А с чего вам быть таким мрачным? Вы и так богаты." },
      { who: "b", en: "Christmas is a time for paying bills without money. Good afternoon!", ru: "Рождество — время платить по счетам без денег. Всего доброго!" },
      { who: "a", en: "I want nothing from you. Why cannot we be friends?", ru: "Мне от вас ничего не нужно. Почему мы не можем быть друзьями?" },
      { who: "b", en: "Good afternoon.", ru: "Всего доброго." },
      { who: "a", en: "I am sorry to find you so. A merry Christmas, uncle!", ru: "Жаль видеть вас таким. Счастливого Рождества, дядя!" },
    ],
  },
  {
    id: "jo-teddy",
    source: "Louisa May Alcott — Little Women (public domain, adapted)",
    level: "b1",
    title: "Джо и Лори",
    titleEn: "Jo and Laurie",
    roleA: "Jo",
    roleB: "Laurie",
    lines: [
      { who: "b", en: "You don't like your aunt, do you?", ru: "Ты ведь не любишь свою тётю, правда?" },
      { who: "a", en: "She's very kind, but she scolds and orders me about.", ru: "Она добрая, но постоянно ругает и командует мной." },
      { who: "b", en: "I know how that feels. Sometimes I want to run away.", ru: "Я знаю это чувство. Иногда хочется просто сбежать." },
      { who: "a", en: "Where would you go?", ru: "И куда бы ты подался?" },
      { who: "b", en: "Off to see the world. Wouldn't you come too?", ru: "Смотреть мир. А ты бы не поехала со мной?" },
      { who: "a", en: "In a minute — if I were a boy. But I'm not, so I must be proper.", ru: "Сию же минуту — будь я мальчишкой. Но я не он, так что приходится быть приличной." },
    ],
  },
  {
    id: "gatsby-nick",
    source: "F. Scott Fitzgerald — The Great Gatsby (public domain, adapted)",
    level: "b2",
    title: "Гэтсби и Ник",
    titleEn: "Gatsby and Nick",
    roleA: "Nick",
    roleB: "Gatsby",
    lines: [
      { who: "b", en: "Look here, old sport, what's your opinion of me anyhow?", ru: "Послушайте, старина, а что вы вообще обо мне думаете?" },
      { who: "a", en: "That's a rather difficult question to answer.", ru: "На такой вопрос ответить непросто." },
      { who: "b", en: "I don't want you to get the wrong idea from all these stories.", ru: "Не хочу, чтобы вы составили обо мне ложное мнение из этих слухов." },
      { who: "a", en: "People invent stories. It doesn't mean you have to explain yourself.", ru: "Люди выдумывают. Это не значит, что вы обязаны оправдываться." },
      { who: "b", en: "I'll tell you the truth. I don't want it between us.", ru: "Я скажу вам правду. Не хочу, чтобы она стояла между нами." },
      { who: "a", en: "Then tell me. I'm listening.", ru: "Тогда рассказывайте. Я слушаю." },
    ],
  },
];

export function sceneById(id: string): RoleScene | undefined {
  return ROLE_SCENES.find((s) => s.id === id);
}
