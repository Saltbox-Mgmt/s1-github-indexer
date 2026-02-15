import { getOctokit } from './client.js';

export interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  previousPath?: string;
  sha?: string;
}

export async function getChangedFiles(
  owner: string,
  repo: string,
  baseSha: string,
  headSha: string
): Promise<ChangedFile[]> {
  const octokit = await getOctokit();

  const { data: comparison } = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
    owner,
    repo,
    basehead: `${baseSha}...${headSha}`,
  });

  const files: ChangedFile[] = [];
  for (const file of comparison.files || []) {
    files.push({
      path: file.filename,
      status: file.status as ChangedFile['status'],
      previousPath: file.previous_filename ?? undefined,
      sha: file.sha ?? undefined,
    });
  }
  return files;
}
