import type { Page, Route } from '@playwright/test';

export type RouteMatcher = string | RegExp;
export type RemoveRoute = () => Promise<void>;

export const mockNextApiWriteError = async (
  page: Page,
  status = 500,
): Promise<RemoveRoute> => {
  const matcher = '**/*';
  let intercepted = false;
  const handler = async (route: Route) => {
    const request = route.request();
    const isApiWrite =
      request.method() !== 'GET' &&
      ['xhr', 'fetch'].includes(request.resourceType());

    if (intercepted || !isApiWrite) {
      await route.continue();
      return;
    }

    intercepted = true;
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ code: status, message: 'mocked server error' }),
    });
  };

  await page.route(matcher, handler);
  return () => page.unroute(matcher, handler);
};

export const mockHttpError = async (
  page: Page,
  matcher: RouteMatcher,
  status = 500,
): Promise<RemoveRoute> => {
  const handler = async (route: Route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ code: status, message: 'mocked server error' }),
    });
  };

  await page.route(matcher, handler);
  return () => page.unroute(matcher, handler);
};

export const mockNetworkFailure = async (
  page: Page,
  matcher: RouteMatcher,
): Promise<RemoveRoute> => {
  const handler = async (route: Route) => route.abort('timedout');

  await page.route(matcher, handler);
  return () => page.unroute(matcher, handler);
};

export const mockMalformedJson = async (
  page: Page,
  matcher: RouteMatcher,
): Promise<RemoveRoute> => {
  const handler = async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{invalid-json',
    });
  };

  await page.route(matcher, handler);
  return () => page.unroute(matcher, handler);
};
