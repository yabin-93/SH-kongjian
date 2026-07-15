import type { Locator, Page } from '@playwright/test';

import type { Credentials } from '../tests/fixtures/env';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly validationMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Login Form' });
    this.username = page.getByRole('textbox', { name: 'Username' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.validationMessages = page.locator('.el-form-item__error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/login', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible' });
  }

  async fill(credentials: Credentials): Promise<void> {
    await this.username.fill(credentials.username);
    await this.password.fill(credentials.password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(credentials: Credentials): Promise<void> {
    await this.fill(credentials);
    const response = this.page.waitForResponse(
      (candidate) =>
        candidate.request().method() !== 'GET' &&
        ['xhr', 'fetch'].includes(candidate.request().resourceType()),
      { timeout: 15_000 },
    );
    await this.submit();
    await response;
  }

  async loginAndWaitForDashboard(credentials: Credentials): Promise<void> {
    await this.fill(credentials);
    await Promise.all([
      this.page.waitForURL(/#\/dashboard$/, { timeout: 20_000 }),
      this.submit(),
    ]);
  }
}
