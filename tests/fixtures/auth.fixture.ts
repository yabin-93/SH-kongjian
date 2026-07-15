import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { env } from './env';

interface AuthFixtures {
  authenticatedPage: Page;
}

interface AuthWorkerFixtures {
  adminStorageState: Awaited<ReturnType<BrowserContext['storageState']>>;
}

export const test = base.extend<AuthFixtures, AuthWorkerFixtures>({
  adminStorageState: [
    async ({ browser }, use) => {
      if (!env.credentials) {
        throw new Error('E2E_USERNAME and E2E_PASSWORD are required.');
      }

      const context = await browser.newContext({
        baseURL: env.baseURL,
        ignoreHTTPSErrors: true,
      });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      await login.loginAndWaitForDashboard(env.credentials);
      await use(await context.storageState());
      await context.close();
    },
    { scope: 'worker' },
  ],

  authenticatedPage: async ({ browser, adminStorageState }, use) => {
    if (!env.credentials) {
      throw new Error('E2E_USERNAME and E2E_PASSWORD are required.');
    }

    const context = await browser.newContext({
      baseURL: env.baseURL,
      ignoreHTTPSErrors: true,
      storageState: adminStorageState,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
