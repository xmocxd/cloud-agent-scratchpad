import { AquaWindow } from "../aqua/window.ts";
import { beep, el } from "../aqua/dom.ts";
import { DiffView } from "../diff-view/DiffView.ts";
import {
  applyChoice,
  buildMerge,
  changeHunks,
  type Hunk,
  type MergeChoice,
  touchedHunks,
} from "../engine/diff.ts";
import { extractFunctions } from "../engine/functions.ts";
import type { Settings } from "../engine/settings.ts";

export interface ComparisonSession {
  leftPath: string;
  rightPath: string;
  mergePath: string;
  leftText: string;
  rightText: string;
  hunks: Hunk[];
  original: Hunk[];
}

export function openComparisonWindow(
  desktop: HTMLElement,
  session: ComparisonSession,
  settings: Settings,
  hooks: {
    onDirtyClose: (save: boolean) => void;
    onSave: (text: string, asCopy: boolean) => void;
  },
): { win: AquaWindow; view: DiffView; session: ComparisonSession } {
  const win = new AquaWindow({
    title: `${fileName(session.leftPath)} vs ${fileName(session.rightPath)}`,
    x: 36,
    y: 36,
    w: 920,
    h: 560,
    onClose: () => {
      if (touchedHunks(session.hunks, session.original) || mergeEdited) {
        const r = confirmSave();
        if (r === "cancel") return false;
        hooks.onDirtyClose(r === "save");
      }
      return true;
    },
  });
  win.body.style.padding = "0";
  win.body.style.display = "flex";
  win.body.style.flexDirection = "column";
  win.body.style.minHeight = "0";

  const root = el("div", { class: "diff-root" });
  const headers = el("div", { class: "diff-headers" });
  const leftFn = el("select") as HTMLSelectElement;
  const rightFn = el("select") as HTMLSelectElement;
  fillFns(leftFn, session.leftText);
  fillFns(rightFn, session.rightText);
  headers.append(leftFn, el("div"), rightFn);

  const view = new DiffView(session.hunks, settings);
  view.setWrap(settings.wrapText);

  let mergeEdited = false;
  let mergeHeight = 0;
  const split = el("div", { class: "merge-split" });
  const drawer = el("div", { class: "merge-drawer" });
  drawer.style.height = "0px";
  drawer.style.overflow = "hidden";
  const ta = el("textarea") as HTMLTextAreaElement;
  ta.style.fontFamily = settings.fontFamily;
  ta.style.fontSize = `${settings.fontSize}px`;
  ta.value = buildMerge(session.hunks);
  ta.addEventListener("input", () => {
    mergeEdited = true;
  });
  const bar = el("div", { class: "merge-bar" });
  const actLabel = el("label", { text: "Actions:" });
  const actions = el("select") as HTMLSelectElement;
  actions.innerHTML = `
    <option value="">Actions</option>
    <option value="left">Choose left</option>
    <option value="right">Choose right</option>
    <option value="both-left">Choose both (left first)</option>
    <option value="both-right">Choose both (right first)</option>
    <option value="neither">Choose neither</option>
  `;
  actions.addEventListener("change", () => {
    const v = actions.value as MergeChoice | "";
    actions.value = "";
    if (!v) return;
    applyToSelection(v);
  });
  bar.append(actLabel, actions);
  drawer.append(ta, bar);

  let drag = false;
  let startY = 0;
  let startH = 0;
  split.addEventListener("mousedown", (e) => {
    drag = true;
    startY = e.clientY;
    startH = mergeHeight;
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!drag) return;
    mergeHeight = Math.max(0, Math.min(win.root.clientHeight - 120, startH + (startY - e.clientY)));
    drawer.style.height = `${mergeHeight}px`;
    view.redraw();
  });
  window.addEventListener("mouseup", () => {
    drag = false;
  });

  function refreshMerge(): void {
    if (!mergeEdited) ta.value = buildMerge(session.hunks);
    view.setHunks(session.hunks);
  }

  function applyToSelection(choice: MergeChoice): void {
    const ids = new Set(view.selectedIds());
    if (!ids.size && view.selectedId != null) ids.add(view.selectedId);
    session.hunks = session.hunks.map((h) => (ids.has(h.id) ? applyChoice(h, choice) : h));
    refreshMerge();
  }

  view.onSelect = () => {};
  leftFn.addEventListener("change", () => view.gotoLine("left", Number(leftFn.value)));
  rightFn.addEventListener("change", () => view.gotoLine("right", Number(rightFn.value)));

  root.append(headers, view.root, split, drawer);
  win.body.append(root);
  desktop.append(win.root);

  const first = changeHunks(session.hunks)[0];
  if (first) view.select(first.id);

  (win.root as HTMLElement & { __cmp?: ComparisonApi }).__cmp = {
    session,
    view,
    applyToSelection,
    save(asCopy: boolean) {
      hooks.onSave(ta.value, asCopy);
    },
    getMergeText: () => ta.value,
    isDirty: () => touchedHunks(session.hunks, session.original) || mergeEdited,
    focusGutter: () => {
      view.gutterFocused = true;
    },
  };

  requestAnimationFrame(() => view.redraw());
  return { win, view, session };
}

export interface ComparisonApi {
  session: ComparisonSession;
  view: DiffView;
  applyToSelection: (c: MergeChoice) => void;
  save: (asCopy: boolean) => void;
  getMergeText: () => string;
  isDirty: () => boolean;
  focusGutter: () => void;
}

export function activeComparison(): ComparisonApi | null {
  const w = document.querySelector(".window.focused") as (HTMLElement & { __cmp?: ComparisonApi }) | null;
  return w?.__cmp ?? null;
}

function fillFns(sel: HTMLSelectElement, text: string): void {
  sel.append(new Option("(Functions)", "1"));
  for (const f of extractFunctions(text)) {
    sel.append(new Option(f.name, String(f.line + 1)));
  }
}

function fileName(p: string): string {
  if (!p) return "untitled";
  return p.split(/[/\\]/).pop() || p;
}

function confirmSave(): "save" | "dont" | "cancel" {
  const ok = window.confirm("Save merge before closing?");
  if (ok) return "save";
  const really = window.confirm("Don't Save? (Cancel = keep window open)\nClick OK for Don't Save, Cancel to keep open.");
  if (!really) return "cancel";
  return "dont";
}

export function beepNav(): void {
  beep();
}
