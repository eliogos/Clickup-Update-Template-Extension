(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const PAGE_TOKEN_PATTERN = /{{\s*(PAGE_EDITOR|PAGE_SETTINGS|PAGE_VARIABLES|PAGE_DRAFTS|PAGE_USAGE|PAGE_AUDIO|PAGE_RADIO|PAGE_ABOUT)\s*}}/g;
  const SHELL_TOKEN_PATTERN = /{{\s*(SETTINGS_ANCHOR_RAIL|MODAL_TOAST|MODAL_CONFETTI_OVERLAY)\s*}}/g;
  const SETTINGS_PAGE_TOKEN_PATTERN = /{{\s*(SETTINGS_SECTION_TRIGGER|SETTINGS_SECTION_APPEARANCE|SETTINGS_SECTION_TYPOGRAPHY|SETTINGS_SECTION_OVERLAY|SETTINGS_SECTION_AUDIO|SETTINGS_SECTION_ACCESSIBILITY|SETTINGS_SECTION_ANIMATION|SETTINGS_SECTION_AI_SEARCH_PROVIDER|SETTINGS_SECTION_PHYSICS)\s*}}/g;
  const RADIO_PAGE_TOKEN_PATTERN = /{{\s*(WAVEFORM_FILTERS|WAVEFORM)\s*}}/g;

  function assembleRadioPage(radioTemplate, fragmentTemplates) {
    if (!radioTemplate) return "";

    const fragmentMap = {
      WAVEFORM_FILTERS: fragmentTemplates.waveformFilters || "",
      WAVEFORM: fragmentTemplates.waveform || ""
    };

    return radioTemplate.replace(RADIO_PAGE_TOKEN_PATTERN, (full, token) => {
      return fragmentMap[token] || "";
    });
  }

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
      PAGE_USAGE: pageTemplates.usage || "",
      PAGE_AUDIO: pageTemplates.radio || pageTemplates.audio || "",
      PAGE_RADIO: pageTemplates.radio || pageTemplates.audio || "",
      PAGE_ABOUT: pageTemplates.about || ""
    };

    return shellTemplate
      .replace(PAGE_TOKEN_PATTERN, (full, token) => pageMap[token] || "")
      .replace(SHELL_TOKEN_PATTERN, (full, token) => {
        if (token === "SETTINGS_ANCHOR_RAIL") return pageTemplates.settingsAnchor || "";
        if (token === "MODAL_TOAST") return pageTemplates.modalToast || "";
        if (token === "MODAL_CONFETTI_OVERLAY") return pageTemplates.modalConfettiOverlay || "";
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
      SETTINGS_SECTION_ANIMATION: sectionTemplates.animation || "",
      SETTINGS_SECTION_AI_SEARCH_PROVIDER: sectionTemplates.aiSearchProvider || "",
      SETTINGS_SECTION_PHYSICS: sectionTemplates.physics || ""
    };
    let assembled = settingsTemplate.replace(SETTINGS_PAGE_TOKEN_PATTERN, (full, token) => sectionMap[token] || "");

    // Backward-compat: if an older settings template is loaded (without the new token),
    // still render the Physics section at the end.
    if (
      sectionTemplates.physics &&
      !/id=["']settings-section-physics["']/i.test(assembled)
    ) {
      if (/<\/div>\s*<\/div>\s*<\/section>\s*$/i.test(assembled)) {
        assembled = assembled.replace(
          /<\/div>\s*<\/div>\s*<\/section>\s*$/i,
          `${sectionTemplates.physics}\n    </div>\n  </div>\n</section>`
        );
      } else {
        assembled += sectionTemplates.physics;
      }
    }

    return assembled;
  }

  app.getModalTemplate = function getModalTemplate() {
    const override =
      typeof app._hotTemplateOverride === "string" ? app._hotTemplateOverride : "";

    const replaceRadioTokens = (html) =>
      String(html || "").replace(/{{{?\s*(WAVEFORM_FILTERS|WAVEFORM)\s*}?}}/g, (m, token) => {
        if (token === "WAVEFORM") return readResource("modalPageWaveform") || "";
        if (token === "WAVEFORM_FILTERS") return readResource("modalPageWaveformFilters") || "";
        return "";
      });

    if (override.trim()) {
      return replaceRadioTokens(override);
    }

    const shellTemplate = readResource("modalShellTemplate");
    const radioPage = assembleRadioPage(
      readResource("modalPageRadio") || readResource("modalPageAudio"),
      {
        waveform: readResource("modalPageWaveform"),
        waveformFilters: readResource("modalPageWaveformFilters")
      }
    );
    const settingsPage = assembleSettingsPage(
      readResource("modalPageSettings"),
      {
        trigger: readResource("modalPageSettingsSectionTrigger"),
        appearance: readResource("modalPageSettingsSectionAppearance"),
        typography: readResource("modalPageSettingsSectionTypography"),
        overlay: readResource("modalPageSettingsSectionOverlay"),
        audio: readResource("modalPageSettingsSectionAudio"),
        accessibility: readResource("modalPageSettingsSectionAccessibility"),
        animation: readResource("modalPageSettingsSectionAnimation"),
        aiSearchProvider: readResource("modalPageSettingsSectionAiSearchProvider"),
        physics: readResource("modalPageSettingsSectionPhysics")
      }
    );

    const pageTemplates = {
      editor: readResource("modalPageEditor"),
      settings: settingsPage || readResource("modalPageSettings"),
      variables: readResource("modalPageVariables"),
      drafts: readResource("modalPageDrafts"),
      usage: readResource("modalPageUsage"),
      radio: readResource("modalPageRadio"),
      about: readResource("modalPageAbout"),
      settingsAnchor: readResource("modalPageSettingsAnchorRail"),
      modalToast: readResource("modalFragmentToast"),
      modalConfettiOverlay: readResource("modalFragmentConfettiOverlay")
    };

    const assembled = assembleTemplate(shellTemplate, pageTemplates);
    if (assembled) return replaceRadioTokens(assembled);

    const legacyTemplate = readResource("modalTemplate");
    if (legacyTemplate) return replaceRadioTokens(legacyTemplate);

    return "";
  };
})(globalThis);
