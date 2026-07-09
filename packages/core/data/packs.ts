// Частотная лексика, сгруппированная в «пачки» (блоки метода).
// Единица обучения — ПАЧКА, жёстко связанная с контекстом (см. 05_method_to_mechanics.md).
// Учим ТОЛЬКО английский. Слой перевода — под выбранный родной язык (L1), §7.
// def — английское толкование, универсальный фолбэк, если перевода под L1 ещё нет.

import type { LangCode } from "./catalog";

export type Translation = { tr: string; ex: string };

export type Word = {
  /** Английское слово (target) */
  en: string;
  /** Транскрипция (IPA) */
  ipa: string;
  /** Английское толкование — фолбэк и монолингвальный канал (опц.) */
  def?: string;
  /** Контекст: то же слово в живой речи (English) — фаза «Активизация» (опц.) */
  exEn?: string;
  /** Переводы по родным языкам ученика */
  tr: Partial<Record<LangCode, Translation>>;
};

export type Pack = {
  id: string;
  /** id темы из catalog.TOPICS */
  topic: string;
  title: string;
  /** Тема контекста (видео/текст этой пачки) */
  context: string;
  /** "theme" — блок с контекстом; "vocab" — список слов по уровню (без контекста) */
  kind?: "theme" | "vocab";
  words: Word[];
};

export type DayPlan = {
  goalWords: number;
  hours: number;
  streak: number;
  packs: Pack[];
};

/** Перевод слова под выбранный L1 с фолбэком на английское толкование. */
export function translate(w: Word, lang: LangCode): { text: string; isDef: boolean } {
  const t = w.tr[lang];
  if (t && t.tr) return { text: t.tr, isDef: false };
  return { text: w.def ?? w.en, isDef: true };
}

/** Пример под выбранный L1 с фолбэком на английский. */
export function translateExample(w: Word, lang: LangCode): { text: string; isDef: boolean } {
  const t = w.tr[lang];
  if (t && t.ex) return { text: t.ex, isDef: false };
  return { text: w.exEn ?? w.en, isDef: true };
}

const health: Pack = {
  id: "health",
  topic: "health",
  title: "Здоровье",
  context: "Видео и текст: как тело справляется со стрессом",
  words: [
    { en: "resilience", ipa: "/rɪˈzɪliəns/", def: "ability to recover quickly", exEn: "She showed real resilience after the loss.", tr: { ru: { tr: "устойчивость, стойкость", ex: "Она проявила настоящую стойкость после потери." } } },
    { en: "recovery", ipa: "/rɪˈkʌvəri/", def: "return to health or normal", exEn: "Sleep speeds up recovery after training.", tr: { ru: { tr: "восстановление", ex: "Сон ускоряет восстановление после тренировки." } } },
    { en: "breath", ipa: "/breθ/", def: "air taken into the lungs", exEn: "Take a slow, deep breath.", tr: { ru: { tr: "дыхание, вдох", ex: "Сделай медленный, глубокий вдох." } } },
    { en: "heartbeat", ipa: "/ˈhɑːrtbiːt/", def: "the beating of the heart", exEn: "Her heartbeat slowed as she calmed down.", tr: { ru: { tr: "сердцебиение", ex: "Её сердцебиение замедлилось, когда она успокоилась." } } },
    { en: "muscle", ipa: "/ˈmʌsl/", def: "body tissue that makes movement", exEn: "Stretching keeps the muscle flexible.", tr: { ru: { tr: "мышца", ex: "Растяжка держит мышцу гибкой." } } },
    { en: "immune", ipa: "/ɪˈmjuːn/", def: "protected against disease", exEn: "Stress weakens the immune system.", tr: { ru: { tr: "иммунный", ex: "Стресс ослабляет иммунную систему." } } },
    { en: "wound", ipa: "/wuːnd/", def: "an injury to the body", exEn: "The wound healed in a week.", tr: { ru: { tr: "рана", ex: "Рана зажила за неделю." } } },
    { en: "heal", ipa: "/hiːl/", def: "to become healthy again", exEn: "The body can heal itself.", tr: { ru: { tr: "заживать, исцелять", ex: "Тело способно исцелять себя." } } },
    { en: "fatigue", ipa: "/fəˈtiːɡ/", def: "extreme tiredness", exEn: "Chronic fatigue made work hard.", tr: { ru: { tr: "усталость, утомление", ex: "Хроническая усталость мешала работать." } } },
    { en: "nutrition", ipa: "/nuˈtrɪʃn/", def: "food needed for health", exEn: "Good nutrition supports the brain.", tr: { ru: { tr: "питание", ex: "Хорошее питание поддерживает мозг." } } },
    { en: "blood", ipa: "/blʌd/", def: "red liquid in the body", exEn: "Exercise improves blood flow.", tr: { ru: { tr: "кровь", ex: "Движение улучшает кровоток." } } },
    { en: "nerve", ipa: "/nɜːrv/", def: "fiber that carries signals", exEn: "The signal travels along the nerve.", tr: { ru: { tr: "нерв", ex: "Сигнал идёт по нерву." } } },
    { en: "swelling", ipa: "/ˈswelɪŋ/", def: "a part that grows larger", exEn: "Ice reduces swelling.", tr: { ru: { tr: "отёк, опухание", ex: "Лёд уменьшает отёк." } } },
    { en: "dose", ipa: "/doʊs/", def: "amount of medicine taken", exEn: "Never exceed the daily dose.", tr: { ru: { tr: "доза", ex: "Никогда не превышай суточную дозу." } } },
    { en: "symptom", ipa: "/ˈsɪmptəm/", def: "a sign of illness", exEn: "Fever is a common symptom.", tr: { ru: { tr: "симптом", ex: "Жар — частый симптом." } } },
    { en: "treatment", ipa: "/ˈtriːtmənt/", def: "medical care for illness", exEn: "The treatment lasted three weeks.", tr: { ru: { tr: "лечение", ex: "Лечение длилось три недели." } } },
    { en: "breathe", ipa: "/briːð/", def: "to take air in and out", exEn: "Breathe out slowly through the mouth.", tr: { ru: { tr: "дышать", ex: "Выдыхай медленно через рот." } } },
    { en: "joint", ipa: "/dʒɔɪnt/", def: "where two bones meet", exEn: "Cold weather makes the joint ache.", tr: { ru: { tr: "сустав", ex: "В холод сустав ноет." } } },
    { en: "bone", ipa: "/boʊn/", def: "hard part of the skeleton", exEn: "Calcium keeps the bone strong.", tr: { ru: { tr: "кость", ex: "Кальций держит кость крепкой." } } },
    { en: "skin", ipa: "/skɪn/", def: "outer covering of the body", exEn: "Sunlight affects the skin.", tr: { ru: { tr: "кожа", ex: "Солнце влияет на кожу." } } },
    { en: "rest", ipa: "/rest/", def: "to stop activity and relax", exEn: "The doctor advised full rest.", tr: { ru: { tr: "отдых, покой", ex: "Врач посоветовал полный покой." } } },
    { en: "pain", ipa: "/peɪn/", def: "an unpleasant hurt feeling", exEn: "The pain faded after an hour.", tr: { ru: { tr: "боль", ex: "Боль стихла через час." } } },
    { en: "relief", ipa: "/rɪˈliːf/", def: "easing of pain or worry", exEn: "The pill brought quick relief.", tr: { ru: { tr: "облегчение", ex: "Таблетка принесла быстрое облегчение." } } },
    { en: "strength", ipa: "/streŋθ/", def: "physical power", exEn: "She slowly regained her strength.", tr: { ru: { tr: "сила", ex: "Она медленно вернула себе силу." } } },
    { en: "balance", ipa: "/ˈbæləns/", def: "staying steady", exEn: "Yoga improves balance.", tr: { ru: { tr: "равновесие, баланс", ex: "Йога улучшает равновесие." } } },
    { en: "posture", ipa: "/ˈpɑːstʃər/", def: "how you hold your body", exEn: "Good posture protects the back.", tr: { ru: { tr: "осанка", ex: "Хорошая осанка бережёт спину." } } },
    { en: "digestion", ipa: "/daɪˈdʒestʃən/", def: "breaking down food", exEn: "Walking helps digestion.", tr: { ru: { tr: "пищеварение", ex: "Ходьба помогает пищеварению." } } },
    { en: "hydration", ipa: "/haɪˈdreɪʃn/", def: "having enough water", exEn: "Hydration matters in the heat.", tr: { ru: { tr: "увлажнение, водный баланс", ex: "Водный баланс важен в жару." } } },
    { en: "ache", ipa: "/eɪk/", def: "a continuous dull pain", exEn: "My legs ache after the run.", tr: { ru: { tr: "ныть; ноющая боль", ex: "Ноги ноют после пробежки." } } },
    { en: "dizzy", ipa: "/ˈdɪzi/", def: "feeling unsteady, head spinning", exEn: "She felt dizzy standing up.", tr: { ru: { tr: "когда кружится голова", ex: "Ей стало дурно, когда она встала." } } },
    { en: "soothe", ipa: "/suːð/", def: "to make calmer or less painful", exEn: "Warm tea can soothe a sore throat.", tr: { ru: { tr: "успокаивать, унимать", ex: "Тёплый чай унимает боль в горле." } } },
    { en: "weary", ipa: "/ˈwɪri/", def: "very tired", exEn: "He felt weary after the shift.", tr: { ru: { tr: "утомлённый", ex: "Он был утомлён после смены." } } },
    { en: "vital", ipa: "/ˈvaɪtl/", def: "essential for life", exEn: "Water is vital for the body.", tr: { ru: { tr: "жизненно важный", ex: "Вода жизненно важна для тела." } } },
    { en: "intake", ipa: "/ˈɪnteɪk/", def: "amount taken in", exEn: "Lower your sugar intake.", tr: { ru: { tr: "потребление, приём", ex: "Снизь потребление сахара." } } },
    { en: "cure", ipa: "/kjʊr/", def: "to make an illness go away", exEn: "There is no instant cure.", tr: { ru: { tr: "лекарство; излечивать", ex: "Мгновенного лекарства нет." } } },
    { en: "thrive", ipa: "/θraɪv/", def: "to grow and do well", exEn: "Plants and people thrive in light.", tr: { ru: { tr: "процветать, расцветать", ex: "Растения и люди расцветают на свету." } } },
  ],
};

const anatomy: Pack = {
  id: "anatomy",
  topic: "anatomy",
  title: "Строение организма",
  context: "Видео: как устроено тело внутри",
  words: [
    { en: "heart", ipa: "/hɑːrt/", def: "organ that pumps blood", exEn: "The heart pumps blood through the body.", tr: { ru: { tr: "сердце", ex: "Сердце качает кровь по телу." } } },
    { en: "lung", ipa: "/lʌŋ/", def: "organ used for breathing", exEn: "Each lung fills with air.", tr: { ru: { tr: "лёгкое", ex: "Каждое лёгкое наполняется воздухом." } } },
    { en: "brain", ipa: "/breɪn/", def: "organ that controls the body", exEn: "The brain processes every signal.", tr: { ru: { tr: "мозг", ex: "Мозг обрабатывает каждый сигнал." } } },
    { en: "spine", ipa: "/spaɪn/", def: "the backbone", exEn: "The spine supports the body.", tr: { ru: { tr: "позвоночник", ex: "Позвоночник держит тело." } } },
    { en: "liver", ipa: "/ˈlɪvər/", def: "organ that cleans the blood", exEn: "The liver filters toxins.", tr: { ru: { tr: "печень", ex: "Печень фильтрует токсины." } } },
    { en: "kidney", ipa: "/ˈkɪdni/", def: "organ that removes waste", exEn: "Each kidney cleans the blood.", tr: { ru: { tr: "почка", ex: "Каждая почка очищает кровь." } } },
    { en: "stomach", ipa: "/ˈstʌmək/", def: "organ that digests food", exEn: "Food breaks down in the stomach.", tr: { ru: { tr: "желудок", ex: "Еда расщепляется в желудке." } } },
    { en: "vein", ipa: "/veɪn/", def: "tube carrying blood to the heart", exEn: "Blood returns through a vein.", tr: { ru: { tr: "вена", ex: "Кровь возвращается по вене." } } },
    { en: "cell", ipa: "/sel/", def: "the smallest unit of life", exEn: "The body has trillions of cells.", tr: { ru: { tr: "клетка", ex: "В теле триллионы клеток." } } },
    { en: "tissue", ipa: "/ˈtɪʃuː/", def: "group of similar cells", exEn: "Muscle is a kind of tissue.", tr: { ru: { tr: "ткань", ex: "Мышца — это вид ткани." } } },
  ],
};

const home: Pack = {
  id: "home",
  topic: "home",
  title: "Дом и быт",
  context: "Видео: утро рабочего дня",
  words: [
    { en: "chore", ipa: "/tʃɔːr/", def: "a routine household task", exEn: "Washing up is my least favorite chore.", tr: { ru: { tr: "домашнее дело", ex: "Мытьё посуды — моё нелюбимое дело." } } },
    { en: "laundry", ipa: "/ˈlɔːndri/", def: "clothes to be washed", exEn: "I do the laundry on Sundays.", tr: { ru: { tr: "стирка, бельё", ex: "Я стираю по воскресеньям." } } },
    { en: "dishes", ipa: "/ˈdɪʃɪz/", def: "plates and cups to wash", exEn: "Please put the dishes away.", tr: { ru: { tr: "посуда", ex: "Убери, пожалуйста, посуду." } } },
    { en: "tidy", ipa: "/ˈtaɪdi/", def: "neat; to make neat", exEn: "Let's tidy the room before guests.", tr: { ru: { tr: "опрятный; прибирать", ex: "Давай приберём комнату до гостей." } } },
    { en: "leftovers", ipa: "/ˈleftoʊvərz/", def: "food kept after a meal", exEn: "We had leftovers for lunch.", tr: { ru: { tr: "остатки еды", ex: "На обед были вчерашние остатки." } } },
    { en: "bill", ipa: "/bɪl/", def: "a request for payment", exEn: "The electricity bill arrived.", tr: { ru: { tr: "счёт", ex: "Пришёл счёт за электричество." } } },
    { en: "appliance", ipa: "/əˈplaɪəns/", def: "a household machine", exEn: "The fridge is a big appliance.", tr: { ru: { tr: "бытовой прибор", ex: "Холодильник — крупный прибор." } } },
    { en: "drawer", ipa: "/drɔːr/", def: "a sliding storage box", exEn: "The forks are in the top drawer.", tr: { ru: { tr: "ящик (выдвижной)", ex: "Вилки в верхнем ящике." } } },
    { en: "rent", ipa: "/rent/", def: "money paid for housing", exEn: "We pay rent every month.", tr: { ru: { tr: "аренда, плата за жильё", ex: "Мы платим за аренду каждый месяц." } } },
    { en: "neighbor", ipa: "/ˈneɪbər/", def: "a person living nearby", exEn: "Our neighbor is very kind.", tr: { ru: { tr: "сосед", ex: "Наш сосед очень добрый." } } },
  ],
};

const design: Pack = {
  id: "design",
  topic: "design",
  title: "Дизайн-мышление",
  context: "Видео: как команды находят решения",
  words: [
    { en: "empathy", ipa: "/ˈempəθi/", def: "understanding others' feelings", exEn: "Design starts with empathy for users.", tr: { ru: { tr: "эмпатия", ex: "Дизайн начинается с эмпатии к пользователю." } } },
    { en: "insight", ipa: "/ˈɪnsaɪt/", def: "a deep useful understanding", exEn: "The interview gave us a key insight.", tr: { ru: { tr: "инсайт, прозрение", ex: "Интервью дало нам ключевой инсайт." } } },
    { en: "prototype", ipa: "/ˈproʊtətaɪp/", def: "an early test version", exEn: "We built a quick prototype.", tr: { ru: { tr: "прототип", ex: "Мы собрали быстрый прототип." } } },
    { en: "iterate", ipa: "/ˈɪtəreɪt/", def: "to improve step by step", exEn: "We iterate after each test.", tr: { ru: { tr: "итеративно улучшать", ex: "Мы дорабатываем после каждого теста." } } },
    { en: "feedback", ipa: "/ˈfiːdbæk/", def: "responses used to improve", exEn: "User feedback shapes the product.", tr: { ru: { tr: "обратная связь", ex: "Обратная связь формирует продукт." } } },
    { en: "assumption", ipa: "/əˈsʌmpʃn/", def: "something taken as true", exEn: "Test the assumption early.", tr: { ru: { tr: "допущение", ex: "Проверяй допущение пораньше." } } },
    { en: "constraint", ipa: "/kənˈstreɪnt/", def: "a limit on a solution", exEn: "Time was our main constraint.", tr: { ru: { tr: "ограничение", ex: "Время было главным ограничением." } } },
    { en: "scope", ipa: "/skoʊp/", def: "the extent of the work", exEn: "Let's keep the scope small.", tr: { ru: { tr: "объём, рамки задачи", ex: "Давай держать объём небольшим." } } },
  ],
};

const phrasal: Pack = {
  id: "phrasal",
  topic: "phrasal",
  title: "Фразовые глаголы",
  context: "Видео: живой разговор — глаголы с предлогами",
  words: [
    { en: "give up", ipa: "/ɡɪv ˈʌp/", def: "to stop trying", exEn: "Don't give up after one failure.", tr: { ru: { tr: "сдаваться, бросать", ex: "Не сдавайся после одной неудачи." } } },
    { en: "find out", ipa: "/faɪnd ˈaʊt/", def: "to discover information", exEn: "I need to find out the truth.", tr: { ru: { tr: "узнавать, выяснять", ex: "Мне нужно выяснить правду." } } },
    { en: "look for", ipa: "/ˈlʊk fɔːr/", def: "to search for something", exEn: "She is looking for her keys.", tr: { ru: { tr: "искать", ex: "Она ищет свои ключи." } } },
    { en: "pick up", ipa: "/pɪk ˈʌp/", def: "to lift or collect", exEn: "I'll pick up the kids at five.", tr: { ru: { tr: "поднимать; забирать", ex: "Я заберу детей в пять." } } },
    { en: "turn on", ipa: "/tɜːrn ˈɒn/", def: "to start a device", exEn: "Please turn on the light.", tr: { ru: { tr: "включать", ex: "Включи, пожалуйста, свет." } } },
    { en: "turn off", ipa: "/tɜːrn ˈɔːf/", def: "to stop a device", exEn: "Turn off the TV before bed.", tr: { ru: { tr: "выключать", ex: "Выключи телевизор перед сном." } } },
    { en: "put off", ipa: "/pʊt ˈɔːf/", def: "to postpone", exEn: "Don't put off the call.", tr: { ru: { tr: "откладывать", ex: "Не откладывай звонок." } } },
    { en: "get up", ipa: "/ɡet ˈʌp/", def: "to rise from bed", exEn: "I get up at seven.", tr: { ru: { tr: "вставать", ex: "Я встаю в семь." } } },
    { en: "come back", ipa: "/kʌm ˈbæk/", def: "to return", exEn: "Come back soon.", tr: { ru: { tr: "возвращаться", ex: "Возвращайся скорее." } } },
    { en: "run out", ipa: "/rʌn ˈaʊt/", def: "to have no more left", exEn: "We ran out of milk.", tr: { ru: { tr: "заканчиваться", ex: "У нас закончилось молоко." } } },
    { en: "work out", ipa: "/wɜːrk ˈaʊt/", def: "to exercise; to solve", exEn: "It will all work out.", tr: { ru: { tr: "тренироваться; решаться, складываться", ex: "Всё уладится." } } },
    { en: "calm down", ipa: "/kɑːm ˈdaʊn/", def: "to become relaxed", exEn: "Take a breath and calm down.", tr: { ru: { tr: "успокаиваться", ex: "Вдохни и успокойся." } } },
    { en: "show up", ipa: "/ʃoʊ ˈʌp/", def: "to arrive or appear", exEn: "He didn't show up to the meeting.", tr: { ru: { tr: "появляться, приходить", ex: "Он не пришёл на встречу." } } },
    { en: "give in", ipa: "/ɡɪv ˈɪn/", def: "to finally agree, to yield", exEn: "She gave in to their request.", tr: { ru: { tr: "уступать, поддаваться", ex: "Она уступила их просьбе." } } },
  ],
};

const collocations: Pack = {
  id: "collocations",
  topic: "collocations",
  title: "Устойчивые сочетания",
  context: "Видео: слова, которые ходят парами",
  words: [
    { en: "make a decision", ipa: "/meɪk ə dɪˈsɪʒn/", def: "to decide something", exEn: "We have to make a decision today.", tr: { ru: { tr: "принять решение", ex: "Нам нужно принять решение сегодня." } } },
    { en: "take a break", ipa: "/teɪk ə breɪk/", def: "to rest for a short time", exEn: "Let's take a break for coffee.", tr: { ru: { tr: "сделать перерыв", ex: "Давай сделаем перерыв на кофе." } } },
    { en: "pay attention", ipa: "/peɪ əˈtenʃn/", def: "to watch or listen carefully", exEn: "Please pay attention to the road.", tr: { ru: { tr: "обращать внимание", ex: "Пожалуйста, следи за дорогой." } } },
    { en: "make a mistake", ipa: "/meɪk ə mɪˈsteɪk/", def: "to do something wrong", exEn: "Everyone can make a mistake.", tr: { ru: { tr: "совершить ошибку", ex: "Каждый может ошибиться." } } },
    { en: "have breakfast", ipa: "/hæv ˈbrekfəst/", def: "to eat a morning meal", exEn: "I never skip breakfast.", tr: { ru: { tr: "завтракать", ex: "Я никогда не пропускаю завтрак." } } },
    { en: "take a photo", ipa: "/teɪk ə ˈfoʊtoʊ/", def: "to make a picture", exEn: "Can you take a photo of us?", tr: { ru: { tr: "сделать фото", ex: "Сфотографируешь нас?" } } },
    { en: "keep a promise", ipa: "/kiːp ə ˈprɒmɪs/", def: "to do what you said", exEn: "He always keeps a promise.", tr: { ru: { tr: "держать обещание", ex: "Он всегда держит обещание." } } },
    { en: "save time", ipa: "/seɪv taɪm/", def: "to use less time", exEn: "This app saves time.", tr: { ru: { tr: "экономить время", ex: "Это приложение экономит время." } } },
    { en: "catch a cold", ipa: "/kætʃ ə koʊld/", def: "to become ill with a cold", exEn: "Dress warmly or you'll catch a cold.", tr: { ru: { tr: "простудиться", ex: "Одевайся теплее, иначе простудишься." } } },
    { en: "do the dishes", ipa: "/duː ðə ˈdɪʃɪz/", def: "to wash the plates", exEn: "I'll do the dishes after dinner.", tr: { ru: { tr: "мыть посуду", ex: "Я помою посуду после ужина." } } },
  ],
};

const prepositions: Pack = {
  id: "prepositions",
  topic: "prepositions",
  title: "Глаголы с предлогами",
  context: "Видео: какой предлог идёт за глаголом",
  words: [
    { en: "depend on", ipa: "/dɪˈpend ɒn/", def: "to be decided by", exEn: "It depends on the weather.", tr: { ru: { tr: "зависеть от", ex: "Это зависит от погоды." } } },
    { en: "listen to", ipa: "/ˈlɪsn tuː/", def: "to pay attention with ears", exEn: "I listen to music every day.", tr: { ru: { tr: "слушать (что-то)", ex: "Я слушаю музыку каждый день." } } },
    { en: "wait for", ipa: "/weɪt fɔːr/", def: "to stay until someone comes", exEn: "I'll wait for you outside.", tr: { ru: { tr: "ждать (кого/что)", ex: "Я подожду тебя снаружи." } } },
    { en: "look at", ipa: "/lʊk æt/", def: "to direct your eyes to", exEn: "Look at this picture.", tr: { ru: { tr: "смотреть на", ex: "Посмотри на эту картинку." } } },
    { en: "belong to", ipa: "/bɪˈlɒŋ tuː/", def: "to be owned by", exEn: "This book belongs to me.", tr: { ru: { tr: "принадлежать (кому-то)", ex: "Эта книга принадлежит мне." } } },
    { en: "agree with", ipa: "/əˈɡriː wɪð/", def: "to have the same opinion", exEn: "I agree with you.", tr: { ru: { tr: "соглашаться с", ex: "Я с тобой согласна." } } },
    { en: "think about", ipa: "/θɪŋk əˈbaʊt/", def: "to consider in the mind", exEn: "Let me think about it.", tr: { ru: { tr: "думать о", ex: "Дай мне подумать об этом." } } },
    { en: "interested in", ipa: "/ˈɪntrəstɪd ɪn/", def: "wanting to know more about", exEn: "She is interested in art.", tr: { ru: { tr: "интересоваться (чем-то)", ex: "Она интересуется искусством." } } },
    { en: "afraid of", ipa: "/əˈfreɪd ɒv/", def: "feeling fear about", exEn: "He is afraid of heights.", tr: { ru: { tr: "бояться (чего-то)", ex: "Он боится высоты." } } },
    { en: "good at", ipa: "/ɡʊd æt/", def: "able to do well", exEn: "She is good at math.", tr: { ru: { tr: "хорош в (чём-то)", ex: "Она сильна в математике." } } },
  ],
};

const emotions: Pack = {
  id: "emotions",
  topic: "emotions",
  title: "Эмоции",
  context: "Видео: как называть чувства",
  words: [
    { en: "joy", ipa: "/dʒɔɪ/", def: "a feeling of great happiness", exEn: "Her face was full of joy.", tr: { ru: { tr: "радость", ex: "Её лицо светилось радостью." } } },
    { en: "anger", ipa: "/ˈæŋɡər/", def: "a strong feeling of being upset", exEn: "He spoke in anger.", tr: { ru: { tr: "гнев, злость", ex: "Он говорил в гневе." } } },
    { en: "fear", ipa: "/fɪr/", def: "the feeling of being afraid", exEn: "Fear kept her awake.", tr: { ru: { tr: "страх", ex: "Страх не давал ей уснуть." } } },
    { en: "calm", ipa: "/kɑːm/", def: "relaxed and not worried", exEn: "Stay calm and breathe.", tr: { ru: { tr: "спокойный, спокойствие", ex: "Сохраняй спокойствие и дыши." } } },
    { en: "proud", ipa: "/praʊd/", def: "pleased about an achievement", exEn: "I'm proud of you.", tr: { ru: { tr: "гордый", ex: "Я тобой горжусь." } } },
    { en: "grateful", ipa: "/ˈɡreɪtfl/", def: "feeling thankful", exEn: "I'm grateful for your help.", tr: { ru: { tr: "благодарный", ex: "Я благодарна за твою помощь." } } },
    { en: "anxious", ipa: "/ˈæŋkʃəs/", def: "worried and nervous", exEn: "She felt anxious before the exam.", tr: { ru: { tr: "тревожный", ex: "Перед экзаменом она волновалась." } } },
    { en: "relieved", ipa: "/rɪˈliːvd/", def: "glad that worry has gone", exEn: "I was relieved to hear the news.", tr: { ru: { tr: "испытавший облегчение", ex: "Я с облегчением услышала новость." } } },
  ],
};

const work: Pack = {
  id: "work",
  topic: "work",
  title: "Работа",
  context: "Видео: переписка в команде",
  words: [
    { en: "deadline", ipa: "/ˈdedlaɪn/", def: "the time a task must be done", exEn: "The deadline is on Friday.", tr: { ru: { tr: "срок, дедлайн", ex: "Срок — в пятницу." } } },
    { en: "meeting", ipa: "/ˈmiːtɪŋ/", def: "a planned gathering to talk", exEn: "The meeting starts at ten.", tr: { ru: { tr: "встреча, совещание", ex: "Совещание начинается в десять." } } },
    { en: "task", ipa: "/tæsk/", def: "a piece of work to do", exEn: "I finished the main task.", tr: { ru: { tr: "задача", ex: "Я закончила главную задачу." } } },
    { en: "report", ipa: "/rɪˈpɔːrt/", def: "a written account of work", exEn: "Send me the report by noon.", tr: { ru: { tr: "отчёт", ex: "Пришли мне отчёт к полудню." } } },
    { en: "manager", ipa: "/ˈmænɪdʒər/", def: "a person who leads a team", exEn: "Ask the manager for approval.", tr: { ru: { tr: "руководитель, менеджер", ex: "Спроси одобрение у руководителя." } } },
    { en: "deal", ipa: "/diːl/", def: "a business agreement", exEn: "We closed the deal.", tr: { ru: { tr: "сделка", ex: "Мы закрыли сделку." } } },
    { en: "schedule", ipa: "/ˈskedʒuːl/", def: "a plan of times; to plan", exEn: "Let's schedule a call.", tr: { ru: { tr: "расписание; планировать", ex: "Давай назначим звонок." } } },
    { en: "feedback", ipa: "/ˈfiːdbæk/", def: "comments used to improve", exEn: "Thanks for the quick feedback.", tr: { ru: { tr: "обратная связь", ex: "Спасибо за быструю обратную связь." } } },
  ],
};


// Ловушки перевода: chunks, где русский калькирует ошибку (интерференция L1 —
// главный источник фразеологического разрыва по GAP-отчёту). Учим целым куском:
// правильный предлог/глагол внутри, ловушка — в русском примере.
const traps: Pack = {
  id: "traps",
  topic: "collocations",
  title: "Ловушки перевода",
  context: "Там, где русский подставляет не то слово",
  words: [
    { en: "depends on the weather", ipa: "/dɪˈpendz ɒn/", def: "is decided by the weather", exEn: "Our plan depends on the weather.", tr: { ru: { tr: "зависит от погоды (не from!)", ex: "Наш план зависит от погоды." } } },
    { en: "married to a doctor", ipa: "/ˈmærid tuː/", def: "having a doctor as a spouse", exEn: "She is married to a doctor.", tr: { ru: { tr: "замужем за врачом (to, не on)", ex: "Она замужем за врачом." } } },
    { en: "listen to music", ipa: "/ˈlɪsn tuː/", def: "to hear music with attention", exEn: "I listen to music every morning.", tr: { ru: { tr: "слушать музыку (listen + to)", ex: "Я слушаю музыку каждое утро." } } },
    { en: "wait for the bus", ipa: "/weɪt fɔːr/", def: "to stay until the bus comes", exEn: "We waited for the bus for ages.", tr: { ru: { tr: "ждать автобус (wait + for)", ex: "Мы целую вечность ждали автобус." } } },
    { en: "good at English", ipa: "/ɡʊd æt/", def: "skilled in English", exEn: "You are getting good at English.", tr: { ru: { tr: "хороша в английском (at, не in)", ex: "У тебя всё лучше получается английский." } } },
    { en: "afraid of the dark", ipa: "/əˈfreɪd ɒv/", def: "feeling fear of darkness", exEn: "The kid is afraid of the dark.", tr: { ru: { tr: "бояться темноты (afraid + of)", ex: "Ребёнок боится темноты." } } },
    { en: "interested in art", ipa: "/ˈɪntrəstɪd ɪn/", def: "curious about art", exEn: "She is interested in modern art.", tr: { ru: { tr: "интересуется искусством (in)", ex: "Она интересуется современным искусством." } } },
    { en: "agree with you", ipa: "/əˈɡriː wɪð/", def: "to share your opinion", exEn: "I completely agree with you.", tr: { ru: { tr: "согласна с тобой (agree + with)", ex: "Я полностью с тобой согласна." } } },
    { en: "on Monday", ipa: "/ɒn ˈmʌndeɪ/", def: "when Monday comes", exEn: "See you on Monday.", tr: { ru: { tr: "в понедельник (on, не in!)", ex: "Увидимся в понедельник." } } },
    { en: "in the morning", ipa: "/ɪn ðə ˈmɔːrnɪŋ/", def: "during the morning", exEn: "I practice in the morning.", tr: { ru: { tr: "утром (in the morning)", ex: "Я занимаюсь утром." } } },
    { en: "at night", ipa: "/æt naɪt/", def: "during the night", exEn: "The city is quiet at night.", tr: { ru: { tr: "ночью (at night — исключение)", ex: "Ночью город тихий." } } },
    { en: "tell the truth", ipa: "/tel ðə truːθ/", def: "to say what is true", exEn: "Just tell me the truth.", tr: { ru: { tr: "сказать правду (tell, не say)", ex: "Просто скажи мне правду." } } },
    { en: "ask a question", ipa: "/ɑːsk ə ˈkwestʃən/", def: "to request an answer", exEn: "May I ask a question?", tr: { ru: { tr: "задать вопрос (ask, не set)", ex: "Можно задать вопрос?" } } },
    { en: "feel great", ipa: "/fiːl ɡreɪt/", def: "to be in a very good state", exEn: "I feel great today.", tr: { ru: { tr: "чувствовать себя отлично (без myself!)", ex: "Я сегодня отлично себя чувствую." } } },
  ],
};

export const ALL_PACKS: Pack[] = [
  health,
  phrasal,
  collocations,
  traps,
  prepositions,
  anatomy,
  home,
  design,
  emotions,
  work,
];

export const today: DayPlan = {
  goalWords: 600,
  hours: 5,
  streak: 7,
  packs: [health, phrasal, collocations, prepositions, anatomy, home, design, emotions, work],
};

export function getPack(id: string): Pack | undefined {
  return ALL_PACKS.find((p) => p.id === id);
}

export function findWord(en: string): Word | undefined {
  for (const p of ALL_PACKS) {
    const w = p.words.find((x) => x.en === en);
    if (w) return w;
  }
  return undefined;
}
