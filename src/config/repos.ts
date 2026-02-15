export interface RepoConfig {
  owner: string;
  repo: string;
  branch?: string; // Optional: specify branch, otherwise auto-detect (dev, Dev, main, master)
}

// Add your repos here
export const REPO_ALLOWLIST: RepoConfig[] = [
  // Example:
  { owner: 'Saltbox-Mgmt', repo: 'Saltbox-Base', branch: 'Master' },
  { owner: 'Saltbox-Mgmt', repo: 'saltbox-ignition', branch: 'Master' },
  { owner: 'Saltbox-Mgmt', repo: 'saltbox-throttle', branch: 'Master' },
  { owner: 'Saltbox-Mgmt', repo: 'Saltbox-Advance', branch: 'Master' },
  { owner: 'Saltbox-Mgmt', repo: 'Saltbox-SDO', branch: 'Master' },
  { owner: 'Saltbox-Mgmt', repo: 'AW-Parts-Store', branch: 'main' },
  { owner: 'Saltbox-Mgmt', repo: 'TDF-B2B', branch: 'SFDEV' },
  { owner: 'Saltbox-Mgmt', repo: 'DAIKIN-B2B', branch: 'dev' },
  { owner: 'Saltbox-Mgmt', repo: 'Shorr-LWR-B2B', branch: 'dev' },
  { owner: 'Saltbox-Mgmt', repo: 'Palecek-B2B', branch: 'dev' },
  { owner: 'Saltbox-Mgmt', repo: 'GBP', branch: 'master' },
  { owner: 'Saltbox-Mgmt', repo: 'ZO-B2B', branch: 'dev' },
  { owner: 'Saltbox-Mgmt', repo: 'GordonCollege', branch: 'master' },
  { owner: 'Saltbox-Mgmt', repo: 'Standard-Textile', branch: 'dev' },
  { owner: 'Saltbox-Mgmt', repo: 'TTS-B2B', branch: 'main' }
];

export function isRepoAllowed(owner: string, repo: string): boolean {
  return REPO_ALLOWLIST.some(r => r.owner === owner && r.repo === repo);
}

export function getRepoConfig(owner: string, repo: string): RepoConfig | undefined {
  return REPO_ALLOWLIST.find(r => r.owner === owner && r.repo === repo);
}
