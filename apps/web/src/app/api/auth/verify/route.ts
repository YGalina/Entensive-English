import { redirect } from "next/navigation";
import { consumeLoginToken, getOrCreateUser } from "@/lib/server/store";
import { setSession, issueSessionToken } from "@/lib/server/auth";

// GET ?token=… — вход по волшебной ссылке: сжигаем токен.
//   • web  — ставим httpOnly-куку, ведём в /profile;
//   • app  — отдаём тот же токен через deep-link intensiveenglish://auth,
//            приложение сохранит его и будет слать как Bearer.
// Ссылку всегда открывает браузер телефона/десктопа — переход в кастомную
// схему поднимает установленное приложение.
const APP_SCHEME = "intensiveenglish";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const hit = token ? await consumeLoginToken(token) : null;
  if (!hit) redirect("/login?error=expired");
  const user = await getOrCreateUser(hit.email);

  if (hit.mode === "app") {
    const session = issueSessionToken(user.id);
    redirect(`${APP_SCHEME}://auth?session=${encodeURIComponent(session)}`);
  }

  await setSession(user.id);
  redirect("/profile?welcome=1");
}
