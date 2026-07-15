import 'dotenv/config';

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // The test environment invalidates earlier sessions when the same account logs in again.
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: 'output/playwright/test-results',
  reporter: [
    ['line'],
    ['html', { outputFolder: 'output/playwright/report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://pt-test.mrstage.com',
    actionTimeout: 10_000,
    navigationTimeout: 60_000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
