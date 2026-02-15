// Add your repos here
export const REPO_ALLOWLIST = [
    // Example:
    { owner: 'Saltbox-Mgmt', repo: 'TDF-B2B' },
    // { owner: 'Saltbox-Mgmt', repo: 'Saltbox-Base', branch: 'Dev' },
];
export function isRepoAllowed(owner, repo) {
    return REPO_ALLOWLIST.some(r => r.owner === owner && r.repo === repo);
}
export function getRepoConfig(owner, repo) {
    return REPO_ALLOWLIST.find(r => r.owner === owner && r.repo === repo);
}
