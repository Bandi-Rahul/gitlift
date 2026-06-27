// Runs in the PAGE context (not the isolated content-script world) so it can
// read code straight out of the live editor instance. Communicates back to the
// content script via window.postMessage.
(function () {
  function readEditor() {
    try {
      // Monaco (LeetCode-style, also used by some others)
      if (window.monaco && window.monaco.editor) {
        const models = window.monaco.editor.getModels();
        if (models && models.length) return models[0].getValue();
      }
      // CodeMirror 5
      const cm = document.querySelector('.CodeMirror');
      if (cm && cm.CodeMirror) return cm.CodeMirror.getValue();
      // CodeMirror 6
      const cm6 = document.querySelector('.cm-content');
      if (cm6 && cm6.cmView && cm6.cmView.view) return cm6.cmView.view.state.doc.toString();
      // ACE editor
      if (window.ace) {
        const el = document.querySelector('.ace_editor');
        if (el) return window.ace.edit(el).getValue();
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.__gitlift !== 'get-code') return;
    window.postMessage({ __gitlift: 'code', code: readEditor() }, '*');
  });
})();
