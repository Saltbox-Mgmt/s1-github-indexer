import { Webhooks } from '@octokit/webhooks';
export declare function getWebhooks(): Webhooks;
export declare function verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
