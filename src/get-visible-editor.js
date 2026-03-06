(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  console.log

  app.getVisibleEditor = function getVisibleEditor() {
    const selector = [
      ".ql-editor",
      "[contenteditable]",
      "[contenteditable='true']",
      "[contenteditable='plaintext-only']",
      ".editor",
      ".comment-bar__editor",
      ".cu-comment__editor",
      ".cu-comment-editor-content",
      "[data-test*='editor']",
      "textarea",
      "input[type='text']",
      "[role='textbox']",
    ].join(", ");

    const isVisible = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      try {
        const style = getComputedStyle(el);
        if (style && style.visibility === "hidden") return false;
      } catch (err) {
        return false;
      }
      if (el.closest("[aria-hidden='true'], [role='dialog'], .modal, .popover")) return false;
      return true;
    };

    const candidates = [...document.querySelectorAll(selector)];

    const found = candidates.find(isVisible);
    if (found) return found;

    // Fallback: check document.activeElement
    try {
      const active = document.activeElement;
      if (active && isVisible(active) && (active.matches && active.matches(selector))) {
        return active;
      }
    } catch (err) {
      // ignore
    }

    // Fallback: look inside same-origin iframes for an active editable
    try {
      for (const iframe of document.querySelectorAll("iframe")) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) continue;
          const el = doc.activeElement || doc.querySelector(selector);
          if (el && isVisible(iframe)) {
            // prefer editable within iframe
            if (el instanceof HTMLElement) return el;
          }
        } catch (err) {
          continue;
        }
      }
    } catch (err) {
      // ignore
    }

    // Fallback: use current selection's focus node to find editable ancestor
    try {
      const sel = document.getSelection && document.getSelection();
      if (sel && sel.focusNode) {
        let focusEl = sel.focusNode.nodeType === Node.TEXT_NODE ? sel.focusNode.parentElement : sel.focusNode;
        if (focusEl) {
          const editableAncestor = focusEl.closest(selector) || focusEl.closest('[contenteditable]');
          if (editableAncestor && isVisible(editableAncestor)) return editableAncestor;
        }
      }
    } catch (err) {
      // ignore
    }

    return null;
  };
})(globalThis);
