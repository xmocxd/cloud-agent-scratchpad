# RetroDiff

Standalone visual diff and merge tool for macOS, Windows, and Linux. Layout and behavior follow Apple FileMerge as documented publicly. **RetroDiff is not affiliated with Apple.** FileMerge, Aqua, and Xcode are trademarks of Apple Inc.

## Run (browser UI)

```bash
cd retrodiff
npm install
npm test
npm run test:rust
npm run dev
```

Open http://127.0.0.1:4173/ — sample files are preloaded (Wikipedia diff example).

Demo query strings:

- `/?left=left.txt&right=right.txt` — file compare
- `/?demo=merge&left=l&right=r&ancestor=b` — three-way ancestor sample
- `/?dir=1` — directory compare sample

## Tests

```bash
npm test
npm run test:rust
node bin/opendiff.mjs samples/merge/left.txt samples/merge/right.txt \
  -ancestor samples/merge/base.txt -merge /tmp/retrodiff-merged.txt --test-save
```

## Git mergetool / difftool (`opendiff` protocol)

```bash
git config --global merge.tool opendiff
git config --global mergetool.opendiff.path /absolute/path/to/retrodiff/bin/opendiff.mjs
git config --global diff.tool opendiff
git config --global difftool.opendiff.path /absolute/path/to/retrodiff/bin/opendiff.mjs
```

```text
opendiff "$LOCAL" "$REMOTE" -ancestor "$BASE" -merge "$MERGED"
opendiff "$LOCAL" "$REMOTE" -merge "$MERGED"
opendiff "$LOCAL" "$REMOTE"
```

Leave `trustExitCode` unset. Git succeeds if `MERGED` is newer than its backup (Save Merge). `--test-save` writes the default merge for automation.

Start `npm run dev` before GUI mergetool sessions. Piped stdout waits (Git’s `| cat` contract). On a TTY the launcher returns after hand-off.

## Desktop packages (Tauri)

```bash
npm run build
npx tauri build
```

Requires platform WebView (WebKitGTK on Linux, WebView2 on Windows). See `src-tauri/tauri.conf.json`.

## Keyboard

Click a numbered gutter arrow first. Merge-drawer typing uses normal text keys.

- Up / Down — next / previous difference
- Left / Right — choose left / right
- ⌘/Ctrl-A — select all differences
- ⌘/Ctrl-D / Shift-D — next / previous conflict
- ⌘/Ctrl-S — Save Merge (writes `-merge` path when set)
- Directory: ⌘/Ctrl-1 Combine Files
