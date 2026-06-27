// GeeksforGeeks: watches the problem page for a successful submission, then
// grabs the code from the in-page editor via the page-context bridge.
(function () {
  const CS = window.Gitlift;
  CS.injectPageScript();

  const SUCCESS = /problem\s*solved|correct\s*answer|all\s*test\s*cases\s*passed|compilation\s*completed.*passed/i;

  function problemTitle() {
    const el =
      document.querySelector('.problems_header_content__title h3') ||
      document.querySelector('[class*="problems_header"] h3') ||
      document.querySelector('h1, h3');
    return el ? el.textContent.trim() : document.title.replace(/\s*\|.*$/, '').trim();
  }

  function problemSlug() {
    const m = location.pathname.match(/\/problems\/([^/]+)/);
    return m ? m[1].replace(/\d+$/, '').replace(/-+$/, '') : CS.slugify(problemTitle());
  }

  function detectLang() {
    const sel = document.querySelector(
      'select[class*="language"] option:checked, [class*="languageBtn"], [class*="language"] [aria-selected="true"]'
    );
    const txt = (sel && sel.textContent) || 'cpp';
    if (/c\+\+/i.test(txt)) return 'cpp';
    if (/python/i.test(txt)) return 'python';
    if (/java/i.test(txt)) return 'java';
    if (/javascript/i.test(txt)) return 'javascript';
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
      const title = problemTitle();
      const slug = problemSlug();
      const lang = detectLang();
      CS.push({
        platform: 'geeksforgeeks',
        slug,
        title,
        fileName: `${slug}.${CS.extByLang(lang)}`,
        code,
        description: `# ${title}\n\n[View on GeeksforGeeks](${location.href})\n`
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
