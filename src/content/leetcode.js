// LeetCode: detects an accepted submission, then pulls the problem metadata and
// the exact accepted source code through LeetCode's own GraphQL API (uses the
// user's existing logged-in session).
(function () {
  const CS = window.Gitlift;
  const GQL = 'https://leetcode.com/graphql/';

  async function gql(query, variables) {
    const res = await fetch(GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  }

  function titleSlug() {
    const m = location.pathname.match(/\/problems\/([^/]+)/);
    return m ? m[1] : null;
  }

  function questionData(slug) {
    return gql(
      `query q($titleSlug: String!) {
         question(titleSlug: $titleSlug) {
           questionFrontendId title titleSlug difficulty content
         }
       }`,
      { titleSlug: slug }
    ).then((d) => d.question);
  }

  function submissionList(slug) {
    return gql(
      `query s($questionSlug: String!, $offset: Int!, $limit: Int!) {
         questionSubmissionList(questionSlug: $questionSlug, offset: $offset, limit: $limit) {
           submissions { id statusDisplay lang runtime memory timestamp }
         }
       }`,
      { questionSlug: slug, offset: 0, limit: 20 }
    ).then((d) => (d.questionSubmissionList && d.questionSubmissionList.submissions) || []);
  }

  function submissionDetails(id) {
    return gql(
      `query d($submissionId: Int!) {
         submissionDetails(submissionId: $submissionId) {
           code runtimeDisplay memoryDisplay lang { name verboseName }
         }
       }`,
      { submissionId: Number(id) }
    ).then((d) => d.submissionDetails);
  }

  async function waitForAccepted(slug, sinceTs) {
    for (let i = 0; i < 12; i++) {
      const subs = await submissionList(slug);
      const hit = subs.find(
        (s) => s.statusDisplay === 'Accepted' && Number(s.timestamp) >= sinceTs - 5
      );
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 1500));
    }
    return null;
  }

  function buildReadme(q, sub) {
    const stats = [sub && sub.runtime, sub && sub.memory].filter(Boolean).join(' · ');
    return (
      `# ${q.questionFrontendId}. ${q.title}\n\n` +
      `**Difficulty:** ${q.difficulty}${stats ? `  \n**Result:** ${stats}` : ''}\n\n` +
      `[View on LeetCode](https://leetcode.com/problems/${q.titleSlug}/)\n\n` +
      `## Problem\n\n${CS.htmlToText(q.content)}\n`
    );
  }

  let busy = false;
  async function handleSubmit() {
    if (busy) return;
    busy = true;
    const since = Math.floor(Date.now() / 1000);
    try {
      const slug = titleSlug();
      if (!slug) return;
      const q = await questionData(slug);
      const sub = await waitForAccepted(slug, since);
      if (!sub) return; // not accepted (or timed out)

      const detail = await submissionDetails(sub.id);
      const lang = (detail.lang && detail.lang.name) || sub.lang || 'txt';
      const num = q.questionFrontendId;
      const dirName = `${num}-${q.titleSlug}`;

      CS.push({
        platform: 'leetcode',
        slug: dirName,
        title: `${num}. ${q.title}`,
        difficulty: q.difficulty,
        runtime: detail.runtimeDisplay,
        memory: detail.memoryDisplay,
        fileName: `${q.titleSlug}.${CS.extByLang(lang)}`,
        code: detail.code,
        description: buildReadme(q, { runtime: detail.runtimeDisplay, memory: detail.memoryDisplay })
      });
    } catch (e) {
      CS.toast(e.message, false);
    } finally {
      setTimeout(() => { busy = false; }, 3000);
    }
  }

  // Trigger only on an actual "Submit" (not "Run").
  document.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('button, a');
      if (!btn) return;
      const label = (btn.textContent || '').trim().toLowerCase();
      if (label === 'submit' || /\bsubmit\b/.test(label)) handleSubmit();
    },
    true
  );

  // Ctrl/Cmd+Enter is the LeetCode submit shortcut.
  document.addEventListener(
    'keydown',
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
    },
    true
  );
})();
