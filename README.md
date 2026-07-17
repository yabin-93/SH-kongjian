# SH-kongjian

随幻管理平台 P0 Web UI 自动化测试项目。

## 目录

```text
e2e/                         Playwright 自动化测试工程
```

当前仓库主流程在 [`e2e/`](e2e/README.md) 下维护。

## 本地快速运行

```powershell
cd e2e
npm ci
Copy-Item .env.example .env
notepad .env
npm run test:smoke
```

静态检查：

```powershell
npm run test:unit
npm run typecheck
npm run test:list
```

## CI 能力

Jenkins Pipeline 已支持：

```text
Playwright smoke
JUnit 测试结果
Allure Report
失败截图、视频、trace
钉钉通知
```

Jenkins、凭据、Allure 报告、钉钉通知和常见问题说明见 [`e2e/README.md`](e2e/README.md)。
