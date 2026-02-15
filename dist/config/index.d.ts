import 'dotenv/config';
export declare const BRANCH: "dev";
export declare const config: {
    github: {
        appId: string;
        privateKey: string;
        webhookSecret: string;
        installationId: number;
    };
    elasticsearch: {
        url: string;
        apiKey: string | undefined;
        username: string | undefined;
        password: string | undefined;
    };
    server: {
        port: number;
    };
    indexing: {
        maxFileSizeBytes: number;
        chunkLines: number;
        chunkOverlap: number;
    };
};
export declare function validateConfig(): void;
