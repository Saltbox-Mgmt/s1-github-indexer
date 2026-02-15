import { checkExclusion } from '../config/exclusions.js';
import { getRepoConfig } from '../config/repos.js';
import { getTreeFiles } from '../github/tree.js';
import { getBlobContent } from '../github/blobs.js';
import { isBinaryContent } from '../utils/binary-detect.js';
import { detectLanguage } from '../utils/language.js';
import { generateFileId, generateChunkId, hashContent } from './ids.js';
import { chunkContent } from './chunker.js';
import { upsertFile, upsertChunks, deleteFileAndChunks, deleteChunksForFile, getExistingFileIds, } from '../elastic/operations.js';
import { setRepoState, updateRepoState } from '../state/repo-state.js';
export async function backfillRepo(owner, repo) {
    const result = {
        owner,
        repo,
        branch: '',
        filesProcessed: 0,
        filesSkipped: 0,
        chunksIndexed: 0,
        filesDeleted: 0,
        errors: [],
    };
    try {
        const repoConfig = getRepoConfig(owner, repo);
        const { files: treeFiles, commitSha, branch } = await getTreeFiles(owner, repo, repoConfig?.branch);
        result.branch = branch;
        setRepoState({
            owner,
            repo,
            branch,
            lastIndexedCommitSha: '',
            lastIndexedAt: new Date().toISOString(),
            status: 'indexing',
        });
        const existingFileIds = await getExistingFileIds(owner, repo, branch);
        const currentFileIds = new Set();
        console.log(`Backfilling ${owner}/${repo} (branch: ${branch}): ${treeFiles.length} files in tree`);
        for (const file of treeFiles) {
            const fileId = generateFileId(owner, repo, file.path);
            currentFileIds.add(fileId);
            const exclusion = checkExclusion(file.path, file.size);
            if (exclusion.excluded) {
                result.filesSkipped++;
                continue;
            }
            try {
                const content = await getBlobContent(owner, repo, file.sha);
                if (!content) {
                    result.filesSkipped++;
                    continue;
                }
                const isBinary = isBinaryContent(content);
                if (isBinary) {
                    result.filesSkipped++;
                    continue;
                }
                const language = detectLanguage(file.path);
                const indexedAt = new Date().toISOString();
                const fileDoc = {
                    provider: 'github',
                    owner,
                    repo,
                    branch,
                    path: file.path,
                    sha: file.sha,
                    commitSha,
                    language,
                    sizeBytes: file.size,
                    isBinary: false,
                    indexedAt,
                    repoUrl: `https://github.com/${owner}/${repo}`,
                    fileUrl: `https://github.com/${owner}/${repo}/blob/${file.sha}/${file.path}`,
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
                            branch,
                            path: file.path,
                            sha: file.sha,
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
                result.filesProcessed++;
                result.chunksIndexed += chunkDocs.length;
                if (result.filesProcessed % 50 === 0) {
                    console.log(`  Processed ${result.filesProcessed} files...`);
                }
            }
            catch (err) {
                result.errors.push(`${file.path}: ${err}`);
            }
        }
        // Delete files that no longer exist
        for (const existingId of existingFileIds) {
            if (!currentFileIds.has(existingId)) {
                await deleteFileAndChunks(existingId);
                result.filesDeleted++;
            }
        }
        updateRepoState(owner, repo, branch, {
            lastIndexedCommitSha: commitSha,
            lastIndexedAt: new Date().toISOString(),
            status: 'idle',
        });
        console.log(`Backfill complete for ${owner}/${repo}:`, result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(errorMsg);
        if (result.branch) {
            updateRepoState(owner, repo, result.branch, {
                status: 'error',
                error: errorMsg,
            });
        }
    }
    return result;
}
