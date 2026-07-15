import { Space1ScenePackagesPage } from '../../pages/Space1ScenePackagesPage';
import { test, expect } from '../fixtures/auth.fixture';
import { env } from '../fixtures/env';
import { uniqueName } from '../fixtures/test-data';
import { mutationEnabled, mutationSkipReason } from '../support/mutation';

test.describe('P0 - Space 1.0 scene packages', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(() => test.skip(!env.credentials, 'Admin credentials are required.'));

  test('TC-S1P-001 scene package table loads', async ({ authenticatedPage }) => {
    const packages = new Space1ScenePackagesPage(authenticatedPage);
    await packages.goto();

    await expect(packages.table).toBeVisible();
  });

  test('TC-S1P-003 user binding view opens', async ({ authenticatedPage }) => {
    const packages = new Space1ScenePackagesPage(authenticatedPage);
    await packages.goto();

    const bindingView = await packages.openFirstBinding('用户');

    await expect(bindingView).toBeVisible();
  });

  test('TC-S1P-004 resource binding view opens', async ({ authenticatedPage }) => {
    const packages = new Space1ScenePackagesPage(authenticatedPage);
    await packages.goto();

    const bindingView = await packages.openFirstBinding('资源');

    await expect(bindingView).toBeVisible();
  });

  test('TC-S1P-001 creates a unique package when mutations are enabled', async ({
    authenticatedPage,
  }) => {
    test.skip(!mutationEnabled(), mutationSkipReason);
    const packages = new Space1ScenePackagesPage(authenticatedPage);
    const name = uniqueName('pw-space1-package');
    await packages.goto();
    const dialog = await packages.openCreateDialog();
    await packages.packageNameField(dialog).fill(name);

    try {
      await packages.submitDialogAndWaitForWrite(dialog);
      await expect(packages.rowContaining(name)).toBeVisible();
    } finally {
      if (await packages.rowContaining(name).isVisible()) {
        await packages.deleteRowContaining(name);
      }
    }
  });
});
