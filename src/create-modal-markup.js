(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

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
    return source.replace(
      /<\/section>/i,
      '  <div class="note note-credit">{{CREDIT_HTML}} - v{{APP_VERSION}}</div>\n</section>'
    );
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

  function getFallbackTemplate() {
    return `
<div class="modal" id="modal" popover="auto">
  <section class="modal-card" role="dialog" aria-modal="true" aria-label="Insert Update Template">
    <p class="title">Insert Update Template</p>
    <div class="row-inline row-top">
      <div class="field-stack banner-stack">
        <label class="field-label" for="banner-color">Banner</label>
        <div class="select-wrap banner-select-wrap">
          <span class="banner-preview {{DEFAULT_BANNER_COLOR}}" id="banner-preview" aria-hidden="true"></span>
          <select class="field banner-select" id="banner-color" aria-label="Banner color"></select>
          <span class="material-symbols-outlined select-icon" aria-hidden="true">expand_more</span>
        </div>
      </div>
      <div class="field-stack label-stack">
        <input class="field label-input" id="label" value="{{DEFAULT_LABEL}}" aria-describedby="label-error" />
        <p class="field-subtext field-subtext-error" id="label-error" hidden>Label is required.</p>
      </div>
      <div class="field-stack number-stack">
        <div class="num-controls" id="num-controls" aria-label="Update number">
          <button class="num-btn" id="dec" type="button">-</button>
          <input class="num-input" id="number" value="{{DEFAULT_NUMBER}}" inputmode="numeric" aria-describedby="number-error" />
          <button class="num-btn" id="inc" type="button">+</button>
        </div>
        <p class="field-subtext field-subtext-error" id="number-error" hidden>Update number is required.</p>
      </div>
    </div>
    <div class="group">
      <label>Status<span class="req">*</span></label><br/>
      <div class="select-wrap status-select-wrap">
        <select class="field status-select" id="status">
          <option>Not Started</option>
          <option selected>In Progress</option>
          <option>For QA</option>
          <option>Completed</option>
        </select>
        <span class="material-symbols-outlined select-icon" aria-hidden="true">expand_more</span>
      </div>
    </div>
    <div class="group">
      <label>Accomplishments<span class="req">*</span></label>
      <textarea class="field" id="acc" aria-describedby="acc-error"></textarea>
      <p class="field-subtext field-subtext-error" id="acc-error" hidden>Accomplishments is required.</p>
    </div>
    <div class="group">
      <label>Blockers</label>
      <textarea class="field" id="block"></textarea>
    </div>
    <div class="group">
      <label>Current Focus</label>
      <textarea class="field" id="focus"></textarea>
    </div>
    <div class="actions">
      <button class="btn" id="cancel" type="button">Cancel</button>
      <button class="btn btn-primary" id="insert" type="button" disabled>Insert</button>
    </div>
    <div class="note">You can insert Files and Mentions after inserting this template.</div>
    <div class="note note-credit">{{CREDIT_HTML}} - v{{APP_VERSION}}</div>
  </section>
</div>
`;
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
        : getFallbackTemplate();
    const source = ensureValidationHelpers(ensureCreditLine(template || getFallbackTemplate()));

    let output = source;
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
