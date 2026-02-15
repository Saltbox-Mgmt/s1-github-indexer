import { Client } from '@elastic/elasticsearch';
import { config } from '../config/index.js';

let client: Client | null = null;

export function getElasticClient(): Client {
  if (!client) {
    const options: ConstructorParameters<typeof Client>[0] = {
      node: config.elasticsearch.url,
    };

    if (config.elasticsearch.apiKey) {
      options.auth = { apiKey: config.elasticsearch.apiKey };
    } else if (config.elasticsearch.username && config.elasticsearch.password) {
      options.auth = {
        username: config.elasticsearch.username,
        password: config.elasticsearch.password,
      };
    }

    client = new Client(options);
  }

  return client;
}

export async function pingElastic(): Promise<boolean> {
  try {
    await getElasticClient().ping();
    return true;
  } catch {
    return false;
  }
}
