export interface RepoConfig {
  owner: string;
  repo: string;
  branch?: string; // Optional: specify branch, otherwise auto-detect (dev, Dev, main, master)
}

// Add your repos here
export const REPO_ALLOWLIST: RepoConfig[] = [
  // Example:
  { owner: 'Saltbox-Mgmt', repo: 'AW-Parts-Store', branch: 'main' },
  // { owner: 'Saltbox-Mgmt', repo: 'Saltbox-Base', branch: 'Dev' },
];

export function isRepoAllowed(owner: string, repo: string): boolean {
  return REPO_ALLOWLIST.some(r => r.owner === owner && r.repo === repo);
}

export function getRepoConfig(owner: string, repo: string): RepoConfig | undefined {
  return REPO_ALLOWLIST.find(r => r.owner === owner && r.repo === repo);
}
