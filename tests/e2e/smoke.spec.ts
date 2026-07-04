import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seed(page);
});

// Дымовой тест: ключевые экраны открываются. Привязка к data-testid, а не к
// тексту, — копирайт и язык интерфейса можно менять, не ломая тесты.
test("opens main learning surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-greeting")).toBeVisible();
  await expect(page.getByTestId("home-start-session")).toBeVisible();

  await page.goto("/session/health");
  await expect(page.getByTestId("phase-ready")).toBeVisible();
  await expect(page.getByTestId("session-pack-title")).toContainText("Здоровье");
  await expect(page.getByTestId("phase-start")).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByTestId("profile-title")).toBeVisible();

  await page.goto("/reading");
  await expect(page.getByTestId("reading-title")).toBeVisible();

  await page.goto("/grammar");
  await expect(page.getByTestId("grammar-title")).toBeVisible();
  await expect(page.getByTestId("grammar-fill").first()).toBeVisible();
  await expect(page.getByText("I drink coffee every day.")).toHaveCount(0);
  await page.getByTestId("grammar-fill").first().click();
  await expect(page.getByText("I drink coffee every day.")).toBeVisible();
  await page.getByTestId("grammar-autoflow-toggle").click();
  await expect(page.getByTestId("grammar-title")).toBeVisible();

  await page.goto("/pronunciation");
  await expect(page.getByTestId("pronunciation-title")).toBeVisible();
  // Тренировка по Шестову: фраза + лестница темпа (TTS застаблен).
  await expect(page.getByTestId("drill-phrase")).toBeVisible();
  await page.getByTestId("drill-step").nth(1).click();
  await expect(page.getByTestId("drill-phrase")).toBeVisible();
  // Справочник правил — во второй вкладке, примеры-слова кликабельны.
  await page.getByTestId("pron-tab-rules").click();
  const examples = page.getByTestId("pron-example");
  await expect(examples.first()).toBeVisible();
  await examples.first().click();
  await expect(page.getByTestId("pronunciation-title")).toBeVisible();

  // Набор (машинопись): zero-error ввод — печатаем фразу, получаем итог.
  await page.goto("/typing");
  await expect(page.getByTestId("typing-title")).toBeVisible();
  await page.keyboard.type("Dear passengers: welcome aboard!");
  await expect(page.getByTestId("typing-result")).toBeVisible();
  await page.getByTestId("typing-next").click();
  await expect(page.getByTestId("typing-result")).toHaveCount(0);
});
