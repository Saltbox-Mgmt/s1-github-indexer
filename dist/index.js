import { validateConfig } from './config/index.js';
import { ensureIndices } from './elastic/indices.js';
import { pingElastic } from './elastic/client.js';
import { startServer } from './api/server.js';
async function main() {
    console.log('GitHub Indexer starting...');
    // Validate config
    try {
        validateConfig();
    }
    catch (err) {
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
    console.log('Elasticsearch connected');
    // Ensure indices exist
    console.log('Ensuring indices exist...');
    await ensureIndices();
    // Start server
    await startServer();
}
main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
