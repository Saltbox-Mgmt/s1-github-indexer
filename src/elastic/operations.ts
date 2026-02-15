import { getElasticClient } from './client.js';
import { CODE_FILES_INDEX, CODE_CHUNKS_INDEX } from './indices.js';

export interface CodeFileDoc {
  provider: 'github';
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
  commitSha?: string;
  language: string;
  sizeBytes: number;
  isBinary: boolean;
  excludedReason?: string;
  indexedAt: string;
  repoUrl: string;
  fileUrl: string;
}

export interface CodeChunkDoc {
  provider: 'github';
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  language: string;
  content: string;
  contentHash: string;
  indexedAt: string;
  fileId: string;
}

export async function upsertFile(fileId: string, doc: CodeFileDoc): Promise<void> {
  const client = getElasticClient();
  await client.index({
    index: CODE_FILES_INDEX,
    id: fileId,
    document: doc,
  });
}

export async function upsertChunks(chunks: Array<{ id: string; doc: CodeChunkDoc }>): Promise<void> {
  if (chunks.length === 0) return;

  const client = getElasticClient();
  const operations = chunks.flatMap(({ id, doc }) => [
    { index: { _index: CODE_CHUNKS_INDEX, _id: id } },
    doc,
  ]);

  const result = await client.bulk({ operations, refresh: true });
  if (result.errors) {
    const errors = result.items.filter(item => item.index?.error);
    console.error('Bulk index errors:', errors);
  }
}

export async function deleteFileAndChunks(fileId: string): Promise<void> {
  const client = getElasticClient();

  // Delete file doc
  try {
    await client.delete({ index: CODE_FILES_INDEX, id: fileId });
  } catch (err: unknown) {
    if ((err as { meta?: { statusCode?: number } }).meta?.statusCode !== 404) throw err;
  }

  // Delete all chunks for this file
  await client.deleteByQuery({
    index: CODE_CHUNKS_INDEX,
    query: { term: { fileId } },
    refresh: true,
  });
}

export async function deleteChunksForFile(fileId: string): Promise<void> {
  const client = getElasticClient();
  await client.deleteByQuery({
    index: CODE_CHUNKS_INDEX,
    query: { term: { fileId } },
    refresh: true,
  });
}

export async function getExistingFileIds(owner: string, repo: string, branch: string): Promise<Set<string>> {
  const client = getElasticClient();
  const fileIds = new Set<string>();

  let searchAfter: string[] | undefined;

  while (true) {
    const result = await client.search({
      index: CODE_FILES_INDEX,
      size: 1000,
      query: {
        bool: {
          filter: [
            { term: { provider: 'github' } },
            { term: { owner } },
            { term: { repo } },
            { term: { branch } },
          ],
        },
      },
      sort: [{ path: 'asc' }],
      _source: false,
      ...(searchAfter ? { search_after: searchAfter } : {}),
    });

    const hits = result.hits.hits;
    if (hits.length === 0) break;

    for (const hit of hits) {
      if (hit._id) fileIds.add(hit._id);
    }

    const lastHit = hits[hits.length - 1];
    searchAfter = lastHit.sort as string[];
  }

  return fileIds;
}
