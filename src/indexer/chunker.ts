import { config } from '../config/index.js';

export interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
}

export function chunkContent(content: string): Chunk[] {
  const lines = content.split('\n');
  const chunks: Chunk[] = [];

  const { chunkLines, chunkOverlap } = config.indexing;

  if (lines.length <= chunkLines) {
    return [{
      content,
      startLine: 1,
      endLine: lines.length,
    }];
  }

  let startIndex = 0;

  while (startIndex < lines.length) {
    const endIndex = Math.min(startIndex + chunkLines, lines.length);
    const chunkLines_ = lines.slice(startIndex, endIndex);

    chunks.push({
      content: chunkLines_.join('\n'),
      startLine: startIndex + 1,
      endLine: endIndex,
    });

    if (endIndex >= lines.length) break;

    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
}
