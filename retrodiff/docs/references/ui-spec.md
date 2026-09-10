# RetroDiff UI spec (clean-room, from public FileMerge docs)

## Compare Files
- Left… / Right… buttons, path fields, document wells (drag-drop)
- Compare (lower right); Return activates Compare
- Hint: Enlarge window to specify ancestor and/or merge paths
- Drag south edge taller → Ancestor and Merge rows

## Comparison
- Function popups over each pane
- Blue hunks, gray/blue warped bands through center gutter
- Click gutter only to select; numbered arrows; direction = merge choice
- Dark border selected; red border 3-way conflict
- Scrollbar ticks; variable-speed sync scroll
- Bottom splitter reveals editable merge drawer + Actions menu
- Actions apply immediately: left / right / both-left / both-right / neither
- Default merge direction: right

## Keys (Ctrl on Win/Linux)
- Up/Down differences (gutter focused); beep at ends
- Left/Right choose side
- ⌘A all hunks (when not typing)
- ⌘D / ⇧⌘D next/prev conflict
- ⌘S / ⇧⌘S Save Merge / As
- ⌘F/G/E/J/L Find family
- ⌘W close; Esc does not close
- Directory: ⌘1 Combine Files

## Directory
- Gray identical names; italic unique
- Status line; Exclude checkboxes
- View / Merge popups keep their titles when closed

## Git
```
opendiff "$LOCAL" "$REMOTE" -ancestor "$BASE" -merge "$MERGED"
```
Piped stdout waits. `-merge` Save writes that path. Success is mtime of MERGED (Git does not trust exit code).
