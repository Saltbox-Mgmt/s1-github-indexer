import 'dotenv/config';
import { readFileSync } from 'fs';
export const BRANCH = 'dev';
export const config = {
    github: {
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_PRIVATE_KEY_PATH
            ? readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf-8')
            : process.env.GITHUB_PRIVATE_KEY,
        webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
        installationId: Number(process.env.GITHUB_INSTALLATION_ID),
    },
    elasticsearch: {
        url: process.env.ELASTICSEARCH_URL,
        apiKey: process.env.ELASTICSEARCH_API_KEY,
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
    },
    server: {
        port: Number(process.env.PORT || 3000),
    },
    indexing: {
        maxFileSizeBytes: 300 * 1024,
        chunkLines: 300,
        chunkOverlap: 30,
    },
};
export function validateConfig() {
    const required = [
        ['GITHUB_APP_ID', config.github.appId],
        ['GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_PATH', config.github.privateKey],
        ['GITHUB_WEBHOOK_SECRET', config.github.webhookSecret],
        ['GITHUB_INSTALLATION_ID', config.github.installationId],
        ['ELASTICSEARCH_URL', config.elasticsearch.url],
    ];
    for (const [name, value] of required) {
        if (!value || (typeof value === 'number' && isNaN(value))) {
            throw new Error(`Missing required config: ${name}`);
        }
    }
}
