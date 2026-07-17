import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDingTalkMarkdown, summarizePlaywrightReport } from '../../support/dingtalk-notification.js';

const keyword = '\u81ea\u52a8\u5316\u6d4b\u8bd5';

test('summarizePlaywrightReport converts Playwright stats into notification totals', () => {
  const summary = summarizePlaywrightReport({
    stats: {
      expected: 4,
      unexpected: 1,
      flaky: 1,
      skipped: 2,
      duration: 65_400,
    },
  });

  assert.deepEqual(summary, {
    total: 8,
    passed: 4,
    failed: 1,
    flaky: 1,
    skipped: 2,
    durationText: '1m 5s',
  });
});

test('buildDingTalkMarkdown includes keyword, result counts and Jenkins links', () => {
  const markdown = buildDingTalkMarkdown(
    {
      total: 4,
      passed: 4,
      failed: 0,
      flaky: 0,
      skipped: 0,
      durationText: '27s',
    },
    {
      baseUrl: 'https://pt-test.mrstage.com/',
      buildNumber: '12',
      buildResult: 'SUCCESS',
      buildUrl: 'https://jenkins.example/job/p0-e2e-smoke/12/',
      jobName: 'p0-e2e-smoke',
      keyword,
    },
  );

  assert.equal(markdown.title, `${keyword}\u7ed3\u679c\u901a\u77e5`);
  assert.match(markdown.text, new RegExp(`### ${keyword}\u7ed3\u679c\u901a\u77e5`));
  assert.match(markdown.text, /- \u603b\u6570: 4/);
  assert.match(markdown.text, /- \u901a\u8fc7: 4/);
  assert.match(markdown.text, /Allure Report/);
  assert.match(markdown.text, /https:\/\/jenkins\.example\/job\/p0-e2e-smoke\/12\/allure\//);
  assert.match(markdown.text, /https:\/\/jenkins\.example\/job\/p0-e2e-smoke\/12\/console/);
});
