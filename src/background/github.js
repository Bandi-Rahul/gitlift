// Thin wrapper around the GitHub REST API used to create the repo and commit files.
const API = 'https://api.github.com';

async function gh(token, path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.headers || {})
    }
  });
  if (!res.ok && res.status !== 404 && res.status !== 422) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 300)}`);
  }
  return res;
}

export async function getUser(token) {
  const res = await gh(token, '/user');
  if (!res.ok) throw new Error('Could not fetch GitHub user. Check your token / authorization.');
  return res.json();
}

export async function ensureRepo(token, repo, description) {
  const user = await getUser(token);
  const check = await gh(token, `/repos/${user.login}/${encodeURIComponent(repo)}`);
  if (check.status === 404) {
    await gh(token, '/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: repo,
        description: description || 'My coding solutions, synced automatically.',
        private: false,
        auto_init: true
      })
    });
  }
  return user.login;
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function getFileSha(token, owner, repo, path) {
  const res = await gh(token, `/repos/${owner}/${repo}/contents/${encodePath(path)}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return data.sha;
}

// UTF-8 safe base64 encoding.
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export async function putFile(token, owner, repo, path, content, message) {
  const sha = await getFileSha(token, owner, repo, path);
  const body = {
    message,
    content: b64(content),
    ...(sha ? { sha } : {})
  };
  const res = await gh(token, `/repos/${owner}/${repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Commit failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}
