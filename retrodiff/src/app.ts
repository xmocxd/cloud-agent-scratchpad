import "./aqua/aqua.css";
import { el } from "./aqua/dom.ts";
import { loadSettings, type Settings } from "./engine/settings.ts";
import { diffWithOptionalAncestor } from "./engine/diff3.ts";
import { buildMerge } from "./engine/diff.ts";
import { compareTrees, type DirEntry } from "./engine/directory.ts";
import { openCompareWindow, type ComparePaths } from "./windows/compare.ts";
import {
  activeComparison,
  beepNav,
  openComparisonWindow,
  type ComparisonSession,
} from "./windows/comparison.ts";
import { openDirectoryWindow, openTextPreview } from "./windows/directory.ts";
import { openSettingsWindow } from "./windows/settings.ts";
import { openFindWindow, openGoToWindow } from "./windows/find.ts";
import wikiLeft from "../samples/wikipedia/left.txt?raw";
import wikiRight from "../samples/wikipedia/right.txt?raw";
import mergeBase from "../samples/merge/base.txt?raw";
import mergeLeft from "../samples/merge/left.txt?raw";
import mergeRight from "../samples/merge/right.txt?raw";
import identL from "../samples/left-dir/identical.txt?raw";
import identR from "../samples/right-dir/identical.txt?raw";
import sharedL from "../samples/left-dir/shared.txt?raw";
import sharedR from "../samples/right-dir/shared.txt?raw";
import onlyL from "../samples/left-dir/only-left.txt?raw";
import onlyR from "../samples/right-dir/only-right.txt?raw";

export interface AppState {
  settings: Settings;
  lastCompare: ComparePaths | null;
  lastSession: ComparisonSession | null;
  mergeDest: string;
  waitClose: (() => void) | null;
}

const state: AppState = {
  settings: loadSettings(),
  lastCompare: null,
  lastSession: null,
  mergeDest: "",
  waitClose: null,
};

const isMac = navigator.platform.includes("Mac");
const mod = (e: KeyboardEvent) => (isMac ? e.metaKey : e.ctrlKey);

export function boot(): void {
  const app = document.getElementById("app")!;
  const menubar = el("div", { id: "menubar" });
  const desktop = el("div", { id: "desktop" });
  app.append(menubar, desktop);
  buildMenus(menubar, desktop);
  bindKeys(desktop);
  applyQuery(desktop);
  if (!location.search) {
    openCompareWindow(desktop, (p) => runCompare(desktop, p), {
      left: "samples/wikipedia/left.txt",
      right: "samples/wikipedia/right.txt",
      leftText: wikiLeft,
      rightText: wikiRight,
    });
  }
}

function applyQuery(desktop: HTMLElement): void {
  const q = new URLSearchParams(location.search);
  const left = q.get("left");
  const right = q.get("right");
  if (!left || !right) return;
  const ancestor = q.get("ancestor") ?? "";
  const merge = q.get("merge") ?? "";
  const demo = q.get("demo");
  let leftText = wikiLeft;
  let rightText = wikiRight;
  let ancestorText = "";
  if (demo === "merge") {
    leftText = mergeLeft;
    rightText = mergeRight;
    ancestorText = mergeBase;
  }
  if (q.get("dir") === "1") {
    runDirectory(desktop);
    return;
  }
  runCompare(desktop, {
    left,
    right,
    ancestor,
    merge,
    leftText,
    rightText,
    ancestorText: ancestor ? ancestorText || mergeBase : undefined,
  });
}

function runCompare(desktop: HTMLElement, p: ComparePaths): void {
  state.lastCompare = p;
  state.mergeDest = p.merge;
  const leftText = p.leftText ?? wikiLeft;
  const rightText = p.rightText ?? wikiRight;
  const ancestorText = p.ancestor ? p.ancestorText ?? mergeBase : undefined;
  const hunks = diffWithOptionalAncestor(leftText, rightText, ancestorText);
  const session: ComparisonSession = {
    leftPath: p.left || "Left",
    rightPath: p.right || "Right",
    mergePath: p.merge,
    leftText,
    rightText,
    hunks,
    original: hunks.map((h) => ({ ...h })),
  };
  state.lastSession = session;
  openComparisonWindow(desktop, session, state.settings, {
    onDirtyClose: (save) => {
      if (save) saveMerge(session, buildMerge(session.hunks), false);
      state.waitClose?.();
    },
    onSave: (text, asCopy) => saveMerge(session, text, asCopy),
  });
}

function saveMerge(session: ComparisonSession, text: string, asCopy: boolean): void {
  const dest = !asCopy && (session.mergePath || state.mergeDest);
  if (dest) {
    downloadOrRemember(dest, text);
    return;
  }
  const name = window.prompt("Save merge as:", "merged.txt");
  if (!name) return;
  downloadOrRemember(name, text);
}

function downloadOrRemember(name: string, text: string): void {
  (window as unknown as { __RETRODIFF_LAST_MERGE?: string }).__RETRODIFF_LAST_MERGE = text;
  (window as unknown as { __RETRODIFF_LAST_MERGE_PATH?: string }).__RETRODIFF_LAST_MERGE_PATH = name;
  const blob = new Blob([text], { type: "text/plain" });
  const a = el("a") as HTMLAnchorElement;
  a.href = URL.createObjectURL(blob);
  a.download = name.split(/[/\\]/).pop() || "merged.txt";
  a.click();
}

function recompare(desktop: HTMLElement): void {
  if (state.lastCompare) runCompare(desktop, state.lastCompare);
}

function runDirectory(desktop: HTMLElement): void {
  const leftFiles = new Map([
    ["identical.txt", identL],
    ["shared.txt", sharedL],
    ["only-left.txt", onlyL],
  ]);
  const rightFiles = new Map([
    ["identical.txt", identR],
    ["shared.txt", sharedR],
    ["only-right.txt", onlyR],
  ]);
  const { entries } = compareTrees(leftFiles, rightFiles, state.settings.filesToIgnore);
  const contents = new Map<string, { left?: string; right?: string }>();
  for (const e of entries) {
    contents.set(e.rel, { left: leftFiles.get(e.rel), right: rightFiles.get(e.rel) });
  }
  openDirectoryWindow(
    desktop,
    "samples/left-dir",
    "samples/right-dir",
    entries,
    contents,
    (rel, l, r) => {
      runCompare(desktop, {
        left: rel,
        right: rel,
        ancestor: "",
        merge: "",
        leftText: l,
        rightText: r,
      });
    },
    (title, text) => openTextPreview(desktop, title, text),
    (picked: DirEntry[]) => {
      const out: string[] = [];
      for (const e of picked.length ? picked : entries) {
        const rec = contents.get(e.rel);
        const body = rec?.right ?? rec?.left ?? "";
        out.push(`===== ${e.rel} =====\n${body}`);
      }
      const name = window.prompt("Combined directory name:", "merged-dir.txt");
      if (name) downloadOrRemember(name, out.join("\n"));
    },
  );
}

function buildMenus(bar: HTMLElement, desktop: HTMLElement): void {
  bar.append(
    menu("RetroDiff", [
      item("About RetroDiff", () => about(desktop)),
      sep(),
      item("Settings…", () => openSettingsWindow(desktop, state.settings, (s) => (state.settings = s)), ",", true),
    ]),
    menu("File", [
      item("Compare Files…", () => openCompareWindow(desktop, (p) => runCompare(desktop, p)), "O", true),
      item("Recompare Files", () => recompare(desktop)),
      item("Compare Sample Directories", () => runDirectory(desktop)),
      sep(),
      item("Save Merge", () => activeComparison()?.save(false), "S", true),
      item("Save Merge As…", () => activeComparison()?.save(true), "S", true, true),
      sep(),
      item("Close", () => (document.querySelector(".window.focused") as HTMLElement | null)?.querySelector(".dot.close")?.dispatchEvent(new Event("click")), "W", true),
    ]),
    menu("Edit", [
      item("Undo", () => document.execCommand("undo"), "Z", true),
      item("Redo", () => document.execCommand("redo"), "Z", true, true),
      sep(),
      item("Cut", () => document.execCommand("cut"), "X", true),
      item("Copy", () => document.execCommand("copy"), "C", true),
      item("Paste", () => document.execCommand("paste"), "V", true),
      item("Select All", () => onSelectAll(), "A", true),
    ]),
    menu("Find", [
      submenu("Go to Next", [
        item("Difference", () => navChange(1)),
        item("Left", () => navSide("left", 1)),
        item("Right", () => navSide("right", 1)),
        item("Conflict", () => navConflict(1), "D", true),
      ]),
      submenu("Go to Previous", [
        item("Difference", () => navChange(-1)),
        item("Left", () => navSide("left", -1)),
        item("Right", () => navSide("right", -1)),
        item("Conflict", () => navConflict(-1), "D", true, true),
      ]),
      item("Go to Line/Difference…", () => openGoToWindow(desktop), "L", true),
      sep(),
      item("Find…", () => openFindWindow(desktop), "F", true),
      item("Find Next", () => window.find?.(findNeedle(), false, false), "G", true),
      item("Find Previous", () => window.find?.(findNeedle(), false, true), "G", true, true),
      item("Use Selection for Find", () => useSelFind(desktop), "E", true),
      item("Jump to Selection", () => activeComparison()?.view.jumpToSelection(), "J", true),
    ]),
    menu("Help", [item("RetroDiff Help", () => help(desktop))]),
  );
}

function findNeedle(): string {
  return (window as unknown as { __find?: string }).__find || "";
}

function useSelFind(desktop: HTMLElement): void {
  const t = window.getSelection()?.toString() || activeComparison()?.view.selectedText() || "";
  (window as unknown as { __find?: string }).__find = t;
  const w = openFindWindow(desktop);
  const input = w.body.querySelector("input") as HTMLInputElement;
  input.value = t;
}

function onSelectAll(): void {
  const cmp = activeComparison();
  const ae = document.activeElement;
  if (ae instanceof HTMLTextAreaElement || ae instanceof HTMLInputElement) {
    ae.select();
    return;
  }
  if (cmp) {
    cmp.view.selectAllChanges();
    cmp.focusGutter();
  }
}

function navChange(dir: 1 | -1): void {
  const cmp = activeComparison();
  if (!cmp) return;
  cmp.focusGutter();
  if (!cmp.view.nextChange(dir)) beepNav();
}

function navConflict(dir: 1 | -1): void {
  const cmp = activeComparison();
  if (!cmp) return;
  cmp.focusGutter();
  if (!cmp.view.nextConflict(dir)) beepNav();
}

function navSide(side: "left" | "right", dir: 1 | -1): void {
  const cmp = activeComparison();
  if (!cmp) return;
  cmp.focusGutter();
  if (!cmp.view.nextSide(side, dir)) beepNav();
}

function bindKeys(desktop: HTMLElement): void {
  window.addEventListener("keydown", (e) => {
    const cmp = activeComparison();
    const typing =
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLInputElement;

    if (mod(e) && e.key === ",") {
      e.preventDefault();
      openSettingsWindow(desktop, state.settings, (s) => (state.settings = s));
    }
    if (mod(e) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      cmp?.save(e.shiftKey);
    }
    if (mod(e) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      openFindWindow(desktop);
    }
    if (mod(e) && e.key.toLowerCase() === "g") {
      e.preventDefault();
      window.find?.(findNeedle(), false, e.shiftKey);
    }
    if (mod(e) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      openGoToWindow(desktop);
    }
    if (mod(e) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      navConflict(e.shiftKey ? -1 : 1);
    }
    if (mod(e) && e.key.toLowerCase() === "a" && !typing) {
      e.preventDefault();
      onSelectAll();
    }
    if (mod(e) && e.key.toLowerCase() === "w") {
      e.preventDefault();
      (document.querySelector(".window.focused") as HTMLElement | null)?.querySelector(".dot.close")?.dispatchEvent(new MouseEvent("click"));
    }
    if (e.key === "Escape") return;

    if (typing) return;
    if (!cmp) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!cmp.view.nextChange(1)) beepNav();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!cmp.view.nextChange(-1)) beepNav();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      cmp.applyToSelection("left");
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      cmp.applyToSelection("right");
    }
  });
}

function menu(name: string, children: HTMLElement[]): HTMLElement {
  const root = el("div", { class: "menu-root" });
  root.append(el("span", { text: name }));
  const popup = el("div", { class: "menu-popup" });
  popup.append(...children);
  root.append(popup);
  root.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".menu-root").forEach((m) => m.classList.remove("open"));
    root.classList.add("open");
  });
  document.addEventListener("click", () => root.classList.remove("open"));
  return root;
}

function submenu(name: string, children: HTMLElement[]): HTMLElement {
  const it = el("div", { class: "menu-item menu-sub", text: name });
  const popup = el("div", { class: "menu-popup" });
  popup.append(...children);
  it.append(popup);
  return it;
}

function item(label: string, fn: () => void, key?: string, cmd?: boolean, shift?: boolean): HTMLElement {
  const it = el("div", { class: "menu-item" });
  it.append(el("span", { text: label }));
  if (key) {
    const seq = `${shift ? "⇧" : ""}${cmd ? (isMac ? "⌘" : "Ctrl+") : ""}${key}`;
    it.append(el("span", { class: "kbd", text: seq }));
  }
  it.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".menu-root").forEach((m) => m.classList.remove("open"));
    fn();
  });
  return it;
}

function sep(): HTMLElement {
  return el("div", { class: "menu-sep" });
}

function about(desktop: HTMLElement): void {
  const win = el("div", { class: "window focused" });
  win.style.cssText = "left:220px;top:120px;width:360px;height:220px;z-index:500;";
  win.innerHTML = `<div class="titlebar"><div class="traffic"><div class="dot close"></div></div><div class="title">About RetroDiff</div></div>`;
  const body = el("div", { class: "window-body about-logo" });
  body.innerHTML = `<strong>RetroDiff</strong><div>0.1.0</div>
    <p class="fine">Independent visual diff &amp; merge tool. Compatible with Git’s opendiff mergetool protocol.
    Not affiliated with Apple Inc. FileMerge, Aqua, and Xcode are trademarks of Apple Inc.</p>`;
  win.querySelector(".dot.close")!.addEventListener("click", () => win.remove());
  win.append(body);
  desktop.append(win);
}

function help(desktop: HTMLElement): void {
  openTextPreview(
    desktop,
    "RetroDiff Help",
    `RetroDiff — visual compare and merge

Compare Files: set Left and Right, click Compare.
Drag the compare window taller for Ancestor / Merge paths.

Diff window:
  Click the center gutter to select a change.
  Up/Down  next/previous difference
  Left/Right  choose left/right for merge
  ${isMac ? "⌘" : "Ctrl+"}D / Shift+D  next/previous conflict
  ${isMac ? "⌘" : "Ctrl+"}S  Save Merge

Git mergetool:
  git config --global merge.tool opendiff
  git config --global mergetool.opendiff.path /path/to/retrodiff/bin/opendiff.mjs
`,
  );
}

declare global {
  interface Window {
    find?(a: string, b?: boolean, c?: boolean): boolean;
  }
}
