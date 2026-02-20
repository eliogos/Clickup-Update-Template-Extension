(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const constants = app.constants || {};
  const statusColor = constants.statusColor || {};
  const defaultBannerColor = constants.defaultBannerColor || "blue-strong";

  function getBadgeFilterForMode(mode) {
    switch (String(mode || "").trim()) {
      case "protanopia":
        return "saturate(0.72) hue-rotate(-12deg) contrast(1.04)";
      case "deuteranopia":
        return "saturate(0.76) hue-rotate(8deg) contrast(1.03)";
      case "tritanopia":
        return "saturate(0.78) hue-rotate(-28deg) contrast(1.02)";
      case "achromatopsia":
        return "grayscale(1) contrast(1.08)";
      default:
        return "";
    }
  }

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

    function emptySection(title) {
      return `<blockquote><strong>${title}:</strong></blockquote><blockquote><br/></blockquote><br/>`;
    }

    const labelText = String(data.label || "").trim();
    const numberText = String(data.number || "").trim();
    const headingText = data.appendNumberSuffix === false
      ? labelText
      : `${labelText} ${numberText}`.trim();
    const badgeFilter = getBadgeFilterForMode(data.colorFilterMode);
    const badgeStyle = badgeFilter ? ` style="filter:${badgeFilter}"` : "";

    let html =
      `<h2 data-advanced-banner="${crypto.randomUUID()}" data-advanced-banner-color="${data.bannerColor || defaultBannerColor}"><strong>${headingText}</strong></h2>` +
      `<br/>` +
      `<p><strong>Status:</strong> <span class="ql-badge ql-badge-${statusColor[data.status]}"${badgeStyle}>${data.status}</span></p>` +
      "<br/>";

    html += blockSection("Accomplishments", "\u{1F3C6}", data.accomplishments, true);
    html += blockSection("Blockers", "\u{1F6A7}", data.blockers, false);
    html += blockSection("Current Focus", "\u{1F3AF}", data.focus, false);
    html += blockSection("Notes", "\u{1F4DD}", data.notes, false);
    html += emptySection("Files");
    html += emptySection("Mentions");

    return html;
  };
})(globalThis);
