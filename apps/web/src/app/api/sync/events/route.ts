import { getSessionUser } from "@/lib/server/auth";
import { db, schema } from "@/lib/server/db";
import { applyEvent } from "@/lib/server/db/apply";
import { eq, gt, and, asc } from "drizzle-orm";

// Синк v2 (Фаза C): журнал событий вместо затирающего снапшота.
// POST — батч событий с клиентскими id (идемпотентно: повторная доставка
// не дублирует); GET ?since=ISO — события для догрузки на другом устройстве.
// Старый снапшот-роут /api/sync остаётся fallback'ом до миграции клиентов.

type ClientEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  clientTs: number; // ms
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  let events: ClientEvent[] = [];
  try {
    const body = (await request.json()) as { events?: ClientEvent[] };
    events = Array.isArray(body.events) ? body.events : [];
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  if (events.length === 0) return Response.json({ accepted: 0 });
  if (events.length > 500) return Response.json({ error: "batch too large" }, { status: 413 });

  const d = await db();
  // Пользователь мог появиться через файловый store — заводим строку в БД.
  await d
    .insert(schema.users)
    .values({ id: user.id, email: user.email, plan: user.plan })
    .onConflictDoNothing();

  let accepted = 0;
  for (const e of events) {
    if (!e?.id || !e?.type || typeof e.clientTs !== "number") continue;
    const res = await d
      .insert(schema.syncEvents)
      .values({
        id: String(e.id).slice(0, 128),
        userId: user.id,
        type: String(e.type).slice(0, 64),
        payload: e.payload ?? {},
        clientTs: new Date(e.clientTs),
      })
      .onConflictDoNothing()
      .returning({ id: schema.syncEvents.id });
    accepted += res.length;
    // Применяем в доменные таблицы ТОЛЬКО свежепринятые (идемпотентность):
    // повторная доставка того же id не инкрементит время второй раз.
    if (res.length > 0) {
      await applyEvent({
        userId: user.id,
        type: String(e.type),
        payload: e.payload ?? {},
        clientTs: new Date(e.clientTs),
      });
    }
  }
  return Response.json({ accepted });
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const since = new URL(request.url).searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(0);
  if (Number.isNaN(sinceDate.getTime())) {
    return Response.json({ error: "bad since" }, { status: 400 });
  }

  const d = await db();
  const rows = await d
    .select()
    .from(schema.syncEvents)
    .where(and(eq(schema.syncEvents.userId, user.id), gt(schema.syncEvents.receivedAt, sinceDate)))
    .orderBy(asc(schema.syncEvents.receivedAt))
    .limit(1000);

  return Response.json({
    events: rows.map((r) => ({
      id: r.id,
      type: r.type,
      payload: r.payload,
      clientTs: r.clientTs.getTime(),
      receivedAt: r.receivedAt.toISOString(),
    })),
    cursor: rows.length ? rows[rows.length - 1].receivedAt.toISOString() : since ?? null,
  });
}
