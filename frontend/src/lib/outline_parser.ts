export interface HeaderNode {
  level: number;
  title: string;
  line: number;
}

const ATX_HEADER = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const SETEXT_H1 = /^=+\s*$/;
const SETEXT_H2 = /^-+\s*$/;
const FENCE = /^(\s*)(`{3,}|~{3,})/;

export function parseHeaders(markdown: string): HeaderNode[] {
  const lines = markdown.split(/\r?\n/);
  const result: HeaderNode[] = [];
  let inFence = false;
  let fenceMarker = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(FENCE);
    if (fenceMatch) {
      const marker = fenceMatch[2][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (inFence) continue;

    const atx = line.match(ATX_HEADER);
    if (atx) {
      result.push({
        level: atx[1].length,
        title: atx[2].trim(),
        line: i,
      });
      continue;
    }

    if (i > 0) {
      const prev = lines[i - 1];
      if (prev.trim() && SETEXT_H1.test(line)) {
        result.push({ level: 1, title: prev.trim(), line: i - 1 });
      } else if (prev.trim() && SETEXT_H2.test(line)) {
        result.push({ level: 2, title: prev.trim(), line: i - 1 });
      }
    }
  }
  return result;
}

export function findHeaderLine(headers: HeaderNode[], title: string): number {
  const found = headers.find((h) => h.title === title);
  return found ? found.line : -1;
}
