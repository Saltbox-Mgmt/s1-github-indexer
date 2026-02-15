export interface ExclusionResult {
    excluded: boolean;
    reason?: string;
}
export declare function checkExclusion(path: string, sizeBytes: number): ExclusionResult;
