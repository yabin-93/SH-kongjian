import { Space1UsersPage } from '../../pages/Space1UsersPage';
import { test, expect } from '../fixtures/auth.fixture';
import { env } from '../fixtures/env';
import { uniqueName } from '../fixtures/test-data';
import { mutationEnabled, mutationSkipReason } from '../support/mutation';

test.describe('P0 - Space 1.0 users', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(() => test.skip(!env.credentials, 'Admin credentials are required.'));

  test('TC-S1U-001 user table loads', async ({ authenticatedPage }) => {
    const users = new Space1UsersPage(authenticatedPage);
    await users.goto();

    await expect(users.table).toBeVisible();
  });

  test('TC-S1U-003 empty account shows its required error', async ({
    authenticatedPage,
  }) => {
    test.fail(true, 'Known defect: required account has no field error.');
    const users = new Space1UsersPage(authenticatedPage);
    await users.goto();
    const dialog = await users.openCreateDialog();
    await users.passwordField(dialog).fill('Valid-Pass-123');
    await users.submitDialog(dialog);

    await expect(users.errorByLabel(dialog, '用户登录账号')).toBeVisible();
  });

  test('TC-S1U-001 creates a unique user when mutations are enabled', async ({
    authenticatedPage,
  }) => {
    test.skip(!mutationEnabled(), mutationSkipReason);
    const users = new Space1UsersPage(authenticatedPage);
    const account = uniqueName('pw-space1');
    await users.goto();
    const dialog = await users.openCreateDialog();
    await users.fillRequiredFields(account, 'Pw-Test-123456');

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
