"use client";

// Клиент облачного синка: собрать локальный прогресс → отправить; забрать →
// разложить по localStorage. Ключи — весь учебный прогресс приложения.

const KEYS = ["ie_prefs", "ie_srs", "ie_time", "ie_wpm"] as const;

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

export async function pushToCloud(): Promise<boolean> {
  try {
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
