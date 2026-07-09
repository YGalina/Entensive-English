"use client";

import { flushEvents, type SyncEvent } from "@ie/core/events";

// Клиент облачного синка: собрать локальный прогресс → отправить; забрать →
// разложить по localStorage. Ключи — весь учебный прогресс приложения.
// Пуш инициируется кнопкой в профиле — явное действие пользователя, поэтому
// снапшот несёт и тексты вывода (дневник); фоновый журнал событий текстов
// не содержит (приватность, см. @ie/core/events).

const KEYS = [
  "ie_prefs",
  "ie_srs",
  "ie_time",
  "ie_wpm",
  "ie_output",
  "ie_goal",
  "ie_guardians",
] as const;

export type MeUser = { email: string; plan: "free" | "pro" } | null;

export async function fetchMe(): Promise<MeUser> {
  try {
    const res = await fetch("/api/auth/me");
    const json = (await res.json()) as { user: MeUser };
    return json.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {}
}

function collect(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) out[k] = JSON.parse(raw);
    } catch {}
  }
  return out;
}

/** Отправить локальную очередь событий (синк v2) — идемпотентно, батчами. */
export async function flushEventQueue(): Promise<number> {
  return flushEvents(async (events: SyncEvent[]) => {
    const res = await fetch("/api/sync/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });
    return { ok: res.ok };
  });
}

export async function pushToCloud(): Promise<boolean> {
  try {
    // Сначала журнал (точные доменные события), затем снапшот-fallback.
    await flushEventQueue();
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: collect() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Забрать снапшот из облака и применить локально. true — что-то применили. */
export async function pullFromCloud(): Promise<boolean> {
  try {
    const res = await fetch("/api/sync");
    if (!res.ok) return false;
    const json = (await res.json()) as { data: Record<string, unknown> | null };
    if (!json.data) return false;
    for (const k of KEYS) {
      if (k in json.data) {
        try {
          localStorage.setItem(k, JSON.stringify(json.data[k]));
        } catch {}
      }
    }
    return true;
  } catch {
    return false;
  }
}
