(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const RESOURCE_NAMES = ["rootCss", "modalCss", "modalInputsCss", "modalSelectsCss", "modalBannerCss", "modalButtonsCss", "modalMotionCss"];

  function getResourceTextSafe(name) {
    try {
      return GM_getResourceText(name) || "";
    } catch {
      return "";
    }
  }

  app.getModalCss = function getModalCss() {
    if (typeof app._hotCssOverride === "string" && app._hotCssOverride.trim()) {
      return app._hotCssOverride;
    }

    if (typeof GM_getResourceText === "function") {
      const cssParts = RESOURCE_NAMES.map(getResourceTextSafe).filter(Boolean);
      if (cssParts.length > 0) return cssParts.join("\n");
    }

    // Fallback only for managers that do not expose GM_getResourceText.
    return `
      :host { all: initial; color-scheme: dark; }
      * { box-sizing: border-box; font-family: system-ui, sans-serif; }
      .modal {
        position: fixed;
        inset: 0;
        padding: 12px;
        display: none;
        align-items: center;
        justify-content: center;
      }
      .modal-card {
        width: min(720px, calc(100vw - 24px));
        max-height: calc(100vh - 24px);
        overflow: auto;
        background: #1a1a1a;
        color: #fff;
        padding: 22px;
        border-radius: 14px;
        border: 1px solid #2f2f2f;
        box-shadow: 0 20px 60px rgba(0,0,0,.5);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .modal:popover-open,
      .modal.is-open-fallback { display: flex; }
      .field {
        background: #111;
        color: #fff;
        border: 1px solid #333;
        padding: 8px 10px;
        border-radius: 10px;
      }
      .num-controls {
        display: inline-flex;
        align-items: center;
        border: 1px solid #333;
        border-radius: 10px;
        overflow: hidden;
      }
      .num-input {
        width: 56px;
        text-align: center;
        border: none;
        background: transparent;
        color: #fff;
      }
      .num-btn {
        width: 34px;
        height: 34px;
        border: none;
        background: #111;
        color: #fff;
      }
      select.field { min-width: 180px; }
      .status-select { min-width: 180px; }
      .actions { display: flex; justify-content: flex-end; gap: 10px; }
      .btn {
        height: 34px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid #333;
        background: #111;
        color: #fff;
      }
      .btn-primary { background: #2f6fed; border-color: #2f6fed; }
    `;
  };
})(globalThis);
