// Всплывающие мотивашки (идея Галины): при открытии панелей — короткий
// «бабл» с психологической/методической опорой. ДВА типа с разным цветом:
//   • "method" — методическая опора (что даёт практика), бирюзовый (brand);
//   • "psych"  — психологическая поддержка (состояние, барьеры), коралловый
//     (accent) — ВСЕГДА выделяется другим цветом, как просила Галина.
//
// Честность (аудит): цифры-ориентиры помечены «ориентир практики», а не
// «доказано», где наука не даёт точного числа.

export type MotivationTone = "method" | "psych";

export type Motivation = {
  id: string;
  /** где показывать: экран/панель */
  slot: "read" | "listen" | "session" | "roles" | "sounds" | "today";
  tone: MotivationTone;
  ru: string;
  en: string;
};

export const MOTIVATIONS: Motivation[] = [
  // ——— Чтение (витрина книг) ———
  {
    id: "read-50",
    slot: "read",
    tone: "method",
    ru: "Ориентир практики экстенсивного чтения: ~50 коротких книг на уровень. Наука подтверждает — обильное чтение растит узнавание слов и грамматики так, что понимаешь даже без перевода. (Точная цифра — ориентир, не гарантия.)",
    en: "An extensive-reading benchmark: ~50 short books per level. Science backs it — heavy reading grows word and grammar recognition until you understand even without translation. (The exact number is a guide, not a guarantee.)",
  },
  {
    id: "read-noticing",
    slot: "read",
    tone: "psych",
    ru: "Не гонись за «выучить всё». Твоя задача — просто встречать слова снова и снова. Мозг сам достроит смысл. Читай ради удовольствия.",
    en: "Don't chase “learn it all”. Your job is just to meet words again and again. The brain fills in meaning itself. Read for pleasure.",
  },
  // ——— Слушать ———
  {
    id: "listen-shadow",
    slot: "listen",
    tone: "method",
    ru: "Shadowing — повтор за живым голосом — тренирует ритм и интонацию (наука: Moderate для беглости и просодии). 5 минут в день ощутимо меняют звучание речи.",
    en: "Shadowing — echoing a live voice — trains rhythm and intonation (science: Moderate for fluency and prosody). Five minutes a day audibly changes how you sound.",
  },
  {
    id: "listen-safe",
    slot: "listen",
    tone: "psych",
    ru: "Никто тебя здесь не слышит и не оценивает. Повторяй вслух смело — ошибка при повторе не считается, она часть тренировки.",
    en: "No one here hears or judges you. Repeat aloud boldly — a mistake while echoing doesn't count, it's part of training.",
  },
  // ——— Сеанс (вал) ———
  {
    id: "session-mass",
    slot: "session",
    tone: "method",
    ru: "Массивный вход не нужно «учить» — он ложится в узнавание. Сознание видит поток, а мозг тихо строит карту языка. Слова всплывут в чтении и речи.",
    en: "A massive input isn't meant to be “learned” — it settles into recognition. You see the stream, the brain quietly builds a map. Words resurface in reading and speech.",
  },
  {
    id: "session-nofear",
    slot: "session",
    tone: "psych",
    ru: "Если поток кажется быстрым — так и задумано. Не напрягайся, не старайся запомнить. Твоя единственная задача — быть здесь и смотреть.",
    en: "If the stream feels fast — that's by design. Don't strain, don't try to memorize. Your only task is to be here and watch.",
  },
  // ——— Роли ———
  {
    id: "roles-mask",
    slot: "roles",
    tone: "psych",
    ru: "В роли героя говорить не страшно: ошибается Алиса, а не ты. Маска снимает зажим — и голос звучит свободнее, чем «от себя».",
    en: "In a hero's role speaking isn't scary: Alice makes the mistake, not you. The mask lifts the block — and your voice comes freer than “as yourself”.",
  },
  // ——— Звуки ———
  {
    id: "sounds-motor",
    slot: "sounds",
    tone: "method",
    ru: "Произношение ставится не отдельными звуками, а целыми фразами — лестницей темпа. Мышцы лица запоминают язык надёжнее зубрёжки.",
    en: "Pronunciation is set not by single sounds but by whole phrases — a tempo ladder. Facial muscles remember language more reliably than cramming.",
  },
];

export function motivationsFor(slot: Motivation["slot"]): Motivation[] {
  return MOTIVATIONS.filter((m) => m.slot === slot);
}

/** Детерминированный выбор мотивашки дня для слота (меняется по дням). */
export function motivationOfDay(slot: Motivation["slot"], dayEpoch: number): Motivation | null {
  const list = motivationsFor(slot);
  if (list.length === 0) return null;
  return list[dayEpoch % list.length];
}
