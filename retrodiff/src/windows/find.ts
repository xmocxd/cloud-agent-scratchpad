import { AquaWindow } from "../aqua/window.ts";
import { el } from "../aqua/dom.ts";
import { activeComparison } from "./comparison.ts";

export function openFindWindow(desktop: HTMLElement): AquaWindow {
  const win = new AquaWindow({ title: "Find", x: 240, y: 120, w: 380, h: 140 });
  const input = el("input", { type: "text" }) as HTMLInputElement;
  input.style.width = "100%";
  const row = el("div", { class: "find-row" });
  const next = el("button", { class: "default", text: "Next" });
  const prev = el("button", { text: "Previous" });
  row.append(next, prev);
  win.body.append(el("div", { text: "Find:" }), input, row);
  input.addEventListener("input", () => {
    (window as unknown as { __find?: string }).__find = input.value;
  });

  function hunt(dir: 1 | -1) {
    const q = input.value;
    const cmp = activeComparison();
    if (!q || !cmp) return;
    const text = cmp.getMergeText();
    const start = dir > 0 ? 0 : text.length;
    void start;
    window.find?.(q, false, dir < 0);
  }
  next.addEventListener("click", () => hunt(1));
  prev.addEventListener("click", () => hunt(-1));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") hunt(e.shiftKey ? -1 : 1);
  });
  desktop.append(win.root);
  input.focus();
  return win;
}

export function openGoToWindow(desktop: HTMLElement): void {
  const win = new AquaWindow({ title: "Go to Line/Difference", x: 260, y: 140, w: 300, h: 130 });
  const input = el("input", { type: "number" }) as HTMLInputElement;
  const go = el("button", { class: "default", text: "Go" });
  go.addEventListener("click", () => {
    const n = Number(input.value);
    const cmp = activeComparison();
    if (!cmp || !n) return;
    const ch = cmp.session.hunks.find((h) => h.id === n && h.kind === "change");
    if (ch) cmp.view.select(ch.id);
    else cmp.view.gotoLine("left", n);
    win.close();
  });
  win.body.append(el("div", { text: "Line or difference number:" }), input, go);
  desktop.append(win.root);
  input.focus();
}
