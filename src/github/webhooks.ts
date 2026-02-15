import { Webhooks } from '@octokit/webhooks';
import { config } from '../config/index.js';

let webhooks: Webhooks | null = null;

export function getWebhooks(): Webhooks {
  if (!webhooks) {
    webhooks = new Webhooks({
      secret: config.github.webhookSecret,
    });
  }
  return webhooks;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const wh = getWebhooks();
  try {
    return await wh.verify(payload, signature);
  } catch {
    return false;
  }
}
