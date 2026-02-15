# GitHub Indexer

A Node.js service that indexes GitHub repositories into Elasticsearch for code search.

## Features

- **Backfill**: Full repository indexing from the `dev` branch
- **Webhooks**: Incremental updates on push events
- **Search API**: Query indexed code with filters
- **Chunking**: Large files split into searchable chunks (300 lines, 30 line overlap)

## Setup

### 1. Create a GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps → New GitHub App
2. Configure:
   - **Name**: Your app name (e.g., "Code Indexer")
   - **Homepage URL**: Your server URL
   - **Webhook URL**: `https://your-server/webhooks/github`
   - **Webhook secret**: Generate a strong secret
3. Set permissions:
   - **Repository contents**: Read-only
   - **Metadata**: Read-only
4. Subscribe to events:
   - **Push**
5. After creation:
   - Note the **App ID** from the app settings page
   - Generate and download a **private key** (.pem file)
6. Install the app on your organization or specific repositories
7. Note the **Installation ID** from the URL after installing (e.g., `https://github.com/settings/installations/12345678`)

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `GITHUB_APP_ID` - Your GitHub App ID
- `GITHUB_PRIVATE_KEY_PATH` - Path to your .pem file (or use `GITHUB_PRIVATE_KEY` inline)
- `GITHUB_WEBHOOK_SECRET` - The secret you configured in the GitHub App
- `GITHUB_INSTALLATION_ID` - The installation ID from step 6
- `ELASTICSEARCH_URL` - Your Elasticsearch cluster URL
- `ELASTICSEARCH_API_KEY` - API key for authentication (or use username/password)

### 3. Configure Repositories

Edit `src/config/repos.ts` to add your repositories:

```typescript
export const REPO_ALLOWLIST: RepoConfig[] = [
  { owner: 'your-org', repo: 'api' },
  { owner: 'your-org', repo: 'frontend' },
  // ...
];
```

### 4. Install and Run

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Or build and run
pnpm build
pnpm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Repository Status
```
GET /status
```
Returns indexing status for all repositories.

### Webhook Receiver
```
POST /webhooks/github
```
Receives GitHub push webhooks. Automatically filters for `dev` branch only.

### Manual Backfill
```
POST /backfill/:owner/:repo
```
Triggers a full re-index of a repository. The repo must be in the allowlist.

### Search
```
GET /search?query=<search>&repo=<owner/repo>&path=<path>&language=<lang>&limit=<n>
```

Parameters:
- `query` (required) - Search text
- `repo` - Filter by repository (format: `owner/repo` or just `repo`)
- `path` - Filter by path pattern
- `language` - Filter by language (e.g., `typescript`, `python`)
- `limit` - Max results (default: 20, max: 100)

Response:
```json
{
  "results": [
    {
      "owner": "acme",
      "repo": "api",
      "path": "src/utils/date.ts",
      "sha": "abc123",
      "startLine": 1,
      "endLine": 50,
      "content": "...",
      "language": "typescript",
      "score": 12.5,
      "url": "https://github.com/acme/api/blob/abc123/src/utils/date.ts#L1-L50"
    }
  ],
  "total": 42,
  "took": 15
}
```

## CLI Commands

### Backfill All Repos
```bash
pnpm backfill
```

### Backfill Specific Repos
```bash
pnpm backfill owner/repo1 owner/repo2
```

## Elasticsearch Indices

### code_files_v1
File metadata (one document per file):
- `provider`, `owner`, `repo`, `branch`
- `path`, `sha`, `commitSha`
- `language`, `sizeBytes`, `isBinary`
- `indexedAt`, `repoUrl`, `fileUrl`

### code_chunks_v1
Searchable content chunks:
- `provider`, `owner`, `repo`, `branch`
- `path`, `sha`, `chunkIndex`
- `startLine`, `endLine`
- `language`, `content`, `contentHash`
- `indexedAt`, `fileId`

## Exclusions

The following are automatically excluded:
- Directories: `node_modules/`, `dist/`, `build/`, `.git/`, etc.
- Files: `*.min.js`, `*.map`, `*.lock`, images, fonts, binaries
- Files larger than 300KB
- Binary files (detected by null bytes)
