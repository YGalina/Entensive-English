import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

// Полный цикл magic-link (dev-режим: ссылка возвращается прямо на экран):
// запрос → вход по ссылке → сессия → облачный синк туда и обратно.
test("magic link: вход и облачный синк прогресса", async ({ page }) => {
  await seed(page);

  await page.goto("/login");
  await expect(page.getByTestId("login-title")).toBeVisible();
  await page.getByTestId("login-email").fill("galya.e2e@example.com");
  await page.getByTestId("login-submit").click();

  // Dev-доставка: ссылка входа показана прямо на странице.
  const dev = page.getByTestId("login-devlink");
  await expect(dev).toBeVisible();
  await dev.click();

  // Вошли: редирект в профиль, карточка аккаунта знает email.
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByText("galya.e2e@example.com")).toBeVisible();

  // Синк: сохранить (со значением 150) → испортить локально → забрать → восстановилось.
  await page.evaluate(() =>
    localStorage.setItem("ie_wpm", JSON.stringify([{ d: "2026-07-01", wpm: 150, words: 200 }]))
  );
  await page.getByTestId("cloud-save").click();
  await expect(page.getByText(/облаке|cloud/i).first()).toBeVisible();

  await page.evaluate(() => localStorage.setItem("ie_wpm", JSON.stringify([{ d: "2020-01-01", wpm: 999, words: 1 }])));
  await page.getByTestId("cloud-load").click();
  await page.waitForTimeout(900); // reload после загрузки
  const wpm = await page.evaluate(() => localStorage.getItem("ie_wpm"));
  expect(wpm ?? "").not.toContain("999");
});
