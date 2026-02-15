import { Client } from '@elastic/elasticsearch';
export declare function getElasticClient(): Client;
export declare function pingElastic(): Promise<boolean>;
