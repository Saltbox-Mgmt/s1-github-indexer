import Fastify from 'fastify';
import { config } from '../config/index.js';
import { pingElastic } from '../elastic/client.js';
import { verifyWebhookSignature } from '../github/webhooks.js';
import { handlePushWebhook, type PushPayload } from '../indexer/incremental.js';
import { backfillRepo } from '../indexer/backfill.js';
import { searchCode, type SearchParams } from './search.js';
import { getAllRepoStates } from '../state/repo-state.js';
import { isRepoAllowed } from '../config/repos.js';

export function createServer() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.get('/health', async () => {
    const elasticOk = await pingElastic();
    return {
      status: elasticOk ? 'healthy' : 'degraded',
      elastic: elasticOk,
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/status', async () => {
    return {
      repos: getAllRepoStates(),
    };
  });

  fastify.post('/webhooks/github', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'] as string;
    const deliveryId = request.headers['x-github-delivery'] as string;
    const event = request.headers['x-github-event'] as string;

    if (!signature || !deliveryId) {
      return reply.status(400).send({ error: 'Missing required headers' });
    }

    const payload = typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body);

    const valid = await verifyWebhookSignature(payload, signature);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid signature' });
    }

    if (event !== 'push') {
      return { status: 'ignored', event };
    }

    const pushPayload = typeof request.body === 'string'
      ? JSON.parse(request.body) as PushPayload
      : request.body as PushPayload;

    const result = await handlePushWebhook(pushPayload, deliveryId);
    return result;
  });

  fastify.post<{
    Params: { owner: string; repo: string };
  }>('/backfill/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;

    if (!isRepoAllowed(owner, repo)) {
      return reply.status(403).send({ error: 'Repo not in allowlist' });
    }

    // Run backfill asynchronously
    backfillRepo(owner, repo).catch(err => {
      console.error(`Backfill error for ${owner}/${repo}:`, err);
    });

    return {
      status: 'started',
      owner,
      repo,
    };
  });

  fastify.get<{
    Querystring: SearchParams;
  }>('/search', async (request, reply) => {
    const { query, repo, path, language, limit } = request.query;

    if (!query) {
      return reply.status(400).send({ error: 'query parameter required' });
    }

    const result = await searchCode({
      query,
      repo,
      path,
      language,
      limit: limit ? Number(limit) : undefined,
    });

    return result;
  });

  return fastify;
}

export async function startServer() {
  const server = createServer();

  try {
    await server.listen({ port: config.server.port, host: '0.0.0.0' });
    console.log(`Server listening on port ${config.server.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  return server;
}
