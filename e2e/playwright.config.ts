import { defineConfig, devices } from '@playwright/test';

import { resolveRunId } from './support/run-context.js';

const runId = resolveRunId();

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/unit/**',
  outputDir: `output/test-results/${runId}`,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  failOnFlakyTests: true,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: `output/html/${runId}`, open: 'never' }],
    ['junit', { outputFile: `output/results/${runId}/junit.xml` }],
    ['json', { outputFile: `output/results/${runId}/results.json` }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://pt-test.mrstage.com/',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    testIdAttribute: 'data-testid',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'smoke',
      testMatch: '**/smoke/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
