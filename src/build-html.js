(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const constants = app.constants || {};
  const statusColor = constants.statusColor || {};
  const defaultBannerColor = constants.defaultBannerColor || "blue-strong";

  app.buildHTML = function buildHTML(data) {
    function blockSection(title, emoji, items, force) {
      if (!force && (!items || items.length === 0)) return "";

      let html = `<blockquote><strong>${emoji} ${title}</strong></blockquote>`;
      items.forEach((item) => {
        html += `<blockquote>${item}</blockquote>`;
      });
      html += "<br/>";
      return html;
    }

    const labelText = String(data.label || "").trim();
    const numberText = String(data.number || "").trim();
    const headingText = data.appendNumberSuffix === false
      ? labelText
      : `${labelText} ${numberText}`.trim();

    let html =
      `<h2 data-advanced-banner="${crypto.randomUUID()}" data-advanced-banner-color="${data.bannerColor || defaultBannerColor}"><strong>${headingText}</strong></h2>` +
      `<p><strong>Status:</strong> <span class="ql-badge ql-badge-${statusColor[data.status]}">${data.status}</span></p>` +
      "<br/>";

    html += blockSection("Accomplishments", "\u{1F3C6}", data.accomplishments, true);
    html += blockSection("Blockers", "\u{1F6A7}", data.blockers, false);
    html += blockSection("Current Focus", "\u{1F3AF}", data.focus, false);

    return html;
  };
})(globalThis);
