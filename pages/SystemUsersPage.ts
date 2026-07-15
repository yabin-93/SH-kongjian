import type { Locator, Page } from '@playwright/test';

import { BaseAdminPage } from './BaseAdminPage';

export class SystemUsersPage extends BaseAdminPage {
  static readonly route = '/system/list';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(SystemUsersPage.route);
  }

  accountField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '用户登录账号');
  }

  passwordField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '用户密码');
  }

  identityField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '身份');
  }

  async fillRequiredFields(account: string, password: string): Promise<void> {
    const dialog = this.activeDialog();
    await this.accountField(dialog).fill(account);
    await this.passwordField(dialog).fill(password);
  }

  passwordColumnTexts(): Promise<string[]> {
    return this.page
      .locator('.el-table__body-wrapper tbody tr td:nth-child(3) .cell')
      .allTextContents();
  }

  exposedPassword(value: string): Locator {
    return this.page
      .locator('.el-table:visible')
      .getByText(value, { exact: true })
      .first();
  }
}
