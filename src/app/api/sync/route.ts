import { getSessionUser } from "@/lib/server/auth";
import { getSnapshot, saveSnapshot } from "@/lib/server/store";

// Облачный синк прогресса: снапшот локального состояния (prefs/srs/time/wpm)
// целиком. v1 — last write wins; конфликтов не решаем, честно и просто.

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const snap = await getSnapshot(user.id);
  return Response.json({ data: snap?.data ?? null, updatedAt: snap?.updatedAt ?? null });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  let data: Record<string, unknown> = {};
  try {
    const body = (await request.json()) as { data?: Record<string, unknown> };
    data = body.data ?? {};
  } catch {
    return Response.json({ error: "bad-json" }, { status: 400 });
  }
  // Простая защита от мусора: только наши ключи, разумный размер.
  const clean: Record<string, unknown> = {};
  for (const k of ["ie_prefs", "ie_srs", "ie_time", "ie_wpm"]) {
    if (k in data) clean[k] = data[k];
  }
  if (JSON.stringify(clean).length > 2_000_000) {
    return Response.json({ error: "too-large" }, { status: 413 });
  }
  await saveSnapshot(user.id, clean);
  return Response.json({ ok: true, updatedAt: new Date().toISOString() });
}
