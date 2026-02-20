(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const scriptVersion =
    global.GM_info &&
    global.GM_info.script &&
    global.GM_info.script.version
      ? String(global.GM_info.script.version)
      : "14.0.0";

  app.constants = {
    APP_VERSION: scriptVersion,
    TRIGGER: "--update",
    defaultLabel: "Design Update",
    defaultNumber: "01",
    defaultBannerColor: "blue-strong",
    creditHtml: "Made with &#x2764;&#xFE0F; by Jai",
    statusColor: {
      "Not Started": "pink",
      "In Progress": "blue",
      "For QA": "yellow",
      "Completed": "green"
    },
    strongOrder: [
      "red-strong",
      "orange-strong",
      "yellow-strong",
      "blue-strong",
      "purple-strong",
      "pink-strong",
      "green-strong",
      "grey-strong"
    ],
    mutedOrder: ["red", "orange", "yellow", "blue", "purple", "pink", "green", "grey"]
  };

  app.constants.allColors = [...app.constants.strongOrder, ...app.constants.mutedOrder];
})(globalThis);

