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

### Step 1 — Prerequisites: Git must be installed on your computer

Obsidian Git relies on the system Git binary to operate. Check whether Git is already installed before continuing.

**Mac:**  
Git is usually pre-installed. Open **Terminal** (press `Cmd+Space`, type `Terminal`, press Enter) and run:
```
git --version
```
If you see a version number (e.g. `git version 2.39.0`), you are ready. If you see an error or a prompt to install Xcode Command Line Tools, click **Install** and wait for it to finish.

**Windows:**  
Git is usually not installed by default. Download and run the installer from [git-scm.com/downloads](https://git-scm.com/downloads). All default options during installation are fine. After installing, you do not need to open Git again — Obsidian will use it automatically.

> **Note:** GitHub Desktop is not required and does not need to be installed.

---

### Step 2 — Create a GitHub Personal Access Token

You need this token to authenticate with GitHub. Both plugins (Obsidian Git and obsidian-github-tools) will use it.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token → Generate new token (classic)**
3. Give it a name like `obsidian-docs`
4. Set an expiration (90 days is a reasonable choice — you will need to renew it when it expires)
5. Under **Select scopes**, check the box next to **repo** (this covers all permissions needed)
6. Scroll down and click **Generate token**
7. **Copy the token now** — GitHub only shows it once. Paste it into a text file or password manager temporarily.

---

### Step 3 — Install Obsidian

1. Go to [obsidian.md](https://obsidian.md) and download the installer for your operating system
2. Run the installer
3. Open Obsidian — on the welcome screen, click **Create new vault**
4. Give the vault any name (e.g. `my-project`) and choose where to save it
5. Click **Create**

You will clone the actual repository into this vault in Step 6. For now you just need Obsidian open.

---

### Step 4 — Install the Obsidian Git plugin

1. In Obsidian, open **Settings** (gear icon, bottom-left)
2. Go to **Community plugins**
3. If prompted, click **Turn on community plugins**
4. Click **Browse**
5. Search for `Obsidian Git`
6. Click the result by **Vinzent03**, then click **Install**, then **Enable**
7. Close the plugin browser

---

### Step 5 — Install the obsidian-github-tools plugin

1. In the same **Community plugins → Browse** screen, search for `GitHub Tools`
2. Click the result by **kwhittle**, then click **Install**, then **Enable**
3. Close the plugin browser

---

### Step 6 — Authenticate Obsidian Git with GitHub

1. In Obsidian, go to **Settings → Community plugins**, find **Git**, and click its gear icon
2. Scroll to the **Authentication/Commit Author** section
3. Enter your GitHub username in the **Username** field
4. Paste your Personal Access Token (from Step 2) in the **Password/Token** field
5. Fill in your name and email in the **Author name** and **Author email** fields (these appear on commits)
6. Close Settings

---

### Step 7 — Clone the repository into Obsidian

This downloads the repository to your computer without needing any other app.

1. Open the **Command palette** (press `Ctrl+P` on Windows or `Cmd+P` on Mac)
2. Type `clone` and select **Obsidian Git: Clone an existing remote repo**
3. Paste the repository URL followed by `.git`  
   Example: `https://github.com/your-org/your-repo.git`  
   *(Ask the repository maintainer for this URL if you do not have it)*
4. When asked for a path, leave it blank and press Enter (clones into the current vault folder)
5. Obsidian will show progress notifications — wait until you see a success message
6. When prompted to restart Obsidian, click **Restart**

After restarting, all the repository files will appear in the left sidebar.

---

### Step 8 — Configure obsidian-github-tools

1. In Obsidian, go to **Settings → Community plugins**, find **GitHub Tools**, and click its gear icon
2. In the **Local repo path** field, enter the full path to your vault folder  
   Example: `C:\Users\yourname\Documents\my-project` (Windows) or `/Users/yourname/Documents/my-project` (Mac)  
   *(You can find this path by right-clicking the vault folder in File Explorer / Finder and selecting "Properties" or "Get Info")*
3. In the **GitHub personal access token** field, paste your token from Step 2
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

When you are ready to submit your work, use the **Source Control panel**:

1. Click the **branch/source control icon** in the left ribbon (it looks like a circle with arrows, or a Git branch icon) — this opens the Source Control panel
2. You will see a list of your changed files
3. In the **Commit message** box at the top of the panel, type a short description of what you changed  
   Examples: `Add FAQ page`, `Fix broken link in README`, `Update installation steps`
4. Click the **Commit-and-sync** button (the cloud/upload icon at the top of the panel)

Obsidian Git will commit your changes and push the branch to GitHub.

> **Alternative:** You can also use the ribbon button at the very top of the left sidebar — look for the Git icon that shows a tooltip of "Commit-and-sync" when you hover over it. One click runs the full commit, pull, and push sequence using the last commit message.

> **Can't find the panel?** Press `Ctrl+P` / `Cmd+P`, type `source control`, and select **Obsidian Git: Open source control view**.

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
3. Repeat the commit step (open the Source Control panel, write a message, click Commit-and-sync) — your existing PR updates automatically
4. Leave a comment on the PR on GitHub to let the reviewer know you have addressed their feedback

---

## Troubleshooting

**"Push rejected" or authentication error**  
Your token may have expired. Generate a new one following the token steps in Part 1 above and update it in both the Obsidian Git settings (Settings → Git → Password/Token) and the obsidian-github-tools settings.

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
