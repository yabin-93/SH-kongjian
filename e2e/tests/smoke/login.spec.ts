import { expect, test } from '../../fixtures/test.js';
import { LoginPage } from '../../pages/login-page.js';
import { getAdminCredentials } from '../../support/environment.js';

test.describe('P0 登录冒烟', () => {
  test('P0-LOGIN-001 正确登录', async ({ page, evidence }) => {
    const login = new LoginPage(page);
    const credentials = getAdminCredentials();

    await evidence.step('打开登录页并提交正确凭据', async () => {
      await login.goto();
      await login.login(credentials);
    });

    await evidence.step('验证已进入后台首页', async () => {
      await expect(page).toHaveURL(/#\/dashboard$/);
      await expect(page.getByText('欢迎使用后台管理系统', { exact: true })).toBeVisible();
    });
  });

  test('P0-LOGIN-002 错误密码', async ({ page, evidence }) => {
    const login = new LoginPage(page);
    const { username, password } = getAdminCredentials();

    await evidence.step('提交错误密码', async () => {
      await login.goto();
      await login.login({ username, password: `${password}-wrong` });
    });

    await evidence.step('验证错误密码提示', async () => {
      await expect(page).toHaveURL(/#\/login(?:\?|$)/);
      await expect(page.getByRole('alert')).toContainText('密码错误');
    });
  });

  test('P0-LOGIN-003 登录输入边界校验', async ({ page, evidence }) => {
    const login = new LoginPage(page);
    const { password } = getAdminCredentials();

    await evidence.step('空账号和空密码提交', async () => {
      await login.goto();
      await login.submit();
    });

    await evidence.step('验证两个必填提示', async () => {
      await expect(page.getByText('请输入用户名称', { exact: true })).toBeVisible();
      await expect(page.getByText('密码不能为空', { exact: true })).toBeVisible();
      await expect(page).toHaveURL(/#\/login(?:\?|$)/);
    });

    const invalidCredentials = [
      { label: '最短账号', username: 'x' },
      { label: '超长账号', username: 'x'.repeat(256) },
      { label: '特殊符号账号', username: '!@#$%^&*()_+=' },
    ];

    for (const { label, username } of invalidCredentials) {
      await evidence.step(`${label}被完整提交但不能建立登录态`, async () => {
        await login.goto();
        // Element UI messages outlive same-route navigation; reload isolates each boundary submission.
        await page.reload();
        await expect(page.getByRole('alert')).toHaveCount(0);
        await login.usernameInput.fill(username);
        await login.passwordInput.fill(password);
        await expect(login.usernameInput).toHaveValue(username);

        const loginResponsePromise = page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' &&
            new URL(response.url()).pathname.endsWith('/api/login'),
        );
        await login.submit();
        const loginResponse = await loginResponsePromise;
        const requestBody = loginResponse.request().postDataJSON() as { username?: unknown };

        expect(requestBody.username).toBe(username);
        expect(loginResponse.ok()).toBe(false);
        await expect(page).toHaveURL(/#\/login(?:\?|$)/);
        await expect(page.getByRole('alert')).toHaveText(/密码错误|用户不存在/);
        expect(await page.context().cookies()).toHaveLength(0);
        expect(
          await page.evaluate(() => ({
            localStorage: localStorage.length,
            sessionStorage: sessionStorage.length,
          })),
        ).toEqual({ localStorage: 0, sessionStorage: 0 });
        await expect(login.submitButton).toBeEnabled();
      });
    }
  });

  test('P0-LOGIN-004 登录态失效后访问受保护页面', async ({ page, evidence }) => {
    const login = new LoginPage(page);
    const credentials = getAdminCredentials();

    await evidence.step('先使用有效会话进入后台', async () => {
      await login.goto();
      await login.login(credentials);

      await expect(page).toHaveURL(/#\/dashboard$/);
    });

    await evidence.step('清除浏览器会话后直接访问场景列表', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.goto('/#/scene/list');
    });

    await evidence.step('验证跳转登录页并保留原路由', async () => {
      await expect(page).toHaveURL(/#\/login\?redirect=%2Fscene%2Flist$/);
      await expect(login.submitButton).toBeVisible();
    });
  });
});
