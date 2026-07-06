import { getSessionUser } from "@/lib/server/auth";

// Создание Stripe Checkout-сессии (подписка «Интенсив», месяц/год).
// Включается переменными окружения:
//   STRIPE_SECRET_KEY, STRIPE_PRICE_MONTH, STRIPE_PRICE_YEAR
// Без них отвечаем 503 not-configured — UI показывает «бета бесплатна».
// РФ-контур (ЮKassa) — см. docs/PAYMENTS.md; подключается отдельным роутом.

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.STRIPE_SECRET_KEY;
  const priceMonth = process.env.STRIPE_PRICE_MONTH;
  const priceYear = process.env.STRIPE_PRICE_YEAR;
  if (!key || !priceMonth || !priceYear) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  let period: "month" | "year" = "year";
  try {
    const body = (await request.json()) as { period?: string };
    if (body.period === "month") period = "month";
  } catch {}

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": period === "month" ? priceMonth : priceYear,
    "line_items[0][quantity]": "1",
    client_reference_id: user.id,
    customer_email: user.email,
    success_url: `${origin}/profile?paid=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const json = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) {
    return Response.json(
      { error: "stripe-error", message: json.error?.message ?? "unknown" },
      { status: 502 }
    );
  }
  return Response.json({ url: json.url });
}
