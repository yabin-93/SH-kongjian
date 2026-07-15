import { randomUUID } from 'node:crypto';

export const uniqueName = (prefix: string): string =>
  `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
