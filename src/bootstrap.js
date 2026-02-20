(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const TRIGGER_ACTIVATION_OPTIONS = new Set(["space", "immediate"]);
  const IGNORED_IMMEDIATE_TRIGGER_KEYS = new Set([
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "CapsLock",
    "Escape",
    "Tab",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "PageUp",
    "PageDown",
    "Enter",
    " "
  ]);

  function getSettingsStorageKey() {
    const constants = app.constants || {};
    return constants.SETTINGS_STORAGE_KEY || "clickup-update-modal.settings.v4";
  }

  function getDefaultTriggerText() {
    const constants = app.constants || {};
    const raw = String(constants.TRIGGER || "--update").trim();
    return raw || "--update";
  }

  function getDefaultTriggerActivation() {
    const constants = app.constants || {};
    return constants.TRIGGER_ACTIVATION_DEFAULT === "immediate" ? "immediate" : "space";
  }

  function normalizeTriggerSettings(source) {
    const safe = source && typeof source === "object" ? source : {};
    const defaultTriggerText = getDefaultTriggerText();
    const triggerText = String(
      safe.triggerText == null ? (safe.trigger == null ? defaultTriggerText : safe.trigger) : safe.triggerText
    )
      .replace(/\//g, "")
      .trim() || defaultTriggerText;
    const triggerActivation = TRIGGER_ACTIVATION_OPTIONS.has(safe.triggerActivation)
      ? safe.triggerActivation
      : safe.triggerAfterSpace === false
        ? "immediate"
        : getDefaultTriggerActivation();
    return { triggerText, triggerActivation };
  }

  function readTriggerSettings() {
    try {
      if (!global.localStorage) return normalizeTriggerSettings(null);
      const raw = global.localStorage.getItem(getSettingsStorageKey());
      if (!raw) return normalizeTriggerSettings(null);
      return normalizeTriggerSettings(JSON.parse(raw));
    } catch {
      return normalizeTriggerSettings(null);
    }
  }

  function shouldOpenFromEditor(editor, triggerText) {
    if (!editor) return false;
    const text = String(editor.innerText || "").trim();
    return text === triggerText;
  }

  app.unmount = function unmount() {
    if (typeof app._keydownHandler === "function") {
      document.removeEventListener("keydown", app._keydownHandler);
      app._keydownHandler = null;
    }

    if (typeof app._keyupHandler === "function") {
      document.removeEventListener("keyup", app._keyupHandler);
      app._keyupHandler = null;
    }

    app._bootstrapped = false;
  };

  app.bootstrap = function bootstrap() {
    if (app._bootstrapped && typeof app._keydownHandler === "function") return;

    app.unmount();
    app._bootstrapped = true;

    const keydownHandler = (e) => {
      if (e.key !== " ") return;
      const triggerSettings = readTriggerSettings();
      if (triggerSettings.triggerActivation !== "space") return;
      if (typeof app.getVisibleEditor !== "function" || typeof app.openModal !== "function") return;
      if (typeof app._activeModalClose === "function") return;

      const editor = app.getVisibleEditor();
      if (!editor) return;
      if (!shouldOpenFromEditor(editor, triggerSettings.triggerText)) return;

      e.preventDefault();
      app.openModal(editor);
    };

    const keyupHandler = (e) => {
      const triggerSettings = readTriggerSettings();
      if (triggerSettings.triggerActivation !== "immediate") return;
      if (typeof app.getVisibleEditor !== "function" || typeof app.openModal !== "function") return;
      if (typeof app._activeModalClose === "function") return;
      if (IGNORED_IMMEDIATE_TRIGGER_KEYS.has(e.key)) return;

      const editor = app.getVisibleEditor();
      if (!editor) return;
      if (!shouldOpenFromEditor(editor, triggerSettings.triggerText)) return;

      app.openModal(editor);
    };

    app._keydownHandler = keydownHandler;
    app._keyupHandler = keyupHandler;
    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyupHandler);
  };
})(globalThis);
