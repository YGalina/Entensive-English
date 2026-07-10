# 12. Runbook деплоя: web + Postgres + вход по волшебной ссылке на mobile

Статус: код готов и проверен локально (unit 66, web build, e2e 8/8, expo export,
живой прогон Bearer-контура). **Сам деплой не выполнен** — он требует аккаунтов
Галины (хостинг, БД, почта) и это внешнее действие. Ниже — точные шаги.

## Что уже сделано в коде

- **Mobile вход по волшебной ссылке.** Экран профиля: email → «Прислать ссылку».
  Ссылка из письма открывает `intensiveenglish://auth?session=…` (deep-link),
  приложение сохраняет самоподписанный токен сессии и шлёт его как
  `Authorization: Bearer` во все запросы синка/AI-разбора.
- **Сервер принимает Bearer.** `getSessionUser()` читает и куку (web), и
  `Authorization: Bearer` (mobile) — токен один и тот же, серверной таблицы
  сессий нет, проверка по HMAC-подписи (`SESSION_SECRET`).
- **Синк работает по Bearer:** снапшот (`/api/sync`) и журнал событий
  (`/api/sync/events`, идемпотентно по client-id). Проверено живым прогоном.
- **Postgres-готовность.** `db()` переключается на настоящий Postgres, если задан
  `DATABASE_URL` (иначе dev-PGlite). Схема и запросы те же.

## Переменные окружения (apps/web, продакшн)

| Переменная | Зачем | Пример |
|---|---|---|
| `SESSION_SECRET` | подпись сессий (обязательно на проде!) | длинная случайная строка |
| `DATABASE_URL` | Postgres (Neon/Supabase) | `postgres://user:pass@host/db?sslmode=require` |
| `RESEND_API_KEY` | отправка писем с ссылкой (без него — dev-режим отдаёт ссылку в ответе) | `re_…` |
| `MAIL_FROM` | адрес отправителя | `Intensive English <hi@твойдомен>` |

Для mobile (сборка Expo) — `EXPO_PUBLIC_API_URL` = адрес развёрнутого web,
например `https://intensive-english.vercel.app`. Без него приложение честно
показывает «сервер синка не задан» и работает офлайн.

## Шаги деплоя

1. **База.** Завести Postgres (Neon бесплатный тариф хватает бете). Скопировать
   connection string в `DATABASE_URL`.
2. **Драйвер.** В `apps/web` установить драйвер: `npm i pg` (в dev не нужен —
   PGlite; на проде обязателен). Схема создаётся автоматически при первом
   обращении (bootstrap-DDL в `db/index.ts`); позже заменим на drizzle-kit
   миграции.
3. **Почта.** Зарегистрировать домен в Resend, получить `RESEND_API_KEY`,
   задать `MAIL_FROM`. Без ключа вход всё равно работает (ссылка возвращается
   в ответе) — но письма не уходят.
4. **Секрет.** Сгенерировать `SESSION_SECRET` (`openssl rand -base64 48`) и
   задать в переменных окружения хостинга.
5. **Web-хостинг.** Задеплоить `apps/web` (Vercel: монорепо, root = `apps/web`,
   build = `next build`). Прописать все env выше.
6. **Mobile.** В сборку задать `EXPO_PUBLIC_API_URL` = URL из шага 5. Пересобрать
   (`eas build` или dev-client). Deep-link `intensiveenglish://` уже в
   `app.json` (`scheme`).

## Важно: PGlite — только dev

Встроенный PGlite грузит WASM и **не работает в production-сборке**
(`next start`: `instantiateWasm is not a function`). Это ожидаемо — на проде
всегда `DATABASE_URL` (настоящий Postgres). В `next dev` (локальная разработка
Галины) PGlite работает — журнал событий проверен там: accepted:1, повторная
доставка accepted:0, GET возвращает событие.

## Проверка после деплоя (smoke)

```
# 1) запросить ссылку в app-режиме
curl -X POST $URL/api/auth/request -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","mode":"app"}'
# 2) открыть devLink (или ссылку из письма) → редирект на
#    intensiveenglish://auth?session=<TOKEN>
# 3) проверить токен:
curl $URL/api/auth/me -H "Authorization: Bearer <TOKEN>"   # → {"user":{…}}
```

## 152-ФЗ (юр-контур РФ)

Хранение перс. данных граждан РФ — на серверах в РФ. Для беты вне РФ это
допустимо, но перед публичным запуском в РФ: Postgres в РФ-регионе (Yandex
Cloud / SberCloud), уведомление РКН, политика конфиденциальности и явные
согласия (`/api/consents` уже есть). Вынесено в отдельную задачу.
