export interface ChangedFile {
    path: string;
    status: 'added' | 'modified' | 'removed' | 'renamed';
    previousPath?: string;
    sha?: string;
}
export declare function getChangedFiles(owner: string, repo: string, baseSha: string, headSha: string): Promise<ChangedFile[]>;
