export declare function generateFileId(owner: string, repo: string, path: string): string;
export declare function generateChunkId(fileId: string, startLine: number, endLine: number, contentHash: string): string;
export declare function hashContent(content: string): string;
