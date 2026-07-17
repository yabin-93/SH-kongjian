import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { resolveRunId } from './run-context.js';

const DEFAULT_KEYWORD = '\u81ea\u52a8\u5316\u6d4b\u8bd5';
const RESULT_NOTICE = '\u7ed3\u679c\u901a\u77e5';
const LABEL_PROJECT = '\u9879\u76ee';
const LABEL_BUILD = '\u6784\u5efa';
const LABEL_ENVIRONMENT = '\u73af\u5883';
const LABEL_STATUS = '\u72b6\u6001';
const LABEL_TOTAL = '\u603b\u6570';
const LABEL_PASSED = '\u901a\u8fc7';
const LABEL_FAILED = '\u5931\u8d25';
const LABEL_FLAKY = '\u4e0d\u7a33\u5b9a';
const LABEL_SKIPPED = '\u8df3\u8fc7';
const LABEL_DURATION = '\u8017\u65f6';
const LABEL_BUILD_LOG = '\u6784\u5efa\u65e5\u5fd7';

interface PlaywrightStats {
  expected?: number;
  unexpected?: number;
  flaky?: number;
  skipped?: number;
  duration?: number;
}

interface PlaywrightReport {
  stats?: PlaywrightStats;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  durationText: string;
}

export interface NotificationContext {
  baseUrl?: string;
  buildNumber?: string;
  buildResult?: string;
  buildUrl?: string;
  jobName?: string;
  keyword?: string;
}

function formatDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return '0s';

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function summarizePlaywrightReport(report: PlaywrightReport): TestSummary {
  const stats = report.stats ?? {};
  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const flaky = stats.flaky ?? 0;
  const skipped = stats.skipped ?? 0;

  return {
    total: passed + failed + flaky + skipped,
    passed,
    failed,
    flaky,
    skipped,
    durationText: formatDuration(stats.duration ?? 0),
  };
}

export function buildDingTalkMarkdown(summary: TestSummary, context: NotificationContext): {
  title: string;
  text: string;
} {
  const keyword = context.keyword?.trim() || DEFAULT_KEYWORD;
  const status = context.buildResult?.trim() || (summary.failed > 0 ? 'FAILURE' : 'SUCCESS');
  const jobName = context.jobName?.trim() || 'p0-e2e-smoke';
  const buildNumber = context.buildNumber?.trim() || '-';
  const baseUrl = context.baseUrl?.trim() || 'https://pt-test.mrstage.com/';
  const buildUrl = context.buildUrl?.trim();
  const allureUrl = buildUrl ? `${buildUrl.replace(/\/$/, '')}/allure/` : '';
  const title = `${keyword}${RESULT_NOTICE}`;

  const lines = [
    `### ${title}`,
    '',
    `- ${LABEL_PROJECT}: ${jobName}`,
    `- ${LABEL_BUILD}: #${buildNumber}`,
    `- ${LABEL_ENVIRONMENT}: ${baseUrl}`,
    `- ${LABEL_STATUS}: ${status}`,
    `- ${LABEL_TOTAL}: ${summary.total}`,
    `- ${LABEL_PASSED}: ${summary.passed}`,
    `- ${LABEL_FAILED}: ${summary.failed}`,
    `- ${LABEL_FLAKY}: ${summary.flaky}`,
    `- ${LABEL_SKIPPED}: ${summary.skipped}`,
    `- ${LABEL_DURATION}: ${summary.durationText}`,
  ];

  if (allureUrl) lines.push('', `[Allure Report](${allureUrl})`);
  if (buildUrl) lines.push(`[${LABEL_BUILD_LOG}](${buildUrl}console)`);

  return {
    title,
    text: lines.join('\n'),
  };
}

async function newestJsonFile(folder: string): Promise<string | undefined> {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map(async (entry) => join(folder, entry.name)),
  );

  return files.sort().at(-1);
}

export async function findPlaywrightResultsFile(
  outputRoot = 'output/results',
  env: NodeJS.ProcessEnv = process.env,
): Promise<string> {
  const runId = resolveRunId(env);
  const runResults = join(outputRoot, runId, 'results.json');

  try {
    await readFile(runResults, 'utf8');
    return runResults;
  } catch {
    // Fall back to the newest run folder. This keeps local usage ergonomic.
  }

  const entries = await readdir(outputRoot, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().reverse();

  for (const folder of folders) {
    const candidate = await newestJsonFile(join(outputRoot, folder));
    if (candidate) return candidate;
  }

  throw new Error(`No Playwright JSON result found under ${outputRoot}`);
}

export async function readSummaryFromResultsFile(path: string): Promise<TestSummary> {
  const report = JSON.parse(await readFile(path, 'utf8')) as PlaywrightReport;
  return summarizePlaywrightReport(report);
}

export async function sendDingTalkMarkdown(webhook: string, markdown: { title: string; text: string }): Promise<void> {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`DingTalk webhook failed with HTTP ${response.status}: ${responseText}`);
  }

  let result: { errcode?: number; errmsg?: string };
  try {
    result = JSON.parse(responseText) as { errcode?: number; errmsg?: string };
  } catch {
    throw new Error(`DingTalk webhook returned non-JSON response: ${responseText}`);
  }

  if (result.errcode !== 0) {
    throw new Error(`DingTalk webhook rejected message: ${result.errmsg ?? responseText}`);
  }
}
