import { expect, test } from '@playwright/test';

import config from '../../playwright.config';

test('configures all required desktop browsers', () => {
  expect(config.projects?.map((project) => project.name)).toEqual([
    'chromium',
    'firefox',
    'webkit',
  ]);
});
