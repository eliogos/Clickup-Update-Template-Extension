(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

  const DEFAULT_LABEL_SUGGESTION_CHIPS = [
    "Conceptboard",
    "Storyboard",
    "Design Update",
    "Feedback Application",
    "Dev Beta Update",
    "Dev Gold Update"
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  app.getLabelSuggestionChips = function getLabelSuggestionChips() {
    const constants = app.constants || {};
    const source = Array.isArray(constants.labelSuggestionChips)
      ? constants.labelSuggestionChips
      : DEFAULT_LABEL_SUGGESTION_CHIPS;

    return source
      .map((chip) => String(chip || "").trim())
      .filter(Boolean);
  };

  app.renderLabelSuggestionChips = function renderLabelSuggestionChips() {
    return app
      .getLabelSuggestionChips()
      .map(
        (chip) =>
          `              <button class="label-chip" type="button" data-label-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`
      )
      .join("\n");
  };
})(globalThis);
