import type { Locator, Page } from '@playwright/test';

import { BaseAdminPage } from './BaseAdminPage';

export class Space1UsersPage extends BaseAdminPage {
  static readonly route = '/space1/set-user';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(Space1UsersPage.route);
  }

  accountField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '用户登录账号');
  }

  passwordField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '用户密码');
  }

  macField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, /mac地址/i);
  }

  async fillRequiredFields(account: string, password: string): Promise<void> {
    const dialog = this.activeDialog();
    await this.accountField(dialog).fill(account);
    await this.passwordField(dialog).fill(password);
  }
}
