# Alternative Contribution Methods

This document provides detailed step-by-step guides for contributing Markdown files to this repository using methods other than the primary Obsidian workflow.

If you have not read the main guide yet, start with [onboarding-guide.md](onboarding-guide.md).

---

## Quick Comparison

| Method | Technical skill needed | Cost | Best for |
|---|---|---|---|
| [GitHub Web Interface](#method-1-github-web-interface) | Minimal — browser only | Free | Quick edits to a single existing file |
| [GitHub Desktop](#method-2-github-desktop) | Low — GUI app, no terminal | Free | Regular contributors who prefer a dedicated app |
| [Shell Script (one-click push)](#method-3-shell-script-one-click-push) | None after setup | Free | Teams wanting a single double-click to commit and open a PR |
| [TinaCMS](#method-4-tinacms-headless-cms) | None — web UI | Free tier | Teams wanting a CMS-style editor with no local setup |

---

## Method 1: GitHub Web Interface

### How it works

GitHub's website has a built-in Markdown editor. You can edit or create files directly in the browser and submit a Pull Request without installing anything.

### Best for

- Fixing typos or small wording changes in a single file
- Contributors who only contribute occasionally
- Anyone who cannot install software on their computer

### Limitations

- You can only edit one file per PR through the basic web editor
- No live preview while editing (GitHub renders a preview after you save)
- Not practical for creating multiple new files or restructuring content

### Step-by-step

**Editing an existing file:**

1. Go to the repository on [github.com](https://github.com)
2. Navigate to the `.md` file you want to edit using the file browser
3. Click the **pencil icon** (Edit this file) in the top-right of the file view
4. Make your edits in the text editor — GitHub shows a **Preview** tab to check formatting
5. When done, scroll down to the **Commit changes** section
6. Write a short description of your change in the first field (e.g. `Fix typo in installation guide`)
7. Select **Create a new branch for this commit and start a pull request**
8. Give the branch a short descriptive name (e.g. `fix-typo-installation`)
9. Click **Propose changes**
10. On the next screen, review the PR description and click **Create pull request**

**Creating a new file:**

1. Navigate to the folder where the file should live
2. Click **Add file → Create new file**
3. Type the file name including `.md` extension at the top (e.g. `my-new-page.md`)
4. Write your content in the editor
5. Follow steps 5–10 above to commit and open the PR

---

## Method 2: GitHub Desktop

### How it works

GitHub Desktop is a free graphical app from GitHub. It handles cloning, branching, committing, and pushing through a point-and-click interface. You write your Markdown in a separate editor (such as Obsidian or VS Code) and use GitHub Desktop purely for the Git operations.

### Best for

- Contributors who make changes regularly across multiple files
- Anyone who is comfortable with two apps open at once
- A good fallback if the Obsidian plugin setup feels too complex

### Step-by-step

**Initial setup (do once):**

1. Download and install [GitHub Desktop](https://desktop.github.com) (free, Windows and Mac)
2. Sign in with your GitHub account
3. Click **File → Clone repository**, select the repository, choose a local folder, and click **Clone**
4. Install a Markdown editor to write your files (see [alternative-tools.md](alternative-tools.md))
5. Open the cloned folder in your editor

**Contributing changes:**

1. In GitHub Desktop, click **Current branch** (top center) → **New branch**
2. Enter a descriptive branch name (e.g. `update-faq`) and click **Create branch**
3. Switch to your Markdown editor and make your edits — save when done
4. Return to GitHub Desktop — your changed files will appear in the left panel under **Changes**
5. In the bottom-left, write a short **Summary** of your changes (required) and an optional description
6. Click **Commit to [your-branch-name]**
7. Click **Publish branch** (or **Push origin** if it appears instead)
8. Click **Create Pull Request** — GitHub opens in your browser pre-filled with your branch
9. Review the PR description and click **Create pull request**

**Updating after review feedback:**

1. Make edits in your Markdown editor and save
2. In GitHub Desktop, write a summary and click **Commit to [branch]**
3. Click **Push origin**
4. Your existing PR updates automatically — no need to open a new one

---

## Method 3: Shell Script (One-Click Push)

### How it works

A small shell script (`.sh` on Mac/Linux or `.bat` on Windows) automates the entire Git workflow: it creates a branch named after the current date, stages all changes, commits them with a message, pushes to GitHub, and opens the GitHub PR creation page in your browser — all in one double-click.

This is ideal for contributors who are comfortable writing Markdown files but want to avoid learning any Git commands.

### Best for

- Teams where contributors write content in any editor and just need a "publish" button
- Situations where the Obsidian plugin setup is not practical
- Mac/Linux users comfortable running a script; Windows users with Git for Windows installed

### Prerequisites

- Git must be installed: [git-scm.com](https://git-scm.com/downloads) (free)
- The repository must be cloned locally (see GitHub Desktop setup above for how to clone)
- On Windows: use **Git Bash** (installed with Git for Windows) to run the script

### The script

Save the following as `publish.sh` in the root of the repository folder:

```bash
#!/bin/bash

# ---------------------------------------------------------------------------
# publish.sh — stage all changes, commit, push to a new branch, open PR
# ---------------------------------------------------------------------------

REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//')
BRANCH="docs/$(date +%Y-%m-%d)-update"

echo ""
echo "Creating branch: $BRANCH"
git checkout -b "$BRANCH"

git add .

echo ""
read -p "Enter a short description of your changes: " MSG
git commit -m "$MSG"

echo ""
echo "Pushing to GitHub..."
git push -u origin "$BRANCH"

PR_URL="$REPO_URL/compare/$BRANCH?expand=1"
echo ""
echo "Opening Pull Request page in browser..."

if command -v xdg-open &> /dev/null; then
    xdg-open "$PR_URL"
elif command -v open &> /dev/null; then
    open "$PR_URL"
else
    echo "Could not open browser automatically."
    echo "Open this URL manually: $PR_URL"
fi

echo ""
echo "Done. Your PR is ready to review on GitHub."
```

**For Windows**, save the following as `publish.bat` in the root of the repository folder:

```bat
@echo off
setlocal

for /f "tokens=1-3 delims=/" %%a in ("%date%") do (
    set BRANCH=docs/%%c-%%a-%%b-update
)

echo Creating branch: %BRANCH%
git checkout -b %BRANCH%

git add .

set /p MSG="Enter a short description of your changes: "
git commit -m "%MSG%"

echo Pushing to GitHub...
git push -u origin %BRANCH%

for /f %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
set REPO_URL=%REPO_URL:.git=%

start "" "%REPO_URL%/compare/%BRANCH%?expand=1"

echo Done. Your PR page should have opened in your browser.
pause
```

### How to use the script

**Mac / Linux:**

1. Open Terminal and navigate to the repository folder
2. The first time only, make the script executable: `chmod +x publish.sh`
3. Double-click `publish.sh` in Finder/file manager, or run `./publish.sh` in Terminal
4. When prompted, type a short description of your changes and press Enter
5. Your browser opens to the GitHub PR creation page — fill in the description and click **Create pull request**

**Windows:**

1. Double-click `publish.bat` in File Explorer
2. When prompted, type a short description and press Enter
3. Your browser opens to the GitHub PR creation page

> **Note:** Each run of the script creates a new branch. If you want to add more changes to an existing PR before it is merged, you will need to use GitHub Desktop or the command line instead.

---

## Method 4: TinaCMS (Headless CMS)

### How it works

[TinaCMS](https://tina.io) is an open-source headless CMS that adds a visual editing interface on top of a Git repository. Contributors edit content through a web form in their browser — TinaCMS handles creating branches and Pull Requests behind the scenes via its cloud service.

### Best for

- Teams where contributors should never interact with Git concepts at all
- Projects that need a structured form-based editing experience (fields, dropdowns, image uploads)
- Situations where contributors are non-technical and cannot install any local software

### Limitations

- Requires a developer to set up TinaCMS in the repository (one-time configuration work)
- Free tier has limits on the number of users; teams may need a paid plan
- Content structure must be defined in a schema — less flexible for freeform docs

### Setup overview (for the repository maintainer)

Full documentation: [tina.io/docs/setup-overview](https://tina.io/docs/setup-overview)

1. Install TinaCMS: `npx @tinacms/cli@latest init`
2. Define content collections in `tina/config.ts`
3. Deploy the site to a hosting provider (Vercel, Netlify, etc.)
4. Enable **TinaCloud** for the GitHub integration — this handles auth and PR creation
5. Invite contributors via the TinaCloud dashboard

### Contributor experience

Once set up, contributors:

1. Navigate to the CMS URL (e.g. `your-site.com/admin`)
2. Log in with GitHub
3. Edit content using form fields or a rich text editor
4. Click **Save** — TinaCMS creates a branch and PR automatically

---

## Summary Recommendation

| Situation | Recommended method |
|---|---|
| You need to fix one small thing quickly | GitHub Web Interface |
| You contribute regularly, want a dedicated Git app | GitHub Desktop |
| You write in your own editor, want a one-click publish | Shell Script |
| Your team wants zero Git exposure, CMS-style editing | TinaCMS |
| You want everything in one app with PR support | Obsidian + plugins (see [onboarding-guide.md](onboarding-guide.md)) |
