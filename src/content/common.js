// Shared helpers available to every platform content script via window.Gitlift.
window.Gitlift = window.Gitlift || {};
(function (CS) {
  // ---- On-page toast notification -----------------------------------------
  CS.toast = function (text, ok = true) {
    let el = document.getElementById('gitlift-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gitlift-toast';
      document.body.appendChild(el);
    }
    el.textContent = '⇡ Gitlift - ' + text;
    el.style.cssText =
      'position:fixed;z-index:2147483647;bottom:20px;right:20px;padding:11px 16px;' +
      'border-radius:10px;font:600 13px/1.4 system-ui,-apple-system,sans-serif;color:#fff;' +
      'box-shadow:0 6px 22px rgba(0,0,0,.32);transition:opacity .3s;opacity:1;' +
      'max-width:340px;background:' + (ok ? '#16a34a' : '#dc2626') + ';';
    clearTimeout(CS._t);
    CS._t = setTimeout(() => { el.style.opacity = '0'; }, 4500);
  };

  // ---- Send a solution to the background worker for committing -------------
  CS.push = function (payload) {
    CS.toast('Pushing “' + payload.title + '”…');
    chrome.runtime.sendMessage({ type: 'commit', payload }, (res) => {
      if (chrome.runtime.lastError) {
        CS.toast(chrome.runtime.lastError.message, false);
        return;
      }
      if (!res || !res.ok) {
        CS.toast((res && res.error) || 'Push failed', false);
        return;
      }
      CS.toast('Pushed “' + payload.title + '” ✓', true);
    });
  };

  CS.slugify = (s) =>
    (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  CS.extByLang = (lang) => {
    const m = {
      python: 'py', python3: 'py', py: 'py', java: 'java', 'c++': 'cpp', cpp: 'cpp',
      c: 'c', javascript: 'js', node: 'js', js: 'js', typescript: 'ts', ts: 'ts',
      csharp: 'cs', 'c#': 'cs', go: 'go', golang: 'go', ruby: 'rb', swift: 'swift',
      kotlin: 'kt', rust: 'rs', scala: 'scala', php: 'php', sql: 'sql', mysql: 'sql',
      pandas: 'py', dart: 'dart', racket: 'rkt', erlang: 'erl', elixir: 'ex', perl: 'pl'
    };
    return m[(lang || '').toLowerCase()] || 'txt';
  };

  CS.htmlToText = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || '').trim();
  };

  // ---- Page-context bridge (for editors that store code in JS, not DOM) ----
  let injected = false;
  CS.injectPageScript = function () {
    if (injected) return;
    injected = true;
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('src/content/inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).appendChild(s);
  };

  CS.requestPageCode = function () {
    CS.injectPageScript();
    return new Promise((resolve) => {
      function handler(e) {
        if (e.source === window && e.data && e.data.__gitlift === 'code') {
          window.removeEventListener('message', handler);
          resolve(e.data.code || null);
        }
      }
      window.addEventListener('message', handler);
      window.postMessage({ __gitlift: 'get-code' }, '*');
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, 1500);
    });
  };
})(window.Gitlift);
