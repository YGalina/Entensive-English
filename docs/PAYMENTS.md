# Подключение платежей

Каркас готов: тарифы (`/pricing`), checkout и webhook. Включается ключами —
код менять не нужно.

## Stripe (мир) — уже поддержан кодом

1. Аккаунт на stripe.com (нужны данные ИП/самозанятости, выплаты на счёт).
2. Products → создать продукт «Интенсив» с двумя ценами (recurring):
   690 ₽/мес и 3 990 ₽/год (или $12/$89). Скопировать `price_…` идентификаторы.
3. Developers → API keys → Secret key.
4. Developers → Webhooks → Add endpoint:
   `https://<домен>/api/billing/webhook`, событие `checkout.session.completed`.
   Скопировать Signing secret (`whsec_…`).
5. Переменные окружения (Vercel → Settings → Environment Variables):

```
STRIPE_SECRET_KEY=sk_live_…
STRIPE_PRICE_MONTH=price_…
STRIPE_PRICE_YEAR=price_…
STRIPE_WEBHOOK_SECRET=whsec_…
```

После деплоя кнопки на /pricing начнут вести в Stripe Checkout; после оплаты
webhook переключает план пользователя на `pro`.

TODO (вместе с Postgres): маппинг customer→user для события
`customer.subscription.deleted` (автооткат на free при отмене).

## ЮKassa (РФ) — план

1. Аккаунт yookassa.ru (ИП/самозанятая; модерация ~1–2 дня).
2. Магазин → shopId + секретный ключ.
3. Добавить роут `/api/billing/yookassa` (создание платежа через
   `POST https://api.yookassa.ru/v3/payments`, Basic auth shopId:secret,
   `confirmation.type=redirect`) и вебхук `payment.succeeded` → `setUserPlan`.
   Схема повторяет Stripe-каркас; делается за один заход при наличии ключей.

Переменные: `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`.

## Прочее для продакшена

- `SESSION_SECRET` — длинная случайная строка (подпись сессий).
- `RESEND_API_KEY`, `MAIL_FROM` — письма волшебной ссылки (resend.com).
- Postgres (Neon в Vercel) — заменить файловое хранилище `src/lib/server/store.ts`
  перед включением аккаунтов на проде: serverless-ФС эфемерна.
