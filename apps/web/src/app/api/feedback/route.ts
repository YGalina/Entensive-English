import Anthropic from "@anthropic-ai/sdk";
import { getSessionUser } from "@/lib/server/auth";
import { db, schema } from "@/lib/server/db";
import { eq, and } from "drizzle-orm";

// AI-подсказки тренера (Фаза D): LLM-фидбэк на тексты вывода.
// Строго по правилам психослоя и аудита: prompts (подсказки к
// САМОисправлению), не recasts (готовые исправления); максимум 2; тон
// тренера, не судьи. Работает только при явном согласии llm-feedback
// и настроенном ключе (env ANTHROPIC_API_KEY) — иначе честные 501/403.

const MODEL = "claude-opus-4-8";

const SYSTEM = `Ты — тренер английского для русскоговорящих взрослых в приложении Intensive English.
Тебе дают короткий текст ученицы на английском (статус дня, дневник).
Верни МАКСИМУМ 2 подсказки к самоисправлению (prompts, не исправления):
- подсказка наводит («попробуй прошедшее время», «после feel — сразу состояние»), но НЕ даёт готовую исправленную фразу целиком;
- выбирай самое важное: то, что мешает пониманию или закрепляет кальку из русского;
- тон тренера в спортзале: спокойно, уважительно, без оценок личности, без «неправильно/ошибка», по-русски;
- если текст в порядке — верни пустой список подсказок и одну строку похвалы, отмечающую конкретную удачу (не общее «молодец»).
Никогда не комментируй содержание жизни ученицы — только язык.`;

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    hints: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const, description: "2–4 слова, суть подсказки" },
          hint: { type: "string" as const, description: "1–2 предложения по-русски, наводящие на самоисправление" },
        },
        required: ["title", "hint"],
        additionalProperties: false as const,
      },
    },
    praise: { type: "string" as const, description: "конкретная похвала, если подсказок нет; иначе пустая строка" },
  },
  required: ["hints", "praise"],
  additionalProperties: false as const,
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not-configured" }, { status: 501 });
  }

  // Явное согласие llm-feedback обязательно (приватность, Фаза C).
  const d = await db();
  const consent = await d
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.userId, user.id), eq(schema.consents.kind, "llm-feedback")));
  if (!consent.some((c) => c.granted)) {
    return Response.json({ error: "no-consent" }, { status: 403 });
  }

  let text = "";
  let artifactId: string | undefined;
  try {
    const body = (await request.json()) as { text?: string; artifactId?: string };
    text = (body.text ?? "").trim().slice(0, 2000);
    artifactId = body.artifactId;
  } catch {
    return Response.json({ error: "bad-json" }, { status: 400 });
  }
  if (!text) return Response.json({ error: "empty" }, { status: 400 });

  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    messages: [{ role: "user", content: `Текст ученицы:\n"""${text}"""` }],
  });

  if (response.stop_reason === "refusal") {
    return Response.json({ hints: [], praise: "" });
  }
  const textBlock = response.content.find((b) => b.type === "text");
  let parsed: { hints: { title: string; hint: string }[]; praise: string } = { hints: [], praise: "" };
  try {
    parsed = JSON.parse(textBlock && "text" in textBlock ? textBlock.text : "{}");
  } catch {}
  parsed.hints = (parsed.hints ?? []).slice(0, 2);

  // Сохраняем в журнал фидбэка, если артефакт уже известен серверу.
  if (artifactId) {
    try {
      const found = await d
        .select({ id: schema.outputArtifacts.id })
        .from(schema.outputArtifacts)
        .where(and(eq(schema.outputArtifacts.id, artifactId), eq(schema.outputArtifacts.userId, user.id)));
      if (found.length > 0) {
        await d.insert(schema.feedback).values({
          id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          artifactId,
          kind: "prompt",
          hints: parsed.hints,
          source: "llm",
        });
      }
    } catch {}
  }

  return Response.json(parsed);
}
