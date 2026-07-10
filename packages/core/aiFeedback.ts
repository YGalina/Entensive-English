// Клиент AI-фидбэка тренера (Фаза D). Общий для web и mobile: даёт запрос к
// /api/feedback и честное состояние. Web зовёт относительный путь (cookie-
// сессия есть); mobile передаёт baseURL (EXPO_PUBLIC_API_URL) — и заработает,
// когда появится вход по magic-link. Локальные эвристики (feedback.ts) —
// офлайн-минимум, этот слой добавляет LLM-разбор сверху по согласию.

export type AiHint = { title: string; hint: string };

export type AiFeedbackResult =
  | { state: "ok"; hints: AiHint[]; praise: string }
  | { state: "no-config" } // нет baseURL / логина на этой платформе
  | { state: "no-consent" } // согласие llm-feedback не дано
  | { state: "not-configured" } // сервер без ключа ANTHROPIC_API_KEY
  | { state: "error" };

/**
 * Запросить AI-разбор текста. baseURL: "" на web (относительный путь),
 * абсолютный на mobile. Если baseURL null — платформа ещё без сервера/логина.
 */
export async function requestAiFeedback(
  text: string,
  opts: { baseURL: string | null; artifactId?: string; headers?: Record<string, string> }
): Promise<AiFeedbackResult> {
  if (opts.baseURL === null) return { state: "no-config" };
  const trimmed = text.trim();
  if (!trimmed) return { state: "error" };
  try {
    const res = await fetch(`${opts.baseURL}/api/feedback`, {
      method: "POST",
      // Web — cookie-сессия (credentials); mobile — Authorization: Bearer.
      headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
      credentials: "include",
      body: JSON.stringify({ text: trimmed, artifactId: opts.artifactId }),
    });
    if (res.status === 403) return { state: "no-consent" };
    if (res.status === 501) return { state: "not-configured" };
    if (res.status === 401) return { state: "no-config" };
    if (!res.ok) return { state: "error" };
    const j = (await res.json()) as { hints?: AiHint[]; praise?: string };
    return { state: "ok", hints: (j.hints ?? []).slice(0, 2), praise: j.praise ?? "" };
  } catch {
    return { state: "error" };
  }
}
