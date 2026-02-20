(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const PAGE_TOKEN_PATTERN = /{{\s*(PAGE_EDITOR|PAGE_SETTINGS|PAGE_VARIABLES|PAGE_DRAFTS|PAGE_ABOUT)\s*}}/g;
  const SHELL_TOKEN_PATTERN = /{{\s*(SETTINGS_ANCHOR_RAIL)\s*}}/g;
  const SETTINGS_PAGE_TOKEN_PATTERN = /{{\s*(SETTINGS_SECTION_TRIGGER|SETTINGS_SECTION_APPEARANCE|SETTINGS_SECTION_TYPOGRAPHY|SETTINGS_SECTION_OVERLAY|SETTINGS_SECTION_AUDIO|SETTINGS_SECTION_ACCESSIBILITY|SETTINGS_SECTION_ANIMATION)\s*}}/g;

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

    return shellTemplate
      .replace(PAGE_TOKEN_PATTERN, (full, token) => pageMap[token] || "")
      .replace(SHELL_TOKEN_PATTERN, (full, token) => {
        if (token === "SETTINGS_ANCHOR_RAIL") return pageTemplates.settingsAnchor || "";
        return "";
      });
  }

  function assembleSettingsPage(settingsTemplate, sectionTemplates) {
    if (!settingsTemplate) return "";
    const sectionMap = {
      SETTINGS_SECTION_TRIGGER: sectionTemplates.trigger || "",
      SETTINGS_SECTION_APPEARANCE: sectionTemplates.appearance || "",
      SETTINGS_SECTION_TYPOGRAPHY: sectionTemplates.typography || "",
      SETTINGS_SECTION_OVERLAY: sectionTemplates.overlay || "",
      SETTINGS_SECTION_AUDIO: sectionTemplates.audio || "",
      SETTINGS_SECTION_ACCESSIBILITY: sectionTemplates.accessibility || "",
      SETTINGS_SECTION_ANIMATION: sectionTemplates.animation || ""
    };
    return settingsTemplate.replace(SETTINGS_PAGE_TOKEN_PATTERN, (full, token) => sectionMap[token] || "");
  }

  app.getModalTemplate = function getModalTemplate() {
    if (typeof app._hotTemplateOverride === "string" && app._hotTemplateOverride.trim()) {
      return app._hotTemplateOverride;
    }

    const shellTemplate = readResource("modalShellTemplate");
    const settingsPage = assembleSettingsPage(
      readResource("modalPageSettings"),
      {
        trigger: readResource("modalPageSettingsSectionTrigger"),
        appearance: readResource("modalPageSettingsSectionAppearance"),
        typography: readResource("modalPageSettingsSectionTypography"),
        overlay: readResource("modalPageSettingsSectionOverlay"),
        audio: readResource("modalPageSettingsSectionAudio"),
        accessibility: readResource("modalPageSettingsSectionAccessibility"),
        animation: readResource("modalPageSettingsSectionAnimation")
      }
    );

    const pageTemplates = {
      editor: readResource("modalPageEditor"),
      settings: settingsPage || readResource("modalPageSettings"),
      variables: readResource("modalPageVariables"),
      drafts: readResource("modalPageDrafts"),
      about: readResource("modalPageAbout"),
      settingsAnchor: readResource("modalPageSettingsAnchorRail")
    };

    const assembled = assembleTemplate(shellTemplate, pageTemplates);
    if (assembled) return assembled;

    const legacyTemplate = readResource("modalTemplate");
    if (legacyTemplate) return legacyTemplate;

    return "";
  };
})(globalThis);
