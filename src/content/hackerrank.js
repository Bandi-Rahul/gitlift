// HackerRank: watches a challenge page for a successful submission, then grabs
// the code from the Monaco/CodeMirror editor via the page-context bridge.
(function () {
  const CS = window.Gitlift;
  CS.injectPageScript();

  const SUCCESS = /congratulations|you (have )?(solved|passed)|all test cases passed|success/i;

  function challengeTitle() {
    const el =
      document.querySelector('.challenge-page-label, .ui-icon-label, h1, h2[class*="title"]') ||
      document.querySelector('h1, h2');
    return el ? el.textContent.trim() : document.title.replace(/\s*\|.*$/, '').trim();
  }

  function challengeSlug() {
    const m = location.pathname.match(/\/challenges\/([^/]+)/);
    return m ? m[1] : CS.slugify(challengeTitle());
  }

  function detectLang() {
    const sel = document.querySelector(
      '.select-language .current, [class*="language"] [aria-selected="true"], select[name*="language"] option:checked'
    );
    const txt = (sel && sel.textContent) || 'cpp';
    if (/c\+\+/i.test(txt)) return 'cpp';
    if (/python/i.test(txt)) return 'python';
    if (/java\b/i.test(txt)) return 'java';
    if (/javascript|node/i.test(txt)) return 'javascript';
    if (/\bc#\b|csharp/i.test(txt)) return 'csharp';
    if (/\bc\b/i.test(txt)) return 'c';
    return CS.slugify(txt) || 'cpp';
  }

  let busy = false;
  async function onSuccess() {
    if (busy) return;
    busy = true;
    try {
      const code = await CS.requestPageCode();
      if (!code || !code.trim()) {
        CS.toast('Could not read the editor code.', false);
        return;
      }
      const title = challengeTitle();
      const slug = challengeSlug();
      const lang = detectLang();
      CS.push({
        platform: 'hackerrank',
        slug,
        title,
        fileName: `${slug}.${CS.extByLang(lang)}`,
        code,
        description: `# ${title}\n\n[View on HackerRank](${location.href})\n`
      });
    } catch (e) {
      CS.toast(e.message, false);
    } finally {
      setTimeout(() => { busy = false; }, 4000);
    }
  }

  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && SUCCESS.test(node.textContent || '')) {
          onSuccess();
          return;
        }
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
