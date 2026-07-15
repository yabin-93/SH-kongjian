import type { Locator, Page } from '@playwright/test';

import { BaseAdminPage } from './BaseAdminPage';

export class P2UsersPage extends BaseAdminPage {
  static readonly route = '/p2/set-user';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(P2UsersPage.route);
  }

  accountField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '用户登录账号');
  }

  passwordField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '用户密码');
  }

  expiryField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '场景包过期时间');
  }

  async fillRequiredFields(account: string, password: string): Promise<void> {
    const dialog = this.activeDialog();
    await this.accountField(dialog).fill(account);
    await this.passwordField(dialog).fill(password);
  }
}
