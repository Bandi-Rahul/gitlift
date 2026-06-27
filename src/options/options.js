const $ = (id) => document.getElementById(id);
function send(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

function setStatus(text, kind = 'info') {
  const el = $('status');
  el.textContent = text;
  el.className = 'status show ' + kind;
}

async function load() {
  const s = await chrome.storage.local.get(['repo', 'username', 'clientId', 'clientSecret', 'token']);
  $('repo').value = s.repo || '';
  $('clientId').value = s.clientId || '';
  $('clientSecret').value = s.clientSecret || '';
  if (s.token && s.username) setStatus(`Connected as ${s.username}.`, 'ok');

  const r = await send({ type: 'get-redirect-url' });
  if (r && r.url) $('redirect').textContent = r.url;
}

$('save').addEventListener('click', async () => {
  const repo = $('repo').value.trim();
  if (!repo) return setStatus('Enter a repository name.', 'err');
  await chrome.storage.local.set({ repo });
  setStatus('Repository saved ✓', 'ok');
});

$('connect').addEventListener('click', async () => {
  const clientId = $('clientId').value.trim();
  const clientSecret = $('clientSecret').value.trim();
  if (!clientId || !clientSecret) return setStatus('Enter both Client ID and Client Secret.', 'err');
  await chrome.storage.local.set({ clientId, clientSecret });
  setStatus('Opening GitHub authorization…', 'info');
  const res = await send({ type: 'oauth-connect', clientId, clientSecret });
  if (res && res.ok) setStatus(`Connected as ${res.username} ✓`, 'ok');
  else setStatus('Connection failed: ' + (res && res.error), 'err');
});

$('savePat').addEventListener('click', async () => {
  const pat = $('pat').value.trim();
  if (!pat) return setStatus('Enter a personal access token.', 'err');
  await chrome.storage.local.set({ token: pat, authMethod: 'pat' });
  setStatus('Verifying token…', 'info');
  const test = await send({ type: 'test-connection' });
  if (test && test.ok) {
    setStatus(`Connected as ${test.username} ✓`, 'ok');
    $('pat').value = '';
  } else {
    setStatus('Invalid token: ' + (test && test.error), 'err');
  }
});

load();
