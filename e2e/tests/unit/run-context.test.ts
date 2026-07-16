import assert from 'node:assert/strict';
import test from 'node:test';

import { buildResourceName, resolveRunId, sanitizeSegment } from '../../support/run-context.js';

test('resolveRunId combines Jenkins job and build when explicit id is absent', () => {
  assert.equal(resolveRunId({ JOB_NAME: 'deploy/test', BUILD_NUMBER: '42' }), 'deploy-test-42');
});

test('resolveRunId prefers an explicit id and sanitizes unsafe characters', () => {
  assert.equal(resolveRunId({ E2E_RUN_ID: 'Release #42 / P0' }), 'release-42-p0');
});

test('sanitizeSegment returns a bounded safe fallback', () => {
  assert.equal(sanitizeSegment('***', 10), 'unknown');
  assert.equal(sanitizeSegment('A'.repeat(100), 8), 'aaaaaaaa');
});

test('buildResourceName creates a traceable e2e name', () => {
  assert.equal(buildResourceName('job-42', 'P0-SCENE-001', 'abc'), 'e2e-job-42-p0-scene-001-abc');
});
