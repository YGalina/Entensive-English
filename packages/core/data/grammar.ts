// Грамматика в речи (метод Петрусинского/Шестова): не таблицы, а готовые
// конструкции. Рамка-реплика + подстановки → цельная грамматически верная фраза,
// которую проговариваешь вслух. Сгруппировано по временам. Перевод — на русском
// (родной язык-слой); английский — target.

export type Fill = { en: string; ru: string };
export type Example = { en: string; ru: string };

export type GrammarPattern = {
  id: string;
  tense: string; // English name
  tenseRu: string; // русское название
  cue: string; // установка: когда используется (простыми словами)
  formula: string; // формула образования
  markers: string; // слова-маркеры
  frame: { en: string; ru: string }; // рамка со слотом «___»
  fills: Fill[]; // подстановки в слот
  examples: Example[]; // готовые модельные фразы
};

export const GRAMMAR: GrammarPattern[] = [
  {
    id: "present-simple",
    tense: "Present Simple",
    tenseRu: "Настоящее простое",
    cue: "Регулярное: привычки, факты, расписание. «Обычно, всегда, каждый день».",
    formula: "I/you/we/they + глагол · he/she/it + глагол+s",
    markers: "usually, always, every day, often, never",
    frame: { en: "I ___ every day.", ru: "Я ___ каждый день." },
    fills: [
      { en: "drink coffee", ru: "пью кофе" },
      { en: "go to work", ru: "хожу на работу" },
      { en: "read books", ru: "читаю книги" },
      { en: "call my mom", ru: "звоню маме" },
      { en: "walk the dog", ru: "выгуливаю собаку" },
    ],
    examples: [
      { en: "She works in a hospital.", ru: "Она работает в больнице." },
      { en: "We usually have dinner at seven.", ru: "Мы обычно ужинаем в семь." },
    ],
  },
  {
    id: "present-continuous",
    tense: "Present Continuous",
    tenseRu: "Настоящее длительное",
    cue: "Прямо сейчас, в процессе. «Сейчас, в данный момент».",
    formula: "am/is/are + глагол+ing",
    markers: "now, right now, at the moment, still",
    frame: { en: "I am ___ now.", ru: "Я сейчас ___." },
    fills: [
      { en: "reading a book", ru: "читаю книгу" },
      { en: "cooking dinner", ru: "готовлю ужин" },
      { en: "working", ru: "работаю" },
      { en: "waiting for you", ru: "жду тебя" },
      { en: "listening to music", ru: "слушаю музыку" },
    ],
    examples: [
      { en: "He is sleeping right now.", ru: "Он сейчас спит." },
      { en: "They are playing football.", ru: "Они играют в футбол." },
    ],
  },
  {
    id: "past-simple",
    tense: "Past Simple",
    tenseRu: "Прошедшее простое",
    cue: "Завершённое действие в прошлом. «Вчера, на прошлой неделе, назад».",
    formula: "глагол+ed (или 2-я форма неправильного глагола)",
    markers: "yesterday, last week, ago, in 2020",
    frame: { en: "Yesterday I ___.", ru: "Вчера я ___." },
    fills: [
      { en: "watched a film", ru: "посмотрел фильм" },
      { en: "called a friend", ru: "позвонил другу" },
      { en: "went home early", ru: "ушёл домой рано" },
      { en: "bought new shoes", ru: "купил новые туфли" },
      { en: "met an old friend", ru: "встретил старого друга" },
    ],
    examples: [
      { en: "We visited Rome last year.", ru: "Мы были в Риме в прошлом году." },
      { en: "She saw him yesterday.", ru: "Она видела его вчера." },
    ],
  },
  {
    id: "future-will",
    tense: "Future (will)",
    tenseRu: "Будущее (will)",
    cue: "Решение в момент речи, обещание, предсказание.",
    formula: "will + глагол",
    markers: "tomorrow, soon, later, next week",
    frame: { en: "Tomorrow I will ___.", ru: "Завтра я ___." },
    fills: [
      { en: "call you", ru: "позвоню тебе" },
      { en: "finish the report", ru: "закончу отчёт" },
      { en: "help you", ru: "помогу тебе" },
      { en: "start a diet", ru: "начну диету" },
      { en: "book the tickets", ru: "забронирую билеты" },
    ],
    examples: [
      { en: "I think it will rain.", ru: "Думаю, будет дождь." },
      { en: "I will call you later.", ru: "Я позвоню тебе позже." },
    ],
  },
  {
    id: "going-to",
    tense: "Be going to",
    tenseRu: "Планы (going to)",
    cue: "Заранее решённый план, намерение.",
    formula: "am/is/are going to + глагол",
    markers: "tonight, this weekend, next month",
    frame: {
      en: "I am going to ___ this weekend.",
      ru: "На выходных я собираюсь ___.",
    },
    fills: [
      { en: "visit my parents", ru: "навестить родителей" },
      { en: "clean the house", ru: "убраться дома" },
      { en: "learn to cook", ru: "научиться готовить" },
      { en: "rest", ru: "отдыхать" },
      { en: "paint the room", ru: "покрасить комнату" },
    ],
    examples: [
      { en: "She is going to study medicine.", ru: "Она собирается учиться на врача." },
      { en: "We are going to move next month.", ru: "Мы переезжаем в следующем месяце." },
    ],
  },
  {
    id: "present-perfect",
    tense: "Present Perfect",
    tenseRu: "Настоящее совершённое",
    cue: "Опыт или результат, важный сейчас. «Уже, ещё, когда-либо, только что».",
    formula: "have/has + 3-я форма глагола",
    markers: "already, yet, ever, never, just",
    frame: { en: "I have already ___.", ru: "Я уже ___." },
    fills: [
      { en: "finished my work", ru: "закончил работу" },
      { en: "seen this film", ru: "смотрел этот фильм" },
      { en: "eaten", ru: "поел" },
      { en: "read that book", ru: "прочитал ту книгу" },
      { en: "been to London", ru: "был в Лондоне" },
    ],
    examples: [
      { en: "Have you ever tried sushi?", ru: "Ты когда-нибудь пробовал суши?" },
      { en: "I have just arrived.", ru: "Я только что приехал." },
    ],
  },
  {
    id: "past-continuous",
    tense: "Past Continuous",
    tenseRu: "Прошедшее длительное",
    cue: "Действие было в процессе в момент в прошлом. «Когда…, в это время…».",
    formula: "was/were + глагол+ing",
    markers: "while, when, at 5 pm yesterday",
    frame: { en: "I was ___ when you called.", ru: "Я ___, когда ты позвонил." },
    fills: [
      { en: "sleeping", ru: "спал" },
      { en: "cooking", ru: "готовил" },
      { en: "driving", ru: "был за рулём" },
      { en: "working", ru: "работал" },
      { en: "watching TV", ru: "смотрел телевизор" },
    ],
    examples: [
      { en: "They were playing when it started to rain.", ru: "Они играли, когда начался дождь." },
      { en: "I was reading all evening.", ru: "Я читал весь вечер." },
    ],
  },
  {
    id: "past-perfect",
    tense: "Past Perfect",
    tenseRu: "Прошедшее совершённое",
    cue: "Действие произошло до другого действия в прошлом. «Уже к тому моменту».",
    formula: "had + 3-я форма глагола",
    markers: "already, before, by the time, after",
    frame: {
      en: "I had ___ before you arrived.",
      ru: "Я уже ___ до того, как ты пришёл.",
    },
    fills: [
      { en: "finished dinner", ru: "поужинал" },
      { en: "left", ru: "ушёл" },
      { en: "read the letter", ru: "прочитал письмо" },
      { en: "fallen asleep", ru: "уснул" },
      { en: "cleaned the house", ru: "убрался дома" },
    ],
    examples: [
      { en: "She had already gone when I called.", ru: "Она уже ушла, когда я позвонил." },
      { en: "We had never seen snow before.", ru: "Мы раньше никогда не видели снег." },
    ],
  },
  {
    id: "present-perfect-continuous",
    tense: "Present Perfect Continuous",
    tenseRu: "Настоящее совершённое длительное",
    cue: "Действие длилось до сейчас (и, возможно, ещё идёт). «Уже сколько-то времени».",
    formula: "have/has been + глагол+ing",
    markers: "for, since, all day, lately",
    frame: { en: "I have been ___ for two hours.", ru: "Я ___ уже два часа." },
    fills: [
      { en: "working", ru: "работаю" },
      { en: "waiting", ru: "жду" },
      { en: "studying English", ru: "учу английский" },
      { en: "cooking", ru: "готовлю" },
      { en: "reading", ru: "читаю" },
    ],
    examples: [
      { en: "He has been living here since 2010.", ru: "Он живёт здесь с 2010 года." },
      { en: "It has been raining all day.", ru: "Дождь идёт весь день." },
    ],
  },
  {
    id: "future-continuous",
    tense: "Future Continuous",
    tenseRu: "Будущее длительное",
    cue: "Действие будет в процессе в момент в будущем.",
    formula: "will be + глагол+ing",
    markers: "at this time tomorrow, all day tomorrow",
    frame: {
      en: "This time tomorrow I will be ___.",
      ru: "Завтра в это время я буду ___.",
    },
    fills: [
      { en: "flying to Paris", ru: "лететь в Париж" },
      { en: "working", ru: "работать" },
      { en: "resting", ru: "отдыхать" },
      { en: "driving home", ru: "ехать домой" },
      { en: "sleeping", ru: "спать" },
    ],
    examples: [
      { en: "I will be waiting for you at six.", ru: "Я буду ждать тебя в шесть." },
      { en: "They will be traveling next week.", ru: "На следующей неделе они будут в путешествии." },
    ],
  },
  {
    id: "future-perfect",
    tense: "Future Perfect",
    tenseRu: "Будущее совершённое",
    cue: "Действие завершится к моменту в будущем. «К тому времени уже».",
    formula: "will have + 3-я форма глагола",
    markers: "by tomorrow, by next year, by then",
    frame: { en: "By next year I will have ___.", ru: "К следующему году я уже ___." },
    fills: [
      { en: "finished the course", ru: "закончу курс" },
      { en: "saved some money", ru: "накоплю денег" },
      { en: "moved", ru: "перееду" },
      { en: "learned to drive", ru: "научусь водить" },
      { en: "written the book", ru: "напишу книгу" },
    ],
    examples: [
      { en: "By 6 pm I will have finished.", ru: "К шести вечера я закончу." },
      { en: "She will have graduated by June.", ru: "К июню она уже окончит учёбу." },
    ],
  },
  {
    id: "used-to",
    tense: "Used to",
    tenseRu: "Раньше (used to)",
    cue: "Привычка или состояние в прошлом, которого больше нет.",
    formula: "used to + глагол",
    markers: "in the past, as a child, before",
    frame: { en: "I used to ___ as a child.", ru: "В детстве я ___." },
    fills: [
      { en: "play the piano", ru: "играл на пианино" },
      { en: "live by the sea", ru: "жил у моря" },
      { en: "hate vegetables", ru: "ненавидел овощи" },
      { en: "read a lot", ru: "много читал" },
      { en: "be shy", ru: "был застенчивым" },
    ],
    examples: [
      { en: "We used to go there every summer.", ru: "Раньше мы ездили туда каждое лето." },
      { en: "He used to smoke.", ru: "Раньше он курил." },
    ],
  },
];

/** Собрать фразу из рамки и подстановки. */
export function assemble(frame: string, fill: string): string {
  return frame.replace("___", fill);
}
