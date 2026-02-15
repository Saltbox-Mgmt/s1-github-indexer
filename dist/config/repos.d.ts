export interface RepoConfig {
    owner: string;
    repo: string;
    branch?: string;
}
export declare const REPO_ALLOWLIST: RepoConfig[];
export declare function isRepoAllowed(owner: string, repo: string): boolean;
export declare function getRepoConfig(owner: string, repo: string): RepoConfig | undefined;
