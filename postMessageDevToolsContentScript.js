// Guard against duplicate injection: chrome.scripting.executeScript can run
// this file more than once in the same page (e.g. devtools reconnects, or
// SPA sites like TikTok firing multiple tab "complete" updates without a
// real navigation). This flag prevents attaching duplicate message listeners
// (which would relay every postMessage more than once).
if (!window.__pmdtContentScriptInjected) {
  window.__pmdtContentScriptInjected = true;

  window.addEventListener('message', (event) => {
    let isValidChromeRuntime = () => {
      try {
        return chrome.runtime && !!chrome.runtime.getManifest();
      } catch (_err) {
        console.log('Post Message Dev Tools Extension: Failed to execute runtime');
        return false;
      }
    }

    if (isValidChromeRuntime()) {
      chrome.runtime.sendMessage({
        origin: event.origin,
        data: event.data,
      });
    }
  });
}
