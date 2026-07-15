# P0 Playwright Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a directly runnable Playwright and TypeScript P0 suite for the Suihuan management platform.

**Architecture:** Use one page object per admin area, an authenticated fixture for protected pages, and route mocks for deterministic error paths. Read-only tests run by default; mutation tests are serial, opt-in, uniquely named, and cleanup-aware.

**Tech Stack:** Node.js 24, TypeScript 5, `@playwright/test`, `dotenv`.

## Global Constraints

- Default base URL: `https://pt-test.mrstage.com`.
- Credentials come from `E2E_USERNAME` and `E2E_PASSWORD`.
- Mutations require `RUN_MUTATION_TESTS=true`.
- Projects: Chromium, Firefox, and WebKit.
- No arbitrary sleep; wait for locators, URLs, or responses.
- Failure screenshot, trace, and video are configured globally.
- The workspace is not a Git repository, so commit steps are omitted.

---

### Task 1: Project Configuration and Contract Checks

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Test: `tests/contracts/config.spec.ts`

**Interfaces:**
- Produces: Playwright projects, environment variables, artifact paths, and npm scripts.

- [ ] **Step 1: Write a failing configuration contract test**

```ts
import { expect, test } from '@playwright/test';
import config from '../../playwright.config';

test('configures all required desktop browsers', () => {
  expect(config.projects?.map(project => project.name)).toEqual([
    'chromium', 'firefox', 'webkit',
  ]);
});
```

- [ ] **Step 2: Run the contract test and verify configuration is missing**

Run: `npx playwright test tests/contracts/config.spec.ts --project=chromium`
Expected: FAIL because `playwright.config.ts` does not exist.

- [ ] **Step 3: Add package, TypeScript, Playwright, environment, and artifact configuration**

The Playwright config must set `testDir: './tests'`, three desktop projects,
`trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`,
`video: 'retain-on-failure'`, and output under `output/playwright`.

- [ ] **Step 4: Install dependencies and rerun the contract**

Run: `npm install && npx playwright test tests/contracts/config.spec.ts --project=chromium`
Expected: PASS.

### Task 2: Environment, Authentication Fixture, and Route Mocks

**Files:**
- Create: `tests/fixtures/env.ts`
- Create: `tests/fixtures/auth.fixture.ts`
- Create: `tests/fixtures/test-data.ts`
- Create: `tests/support/api-mocks.ts`
- Create: `tests/support/mutation.ts`
- Test: `tests/contracts/support.spec.ts`

**Interfaces:**
- Produces: `env`, `test`, `expect`, `uniqueName(prefix)`,
  `mockRequestFailure(page, matcher, status)`, and `requireMutationMode()`.

- [ ] **Step 1: Write failing support contract tests**

```ts
import { expect, test } from '@playwright/test';
import { uniqueName } from '../fixtures/test-data';
import { mutationEnabled } from '../support/mutation';

test('uniqueName creates isolated test data', () => {
  expect(uniqueName('pw')).not.toBe(uniqueName('pw'));
});

test('mutations are disabled by default', () => {
  expect(mutationEnabled()).toBe(false);
});
```

- [ ] **Step 2: Verify the contracts fail because support modules are missing**

Run: `npx playwright test tests/contracts/support.spec.ts --project=chromium`
Expected: FAIL with module-not-found errors.

- [ ] **Step 3: Implement environment validation, unique data, auth fixture, and scoped route mocks**

The auth fixture logs in through the UI. Missing credentials skip authenticated
tests with a clear message. The mock helper uses `page.route()` and exposes an
`unroute` cleanup function.

- [ ] **Step 4: Rerun support contracts**

Run: `npx playwright test tests/contracts/support.spec.ts --project=chromium`
Expected: PASS.

### Task 3: Login and Base Admin Page Objects

**Files:**
- Create: `pages/LoginPage.ts`
- Create: `pages/BaseAdminPage.ts`
- Test: `tests/p0/login.spec.ts`

**Interfaces:**
- Produces: `LoginPage.goto()`, `LoginPage.login()`, `LoginPage.loginButton`,
  `LoginPage.validationMessages`, `BaseAdminPage.goto(path)`, and
  `BaseAdminPage.table`.

- [ ] **Step 1: Add login tests for valid login, wrong password, required fields, session protection, and mocked server failure**

Each test contains one core assertion and uses accessible Username, Password,
and Login controls observed on the live login page.

- [ ] **Step 2: Run the login suite and verify missing page objects fail**

Run: `npx playwright test tests/p0/login.spec.ts --project=chromium`
Expected: FAIL because page objects do not exist.

- [ ] **Step 3: Implement the page objects with role-first locators and explicit URL/visibility waits**

No page-object method performs assertions. The login submission waits for either
dashboard navigation or a visible validation/error state.

- [ ] **Step 4: Run the login suite**

Run: `npx playwright test tests/p0/login.spec.ts --project=chromium`
Expected: Read-only login scenarios PASS; environment-dependent defects remain visible as test failures.

### Task 4: P0 Admin Page Objects

**Files:**
- Create: `pages/SystemUsersPage.ts`
- Create: `pages/Space1UsersPage.ts`
- Create: `pages/Space1ScenePackagesPage.ts`
- Create: `pages/P2UsersPage.ts`
- Create: `pages/P2BindingsPage.ts`
- Create: `pages/ScenesPage.ts`
- Test: `tests/contracts/pages.spec.ts`

**Interfaces:**
- Each object produces `goto()`, `openCreateDialog()`, the visible data table,
  and module-specific form or binding actions.

- [ ] **Step 1: Write a page-object construction contract**

```ts
test('all P0 page objects can be constructed', async ({ page }) => {
  expect(new SystemUsersPage(page)).toBeInstanceOf(SystemUsersPage);
  expect(new Space1UsersPage(page)).toBeInstanceOf(Space1UsersPage);
  expect(new P2UsersPage(page)).toBeInstanceOf(P2UsersPage);
  expect(new ScenesPage(page)).toBeInstanceOf(ScenesPage);
});
```

- [ ] **Step 2: Verify the contract fails because page objects are missing**

Run: `npx playwright test tests/contracts/pages.spec.ts --project=chromium`
Expected: FAIL with module-not-found errors.

- [ ] **Step 3: Implement focused page objects**

Use hash routes observed during exploration. Prefer test IDs when present, then
roles and Chinese visible names, with Element UI CSS selectors scoped to the
active dialog as the final fallback.

- [ ] **Step 4: Rerun page-object contracts and TypeScript checks**

Run: `npm run typecheck && npx playwright test tests/contracts/pages.spec.ts --project=chromium`
Expected: PASS.

### Task 5: P0 Read-Only and Opt-In Mutation Specifications

**Files:**
- Create: `tests/p0/system-users.spec.ts`
- Create: `tests/p0/space1-users.spec.ts`
- Create: `tests/p0/space1-scene-packages.spec.ts`
- Create: `tests/p0/p2-users.spec.ts`
- Create: `tests/p0/p2-bindings.spec.ts`
- Create: `tests/p0/scenes.spec.ts`

**Interfaces:**
- Consumes: authenticated fixture, page objects, mock helpers, and mutation guard.

- [ ] **Step 1: Add read-only P0 checks**

Cover protected-page access, required-field validation, password masking,
module-page availability, binding-dialog controls, and malformed/error response
handling. Each test has one core assertion.

- [ ] **Step 2: Add serial opt-in mutation checks**

Cover create, duplicate rejection, permission changes, scene/package binding,
duplicate submission, and resource upload interruption. Call `test.skip()` when
mutation mode is disabled and register cleanup immediately after data creation.

- [ ] **Step 3: Verify test discovery and default mutation skips**

Run: `npx playwright test --list`
Expected: All P0 tests are listed for Chromium, Firefox, and WebKit.

Run: `npx playwright test --project=chromium`
Expected: Mutation tests are skipped unless `RUN_MUTATION_TESTS=true`.

### Task 6: Final Multi-Browser Verification and Documentation

**Files:**
- Create: `README.md`
- Modify: test files only when verification exposes a real selector or timing defect.

**Interfaces:**
- Produces: documented install, environment, read-only, mutation, report, and trace commands.

- [ ] **Step 1: Install browser binaries**

Run: `npx playwright install chromium firefox webkit`
Expected: All browser installations complete successfully.

- [ ] **Step 2: Run static and discovery checks**

Run: `npm run typecheck && npx playwright test --list`
Expected: Both commands exit successfully.

- [ ] **Step 3: Run the default multi-browser suite**

Run: `npx playwright test`
Expected: Read-only checks execute in all projects and mutations remain skipped.

- [ ] **Step 4: Document actual results and known application defects**

README commands must include `npm install`, browser installation,
`npx playwright test`, `RUN_MUTATION_TESTS=true`, and `npx playwright show-report`.
