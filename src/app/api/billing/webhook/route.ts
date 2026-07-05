import crypto from "crypto";
import { setUserPlan } from "@/lib/server/store";

// Stripe webhook: включает Pro после успешной оплаты.
// Подпись проверяем вручную по спецификации Stripe (header Stripe-Signature:
// t=…,v1=…; signed_payload = `${t}.${rawBody}` HMAC-SHA256 секретом вебхука).
// Настройка: STRIPE_WEBHOOK_SECRET + endpoint https://<домен>/api/billing/webhook
// на событии checkout.session.completed.

function verifySignature(rawBody: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string])
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  // Допуск 5 минут против replay-атак
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "not-configured" }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  if (!verifySignature(rawBody, signature, secret)) {
    return Response.json({ error: "bad-signature" }, { status: 400 });
  }

  let event: {
    type?: string;
    data?: { object?: { client_reference_id?: string } };
  } = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "bad-json" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const userId = event.data?.object?.client_reference_id;
    if (userId) await setUserPlan(userId, "pro");
  }
  // TODO: customer.subscription.deleted → откат на free (нужен маппинг
  // customer→user; добавим вместе с Postgres-хранилищем).

  return Response.json({ received: true });
}
