"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadPrefs } from "@/lib/prefs";

/**
 * Если онбординг не пройден — уводим на него.
 * Решение принимаем по прямому чтению localStorage в эффекте (на клиенте),
 * а не по снапшоту хука — иначе при гидратации (серверный снапшот пуст)
 * случается ложный редирект до того, как прочитаются реальные настройки.
 */
export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (loadPrefs() === null) router.replace("/onboarding");
  }, [router]);

  return <>{children}</>;
}
