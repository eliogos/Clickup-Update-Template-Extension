(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const state = (app._hotReloadState = app._hotReloadState || {
    initialized: false,
    reloading: false,
    intervalId: null,
    reloadCount: 0,
    lastReloadAt: null,
    lastError: null,
    hotkeyHandler: null
  });

  const defaults = {
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
  };

  function getConfig() {
    const constants = app.constants || {};
    const userConfig = constants.hotReload || {};
    return { ...defaults, ...userConfig };
  }

  function normalizeBaseUrl(url) {
    const base = String(url || defaults.baseUrl);
    return base.endsWith("/") ? base : `${base}/`;
  }

  function readFlag(key) {
    if (!key) return false;
    try {
      const value = global.localStorage.getItem(key);
      return value === "1" || value === "true" || value === "on";
    } catch {
      return false;
    }
  }

  function isEnabled(config) {
    return Boolean(config.enabled) || readFlag(config.localStorageEnableKey);
  }

  function shouldAutoStart(config) {
    return Boolean(config.autoStart) || readFlag(config.localStorageAutoStartKey);
  }

  function cacheBust(url) {
    const token = `hot=${Date.now()}`;
    return url.includes("?") ? `${url}&${token}` : `${url}?${token}`;
  }

  async function fetchRemoteText(baseUrl, filePath) {
    const url = cacheBust(`${normalizeBaseUrl(baseUrl)}${filePath}`);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath} (${response.status})`);
    }
    return response.text();
  }

  function evaluateModule(source, filePath) {
    (0, eval)(`${source}\n//# sourceURL=${filePath}`);
  }

  function hotkeyMatches(event, hotkey) {
    if (!hotkey || !hotkey.key) return false;
    const expectedKey = String(hotkey.key).toLowerCase();
    const actualKey = String(event.key || "").toLowerCase();

    if (actualKey !== expectedKey) return false;
    if (typeof hotkey.ctrl === "boolean" && event.ctrlKey !== hotkey.ctrl) return false;
    if (typeof hotkey.alt === "boolean" && event.altKey !== hotkey.alt) return false;
    if (typeof hotkey.shift === "boolean" && event.shiftKey !== hotkey.shift) return false;
    if (typeof hotkey.meta === "boolean" && event.metaKey !== hotkey.meta) return false;
    return true;
  }

  async function reload(options) {
    const config = getConfig();
    const opts = options || {};

    if (state.reloading) return false;
    state.reloading = true;
    state.lastError = null;

    try {
      if (typeof app._activeModalClose === "function") {
        try {
          app._activeModalClose();
        } catch {
          // best effort: close active modal before swapping code.
        }
      }

      if (typeof app.unmount === "function") {
        app.unmount();
      }

      const cssFiles = Array.isArray(config.cssFiles) ? config.cssFiles : [];
      if (cssFiles.length > 0) {
        const cssTexts = await Promise.all(cssFiles.map((filePath) => fetchRemoteText(config.baseUrl, filePath)));
        app._hotCssOverride = cssTexts.join("\n");
      }

      if (config.templateFile) {
        app._hotTemplateOverride = await fetchRemoteText(config.baseUrl, config.templateFile);
      }

      const moduleFiles = Array.isArray(config.moduleFiles) ? config.moduleFiles : [];
      for (const filePath of moduleFiles) {
        const source = await fetchRemoteText(config.baseUrl, filePath);
        evaluateModule(source, filePath);
      }

      if (typeof app.bootstrap === "function") {
        app.bootstrap();
      }

      state.reloadCount += 1;
      state.lastReloadAt = new Date().toISOString();

      if (!opts.silent) {
        console.info(`[ClickUpUpdate] Hot reload completed (${state.reloadCount}).`);
      }
      return true;
    } catch (error) {
      state.lastError = error && error.message ? error.message : String(error);
      console.error("[ClickUpUpdate] Hot reload failed:", error);
      return false;
    } finally {
      state.reloading = false;
    }
  }

  function startPolling() {
    const config = getConfig();
    const intervalMs = Math.max(1000, Number(config.pollMs) || defaults.pollMs);
    if (state.intervalId) return;

    state.intervalId = global.setInterval(() => {
      void reload({ silent: true });
    }, intervalMs);

    console.info(`[ClickUpUpdate] Hot reload polling started (${intervalMs}ms).`);
  }

  function stopPolling() {
    if (!state.intervalId) return;
    global.clearInterval(state.intervalId);
    state.intervalId = null;
    console.info("[ClickUpUpdate] Hot reload polling stopped.");
  }

  function togglePolling() {
    if (state.intervalId) {
      stopPolling();
    } else {
      startPolling();
    }
  }

  function setupHotReload() {
    if (state.initialized) return;
    state.initialized = true;

    const config = getConfig();

    app.hotReload = {
      state,
      reload,
      start: startPolling,
      stop: stopPolling,
      toggle: togglePolling,
      getConfig: () => getConfig(),
      isEnabled: () => isEnabled(getConfig())
    };
    app.reloadNow = reload;

    if (config.bindHotkeys !== false) {
      const onHotkey = (event) => {
        const current = getConfig();

        if (hotkeyMatches(event, current.reloadHotkey)) {
          event.preventDefault();
          event.stopPropagation();
          void reload();
          return;
        }

        if (hotkeyMatches(event, current.togglePollingHotkey)) {
          event.preventDefault();
          event.stopPropagation();
          togglePolling();
        }
      };

      state.hotkeyHandler = onHotkey;
      document.addEventListener("keydown", onHotkey, true);
    }

    if (isEnabled(config)) {
      console.info("[ClickUpUpdate] Hot reload enabled. Ctrl+Alt+Shift+R reloads; Ctrl+Alt+Shift+P toggles polling.");
      if (shouldAutoStart(config)) {
        startPolling();
      }
    }
  }

  app.setupHotReload = setupHotReload;
})(globalThis);
