(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const FALLBACK_TEMPLATE = "<div class=\"modal\" id=\"modal\" popover=\"manual\">\n  <section class=\"modal-card\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Insert Update Template\">\n    <div class=\"card-header-row\">\n      <p class=\"title\">\n        <span class=\"material-symbols-outlined title-icon\" aria-hidden=\"true\">article</span>\n        Insert Update Template\n      </p>\n      <div class=\"card-header-actions\">\n        <button class=\"btn btn-optional settings-toggle is-active\" id=\"settings-toggle\" type=\"button\" aria-expanded=\"true\" aria-pressed=\"true\" aria-controls=\"settings-sidebar\">\n          <span class=\"material-symbols-outlined\" aria-hidden=\"true\">left_panel_open</span>\n          <span>Sidebar</span>\n        </button>\n        <button class=\"icon-close-btn\" id=\"close-modal\" type=\"button\" aria-label=\"Close modal\">\n          <span class=\"material-symbols-outlined\" aria-hidden=\"true\">close</span>\n        </button>\n      </div>\n    </div>\n\n    <div class=\"modal-body-layout\" id=\"modal-body-layout\">\n      <aside class=\"settings-sidebar\" id=\"settings-sidebar\" aria-label=\"Modal pages\">\n        <div class=\"settings-sidebar-inner\">\n          <nav class=\"sidebar-nav\" id=\"sidebar-nav\" aria-label=\"Modal pages\">\n            <button class=\"sidebar-page-btn is-active\" type=\"button\" data-page-target=\"editor\">\n              <span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit_note</span>\n              <span>Editor</span>\n            </button>\n            <button class=\"sidebar-page-btn\" type=\"button\" data-page-target=\"settings\">\n              <span class=\"material-symbols-outlined\" aria-hidden=\"true\">tune</span>\n              <span>Settings</span>\n            </button>\n            <button class=\"sidebar-page-btn\" type=\"button\" data-page-target=\"variables\">\n              <span class=\"material-symbols-outlined\" aria-hidden=\"true\">data_object</span>\n              <span>Variables</span>\n            </button>\n            <button class=\"sidebar-page-btn\" type=\"button\" data-page-target=\"drafts\">\n              <span class=\"material-symbols-outlined\" aria-hidden=\"true\">inventory_2</span>\n              <span>Drafts</span>\n            </button>\n            <button class=\"sidebar-page-btn\" type=\"button\" data-page-target=\"about\">\n              <span class=\"material-symbols-outlined\" aria-hidden=\"true\">info</span>\n              <span>About</span>\n            </button>\n          </nav>\n        </div>\n      </aside>\n\n      <div class=\"modal-main\" id=\"modal-main\">\n        <div class=\"modal-main-content\" id=\"modal-main-content\">\n          <section class=\"page-panel is-active\" data-page=\"editor\" id=\"page-editor\">\n            <div class=\"page-scroll\">\n              <div class=\"top-section\">\n                <label class=\"group-label top-section-label\" for=\"banner-trigger\">Banner</label>\n                <div class=\"row-inline row-top banner-main-row\">\n                  <div class=\"banner-picker\">\n                    <button class=\"field banner-trigger\" id=\"banner-trigger\" type=\"button\" popovertarget=\"banner-popover\" aria-label=\"Banner color\">\n                      <span class=\"banner-preview {{DEFAULT_BANNER_COLOR}}\" id=\"banner-preview\" aria-hidden=\"true\"></span>\n                      <span class=\"select-icon\" aria-hidden=\"true\"></span>\n                    </button>\n                    <div class=\"banner-popover\" id=\"banner-popover\" popover=\"auto\" aria-label=\"Banner palette\"></div>\n                  </div>\n                  <div class=\"field-stack label-stack\">\n                    <input class=\"field label-input\" id=\"label\" value=\"{{DEFAULT_LABEL}}\" aria-describedby=\"label-error\" />\n                    <p class=\"field-subtext field-subtext-error\" id=\"label-error\" hidden>Label is required.</p>\n                    <div class=\"label-suggestions\" aria-label=\"Label suggestions\">\n                      <span class=\"field-subtext\">Suggestions:</span>\n                      <div class=\"label-chip-row\">\n                        {{LABEL_SUGGESTION_CHIPS}}\n                      </div>\n                    </div>\n                  </div>\n                  <div class=\"field-stack number-stack\">\n                    <div class=\"num-controls\" id=\"num-controls\" aria-label=\"Update number\">\n                      <button class=\"num-btn\" id=\"dec\" type=\"button\">-</button>\n                      <input class=\"num-input\" id=\"number\" value=\"{{DEFAULT_NUMBER}}\" inputmode=\"numeric\" aria-describedby=\"number-error\" />\n                      <button class=\"num-btn\" id=\"inc\" type=\"button\">+</button>\n                    </div>\n                    <p class=\"field-subtext field-subtext-error\" id=\"number-error\" hidden>Update number is required.</p>\n                    <label class=\"append-number-wrap\" for=\"append-number\">\n                      <input type=\"checkbox\" id=\"append-number\" checked />\n                      <span>Append Number Suffix</span>\n                    </label>\n                  </div>\n                </div>\n              </div>\n\n              <div class=\"group\">\n                <label class=\"group-label\">Status<span class=\"req\">*</span></label><br/>\n                <div class=\"select-wrap status-select-wrap\">\n                  <select class=\"field status-select\" id=\"status\">\n                    <option>Not Started</option>\n                    <option selected>In Progress</option>\n                    <option>For QA</option>\n                    <option>Completed</option>\n                  </select>\n                  <span class=\"select-icon\" aria-hidden=\"true\"></span>\n                </div>\n              </div>\n\n              <div class=\"group\">\n                <label class=\"group-label\">Accomplishments<span class=\"req\">*</span></label>\n                <textarea class=\"field\" id=\"acc\" aria-describedby=\"acc-error\"></textarea>\n                <p class=\"field-subtext field-subtext-error\" id=\"acc-error\" hidden>Accomplishments is required.</p>\n              </div>\n\n              <div class=\"group\">\n                <label class=\"group-label\">Blockers</label>\n                <textarea class=\"field\" id=\"block\"></textarea>\n              </div>\n\n              <div class=\"group\">\n                <label class=\"group-label\">Current Focus</label>\n                <textarea class=\"field\" id=\"focus\"></textarea>\n              </div>\n\n              <div class=\"group optional-add-wrap\">\n                <button class=\"btn btn-optional\" id=\"add-notes\" type=\"button\">Add Notes</button>\n              </div>\n\n              <div class=\"group\" id=\"notes-group\" hidden>\n                <label class=\"group-label\">Notes</label>\n                <textarea class=\"field\" id=\"notes\"></textarea>\n              </div>\n            </div>\n          </section>\n\n          <section class=\"page-panel\" data-page=\"settings\" id=\"page-settings\" hidden>\n            <div class=\"page-scroll\">\n              <div class=\"settings-page-content\">\n                <section class=\"settings-section\">\n                  <p class=\"settings-section-title\">Appearance</p>\n\n                  <div class=\"settings-field\">\n                    <label class=\"settings-label\">Theme</label>\n                    <div class=\"settings-segmented\" id=\"theme-group\" role=\"tablist\" aria-label=\"Theme\">\n                      <button class=\"settings-segment-btn\" type=\"button\" data-theme-option=\"light\">Light</button>\n                      <button class=\"settings-segment-btn\" type=\"button\" data-theme-option=\"auto\">Auto</button>\n                      <button class=\"settings-segment-btn\" type=\"button\" data-theme-option=\"dark\">Dark</button>\n                    </div>\n                  </div>\n\n                  <div class=\"settings-field\">\n                    <label class=\"settings-label\">Density</label>\n                    <div class=\"settings-segmented\" id=\"density-group\" role=\"tablist\" aria-label=\"Density\">\n                      <button class=\"settings-segment-btn\" type=\"button\" data-density-option=\"compact\">Compact</button>\n                      <button class=\"settings-segment-btn\" type=\"button\" data-density-option=\"comfortable\">Comfortable</button>\n                      <button class=\"settings-segment-btn\" type=\"button\" data-density-option=\"spacious\">Spacious</button>\n                    </div>\n                  </div>\n\n                  <div class=\"settings-field\">\n                    <label class=\"settings-label\" for=\"color-filter-mode\">Color Blindness</label>\n                    <div class=\"select-wrap settings-select-wrap\">\n                      <select class=\"field settings-select\" id=\"color-filter-mode\">\n                        <option value=\"none\">None</option>\n                        <option value=\"protanopia\">Protanopia</option>\n                        <option value=\"deuteranopia\">Deuteranopia</option>\n                        <option value=\"tritanopia\">Tritanopia</option>\n                        <option value=\"achromatopsia\">Achromatopsia</option>\n                      </select>\n                      <span class=\"select-icon\" aria-hidden=\"true\"></span>\n                    </div>\n                  </div>\n\n                  <div class=\"settings-field\">\n                    <label class=\"settings-label\" for=\"editor-font-size-input\">Editor Font Size</label>\n                    <div class=\"editor-font-size-row\">\n                      <input class=\"field editor-font-size-input\" id=\"editor-font-size-input\" type=\"number\" min=\"10\" max=\"24\" step=\"any\" inputmode=\"decimal\" />\n                      <input class=\"editor-font-size-slider\" id=\"editor-font-size-slider\" type=\"range\" min=\"10\" max=\"24\" step=\"1\" />\n                    </div>\n                    <p class=\"field-subtext\">Slider range: 10-24px. Use the box for precise values.</p>\n                  </div>\n                </section>\n              </div>\n            </div>\n          </section>\n\n          <section class=\"page-panel\" data-page=\"variables\" id=\"page-variables\" hidden>\n            <div class=\"page-scroll\">\n              <div class=\"settings-page-content\">\n                <section class=\"settings-section\">\n                  <p class=\"settings-section-title\">Variables</p>\n                  <p class=\"field-subtext\">\n                    TODO: Variables replacement using <code>{var}</code> is planned while mentions and emoji formatting are finalized in the editor.\n                  </p>\n                </section>\n              </div>\n            </div>\n          </section>\n\n          <section class=\"page-panel\" data-page=\"drafts\" id=\"page-drafts\" hidden>\n            <div class=\"page-scroll\">\n              <div class=\"settings-page-content\">\n                <section class=\"settings-section\">\n                  <p class=\"settings-section-title\">Drafts</p>\n                  <p class=\"field-subtext\">Select a draft to load it back into the Editor page.</p>\n                  <p class=\"drafts-empty\" id=\"drafts-empty\">No drafts yet. Save one from the action bar below.</p>\n                  <div class=\"drafts-list\" id=\"drafts-list\"></div>\n                </section>\n              </div>\n            </div>\n          </section>\n\n          <section class=\"page-panel\" data-page=\"about\" id=\"page-about\" hidden>\n            <div class=\"page-scroll\">\n              <div class=\"settings-page-content\">\n                <section class=\"settings-section\">\n                  <p class=\"settings-section-title\">Feedback</p>\n                  <div class=\"note note-feedback\">\n                    Have any suggestions and bug reports?\n                    <a href=\"https://github.com/eliogos/clickup-task-update-template/issues\" target=\"_blank\" rel=\"noopener noreferrer\">\n                      https://github.com/eliogos/clickup-task-update-template/issues\n                    </a>\n                  </div>\n                </section>\n\n                <section class=\"settings-section\">\n                  <p class=\"settings-section-title\">About</p>\n                  <div class=\"note note-credit\">{{CREDIT_HTML}} - v{{APP_VERSION}}</div>\n                </section>\n              </div>\n            </div>\n          </section>\n        </div>\n\n        <div class=\"footer-row footer-fixed\" id=\"modal-footer-row\">\n          <div class=\"footer-left\">\n            <div class=\"note\" id=\"action-feedback\" data-tone=\"muted\">Ready.</div>\n          </div>\n          <div class=\"footer-right\">\n            <div class=\"actions\">\n              <button class=\"btn\" id=\"save-draft\" type=\"button\">Save as Draft</button>\n              <button class=\"btn\" id=\"copy-html\" type=\"button\">Copy as innerHTML</button>\n              <button class=\"btn btn-primary\" id=\"insert\" type=\"button\" disabled>Insert</button>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </section>\n</div>";

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function getScriptVersionFallback() {
    return global.GM_info &&
      global.GM_info.script &&
      global.GM_info.script.version
      ? String(global.GM_info.script.version)
      : "0.0";
  }

  function replaceToken(source, tokenName, value) {
    const pattern = new RegExp(`{{\\s*${tokenName}\\s*}}`, "g");
    return source.replace(pattern, value);
  }

  function ensureCreditLine(source) {
    if (/class\s*=\s*["'][^"']*note-credit/.test(source)) return source;
    return source;
  }

  function ensureValidationHelpers(source) {
    let output = source;

    if (!/id\s*=\s*["']num-controls["']/.test(output)) {
      output = output.replace(
        /<div\s+class=(["'])num-controls\1([^>]*)>/i,
        '<div class="num-controls" id="num-controls"$2>'
      );
    }

    if (!/id\s*=\s*["']label-error["']/.test(output)) {
      output = output.replace(
        /(<input[^>]*id=(["'])label\2[^>]*>)/i,
        '$1\n      <p class="field-subtext field-subtext-error" id="label-error" hidden>Label is required.</p>'
      );
    }

    if (!/id\s*=\s*["']number-error["']/.test(output)) {
      output = output.replace(
        /(<\/div>\s*)(?=\s*<\/div>\s*<\/div>\s*<div\s+class=(["'])group\2)/i,
        '$1\n      <p class="field-subtext field-subtext-error" id="number-error" hidden>Update number is required.</p>\n'
      );
    }

    if (!/id\s*=\s*["']acc-error["']/.test(output)) {
      output = output.replace(
        /(<textarea[^>]*id=(["'])acc\2[^>]*><\/textarea>)/i,
        '$1\n    <p class="field-subtext field-subtext-error" id="acc-error" hidden>Accomplishments is required.</p>'
      );
    }

    return output;
  }

  function ensureLabelSuggestionChips(source, chipsMarkup) {
    const markup = chipsMarkup || "";
    if (/{{\s*LABEL_SUGGESTION_CHIPS\s*}}/.test(source)) {
      return source.replace(/{{\s*LABEL_SUGGESTION_CHIPS\s*}}/g, markup);
    }

    return source.replace(
      /(<div\s+class=(["'])label-chip-row\2[^>]*>)[\s\S]*?(<\/div>)/i,
      `$1\n${markup}\n            $3`
    );
  }

  app.createModalMarkup = function createModalMarkup() {
    const constants = app.constants || {};
    const defaultLabel = constants.defaultLabel || "Design Update";
    const defaultNumber = constants.defaultNumber || "01";
    const defaultBannerColor = constants.defaultBannerColor || "blue-strong";
    const appVersion =
      constants.APP_VERSION ||
      constants.appVersion ||
      constants.version ||
      getScriptVersionFallback();
    const creditHtml =
      constants.creditHtml ||
      constants.creditHTML ||
      constants.credit ||
      "Made with &#x2764;&#xFE0F; by Jai";

    const template =
      typeof app.getModalTemplate === "function"
        ? app.getModalTemplate()
        : FALLBACK_TEMPLATE;
    const chipsMarkup =
      typeof app.renderLabelSuggestionChips === "function"
        ? app.renderLabelSuggestionChips()
        : "";
    const source = ensureLabelSuggestionChips(
      ensureValidationHelpers(ensureCreditLine(template || FALLBACK_TEMPLATE)),
      chipsMarkup
    );

    let output = source;
    output = replaceToken(output, "LABEL_SUGGESTION_CHIPS", chipsMarkup);
    output = replaceToken(output, "DEFAULT_LABEL", escapeAttr(defaultLabel));
    output = replaceToken(output, "DEFAULT_NUMBER", escapeAttr(defaultNumber));
    output = replaceToken(output, "DEFAULT_BANNER_COLOR", escapeAttr(defaultBannerColor));
    output = replaceToken(output, "APP_VERSION", escapeAttr(appVersion));
    output = replaceToken(output, "appVersion", escapeAttr(appVersion));
    output = replaceToken(output, "VERSION", escapeAttr(appVersion));
    output = replaceToken(output, "CREDIT_HTML", creditHtml);
    output = replaceToken(output, "creditHtml", creditHtml);
    output = replaceToken(output, "CREDIT", creditHtml);

    return output;
  };
})(globalThis);
