# P0 Playwright Automation Design

## Goal

Build a maintainable Playwright and TypeScript test suite for the confirmed P0
scenarios of the Suihuan management platform. The suite must run with
`npx playwright test`, use Page Object Model boundaries, support Chromium,
Firefox, and WebKit, and retain failure artifacts.

## Scope

The P0 suite covers:

- Login and session behavior
- System users and role-based access control
- Suihuan Space 1.0 user management
- Suihuan Space 1.0 scene packages and bindings
- P2 user management
- P2 scene and scene-package bindings
- Scene records and resources

Registration is excluded because no registration entry was observed. Payment
and SMS mocks are excluded because no such P0 flow was observed. Network error,
timeout, and malformed-response scenarios use Playwright route interception.

## Execution Modes

The default command runs read-only and mocked P0 checks against the test site.
Tests that create, update, bind, or delete server data are skipped unless
`RUN_MUTATION_TESTS=true` is set.

Mutation tests generate run-unique data. Each mutation test owns its data and
attempts cleanup in teardown. Cleanup failures are reported and never hidden.
Mutation tests run serially to avoid cross-browser and cross-worker collisions.

## Project Structure

```text
pages/
  BaseAdminPage.ts
  LoginPage.ts
  SystemUsersPage.ts
  Space1UsersPage.ts
  Space1ScenePackagesPage.ts
  P2UsersPage.ts
  P2BindingsPage.ts
  ScenesPage.ts
tests/
  fixtures/
    auth.fixture.ts
    env.ts
    test-data.ts
  support/
    api-mocks.ts
    mutation.ts
  p0/
    login.spec.ts
    system-users.spec.ts
    space1-users.spec.ts
    space1-scene-packages.spec.ts
    p2-users.spec.ts
    p2-bindings.spec.ts
    scenes.spec.ts
playwright.config.ts
package.json
tsconfig.json
.env.example
```

## Page Objects and Locators

Page objects expose business actions and stable state locators. Assertions stay
in specifications so each test has one visible core verification point.

Locator priority is:

1. `data-testid`
2. Accessible role and name
3. Associated label
4. Placeholder
5. A narrowly scoped CSS fallback

The current site does not consistently expose `data-testid`, so fallback
selectors are centralized in page objects. No test uses arbitrary sleep. Actions
wait for visible controls, URL changes, table state, or matching responses.

## Authentication and Configuration

The base URL defaults to `https://pt-test.mrstage.com`. Credentials come from
`E2E_USERNAME` and `E2E_PASSWORD`; credentials are not committed. An authenticated
fixture signs in through the UI and is reused by protected-page tests.

Tests that require a non-admin account are skipped with an explicit reason when
`E2E_LIMITED_USERNAME` and `E2E_LIMITED_PASSWORD` are absent.

## Network Simulation

`page.route()` is used only for deterministic error-path coverage:

- Login HTTP 500
- Login timeout or aborted request
- Malformed login response
- Mutation save timeout or HTTP failure

Routes are scoped to the matching test and removed afterward. Real happy-path
requests are not mocked.

## Browser and Artifact Policy

Projects target Chromium, Firefox, and WebKit desktop profiles. Configuration
uses failure screenshots, trace on first retry, retained failure video, HTML and
line reporters, and an `output/playwright` artifact root.

CI uses retries and one worker. Local read-only tests may run in parallel.
Mutation suites are serial and opt-in.

## Verification

Completion requires:

- Dependencies install successfully
- TypeScript compilation succeeds
- `npx playwright test --list` discovers all expected P0 tests in all projects
- Default `npx playwright test` does not mutate server data
- Available read-only tests execute against the configured test environment
- Mutation tests are visibly skipped unless explicitly enabled
