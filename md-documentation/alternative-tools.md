# Alternative Markdown Editors

This page lists free tools you can use to write and preview Markdown files instead of, or alongside, Obsidian.

The [onboarding guide](onboarding-guide.md) focuses on Obsidian because it has the best combination of live preview, plugin support (including Git and GitHub PR integration), and ease of use. The tools below are worth considering if Obsidian does not fit your workflow.

---

## Comparison at a Glance

| Tool | Platform | Price | WYSIWYG / Live Preview | Git integration | Best for |
|---|---|---|---|---|---|
| [Obsidian](#obsidian) | Windows, Mac, Linux, iOS, Android | Free (personal) | Yes — Live Preview mode | Yes — via plugins | Primary recommendation; rich plugin ecosystem |
| [Mark Text](#mark-text) | Windows, Mac, Linux | Free, open source | Yes — WYSIWYG | No | Clean writing experience, no setup needed |
| [Zettlr](#zettlr) | Windows, Mac, Linux | Free, open source | Yes — Live Preview | No | Academic writing, citations, long-form documents |
| [VS Code](#vs-code) | Windows, Mac, Linux | Free, open source | Side-by-side preview | Yes — built-in Git panel | Developers, technical writers |
| [Logseq](#logseq) | Windows, Mac, Linux, iOS, Android | Free, open source | Yes | Yes — built-in sync/Git | Outline-style notes, linked thinking |
| [Joplin](#joplin) | Windows, Mac, Linux, iOS, Android | Free, open source | Yes — Split or rendered | No | Note-taking, offline-first |
| [HackMD / CodiMD](#hackmd--codimd) | Web browser | Free tier | Yes — Split pane | No (exports only) | Real-time collaboration, no install |
| [Notion](#notion) | Web, Desktop, Mobile | Free tier | Block editor (Markdown import/export) | No | Teams already using Notion |
| [Typora](#typora) | Windows, Mac, Linux | Paid ($15 one-time) | Yes — seamless WYSIWYG | No | Best-in-class writing feel; not free |

---

## Obsidian

**Website:** [obsidian.md](https://obsidian.md)  
**Price:** Free for personal use; Obsidian Sync and Publish are paid add-ons  
**Platforms:** Windows, Mac, Linux, iOS, Android

Obsidian stores your notes as plain `.md` files in a local folder called a vault. It has a powerful community plugin system, including the **Obsidian Git** and **obsidian-github-tools** plugins that make it the recommended tool for contributing to this repository.

**Strengths:**
- Live Preview mode renders Markdown as you type
- Source mode for direct Markdown editing
- Extensive plugin library (1,000+)
- Works entirely offline
- Files are yours — plain Markdown, no lock-in

**Limitations:**
- Some features require plugins to set up (e.g. Git integration)
- Mobile Git support is limited

---

## Mark Text

**Website:** [github.com/marktext/marktext](https://github.com/marktext/marktext)  
**Price:** Free, open source (MIT license)  
**Platforms:** Windows, Mac, Linux

Mark Text is a clean, distraction-free WYSIWYG Markdown editor. It renders Markdown inline as you type — you never see the raw syntax unless you want to. No account or setup required.

**Strengths:**
- True WYSIWYG: formatting appears immediately as you type
- Simple, uncluttered interface
- Supports tables, task lists, code blocks, and math (KaTeX)
- Multiple themes including dark mode

**Limitations:**
- No built-in Git integration — use GitHub Desktop alongside it
- Development has slowed in recent years; community-maintained

---

## Zettlr

**Website:** [zettlr.com](https://www.zettlr.com)  
**Price:** Free, open source (GNU GPL)  
**Platforms:** Windows, Mac, Linux

Zettlr is aimed at researchers and academic writers. It supports Pandoc integration for exporting to Word, PDF, and LaTeX, and has first-class support for citations (Zotero, BibTeX).

**Strengths:**
- Built for long-form writing and research
- Citation manager integration
- Zettelkasten-style note linking
- Live Preview with split-screen option
- Multi-language spell check

**Limitations:**
- No built-in Git integration
- More features than most documentation contributors need; can feel heavy for simple use

---

## VS Code

**Website:** [code.visualstudio.com](https://code.visualstudio.com)  
**Price:** Free, open source (MIT license)  
**Platforms:** Windows, Mac, Linux

VS Code is a general-purpose code editor with solid Markdown support. A built-in preview pane renders your Markdown alongside the source. It also has a full Git panel built in, and extensions like **Markdown All in One** add shortcuts, table formatting, and more.

**Strengths:**
- Built-in side-by-side Markdown preview
- Built-in Git integration (stage, commit, push, branch — all GUI)
- Enormous extension marketplace
- Free and actively maintained by Microsoft
- Familiar to anyone who codes

**Limitations:**
- No true WYSIWYG — you always see raw Markdown syntax
- Can feel overwhelming for non-technical users
- Does not have a "Create PR" button; you would open GitHub in a browser separately

**Recommended extensions:**
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) — keyboard shortcuts, auto preview, table formatter
- [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) — richer preview rendering

---

## Logseq

**Website:** [logseq.com](https://logseq.com)  
**Price:** Free, open source  
**Platforms:** Windows, Mac, Linux, iOS, Android

Logseq is an outliner-based note-taking app that stores everything as plain Markdown (or Org-mode) files. It has a built-in Git sync option and is designed around linked thinking and daily notes.

**Strengths:**
- Stores files as plain Markdown — compatible with any Git repo
- Built-in version history and optional Git sync
- Block-level linking between notes
- Outline-first structure suits certain documentation styles
- Works offline

**Limitations:**
- Outliner model is different from traditional Markdown — every line is a bullet point
- Not ideal for long-form prose documentation
- Git sync is more oriented toward personal backup than team PRs

---

## Joplin

**Website:** [joplinapp.org](https://joplinapp.org)  
**Price:** Free, open source (MIT license); Joplin Cloud is a paid sync option  
**Platforms:** Windows, Mac, Linux, iOS, Android

Joplin is a note-taking app that stores notes as Markdown. It supports split-view editing (raw Markdown on left, rendered preview on right) or a WYSIWYG mode.

**Strengths:**
- Fully offline and open source
- Cross-platform including mobile
- End-to-end encryption for sync
- Supports attachments, tags, and notebooks

**Limitations:**
- Notes are stored in an internal database, not as individual `.md` files in a folder
- Exporting to a Git repo requires manual steps
- Not designed for collaborative documentation workflows

---

## HackMD / CodiMD

**Website:** [hackmd.io](https://hackmd.io) (HackMD) / [github.com/hackmdio/codimd](https://github.com/hackmdio/codimd) (self-hosted CodiMD)  
**Price:** Free tier (HackMD); free self-hosted (CodiMD)  
**Platforms:** Web browser (no install)

HackMD is a web-based collaborative Markdown editor. Multiple people can edit the same document simultaneously, like Google Docs but for Markdown. CodiMD is the open-source self-hostable version.

**Strengths:**
- No installation — works in any browser
- Real-time collaboration
- Split-pane live preview
- Slide mode for presentations
- Export to PDF, HTML, or `.md` file

**Limitations:**
- Files live on HackMD's servers, not in a local Git repo
- Contributing to the repository requires exporting the file and uploading it via another method
- Free tier has limits on private notes

---

## Notion

**Website:** [notion.so](https://www.notion.so)  
**Price:** Free tier available; paid plans for teams  
**Platforms:** Web, Windows, Mac, iOS, Android

Notion is a popular all-in-one workspace. While not a Markdown editor in the traditional sense, it supports Markdown-style shortcuts and can export pages as Markdown files.

**Strengths:**
- Polished, modern UI that non-technical users find approachable
- Rich content blocks (tables, callouts, embeds, databases)
- Excellent for drafting and internal review before publishing

**Limitations:**
- Export quality varies — exported Markdown may need cleanup
- No Git integration; contributing requires exporting and uploading the `.md` file
- Content is stored in Notion's cloud, not in your repository
- Free tier limits collaboration features

---

## Typora

**Website:** [typora.io](https://typora.io)  
**Price:** $14.99 one-time (not free — listed here for reference only)  
**Platforms:** Windows, Mac, Linux

Typora invented the seamless WYSIWYG Markdown experience that many other editors try to replicate. The Markdown syntax disappears entirely as you type — you only see the formatted output.

**Included for reference** because it is frequently mentioned and many users already own a license.

**Strengths:**
- Best-in-class WYSIWYG editing experience
- Minimal, distraction-free interface
- Reads and writes standard `.md` files

**Limitations:**
- Paid — no free tier after the trial period
- No Git integration built in

---

## Choosing the Right Tool

- **New to Markdown and Git** → Use Obsidian with the plugins from the [onboarding guide](onboarding-guide.md)
- **Want the cleanest writing experience, no setup** → Mark Text
- **Academic writing with citations** → Zettlr
- **Already a developer** → VS Code with Markdown All in One
- **Collaborative drafting in a browser** → HackMD
- **Team already uses Notion** → Draft in Notion, export, and contribute via GitHub Web Interface
