import { flushEvents, queueSize, type SyncEvent } from "@ie/core/events";
import { storage } from "@ie/core/storage";
import { authHeader, getSessionToken } from "./session";

// Мобильный облачный клиент: тот же контур, что и web/cloud.ts, но
//   • базовый URL — из EXPO_PUBLIC_API_URL (на телефоне относительный fetch
//     некуда слать), поэтому без него синк честно недоступен;
//   • авторизация — Authorization: Bearer вместо httpOnly-куки;
//   • сбор/раскладка прогресса — через адаптер хранилища (kv-store), не
//     localStorage.
// Ключи — весь учебный прогресс приложения, как на web.

const BASE = process.env.EXPO_PUBLIC_API_URL ?? null;

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

/** Задан ли сервер синка. Без него UI показывает честное «пока недоступно». */
export function apiConfigured(): boolean {
  return !!BASE;
}

function api(path: string): string {
  return `${BASE}${path}`;
}

/** Кто вошёл (по Bearer-токену). null — не задан сервер, нет токена или сбой. */
export async function fetchMe(): Promise<MeUser> {
  if (!BASE || !getSessionToken()) return null;
  try {
    const res = await fetch(api("/api/auth/me"), { headers: { ...authHeader() } });
    const json = (await res.json()) as { user: MeUser };
    return json.user ?? null;
  } catch {
    return null;
  }
}

export type LinkResult = { ok: boolean; sent?: boolean; devLink?: string };

/** Запросить волшебную ссылку для входа в приложение (mode=app). */
export async function requestMagicLink(email: string): Promise<LinkResult> {
  if (!BASE) return { ok: false };
  try {
    const res = await fetch(api("/api/auth/request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode: "app" }),
    });
    if (!res.ok) return { ok: false };
    const json = (await res.json()) as { sent?: boolean; devLink?: string };
    return { ok: true, sent: json.sent, devLink: json.devLink };
  } catch {
    return { ok: false };
  }
}

function collect(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of KEYS) {
    try {
      const raw = storage().getItem(k);
      if (raw) out[k] = JSON.parse(raw);
    } catch {}
  }
  return out;
}

/** Локальная очередь событий синка — сколько ждёт отправки. */
export function pendingCount(): number {
  return queueSize();
}

/** Отправить локальную очередь событий (синк v2) — идемпотентно, батчами. */
export async function flushEventQueue(): Promise<number> {
  if (!BASE || !getSessionToken()) return 0;
  return flushEvents(async (events: SyncEvent[]) => {
    const res = await fetch(api("/api/sync/events"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ events }),
    });
    return { ok: res.ok };
  });
}

/** Выгрузить прогресс в облако: сначала журнал событий, затем снапшот-fallback. */
export async function pushToCloud(): Promise<boolean> {
  if (!BASE || !getSessionToken()) return false;
  try {
    await flushEventQueue();
    const res = await fetch(api("/api/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ data: collect() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Забрать снапшот из облака и разложить по хранилищу. true — что-то применили.
 * Экраны подхватят новые данные при следующем открытии (модули читают адаптер
 * заново) — как и в web-версии.
 */
export async function pullFromCloud(): Promise<boolean> {
  if (!BASE || !getSessionToken()) return false;
  try {
    const res = await fetch(api("/api/sync"), { headers: { ...authHeader() } });
    if (!res.ok) return false;
    const json = (await res.json()) as { data: Record<string, unknown> | null };
    if (!json.data) return false;
    for (const k of KEYS) {
      if (k in json.data) {
        try {
          storage().setItem(k, JSON.stringify(json.data[k]));
        } catch {}
      }
    }
    return true;
  } catch {
    return false;
  }
}
