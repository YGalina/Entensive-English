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

let cache: Db | null = null;

async function load(): Promise<Db> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    cache = { users: [], tokens: [], snapshots: [] };
  }
  return cache;
}

async function persist(db: Db) {
  cache = db;
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

const TOKEN_TTL_MS = 15 * 60 * 1000;

export async function createLoginToken(email: string): Promise<string> {
  const db = await load();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  // Чистим протухшие, кладём новый
  db.tokens = db.tokens.filter((t) => t.expiresAt > now);
  db.tokens.push({ token, email: email.trim().toLowerCase(), expiresAt: now + TOKEN_TTL_MS });
  await persist(db);
  return token;
}

/** Одноразовое подтверждение токена: возвращает email и сжигает токен. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const db = await load();
  const now = Date.now();
  const hit = db.tokens.find((t) => t.token === token && t.expiresAt > now);
  db.tokens = db.tokens.filter((t) => t !== hit && t.expiresAt > now);
  await persist(db);
  return hit?.email ?? null;
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
