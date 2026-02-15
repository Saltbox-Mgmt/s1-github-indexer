import { validateConfig } from '../config/index.js';
import { REPO_ALLOWLIST } from '../config/repos.js';
import { ensureIndices } from '../elastic/indices.js';
import { pingElastic } from '../elastic/client.js';
import { backfillRepo } from '../indexer/backfill.js';

async function main() {
  const args = process.argv.slice(2);

  // Validate config
  try {
    validateConfig();
  } catch (err) {
    console.error('Configuration error:', err);
    process.exit(1);
  }

  // Check Elasticsearch connection
  console.log('Checking Elasticsearch connection...');
  const elasticOk = await pingElastic();
  if (!elasticOk) {
    console.error('Failed to connect to Elasticsearch');
    process.exit(1);
  }

  // Ensure indices exist
  await ensureIndices();

  // Determine which repos to backfill
  let repos: Array<{ owner: string; repo: string }> = [];

  if (args.length > 0) {
    // Backfill specific repo(s) from args
    for (const arg of args) {
      const [owner, repo] = arg.split('/');
      if (!owner || !repo) {
        console.error(`Invalid repo format: ${arg}. Use owner/repo`);
        process.exit(1);
      }
      repos.push({ owner, repo });
    }
  } else {
    // Backfill all repos from allowlist
    repos = REPO_ALLOWLIST;
  }

  if (repos.length === 0) {
    console.log('No repos to backfill. Add repos to REPO_ALLOWLIST or provide as arguments.');
    process.exit(0);
  }

  console.log(`Backfilling ${repos.length} repo(s)...`);

  for (const { owner, repo } of repos) {
    console.log(`\n--- Backfilling ${owner}/${repo} ---`);
    try {
      const result = await backfillRepo(owner, repo);
      console.log(`Result:`, result);
    } catch (err) {
      console.error(`Failed to backfill ${owner}/${repo}:`, err);
    }
  }

  console.log('\nBackfill complete');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
