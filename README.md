# SH-kongjian

随幻管理平台 P0 Web UI E2E 自动化测试项目。

测试工程独立位于 [`e2e/`](e2e/README.md)。运行命令前必须先进入该目录：

```powershell
cd e2e
npm ci
npm run test:smoke
```

当前第一批包含 4 条登录冒烟用例。Jenkins、环境变量和测试报告说明见 [`e2e/README.md`](e2e/README.md)。
