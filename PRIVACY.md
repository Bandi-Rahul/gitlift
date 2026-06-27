# Privacy Policy — Gitlift

_Last updated: 2026-06-27_

Gitlift is a browser extension that pushes your accepted coding solutions to your own GitHub repository. This policy explains what data the extension handles and how.

## What Gitlift does with data

**Authentication credentials.** When you connect GitHub, your Personal Access Token (or the access token obtained through GitHub OAuth, and any OAuth App Client ID/Secret you enter) is stored locally in your browser using `chrome.storage.local`. These credentials are sent **only** to GitHub's official API (`api.github.com` / `github.com`) to authenticate your requests. They are never transmitted to the developer or any third party.

**Your solutions and problem data.** When you submit an accepted solution on a supported site (LeetCode, GeeksforGeeks, HackerRank), Gitlift reads the submitted source code and the related problem details (title, number, difficulty, statement) and commits them to the GitHub repository **you** specify. This data is sent only to GitHub, at your direction.

**Settings.** Your chosen repository name, GitHub username, and connection state are stored locally in your browser.

## What Gitlift does NOT do

- It does **not** send any of your data to servers operated by the developer.
- It does **not** include analytics, tracking, or advertising.
- It does **not** sell or share your data with third parties.
- It does **not** collect data from pages other than the supported coding sites.

## Data storage and removal

All data is kept locally in your browser. You can remove it at any time by disconnecting in the extension's settings, clearing the extension's storage, or uninstalling the extension. Uninstalling deletes all locally stored data.

## Permissions

- **storage** — to save your settings and credentials locally.
- **identity** — to run the GitHub OAuth sign-in flow (optional auth method).
- **host access** to `leetcode.com`, `geeksforgeeks.org`, `hackerrank.com` — to detect accepted submissions and read your solution code.
- **host access** to `github.com` / `api.github.com` — to create the repository and commit your solutions.

## Contact

For questions about this policy, open an issue at the project's GitHub repository.
