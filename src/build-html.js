(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const constants = app.constants || {};
  const statusColor = constants.statusColor || {};
  const defaultBannerColor = constants.defaultBannerColor || "blue-strong";
  const STATUS_PALETTES = {
    none: {
      "Not Started": { bg: "#c63f6f", border: "#a6365c", text: "#ffffff" },
      "In Progress": { bg: "#2f6fed", border: "#2658be", text: "#ffffff" },
      "For QA": { bg: "#c9971c", border: "#9f7816", text: "#1a1300" },
      "Completed": { bg: "#2f9a53", border: "#247840", text: "#ffffff" }
    },
    protanopia: {
      "Not Started": { bg: "#8857d8", border: "#6d46ac", text: "#ffffff" },
      "In Progress": { bg: "#2d7ddf", border: "#245fb0", text: "#ffffff" },
      "For QA": { bg: "#d18e18", border: "#a77114", text: "#1f1400" },
      "Completed": { bg: "#0a8d89", border: "#076f6c", text: "#ffffff" }
    },
    deuteranopia: {
      "Not Started": { bg: "#8a4fb6", border: "#6e3f90", text: "#ffffff" },
      "In Progress": { bg: "#2f76da", border: "#255cae", text: "#ffffff" },
      "For QA": { bg: "#d48b18", border: "#a96e13", text: "#1f1400" },
      "Completed": { bg: "#0b8f8a", border: "#08706d", text: "#ffffff" }
    },
    tritanopia: {
      "Not Started": { bg: "#b14677", border: "#8d375e", text: "#ffffff" },
      "In Progress": { bg: "#256fcb", border: "#1f58a1", text: "#ffffff" },
      "For QA": { bg: "#6a61cf", border: "#544da5", text: "#ffffff" },
      "Completed": { bg: "#2b8d5f", border: "#216f4a", text: "#ffffff" }
    }
  };

  function getStatusBadgeStyle(mode, status) {
    const paletteKey = Object.prototype.hasOwnProperty.call(STATUS_PALETTES, mode) ? mode : "none";
    const tone = STATUS_PALETTES[paletteKey][status] || STATUS_PALETTES.none["In Progress"];
    return ` style="background-color:${tone.bg};border:1px solid ${tone.border};color:${tone.text}"`;
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
    const badgeStyle = getStatusBadgeStyle(data.colorVisionMode, data.status);

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
