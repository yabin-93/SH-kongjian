import type { Locator, Page } from '@playwright/test';

import { BaseAdminPage } from './BaseAdminPage';

export class Space1ScenePackagesPage extends BaseAdminPage {
  static readonly route = '/space1/space1-scene-package';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(Space1ScenePackagesPage.route);
  }

  packageNameField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, /产品包名称|场景包名称/);
  }

  async openFirstBinding(kind: '用户' | '资源'): Promise<Locator> {
    const button = await this.firstRowButtonInColumn(`绑定${kind}`);
    await button.click();
    const returnButton = this.page.getByRole('button', { name: /返回/ }).first();
    await returnButton.waitFor({ state: 'visible' });
    return returnButton;
  }
}
