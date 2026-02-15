import { createHash } from 'crypto';
import { BRANCH } from '../config/index.js';
export function generateFileId(owner, repo, path) {
    return `gh:${owner}/${repo}:${BRANCH}:${path}`;
}
export function generateChunkId(fileId, startLine, endLine, contentHash) {
    const shortHash = contentHash.slice(0, 8);
    return `${fileId}#L${startLine}-L${endLine}:${shortHash}`;
}
export function hashContent(content) {
    return createHash('sha256').update(content).digest('hex');
}
