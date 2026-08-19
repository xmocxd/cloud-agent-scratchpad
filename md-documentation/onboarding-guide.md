# Onboarding Guide: Contributing Docs with Obsidian

This guide walks you through writing Markdown documentation and submitting it for review — entirely from within Obsidian, with no terminal or Git knowledge required.

---

## What is Markdown?

Markdown is a lightweight way to format text using plain characters. Instead of clicking a "Bold" button, you type `**bold**`. Instead of inserting a heading from a menu, you type `# My Heading`.

Markdown files end in `.md` and look like plain text when opened in any editor, but render as formatted documents in Obsidian, GitHub, and most documentation sites.

A quick reference:

```
# Heading 1
## Heading 2

**bold text**
*italic text*

- bullet item
- another item

[link text](https://example.com)

![image alt text](path/to/image.png)
```

---

## Overview of the Workflow

You will use three tools together:

| Tool | What it does |
|---|---|
| **Obsidian** | Write and preview Markdown files |
| **Obsidian Git** plugin | Create branches, commit changes, push to GitHub |
| **obsidian-github-tools** plugin | Open a Pull Request from inside Obsidian |

A Pull Request (PR) is how your changes get reviewed and approved before they go live. You push your edits to a private branch, then open a PR to ask for them to be merged.

---

## Part 1: Initial Setup (do this once)

### Step 1 — Install GitHub Desktop and clone the repository

GitHub Desktop is a free app that downloads the repository to your computer.

1. Download and install [GitHub Desktop](https://desktop.github.com) (free, Windows and Mac)
2. Sign in with your GitHub account (create one at [github.com](https://github.com) if needed)
3. In GitHub Desktop, click **File → Clone repository**
4. Choose the repository from the list (or paste its URL)
5. Choose a local folder to save it to (e.g. `Documents/my-project`)
6. Click **Clone**

You now have a local copy of the repository on your computer. You do not need GitHub Desktop again after this — Obsidian will handle everything from here.

---

### Step 2 — Install Obsidian

1. Go to [obsidian.md](https://obsidian.md) and download the installer for your operating system
2. Run the installer and open Obsidian
3. On the welcome screen, click **Open folder as vault**
4. Navigate to the folder where you cloned the repository and select it
5. Click **Open**

Obsidian will now show all the `.md` files in the repository in its left sidebar.

---

### Step 3 — Install the Obsidian Git plugin

1. In Obsidian, open **Settings** (gear icon, bottom-left)
2. Go to **Community plugins**
3. If prompted, click **Turn on community plugins**
4. Click **Browse**
5. Search for `Obsidian Git`
6. Click the result by **Vinzent03**, then click **Install**, then **Enable**
7. Close the plugin browser

---

### Step 4 — Install the obsidian-github-tools plugin

1. In the same **Community plugins → Browse** screen, search for `GitHub Tools`
2. Click the result by **kwhittle**, then click **Install**, then **Enable**
3. Close the plugin browser

---

### Step 5 — Create a GitHub Personal Access Token

The obsidian-github-tools plugin needs a token to communicate with GitHub on your behalf.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token → Generate new token (classic)**
3. Give it a name like `obsidian-docs`
4. Set an expiration (90 days is a reasonable choice)
5. Under **Select scopes**, check the box next to **repo** (this covers everything needed)
6. Scroll down and click **Generate token**
7. **Copy the token now** — GitHub only shows it once. Paste it somewhere safe temporarily.

---

### Step 6 — Configure obsidian-github-tools

1. In Obsidian, open **Settings → Community plugins**, find **GitHub Tools**, and click its gear icon
2. In the **Local repo path** field, enter the full path to your cloned repository folder  
   Example: `C:\Users\yourname\Documents\my-project` (Windows) or `/Users/yourname/Documents/my-project` (Mac)
3. In the **GitHub personal access token** field, paste the token you copied above
4. Close Settings

---

## Part 2: Day-to-Day Workflow

Every time you want to contribute changes, follow these steps.

---

### Step 1 — Create a new branch

A branch is your own private workspace. Your changes stay isolated until you ask for them to be reviewed.

1. Open the **Command palette** (press `Ctrl+P` on Windows or `Cmd+P` on Mac)
2. Type `create new branch` and select **Obsidian Git: Create new branch**
3. Enter a short descriptive name for your branch — use hyphens, no spaces  
   Examples: `add-faq-page`, `update-installation-guide`, `fix-typo-readme`
4. Press Enter

You are now working on your own branch. The branch name appears in the bottom status bar.

---

### Step 2 — Write or edit your Markdown files

Use the left sidebar to navigate files. Click any `.md` file to open it.

**Switching between editing modes:**

- **Live Preview** (default): shows formatted output as you type, like a word processor
- **Source mode**: shows raw Markdown syntax

To toggle, click the book icon in the top-right corner of the editor, or open the Command palette and type `toggle live preview`.

**Tips:**
- Use `Ctrl+N` (Windows) or `Cmd+N` (Mac) to create a new file
- File names become the page title — use lowercase with hyphens: `my-new-page.md`
- Save with `Ctrl+S` / `Cmd+S` (Obsidian also auto-saves)

**File naming conventions for this repository:**
- All lowercase
- Words separated by hyphens: `getting-started.md`, `api-reference.md`
- No spaces or special characters
- Place files in the correct folder — ask if you are unsure where something belongs

---

### Step 3 — Commit and push your changes

When you are ready to submit your work:

1. Open the Command palette (`Ctrl+P` / `Cmd+P`)
2. Type `commit and sync` and select **Obsidian Git: Commit-and-sync**
3. You will be prompted for a commit message — write a short description of what you changed  
   Examples: `Add FAQ page`, `Fix broken link in README`, `Update installation steps`
4. Press Enter

Obsidian Git will commit your changes and push the branch to GitHub.

---

### Step 4 — Open a Pull Request

1. Look for the **GitHub Tools** icon in the left sidebar (it looks like the GitHub logo) and click it
2. In the sidebar panel, click **Create PR**
3. A modal will appear pre-filled with a title based on your branch name — edit it to be descriptive if needed
4. Click **Create** — your browser will open to the GitHub Pull Request page, already filled in
5. Add any additional description in the text box on GitHub if helpful
6. Click **Create pull request**

Your changes are now submitted for review. The repository maintainer will receive a notification and either approve the PR, request changes, or leave comments.

---

### Step 5 — Responding to review feedback

If the reviewer asks for changes:

1. Go back to Obsidian — you are still on your branch
2. Make the requested edits
3. Repeat Step 3 (Commit-and-sync) — your existing PR updates automatically
4. Leave a comment on the PR on GitHub to let the reviewer know you have addressed their feedback

---

## Troubleshooting

**"Push rejected" or authentication error**  
Your token may have expired. Generate a new one following Step 5 above and update it in the obsidian-github-tools settings.

**"Cannot push to this branch" / branch is protected**  
You are likely trying to push directly to `main`. Make sure you created a new branch in Step 1 before making changes.

**Files I edited are not showing up in Commit-and-sync**  
Open the Command palette and run **Obsidian Git: Open source control view** to see the current status. Files in red are modified but not yet staged.

**The GitHub Tools sidebar is not visible**  
Open the Command palette and search for `GitHub Tools` to find the command to open its panel.

**I lost my branch or accidentally switched**  
Open the Command palette and run **Obsidian Git: Switch to remote branch** or **Create new branch** to get back on track. Ask the maintainer if you are unsure.

---

## Need a Different Workflow?

If the Obsidian method does not suit you, see [git-contribution-options.md](git-contribution-options.md) for alternatives including the GitHub web interface and GitHub Desktop.

For a list of other free Markdown editors, see [alternative-tools.md](alternative-tools.md).
