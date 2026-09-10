import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const opendiff = join(root, "bin/opendiff.mjs");
const left = join(root, "samples/merge/left.txt");
const right = join(root, "samples/merge/right.txt");
const base = join(root, "samples/merge/base.txt");

describe("opendiff mergetool protocol", () => {
  it("writes MERGED with --test-save (git check_unchanged success path)", () => {
    const dir = mkdtempSync(join(tmpdir(), "rd-merge-"));
    const out = join(dir, "MERGED.txt");
    execFileSync("node", [opendiff, left, right, "-ancestor", base, "-merge", out, "--test-save"], {
      cwd: root,
      encoding: "utf8",
    });
    expect(existsSync(out)).toBe(true);
    const text = readFileSync(out, "utf8");
    expect(text).toContain("alpha");
    expect(text.split("\n").length).toBeGreaterThan(3);
  });

  it("does not write MERGED with --test-abort (git prompts unchanged)", () => {
    const dir = mkdtempSync(join(tmpdir(), "rd-abort-"));
    const out = join(dir, "MERGED.txt");
    execFileSync("node", [opendiff, left, right, "-merge", out, "--test-abort"], { cwd: root });
    expect(existsSync(out)).toBe(false);
  });
});
