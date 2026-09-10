const PATTERNS: Array<{ lang: string; re: RegExp }> = [
  { lang: "js", re: /^\s*(export\s+)?(async\s+)?function\s+([A-Za-z0-9_$]+)/ },
  { lang: "js", re: /^\s*(export\s+)?(const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\(/ },
  { lang: "py", re: /^\s*(async\s+)?def\s+([A-Za-z0-9_]+)/ },
  { lang: "py", re: /^\s*class\s+([A-Za-z0-9_]+)/ },
  { lang: "c", re: /^[A-Za-z_][\w\s\*]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;]*\)\s*\{?\s*$/ },
  { lang: "objc", re: /^\s*[-+]\s*\([^)]+\)\s*([A-Za-z0-9_]+)/ },
  { lang: "rs", re: /^\s*(pub\s+)?(async\s+)?fn\s+([A-Za-z0-9_]+)/ },
  { lang: "rs", re: /^\s*(pub\s+)?(struct|enum|impl|trait)\s+([A-Za-z0-9_]+)/ },
];

export interface FuncHit {
  name: string;
  line: number;
}

export function extractFunctions(text: string): FuncHit[] {
  const lines = text.split("\n");
  const hits: FuncHit[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { re } of PATTERNS) {
      const m = line.match(re);
      if (!m) continue;
      const name = (m[3] || m[2] || m[1] || "").trim();
      if (!name || name === "if" || name === "while" || name === "for" || name === "switch") continue;
      const key = `${name}@${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ name, line: i });
      break;
    }
  }
  return hits;
}
