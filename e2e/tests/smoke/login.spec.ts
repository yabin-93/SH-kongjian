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

  test('P0-LOGIN-003 登录必填校验', async ({ page, evidence }) => {
    const login = new LoginPage(page);

    await evidence.step('空账号和空密码提交', async () => {
      await login.goto();
      await login.submit();
    });

    await evidence.step('验证两个必填提示', async () => {
      await expect(page.getByText('请输入用户名称', { exact: true })).toBeVisible();
      await expect(page.getByText('密码不能为空', { exact: true })).toBeVisible();
      await expect(page).toHaveURL(/#\/login(?:\?|$)/);
    });
  });

  test('P0-LOGIN-004 未登录访问受保护页面', async ({ page, evidence }) => {
    const login = new LoginPage(page);

    await evidence.step('直接访问场景列表', async () => {
      await page.goto('/#/scene/list');
    });

    await evidence.step('验证跳转登录页并保留原路由', async () => {
      await expect(page).toHaveURL(/#\/login\?redirect=%2Fscene%2Flist$/);
      await expect(login.submitButton).toBeVisible();
    });
  });
});
