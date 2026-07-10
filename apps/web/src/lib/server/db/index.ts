import path from "path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

// Подключение БД (Фаза C). DEV — PGlite: встраиваемый Postgres в файле
// .data/pg, ноль внешней инфраструктуры (Docker не нужен). PROD (Vercel) —
// заменить на drizzle-orm/node-postgres + DATABASE_URL (Neon): схема и
// запросы не меняются. Файловый store.json остаётся для auth-токенов и
// снапшота-fallback до полного переезда.

const DATA_DIR = process.env.PG_DATA_DIR ?? path.join(process.cwd(), ".data", "pg");

// Bootstrap-DDL: idempotent, выполняется при первом обращении. Когда включим
// drizzle-kit миграции (перед продом) — этот блок заменится ими.
const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS goals (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  life_goal TEXT NOT NULL,
  domain TEXT NOT NULL,
  current_level TEXT NOT NULL,
  target_level TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  weekly_minutes INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS srs_cards (
  user_id TEXT NOT NULL REFERENCES users(id),
  en TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'recognize',
  pack_id TEXT NOT NULL,
  fsrs JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, en, direction)
);
CREATE TABLE IF NOT EXISTS time_entries (
  user_id TEXT NOT NULL REFERENCES users(id),
  day TEXT NOT NULL,
  activity TEXT NOT NULL,
  seconds INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, activity)
);
CREATE TABLE IF NOT EXISTS output_artifacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  prompt_id TEXT,
  text TEXT,
  audio_url TEXT,
  words JSONB NOT NULL DEFAULT '[]',
  privacy TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES output_artifacts(id),
  kind TEXT NOT NULL DEFAULT 'prompt',
  hints JSONB NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS capabilities (
  user_id TEXT NOT NULL REFERENCES users(id),
  capability_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, capability_id)
);
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,
  level TEXT,
  sample_url TEXT,
  meta JSONB,
  at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS consents (
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind)
);
CREATE TABLE IF NOT EXISTS sync_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  client_ts TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

// PGlite — один инстанс на процесс. globalThis-кэш переживает пересборку
// route-бандлов в dev (та же причина, что честное чтение в store.ts).
type Drizzle = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { __ieDb?: Drizzle; __iePg?: PGlite };

async function init() {
  if (g.__ieDb) return g.__ieDb;

  // PROD: настоящий Postgres (Neon/Supabase) по DATABASE_URL. Требует `npm i pg`
  // в apps/web. Схема и запросы те же — меняется лишь драйвер. Динамический
  // импорт по переменной-спецификатору: без DATABASE_URL модуль pg не грузится,
  // и web-сборка зелёная даже когда пакет не установлен (dev/CI).
  const url = process.env.DATABASE_URL;
  if (url) {
    // turbopackIgnore: не трассировать эти модули при сборке — pg ставится
    // только на проде (см. 12_deploy_runbook.md). pgSpec — переменная, чтобы и
    // tsc не искал типы pg в dev. node-postgres тянет pg транзитивно, потому
    // тоже под ignore.
    const pgSpec = "pg";
    const pg = (await import(/* turbopackIgnore: true */ pgSpec)) as { Pool: new (o: unknown) => { query: (q: string) => Promise<unknown> } };
    const { drizzle: pgDrizzle } = await import(/* turbopackIgnore: true */ "drizzle-orm/node-postgres");
    const needsSsl = /sslmode=require|neon\.tech|supabase\./.test(url);
    const pool = new pg.Pool({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });
    await pool.query(DDL);
    g.__ieDb = pgDrizzle(pool as never, { schema }) as unknown as Drizzle;
    return g.__ieDb;
  }

  // DEV: встроенный PGlite, ноль внешней инфраструктуры.
  if (!g.__iePg) {
    g.__iePg = new PGlite(DATA_DIR);
    await g.__iePg.exec(DDL);
    g.__ieDb = drizzle(g.__iePg, { schema });
  }
  return g.__ieDb!;
}

export async function db() {
  return init();
}

export { schema };
