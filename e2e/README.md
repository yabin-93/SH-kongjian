# P0 Web UI E2E

这是随幻管理平台的 P0 Web UI 自动化测试工程，基于 Playwright 运行。当前第一批用例只覆盖登录冒烟：

- `P0-LOGIN-001` 正确登录
- `P0-LOGIN-002` 错误密码
- `P0-LOGIN-003` 登录必填校验
- `P0-LOGIN-004` 未登录访问受保护页面

## 项目结构

```text
e2e/
  fixtures/
    test.ts                         自定义 Playwright fixture，负责步骤截图和附件
  pages/
    login-page.ts                   登录页 Page Object
  scripts/
    notify-dingtalk.ts              钉钉通知入口
    verify-env.ts                   Jenkins/本地环境检查
  support/
    case-manifest.ts                P0 用例清单
    dingtalk-notification.ts        钉钉通知汇总、Markdown 和 Webhook 逻辑
    environment.ts                  读取账号密码环境变量
    run-context.ts                  生成运行 ID 和安全资源名
  tests/
    smoke/login.spec.ts             4 条 P0 登录冒烟用例
    unit/*.test.ts                  自动化工程内部单元测试
  Jenkinsfile                       Jenkins Pipeline
  playwright.config.ts              Playwright 配置
  package.json                      npm 脚本和依赖
  .env.example                      本地环境变量示例
```

## npm 脚本

```text
npm run clean            清理 e2e/output
npm run verify:env       检查 Node.js 和 Playwright 版本
npm run test:unit        运行自动化工程内部单元测试
npm run typecheck        TypeScript 类型检查
npm run test:list        只列出 Playwright 将执行的用例
npm run test:smoke       运行登录冒烟测试
npm run notify:dingtalk  读取测试结果并发送钉钉通知
```

`test:smoke` 会自动尝试读取本地 `.env`：

```text
node --env-file-if-exists=.env ./node_modules/@playwright/test/cli.js test --project=smoke
```

Jenkins 不需要 `.env`，账号密码和 Webhook 都由 Jenkins 凭据注入。

## 环境变量

本地和 Jenkins 都会使用这些变量：

```text
BASE_URL               测试环境地址，默认 https://pt-test.mrstage.com/
E2E_ADMIN_USERNAME     后台管理员账号
E2E_ADMIN_PASSWORD     后台管理员密码
E2E_RUN_ID             输出目录运行 ID，Jenkins 中为 JOB_NAME-BUILD_NUMBER
DINGTALK_WEBHOOK       钉钉机器人 Webhook，由 Jenkins Secret Text 注入
DINGTALK_KEYWORD       钉钉关键词，当前为 自动化测试
BUILD_URL              Jenkins 构建链接，用于拼 Allure 和日志链接
BUILD_NUMBER           Jenkins 构建号
JOB_NAME               Jenkins Job 名称
BUILD_RESULT           Jenkins 当前构建结果
```

`.env.example` 里还预留了后续扩展变量：

```text
E2E_LIMITED_USERNAME
E2E_LIMITED_PASSWORD
E2E_CLEANUP_TOKEN
```

当前第一批登录冒烟没有使用这些变量。

## 本地运行

要求 Node.js `24.17.0`。首次运行先安装依赖和浏览器：

```powershell
cd e2e
npm ci
npx playwright install chromium
```

本地真实执行 smoke 前，复制示例环境变量：

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env` 至少需要配置：

```env
BASE_URL=https://pt-test.mrstage.com/
E2E_ADMIN_USERNAME=测试环境后台管理员账号
E2E_ADMIN_PASSWORD=测试环境后台管理员密码
```

运行 smoke：

```powershell
npm run test:smoke
```

调试时如果想看到浏览器窗口：

```powershell
npm run test:smoke -- --headed --slow-mo=500
```

静态检查不需要账号，也不会访问测试环境：

```powershell
npm run test:unit
npm run typecheck
npm run test:list
```

本地查看 Allure：

```powershell
npx allure generate output/allure-results --clean -o output/allure-report
npx allure open output/allure-report
```

## Playwright 配置

配置文件：

```text
e2e/playwright.config.ts
```

关键设置：

```text
testDir: ./tests
testIgnore: **/unit/**
project: smoke
browser: Desktop Chrome
workers: 1
retries: CI 中 1 次，本地 0 次
timeout: 30s
expect timeout: 8s
```

输出目录按运行 ID 隔离：

```text
output/test-results/<runId>
output/html/<runId>
output/results/<runId>
output/allure-results
```

报告类型：

```text
list
html
junit
json
allure-playwright
```

失败时保留：

```text
screenshot
trace.zip
video.webm
error-context.md
```

每条用例结束后也会保存最终截图附件。

## Jenkins 配置

Jenkins Job 使用 `e2e/Jenkinsfile`。建议 Job 名称：

```text
p0-e2e-smoke
```

Pipeline 配置：

```text
Definition: Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/yabin-93/SH-kongjian.git
Branch: */master
Script Path: e2e/Jenkinsfile
```

Jenkins 全局 URL 必须配置成其他电脑可访问的地址，例如：

```text
http://192.168.10.48:8080/
```

不要使用：

```text
http://localhost:8080/
http://127.0.0.1:8080/
```

否则钉钉里的 Allure 链接只能 Jenkins 本机打开。

## Jenkins 插件

需要安装或确认已有：

```text
Git plugin
Pipeline
Credentials Binding
NodeJS Plugin
JUnit
Allure Jenkins Plugin
```

## Jenkins 工具

进入：

```text
Manage Jenkins -> Tools
```

配置 NodeJS：

```text
Name: nodejs-24.17.0
Version: NodeJS 24.17.0
```

配置 Allure Commandline：

```text
Name: allure
Install automatically: 勾选
Version: 选择 Jenkins 页面可用的稳定 2.x 版本
```

工具名称必须和 `Jenkinsfile` 一致。

## Jenkins 凭据

进入：

```text
Manage Jenkins -> Credentials -> System -> Global credentials
```

添加后台管理员账号：

```text
Kind: Username with password
Scope: Global
Username: 测试环境后台管理员账号
Password: 测试环境后台管理员密码
ID: mrstage-e2e-admin
Description: MrStage E2E admin account
```

添加钉钉机器人 Webhook：

```text
Kind: Secret text
Scope: Global
Secret: 钉钉机器人 Webhook 地址
ID: dingtalk-webhook
Description: DingTalk robot webhook
```

钉钉机器人安全设置建议使用关键词：

```text
自动化测试
```

如果机器人开启了加签，需要关闭加签，或扩展脚本支持 `timestamp + sign`。

## Jenkins 运行流程

流水线阶段：

```text
Checkout
Install
Static checks
P0 smoke
Post Actions
```

`Install` 会执行：

```text
npm run clean
npm ci
npm run verify:env
npx playwright install chromium
```

`Static checks` 会执行：

```text
npm run test:unit
npm run typecheck
npm run test:list
```

`P0 smoke` 会执行：

```text
npm run test:smoke
```

`Post Actions` 会执行：

```text
发布 JUnit 测试结果
发布 Allure Report
发送钉钉通知
归档 e2e/output/**
```

## 报告和产物

进入 Jenkins 构建号页面，例如：

```text
p0-e2e-smoke #16
```

查看 JUnit 结果：

```text
Test Result
```

查看 Allure 报告：

```text
Allure Report
```

直接访问示例：

```text
http://192.168.10.48:8080/job/p0-e2e-smoke/16/allure/
```

查看归档产物：

```text
Build Artifacts
```

重点目录：

```text
e2e/output/html/
e2e/output/results/
e2e/output/test-results/
e2e/output/allure-results/
```

失败时通常会有：

```text
test-failed-1.png
trace.zip
video.webm
error-context.md
```

## 钉钉通知

构建结束后会发送 Markdown 消息到钉钉群，内容包括：

```text
项目名
构建号
测试环境
构建状态
总数、通过、失败、不稳定、跳过
耗时
Allure Report 链接
构建日志链接
```

通知数据来自：

```text
e2e/output/results/<runId>/results.json
```

通知脚本：

```text
e2e/scripts/notify-dingtalk.ts
```

如果没有收到通知，先看 Jenkins `Console Output`，搜索：

```text
notify:dingtalk
DingTalk
DINGTALK_WEBHOOK
```

常见原因：

- `dingtalk-webhook` 凭据 ID 不正确
- 钉钉机器人关键词不包含 `自动化测试`
- 钉钉机器人开启了加签，但脚本没有配置签名
- Jenkins 机器无法访问钉钉 Webhook

## 常见问题

### Missing required environment variable: E2E_ADMIN_USERNAME

Jenkins 中 `mrstage-e2e-admin` 凭据不存在，或 ID 写错。

### Allure Report 其他电脑打不开

检查 Jenkins URL 是否是内网可访问地址，例如：

```text
http://192.168.10.48:8080/
```

同时检查 Windows 防火墙是否放行 `8080` 端口。

### Finished: UNSTABLE

优先查看 `Test Result` 是否有失败用例。若测试全通过但仍是 `UNSTABLE`，检查是否有旧的 JUnit 报告被归档；当前 Jenkinsfile 已在 `Install` 阶段清理 `e2e/output`。

### Jenkins 看不到浏览器窗口

Jenkins 使用 headless 浏览器运行，且通常运行在后台服务账号下。需要看窗口时请在本地运行：

```powershell
npm run test:smoke -- --headed --slow-mo=500
```

### 钉钉发送签名不匹配

钉钉机器人开启了加签，但脚本当前按关键词模式发送。处理方式：

```text
关闭机器人加签，只保留关键词 自动化测试
```

或者扩展脚本支持加签参数。
