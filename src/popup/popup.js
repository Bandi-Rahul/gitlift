function send(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

const $ = (id) => document.getElementById(id);

async function init() {
  const stats = await send({ type: 'get-stats' });
  if (!stats || !stats.username) {
    $('status').textContent = 'Not connected';
    $('status').className = 'value err';
    return;
  }
  $('status').textContent = 'Connected';
  $('status').className = 'value ok';
  $('username').textContent = stats.username;
  $('solved').textContent = stats.solved || 0;

  if (stats.repo) {
    const a = $('repo');
    a.textContent = stats.repo;
    a.href = `https://github.com/${stats.username}/${stats.repo}`;
  } else {
    $('repo').textContent = 'Not set';
    $('repo').classList.add('muted');
  }
}

$('options').addEventListener('click', () => chrome.runtime.openOptionsPage());
init();
