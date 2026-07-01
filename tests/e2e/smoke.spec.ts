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
});
