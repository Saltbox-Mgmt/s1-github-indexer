export declare function getBlobContent(owner: string, repo: string, sha: string): Promise<string | null>;
export declare function getBlobsInBatches(owner: string, repo: string, shas: string[], batchSize?: number): Promise<Map<string, string | null>>;
