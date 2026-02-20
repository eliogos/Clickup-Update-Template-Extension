(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const scriptVersion =
    global.GM_info &&
    global.GM_info.script &&
    global.GM_info.script.version
      ? String(global.GM_info.script.version)
      : "0.9.0";

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
    mutedOrder: ["red", "orange", "yellow", "blue", "purple", "pink", "green", "grey"],
    hotReload: {
      enabled: false,
      autoStart: false,
      pollMs: 4000,
      bindHotkeys: true,
      reloadHotkey: { ctrl: true, alt: true, shift: true, key: "r" },
      togglePollingHotkey: { ctrl: true, alt: true, shift: true, key: "p" },
      localStorageEnableKey: "clickupUpdateHotReload",
      localStorageAutoStartKey: "clickupUpdateHotReloadAuto",
      baseUrl: "https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/",
      moduleFiles: [
        "src/constants.js",
        "src/get-modal-css.js",
        "src/get-modal-template.js",
        "src/get-visible-editor.js",
        "src/simulate-paste.js",
        "src/build-html.js",
        "src/is-popover-open.js",
        "src/create-modal-markup.js",
        "src/open-modal.js",
        "src/bootstrap.js"
      ],
      cssFiles: [
        "styles/modal.css",
        "styles/inputs.css",
        "styles/selects.css",
        "styles/buttons.css"
      ],
      templateFile: "templates/modal.html"
    }
  };

  app.constants.allColors = [...app.constants.strongOrder, ...app.constants.mutedOrder];
})(globalThis);
