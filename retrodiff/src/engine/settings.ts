export interface FilterRule {
  extension: string;
  command: string;
  display: "original" | "filtered";
}

export interface Settings {
  wrapText: boolean;
  showChangeNumbers: boolean;
  showMergeDirection: boolean;
  showChangesInScrollbar: boolean;
  highlightDifferences: boolean;
  fontFamily: string;
  fontSize: number;
  ignoreIdenticalInDirectory: boolean;
  filters: FilterRule[];
  filesToIgnore: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  wrapText: false,
  showChangeNumbers: true,
  showMergeDirection: true,
  showChangesInScrollbar: true,
  highlightDifferences: true,
  fontFamily: "Menlo, Monaco, 'Courier New', monospace",
  fontSize: 11,
  ignoreIdenticalInDirectory: false,
  filters: [],
  filesToIgnore: [".git", ".svn", "CVS", ".hg", ".DS_Store"],
};

const KEY = "retrodiff.settings.v1";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, filesToIgnore: [...DEFAULT_SETTINGS.filesToIgnore] };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed, filesToIgnore: parsed.filesToIgnore ?? [...DEFAULT_SETTINGS.filesToIgnore] };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function applyFilterCommand(command: string, filePath: string): string {
  return command.replaceAll("$(FILE)", filePath);
}
