import * as github from './github.js';
import * as oauth from './oauth.js';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handle(msg)
    .then(sendResponse)
    .catch((err) => sendResponse({ ok: false, error: err.message }));
  return true; // keep the message channel open for the async response
});

async function handle(msg) {
  switch (msg.type) {
    case 'oauth-connect':
      return connect(msg);
    case 'get-redirect-url':
      return { ok: true, url: oauth.getRedirectURL() };
    case 'test-connection':
      return testConnection();
    case 'commit':
      return commit(msg.payload);
    case 'get-stats':
      return getStats();
    default:
      throw new Error('Unknown message type: ' + msg.type);
  }
}

async function connect({ clientId, clientSecret }) {
  const token = await oauth.startOAuth(clientId, clientSecret);
  const user = await github.getUser(token);
  await chrome.storage.local.set({ token, username: user.login, authMethod: 'oauth' });
  return { ok: true, username: user.login };
}

async function testConnection() {
  const { token } = await chrome.storage.local.get('token');
  if (!token) throw new Error('Not connected — add a token or authorize with GitHub first.');
  const user = await github.getUser(token);
  await chrome.storage.local.set({ username: user.login });
  return { ok: true, username: user.login };
}

async function commit(payload) {
  const { token, repo } = await chrome.storage.local.get(['token', 'repo']);
  if (!token) throw new Error('Not authenticated. Open Gitlift options to connect GitHub.');
  if (!repo) throw new Error('No target repository set in Gitlift options.');

  const owner = await github.ensureRepo(token, repo, 'My coding solutions, synced automatically.');
  const dir = `${payload.platform}/${payload.slug}`;
  const solutionPath = `${dir}/${payload.fileName}`;
  const readmePath = `${dir}/README.md`;

  const stamp = [payload.runtime, payload.memory].filter(Boolean).join(', ');
  const message = `${payload.title}${stamp ? ` (${stamp})` : ''}`;

  await github.putFile(token, owner, repo, solutionPath, payload.code, message);
  if (payload.description) {
    await github.putFile(token, owner, repo, readmePath, payload.description, `Add notes for ${payload.title}`);
  }

  await bumpStats(payload.slug);
  return { ok: true, url: `https://github.com/${owner}/${repo}/tree/main/${dir}` };
}

async function bumpStats(slug) {
  const { solvedSet = [] } = await chrome.storage.local.get('solvedSet');
  if (!solvedSet.includes(slug)) solvedSet.push(slug);
  await chrome.storage.local.set({ solvedSet, solved: solvedSet.length });
}

async function getStats() {
  const { username, repo, solved = 0 } = await chrome.storage.local.get(['username', 'repo', 'solved']);
  return { ok: true, username, repo, solved };
}
