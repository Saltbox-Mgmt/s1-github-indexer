import { config } from './index.js';
const EXCLUDED_PATHS = [
    'node_modules/',
    'dist/',
    'build/',
    'target/',
    'vendor/',
    '.git/',
    '.next/',
    '__pycache__/',
    'coverage/',
    '.nyc_output/',
    '.cache/',
];
const EXCLUDED_PATTERNS = [
    /\.min\.js$/,
    /\.min\.css$/,
    /\.map$/,
    /\.lock$/,
    /package-lock\.json$/,
    /pnpm-lock\.yaml$/,
    /yarn\.lock$/,
    /\.d\.ts$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.ico$/,
    /\.svg$/,
    /\.woff2?$/,
    /\.ttf$/,
    /\.eot$/,
    /\.pdf$/,
    /\.zip$/,
    /\.tar$/,
    /\.gz$/,
    /-meta\.xml$/,
];
export function checkExclusion(path, sizeBytes) {
    for (const excludedPath of EXCLUDED_PATHS) {
        if (path.includes(excludedPath)) {
            return { excluded: true, reason: `path_contains:${excludedPath}` };
        }
    }
    for (const pattern of EXCLUDED_PATTERNS) {
        if (pattern.test(path)) {
            return { excluded: true, reason: `pattern:${pattern.source}` };
        }
    }
    if (sizeBytes > config.indexing.maxFileSizeBytes) {
        return { excluded: true, reason: `size:${sizeBytes}>${config.indexing.maxFileSizeBytes}` };
    }
    return { excluded: false };
}
