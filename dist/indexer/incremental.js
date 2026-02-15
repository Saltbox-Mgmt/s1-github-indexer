import { BRANCH } from '../config/index.js';
import { checkExclusion } from '../config/exclusions.js';
import { isRepoAllowed } from '../config/repos.js';
import { getChangedFiles } from '../github/compare.js';
import { getBlobContent } from '../github/blobs.js';
import { getOctokit } from '../github/client.js';
import { isBinaryContent } from '../utils/binary-detect.js';
import { detectLanguage } from '../utils/language.js';
import { generateFileId, generateChunkId, hashContent } from './ids.js';
import { chunkContent } from './chunker.js';
import { upsertFile, upsertChunks, deleteFileAndChunks, deleteChunksForFile, } from '../elastic/operations.js';
import { getRepoState, updateRepoState, setRepoState, isDeliveryProcessed, markDeliveryProcessed, } from '../state/repo-state.js';
export async function handlePushWebhook(payload, deliveryId) {
    const owner = payload.repository.owner.login || payload.repository.owner.name || '';
    const repo = payload.repository.name;
    const result = {
        owner,
        repo,
        processed: false,
        filesAdded: 0,
        filesModified: 0,
        filesDeleted: 0,
        chunksIndexed: 0,
        errors: [],
    };
    // Check idempotency
    if (isDeliveryProcessed(deliveryId)) {
        result.reason = 'duplicate_delivery';
        return result;
    }
    // Check branch
    if (payload.ref !== `refs/heads/${BRANCH}`) {
        result.reason = `wrong_branch:${payload.ref}`;
        return result;
    }
    // Check allowlist
    if (!isRepoAllowed(owner, repo)) {
        result.reason = 'not_in_allowlist';
        return result;
    }
    markDeliveryProcessed(deliveryId);
    // Initialize state if needed
    const existingState = getRepoState(owner, repo, BRANCH);
    if (!existingState) {
        setRepoState({
            owner,
            repo,
            branch: BRANCH,
            lastIndexedCommitSha: payload.before,
            lastIndexedAt: new Date().toISOString(),
            status: 'idle',
        });
    }
    updateRepoState(owner, repo, BRANCH, { status: 'indexing' });
    try {
        const changedFiles = await getChangedFiles(owner, repo, payload.before, payload.after);
        for (const file of changedFiles) {
            try {
                if (file.status === 'removed') {
                    const fileId = generateFileId(owner, repo, file.path);
                    await deleteFileAndChunks(fileId);
                    result.filesDeleted++;
                    continue;
                }
                if (file.status === 'renamed' && file.previousPath) {
                    const oldFileId = generateFileId(owner, repo, file.previousPath);
                    await deleteFileAndChunks(oldFileId);
                }
                // For added, modified, renamed - index the new content
                const octokit = await getOctokit();
                const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                    owner,
                    repo,
                    path: file.path,
                    ref: payload.after,
                });
                if (Array.isArray(fileData) || fileData.type !== 'file') {
                    continue;
                }
                const sizeBytes = fileData.size;
                const exclusion = checkExclusion(file.path, sizeBytes);
                if (exclusion.excluded) {
                    continue;
                }
                const content = await getBlobContent(owner, repo, fileData.sha);
                if (!content || isBinaryContent(content)) {
                    continue;
                }
                const fileId = generateFileId(owner, repo, file.path);
                const language = detectLanguage(file.path);
                const indexedAt = new Date().toISOString();
                const fileDoc = {
                    provider: 'github',
                    owner,
                    repo,
                    branch: BRANCH,
                    path: file.path,
                    sha: fileData.sha,
                    commitSha: payload.after,
                    language,
                    sizeBytes,
                    isBinary: false,
                    indexedAt,
                    repoUrl: `https://github.com/${owner}/${repo}`,
                    fileUrl: `https://github.com/${owner}/${repo}/blob/${fileData.sha}/${file.path}`,
                };
                await upsertFile(fileId, fileDoc);
                await deleteChunksForFile(fileId);
                const chunks = chunkContent(content);
                const chunkDocs = chunks.map((chunk, index) => {
                    const contentHash = hashContent(chunk.content);
                    const chunkId = generateChunkId(fileId, chunk.startLine, chunk.endLine, contentHash);
                    return {
                        id: chunkId,
                        doc: {
                            provider: 'github',
                            owner,
                            repo,
                            branch: BRANCH,
                            path: file.path,
                            sha: fileData.sha,
                            chunkIndex: index,
                            startLine: chunk.startLine,
                            endLine: chunk.endLine,
                            language,
                            content: chunk.content,
                            contentHash,
                            indexedAt,
                            fileId,
                        },
                    };
                });
                await upsertChunks(chunkDocs);
                result.chunksIndexed += chunkDocs.length;
                if (file.status === 'added')
                    result.filesAdded++;
                else
                    result.filesModified++;
            }
            catch (err) {
                result.errors.push(`${file.path}: ${err}`);
            }
        }
        result.processed = true;
        updateRepoState(owner, repo, BRANCH, {
            lastIndexedCommitSha: payload.after,
            lastIndexedAt: new Date().toISOString(),
            status: 'idle',
        });
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(errorMsg);
        updateRepoState(owner, repo, BRANCH, {
            status: 'error',
            error: errorMsg,
        });
    }
    return result;
}
