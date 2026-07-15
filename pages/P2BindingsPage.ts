import type { Locator, Page } from '@playwright/test';

import { P2UsersPage } from './P2UsersPage';

export class P2BindingsPage extends P2UsersPage {
  constructor(page: Page) {
    super(page);
  }

  async openFirstSceneBinding(): Promise<Locator> {
    return this.openFirstBinding(/绑定场景$/);
  }

  async openFirstPackageBinding(): Promise<Locator> {
    return this.openFirstBinding(/绑定场景包/);
  }

  selectionAction(name: '全选' | '反选' | '清空当前' | '清空全部'): Locator {
    return this.activeDialog().getByText(name, { exact: true });
  }

  selectedCount(): Locator {
    return this.activeDialog().getByText(/已选|选中/).first();
  }

  private async openFirstBinding(name: RegExp): Promise<Locator> {
    const headerName = name.source.includes('场景包') ? '绑定场景包' : '绑定场景';
    const trigger = await this.firstRowButtonInColumn(headerName);
    await trigger.click();
    const dialog = this.activeDialog();
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  }
}
