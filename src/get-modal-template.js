(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

  app.getModalTemplate = function getModalTemplate() {
    if (typeof app._hotTemplateOverride === "string" && app._hotTemplateOverride.trim()) {
      return app._hotTemplateOverride;
    }

    if (typeof GM_getResourceText === "function") {
      const template = GM_getResourceText("modalTemplate");
      if (template) return template;
    }

    return "";
  };
})(globalThis);
