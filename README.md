# Gitlift

A Chrome extension that automatically pushes your accepted coding solutions to a GitHub repository — one tidy commit per solved problem, organized by platform and problem. Solve a problem, and Gitlift lifts it straight into your GitHub.

Supported sites:

- **LeetCode**
- **GeeksforGeeks**
- **HackerRank**

Each solved problem is committed as:

```
<platform>/<problem>/<solution>.<ext>
<platform>/<problem>/README.md
```

## How it works

A content script on each supported site detects a successful submission, captures the source code (from the site's API or live editor), and a background service worker commits it to your repo through the GitHub REST API.

## Install (load unpacked)

1. Generate the icons once (see below), or drop your own PNGs in `icons/`.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.

## Connect GitHub

Open the extension's **Settings** (popup → Settings) and either:

### Option A — OAuth (recommended)

1. Create a GitHub **OAuth App** at <https://github.com/settings/developers> → *New OAuth App*.
2. Set **Authorization callback URL** to the value shown in Settings
   (looks like `https://<extension-id>.chromiumapp.org/`).
3. Copy the **Client ID**, generate a **Client Secret**, paste both into Settings.
4. Click **Authorize with GitHub**.

> Your credentials are stored locally in your browser only — nothing is shipped inside the extension.

### Option B — Personal Access Token

1. Create a token with **repo** scope at <https://github.com/settings/tokens>.
2. Paste it into Settings → **Save token & connect**.

Finally, set a **target repository** name in Settings. It's created automatically if it doesn't exist.

## Generate icons

Requires Windows PowerShell (uses `System.Drawing`):

```powershell
pwsh -File scripts/generate-icons.ps1
```

This writes `icons/icon16.png`, `icon48.png`, and `icon128.png`.

## Push this project to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Gitlift extension"
git branch -M main
git remote add origin https://github.com/<you>/gitlift.git
git push -u origin main
```

## Publish to the Chrome Web Store

1. Zip the contents of this folder (not the parent folder).
2. Register at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) (one-time fee).
3. Upload the zip, fill in listing details and screenshots, then submit for review.

## Notes

- LeetCode capture uses the site's GraphQL API for exact, reliable source code.
- GeeksforGeeks/HackerRank read from the live editor; their DOM changes over time, so the success-detection and language selectors in `src/content/` may occasionally need a tweak.

## Project layout

```
manifest.json
src/
  background/   service worker, GitHub API, OAuth
  content/      per-site detectors + shared helpers + page-context bridge
  popup/        toolbar popup
  options/      settings page
icons/          extension icons
scripts/        icon generator
```
