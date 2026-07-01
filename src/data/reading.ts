// Тексты для скорочтения — короткие рассказы по уровням.
// Только public domain: басни Эзопа (свободные пересказы) и классика (Кэрролл, Уайльд,
// Джером, По). Защищённое не зашиваем — см. library.ts. Перевод — вторичный слой.

export type ReadingPara = { en: string; ru?: string };

export type Story = {
  id: string;
  title: string;
  author: string;
  level: "a1" | "a2" | "b1" | "b2" | "c1";
  genre: "fable" | "fantasy" | "humor" | "classic";
  /** Это фрагмент произведения (полное — по ссылке) */
  excerpt: boolean;
  /** Полный текст (public domain), напр. Project Gutenberg */
  fullUrl?: string;
  paras: ReadingPara[];
};

export const STORIES: Story[] = [
  {
    id: "lion-mouse",
    title: "The Lion and the Mouse",
    author: "Aesop",
    level: "a1",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "A lion was sleeping. A little mouse ran over him and woke him up. The lion caught the mouse. 'Please let me go,' said the mouse. 'One day I will help you.' The lion laughed, but he let the mouse go.", ru: "Лев спал. Маленькая мышка пробежала по нему и разбудила его. Лев поймал мышку. «Пожалуйста, отпусти меня, — сказала мышка. — Однажды я помогу тебе». Лев засмеялся, но отпустил мышку." },
      { en: "A few days later, hunters caught the lion in a net. The little mouse heard him. She came and bit through the ropes. The lion was free. 'You were right,' said the lion. 'Even a small friend can help.'", ru: "Через несколько дней охотники поймали льва в сеть. Маленькая мышка услышала его. Она пришла и перегрызла верёвки. Лев был свободен. «Ты была права, — сказал лев. — Даже маленький друг может помочь»." },
    ],
  },
  {
    id: "tortoise-hare",
    title: "The Tortoise and the Hare",
    author: "Aesop",
    level: "a2",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "A hare laughed at a slow tortoise. 'You are so slow!' he said. 'Then let's have a race,' said the tortoise. The hare agreed, and they began to run.", ru: "Заяц смеялся над медленной черепахой. «Ты такая медленная!» — сказал он. «Тогда давай устроим гонку», — сказала черепаха. Заяц согласился, и они побежали." },
      { en: "The hare ran very fast and then stopped to sleep. The tortoise walked slowly, but she never stopped. When the hare woke up, the tortoise was already at the finish. 'Slow and steady wins the race,' she said.", ru: "Заяц бежал очень быстро, а потом остановился поспать. Черепаха шла медленно, но не останавливалась. Когда заяц проснулся, черепаха уже была на финише. «Медленно, но верно — вот и победа», — сказала она." },
    ],
  },
  {
    id: "ant-grasshopper",
    title: "The Ant and the Grasshopper",
    author: "Aesop",
    level: "a2",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "All summer the grasshopper sang while the ant worked hard. The ant carried food to her home, day after day. 'Why do you work so much?' laughed the grasshopper. 'Come and sing with me!'", ru: "Всё лето кузнечик пел, пока муравей усердно трудился. Муравей носил еду в свой дом, день за днём. «Зачем ты так много работаешь? — смеялся кузнечик. — Иди петь со мной!»" },
      { en: "Then winter came. The grasshopper had no food and was cold. He went to the ant's warm home. The ant shared a little food and said, 'In summer I worked so that in winter I could rest.'", ru: "Потом пришла зима. У кузнечика не было еды, и ему было холодно. Он пошёл к тёплому дому муравья. Муравей поделился едой и сказал: «Летом я трудился, чтобы зимой отдыхать»." },
    ],
  },
  {
    id: "selfish-giant",
    title: "The Selfish Giant",
    author: "Oscar Wilde",
    level: "b1",
    genre: "fantasy",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/902",
    paras: [
      { en: "Every afternoon, as they were coming from school, the children used to go and play in the Giant's garden. It was a large lovely garden, with soft green grass.", ru: "Каждый день после школы дети ходили играть в сад Великана. Это был большой чудесный сад с мягкой зелёной травой." },
      { en: "Here and there over the grass stood beautiful flowers like stars, and there were twelve peach-trees that in the spring-time broke out into delicate blossoms of pink and pearl, and in the autumn bore rich fruit.", ru: "Тут и там среди травы стояли прекрасные цветы, похожие на звёзды, и росли двенадцать персиковых деревьев, что весной покрывались нежным розово-жемчужным цветом, а осенью приносили богатые плоды." },
      { en: "The birds sat on the trees and sang so sweetly that the children used to stop their games in order to listen to them. 'How happy we are here!' they cried to each other.", ru: "Птицы сидели на деревьях и пели так сладко, что дети бросали игры, чтобы их послушать. «Как нам здесь хорошо!» — кричали они друг другу." },
    ],
  },
  {
    id: "alice-rabbit",
    title: "Alice in Wonderland (opening)",
    author: "Lewis Carroll",
    level: "b1",
    genre: "fantasy",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/11",
    paras: [
      { en: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.", ru: "Алисе уже наскучило сидеть с сестрой на берегу и ничего не делать: раз-другой она заглянула в книжку, которую читала сестра, но там не было ни картинок, ни разговоров." },
      { en: "'And what is the use of a book,' thought Alice, 'without pictures or conversations?' So she was considering whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies,", ru: "«И что за толк в книжке, — думала Алиса, — без картинок и разговоров?» И она раздумывала, стоит ли удовольствие сплести венок из маргариток того, чтобы встать и нарвать их," },
      { en: "when suddenly a White Rabbit with pink eyes ran close by her. There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!'", ru: "как вдруг мимо пробежал Белый Кролик с розовыми глазами. В этом не было ничего особенного; не показалось Алисе странным и то, что Кролик бормотал себе под нос: «Ах, боже мой! Я опоздаю!»" },
    ],
  },
  {
    id: "three-men-boat",
    title: "Three Men in a Boat (opening)",
    author: "Jerome K. Jerome",
    level: "b2",
    genre: "humor",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/308",
    paras: [
      { en: "There were four of us — George, and William Samuel Harris, and myself, and Montmorency. We were sitting in my room, smoking, and talking about how bad we were — bad from a medical point of view I mean, of course.", ru: "Нас было четверо — Джордж, Уильям Сэмюэл Харрис, я и Монморанси. Мы сидели в моей комнате, курили и говорили о том, как плохо мы себя чувствуем — плохо с медицинской точки зрения, разумеется." },
      { en: "We were all feeling seedy, and we were getting quite nervous about it. Harris said he felt such extraordinary fits of giddiness come over him at times, that he hardly knew what he was doing.", ru: "Все мы были не в духе и порядком из-за этого нервничали. Харрис говорил, что на него временами накатывают такие приступы головокружения, что он едва понимает, что делает." },
    ],
  },
  {
    id: "tell-tale-heart",
    title: "The Tell-Tale Heart (opening)",
    author: "Edgar Allan Poe",
    level: "c1",
    genre: "classic",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/2148",
    paras: [
      { en: "True! — nervous — very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses — not destroyed — not dulled them.", ru: "Правда! — нервный, очень, ужасно нервный я был и остаюсь; но почему вы говорите, что я безумен? Болезнь обострила мои чувства — не разрушила, не притупила их." },
      { en: "Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How, then, am I mad? Hearken! and observe how healthily — how calmly I can tell you the whole story.", ru: "Острее всего был слух. Я слышал всё на небе и на земле. Я слышал многое в аду. Так как же я безумен? Слушайте! и смотрите, как здраво, как спокойно я могу рассказать вам всю историю." },
    ],
  },
  {
    id: "fox-grapes",
    title: "The Fox and the Grapes",
    author: "Aesop",
    level: "a1",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "A hungry fox saw some grapes high on a vine. They looked sweet and ripe. He jumped and jumped, but he could not reach them.", ru: "Голодная лиса увидела виноград высоко на лозе. Он выглядел сладким и спелым. Она прыгала и прыгала, но не могла достать." },
      { en: "At last he gave up and walked away. 'They are probably sour anyway,' he said. It is easy to hate what you cannot have.", ru: "Наконец она сдалась и ушла. «Наверное, он всё равно кислый», — сказала она. Легко презирать то, чего не можешь получить." },
    ],
  },
  {
    id: "crow-pitcher",
    title: "The Crow and the Pitcher",
    author: "Aesop",
    level: "a1",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "A thirsty crow found a pitcher with a little water at the bottom. Her beak could not reach it. She thought hard.", ru: "Жаждущая ворона нашла кувшин с небольшим количеством воды на дне. Её клюв не доставал. Она крепко задумалась." },
      { en: "One by one, she dropped small stones into the pitcher. The water rose higher and higher, and at last she drank. Little by little does the trick.", ru: "Одну за другой она бросала в кувшин камешки. Вода поднималась всё выше, и наконец ворона напилась. Понемногу — и дело сделано." },
    ],
  },
  {
    id: "boy-wolf",
    title: "The Boy Who Cried Wolf",
    author: "Aesop",
    level: "a2",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "A shepherd boy was bored, so he shouted, 'Wolf! Wolf!' The villagers ran to help, but there was no wolf. The boy laughed at them.", ru: "Пастушку было скучно, и он закричал: «Волк! Волк!» Жители прибежали на помощь, но волка не было. Мальчик посмеялся над ними." },
      { en: "He did it again, and again they came for nothing. Then a real wolf came. The boy shouted, but no one believed him. Liars are not believed even when they tell the truth.", ru: "Он повторил шутку, и снова люди прибежали зря. Потом пришёл настоящий волк. Мальчик кричал, но никто ему не поверил. Лжецам не верят, даже когда они говорят правду." },
    ],
  },
  {
    id: "north-wind-sun",
    title: "The North Wind and the Sun",
    author: "Aesop",
    level: "a2",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "The North Wind and the Sun argued about who was stronger. They saw a traveler in a warm coat and agreed: whoever makes him take it off is the stronger.", ru: "Северный Ветер и Солнце спорили, кто сильнее. Они увидели путника в тёплом плаще и договорились: кто заставит его снять плащ, тот и сильнее." },
      { en: "The Wind blew hard, but the man only held his coat tighter. Then the Sun shone gently and warmly, and soon the man took the coat off himself. Kindness does what force cannot.", ru: "Ветер дул изо всех сил, но человек лишь сильнее запахивал плащ. Тогда Солнце засияло мягко и тепло, и вскоре человек сам снял плащ. Доброта делает то, что не под силу грубой силе." },
    ],
  },
  {
    id: "golden-eggs",
    title: "The Goose and the Golden Eggs",
    author: "Aesop",
    level: "a2",
    genre: "fable",
    excerpt: false,
    paras: [
      { en: "A farmer had a goose that laid one golden egg every day. He grew rich, but he was greedy and wanted all the gold at once.", ru: "У фермера была гусыня, что несла по золотому яйцу каждый день. Он разбогател, но был жаден и захотел всё золото сразу." },
      { en: "So he cut the goose open, but inside there was nothing. Now there were no more eggs at all. Greed often loses what it already has.", ru: "Он разрезал гусыню, но внутри ничего не было. Больше не стало и яиц. Жадность часто теряет то, что уже имеет." },
    ],
  },
  {
    id: "nightingale-rose",
    title: "The Nightingale and the Rose (opening)",
    author: "Oscar Wilde",
    level: "b1",
    genre: "fantasy",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/902",
    paras: [
      { en: "'She said that she would dance with me if I brought her red roses,' cried the young Student, 'but in all my garden there is no red rose.'", ru: "«Она сказала, что будет танцевать со мной, если я принесу ей красные розы, — воскликнул юный Студент, — но во всём моём саду нет ни одной красной розы»." },
      { en: "From her nest in the oak-tree the Nightingale heard him, and she looked out through the leaves and wondered.", ru: "Из своего гнезда на дубе Соловей услышал его, выглянул сквозь листву и задумался." },
      { en: "'Here at last is a true lover,' said the Nightingale. 'Night after night have I sung of him, though I knew him not.'", ru: "«Вот наконец настоящий влюблённый, — сказал Соловей. — Ночь за ночью я пел о нём, хоть и не знал его»." },
    ],
  },
  {
    id: "peter-pan",
    title: "Peter Pan (opening)",
    author: "J. M. Barrie",
    level: "b1",
    genre: "fantasy",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/16",
    paras: [
      { en: "All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this.", ru: "Все дети, кроме одного, вырастают. Они скоро узнают, что вырастут, а Венди узнала об этом так." },
      { en: "One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother.", ru: "Однажды, когда ей было два года, она играла в саду, сорвала цветок и побежала с ним к маме." },
    ],
  },
  {
    id: "wind-willows",
    title: "The Wind in the Willows (opening)",
    author: "Kenneth Grahame",
    level: "b2",
    genre: "fantasy",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/289",
    paras: [
      { en: "The Mole had been working very hard all the morning, spring-cleaning his little home. Spring was moving in the air above and in the earth below and around him.", ru: "Крот всё утро трудился не покладая лап, наводя в своём домике весеннюю чистоту. Весна витала в воздухе наверху, в земле внизу и всюду вокруг него." },
      { en: "Something up above was calling him imperiously, and he made for the steep little tunnel which led to the sunlight.", ru: "Что-то там, наверху, властно звало его, и он устремился к крутому тоннельчику, что вёл к солнечному свету." },
    ],
  },
  {
    id: "sherlock-bohemia",
    title: "A Scandal in Bohemia (opening)",
    author: "Arthur Conan Doyle",
    level: "b2",
    genre: "classic",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/1661",
    paras: [
      { en: "To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name.", ru: "Для Шерлока Холмса она всегда оставалась ЭТОЙ женщиной. Я редко слышал, чтобы он называл её как-то иначе." },
      { en: "In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler.", ru: "В его глазах она затмевала всех женщин. Не то чтобы он испытывал к Ирэн Адлер чувство, похожее на любовь." },
    ],
  },
  {
    id: "dorian-gray",
    title: "The Picture of Dorian Gray (opening)",
    author: "Oscar Wilde",
    level: "c1",
    genre: "classic",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/174",
    paras: [
      { en: "The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac.", ru: "Студия была наполнена густым ароматом роз, и когда лёгкий летний ветерок шевелил деревья в саду, в открытую дверь вливался тяжёлый запах сирени." },
      { en: "From the corner of the divan of Persian saddle-bags on which he was lying, Lord Henry Wotton could just catch the gleam of the honey-sweet and honey-coloured blossoms of a laburnum.", ru: "С угла дивана, устланного персидскими седельными сумками, на котором он лежал, лорд Генри Уоттон мог различить мерцание медово-сладких, медового цвета цветов ракитника." },
    ],
  },
  {
    id: "tale-two-cities",
    title: "A Tale of Two Cities (opening)",
    author: "Charles Dickens",
    level: "c1",
    genre: "classic",
    excerpt: true,
    fullUrl: "https://www.gutenberg.org/ebooks/98",
    paras: [
      { en: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.", ru: "Это было лучшее из времён, это было худшее из времён, это был век мудрости, это был век глупости." },
      { en: "It was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.", ru: "Это была эпоха веры, это была эпоха безверия, это была пора Света, это была пора Тьмы, это была весна надежд, это была зима отчаяния." },
    ],
  },
];

export function wordCount(s: Story): number {
  return s.paras.reduce((n, p) => n + p.en.trim().split(/\s+/).length, 0);
}

export function storiesByLevel(level: string): Story[] {
  return STORIES.filter((s) => s.level === level);
}
