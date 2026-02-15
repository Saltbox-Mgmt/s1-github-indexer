export interface Chunk {
    content: string;
    startLine: number;
    endLine: number;
}
export declare function chunkContent(content: string): Chunk[];
