import { P2BindingsPage } from '../../pages/P2BindingsPage';
import { test, expect } from '../fixtures/auth.fixture';
import { env } from '../fixtures/env';

test.describe('P0 - P2 bindings', () => {
  test.beforeEach(() => test.skip(!env.credentials, 'Admin credentials are required.'));

  test('TC-P2B-001 scene binding dialog opens', async ({ authenticatedPage }) => {
    const bindings = new P2BindingsPage(authenticatedPage);
    await bindings.goto();

    const dialog = await bindings.openFirstSceneBinding();

    await expect(dialog).toBeVisible();
  });

  test('TC-P2B-002 package binding dialog opens', async ({ authenticatedPage }) => {
    const bindings = new P2BindingsPage(authenticatedPage);
    await bindings.goto();

    const dialog = await bindings.openFirstPackageBinding();

    await expect(dialog).toBeVisible();
  });

  for (const action of ['全选', '反选', '清空当前', '清空全部'] as const) {
    test(`TC-P2B selection dialog exposes ${action}`, async ({ authenticatedPage }) => {
      const bindings = new P2BindingsPage(authenticatedPage);
      await bindings.goto();
      await bindings.openFirstPackageBinding();

      await expect(bindings.selectionAction(action)).toBeVisible();
    });
  }
});
