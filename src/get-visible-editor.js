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
      try {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (style && style.visibility === "hidden") return false;
        if (style && style.display === "none") return false;
        // treat elements with size>0 as visible; but also allow contenteditables
        // (Quill editors) that may report small rects initially.
        if ((rect.width > 0 && rect.height > 0) || el.isContentEditable || el.matches?.(".ql-editor")) {
          if (el.closest("[aria-hidden='true'], [role='dialog'], .modal, .popover")) return false;
          return true;
        }
      } catch (err) {
        return false;
      }
      return false;
    };

    // Prefer caret/selection and activeElement first to catch deeply-nested editors
    try {
      const sel = document.getSelection && document.getSelection();
      if (sel && sel.focusNode) {
        let focusEl = sel.focusNode.nodeType === Node.TEXT_NODE ? sel.focusNode.parentElement : sel.focusNode;
        // climb out of shadow root if needed
        const root = sel.focusNode.getRootNode && sel.focusNode.getRootNode();
        if (root && root.host) focusEl = focusEl || root.host;
        if (focusEl) {
          const editableAncestor = focusEl.closest(selector) || focusEl.closest("[contenteditable]");
          if (editableAncestor && isVisible(editableAncestor)) return editableAncestor;
          // if the focusEl itself is a good match
          if (focusEl.matches && focusEl.matches(selector) && isVisible(focusEl)) return focusEl;
        }
      }
    } catch (err) {
      // ignore
    }

    // Fallback: check document.activeElement next
    try {
      const active = document.activeElement;
      if (active) {
        const root = active.getRootNode && active.getRootNode();
        const activeHost = root && root.host ? root.host : null;
        const candidate = active.matches && active.matches(selector) ? active : activeHost;
        if (candidate && isVisible(candidate) && candidate.matches && candidate.matches(selector)) return candidate;
        if (candidate && isVisible(candidate) && (candidate.closest && candidate.closest(selector))) return candidate.closest(selector);
      }
    } catch (err) {
      // ignore
    }

    // Next: look inside same-origin iframes for an active editable
    try {
      for (const iframe of document.querySelectorAll("iframe")) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) continue;
          const el = doc.activeElement || doc.querySelector(selector);
          if (el && isVisible(iframe)) {
            if (el instanceof HTMLElement) return el;
          }
        } catch (err) {
          continue;
        }
      }
    } catch (err) {
      // ignore
    }

    // As a final pass, query visible candidates in the document
    const candidates = [...document.querySelectorAll(selector)];
    const found = candidates.find(isVisible);
    if (found) return found;

    return null;
  };
})(globalThis);
