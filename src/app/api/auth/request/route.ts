import { createLoginToken } from "@/lib/server/store";
import { sendMagicLink } from "@/lib/server/mail";

// POST { email } → шлём волшебную ссылку. В dev (без ключа почты) возвращаем
// ссылку в ответе — экран логина покажет её кнопкой.
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: "bad-email" }, { status: 400 });
  }

  const token = await createLoginToken(email);
  const origin = new URL(request.url).origin;
  const link = `${origin}/api/auth/verify?token=${token}`;
  const result = await sendMagicLink(email, link);

  if (result.sent) return Response.json({ ok: true, sent: true });
  return Response.json({ ok: true, sent: false, devLink: result.devLink });
}
