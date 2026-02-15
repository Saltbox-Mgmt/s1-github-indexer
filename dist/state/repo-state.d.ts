export interface RepoIndexState {
    owner: string;
    repo: string;
    branch: string;
    lastIndexedCommitSha: string;
    lastIndexedAt: string;
    status: 'idle' | 'indexing' | 'error';
    error?: string;
}
export declare function getRepoState(owner: string, repo: string, branch: string): RepoIndexState | undefined;
export declare function setRepoState(state: RepoIndexState): void;
export declare function updateRepoState(owner: string, repo: string, branch: string, updates: Partial<RepoIndexState>): void;
export declare function getAllRepoStates(): RepoIndexState[];
export declare function isDeliveryProcessed(deliveryId: string): boolean;
export declare function markDeliveryProcessed(deliveryId: string): void;
