import { redirect } from "next/navigation";
import { consumeLoginToken, getOrCreateUser } from "@/lib/server/store";
import { setSession } from "@/lib/server/auth";

// GET ?token=… — вход по волшебной ссылке: сжигаем токен, ставим сессию.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const email = token ? await consumeLoginToken(token) : null;
  if (!email) redirect("/login?error=expired");
  const user = await getOrCreateUser(email);
  await setSession(user.id);
  redirect("/profile?welcome=1");
}
