(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

  app.simulatePaste = function simulatePaste(editor, html) {
    editor.focus();

    const event = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer()
    });

    event.clipboardData.setData("text/html", html);
    event.clipboardData.setData("text/plain", html);

    editor.dispatchEvent(event);
  };

  app.simulatePasteBlockByBlock = async function simulatePasteBlockByBlock(editor, html, options = {}) {
    const sourceHtml = String(html || "");
    if (!sourceHtml.trim()) return;

    const delayMsRaw = Number(options.delayMs);
    const delayMs = Number.isFinite(delayMsRaw) ? Math.max(20, Math.min(250, Math.round(delayMsRaw))) : 70;
    const sleep = (ms) => new Promise((resolve) => global.setTimeout(resolve, ms));

    const scratch = document.createElement("div");
    scratch.innerHTML = sourceHtml;
    const blocks = Array.from(scratch.childNodes)
      .filter((node) => {
        if (!node) return false;
        if (node.nodeType === global.Node.TEXT_NODE) {
          return String(node.textContent || "").trim().length > 0;
        }
        return true;
      })
      .map((node) => {
        const wrap = document.createElement("div");
        wrap.appendChild(node.cloneNode(true));
        return wrap.innerHTML;
      })
      .filter((chunk) => String(chunk || "").trim().length > 0);

    if (!blocks.length) {
      app.simulatePaste(editor, sourceHtml);
      return;
    }

    for (let index = 0; index < blocks.length; index += 1) {
      app.simulatePaste(editor, blocks[index]);
      if (index < blocks.length - 1) {
        // Small delay creates a visible "chunked" paste animation.
        await sleep(delayMs);
      }
    }
  };
})(globalThis);
