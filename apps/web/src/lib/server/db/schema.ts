import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Серверная память (Фаза C, 09_architecture_plan.md §4.1): queryable-схема
// вместо snapshot-only. Снапшот остаётся fallback'ом миграции; журнал
// событий (sync_events) — путь к синку v2 без last-write-wins.
// DEV — PGlite (встраиваемый Postgres, файл .data/pg); PROD — Neon/Postgres,
// тот же Drizzle-код.

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  userId: text("user_id").primaryKey().references(() => users.id),
  lifeGoal: text("life_goal").notNull(),
  domain: text("domain").notNull(),
  currentLevel: text("current_level").notNull(),
  targetLevel: text("target_level").notNull(),
  deadline: timestamp("deadline", { withTimezone: true }),
  weeklyMinutes: integer("weekly_minutes").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const srsCards = pgTable(
  "srs_cards",
  {
    userId: text("user_id").notNull().references(() => users.id),
    en: text("en").notNull(),
    direction: text("direction", { enum: ["recognize", "produce"] }).notNull().default("recognize"),
    packId: text("pack_id").notNull(),
    fsrs: jsonb("fsrs").notNull(), // stability/difficulty/due/reps… как есть
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.en, t.direction] })]
);

export const timeEntries = pgTable(
  "time_entries",
  {
    userId: text("user_id").notNull().references(() => users.id),
    day: text("day").notNull(), // YYYY-MM-DD
    activity: text("activity").notNull(),
    seconds: integer("seconds").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day, t.activity] })]
);

export const outputArtifacts = pgTable("output_artifacts", {
  id: text("id").primaryKey(), // клиентский id — идемпотентность синка
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // morning-phrase|status|essay|explanation|role|review|speech
  promptId: text("prompt_id"),
  text: text("text"),
  audioUrl: text("audio_url"), // object storage; загрузка только по согласию
  words: jsonb("words").notNull().default([]),
  privacy: text("privacy", { enum: ["private", "syncable"] }).notNull().default("private"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  artifactId: text("artifact_id").notNull().references(() => outputArtifacts.id),
  kind: text("kind").notNull().default("prompt"),
  hints: jsonb("hints").notNull(), // [{id, sample}]
  source: text("source", { enum: ["rules", "llm"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const capabilities = pgTable(
  "capabilities",
  {
    userId: text("user_id").notNull().references(() => users.id),
    capabilityId: text("capability_id").notNull(), // canIntroduceMyself…
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.capabilityId] })]
);

export const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  kind: text("kind", { enum: ["vocab-check", "speaking-sample", "external"] }).notNull(),
  level: text("level"),
  sampleUrl: text("sample_url"),
  meta: jsonb("meta"),
  at: timestamp("at", { withTimezone: true }).notNull(),
});

// Согласия — приватность голоса/дневников: без записи здесь ничего не синкается.
export const consents = pgTable(
  "consents",
  {
    userId: text("user_id").notNull().references(() => users.id),
    kind: text("kind", { enum: ["sync-texts", "sync-audio", "llm-feedback"] }).notNull(),
    granted: boolean("granted").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind] })]
);

// Журнал событий (синк v2): append-only, идемпотентен по клиентскому id.
// Убирает last-write-wins: телефон и веб сливают события, не затирая друг друга.
export const syncEvents = pgTable("sync_events", {
  id: text("id").primaryKey(), // клиентский id события
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // srs-answer | time-add | artifact-created | goal-set…
  payload: jsonb("payload").notNull(),
  clientTs: timestamp("client_ts", { withTimezone: true }).notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});
