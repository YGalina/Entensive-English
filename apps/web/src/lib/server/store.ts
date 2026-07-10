import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// Хранилище аккаунтов/токенов/снапшотов прогресса.
// DEV: файловая база (.data/store.json) — весь флоу работает локально без облака.
// PROD: перед включением аккаунтов на Vercel подключить Postgres (Neon) и
// заменить драйвер — схема готова в db/schema.sql. Файловое хранилище на
// serverless-инстансах эфемерно и для продакшена НЕ годится.

export type User = {
  id: string;
  email: string;
  plan: "free" | "pro";
  createdAt: string;
};

export type LoginToken = {
  token: string;
  email: string;
  expiresAt: number;
  /** "web" — ставим куку и ведём в /profile; "app" — deep-link в приложение. */
  mode: "web" | "app";
};

export type Snapshot = {
  userId: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

type Db = {
  users: User[];
  tokens: LoginToken[];
  snapshots: Snapshot[];
};

const FILE = process.env.AUTH_STORE_FILE ?? path.join(process.cwd(), ".data", "store.json");

// Без in-memory кэша: в dev каждый route-бандл получает СВОЮ копию модуля,
// и кэш одного роута не видит записей другого (me не видел юзера из verify).
// Файл крошечный — честное чтение на каждый запрос надёжнее.
async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    return { users: [], tokens: [], snapshots: [] };
  }
}

async function persist(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 1), "utf8");
}

export async function getOrCreateUser(email: string): Promise<User> {
  const db = await load();
  const norm = email.trim().toLowerCase();
  let user = db.users.find((u) => u.email === norm);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email: norm,
      plan: "free",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    await persist(db);
  }
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await load();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function setUserPlan(userId: string, plan: User["plan"]) {
  const db = await load();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.plan = plan;
    await persist(db);
  }
}

const TOKEN_TTL_MS = 15 * 60 * 1000;

export async function createLoginToken(email: string, mode: LoginToken["mode"] = "web"): Promise<string> {
  const db = await load();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  // Чистим протухшие, кладём новый
  db.tokens = db.tokens.filter((t) => t.expiresAt > now);
  db.tokens.push({ token, email: email.trim().toLowerCase(), expiresAt: now + TOKEN_TTL_MS, mode });
  await persist(db);
  return token;
}

/** Одноразовое подтверждение токена: возвращает email+режим и сжигает токен. */
export async function consumeLoginToken(
  token: string
): Promise<{ email: string; mode: LoginToken["mode"] } | null> {
  const db = await load();
  const now = Date.now();
  const hit = db.tokens.find((t) => t.token === token && t.expiresAt > now);
  db.tokens = db.tokens.filter((t) => t !== hit && t.expiresAt > now);
  await persist(db);
  // mode может отсутствовать у токенов, выписанных до этого изменения → "web".
  return hit ? { email: hit.email, mode: hit.mode ?? "web" } : null;
}

export async function saveSnapshot(userId: string, data: Record<string, unknown>) {
  const db = await load();
  const existing = db.snapshots.find((s) => s.userId === userId);
  const updatedAt = new Date().toISOString();
  if (existing) {
    existing.data = data;
    existing.updatedAt = updatedAt;
  } else {
    db.snapshots.push({ userId, data, updatedAt });
  }
  await persist(db);
}

export async function getSnapshot(userId: string): Promise<Snapshot | null> {
  const db = await load();
  return db.snapshots.find((s) => s.userId === userId) ?? null;
}
