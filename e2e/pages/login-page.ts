import type { Locator, Page } from '@playwright/test';

import type { Credentials } from '../support/environment.js';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page
      .getByTestId('p0-login-username')
      .or(page.getByRole('textbox', { name: 'Username' }));
    this.passwordInput = page
      .getByTestId('p0-login-password')
      .or(page.getByRole('textbox', { name: 'Password' }));
    this.submitButton = page
      .getByTestId('p0-login-submit')
      .or(page.getByRole('button', { name: 'Login' }));
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/login');
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.submit();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
