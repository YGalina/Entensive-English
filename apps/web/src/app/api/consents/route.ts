import { getSessionUser } from "@/lib/server/auth";
import { db, schema } from "@/lib/server/db";
import { eq } from "drizzle-orm";

// Согласия на обработку (Фаза C, приватность): тексты дневника, аудио,
// LLM-фидбэк. Без записи granted=true соответствующий канал не работает.
// Отзыв согласия — тоже событие с датой (152-ФЗ-контур: докажем, когда
// и что было разрешено).

const KINDS = ["sync-texts", "sync-audio", "llm-feedback"] as const;
type Kind = (typeof KINDS)[number];

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const d = await db();
  const rows = await d.select().from(schema.consents).where(eq(schema.consents.userId, user.id));
  const consents: Record<string, boolean> = {};
  for (const k of KINDS) consents[k] = rows.find((r) => r.kind === k)?.granted ?? false;
  return Response.json({ consents });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  let kind: Kind | undefined;
  let granted = false;
  try {
    const body = (await request.json()) as { kind?: Kind; granted?: boolean };
    kind = body.kind;
    granted = !!body.granted;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  if (!kind || !KINDS.includes(kind)) {
    return Response.json({ error: "bad kind" }, { status: 400 });
  }
  const d = await db();
  await d
    .insert(schema.users)
    .values({ id: user.id, email: user.email, plan: user.plan })
    .onConflictDoNothing();
  await d
    .insert(schema.consents)
    .values({ userId: user.id, kind, granted, at: new Date() })
    .onConflictDoUpdate({
      target: [schema.consents.userId, schema.consents.kind],
      set: { granted, at: new Date() },
    });
  return Response.json({ ok: true });
}
