import { getElasticClient } from '../elastic/client.js';
import { CODE_CHUNKS_INDEX } from '../elastic/indices.js';
import { BRANCH } from '../config/index.js';

export interface SearchParams {
  query: string;
  repo?: string;
  path?: string;
  language?: string;
  limit?: number;
}

export interface SearchResult {
  repo: string;
  owner: string;
  path: string;
  sha: string;
  startLine: number;
  endLine: number;
  content: string;
  language: string;
  score: number;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
}

export async function searchCode(params: SearchParams): Promise<SearchResponse> {
  const client = getElasticClient();
  const limit = Math.min(params.limit || 20, 100);

  const must: object[] = [
    { term: { branch: BRANCH } },
    {
      match: {
        content: {
          query: params.query,
          operator: 'and',
        },
      },
    },
  ];

  if (params.repo) {
    // repo can be "owner/repo" or just "repo"
    if (params.repo.includes('/')) {
      const [owner, repo] = params.repo.split('/');
      must.push({ term: { owner } });
      must.push({ term: { repo } });
    } else {
      must.push({ term: { repo: params.repo } });
    }
  }

  if (params.path) {
    must.push({ wildcard: { path: `*${params.path}*` } });
  }

  if (params.language) {
    must.push({ term: { language: params.language } });
  }

  const response = await client.search({
    index: CODE_CHUNKS_INDEX,
    size: limit,
    query: {
      bool: { must },
    },
    sort: [{ _score: { order: 'desc' } }],
    _source: ['owner', 'repo', 'path', 'sha', 'startLine', 'endLine', 'content', 'language'],
    highlight: {
      fields: {
        content: {
          pre_tags: ['>>>'],
          post_tags: ['<<<'],
          fragment_size: 200,
          number_of_fragments: 3,
        },
      },
    },
  });

  const hits = response.hits.hits;
  const results: SearchResult[] = hits.map(hit => {
    const source = hit._source as {
      owner: string;
      repo: string;
      path: string;
      sha: string;
      startLine: number;
      endLine: number;
      content: string;
      language: string;
    };

    return {
      owner: source.owner,
      repo: source.repo,
      path: source.path,
      sha: source.sha,
      startLine: source.startLine,
      endLine: source.endLine,
      content: source.content,
      language: source.language,
      score: hit._score || 0,
      url: `https://github.com/${source.owner}/${source.repo}/blob/${source.sha}/${source.path}#L${source.startLine}-L${source.endLine}`,
    };
  });

  return {
    results,
    total: typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value || 0,
    took: response.took,
  };
}
