"use client";

import { useSyncExternalStore } from "react";
import { storage } from "./storage";
import { nowMs } from "./now";

// Срезы (Assessment, Фаза D §2.6): ежемесячный speaking-срез — 2 минуты
// речи по промпту + самооценка по рубрике. Не экзамен и не оценка со
// стороны: сравнение С СОБОЙ прошлой. Внешние человеческие срезы (MVP-A)
// лягут на эту же сущность с kind: "external".

export type SelfScores = {
  /** беглость: говорила без длинных пауз (1–5) */
  fluency: number;
  /** уверенность: без паники и извинений (1–5) */
  confidence: number;
  /** словарь: хватало слов для мысли (1–5) */
  vocabulary: number;
};

export type Assessment = {
  id: string;
  kind: "speaking-sample" | "vocab-check" | "external";
  /** локальный uri записи (приватно) */
  sampleRef?: string;
  selfScores?: SelfScores;
  /** промпт, на который отвечала */
  promptId?: string;
  at: number;
};

const KEY = "ie_assess";
const listeners = new Set<() => void>();
/** Срез «пора», если прошло больше 28 дней */
const DUE_DAYS = 28;

function read(): Assessment[] {
  try {
    const raw = JSON.parse(storage().getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Assessment[]) : [];
  } catch {
    return [];
  }
}

function write(list: Assessment[]) {
  storage().setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

export function addAssessment(input: Omit<Assessment, "id" | "at">): Assessment {
  const a: Assessment = {
    ...input,
    id: `as-${nowMs()}-${Math.random().toString(36).slice(2, 8)}`,
    at: nowMs(),
  };
  write([...read(), a]);
  return a;
}

export function listAssessments(kind?: Assessment["kind"]): Assessment[] {
  // reverse до стабильной сортировки: при равных at свежедобавленный — первым
  const all = [...read()].reverse().sort((a, b) => b.at - a.at);
  return kind ? all.filter((a) => a.kind === kind) : all;
}

/** Последний speaking-срез (для сравнения «я против себя прошлой»). */
export function lastSpeaking(): Assessment | null {
  return listAssessments("speaking-sample")[0] ?? null;
}

/** Пора ли делать срез: первый — после 7 дней практики вывода; далее раз в ~месяц. */
export function speakingDue(outputActiveDays: number, now = nowMs()): boolean {
  const last = lastSpeaking();
  if (!last) return outputActiveDays >= 7;
  return (now - last.at) / 864e5 >= DUE_DAYS;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const unExternal = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    unExternal();
  };
}

export function useAssessVersion(): string {
  return useSyncExternalStore(subscribe, () => storage().getItem(KEY) ?? "", () => "");
}

/** Промпты среза — говорить о своей жизни, не пересказывать учебник. */
export const SPEAKING_PROMPTS = [
  { id: "my-week", en: "Tell me about your week. What happened? How did you feel?", ru: "Расскажи о своей неделе. Что происходило? Как ты себя чувствовала?" },
  { id: "my-plans", en: "What are your plans for the next month? Why do they matter to you?", ru: "Какие у тебя планы на следующий месяц? Почему они важны для тебя?" },
  { id: "my-place", en: "Describe a place you love. What does it look like? Why do you go there?", ru: "Опиши место, которое любишь. Как оно выглядит? Зачем ты туда приходишь?" },
  { id: "my-change", en: "What has changed in your life recently? How do you feel about it?", ru: "Что изменилось в твоей жизни за последнее время? Как ты к этому относишься?" },
];
