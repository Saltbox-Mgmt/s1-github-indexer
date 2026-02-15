import { Webhooks } from '@octokit/webhooks';
import { config } from '../config/index.js';
let webhooks = null;
export function getWebhooks() {
    if (!webhooks) {
        webhooks = new Webhooks({
            secret: config.github.webhookSecret,
        });
    }
    return webhooks;
}
export async function verifyWebhookSignature(payload, signature) {
    const wh = getWebhooks();
    try {
        return await wh.verify(payload, signature);
    }
    catch {
        return false;
    }
}
