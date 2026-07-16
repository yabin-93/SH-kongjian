# P0 Web UI E2E

这是从零建立的 Playwright 测试工程。第一批只包含 4 条稳定、只读的登录冒烟用例：

- `P0-LOGIN-001` 正确登录
- `P0-LOGIN-002` 错误密码
- `P0-LOGIN-003` 登录必填校验
- `P0-LOGIN-004` 未登录访问受保护页面

## 本地运行

要求 Node.js `24.17.0`。安装依赖和 Chrome for Testing：

```powershell
cd e2e
npm ci
npx playwright install chromium
```

设置专用测试账号并运行：

```powershell
$env:E2E_ADMIN_USERNAME='专用管理员账号'
$env:E2E_ADMIN_PASSWORD='专用管理员密码'
$env:BASE_URL='https://pt-test.mrstage.com/'
npm run test:smoke
```

静态检查不需要账号，也不会访问测试环境：

```powershell
npm run test:unit
npm run typecheck
npm run test:list
```

## Jenkins

Jenkins Job 使用 `e2e/Jenkinsfile`，Windows 节点标签为 `windows-playwright`，NodeJS 工具名称为 `nodejs-24.17.0`，账号凭据 ID 为 `mrstage-e2e-admin`。

部署任务成功后同步调用 smoke Job，并把部署地址传给 `BASE_URL`：

```groovy
build job: 'p0-e2e-smoke', wait: true, propagate: true,
  parameters: [string(name: 'BASE_URL', value: env.TEST_BASE_URL)]
```

Job 也支持手动触发，并在每天 `02:00`（Asia/Shanghai）附近分散执行一次。测试失败、不稳定重试或超时都会使构建失败。

## 证据和定位

每条用例都会保存最终全页截图。失败时还会保存 Playwright 默认失败截图、失败步骤截图、错误文本、视频和 trace。JUnit、HTML、JSON 结果统一写入 `e2e/output/` 并由 Jenkins 保存 30 天。

登录控件优先使用以下稳定属性，当前站点未提供时自动使用已确认的可访问角色定位：

- `data-testid="p0-login-username"`
- `data-testid="p0-login-password"`
- `data-testid="p0-login-submit"`

其余 32 条 P0、受限账号权限、写入数据清理接口、regression 和 mutations 套件不属于第一批范围，后续按模块增量加入。
