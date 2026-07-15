# MRStage P0 Playwright 测试

用于 MRStage 管理平台 P0 流程的 Playwright 和 TypeScript 端到端测试。

## 安装

```powershell
npm install
npx playwright install chromium firefox webkit
```

将 `.env.example` 复制为 `.env`，并设置一个专用测试账号：

```dotenv
BASE_URL=https://pt-test.mrstage.com
E2E_USERNAME=your-admin-test-account
E2E_PASSWORD=your-admin-test-password
E2E_LIMITED_USERNAME=optional-limited-role-account
E2E_LIMITED_PASSWORD=optional-limited-role-password
RUN_MUTATION_TESTS=false
```
## 运行

默认命令会运行 Chromium、Firefox 和 WebKit。会修改服务器数据的测试仍保持跳过状态。

```powershell
npx playwright test
```

常用的聚焦命令：

```powershell
npm run typecheck
npm run test:list
npm run test:chromium
npx playwright test tests/p0/login.spec.ts
```

仅在已批准的测试环境中启用变更类测试。变更类测试会串行运行、创建唯一数据，并在验证后尝试清理。

```powershell
npm run test:mutations
```

## 报告和失败产物

```powershell
npm run report
```

- HTML 报告：`output/playwright/report/index.html`
- 截图、视频和追踪文件：`output/playwright/test-results/`
- 截图：仅在失败时捕获
- 视频：失败时保留
- 追踪文件：首次重试时捕获

## 已知应用缺陷

预期失败测试记录了当前测试环境中观察到的缺陷：

- 系统用户密码以明文显示。
- 管理员创建表单中的必填账号/密码字段不会显示字段错误。

缺陷修复后，对应的预期失败测试会变成非预期通过，因此必须有意移除该标记。

## 定位器策略

页面对象优先使用 `data-testid`，其次使用可访问角色/名称和标签。当前应用暴露的测试 ID 较少，因此 Element UI 的兜底定位统一集中在 `pages/` 下，而不是在规格文件中重复编写。
