import { el, nextZ } from "./dom.ts";

export interface WinOpts {
  title: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  onClose?: () => boolean | void;
}

export class AquaWindow {
  root: HTMLElement;
  body: HTMLElement;
  titleEl: HTMLElement;
  private focused = false;

  constructor(opts: WinOpts) {
    this.root = el("div", { class: "window" });
    this.root.style.left = `${opts.x ?? 80}px`;
    this.root.style.top = `${opts.y ?? 40}px`;
    this.root.style.width = `${opts.w ?? 520}px`;
    this.root.style.height = `${opts.h ?? 200}px`;
    this.root.style.zIndex = String(nextZ());

    const bar = el("div", { class: "titlebar" });
    const traffic = el("div", { class: "traffic" });
    const close = el("div", { class: "dot close" });
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      const ok = opts.onClose?.();
      if (ok === false) return;
      this.close();
    });
    traffic.append(close, el("div", { class: "dot min" }), el("div", { class: "dot zoom" }));
    this.titleEl = el("div", { class: "title", text: opts.title });
    bar.append(traffic, this.titleEl);
    this.body = el("div", { class: "window-body" });
    this.root.append(bar, this.body);

    this.root.addEventListener("mousedown", () => this.focus());
    this.makeDraggable(bar);
    this.focus();
  }

  setTitle(t: string): void {
    this.titleEl.textContent = t;
  }

  focus(): void {
    document.querySelectorAll(".window").forEach((w) => w.classList.remove("focused"));
    this.root.classList.add("focused");
    this.root.style.zIndex = String(nextZ());
    this.focused = true;
  }

  close(): void {
    this.root.remove();
  }

  private makeDraggable(bar: HTMLElement): void {
    let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
    bar.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).classList.contains("dot")) return;
      drag = true;
      sx = e.clientX;
      sy = e.clientY;
      ox = this.root.offsetLeft;
      oy = this.root.offsetTop;
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!drag) return;
      this.root.style.left = `${ox + e.clientX - sx}px`;
      this.root.style.top = `${Math.max(22, oy + e.clientY - sy)}px`;
    });
    window.addEventListener("mouseup", () => {
      drag = false;
    });
  }
}
