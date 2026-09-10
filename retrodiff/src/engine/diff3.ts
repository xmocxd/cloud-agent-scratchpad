import {
  type Hunk,
  type MergeChoice,
  diffLines,
  hunksFromScript,
  myers,
  splitLines,
} from "./diff.ts";

function indexBlocks(origin: string[], other: string[]): Map<number, { oStart: number; oCount: number; lines: string[] }> {
  const script = myers(origin, other);
  const map = new Map<number, { oStart: number; oCount: number; lines: string[] }>();
  let o = 0;
  let i = 0;
  while (i < script.length) {
    if (script[i].op === "eq") {
      o++;
      i++;
      continue;
    }
    const oStart = o;
    const taken: string[] = [];
    let oCount = 0;
    while (i < script.length && script[i].op !== "eq") {
      if (script[i].op === "del") {
        oCount++;
        o++;
      } else {
        taken.push(script[i].line);
      }
      i++;
    }
    map.set(oStart, { oStart, oCount, lines: taken });
  }
  return map;
}

function sameLines(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/**
 * FileMerge ancestor rule:
 * - left matches ancestor, right differs → prefer right (not a conflict)
 * - right matches ancestor, left differs → prefer left
 * - all three differ → conflict (red border), still default to right
 * - both match each other (same change from ancestor) → that shared text
 */
export function diff3Lines(leftText: string, rightText: string, ancestorText: string): Hunk[] {
  const left = splitLines(leftText);
  const right = splitLines(rightText);
  const origin = splitLines(ancestorText);
  const hunks = hunksFromScript(myers(left, right), "right");

  const leftFromOrig = indexBlocks(origin, left);
  const rightFromOrig = indexBlocks(origin, right);

  for (const h of hunks) {
    if (h.kind !== "change") continue;
    const leftIsOrig = blockEqualsOrigin(origin, left, h.leftStart, h.leftCount);
    const rightIsOrig = blockEqualsOrigin(origin, right, h.rightStart, h.rightCount);

    if (leftIsOrig && !rightIsOrig) {
      h.choice = "right";
      h.isConflict = false;
    } else if (rightIsOrig && !leftIsOrig) {
      h.choice = "left";
      h.isConflict = false;
    } else if (sameLines(h.leftLines, h.rightLines)) {
      h.choice = "right";
      h.isConflict = false;
    } else {
      const bothEdited =
        (!leftIsOrig && !rightIsOrig) ||
        looksIndependentlyEdited(h, leftFromOrig, rightFromOrig);
      h.isConflict = bothEdited && !sameLines(h.leftLines, h.rightLines);
      h.choice = "right" as MergeChoice;
    }
  }
  return hunks;
}

function blockEqualsOrigin(origin: string[], side: string[], start: number, count: number): boolean {
  if (count === 0) {
    return true;
  }
  const slice = side.slice(start, start + count);
  return containsSequence(origin, slice);
}

function containsSequence(hay: string[], needle: string[]): boolean {
  if (needle.length === 0) return true;
  outer: for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

function looksIndependentlyEdited(
  h: Hunk,
  _leftFromOrig: Map<number, { oStart: number; oCount: number; lines: string[] }>,
  _rightFromOrig: Map<number, { oStart: number; oCount: number; lines: string[] }>,
): boolean {
  return h.leftCount > 0 && h.rightCount > 0;
}

export function diffWithOptionalAncestor(
  leftText: string,
  rightText: string,
  ancestorText?: string | null,
): Hunk[] {
  if (ancestorText != null && ancestorText.length > 0) {
    return diff3Lines(leftText, rightText, ancestorText);
  }
  return diffLines(leftText, rightText, "right");
}
