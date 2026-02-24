(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

  app.getVisibleEditor = function getVisibleEditor() {
    const selector = ".ql-editor, [contenteditable='true'], .editor";
    const candidates = [...document.querySelectorAll(selector)];

    return (
      candidates.find((el) => {
        if (!(el instanceof HTMLElement)) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;

        try {
          const style = getComputedStyle(el);
          if (style && style.visibility === "hidden") return false;
        } catch (err) {
        }

        if (el.closest("[aria-hidden='true'], [role='dialog'], .modal, .popover")) return false;

        return true;
      }) || null
    );
  };
})(globalThis);
