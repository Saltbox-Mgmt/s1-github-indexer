import { getOctokit } from './client.js';
const BRANCH_CANDIDATES = ['dev', 'Dev', 'main', 'master'];
export async function getDevHeadSha(owner, repo, targetBranch) {
    const octokit = await getOctokit();
    // If a specific branch is requested, try only that one
    if (targetBranch) {
        const { data: ref } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
            owner,
            repo,
            ref: `heads/${targetBranch}`,
        });
        return { sha: ref.object.sha, branch: targetBranch };
    }
    // Otherwise try the candidates in order
    for (const branch of BRANCH_CANDIDATES) {
        try {
            const { data: ref } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner,
                repo,
                ref: `heads/${branch}`,
            });
            return { sha: ref.object.sha, branch };
        }
        catch {
            // Try next branch
        }
    }
    throw new Error(`No branch found. Tried: ${BRANCH_CANDIDATES.join(', ')}`);
}
export async function getTreeFiles(owner, repo, targetBranch) {
    const octokit = await getOctokit();
    const { sha: commitSha, branch } = await getDevHeadSha(owner, repo, targetBranch);
    const { data: commit } = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
        owner,
        repo,
        commit_sha: commitSha,
    });
    const { data: tree } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
        owner,
        repo,
        tree_sha: commit.tree.sha,
        recursive: 'true',
    });
    const files = [];
    for (const item of tree.tree) {
        if (item.type === 'blob' && item.path && item.sha && typeof item.size === 'number') {
            files.push({
                path: item.path,
                sha: item.sha,
                size: item.size,
            });
        }
    }
    return { files, commitSha, branch };
}
