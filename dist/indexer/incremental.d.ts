export interface PushPayload {
    ref: string;
    before: string;
    after: string;
    repository: {
        owner: {
            login?: string;
            name?: string;
        };
        name: string;
    };
}
export interface IncrementalResult {
    owner: string;
    repo: string;
    processed: boolean;
    reason?: string;
    filesAdded: number;
    filesModified: number;
    filesDeleted: number;
    chunksIndexed: number;
    errors: string[];
}
export declare function handlePushWebhook(payload: PushPayload, deliveryId: string): Promise<IncrementalResult>;
