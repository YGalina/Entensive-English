import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { getUserById, type User } from "./store";

// Сессии: подписанная HMAC-строка userId.expires.signature. Она самодостаточна
// (серверной таблицы сессий нет), поэтому один и тот же токен работает двумя
// путями:
//   • web    — в httpOnly-куке ie_session;
//   • mobile — приложение хранит ту же строку и шлёт как Authorization: Bearer.
// Секрет — env SESSION_SECRET (в dev есть фолбэк; на проде задать обязательно).

const COOKIE = "ie_session";
const MAX_AGE_S = 90 * 24 * 3600; // 90 дней

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Собрать самоподписанный токен сессии (общий для куки и Bearer). */
function makeSessionValue(userId: string): string {
  const expires = Date.now() + MAX_AGE_S * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

/** Проверить токен и вернуть userId (или null при подделке/протухании). */
function verifyToken(raw: string): string | null {
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, signature] = parts;
  const payload = `${userId}.${expires}`;
  // timingSafeEqual против подделки подписи
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;
  return userId;
}

export async function setSession(userId: string) {
  const value = makeSessionValue(userId);
  const store = await cookies();
  store.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

/**
 * Мобильный вход: тот же самоподписанный токен, но не в куке — приложение
 * получает его через deep-link и хранит у себя, отправляя как Bearer.
 */
export function issueSessionToken(userId: string): string {
  return makeSessionValue(userId);
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  // 1) Bearer-заголовок — мобильный клиент.
  try {
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const userId = verifyToken(auth.slice(7).trim());
      if (userId) return getUserById(userId);
    }
  } catch {}
  // 2) Кука — web.
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const userId = verifyToken(raw);
  if (!userId) return null;
  return getUserById(userId);
}
