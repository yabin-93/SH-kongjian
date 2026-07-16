import assert from 'node:assert/strict';
import test from 'node:test';

import { p0Cases } from '../../support/case-manifest.js';

test('first batch contains exactly four unique login smoke cases', () => {
  assert.equal(p0Cases.length, 4);
  assert.equal(new Set(p0Cases.map((item) => item.id)).size, 4);
  assert.deepEqual(p0Cases.map((item) => item.id), [
    'P0-LOGIN-001',
    'P0-LOGIN-002',
    'P0-LOGIN-003',
    'P0-LOGIN-004',
  ]);
});

test('login smoke covers normal, abnormal, boundary and habit flows', () => {
  assert.deepEqual(p0Cases.map((item) => item.kind).sort(), ['abnormal', 'boundary', 'habit', 'normal']);
});

test('all first batch cases belong to smoke', () => {
  assert.ok(p0Cases.every((item) => item.suite === 'smoke'));
});
