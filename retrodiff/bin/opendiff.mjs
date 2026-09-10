#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, "../src/cli.ts");
const r = spawnSync("npx", ["tsx", cli, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: join(here, ".."),
  env: process.env,
});
process.exit(r.status ?? 1);
