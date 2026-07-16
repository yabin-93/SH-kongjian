import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import { expect, test as base, type Page, type TestInfo } from '@playwright/test';

interface Evidence {
  step<T>(name: string, action: () => Promise<T>): Promise<T>;
}

function caseId(testInfo: TestInfo): string {
  return testInfo.title.match(/P0-[A-Z0-9]+-\d{3}/)?.[0] ?? 'P0-UNKNOWN-000';
}

function safeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'step';
}

async function capture(page: Page, testInfo: TestInfo, folder: string, name: string): Promise<void> {
  if (page.isClosed()) return;

  const path = testInfo.outputPath(folder, `${caseId(testInfo)}-${name}.png`);
  await mkdir(dirname(path), { recursive: true });
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(`${caseId(testInfo)}-${name}`, { path, contentType: 'image/png' });
}

export const test = base.extend<{ evidence: Evidence }>({
  evidence: async ({ page }, use, testInfo) => {
    await use({
      step: async <T>(name: string, action: () => Promise<T>): Promise<T> =>
        base.step(name, async () => {
          try {
            return await action();
          } catch (error) {
            await capture(page, testInfo, 'failed-steps', `failed-${safeName(name)}`);
            await testInfo.attach(`${caseId(testInfo)}-error`, {
              body: Buffer.from(error instanceof Error ? (error.stack ?? error.message) : String(error)),
              contentType: 'text/plain',
            });
            throw error;
          }
        }),
    });
  },
});

test.afterEach(async ({ page }, testInfo) => {
  const status = testInfo.status ?? 'unknown';
  await capture(page, testInfo, 'screenshots', `final-${status}`);
});

export { expect };
