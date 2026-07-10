import { createLoginToken } from "@/lib/server/store";
import { sendMagicLink } from "@/lib/server/mail";

// POST { email, mode? } → шлём волшебную ссылку. mode="app" (из мобильного
// приложения) заставит verify редиректить в deep-link, а не ставить куку.
// В dev (без ключа почты) возвращаем ссылку в ответе — экран покажет её кнопкой.
export async function POST(request: Request) {
  let email = "";
  let mode: "web" | "app" = "web";
  try {
    const body = (await request.json()) as { email?: string; mode?: string };
    email = String(body.email ?? "").trim().toLowerCase();
    if (body.mode === "app") mode = "app";
  } catch {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: "bad-email" }, { status: 400 });
  }

  const token = await createLoginToken(email, mode);
  const origin = new URL(request.url).origin;
  const link = `${origin}/api/auth/verify?token=${token}`;
  const result = await sendMagicLink(email, link);

  if (result.sent) return Response.json({ ok: true, sent: true });
  return Response.json({ ok: true, sent: false, devLink: result.devLink });
}
