import { getOctokit } from './client.js';
export async function getBlobContent(owner, repo, sha) {
    const octokit = await getOctokit();
    try {
        const { data: blob } = await octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
            owner,
            repo,
            file_sha: sha,
        });
        if (blob.encoding === 'base64') {
            return Buffer.from(blob.content, 'base64').toString('utf-8');
        }
        return blob.content;
    }
    catch (err) {
        console.error(`Failed to fetch blob ${sha}:`, err);
        return null;
    }
}
export async function getBlobsInBatches(owner, repo, shas, batchSize = 10) {
    const results = new Map();
    for (let i = 0; i < shas.length; i += batchSize) {
        const batch = shas.slice(i, i + batchSize);
        const promises = batch.map(async (sha) => {
            const content = await getBlobContent(owner, repo, sha);
            return [sha, content];
        });
        const batchResults = await Promise.all(promises);
        for (const [sha, content] of batchResults) {
            results.set(sha, content);
        }
        // Small delay between batches to respect rate limits
        if (i + batchSize < shas.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return results;
}
