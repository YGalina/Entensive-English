"use client";

import { storage } from "./storage";
import { nowMs } from "./now";

// Клиентская часть синка v2 (Фаза C): локальная очередь событий.
// Каждое доменное действие пишет событие (append-only, ключ ie_events);
// flushEvents отправляет батч на /api/sync/events и удаляет подтверждённые.
// Идемпотентность — по клиентскому id: повторная доставка безопасна.
// Очередь живёт и офлайн; отправка — когда есть сеть и аккаунт.

export type SyncEvent = {
  id: string;
  type: string; // srs-answer | time-add | artifact-created | goal-set…
  payload: Record<string, unknown>;
  clientTs: number;
};

const KEY = "ie_events";
const MAX_QUEUE = 2000; // страховка от бесконечного роста без аккаунта

function read(): SyncEvent[] {
  try {
    const raw = JSON.parse(storage().getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as SyncEvent[]) : [];
  } catch {
    return [];
  }
}

function write(q: SyncEvent[]) {
  storage().setItem(KEY, JSON.stringify(q));
}

/** Записать доменное событие в очередь синка. Дёшево, синхронно, офлайн-ок. */
export function emitEvent(type: string, payload: Record<string, unknown>): SyncEvent {
  const e: SyncEvent = {
    id: `ev-${nowMs()}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    payload,
    clientTs: nowMs(),
  };
  const q = read();
  q.push(e);
  // Переполнение: срезаем самое старое — снапшот-fallback всё равно донесёт итог.
  write(q.length > MAX_QUEUE ? q.slice(q.length - MAX_QUEUE) : q);
  return e;
}

export function pendingEvents(limit = 500): SyncEvent[] {
  return read().slice(0, limit);
}

export function queueSize(): number {
  return read().length;
}

/** Убрать подтверждённые сервером события из очереди. */
export function ackEvents(ids: string[]) {
  if (ids.length === 0) return;
  const set = new Set(ids);
  write(read().filter((e) => !set.has(e.id)));
}

export type EventSender = (events: SyncEvent[]) => Promise<{ ok: boolean }>;

/**
 * Отправить очередь батчами. sender инъецируется платформой
 * (web: fetch /api/sync/events с cookie; mobile: то же после magic-link).
 * Возвращает число отправленных. Ошибка сети — очередь не трогаем.
 */
export async function flushEvents(sender: EventSender, batch = 200): Promise<number> {
  let sent = 0;
  for (;;) {
    const chunk = pendingEvents(batch);
    if (chunk.length === 0) return sent;
    try {
      const res = await sender(chunk);
      if (!res.ok) return sent;
    } catch {
      return sent;
    }
    ackEvents(chunk.map((e) => e.id));
    sent += chunk.length;
    if (chunk.length < batch) return sent;
  }
}
