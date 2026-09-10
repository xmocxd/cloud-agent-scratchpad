import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { diffWithOptionalAncestor } from "./engine/diff3.ts";
import { buildMerge } from "./engine/diff.ts";
import { compareTrees, DEFAULT_IGNORE } from "./engine/directory.ts";

function usage(): never {
  console.error(`usage: opendiff file1 file2 [-ancestor ancestor] [-merge dest]
       opendiff dir1 dir2 [-ancestor ancestorDir] [-merge destDir]`);
  process.exit(2);
  throw new Error("usage");
}

function parse(argv: string[]) {
  const args = argv.slice(2);
  const testSave = args.includes("--test-save");
  const testAbort = args.includes("--test-abort");
  const rest = args.filter((a) => a !== "--test-save" && a !== "--test-abort");
  const positional: string[] = [];
  let ancestor: string | undefined;
  let merge: string | undefined;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "-ancestor") ancestor = rest[++i];
    else if (rest[i] === "-merge") merge = rest[++i];
    else positional.push(rest[i]);
  }
  if (positional.length < 2) usage();
  return { left: positional[0], right: positional[1], ancestor, merge, testSave, testAbort };
}

function walkFiles(root: string, ignore: string[]): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (ignore.includes(name)) continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else out.set(relative(root, p).replaceAll("\\", "/"), readFileSync(p, "utf8"));
    }
  };
  walk(root);
  return out;
}

async function main() {
  const opts = parse(process.argv);
  const leftPath = resolve(opts.left);
  const rightPath = resolve(opts.right);
  if (!existsSync(leftPath) || !existsSync(rightPath)) {
    console.error("opendiff: file or directory not found");
    process.exit(1);
  }
  const leftStat = statSync(leftPath);
  const rightStat = statSync(rightPath);

  if (leftStat.isDirectory() && rightStat.isDirectory()) {
    const l = walkFiles(leftPath, DEFAULT_IGNORE);
    const r = walkFiles(rightPath, DEFAULT_IGNORE);
    const result = compareTrees(l, r);
    if (opts.testSave && opts.merge) {
      mkdirSync(opts.merge, { recursive: true });
      for (const e of result.entries) {
        const body = r.get(e.rel) ?? l.get(e.rel) ?? "";
        const dest = join(opts.merge, e.rel);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, body);
      }
      return;
    }
    if (opts.testAbort) return;
    printWaitNote(opts);
    return;
  }

  const leftText = readFileSync(leftPath, "utf8");
  const rightText = readFileSync(rightPath, "utf8");
  const ancestorText = opts.ancestor && existsSync(opts.ancestor) ? readFileSync(opts.ancestor, "utf8") : undefined;
  const hunks = diffWithOptionalAncestor(leftText, rightText, ancestorText);
  const merged = buildMerge(hunks);

  if (opts.testAbort) return;
  if (opts.testSave) {
    if (!opts.merge) usage();
    mkdirSync(dirname(resolve(opts.merge)), { recursive: true });
    writeFileSync(opts.merge, merged);
    return;
  }

  printWaitNote(opts);
  const port = process.env.RETRODIFF_PORT || "4173";
  const params = new URLSearchParams({
    left: leftPath,
    right: rightPath,
  });
  if (opts.ancestor) params.set("ancestor", opts.ancestor);
  if (opts.merge) params.set("merge", opts.merge);
  const url = `http://127.0.0.1:${port}/?${params.toString()}`;
  console.error(`RetroDiff: open ${url}`);
  if (!process.stdout.isTTY) {
    await new Promise<void>((resolveWait) => {
      const timer = setTimeout(resolveWait, Number(process.env.RETRODIFF_WAIT_MS || 3_600_000));
      process.on("SIGINT", () => {
        clearTimeout(timer);
        resolveWait();
      });
      if (opts.merge) {
        const t = setInterval(() => {
          if (existsSync(opts.merge!) && statSync(opts.merge!).mtimeMs > Date.now() - 5000) {
            /* still wait for explicit close in GUI; tests use --test-save */
          }
        }, 500);
        process.on("exit", () => clearInterval(t));
      }
    });
  }
}

function printWaitNote(opts: { merge?: string }) {
  if (process.stdout.isTTY) {
    console.error("opendiff: handed off to RetroDiff GUI (TTY; not waiting)");
  } else {
    console.error("opendiff: waiting until comparison is dismissed (stdout is a pipe)");
  }
  void opts;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
