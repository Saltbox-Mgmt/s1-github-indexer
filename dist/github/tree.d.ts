export interface TreeFile {
    path: string;
    sha: string;
    size: number;
}
export declare function getDevHeadSha(owner: string, repo: string, targetBranch?: string): Promise<{
    sha: string;
    branch: string;
}>;
export interface TreeResult {
    files: TreeFile[];
    commitSha: string;
    branch: string;
}
export declare function getTreeFiles(owner: string, repo: string, targetBranch?: string): Promise<TreeResult>;
