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
export declare function upsertFile(fileId: string, doc: CodeFileDoc): Promise<void>;
export declare function upsertChunks(chunks: Array<{
    id: string;
    doc: CodeChunkDoc;
}>): Promise<void>;
export declare function deleteFileAndChunks(fileId: string): Promise<void>;
export declare function deleteChunksForFile(fileId: string): Promise<void>;
export declare function getExistingFileIds(owner: string, repo: string, branch: string): Promise<Set<string>>;
