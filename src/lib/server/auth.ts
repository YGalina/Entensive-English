import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById, type User } from "./store";

// Сессии: подписанная HMAC-кука ie_session = userId.expires.signature.
// Секрет — env SESSION_SECRET (в dev есть фолбэк; на проде задать обязательно).

const COOKIE = "ie_session";
const MAX_AGE_S = 90 * 24 * 3600; // 90 дней

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function setSession(userId: string) {
  const expires = Date.now() + MAX_AGE_S * 1000;
  const payload = `${userId}.${expires}`;
  const value = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
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
  return getUserById(userId);
}
