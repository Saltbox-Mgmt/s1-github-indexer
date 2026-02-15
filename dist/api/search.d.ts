export interface SearchParams {
    query: string;
    repo?: string;
    path?: string;
    language?: string;
    limit?: number;
}
export interface SearchResult {
    repo: string;
    owner: string;
    path: string;
    sha: string;
    startLine: number;
    endLine: number;
    content: string;
    language: string;
    score: number;
    url: string;
}
export interface SearchResponse {
    results: SearchResult[];
    total: number;
    took: number;
}
export declare function searchCode(params: SearchParams): Promise<SearchResponse>;
