import { defineConfig, devices } from "@playwright/test";

// Отдельный порт для e2e, чтобы прогон не утыкался в ручной `next dev` на :3000
// (reuseExistingServer там подхватил бы чужой сервер и тесты били бы мимо).
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    // Тестируем production-сборку, а не `next dev`: у неё нет single-instance-замка
    // Next 16 (второй `next dev` для той же папки не стартует), она не конфликтует
    // с ручным dev-сервером на :3000 и всегда «своя» на выделенном порту.
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    // В CI всегда поднимаем свежий сервер; локально переиспользуем свой на 3100.
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
