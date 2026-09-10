import { AquaWindow } from "../aqua/window.ts";
import { docIcon, el } from "../aqua/dom.ts";

export interface ComparePaths {
  left: string;
  right: string;
  ancestor: string;
  merge: string;
  leftText?: string;
  rightText?: string;
  ancestorText?: string;
}

export function openCompareWindow(
  desktop: HTMLElement,
  onCompare: (p: ComparePaths) => void,
  initial?: Partial<ComparePaths>,
): AquaWindow {
  const win = new AquaWindow({ title: "Compare Files", x: 48, y: 48, w: 560, h: 188 });
  win.body.style.paddingBottom = "4px";
  win.body.style.display = "flex";
  win.body.style.flexDirection = "column";

  const state: ComparePaths = {
    left: initial?.left ?? "",
    right: initial?.right ?? "",
    ancestor: initial?.ancestor ?? "",
    merge: initial?.merge ?? "",
    leftText: initial?.leftText,
    rightText: initial?.rightText,
    ancestorText: initial?.ancestorText,
  };

  const extra = el("div");
  extra.style.display = "none";

  function pathRow(label: string, key: "left" | "right" | "ancestor" | "merge") {
    const row = el("div", { class: "row" });
    const btn = el("button", { text: `${label}…` });
    btn.style.width = "88px";
    const input = el("input", { type: "text", class: "path-field" }) as HTMLInputElement;
    input.value = state[key];
    input.addEventListener("input", () => {
      state[key] = input.value;
    });
    const well = el("div", { class: "well" });
    well.append(docIcon());
    well.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    well.addEventListener("drop", async (e) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      const text = await f.text();
      const path = (f as File & { path?: string }).path || f.name;
      state[key] = path;
      input.value = path;
      if (key === "left") state.leftText = text;
      if (key === "right") state.rightText = text;
      if (key === "ancestor") state.ancestorText = text;
      well.classList.add("loaded");
    });
    btn.addEventListener("click", () => {
      const picker = el("input", { type: "file" }) as HTMLInputElement;
      picker.addEventListener("change", async () => {
        const f = picker.files?.[0];
        if (!f) return;
        const text = await f.text();
        state[key] = f.name;
        input.value = f.name;
        if (key === "left") state.leftText = text;
        if (key === "right") state.rightText = text;
        if (key === "ancestor") state.ancestorText = text;
        well.classList.add("loaded");
      });
      picker.click();
    });
    row.append(btn, input, well);
    return { row, input, well };
  }

  const left = pathRow("Left", "left");
  const right = pathRow("Right", "right");
  extra.append(pathRow("Ancestor", "ancestor").row, pathRow("Merge", "merge").row);

  const hint = el("div", {
    class: "hint",
    text: "Enlarge window to specify ancestor and/or merge paths",
  });
  const actions = el("div", { class: "compare-actions" });
  const compareBtn = el("button", { class: "default", text: "Compare" });
  compareBtn.addEventListener("click", () => onCompare({ ...state }));
  actions.append(compareBtn);

  const grip = el("div", { class: "resize-s" });
  let resizing = false;
  let startY = 0;
  let startH = 0;
  grip.addEventListener("mousedown", (e) => {
    resizing = true;
    startY = e.clientY;
    startH = win.root.offsetHeight;
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!resizing) return;
    const h = Math.max(168, startH + (e.clientY - startY));
    win.root.style.height = `${h}px`;
    const show = h > 250;
    extra.style.display = show ? "block" : "none";
    hint.style.display = show ? "none" : "block";
  });
  window.addEventListener("mouseup", () => {
    resizing = false;
  });

  win.body.append(left.row, right.row, extra, hint, actions);
  win.root.append(grip);
  desktop.append(win.root);

  win.root.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onCompare({ ...state });
  });

  return win;
}
