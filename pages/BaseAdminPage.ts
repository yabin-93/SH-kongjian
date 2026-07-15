import type { Locator, Page } from '@playwright/test';

export class BaseAdminPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;
  readonly searchButton: Locator;
  readonly dialogValidationMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('.el-table').first();
    this.createButton = page.getByRole('button', { name: /新增/ }).first();
    this.searchButton = page.getByRole('button', { name: /查询/ }).first();
    this.dialogValidationMessages = page.locator(
      '.el-dialog:visible .el-form-item__error',
    );
  }

  async goto(route: string): Promise<void> {
    await this.page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForURL(new RegExp(`#${route.replaceAll('/', '\\/')}$`));
    await this.table.waitFor({ state: 'visible' });
  }

  activeDialog(): Locator {
    return this.page.getByRole('dialog').filter({ visible: true }).last();
  }

  fieldByLabel(dialog: Locator, label: string | RegExp): Locator {
    return dialog
      .locator('p')
      .filter({ hasText: label })
      .locator('..')
      .locator('input, textarea')
      .first();
  }

  errorByLabel(dialog: Locator, label: string | RegExp): Locator {
    return dialog
      .locator('p')
      .filter({ hasText: label })
      .locator('..')
      .locator('.el-form-item__error');
  }

  confirmButton(dialog = this.activeDialog()): Locator {
    return dialog.getByRole('button', { name: /确\s*定/ }).last();
  }

  cancelButton(dialog = this.activeDialog()): Locator {
    return dialog.getByRole('button', { name: /取\s*消/ }).last();
  }

  async openCreateDialog(): Promise<Locator> {
    await this.createButton.waitFor({ state: 'visible' });
    await this.createButton.click();
    const dialog = this.activeDialog();
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  }

  async submitDialog(dialog = this.activeDialog()): Promise<void> {
    await this.confirmButton(dialog).click();
  }

  async submitDialogAndWaitForWrite(
    dialog = this.activeDialog(),
  ): Promise<void> {
    const response = this.page.waitForResponse(
      (candidate) =>
        candidate.request().method() !== 'GET' &&
        ['xhr', 'fetch'].includes(candidate.request().resourceType()),
      { timeout: 15_000 },
    );
    await this.confirmButton(dialog).click();
    await response;
  }

  async selectFirstOption(field: Locator): Promise<void> {
    await field.click();
    const option = this.page
      .locator('.el-select-dropdown:visible .el-select-dropdown__item:not(.is-disabled)')
      .first();
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  rowContaining(text: string): Locator {
    return this.page
      .locator('.el-table__body-wrapper tbody tr')
      .filter({ hasText: text })
      .first();
  }

  async firstRowButtonInColumn(headerName: string): Promise<Locator> {
    const table = this.page
      .locator('.el-table')
      .filter({ has: this.page.getByRole('columnheader', { name: headerName }) })
      .first();
    const headers = await table.locator('thead th').allTextContents();
    const columnIndex = headers.findIndex((header) =>
      header.replaceAll(/\s/g, '').includes(headerName),
    );
    if (columnIndex < 0) {
      throw new Error(`Column not found: ${headerName}`);
    }
    return table
      .locator(
        `.el-table__body-wrapper tbody tr:first-child td:nth-child(${columnIndex + 1})`,
      )
      .getByRole('button')
      .first();
  }

  async deleteRowContaining(text: string): Promise<void> {
    const row = this.rowContaining(text);
    const more = row.getByText(/更多/).first();
    await more.click();
    const deleteAction = this.page
      .locator('.el-dropdown-menu:visible')
      .getByText(/删除/)
      .first();
    await deleteAction.click();
    const confirm = this.page
      .locator('.el-message-box:visible')
      .getByRole('button', { name: /确定/ });
    const response = this.page.waitForResponse(
      (candidate) => candidate.request().method() === 'DELETE',
      { timeout: 15_000 },
    );
    await confirm.click();
    await response;
  }

  async columnTexts(headerName: string): Promise<string[]> {
    const table = this.page
      .locator('.el-table')
      .filter({ has: this.page.getByRole('columnheader', { name: headerName }) })
      .first();
    const headers = await table.locator('thead th').allTextContents();
    const columnIndex = headers.findIndex((header) =>
      header.replaceAll(/\s/g, '').includes(headerName),
    );
    if (columnIndex < 0) return [];
    return table
      .locator(`.el-table__body-wrapper tbody tr td:nth-child(${columnIndex + 1})`)
      .allTextContents();
  }
}
