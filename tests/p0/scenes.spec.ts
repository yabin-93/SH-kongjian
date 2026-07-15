import { ScenesPage } from '../../pages/ScenesPage';
import { test, expect } from '../fixtures/auth.fixture';
import { env } from '../fixtures/env';
import { mockNextApiWriteError } from '../support/api-mocks';

test.describe('P0 - scenes and resources', () => {
  test.beforeEach(() => test.skip(!env.credentials, 'Admin credentials are required.'));

  test('TC-SCENE-001 scene table loads', async ({ authenticatedPage }) => {
    const scenes = new ScenesPage(authenticatedPage);
    await scenes.goto();

    await expect(scenes.table).toBeVisible();
  });

  test('TC-SCENE-002 create dialog exposes the scene name field', async ({
    authenticatedPage,
  }) => {
    const scenes = new ScenesPage(authenticatedPage);
    await scenes.goto();
    const dialog = await scenes.openCreateDialog();

    await expect(scenes.nameField(dialog)).toBeVisible();
  });

  test('TC-SCENE-004 server rejection keeps the scene dialog open', async ({
    authenticatedPage,
  }) => {
    const scenes = new ScenesPage(authenticatedPage);
    await scenes.goto();
    const dialog = await scenes.openCreateDialog();
    await scenes.videoUrlField(dialog).fill('not-a-valid-url');
    const removeMock = await mockNextApiWriteError(authenticatedPage, 500);

    try {
      await scenes.submitDialogAndWaitForWrite(dialog);
      await expect(dialog).toBeVisible();
    } finally {
      await removeMock();
    }
  });
});
