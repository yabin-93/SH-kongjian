import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { env } from '../fixtures/env';
import { mockNextApiWriteError } from '../support/api-mocks';

test.describe('P0 - login and session', () => {
  test('TC-AUTH-001 valid credentials open the dashboard', async ({ page }) => {
    test.skip(!env.credentials, 'E2E_USERNAME and E2E_PASSWORD are required.');
    const login = new LoginPage(page);
    await login.goto();

    // Submit the real test account and wait for the protected route.
    await login.loginAndWaitForDashboard(env.credentials!);

    await expect(page).toHaveURL(/#\/dashboard$/);
  });

  test('TC-AUTH-002 wrong password keeps the user on login', async ({ page }) => {
    test.skip(!env.credentials, 'E2E_USERNAME is required.');
    const login = new LoginPage(page);
    await login.goto();

    await login.login({
      username: env.credentials!.username,
      password: `wrong-${Date.now()}`,
    });

    await expect(page).toHaveURL(/#\/login/);
  });

  test('TC-AUTH-003 empty username shows one validation error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.password.fill('not-empty');
    await login.submit();

    await expect(login.validationMessages).toHaveCount(1);
  });

  test('TC-AUTH-004 empty password shows one validation error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.username.fill('not-empty');
    await login.submit();

    await expect(login.validationMessages).toHaveCount(1);
  });

  test('TC-AUTH-006 unauthenticated protected route redirects to login', async ({
    page,
  }) => {
    await page.goto('/#/system/list');

    await expect(page).toHaveURL(/#\/login\?redirect=%2Fsystem%2Flist/);
  });

  test('TC-AUTH-008 server error does not open the dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const removeMock = await mockNextApiWriteError(page, 500);

    try {
      await login.login({ username: 'mock-user', password: 'mock-password' });
      await expect(page).toHaveURL(/#\/login/);
    } finally {
      await removeMock();
    }
  });
});
