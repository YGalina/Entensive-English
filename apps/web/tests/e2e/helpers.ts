import type { Page } from "@playwright/test";

/** Профиль, пропускающий онбординг (OnboardingGate пускает дальше). */
export const PREFS = {
  nativeLang: "ru",
  uiLang: "ru",
  goal: "vocab",
  topics: ["core", "health"],
  level: "b1",
  programDay: 1,
} as const;

/**
 * Готовит браузер к прогону до загрузки страницы:
 *  - кладёт ie_prefs (и опционально ie_srs) в localStorage;
 *  - глушит speechSynthesis, чтобы озвучка не запускала автопереход фаз
 *    и прогон был детерминированным (в headless голосов всё равно нет).
 */
export async function seed(
  page: Page,
  opts: { srs?: Record<string, unknown> } = {}
) {
  await page.addInitScript(
    ({ prefs, srs }) => {
      localStorage.setItem("ie_prefs", JSON.stringify(prefs));
      if (srs) localStorage.setItem("ie_srs", JSON.stringify(srs));

      const noopSpeech = {
        speak() {},
        cancel() {},
        pause() {},
        resume() {},
        getVoices() {
          return [] as unknown[];
        },
        addEventListener() {},
        removeEventListener() {},
        speaking: false,
        pending: false,
        paused: false,
      };
      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: noopSpeech,
      });
    },
    { prefs: PREFS, srs: opts.srs ?? null }
  );
}

/** Карточка SRS «к повтору сейчас» (due в прошлом). en должен существовать в ALL_PACKS. */
export function dueCard(en: string, packId: string, reps = 1) {
  return {
    en,
    packId,
    reps,
    intervalDays: 1,
    ease: 2.5,
    due: Date.now() - 60_000,
    lapses: 0,
  };
}
