import { AquaWindow } from "../aqua/window.ts";
import { el } from "../aqua/dom.ts";
import { type Settings, DEFAULT_SETTINGS, saveSettings } from "../engine/settings.ts";

export function openSettingsWindow(desktop: HTMLElement, settings: Settings, onChange: (s: Settings) => void): AquaWindow {
  const win = new AquaWindow({ title: "Settings", x: 180, y: 70, w: 520, h: 520 });
  const form = el("div", { class: "form-grid" });
  const s = { ...settings, filesToIgnore: [...settings.filesToIgnore], filters: [...settings.filters] };

  function check(label: string, key: keyof Settings) {
    const lab = el("label");
    const cb = el("input", { type: "checkbox" }) as HTMLInputElement;
    cb.checked = Boolean(s[key]);
    cb.addEventListener("change", () => {
      (s as unknown as Record<string, unknown>)[key] = cb.checked;
      persist();
    });
    lab.append(cb, document.createTextNode(" " + label));
    form.append(lab);
  }
  check("Wrap text", "wrapText");
  check("Show change numbers", "showChangeNumbers");
  check("Show merge direction", "showMergeDirection");
  check("Show changes in scrollbar", "showChangesInScrollbar");
  check("Highlight differences", "highlightDifferences");

  const fontRow = el("label");
  fontRow.append(document.createTextNode("Font "));
  const font = el("input", { type: "text" }) as HTMLInputElement;
  font.value = s.fontFamily;
  font.style.flex = "1";
  font.addEventListener("change", () => {
    s.fontFamily = font.value;
    persist();
  });
  const size = el("input", { type: "number" }) as HTMLInputElement;
  size.value = String(s.fontSize);
  size.style.width = "56px";
  size.addEventListener("change", () => {
    s.fontSize = Number(size.value) || 11;
    persist();
  });
  fontRow.append(font, size);
  form.append(fontRow);

  form.append(el("h4", { text: "Directory compare options" }));
  check("Ignore identical files by default", "ignoreIdenticalInDirectory");

  form.append(el("h4", { text: "Filters for comparison  ($(FILE) is the path)" }));
  const table = el("table", { class: "filter-table" });
  table.append(
    el("tr", {}, el("th", { text: "Ext" }), el("th", { text: "Command" }), el("th", { text: "Display" })),
  );
  const filtersBody = el("tbody");
  table.append(filtersBody);
  function renderFilters() {
    filtersBody.innerHTML = "";
    s.filters.forEach((f, i) => {
      const tr = el("tr");
      const ext = el("input", { type: "text" }) as HTMLInputElement;
      ext.value = f.extension;
      ext.addEventListener("change", () => {
        s.filters[i].extension = ext.value;
        persist();
      });
      const cmd = el("input", { type: "text" }) as HTMLInputElement;
      cmd.value = f.command;
      cmd.addEventListener("change", () => {
        s.filters[i].command = cmd.value;
        persist();
      });
      const disp = el("select") as HTMLSelectElement;
      disp.innerHTML = `<option value="original">Original</option><option value="filtered">Filtered</option>`;
      disp.value = f.display;
      disp.addEventListener("change", () => {
        s.filters[i].display = disp.value as "original" | "filtered";
        persist();
      });
      tr.append(el("td", {}, ext), el("td", {}, cmd), el("td", {}, disp));
      filtersBody.append(tr);
    });
  }
  renderFilters();
  const addF = el("button", { text: "Add Filter" });
  addF.addEventListener("click", () => {
    s.filters.push({ extension: ".txt", command: "cat $(FILE)", display: "original" });
    renderFilters();
    persist();
  });
  form.append(table, addF);

  form.append(el("h4", { text: "Files to ignore" }));
  const ignore = el("textarea", { class: "ignore-list" }) as HTMLTextAreaElement;
  ignore.value = s.filesToIgnore.join("\n");
  ignore.addEventListener("change", () => {
    s.filesToIgnore = ignore.value.split("\n").map((x) => x.trim()).filter(Boolean);
    persist();
  });
  form.append(ignore);

  const reset = el("button", { text: "Restore Defaults" });
  reset.addEventListener("click", () => {
    Object.assign(s, DEFAULT_SETTINGS);
    s.filesToIgnore = [...DEFAULT_SETTINGS.filesToIgnore];
    persist();
    win.close();
    openSettingsWindow(desktop, s, onChange);
  });
  form.append(reset);

  function persist() {
    saveSettings(s);
    onChange(s);
  }

  win.body.append(form);
  desktop.append(win.root);
  return win;
}
