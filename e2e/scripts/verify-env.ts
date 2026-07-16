import { readFile } from 'node:fs/promises';

const expectedNode = '24.17.0';
const expectedPlaywright = '1.61.1';
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
  devDependencies?: Record<string, string>;
};

const problems: string[] = [];

if (process.versions.node !== expectedNode) {
  problems.push(`Node.js must be ${expectedNode}; current version is ${process.versions.node}`);
}

if (packageJson.devDependencies?.['@playwright/test'] !== expectedPlaywright) {
  problems.push(`@playwright/test must be pinned to ${expectedPlaywright}`);
}

if (problems.length > 0) {
  throw new Error(`E2E environment check failed:\n- ${problems.join('\n- ')}`);
}

console.log(`Environment verified: Node.js ${expectedNode}, Playwright ${expectedPlaywright}`);
