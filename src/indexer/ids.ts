import { createHash } from 'crypto';
import { BRANCH } from '../config/index.js';

export function generateFileId(owner: string, repo: string, path: string): string {
  return `gh:${owner}/${repo}:${BRANCH}:${path}`;
}

export function generateChunkId(
  fileId: string,
  startLine: number,
  endLine: number,
  contentHash: string
): string {
  const shortHash = contentHash.slice(0, 8);
  return `${fileId}#L${startLine}-L${endLine}:${shortHash}`;
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
