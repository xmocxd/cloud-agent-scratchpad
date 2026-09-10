export type MergeChoice = "left" | "right" | "both-left" | "both-right" | "neither";

export type HunkKind = "equal" | "change";

export interface Hunk {
  id: number;
  kind: HunkKind;
  leftStart: number;
  leftCount: number;
  rightStart: number;
  rightCount: number;
  leftLines: string[];
  rightLines: string[];
  choice: MergeChoice;
  isConflict: boolean;
}

export function splitLines(text: string): string[] {
  if (text.length === 0) return [];
  const parts = text.split("\n");
  if (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

export function joinLines(lines: string[]): string {
  if (lines.length === 0) return "";
  return lines.join("\n") + "\n";
}

/** Line diff (LCS). Named `myers` for the FileMerge-era algorithm family. */
export function myers(a: string[], b: string[]): Array<{ op: "eq" | "del" | "ins"; line: string }> {
  const n = a.length;
  const m = b.length;
  if (n === 0 && m === 0) return [];
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const script: Array<{ op: "eq" | "del" | "ins"; line: string }> = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      script.push({ op: "eq", line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      script.push({ op: "del", line: a[i] });
      i++;
    } else {
      script.push({ op: "ins", line: b[j] });
      j++;
    }
  }
  while (i < n) script.push({ op: "del", line: a[i++] });
  while (j < m) script.push({ op: "ins", line: b[j++] });
  return script;
}

export function hunksFromScript(
  script: Array<{ op: "eq" | "del" | "ins"; line: string }>,
  defaultChoice: MergeChoice = "right",
): Hunk[] {
  const hunks: Hunk[] = [];
  let i = 0;
  let left = 0;
  let right = 0;
  let id = 1;
  while (i < script.length) {
    if (script[i].op === "eq") {
      const lines: string[] = [];
      const ls = left;
      const rs = right;
      while (i < script.length && script[i].op === "eq") {
        lines.push(script[i].line);
        left++;
        right++;
        i++;
      }
      hunks.push({
        id: 0,
        kind: "equal",
        leftStart: ls,
        leftCount: lines.length,
        rightStart: rs,
        rightCount: lines.length,
        leftLines: lines,
        rightLines: lines,
        choice: defaultChoice,
        isConflict: false,
      });
    } else {
      const dels: string[] = [];
      const ins: string[] = [];
      const ls = left;
      const rs = right;
      while (i < script.length && script[i].op !== "eq") {
        if (script[i].op === "del") {
          dels.push(script[i].line);
          left++;
        } else {
          ins.push(script[i].line);
          right++;
        }
        i++;
      }
      hunks.push({
        id: id++,
        kind: "change",
        leftStart: ls,
        leftCount: dels.length,
        rightStart: rs,
        rightCount: ins.length,
        leftLines: dels,
        rightLines: ins,
        choice: defaultChoice,
        isConflict: false,
      });
    }
  }
  return hunks;
}

export function diffLines(leftText: string, rightText: string, defaultChoice: MergeChoice = "right"): Hunk[] {
  const a = splitLines(leftText);
  const b = splitLines(rightText);
  return hunksFromScript(myers(a, b), defaultChoice);
}

export function changeHunks(hunks: Hunk[]): Hunk[] {
  return hunks.filter((h) => h.kind === "change");
}

export function applyChoice(hunk: Hunk, choice: MergeChoice): Hunk {
  return { ...hunk, choice };
}

export function linesForChoice(hunk: Hunk): string[] {
  if (hunk.kind === "equal") return hunk.leftLines;
  switch (hunk.choice) {
    case "left":
      return hunk.leftLines;
    case "right":
      return hunk.rightLines;
    case "both-left":
      return [...hunk.leftLines, ...hunk.rightLines];
    case "both-right":
      return [...hunk.rightLines, ...hunk.leftLines];
    case "neither":
      return [];
  }
}

export function buildMerge(hunks: Hunk[]): string {
  const out: string[] = [];
  for (const h of hunks) out.push(...linesForChoice(h));
  return joinLines(out);
}

export function isMergeDirty(hunks: Hunk[], defaultChoice: MergeChoice): boolean {
  return hunks.some((h) => h.kind === "change" && h.choice !== defaultChoice);
}

/** Mark a merge dirty the FileMerge way: any explicit hunk action, even choosing the default side. */
export function touchedHunks(hunks: Hunk[], original: Hunk[]): boolean {
  if (hunks.length !== original.length) return true;
  return hunks.some((h, i) => h.choice !== original[i].choice);
}
