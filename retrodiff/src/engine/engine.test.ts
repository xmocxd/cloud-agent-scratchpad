import { describe, expect, it } from "vitest";
import { applyChoice, buildMerge, changeHunks, diffLines, splitLines } from "./diff.ts";
import { diff3Lines } from "./diff3.ts";
import { compareTrees, filterEntries, shouldIgnore, statusLabel } from "./directory.ts";
import { extractFunctions } from "./functions.ts";
import { applyFilterCommand } from "./settings.ts";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("myers / hunks", () => {
  it("identical files have only equal hunks", () => {
    const h = diffLines("a\nb\n", "a\nb\n");
    expect(h.every((x) => x.kind === "equal")).toBe(true);
    expect(changeHunks(h)).toHaveLength(0);
  });

  it("detects insert, delete, and replace", () => {
    const h = changeHunks(diffLines("keep\nold\nend\n", "keep\nnew\nend\n"));
    expect(h).toHaveLength(1);
    expect(h[0].leftLines).toEqual(["old"]);
    expect(h[0].rightLines).toEqual(["new"]);
    expect(h[0].choice).toBe("right");
  });

  it("wikipedia sample has multiple changes", () => {
    const left = readFileSync(join(root, "samples/wikipedia/left.txt"), "utf8");
    const right = readFileSync(join(root, "samples/wikipedia/right.txt"), "utf8");
    const changes = changeHunks(diffLines(left, right));
    expect(changes.length).toBeGreaterThanOrEqual(3);
  });
});

describe("merge actions", () => {
  const left = "a\nL\nz\n";
  const right = "a\nR\nz\n";

  it("choose left / right / both / neither", () => {
    let hunks = diffLines(left, right);
    const ch = changeHunks(hunks)[0];
    hunks = hunks.map((h) => (h.id === ch.id ? applyChoice(h, "left") : h));
    expect(buildMerge(hunks)).toBe("a\nL\nz\n");

    hunks = diffLines(left, right).map((h) => (h.kind === "change" ? applyChoice(h, "right") : h));
    expect(buildMerge(hunks)).toBe("a\nR\nz\n");

    hunks = diffLines(left, right).map((h) => (h.kind === "change" ? applyChoice(h, "both-left") : h));
    expect(buildMerge(hunks)).toBe("a\nL\nR\nz\n");

    hunks = diffLines(left, right).map((h) => (h.kind === "change" ? applyChoice(h, "both-right") : h));
    expect(buildMerge(hunks)).toBe("a\nR\nL\nz\n");

    hunks = diffLines(left, right).map((h) => (h.kind === "change" ? applyChoice(h, "neither") : h));
    expect(buildMerge(hunks)).toBe("a\nz\n");
  });
});

describe("diff3 ancestor", () => {
  it("prefers the side that diverged from ancestor", () => {
    const base = "a\ncommon\nz\n";
    const left = "a\ncommon\nz\n";
    const right = "a\nRIGHT\nz\n";
    const h = changeHunks(diff3Lines(left, right, base));
    expect(h[0].choice).toBe("right");
    expect(h[0].isConflict).toBe(false);
  });

  it("marks true 3-way conflicts", () => {
    const base = readFileSync(join(root, "samples/merge/base.txt"), "utf8");
    const left = readFileSync(join(root, "samples/merge/left.txt"), "utf8");
    const right = readFileSync(join(root, "samples/merge/right.txt"), "utf8");
    const conflicts = changeHunks(diff3Lines(left, right, base)).filter((h) => h.isConflict);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("directory compare", () => {
  it("classifies identical, modified, added-left, added-right", () => {
    const left = new Map([
      ["identical.txt", "same"],
      ["shared.txt", "old"],
      ["only-left.txt", "L"],
    ]);
    const right = new Map([
      ["identical.txt", "same"],
      ["shared.txt", "new"],
      ["only-right.txt", "R"],
    ]);
    const { entries } = compareTrees(left, right);
    expect(entries.find((e) => e.rel === "identical.txt")?.status).toBe("identical");
    expect(entries.find((e) => e.rel === "shared.txt")?.status).toBe("modified");
    expect(entries.find((e) => e.rel === "only-left.txt")?.status).toBe("added-left");
    expect(entries.find((e) => e.rel === "only-right.txt")?.status).toBe("added-right");
    expect(statusLabel(entries.find((e) => e.rel === "only-right.txt")!)).toBe("added to right");
  });

  it("honors ignore globs and exclude checkboxes", () => {
    expect(shouldIgnore(".git/HEAD", [".git"])).toBe(true);
    const { entries } = compareTrees(
      new Map([
        [".git/config", "x"],
        ["a.txt", "1"],
      ]),
      new Map([["a.txt", "1"]]),
    );
    expect(entries.some((e) => e.rel.startsWith(".git"))).toBe(false);
    const hidden = filterEntries(entries, {
      identical: true,
      modified: false,
      addedLeft: false,
      addedRight: false,
    });
    expect(hidden).toHaveLength(0);
  });
});

describe("functions", () => {
  it("extracts js and python names", () => {
    const js = extractFunctions("function greet() {}\nconst foo = () => 1;\n");
    expect(js.map((f) => f.name)).toContain("greet");
    const py = extractFunctions("def bar():\n    pass\nclass Baz:\n    pass\n");
    expect(py.map((f) => f.name)).toEqual(expect.arrayContaining(["bar", "Baz"]));
  });
});

describe("filters", () => {
  it("substitutes $(FILE) in preprocessor commands", () => {
    expect(applyFilterCommand("cat $(FILE)", "/tmp/a.txt")).toBe("cat /tmp/a.txt");
  });
});

describe("splitLines", () => {
  it("drops a trailing empty split from a final newline", () => {
    expect(splitLines("a\nb\n")).toEqual(["a", "b"]);
  });
});

