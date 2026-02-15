import { getOctokit } from './client.js';
export async function getChangedFiles(owner, repo, baseSha, headSha) {
    const octokit = await getOctokit();
    const { data: comparison } = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
        owner,
        repo,
        basehead: `${baseSha}...${headSha}`,
    });
    const files = [];
    for (const file of comparison.files || []) {
        files.push({
            path: file.filename,
            status: file.status,
            previousPath: file.previous_filename ?? undefined,
            sha: file.sha ?? undefined,
        });
    }
    return files;
}
