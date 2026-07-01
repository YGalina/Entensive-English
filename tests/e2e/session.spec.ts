import { expect, test } from "@playwright/test";
import { dueCard, seed } from "./helpers";

// Небольшой пак для быстрого детерминированного прохода всех фаз.
const PACK = "work";

test("проходит сеанс насквозь и записывает слова в план повторов (SRS)", async ({
  page,
}) => {
  await seed(page);
  await page.goto(`/session/${PACK}`);

  // Фаза 1 — Готовность
  await expect(page.getByTestId("phase-ready")).toBeVisible();
  await page.getByTestId("phase-start").click();

  // Фаза 2 — Киносеанс (перегрузка массивом). Проверяем, что карточка ожила,
  // и уходим дальше без ожидания всего потока.
  await expect(page.getByTestId("phase-flash")).toBeVisible();
  await page.getByTestId("flash-skip").click();

  // Фаза 3 — Активизация в контексте: докликиваем до узнавания.
  await expect(page.getByTestId("phase-context")).toBeVisible();
  for (let i = 0; i < 30; i++) {
    if (await page.getByTestId("phase-recognition").isVisible()) break;
    await page.getByTestId("context-next").click();
  }

  // Фаза 4 — Узнавание: на каждое слово раскрываем перевод и жмём «Знаю».
  await expect(page.getByTestId("phase-recognition")).toBeVisible();
  for (let i = 0; i < 30; i++) {
    if (await page.getByTestId("phase-relax").isVisible()) break;
    const reveal = page.getByTestId("recognition-reveal");
    if (await reveal.isVisible()) await reveal.click();
    await page.getByTestId("recognition-known").click();
  }

  // Фаза 5 — Релаксация/итог
  await expect(page.getByTestId("phase-relax")).toBeVisible();

  // Ядро метода: пройденные слова легли в план повторов.
  const recorded = await page.evaluate(() => {
    try {
      return Object.keys(JSON.parse(localStorage.getItem("ie_srs") ?? "{}")).length;
    } catch {
      return 0;
    }
  });
  expect(recorded).toBeGreaterThan(0);

  await page.getByTestId("relax-finish").click();
  await expect(page).toHaveURL(/\/$/);
});

test("экран повторов отрабатывает очередь SRS до конца", async ({ page }) => {
  // Три слова из пака phrasal, все «к повтору сейчас».
  await seed(page, {
    srs: {
      "give up": dueCard("give up", "phrasal"),
      "find out": dueCard("find out", "phrasal"),
      "look for": dueCard("look for", "phrasal"),
    },
  });

  await page.goto("/vocab");

  // Кнопка повтора показывает размер очереди.
  const start = page.getByTestId("vocab-review-start");
  await expect(start).toContainText("3");
  await start.click();

  await expect(page.getByTestId("review-active")).toBeVisible();

  // Проходим всю очередь: раскрыть перевод → «Знаю».
  for (let i = 0; i < 10; i++) {
    if (await page.getByTestId("review-done").isVisible()) break;
    const reveal = page.getByTestId("review-reveal");
    if (await reveal.isVisible()) await reveal.click();
    await page.getByTestId("review-known").click();
  }

  // Дошли до экрана «Повтор завершён».
  await expect(page.getByTestId("review-done")).toBeVisible();

  // Все три ушли в «усвоено» (reps >= 2).
  const learned = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("ie_srs") ?? "{}") as Record<
      string,
      { reps: number }
    >;
    return Object.values(s).filter((c) => c.reps >= 2).length;
  });
  expect(learned).toBe(3);

  await page.getByTestId("review-done").click();
  await expect(page.getByTestId("vocab-review-start")).toHaveCount(0);
});
