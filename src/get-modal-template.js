(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const PAGE_TOKEN_PATTERN = /{{\s*(PAGE_EDITOR|PAGE_SETTINGS|PAGE_VARIABLES|PAGE_DRAFTS|PAGE_ABOUT)\s*}}/g;

  function readResource(resourceName) {
    if (typeof GM_getResourceText !== "function") return "";
    try {
      return GM_getResourceText(resourceName) || "";
    } catch {
      return "";
    }
  }

  function assembleTemplate(shellTemplate, pageTemplates) {
    if (!shellTemplate) return "";

    const pageMap = {
      PAGE_EDITOR: pageTemplates.editor || "",
      PAGE_SETTINGS: pageTemplates.settings || "",
      PAGE_VARIABLES: pageTemplates.variables || "",
      PAGE_DRAFTS: pageTemplates.drafts || "",
      PAGE_ABOUT: pageTemplates.about || ""
    };

    return shellTemplate.replace(PAGE_TOKEN_PATTERN, (full, token) => pageMap[token] || "");
  }

  app.getModalTemplate = function getModalTemplate() {
    if (typeof app._hotTemplateOverride === "string" && app._hotTemplateOverride.trim()) {
      return app._hotTemplateOverride;
    }

    const shellTemplate = readResource("modalShellTemplate");
    const pageTemplates = {
      editor: readResource("modalPageEditor"),
      settings: readResource("modalPageSettings"),
      variables: readResource("modalPageVariables"),
      drafts: readResource("modalPageDrafts"),
      about: readResource("modalPageAbout")
    };

    const assembled = assembleTemplate(shellTemplate, pageTemplates);
    if (assembled) return assembled;

    const legacyTemplate = readResource("modalTemplate");
    if (legacyTemplate) return legacyTemplate;

    return "";
  };
})(globalThis);
