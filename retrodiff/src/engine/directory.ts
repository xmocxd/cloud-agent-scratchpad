export const DEFAULT_IGNORE = [".git", ".svn", "CVS", ".hg", ".DS_Store", "Thumbs.db"];

export type DirStatus = "identical" | "modified" | "added-left" | "added-right";

export interface DirEntry {
  rel: string;
  status: DirStatus;
  leftPath: string | null;
  rightPath: string | null;
}

export interface DirCompareResult {
  entries: DirEntry[];
}

export function shouldIgnore(rel: string, ignore: string[]): boolean {
  const parts = rel.split(/[/\\]/);
  for (const p of parts) {
    if (ignore.includes(p)) return true;
  }
  const base = parts[parts.length - 1] ?? "";
  return ignore.some((g) => g.startsWith("*.") && base.endsWith(g.slice(1)));
}

export function compareTrees(
  leftFiles: Map<string, string>,
  rightFiles: Map<string, string>,
  ignore: string[] = DEFAULT_IGNORE,
): DirCompareResult {
  const keys = new Set<string>([...leftFiles.keys(), ...rightFiles.keys()]);
  const entries: DirEntry[] = [];
  for (const rel of [...keys].sort()) {
    if (shouldIgnore(rel, ignore)) continue;
    const L = leftFiles.has(rel);
    const R = rightFiles.has(rel);
    if (L && R) {
      const same = leftFiles.get(rel) === rightFiles.get(rel);
      entries.push({
        rel,
        status: same ? "identical" : "modified",
        leftPath: rel,
        rightPath: rel,
      });
    } else if (L) {
      entries.push({ rel, status: "added-left", leftPath: rel, rightPath: null });
    } else {
      entries.push({ rel, status: "added-right", leftPath: null, rightPath: rel });
    }
  }
  return { entries };
}

export type ExcludeSet = {
  identical: boolean;
  modified: boolean;
  addedLeft: boolean;
  addedRight: boolean;
};

export function filterEntries(entries: DirEntry[], excl: ExcludeSet): DirEntry[] {
  return entries.filter((e) => {
    if (e.status === "identical" && excl.identical) return false;
    if (e.status === "modified" && excl.modified) return false;
    if (e.status === "added-left" && excl.addedLeft) return false;
    if (e.status === "added-right" && excl.addedRight) return false;
    return true;
  });
}

export function statusLabel(e: DirEntry): string {
  switch (e.status) {
    case "identical":
      return "identical";
    case "modified":
      return "modified";
    case "added-left":
      return "added to left";
    case "added-right":
      return "added to right";
  }
}
