import type { Hunk, MergeChoice } from "../engine/diff.ts";
import type { Settings } from "../engine/settings.ts";
import { el } from "../aqua/dom.ts";

const LH = 16;

export class DiffView {
  root: HTMLElement;
  hunks: Hunk[];
  selectedId: number | null = null;
  gutterFocused = false;
  onSelect: (h: Hunk | null) => void = () => {};
  onChoice: (h: Hunk, choice: MergeChoice) => void = () => {};
  onScroll: () => void = () => {};

  private leftPane: HTMLElement;
  private rightPane: HTMLElement;
  private gutter: HTMLElement;
  private svg: SVGSVGElement;
  private leftTicks: HTMLElement;
  private rightTicks: HTMLElement;
  private settings: Settings;
  private linking = false;

  constructor(hunks: Hunk[], settings: Settings) {
    this.hunks = hunks;
    this.settings = settings;
    this.root = el("div", { class: "diff-stage" });
    this.leftPane = el("div", { class: "pane", "data-side": "left" });
    this.rightPane = el("div", { class: "pane", "data-side": "right" });
    this.gutter = el("div", { class: "gutter" });
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "band-layer");
    this.leftTicks = el("div", { class: "scrollbar-ticks" });
    this.rightTicks = el("div", { class: "scrollbar-ticks" });

    this.leftPane.append(this.leftTicks);
    this.rightPane.append(this.rightTicks);
    this.root.append(this.leftPane, this.gutter, this.rightPane, this.svg);

    this.renderLines();
    this.bindScroll();
    this.gutter.addEventListener("mousedown", (e) => {
      this.gutterFocused = true;
      const item = (e.target as HTMLElement).closest(".gutter-item");
      if (item) this.select(Number(item.getAttribute("data-id")));
    });
    this.leftPane.addEventListener("mousedown", () => {
      this.gutterFocused = false;
    });
    this.rightPane.addEventListener("mousedown", () => {
      this.gutterFocused = false;
    });
    requestAnimationFrame(() => this.redraw());
  }

  setWrap(wrap: boolean): void {
    this.leftPane.classList.toggle("wrap", wrap);
    this.rightPane.classList.toggle("wrap", wrap);
  }

  setHunks(hunks: Hunk[]): void {
    this.hunks = hunks;
    this.renderLines();
    this.redraw();
  }

  select(id: number | null): void {
    this.selectedId = id;
    this.gutterFocused = true;
    this.paintSelection();
    const h = this.hunks.find((x) => x.id === id && x.kind === "change") ?? null;
    this.onSelect(h);
    if (h) this.scrollHunkIntoView(h);
  }

  nextChange(dir: 1 | -1): boolean {
    const ch = this.hunks.filter((h) => h.kind === "change");
    if (!ch.length) return false;
    const idx = ch.findIndex((h) => h.id === this.selectedId);
    const next = idx < 0 ? (dir > 0 ? 0 : ch.length - 1) : idx + dir;
    if (next < 0 || next >= ch.length) return false;
    this.select(ch[next].id);
    return true;
  }

  nextConflict(dir: 1 | -1): boolean {
    const ch = this.hunks.filter((h) => h.kind === "change" && h.isConflict);
    if (!ch.length) return false;
    const idx = ch.findIndex((h) => h.id === this.selectedId);
    const next = idx < 0 ? (dir > 0 ? 0 : ch.length - 1) : idx + dir;
    if (next < 0 || next >= ch.length) return false;
    this.select(ch[next].id);
    return true;
  }

  nextSide(side: "left" | "right", dir: 1 | -1): boolean {
    const ch = this.hunks.filter((h) => {
      if (h.kind !== "change") return false;
      return side === "left" ? h.leftCount > 0 : h.rightCount > 0;
    });
    if (!ch.length) return false;
    const idx = ch.findIndex((h) => h.id === this.selectedId);
    const next = idx < 0 ? (dir > 0 ? 0 : ch.length - 1) : idx + dir;
    if (next < 0 || next >= ch.length) return false;
    this.select(ch[next].id);
    return true;
  }

  selectAllChanges(): void {
    const ch = this.hunks.filter((h) => h.kind === "change");
    if (!ch.length) return;
    this.root.setAttribute("data-multi", ch.map((h) => h.id).join(","));
    this.select(ch[0].id);
  }

  selectedIds(): number[] {
    const multi = this.root.getAttribute("data-multi");
    if (multi) return multi.split(",").map(Number);
    return this.selectedId != null ? [this.selectedId] : [];
  }

  clearMulti(): void {
    this.root.removeAttribute("data-multi");
  }

  private renderLines(): void {
    this.leftPane.querySelectorAll(".line").forEach((n) => n.remove());
    this.rightPane.querySelectorAll(".line").forEach((n) => n.remove());
    this.gutter.innerHTML = "";

    const mkLine = (text: string, hunkId: number, kind: Hunk["kind"], conflict: boolean) => {
      const d = el("div", { class: "line", "data-hunk": String(hunkId) });
      d.textContent = text.length ? text : " ";
      if (kind === "change") d.classList.add("hunk");
      if (conflict) d.classList.add("conflict");
      return d;
    };

    for (const h of this.hunks) {
      const leftN = Math.max(h.leftCount, h.kind === "change" && h.leftCount === 0 ? 1 : h.leftCount);
      const rightN = Math.max(h.rightCount, h.kind === "change" && h.rightCount === 0 ? 1 : h.rightCount);
      for (let i = 0; i < leftN; i++) {
        const t = h.leftLines[i] ?? "";
        this.leftPane.append(mkLine(t, h.id, h.kind, h.isConflict));
      }
      for (let i = 0; i < rightN; i++) {
        const t = h.rightLines[i] ?? "";
        this.rightPane.append(mkLine(t, h.id, h.kind, h.isConflict));
      }
      if (h.kind === "change") {
        const item = el("div", { class: "gutter-item", "data-id": String(h.id) });
        if (this.settings.showChangeNumbers) item.append(el("div", { class: "num", text: String(h.id) }));
        if (this.settings.showMergeDirection) {
          const arrow =
            h.choice === "left" ? "←" : h.choice === "right" ? "→" : h.choice === "neither" ? "×" : "↔";
          item.append(el("div", { class: "arrow", text: arrow }));
        }
        this.gutter.append(item);
      }
    }
    this.paintSelection();
  }

  private paintSelection(): void {
    this.root.querySelectorAll(".line.sel").forEach((n) => n.classList.remove("sel"));
    this.root.querySelectorAll(".gutter-item.selected").forEach((n) => n.classList.remove("selected"));
    const ids = new Set(this.selectedIds());
    for (const id of ids) {
      this.root.querySelectorAll(`.line[data-hunk="${id}"]`).forEach((n) => n.classList.add("sel"));
      this.gutter.querySelector(`.gutter-item[data-id="${id}"]`)?.classList.add("selected");
    }
    this.redraw();
  }

  private bindScroll(): void {
    const on = (source: HTMLElement, dest: HTMLElement) => {
      source.addEventListener("scroll", () => {
        if (this.linking) return;
        this.linking = true;
        dest.scrollTop = this.mapScroll(source, dest);
        dest.scrollLeft = source.scrollLeft;
        this.redraw();
        this.onScroll();
        this.linking = false;
      });
    };
    on(this.leftPane, this.rightPane);
    on(this.rightPane, this.leftPane);
    window.addEventListener("resize", () => this.redraw());
  }

  /** Variable-speed mapping so corresponding hunks stay aligned. */
  private mapScroll(from: HTMLElement, to: HTMLElement): number {
    const fromLeft = from === this.leftPane;
    const pos = from.scrollTop;
    let fromY = 0;
    let toY = 0;
    for (const h of this.hunks) {
      const fl = Math.max(h.leftCount, h.kind === "change" && h.leftCount === 0 ? 1 : h.leftCount) * LH;
      const fr = Math.max(h.rightCount, h.kind === "change" && h.rightCount === 0 ? 1 : h.rightCount) * LH;
      const fH = fromLeft ? fl : fr;
      const tH = fromLeft ? fr : fl;
      if (pos < fromY + fH) {
        const p = fH === 0 ? 0 : (pos - fromY) / fH;
        return toY + p * tH;
      }
      fromY += fH;
      toY += tH;
    }
    return to.scrollHeight;
  }

  private hunkTop(h: Hunk, side: "left" | "right"): number {
    let y = 0;
    for (const x of this.hunks) {
      if (x === h) return y;
      const n =
        side === "left"
          ? Math.max(x.leftCount, x.kind === "change" && x.leftCount === 0 ? 1 : x.leftCount)
          : Math.max(x.rightCount, x.kind === "change" && x.rightCount === 0 ? 1 : x.rightCount);
      y += n * LH;
    }
    return y;
  }

  private hunkHeight(h: Hunk, side: "left" | "right"): number {
    const c = side === "left" ? h.leftCount : h.rightCount;
    return Math.max(c, h.kind === "change" && c === 0 ? 1 : c) * LH;
  }

  private scrollHunkIntoView(h: Hunk): void {
    const top = this.hunkTop(h, "left");
    this.leftPane.scrollTop = Math.max(0, top - 40);
  }

  redraw(): void {
    const w = this.root.clientWidth;
    const h = this.root.clientHeight;
    this.svg.setAttribute("width", String(w));
    this.svg.setAttribute("height", String(h));
    this.svg.innerHTML = "";
    const gw = this.gutter.getBoundingClientRect();
    const root = this.root.getBoundingClientRect();
    const leftRect = this.leftPane.getBoundingClientRect();
    const rightRect = this.rightPane.getBoundingClientRect();
    const ls = this.leftPane.scrollTop;
    const rs = this.rightPane.scrollTop;

    if (!this.settings.highlightDifferences) {
      this.positionGutter(ls, rs, root, gw);
      return;
    }

    for (const hunk of this.hunks) {
      if (hunk.kind !== "change") continue;
      const lt = this.hunkTop(hunk, "left") - ls;
      const rt = this.hunkTop(hunk, "right") - rs;
      const lh = this.hunkHeight(hunk, "left");
      const rh = this.hunkHeight(hunk, "right");
      const lx0 = 0;
      const lx1 = leftRect.width;
      const rx0 = rightRect.left - root.left;
      const rx1 = rx0 + rightRect.width;
      const gx0 = gw.left - root.left;
      const gx1 = gx0 + gw.width;
      const fill = hunk.id === this.selectedId ? "rgba(90,140,210,0.55)" : "rgba(120,170,230,0.38)";
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = [
        `M ${lx0} ${lt}`,
        `L ${lx1} ${lt}`,
        `C ${gx0} ${lt}, ${gx0} ${rt}, ${gx1} ${rt}`,
        `L ${rx1} ${rt}`,
        `L ${rx1} ${rt + rh}`,
        `L ${gx1} ${rt + rh}`,
        `C ${gx0} ${rt + rh}, ${gx0} ${lt + lh}, ${lx1} ${lt + lh}`,
        `L ${lx0} ${lt + lh}`,
        "Z",
      ].join(" ");
      path.setAttribute("d", d);
      path.setAttribute("fill", fill);
      path.setAttribute("stroke", hunk.isConflict ? "#c62828" : "rgba(80,80,90,0.25)");
      path.setAttribute("stroke-width", hunk.id === this.selectedId || hunk.isConflict ? "2" : "0.5");
      this.svg.append(path);
      void rx0;
    }
    this.positionGutter(ls, rs, root, gw);
    this.drawTicks();
  }

  private positionGutter(ls: number, rs: number, root: DOMRect, gw: DOMRect): void {
    for (const hunk of this.hunks) {
      if (hunk.kind !== "change") continue;
      const item = this.gutter.querySelector(`.gutter-item[data-id="${hunk.id}"]`) as HTMLElement | null;
      if (!item) continue;
      const lt = this.hunkTop(hunk, "left") - ls;
      const rt = this.hunkTop(hunk, "right") - rs;
      const lh = this.hunkHeight(hunk, "left");
      const rh = this.hunkHeight(hunk, "right");
      const top = Math.min(lt, rt);
      const bot = Math.max(lt + lh, rt + rh);
      item.style.top = `${top}px`;
      item.style.height = `${Math.max(18, bot - top)}px`;
    }
    void root;
    void gw;
  }

  private drawTicks(): void {
    if (!this.settings.showChangesInScrollbar) {
      this.leftTicks.innerHTML = "";
      this.rightTicks.innerHTML = "";
      return;
    }
    const paint = (pane: HTMLElement, ticks: HTMLElement, side: "left" | "right") => {
      ticks.innerHTML = "";
      const total = Math.max(1, pane.scrollHeight);
      const h = pane.clientHeight;
      for (const hunk of this.hunks) {
        if (hunk.kind !== "change") continue;
        const y = (this.hunkTop(hunk, side) / total) * h;
        const m = el("div");
        m.style.cssText = `position:absolute;left:2px;right:2px;height:3px;top:${y}px;background:#4c91dc;opacity:0.85;`;
        ticks.append(m);
      }
    };
    paint(this.leftPane, this.leftTicks, "left");
    paint(this.rightPane, this.rightTicks, "right");
  }

  gotoLine(side: "left" | "right", line: number): void {
    const y = Math.max(0, (line - 1) * LH);
    (side === "left" ? this.leftPane : this.rightPane).scrollTop = y;
  }

  selectedText(): string {
    return window.getSelection()?.toString() ?? "";
  }

  jumpToSelection(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode?.parentElement;
    node?.scrollIntoView({ block: "center" });
  }
}
