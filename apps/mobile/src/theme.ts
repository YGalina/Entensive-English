// «Марина» на мобильном: единственный источник — @ie/tokens (тот же, что у web).
// Хук отдаёт цвета текущей темы + флаги навыков + радиусы.

import { marina, marinaColors, marinaSkills, type MarinaMode } from "@ie/tokens";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useMarina() {
  const mode: MarinaMode = useColorScheme() === "dark" ? "dark" : "light";
  return {
    mode,
    c: marinaColors(mode),
    sk: marinaSkills(mode),
    radius: marina.radius,
  };
}

/** Флаг навыка по CSS-имени тона из @ie/core (dayplan хранит "--sk-*"). */
export function skillTone(
  tone: string,
  sk: ReturnType<typeof useMarina>["sk"],
  brand: string
): string {
  const key = tone.replace("--sk-", "") as keyof typeof sk;
  return tone === "--brand" ? brand : (sk[key] ?? brand);
}
