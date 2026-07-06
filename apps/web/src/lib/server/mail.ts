// Доставка волшебной ссылки. Если задан RESEND_API_KEY — шлём настоящее письмо
// (resend.com, бесплатного лимита хватает бете). Без ключа — dev-режим: ссылку
// возвращаем вызывающему, и экран логина показывает её прямо на странице.

export type MailResult = { sent: true } | { sent: false; devLink: string };

export async function sendMagicLink(email: string, link: string): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, devLink: link };

  const from = process.env.MAIL_FROM ?? "Intensive English <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Вход в Intensive English",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
          <h2 style="color:#1b3a6b">Intensive English</h2>
          <p>Нажми кнопку, чтобы войти. Ссылка действует 15 минут.</p>
          <a href="${link}" style="display:inline-block;background:#d62839;color:#fff;
             padding:14px 28px;border-radius:14px;text-decoration:none;font-weight:bold">
            Войти
          </a>
          <p style="color:#5c6b84;font-size:12px;margin-top:24px">
            Если ты не запрашивала вход — просто игнорируй это письмо.
          </p>
        </div>`,
    }),
  });
  if (!res.ok) {
    // Провайдер отказал — не роняем вход: отдаём dev-ссылку, UI подскажет.
    return { sent: false, devLink: link };
  }
  return { sent: true };
}
