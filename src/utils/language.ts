const EXTENSION_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.cs': 'csharp',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.php': 'php',
  '.swift': 'swift',
  '.m': 'objective-c',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.ps1': 'powershell',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.json': 'json',
  '.xml': 'xml',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.rst': 'restructuredtext',
  '.txt': 'text',
  '.toml': 'toml',
  '.ini': 'ini',
  '.cfg': 'ini',
  '.dockerfile': 'dockerfile',
  '.tf': 'terraform',
  '.hcl': 'hcl',
  '.proto': 'protobuf',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.astro': 'astro',
  '.elm': 'elm',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.erl': 'erlang',
  '.clj': 'clojure',
  '.hs': 'haskell',
  '.lua': 'lua',
  '.r': 'r',
  '.jl': 'julia',
  '.dart': 'dart',
  '.zig': 'zig',
  '.nim': 'nim',
  '.v': 'vlang',
  '.sol': 'solidity',
  '.cls': 'apex',
  '.trigger': 'apex',
};

export function detectLanguage(path: string): string {
  const lowerPath = path.toLowerCase();

  // Check for special filenames
  if (lowerPath.endsWith('dockerfile') || lowerPath.includes('dockerfile.')) {
    return 'dockerfile';
  }
  if (lowerPath.endsWith('makefile') || lowerPath.endsWith('.mk')) {
    return 'makefile';
  }

  // Get extension
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) return 'unknown';

  const ext = path.slice(lastDot).toLowerCase();
  return EXTENSION_MAP[ext] || 'unknown';
}
