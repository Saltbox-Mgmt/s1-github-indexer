import { getElasticClient } from './client.js';
export const CODE_FILES_INDEX = 'code_files_v1';
export const CODE_CHUNKS_INDEX = 'code_chunks_v1';
const codeFilesMapping = {
    properties: {
        provider: { type: 'keyword' },
        owner: { type: 'keyword' },
        repo: { type: 'keyword' },
        branch: { type: 'keyword' },
        path: { type: 'keyword' },
        sha: { type: 'keyword' },
        commitSha: { type: 'keyword' },
        language: { type: 'keyword' },
        sizeBytes: { type: 'integer' },
        isBinary: { type: 'boolean' },
        excludedReason: { type: 'keyword' },
        indexedAt: { type: 'date' },
        repoUrl: { type: 'keyword' },
        fileUrl: { type: 'keyword' },
    },
};
const codeChunksMapping = {
    properties: {
        provider: { type: 'keyword' },
        owner: { type: 'keyword' },
        repo: { type: 'keyword' },
        branch: { type: 'keyword' },
        path: { type: 'keyword' },
        sha: { type: 'keyword' },
        chunkIndex: { type: 'integer' },
        startLine: { type: 'integer' },
        endLine: { type: 'integer' },
        language: { type: 'keyword' },
        content: { type: 'text', analyzer: 'standard' },
        contentHash: { type: 'keyword' },
        indexedAt: { type: 'date' },
        fileId: { type: 'keyword' },
    },
};
export async function ensureIndices() {
    const client = getElasticClient();
    const filesExists = await client.indices.exists({ index: CODE_FILES_INDEX });
    if (!filesExists) {
        await client.indices.create({
            index: CODE_FILES_INDEX,
            body: { mappings: codeFilesMapping },
        });
        console.log(`Created index: ${CODE_FILES_INDEX}`);
    }
    const chunksExists = await client.indices.exists({ index: CODE_CHUNKS_INDEX });
    if (!chunksExists) {
        await client.indices.create({
            index: CODE_CHUNKS_INDEX,
            body: { mappings: codeChunksMapping },
        });
        console.log(`Created index: ${CODE_CHUNKS_INDEX}`);
    }
}
