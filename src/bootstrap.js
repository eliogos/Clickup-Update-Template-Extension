(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

  app.unmount = function unmount() {
    if (typeof app._keydownHandler === "function") {
      document.removeEventListener("keydown", app._keydownHandler);
      app._keydownHandler = null;
    }

    app._bootstrapped = false;
  };

  app.bootstrap = function bootstrap() {
    if (app._bootstrapped && typeof app._keydownHandler === "function") return;

    const constants = app.constants || {};
    const trigger = constants.TRIGGER || "--update";

    app.unmount();
    app._bootstrapped = true;

    const handler = (e) => {
      if (e.key !== " ") return;
      if (typeof app.getVisibleEditor !== "function" || typeof app.openModal !== "function") return;

      const editor = app.getVisibleEditor();
      if (!editor) return;

      const text = editor.innerText.trim();
      if (text !== trigger) return;

      e.preventDefault();
      app.openModal(editor);
    };

    app._keydownHandler = handler;
    document.addEventListener("keydown", handler);
  };
})(globalThis);
