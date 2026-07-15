import { expect, test } from '@playwright/test';

import { P2BindingsPage } from '../../pages/P2BindingsPage';
import { P2UsersPage } from '../../pages/P2UsersPage';
import { ScenesPage } from '../../pages/ScenesPage';
import { Space1ScenePackagesPage } from '../../pages/Space1ScenePackagesPage';
import { Space1UsersPage } from '../../pages/Space1UsersPage';
import { SystemUsersPage } from '../../pages/SystemUsersPage';

test('all P0 page objects can be constructed', async ({ page }) => {
  expect(new SystemUsersPage(page)).toBeInstanceOf(SystemUsersPage);
  expect(new Space1UsersPage(page)).toBeInstanceOf(Space1UsersPage);
  expect(new Space1ScenePackagesPage(page)).toBeInstanceOf(
    Space1ScenePackagesPage,
  );
  expect(new P2UsersPage(page)).toBeInstanceOf(P2UsersPage);
  expect(new P2BindingsPage(page)).toBeInstanceOf(P2BindingsPage);
  expect(new ScenesPage(page)).toBeInstanceOf(ScenesPage);
});
