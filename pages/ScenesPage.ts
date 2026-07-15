import type { Locator, Page } from '@playwright/test';

import { BaseAdminPage } from './BaseAdminPage';

export class ScenesPage extends BaseAdminPage {
  static readonly route = '/scene/list';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(ScenesPage.route);
  }

  nameField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '模板名称');
  }

  md5Field(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, 'md5');
  }

  templateFileField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '模板文件');
  }

  videoUrlField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '视频url');
  }

  sceneUrlField(dialog = this.activeDialog()): Locator {
    return this.fieldByLabel(dialog, '场景url');
  }

  privateSwitch(dialog = this.activeDialog()): Locator {
    return dialog.getByRole('switch').first();
  }
}
