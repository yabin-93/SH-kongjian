const SAFE_SEGMENT = /[^a-z0-9]+/g;

export function sanitizeSegment(value: string | undefined, maxLength = 48): string {
  const normalized = (value ?? '')
    .toLowerCase()
    .replace(SAFE_SEGMENT, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');

  return normalized || 'unknown';
}

export function resolveRunId(env: NodeJS.ProcessEnv = process.env): string {
  if (env.E2E_RUN_ID) {
    return sanitizeSegment(env.E2E_RUN_ID, 64);
  }

  const job = sanitizeSegment(env.JOB_NAME ?? 'local', 48);
  const build = sanitizeSegment(env.BUILD_NUMBER ?? `${Date.now()}`, 16);
  return `${job}-${build}`;
}

export function buildResourceName(runId: string, caseId: string, nonce: string): string {
  return `e2e-${sanitizeSegment(runId)}-${sanitizeSegment(caseId)}-${sanitizeSegment(nonce, 16)}`;
}
