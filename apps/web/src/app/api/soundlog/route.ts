// Диагностический роут: браузер присылает список TTS-голосов, сервер их логирует.
// Нужен, чтобы увидеть реальное окружение пользователя в логах сервера.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[SOUNDLOG]", JSON.stringify(body));
  } catch {
    console.log("[SOUNDLOG] failed to parse body");
  }
  return Response.json({ ok: true });
}
