export interface RepoIndexState {
  owner: string;
  repo: string;
  branch: string;
  lastIndexedCommitSha: string;
  lastIndexedAt: string;
  status: 'idle' | 'indexing' | 'error';
  error?: string;
}

// In-memory state store
const stateMap = new Map<string, RepoIndexState>();

function stateKey(owner: string, repo: string, branch: string): string {
  return `${owner}/${repo}:${branch}`;
}

export function getRepoState(owner: string, repo: string, branch: string): RepoIndexState | undefined {
  return stateMap.get(stateKey(owner, repo, branch));
}

export function setRepoState(state: RepoIndexState): void {
  stateMap.set(stateKey(state.owner, state.repo, state.branch), state);
}

export function updateRepoState(
  owner: string,
  repo: string,
  branch: string,
  updates: Partial<RepoIndexState>
): void {
  const key = stateKey(owner, repo, branch);
  const existing = stateMap.get(key);
  if (existing) {
    stateMap.set(key, { ...existing, ...updates });
  }
}

export function getAllRepoStates(): RepoIndexState[] {
  return Array.from(stateMap.values());
}

// Track processed webhook delivery IDs to avoid duplicates
const processedDeliveries = new Map<string, number>();
const DELIVERY_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function isDeliveryProcessed(deliveryId: string): boolean {
  const timestamp = processedDeliveries.get(deliveryId);
  if (!timestamp) return false;
  if (Date.now() - timestamp > DELIVERY_TTL_MS) {
    processedDeliveries.delete(deliveryId);
    return false;
  }
  return true;
}

export function markDeliveryProcessed(deliveryId: string): void {
  processedDeliveries.set(deliveryId, Date.now());

  // Cleanup old entries
  const now = Date.now();
  for (const [id, ts] of processedDeliveries) {
    if (now - ts > DELIVERY_TTL_MS) {
      processedDeliveries.delete(id);
    }
  }
}
