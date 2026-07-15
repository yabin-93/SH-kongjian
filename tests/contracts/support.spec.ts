import { expect, test } from '@playwright/test';

import { uniqueName } from '../fixtures/test-data';
import { mutationEnabled } from '../support/mutation';

test('uniqueName creates isolated test data', () => {
  expect(uniqueName('pw')).not.toBe(uniqueName('pw'));
});

test('mutations are disabled by default', () => {
  expect(mutationEnabled()).toBe(false);
});
