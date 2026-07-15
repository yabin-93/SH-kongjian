import { test as base, expect as baseExpect } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { SystemUsersPage } from '../../pages/SystemUsersPage';
import { test, expect } from '../fixtures/auth.fixture';
import { env } from '../fixtures/env';
import { uniqueName } from '../fixtures/test-data';
import { mutationEnabled, mutationSkipReason } from '../support/mutation';

test.describe('P0 - system users and RBAC', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(() => {
    test.skip(!env.credentials, 'Admin credentials are required.');
  });

  test('TC-RBAC-001 system user page is available to the admin', async ({
    authenticatedPage,
  }) => {
    const users = new SystemUsersPage(authenticatedPage);
    await users.goto();

    await expect(users.table).toBeVisible();
  });

  test('TC-RBAC-003 empty account shows its required error', async ({
    authenticatedPage,
  }) => {
    test.fail(true, 'Known defect: required account has no field error.');
    const users = new SystemUsersPage(authenticatedPage);
    await users.goto();
    const dialog = await users.openCreateDialog();
    await users.passwordField(dialog).fill('Valid-Pass-123');
    await users.submitDialog(dialog);

    await expect(users.errorByLabel(dialog, '用户登录账号')).toBeVisible();
  });

  test('TC-RBAC-004 empty password shows its required error', async ({
    authenticatedPage,
  }) => {
    test.fail(true, 'Known defect: required password has no field error.');
    const users = new SystemUsersPage(authenticatedPage);
    await users.goto();
    const dialog = await users.openCreateDialog();
    await users.accountField(dialog).fill(uniqueName('rbac-required'));
    await users.submitDialog(dialog);

    await expect(users.errorByLabel(dialog, '用户密码')).toBeVisible();
  });

  test('TC-RBAC-008 password column never exposes the login password', async ({
    authenticatedPage,
  }) => {
    test.fail(true, 'Known security defect: the current UI exposes passwords.');
    const users = new SystemUsersPage(authenticatedPage);
    await users.goto();
    await users
      .rowContaining(env.credentials!.username)
      .waitFor({ state: 'visible' });
    await expect(users.exposedPassword(env.credentials!.password)).not.toBeVisible();
  });

  test('TC-RBAC-001 creates a uniquely named system user', async ({
    authenticatedPage,
  }) => {
    test.skip(!mutationEnabled(), mutationSkipReason);
    const users = new SystemUsersPage(authenticatedPage);
    const account = uniqueName('pw-system');
    await users.goto();
    const dialog = await users.openCreateDialog();
    await users.fillRequiredFields(account, 'Pw-Test-123456');
    await users.selectFirstOption(users.identityField(dialog));

    try {
      await users.submitDialogAndWaitForWrite(dialog);
      await expect(users.rowContaining(account)).toBeVisible();
    } finally {
      if (await users.rowContaining(account).isVisible()) {
        await users.deleteRowContaining(account);
      }
    }
  });
});

base.describe('P0 - limited role protection', () => {
  base('TC-RBAC-006 limited role cannot open system users directly', async ({
    page,
  }) => {
    base.skip(!env.limitedCredentials, 'Limited-role credentials are required.');
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAndWaitForDashboard(env.limitedCredentials!);
    await page.goto('/#/system/list');

    await baseExpect(page.locator('.el-table')).not.toBeVisible();
  });
});
