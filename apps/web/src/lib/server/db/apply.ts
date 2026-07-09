import { sql } from "drizzle-orm";
import { db, schema } from "./index";

// Применение журнала событий в доменные таблицы (синк v2, Фаза C).
// Вызывается только для СВЕЖЕ-принятых событий (идемпотентность обеспечена
// onConflictDoNothing по id события) — поэтому апдейты здесь простые.
// Неизвестные типы событий молча пропускаем: старый сервер не должен
// падать от нового клиента.

type EventRow = {
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  clientTs: Date;
};

export async function applyEvent(e: EventRow): Promise<void> {
  const d = await db();
  try {
    switch (e.type) {
      case "goal-set": {
        const p = e.payload as {
          lifeGoal?: string; domain?: string; currentLevel?: string;
          targetLevel?: string; deadline?: string; weeklyMinutes?: number;
        };
        if (!p.domain || !p.currentLevel || !p.targetLevel) return;
        await d
          .insert(schema.goals)
          .values({
            userId: e.userId,
            lifeGoal: String(p.lifeGoal ?? ""),
            domain: String(p.domain),
            currentLevel: String(p.currentLevel),
            targetLevel: String(p.targetLevel),
            deadline: p.deadline ? new Date(p.deadline) : null,
            weeklyMinutes: Number(p.weeklyMinutes ?? 0),
            updatedAt: e.clientTs,
          })
          .onConflictDoUpdate({
            target: schema.goals.userId,
            set: {
              lifeGoal: String(p.lifeGoal ?? ""),
              domain: String(p.domain),
              currentLevel: String(p.currentLevel),
              targetLevel: String(p.targetLevel),
              deadline: p.deadline ? new Date(p.deadline) : null,
              weeklyMinutes: Number(p.weeklyMinutes ?? 0),
              updatedAt: e.clientTs,
            },
            // не откатываем цель более старым событием с другого устройства
            setWhere: sql`${schema.goals.updatedAt} < ${e.clientTs}`,
          });
        return;
      }
      case "time-add": {
        const p = e.payload as { day?: string; activity?: string; seconds?: number };
        const seconds = Math.max(0, Math.round(Number(p.seconds ?? 0)));
        if (!p.day || !p.activity || seconds === 0) return;
        await d
          .insert(schema.timeEntries)
          .values({ userId: e.userId, day: String(p.day), activity: String(p.activity), seconds })
          .onConflictDoUpdate({
            target: [schema.timeEntries.userId, schema.timeEntries.day, schema.timeEntries.activity],
            // события применяются РОВНО один раз — инкремент безопасен
            set: { seconds: sql`${schema.timeEntries.seconds} + ${seconds}` },
          });
        return;
      }
      case "srs-answer": {
        const p = e.payload as { en?: string; packId?: string; known?: boolean; direction?: string };
        if (!p.en || !p.packId) return;
        const direction = p.direction === "produce" ? "produce" : "recognize";
        // Серверная проекция v1: журнал ответов внутри fsrs-поля (полный
        // пересчёт FSRS на сервере не нужен — источник истины пока клиент).
        await d
          .insert(schema.srsCards)
          .values({
            userId: e.userId,
            en: String(p.en),
            direction,
            packId: String(p.packId),
            fsrs: { answers: 1, lastKnown: !!p.known, lastAt: e.clientTs.toISOString() },
            updatedAt: e.clientTs,
          })
          .onConflictDoUpdate({
            target: [schema.srsCards.userId, schema.srsCards.en, schema.srsCards.direction],
            set: {
              fsrs: sql`jsonb_set(
                jsonb_set(${schema.srsCards.fsrs}, '{answers}',
                  (coalesce((${schema.srsCards.fsrs}->>'answers')::int, 0) + 1)::text::jsonb),
                '{lastKnown}', ${p.known ? "true" : "false"}::jsonb)`,
              updatedAt: e.clientTs,
            },
          });
        return;
      }
      case "artifact-created": {
        const p = e.payload as { artifactId?: string; type?: string; words?: number };
        if (!p.artifactId || !p.type) return;
        // Метаданные без текста/аудио — тело приедет отдельным consent-каналом.
        await d
          .insert(schema.outputArtifacts)
          .values({
            id: String(p.artifactId),
            userId: e.userId,
            type: String(p.type),
            words: [],
            privacy: "private",
            createdAt: e.clientTs,
          })
          .onConflictDoNothing();
        return;
      }
      default:
        return;
    }
  } catch {
    // Применение — best effort: журнал уже сохранён, проекцию можно
    // перестроить позже; не роняем приём батча из-за одного события.
  }
}
