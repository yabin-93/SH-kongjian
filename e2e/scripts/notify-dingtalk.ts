import {
  buildDingTalkMarkdown,
  findPlaywrightResultsFile,
  readSummaryFromResultsFile,
  sendDingTalkMarkdown,
} from '../support/dingtalk-notification.js';

const webhook = process.env.DINGTALK_WEBHOOK?.trim();

if (!webhook) {
  console.log('DINGTALK_WEBHOOK is not set; skipping DingTalk notification.');
  process.exit(0);
}

const resultsFile = await findPlaywrightResultsFile();
const summary = await readSummaryFromResultsFile(resultsFile);
const markdown = buildDingTalkMarkdown(summary, {
  baseUrl: process.env.BASE_URL,
  buildNumber: process.env.BUILD_NUMBER,
  buildResult: process.env.BUILD_RESULT ?? process.env.currentBuildResult,
  buildUrl: process.env.BUILD_URL,
  jobName: process.env.JOB_NAME,
  keyword: process.env.DINGTALK_KEYWORD,
});

await sendDingTalkMarkdown(webhook, markdown);
console.log(`DingTalk notification sent from ${resultsFile}.`);
