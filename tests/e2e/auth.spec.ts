import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

// Полный цикл magic-link (dev-режим: ссылка возвращается прямо на экран):
// запрос → вход по ссылке → сессия → облачный синк туда и обратно.
test("magic link: вход и облачный синк прогресса", async ({ page }, testInfo) => {
  await seed(page);
  // Свой email на проект — параллельные прогоны не топчут общий снапшот.
  const email = `galya.e2e+${testInfo.project.name}@example.com`;

  await page.goto("/login");
  await expect(page.getByTestId("login-title")).toBeVisible();
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-submit").click();

  // Dev-доставка: ссылка входа показана прямо на странице.
  const dev = page.getByTestId("login-devlink");
  await expect(dev).toBeVisible();
  await dev.click();

  // Вошли: редирект в профиль, карточка аккаунта знает email.
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByText(email)).toBeVisible();

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

  // Биллинг-каркас: без ключей Stripe checkout честно отвечает not-configured.
  const billing = await page.evaluate(async () => {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period: "year" }),
    });
    return { status: res.status, body: await res.json() };
  });
  expect(billing.status).toBe(503);

  // Страница тарифов открывается и показывает мягкое сообщение при попытке.
  await page.goto("/pricing");
  await expect(page.getByTestId("pricing-title")).toBeVisible();
  // Кнопка могла отрендериться до гидрации — кликаем с повтором.
  const msg = page.getByTestId("pricing-msg");
  for (let k = 0; k < 4 && !(await msg.isVisible()); k++) {
    await page.getByTestId("checkout-year").click();
    await page.waitForTimeout(700);
  }
  await expect(msg).toBeVisible();
});
