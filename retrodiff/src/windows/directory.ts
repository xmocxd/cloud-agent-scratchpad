import { AquaWindow } from "../aqua/window.ts";
import { el } from "../aqua/dom.ts";
import {
  type DirEntry,
  type ExcludeSet,
  filterEntries,
  statusLabel,
} from "../engine/directory.ts";

export function openDirectoryWindow(
  desktop: HTMLElement,
  leftRoot: string,
  rightRoot: string,
  entries: DirEntry[],
  contents: Map<string, { left?: string; right?: string }>,
  onViewComparison: (rel: string, leftText: string, rightText: string) => void,
  onViewFile: (title: string, text: string) => void,
  onCombine: (picked: DirEntry[]) => void,
  opts?: { excludeIdentical?: boolean; onWriteFile?: (name: string, text: string) => void },
): AquaWindow {
  const win = new AquaWindow({
    title: "Directory Compare",
    x: 60,
    y: 40,
    w: 720,
    h: 460,
  });
  win.body.style.padding = "0";
  win.body.style.minHeight = "0";
  win.body.style.overflow = "hidden";
  win.body.style.display = "flex";
  win.body.style.flexDirection = "column";

  const excl: ExcludeSet = {
    identical: Boolean(opts?.excludeIdentical),
    modified: false,
    addedLeft: false,
    addedRight: false,
  };
  let selected: DirEntry | null = null;
  const picked = new Set<string>();

  const layout = el("div", { class: "dir-layout" });
  const list = el("div", { class: "dir-list" });
  const side = el("div", { class: "dir-side" });

  const exclude = el("div", { class: "exclude-box" });
  exclude.append(el("h4", { text: "Exclude" }));
  const boxes: Array<[string, keyof ExcludeSet]> = [
    ["Identical", "identical"],
    ["Modified", "modified"],
    ["Added to left", "addedLeft"],
    ["Added to right", "addedRight"],
  ];
  for (const [label, key] of boxes) {
    const lab = el("label");
    const cb = el("input", { type: "checkbox" }) as HTMLInputElement;
    cb.checked = excl[key];
    cb.addEventListener("change", () => {
      excl[key] = cb.checked;
      renderList();
    });
    lab.append(cb, document.createTextNode(" " + label));
    exclude.append(lab);
  }

  const viewBtn = el("div", { class: "popup-label" });
  viewBtn.append(el("span", { text: "View" }), el("span", { text: "▾" }));
  const viewMenu = el("select", { class: "overlay-select" }) as HTMLSelectElement;
  viewMenu.innerHTML = `
    <option>View</option>
    <option value="comparison">Comparison</option>
    <option value="left">Left File</option>
    <option value="right">Right File</option>
    <option value="ancestor">Ancestor</option>
    <option value="merge">Merge</option>
  `;
  viewBtn.append(viewMenu);
  viewMenu.addEventListener("change", () => {
    const v = viewMenu.value;
    viewMenu.value = "View";
    if (!selected) return;
    const rec = contents.get(selected.rel) ?? {};
    if (v === "comparison" && rec.left != null && rec.right != null) {
      onViewComparison(selected.rel, rec.left, rec.right);
    } else if (v === "left" && rec.left != null) onViewFile(selected.rel + " (left)", rec.left);
    else if (v === "right" && rec.right != null) onViewFile(selected.rel + " (right)", rec.right);
    else if (v === "ancestor" || v === "merge") onViewFile(selected.rel + ` (${v})`, rec.left ?? rec.right ?? "");
  });

  const mergeBtn = el("div", { class: "popup-label" });
  mergeBtn.append(el("span", { text: "Merge" }), el("span", { text: "▾" }));
  const mergeMenu = el("select", { class: "overlay-select" }) as HTMLSelectElement;
  mergeMenu.innerHTML = `
    <option>Merge</option>
    <option value="combine">Combine Files</option>
    <option value="left">Choose left</option>
    <option value="right">Choose right</option>
    <option value="remove">Remove from list</option>
    <option value="drop">Remove incomparable</option>
  `;
  mergeBtn.append(mergeMenu);
  mergeMenu.addEventListener("change", () => {
    const v = mergeMenu.value;
    mergeMenu.value = "Merge";
    const items = entries.filter((e) => picked.has(e.rel) || e.rel === selected?.rel);
    if (v === "combine") onCombine(items.length ? items : filterEntries(entries, excl));
    if ((v === "left" || v === "right") && selected) {
      const rec = contents.get(selected.rel) ?? {};
      const body = v === "left" ? rec.left : rec.right;
      if (body != null) opts?.onWriteFile?.(selected.rel, body);
    }
    if (v === "remove" && selected) {
      const i = entries.indexOf(selected);
      if (i >= 0) entries.splice(i, 1);
      renderList();
    }
    if (v === "drop") {
      for (let i = entries.length - 1; i >= 0; i--) {
        if (entries[i].status === "added-left" || entries[i].status === "added-right") entries.splice(i, 1);
      }
      renderList();
    }
  });

  const status = el("div", { class: "dir-status", text: `${leftRoot}  |  ${rightRoot}` });
  side.append(exclude, viewBtn, mergeBtn, status);
  layout.append(list, side);
  win.body.append(layout);

  function renderList(): void {
    list.innerHTML = "";
    for (const e of filterEntries(entries, excl)) {
      const item = el("div", { class: "dir-item", text: e.rel });
      if (e.status === "identical") item.classList.add("identical");
      if (e.status === "added-left" || e.status === "added-right") item.classList.add("unique");
      if (selected?.rel === e.rel) item.classList.add("selected");
      item.addEventListener("click", (ev) => {
        if (ev.metaKey || ev.ctrlKey) {
          if (picked.has(e.rel)) picked.delete(e.rel);
          else picked.add(e.rel);
        } else {
          picked.clear();
          picked.add(e.rel);
        }
        selected = e;
        status.textContent = `${e.rel} — ${statusLabel(e)}`;
        renderList();
      });
      item.addEventListener("dblclick", () => {
        const rec = contents.get(e.rel) ?? {};
        if (rec.left != null && rec.right != null) onViewComparison(e.rel, rec.left, rec.right);
      });
      list.append(item);
    }
  }
  renderList();

  win.root.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "a") {
      e.preventDefault();
      for (const ent of filterEntries(entries, excl)) picked.add(ent.rel);
      renderList();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "1") {
      e.preventDefault();
      onCombine([...picked].map((r) => entries.find((e) => e.rel === r)!).filter(Boolean));
    }
  });

  desktop.append(win.root);
  return win;
}

export function openTextPreview(desktop: HTMLElement, title: string, text: string): void {
  const win = new AquaWindow({ title, x: 120, y: 80, w: 560, h: 400 });
  const ta = el("textarea") as HTMLTextAreaElement;
  ta.value = text;
  ta.readOnly = true;
  ta.style.width = "100%";
  ta.style.height = "100%";
  win.body.style.padding = "0";
  win.body.append(ta);
  desktop.append(win.root);
}
