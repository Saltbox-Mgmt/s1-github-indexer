export interface BackfillResult {
    owner: string;
    repo: string;
    branch: string;
    filesProcessed: number;
    filesSkipped: number;
    chunksIndexed: number;
    filesDeleted: number;
    errors: string[];
}
export declare function backfillRepo(owner: string, repo: string): Promise<BackfillResult>;
