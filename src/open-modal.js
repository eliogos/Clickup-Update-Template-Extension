(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const constants = app.constants || {};
  const FONT_STYLESHEET_HREF =
    "https://fonts.googleapis.com/css2?family=Darumadrop+One&family=Geist+Mono:wght@100..900&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=National+Park:wght@200..800&family=VT323&display=swap";
  const MATERIAL_SYMBOLS_STYLESHEET_HREF =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
  const SETTINGS_STORAGE_KEY = constants.SETTINGS_STORAGE_KEY || "clickup-update-modal.settings.v4";
  const DEFAULT_TRIGGER_TEXT = String(constants.TRIGGER || "--update").trim() || "--update";
  const DEFAULT_TRIGGER_ACTIVATION = constants.TRIGGER_ACTIVATION_DEFAULT === "immediate"
    ? "immediate"
    : "space";
  const DRAFTS_STORAGE_KEY = "clickup-update-modal.drafts.v1";
  const MAX_DRAFTS = 40;
  const UI_FONT_SIZE_MIN = 11;
  const UI_FONT_SIZE_MAX = 20;
  const EDITOR_FONT_SIZE_MIN = 10;
  const EDITOR_FONT_SIZE_MAX = 24;
  const TRIGGER_ACTIVATION_OPTIONS = new Set(["space", "immediate"]);
  const PAGE_OPTIONS = new Set(["editor", "settings", "variables", "drafts", "about"]);
  const THEME_OPTIONS = new Set(["light", "auto", "dark"]);
  const DENSITY_OPTIONS = new Set(["compact", "comfortable", "spacious"]);
  const COLOR_VISION_OPTIONS = new Set(["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"]);
  const DEFAULT_MODAL_SETTINGS = Object.freeze({
    sidebarCollapsed: false,
    activePage: "editor",
    theme: "auto",
    density: "comfortable",
    colorVisionMode: "none",
    uiFontSize: 13,
    editorFontSize: 13,
    triggerText: DEFAULT_TRIGGER_TEXT,
    triggerActivation: DEFAULT_TRIGGER_ACTIVATION
  });

  let modalCssCache = null;

  function clampNumber(value, min, max, fallback) {
    const n = parseFloat(String(value).trim());
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function normalizeModalSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const activePage = PAGE_OPTIONS.has(source.activePage)
      ? source.activePage
      : DEFAULT_MODAL_SETTINGS.activePage;
    const theme = THEME_OPTIONS.has(source.theme) ? source.theme : DEFAULT_MODAL_SETTINGS.theme;
    const legacyScale = clampNumber(
      source.densityScale == null ? source.densityCustomScale : source.densityScale,
      1,
      6,
      2
    );
    const density = DENSITY_OPTIONS.has(source.density) && source.density !== "custom"
      ? source.density
      : legacyScale <= 1.49
        ? "compact"
        : legacyScale >= 2.5
          ? "spacious"
          : "comfortable";
    const colorVisionRaw = source.colorVisionMode == null
      ? source.colorFilter
      : source.colorVisionMode;
    const colorVisionMode = COLOR_VISION_OPTIONS.has(colorVisionRaw)
      ? colorVisionRaw
      : DEFAULT_MODAL_SETTINGS.colorVisionMode;
    const triggerRaw = String(
      source.triggerText == null
        ? (source.trigger == null ? DEFAULT_MODAL_SETTINGS.triggerText : source.trigger)
        : source.triggerText
    );
    const triggerText = triggerRaw.replace(/\//g, "").trim() || DEFAULT_MODAL_SETTINGS.triggerText;
    const triggerActivation = TRIGGER_ACTIVATION_OPTIONS.has(source.triggerActivation)
      ? source.triggerActivation
      : source.triggerAfterSpace === false
        ? "immediate"
        : DEFAULT_TRIGGER_ACTIVATION;
    const uiFontSize = clampNumber(
      source.uiFontSize,
      UI_FONT_SIZE_MIN,
      UI_FONT_SIZE_MAX,
      DEFAULT_MODAL_SETTINGS.uiFontSize
    );
    const editorFontSize = clampNumber(
      source.editorFontSize,
      EDITOR_FONT_SIZE_MIN,
      EDITOR_FONT_SIZE_MAX,
      DEFAULT_MODAL_SETTINGS.editorFontSize
    );

    return {
      sidebarCollapsed: Boolean(source.sidebarCollapsed),
      activePage,
      theme,
      density,
      colorVisionMode,
      uiFontSize,
      editorFontSize,
      triggerText,
      triggerActivation
    };
  }

  function readModalSettings() {
    try {
      const raw = global.localStorage ? global.localStorage.getItem(SETTINGS_STORAGE_KEY) : "";
      if (!raw) return { ...DEFAULT_MODAL_SETTINGS };
      return normalizeModalSettings(JSON.parse(raw));
    } catch {
      return { ...DEFAULT_MODAL_SETTINGS };
    }
  }

  function saveModalSettings(settings) {
    try {
      if (!global.localStorage) return;
      global.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeModalSettings(settings)));
    } catch {
      // Best-effort persistence only.
    }
  }

  function formatFontSize(value) {
    return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(2)));
  }

  function createDraftId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeDraft(input) {
    const source = input && typeof input === "object" ? input : {};
    const createdAt = source.createdAt && !Number.isNaN(Date.parse(source.createdAt))
      ? String(source.createdAt)
      : new Date().toISOString();
    const id = source.id && String(source.id).trim() ? String(source.id) : createDraftId();

    return {
      id,
      createdAt,
      label: String(source.label || ""),
      number: String(source.number || ""),
      appendNumberSuffix: source.appendNumberSuffix !== false,
      status: String(source.status || "In Progress"),
      accomplishmentsText: String(source.accomplishmentsText || ""),
      blockersText: String(source.blockersText || ""),
      focusText: String(source.focusText || ""),
      notesText: String(source.notesText || ""),
      bannerColor: String(source.bannerColor || "")
    };
  }

  function readDrafts() {
    try {
      const raw = global.localStorage ? global.localStorage.getItem(DRAFTS_STORAGE_KEY) : "";
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(normalizeDraft)
        .slice(0, MAX_DRAFTS);
    } catch {
      return [];
    }
  }

  function saveDrafts(drafts) {
    try {
      if (!global.localStorage) return;
      const normalized = Array.isArray(drafts)
        ? drafts.map(normalizeDraft).slice(0, MAX_DRAFTS)
        : [];
      global.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Best-effort persistence only.
    }
  }

  function formatDraftDateTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function ensureFontLinks() {
    if (!document.head.querySelector('link[data-clickup-update-fonts="preconnect-googleapis"]')) {
      const preconnectGoogleApis = document.createElement("link");
      preconnectGoogleApis.rel = "preconnect";
      preconnectGoogleApis.href = "https://fonts.googleapis.com";
      preconnectGoogleApis.setAttribute("data-clickup-update-fonts", "preconnect-googleapis");
      document.head.appendChild(preconnectGoogleApis);
    }

    if (!document.head.querySelector('link[data-clickup-update-fonts="preconnect-gstatic"]')) {
      const preconnectGstatic = document.createElement("link");
      preconnectGstatic.rel = "preconnect";
      preconnectGstatic.href = "https://fonts.gstatic.com";
      preconnectGstatic.crossOrigin = "anonymous";
      preconnectGstatic.setAttribute("data-clickup-update-fonts", "preconnect-gstatic");
      document.head.appendChild(preconnectGstatic);
    }

    if (!document.head.querySelector('link[data-clickup-update-fonts="styles"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = FONT_STYLESHEET_HREF;
      stylesheet.setAttribute("data-clickup-update-fonts", "styles");
      document.head.appendChild(stylesheet);
    }

    if (!document.head.querySelector('link[data-clickup-update-fonts="material-symbols"]')) {
      const symbolsStylesheet = document.createElement("link");
      symbolsStylesheet.rel = "stylesheet";
      symbolsStylesheet.href = MATERIAL_SYMBOLS_STYLESHEET_HREF;
      symbolsStylesheet.setAttribute("data-clickup-update-fonts", "material-symbols");
      document.head.appendChild(symbolsStylesheet);
    }
  }

  function getModalCssText() {
    if (modalCssCache) return modalCssCache;
    if (typeof app.getModalCss === "function") {
      modalCssCache = app.getModalCss();
    } else {
      modalCssCache = "";
    }
    return modalCssCache;
  }

  function splitLines(text) {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function formatNumber(n) {
    return n < 10 ? `0${n}` : String(n);
  }

  function clampInt(v) {
    const n = parseInt(String(v).replace(/\D+/g, ""), 10);
    return Number.isFinite(n) ? Math.max(1, n) : 1;
  }

  app.openModal = function openModal(editor) {
    if (!editor || typeof editor !== "object") return;
    if (typeof app.createModalMarkup !== "function") return;

    ensureFontLinks();

    const host = document.createElement("div");
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${getModalCssText()}</style>${app.createModalMarkup()}`;

    const byId = (id) => shadow.getElementById(id);
    const modal = byId("modal");
    const modalCard = shadow.querySelector(".modal-card");
    const bannerTrigger = byId("banner-trigger");
    const bannerPreview = byId("banner-preview");
    const bannerPopover = byId("banner-popover");
    const labelInput = byId("label");
    const labelChips = Array.from(shadow.querySelectorAll(".label-chip"));
    const labelChipRow = shadow.querySelector(".label-chip-row");
    const numberInput = byId("number");
    const numControls = byId("num-controls");
    const appendNumberInput = byId("append-number");
    const accInput = byId("acc");
    const labelError = byId("label-error");
    const numberError = byId("number-error");
    const accError = byId("acc-error");
    const insertBtn = byId("insert");
    const incBtn = byId("inc");
    const decBtn = byId("dec");
    const closeBtn = byId("close-modal");
    const statusInput = byId("status");
    const statusSelectWrap = statusInput ? statusInput.closest(".status-select-wrap") : null;
    const blockInput = byId("block");
    const focusInput = byId("focus");
    const addNotesBtn = byId("add-notes");
    const notesGroup = byId("notes-group");
    const notesInput = byId("notes");
    const modalBodyLayout = byId("modal-body-layout");
    const modalMainContent = byId("modal-main-content");
    const settingsSidebar = byId("settings-sidebar");
    const settingsToggle = byId("settings-toggle");
    const pageButtons = Array.from(shadow.querySelectorAll("[data-page-target]"));
    const pagePanels = Array.from(shadow.querySelectorAll("[data-page]"));
    const saveDraftBtn = byId("save-draft");
    const copyHtmlBtn = byId("copy-html");
    const actionFeedback = byId("action-feedback");
    const draftsList = byId("drafts-list");
    const draftsEmpty = byId("drafts-empty");
    const themeButtons = Array.from(shadow.querySelectorAll("[data-theme-option]"));
    const densityButtons = Array.from(shadow.querySelectorAll("[data-density-option]"));
    const colorFilterInput = byId("color-filter-mode");
    const triggerTextInput = byId("trigger-text-input");
    const triggerTextError = byId("trigger-text-error");
    const triggerAfterSpaceInput = byId("trigger-after-space");
    const uiFontSizeInput = byId("ui-font-size-input");
    const uiFontSizeSlider = byId("ui-font-size-slider");
    const editorFontSizeInput = byId("editor-font-size-input");
    const editorFontSizeSlider = byId("editor-font-size-slider");

    if (
      !modal || !labelInput || !numberInput || !accInput ||
      !insertBtn || !incBtn || !decBtn || !closeBtn ||
      !statusInput || !blockInput || !focusInput ||
      !bannerTrigger || !bannerPreview || !bannerPopover || !modalCard ||
      !saveDraftBtn || !copyHtmlBtn || !actionFeedback || !draftsList || !modalMainContent
    ) {
      host.remove();
      return;
    }

    const allColors = constants.allColors || [];
    const isPopoverOpen = app.isPopoverOpen || (() => false);
    const buildHTML = app.buildHTML;
    const simulatePaste = app.simulatePaste;
    const defaultBannerColor = constants.defaultBannerColor || "blue-strong";

    let selected = defaultBannerColor;
    let closed = false;
    let close = () => {};
    let chipResizeObserver = null;
    let settingsState = readModalSettings();
    let draftsState = readDrafts();
    const systemColorScheme = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-color-scheme: dark)")
      : null;
    let onSystemColorSchemeChange = null;
    let onWindowResize = null;
    let pageHeightRafId = 0;

    const cleanup = () => {
      if (closed) return;
      closed = true;

      if (app._activeModalClose === close) {
        app._activeModalClose = null;
      }

      document.removeEventListener("keydown", stopKeys, true);
      document.removeEventListener("keyup", stopKeys, true);
      document.removeEventListener("keypress", stopKeys, true);
      if (chipResizeObserver) {
        chipResizeObserver.disconnect();
        chipResizeObserver = null;
      }
      if (systemColorScheme && onSystemColorSchemeChange) {
        if (typeof systemColorScheme.removeEventListener === "function") {
          systemColorScheme.removeEventListener("change", onSystemColorSchemeChange);
        } else if (typeof systemColorScheme.removeListener === "function") {
          systemColorScheme.removeListener(onSystemColorSchemeChange);
        }
        onSystemColorSchemeChange = null;
      }
      if (onWindowResize) {
        global.removeEventListener("resize", onWindowResize);
        onWindowResize = null;
      }
      if (pageHeightRafId) {
        global.cancelAnimationFrame(pageHeightRafId);
        pageHeightRafId = 0;
      }
      host.remove();
    };

    close = () => {
      let nativePopoverOpen = false;
      if (typeof modal.matches === "function") {
        try {
          nativePopoverOpen = modal.matches(":popover-open");
        } catch {
          nativePopoverOpen = false;
        }
      }

      if (typeof modal.hidePopover === "function" && nativePopoverOpen) {
        modal.hidePopover();
        return;
      }

      modal.classList.remove("is-open-fallback");
      cleanup();
    };

    app._activeModalClose = close;

    const stopKeys = (e) => {
      if (!isPopoverOpen(modal)) return;
      e.stopPropagation();

      if (e.key === "/") {
        const activeElement = shadow.activeElement;
        if (activeElement === triggerTextInput) {
          showTriggerSlashError();
          syncActivePageHeight();
        }
        e.preventDefault();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    const toDisplayLabel = (name) => String(name)
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const applyBannerSelection = () => {
      let value = selected || defaultBannerColor;
      if (!allColors.includes(value)) value = defaultBannerColor;
      selected = value;

      bannerTrigger.setAttribute("data-banner", selected);

      if (bannerPreview) {
        bannerPreview.className = `banner-preview ${selected}`;
      }
    };

    const renderPalette = () => {
      bannerPopover.innerHTML = "";
      allColors.forEach((name) => {
        const sw = document.createElement("button");
        sw.type = "button";
        sw.className = `swatch ${name}${name === selected ? " selected" : ""}`;
        sw.title = toDisplayLabel(name);
        sw.setAttribute("aria-label", `Set banner color to ${toDisplayLabel(name)}`);
        sw.onclick = () => {
          selected = name;
          applyBannerSelection();
          renderPalette();
          if (typeof bannerPopover.hidePopover === "function") {
            bannerPopover.hidePopover();
          } else {
            bannerPopover.classList.remove("is-open-fallback");
          }
          validate();
        };
        bannerPopover.appendChild(sw);
      });
    };

    const syncBannerOpenState = () => {
      let open = bannerPopover.classList.contains("is-open-fallback");
      if (typeof bannerPopover.matches === "function") {
        try {
          open = open || bannerPopover.matches(":popover-open");
        } catch {
          // noop
        }
      }
      bannerTrigger.classList.toggle("is-open", open);
    };

    const applyStatusAccent = () => {
      const value = statusInput.value || "In Progress";
      statusInput.setAttribute("data-status", value);
      if (statusSelectWrap) statusSelectWrap.setAttribute("data-status", value);
    };

    const setActionFeedback = (message, tone = "muted") => {
      if (!actionFeedback) return;
      actionFeedback.textContent = String(message || "");
      actionFeedback.setAttribute("data-tone", tone);
    };

    const showTriggerSlashError = () => {
      if (!triggerTextInput) return;
      triggerTextInput.classList.add("input-error");
      triggerTextInput.setAttribute("aria-invalid", "true");
      if (triggerTextError) {
        triggerTextError.hidden = false;
        triggerTextError.textContent = "Slash / is not allowed because it interferes with ClickUp default keybinds.";
      }
    };

    const normalizeTriggerText = (value) => String(value || "").replace(/\//g, "").trim();

    const syncTriggerFieldState = () => {
      if (!triggerTextInput) return { isValid: true, normalized: DEFAULT_TRIGGER_TEXT };

      const raw = String(triggerTextInput.value || "");
      const hasSlash = raw.includes("/");
      const normalized = normalizeTriggerText(raw) || DEFAULT_TRIGGER_TEXT;
      const isValid = !hasSlash;
      const message = hasSlash
        ? "Slash / is not allowed because it interferes with ClickUp default keybinds."
        : "";

      if (triggerTextError) {
        triggerTextError.hidden = isValid;
        if (!isValid) triggerTextError.textContent = message;
      }

      triggerTextInput.classList.toggle("input-error", !isValid);
      triggerTextInput.setAttribute("aria-invalid", isValid ? "false" : "true");

      return { isValid, normalized };
    };

    const commitTriggerTextFromInput = () => {
      if (!triggerTextInput) return;
      const { isValid, normalized } = syncTriggerFieldState();
      if (!isValid) return;
      triggerTextInput.value = normalized;
      if (normalized !== settingsState.triggerText) {
        commitModalSettings({ triggerText: normalized });
      }
    };

    const collectInsertData = () => ({
      label: labelInput.value.trim().toUpperCase() || "DESIGN UPDATE",
      number: numberInput.value.trim() || "01",
      appendNumberSuffix: appendNumberInput ? appendNumberInput.checked : true,
      status: statusInput.value,
      accomplishments: splitLines(accInput.value),
      blockers: splitLines(blockInput.value),
      focus: splitLines(focusInput.value),
      notes: notesInput && notesGroup && !notesGroup.hidden ? splitLines(notesInput.value) : [],
      colorVisionMode: settingsState.colorVisionMode,
      bannerColor: selected
    });

    const collectDraftPayload = () => ({
      id: createDraftId(),
      createdAt: new Date().toISOString(),
      label: labelInput.value.trim() || "Design Update",
      number: numberInput.value.trim() || "01",
      appendNumberSuffix: appendNumberInput ? appendNumberInput.checked : true,
      status: statusInput.value || "In Progress",
      accomplishmentsText: accInput.value || "",
      blockersText: blockInput.value || "",
      focusText: focusInput.value || "",
      notesText: notesInput && notesGroup && !notesGroup.hidden ? notesInput.value : "",
      bannerColor: selected
    });

    const copyInnerHtmlToClipboard = async (html) => {
      if (!html) return false;
      if (global.navigator && global.navigator.clipboard) {
        try {
          if (typeof global.ClipboardItem === "function" && typeof global.navigator.clipboard.write === "function") {
            const htmlBlob = new Blob([html], { type: "text/html" });
            const textBlob = new Blob([html], { type: "text/plain" });
            const item = new global.ClipboardItem({
              "text/html": htmlBlob,
              "text/plain": textBlob
            });
            await global.navigator.clipboard.write([item]);
            return true;
          }
          if (typeof global.navigator.clipboard.writeText === "function") {
            await global.navigator.clipboard.writeText(html);
            return true;
          }
        } catch {
          // Fallback below.
        }
      }

      try {
        const ta = document.createElement("textarea");
        ta.value = html;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const copied = document.execCommand("copy");
        ta.remove();
        return copied;
      } catch {
        return false;
      }
    };

    const setFieldError = (inputEl, helperEl, isInvalid, message, wrapperEl) => {
      if (inputEl) {
        inputEl.classList.toggle("input-error", isInvalid);
        inputEl.setAttribute("aria-invalid", isInvalid ? "true" : "false");
      }

      if (wrapperEl) {
        wrapperEl.classList.toggle("input-error", isInvalid);
      }

      if (helperEl) {
        helperEl.hidden = !isInvalid;
        if (isInvalid && message) helperEl.textContent = message;
      }
    };

    const validate = () => {
      const labelInvalid = !labelInput.value.trim();
      const shouldAppendNumber = appendNumberInput ? appendNumberInput.checked : true;
      const numberInvalid = shouldAppendNumber && !numberInput.value.trim();
      const accInvalid = !accInput.value.trim();

      setFieldError(labelInput, labelError, labelInvalid, "Label is required.");
      setFieldError(numberInput, numberError, numberInvalid, "Update number is required.", numControls);
      setFieldError(accInput, accError, accInvalid, "Accomplishments is required.");

      const ok = !(labelInvalid || accInvalid || numberInvalid);
      insertBtn.disabled = !ok;

      if (!ok) {
        const tip = "Please fill in required fields";
        insertBtn.dataset.tooltip = tip;
        insertBtn.setAttribute("title", tip);
      } else {
        delete insertBtn.dataset.tooltip;
        insertBtn.removeAttribute("title");
      }
    };

    const syncNumberVisibility = () => {
      const shouldAppendNumber = appendNumberInput ? appendNumberInput.checked : true;
      numControls.classList.toggle("is-disabled", !shouldAppendNumber);

      numberInput.disabled = !shouldAppendNumber;
      incBtn.disabled = !shouldAppendNumber;
      decBtn.disabled = !shouldAppendNumber;

      if (!shouldAppendNumber) {
        setFieldError(numberInput, numberError, false, "", numControls);
      }
    };

    const syncLabelChipState = () => {
      const current = labelInput.value.trim().toLowerCase();
      labelChips.forEach((chip) => {
        const value = String(chip.getAttribute("data-label-chip") || "").trim().toLowerCase();
        chip.classList.toggle("is-active", Boolean(current && value && current === value));
      });
    };

    const syncLabelChipOverflowState = () => {
      if (!labelChipRow) return;
      const maxScroll = Math.max(0, labelChipRow.scrollWidth - labelChipRow.clientWidth);
      const current = Math.max(0, labelChipRow.scrollLeft);
      const hasOverflow = maxScroll > 1;
      const atStart = !hasOverflow || current <= 1;
      const atEnd = !hasOverflow || current >= maxScroll - 1;

      labelChipRow.classList.toggle("has-overflow", hasOverflow);
      labelChipRow.classList.toggle("at-start", atStart);
      labelChipRow.classList.toggle("at-end", atEnd);
    };

    const autoResizeTextarea = (textarea) => {
      if (!textarea) return;
      textarea.style.height = "auto";
      const minHeight = parseFloat(global.getComputedStyle(textarea).minHeight) || 0;
      textarea.style.height = `${Math.max(minHeight, textarea.scrollHeight)}px`;
    };

    const setNotesState = (isVisible, clearWhenHidden = false) => {
      if (!addNotesBtn || !notesGroup || !notesInput) return;
      notesGroup.hidden = !isVisible;
      addNotesBtn.textContent = isVisible ? "Remove Notes" : "Add Notes";
      addNotesBtn.setAttribute("aria-expanded", isVisible ? "true" : "false");
      if (!isVisible && clearWhenHidden) {
        notesInput.value = "";
      }
      if (!isVisible) {
        notesInput.style.height = "";
      } else {
        autoResizeTextarea(notesInput);
      }
    };

    const setSegmentedSelection = (buttons, attrName, selectedValue) => {
      buttons.forEach((button) => {
        const value = button.getAttribute(attrName);
        const isActive = value === selectedValue;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const syncActivePageHeight = () => {
      if (!modalMainContent) return;
      if (pageHeightRafId) global.cancelAnimationFrame(pageHeightRafId);
      pageHeightRafId = global.requestAnimationFrame(() => {
        pageHeightRafId = 0;
        const activePanel = pagePanels.find((panel) => !panel.hidden);
        if (!activePanel) return;
        const pageScroll = activePanel.querySelector(".page-scroll") || activePanel;
        const chromeHeight = modalCard.offsetHeight - modalMainContent.offsetHeight;
        const viewportAllowance = Math.max(280, global.innerHeight - chromeHeight - 24);
        const desiredHeight = Math.max(260, Math.min(viewportAllowance, pageScroll.scrollHeight + 4));
        modalMainContent.style.height = `${Math.round(desiredHeight)}px`;
      });
    };

    const fillFormFromDraft = (draft) => {
      const safeDraft = normalizeDraft(draft);
      labelInput.value = safeDraft.label || "Design Update";
      numberInput.value = safeDraft.number || "01";
      if (appendNumberInput) appendNumberInput.checked = safeDraft.appendNumberSuffix !== false;
      statusInput.value = safeDraft.status || "In Progress";
      accInput.value = safeDraft.accomplishmentsText || "";
      blockInput.value = safeDraft.blockersText || "";
      focusInput.value = safeDraft.focusText || "";

      const notesText = safeDraft.notesText || "";
      if (notesText.trim()) {
        setNotesState(true);
        notesInput.value = notesText;
      } else {
        notesInput.value = "";
        setNotesState(false);
      }

      selected = allColors.includes(safeDraft.bannerColor) ? safeDraft.bannerColor : defaultBannerColor;
      applyBannerSelection();
      renderPalette();
      applyStatusAccent();
      syncNumberVisibility();
      syncLabelChipState();
      validate();
      [accInput, blockInput, focusInput, notesInput].forEach((textarea) => autoResizeTextarea(textarea));
      syncActivePageHeight();
    };

    const renderDrafts = () => {
      if (!draftsList) return;
      draftsList.innerHTML = "";

      if (!draftsState.length) {
        if (draftsEmpty) draftsEmpty.hidden = false;
        return;
      }
      if (draftsEmpty) draftsEmpty.hidden = true;

      draftsState.forEach((draft) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "draft-item";
        item.setAttribute("data-draft-id", draft.id);

        const topRow = document.createElement("span");
        topRow.className = "draft-item-top";

        const title = document.createElement("span");
        title.className = "draft-item-title";
        title.textContent = draft.label || "Untitled Draft";

        const date = document.createElement("span");
        date.className = "draft-item-date";
        date.textContent = formatDraftDateTime(draft.createdAt);

        topRow.appendChild(title);
        topRow.appendChild(date);

        const meta = document.createElement("span");
        meta.className = "draft-item-meta";
        const numberMeta = draft.appendNumberSuffix ? `#${draft.number || "01"}` : "No suffix";
        meta.textContent = `${draft.status || "In Progress"} - ${numberMeta}`;

        const hiddenId = document.createElement("span");
        hiddenId.className = "draft-item-id";
        hiddenId.textContent = draft.id;

        item.appendChild(topRow);
        item.appendChild(meta);
        item.appendChild(hiddenId);

        item.addEventListener("click", () => {
          fillFormFromDraft(draft);
          setActionFeedback(`Draft loaded (${draft.id.slice(0, 8)}).`, "success");
          commitModalSettings({ activePage: "editor" });
        });

        draftsList.appendChild(item);
      });

      syncActivePageHeight();
    };

    const setPageSelection = () => {
      const activePage = PAGE_OPTIONS.has(settingsState.activePage)
        ? settingsState.activePage
        : DEFAULT_MODAL_SETTINGS.activePage;

      pageButtons.forEach((button) => {
        const page = String(button.getAttribute("data-page-target") || "").trim();
        const isActive = page === activePage;
        button.classList.toggle("is-active", isActive);
        if (isActive) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      pagePanels.forEach((panel) => {
        const page = String(panel.getAttribute("data-page") || "").trim();
        const isActive = page === activePage;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      });

      if (activePage === "drafts") {
        renderDrafts();
      }
      syncActivePageHeight();
    };

    const getResolvedTheme = () => {
      if (settingsState.theme === "auto") {
        return systemColorScheme && systemColorScheme.matches ? "dark" : "light";
      }
      return settingsState.theme;
    };

    const applyModalSettings = () => {
      const resolvedTheme = getResolvedTheme();
      modalCard.setAttribute("data-theme", settingsState.theme);
      modalCard.setAttribute("data-resolved-theme", resolvedTheme);
      modalCard.setAttribute("data-density", settingsState.density);
      modalCard.setAttribute("data-active-page", settingsState.activePage);
      modalCard.setAttribute("data-color-vision", settingsState.colorVisionMode);
      modalCard.setAttribute("data-sidebar-collapsed", settingsState.sidebarCollapsed ? "true" : "false");
      modalCard.style.setProperty("--ui-font-size", `${settingsState.uiFontSize}px`);
      modalCard.style.setProperty("--editor-font-size", `${settingsState.editorFontSize}px`);

      if (modalBodyLayout) {
        modalBodyLayout.classList.toggle("is-sidebar-collapsed", settingsState.sidebarCollapsed);
      }

      if (settingsSidebar) {
        settingsSidebar.setAttribute("aria-hidden", settingsState.sidebarCollapsed ? "true" : "false");
      }

      if (settingsToggle) {
        settingsToggle.classList.toggle("is-active", !settingsState.sidebarCollapsed);
        settingsToggle.setAttribute("aria-pressed", settingsState.sidebarCollapsed ? "false" : "true");
        settingsToggle.setAttribute("aria-expanded", settingsState.sidebarCollapsed ? "false" : "true");
        settingsToggle.setAttribute("title", settingsState.sidebarCollapsed ? "Show sidebar" : "Hide sidebar");
      }

      setSegmentedSelection(themeButtons, "data-theme-option", settingsState.theme);
      setSegmentedSelection(densityButtons, "data-density-option", settingsState.density);

      if (colorFilterInput) {
        colorFilterInput.value = settingsState.colorVisionMode;
      }

      if (triggerTextInput) {
        triggerTextInput.value = settingsState.triggerText;
        syncTriggerFieldState();
      }

      if (triggerAfterSpaceInput) {
        triggerAfterSpaceInput.checked = settingsState.triggerActivation === "space";
      }

      if (uiFontSizeSlider) {
        uiFontSizeSlider.value = String(Math.round(settingsState.uiFontSize));
      }

      if (uiFontSizeInput) {
        uiFontSizeInput.value = formatFontSize(settingsState.uiFontSize);
      }

      if (editorFontSizeSlider) {
        editorFontSizeSlider.value = String(Math.round(settingsState.editorFontSize));
      }

      if (editorFontSizeInput) {
        editorFontSizeInput.value = formatFontSize(settingsState.editorFontSize);
      }

      setPageSelection();
    };

    const commitModalSettings = (updates) => {
      settingsState = normalizeModalSettings({ ...settingsState, ...updates });
      saveModalSettings(settingsState);
      applyModalSettings();
    };

    selected = allColors.includes(defaultBannerColor) ? defaultBannerColor : allColors[0];
    renderPalette();

    bannerPopover.addEventListener("toggle", syncBannerOpenState);

    if (typeof bannerPopover.showPopover === "function" && typeof bannerPopover.hidePopover === "function") {
      bannerTrigger.addEventListener("click", () => {
        syncBannerOpenState();
      });
    } else {
      bannerTrigger.addEventListener("click", () => {
        bannerPopover.classList.toggle("is-open-fallback");
        syncBannerOpenState();
      });

      const onDocClick = (event) => {
        if (!bannerPopover.classList.contains("is-open-fallback")) return;
        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        if (path.includes(bannerPopover) || path.includes(bannerTrigger)) return;
        bannerPopover.classList.remove("is-open-fallback");
        syncBannerOpenState();
      };
      shadow.addEventListener("click", onDocClick);
    }

    applyBannerSelection();
    validate();

    incBtn.onclick = () => {
      const n = clampInt(numberInput.value) + 1;
      numberInput.value = formatNumber(n);
      validate();
    };

    decBtn.onclick = () => {
      const n = Math.max(1, clampInt(numberInput.value) - 1);
      numberInput.value = formatNumber(n);
      validate();
    };

    numberInput.addEventListener("input", () => {
      const n = clampInt(numberInput.value);
      numberInput.value = formatNumber(n);
      validate();
    });

    if (appendNumberInput) {
      appendNumberInput.addEventListener("change", () => {
        syncNumberVisibility();
        validate();
        syncActivePageHeight();
      });
    }

    labelInput.addEventListener("input", () => {
      validate();
      syncLabelChipState();
      syncActivePageHeight();
    });

    labelChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.getAttribute("data-label-chip");
        if (!value) return;
        labelInput.value = value;
        validate();
        syncLabelChipState();
        syncActivePageHeight();
      });
    });

    if (labelChipRow) {
      labelChipRow.addEventListener("scroll", syncLabelChipOverflowState, { passive: true });
      labelChipRow.addEventListener("wheel", (event) => {
        if (labelChipRow.scrollWidth <= labelChipRow.clientWidth) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        labelChipRow.scrollLeft += event.deltaY;
        syncLabelChipOverflowState();
      }, { passive: false });

      if (typeof ResizeObserver === "function") {
        chipResizeObserver = new ResizeObserver(syncLabelChipOverflowState);
        chipResizeObserver.observe(labelChipRow);
      }
    }

    if (settingsToggle) {
      settingsToggle.addEventListener("click", () => {
        commitModalSettings({ sidebarCollapsed: !settingsState.sidebarCollapsed });
      });
    }

    pageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = String(button.getAttribute("data-page-target") || "").trim();
        if (!PAGE_OPTIONS.has(value)) return;
        if (value === "editor") {
          setActionFeedback("Ready.", "muted");
        }
        commitModalSettings({ activePage: value });
      });
    });

    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-theme-option");
        if (!value || !THEME_OPTIONS.has(value)) return;
        commitModalSettings({ theme: value });
      });
    });

    densityButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = String(button.getAttribute("data-density-option") || "").trim();
        if (!DENSITY_OPTIONS.has(value)) return;
        commitModalSettings({ density: value });
      });
    });

    if (colorFilterInput) {
      colorFilterInput.addEventListener("change", () => {
        const value = String(colorFilterInput.value || "").trim();
        if (!COLOR_VISION_OPTIONS.has(value)) return;
        commitModalSettings({ colorVisionMode: value });
      });
    }

    if (triggerTextInput) {
      triggerTextInput.addEventListener("input", () => {
        syncTriggerFieldState();
        syncActivePageHeight();
      });

      triggerTextInput.addEventListener("change", () => {
        commitTriggerTextFromInput();
        syncActivePageHeight();
      });

      triggerTextInput.addEventListener("blur", () => {
        commitTriggerTextFromInput();
        syncActivePageHeight();
      });

      triggerTextInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitTriggerTextFromInput();
          triggerTextInput.blur();
          syncActivePageHeight();
        }
      });
    }

    if (triggerAfterSpaceInput) {
      triggerAfterSpaceInput.addEventListener("change", () => {
        commitModalSettings({
          triggerActivation: triggerAfterSpaceInput.checked ? "space" : "immediate"
        });
      });
    }

    if (uiFontSizeSlider) {
      uiFontSizeSlider.addEventListener("input", () => {
        const value = clampNumber(
          uiFontSizeSlider.value,
          UI_FONT_SIZE_MIN,
          UI_FONT_SIZE_MAX,
          settingsState.uiFontSize
        );
        commitModalSettings({ uiFontSize: Math.round(value) });
      });
    }

    if (uiFontSizeInput) {
      const syncUiFontFromTextBox = () => {
        const value = clampNumber(
          uiFontSizeInput.value,
          UI_FONT_SIZE_MIN,
          UI_FONT_SIZE_MAX,
          settingsState.uiFontSize
        );
        commitModalSettings({ uiFontSize: value });
      };

      uiFontSizeInput.addEventListener("change", syncUiFontFromTextBox);
      uiFontSizeInput.addEventListener("blur", syncUiFontFromTextBox);
      uiFontSizeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncUiFontFromTextBox();
          uiFontSizeInput.blur();
        }
      });
    }

    if (editorFontSizeSlider) {
      editorFontSizeSlider.addEventListener("input", () => {
        const value = clampNumber(
          editorFontSizeSlider.value,
          EDITOR_FONT_SIZE_MIN,
          EDITOR_FONT_SIZE_MAX,
          settingsState.editorFontSize
        );
        commitModalSettings({ editorFontSize: Math.round(value) });
      });
    }

    if (editorFontSizeInput) {
      const syncFromTextBox = () => {
        const value = clampNumber(
          editorFontSizeInput.value,
          EDITOR_FONT_SIZE_MIN,
          EDITOR_FONT_SIZE_MAX,
          settingsState.editorFontSize
        );
        commitModalSettings({ editorFontSize: value });
      };

      editorFontSizeInput.addEventListener("change", syncFromTextBox);
      editorFontSizeInput.addEventListener("blur", syncFromTextBox);
      editorFontSizeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncFromTextBox();
          editorFontSizeInput.blur();
        }
      });
    }

    if (systemColorScheme) {
      onSystemColorSchemeChange = () => {
        if (settingsState.theme === "auto") {
          applyModalSettings();
        }
      };
      if (typeof systemColorScheme.addEventListener === "function") {
        systemColorScheme.addEventListener("change", onSystemColorSchemeChange);
      } else if (typeof systemColorScheme.addListener === "function") {
        systemColorScheme.addListener(onSystemColorSchemeChange);
      }
    }

    const autoResizeTextareas = [accInput, blockInput, focusInput, notesInput].filter(Boolean);
    autoResizeTextareas.forEach((textarea) => {
      textarea.addEventListener("input", () => {
        autoResizeTextarea(textarea);
        syncActivePageHeight();
      });
    });

    accInput.addEventListener("input", () => {
      validate();
      syncActivePageHeight();
    });
    statusInput.addEventListener("change", () => {
      applyStatusAccent();
      syncActivePageHeight();
    });

    onWindowResize = () => {
      syncActivePageHeight();
    };
    global.addEventListener("resize", onWindowResize);

    applyStatusAccent();
    syncLabelChipState();
    syncNumberVisibility();
    syncLabelChipOverflowState();
    applyModalSettings();
    autoResizeTextareas.forEach(autoResizeTextarea);
    setActionFeedback("Ready.", "muted");
    renderDrafts();

    if (addNotesBtn && notesGroup && notesInput) {
      setNotesState(!notesGroup.hidden);
      addNotesBtn.addEventListener("click", () => {
        const willShow = notesGroup.hidden;
        if (willShow) {
          setNotesState(true);
          notesInput.focus();
          syncActivePageHeight();
          return;
        }
        setNotesState(false, true);
        syncActivePageHeight();
      });
    }
    if (closeBtn) {
      closeBtn.onclick = close;
    }

    saveDraftBtn.addEventListener("click", () => {
      const draft = normalizeDraft(collectDraftPayload());
      draftsState = [draft, ...draftsState].slice(0, MAX_DRAFTS);
      saveDrafts(draftsState);
      renderDrafts();
      setActionFeedback(`Draft saved (${draft.id.slice(0, 8)}).`, "success");
      commitModalSettings({ activePage: "drafts" });
    });

    copyHtmlBtn.addEventListener("click", async () => {
      if (typeof buildHTML !== "function") return;
      const html = buildHTML(collectInsertData());
      const copied = await copyInnerHtmlToClipboard(html);
      setActionFeedback(copied ? "innerHTML copied to clipboard." : "Copy failed. Clipboard blocked.", copied ? "success" : "error");
    });

    insertBtn.onclick = () => {
      if (typeof buildHTML !== "function" || typeof simulatePaste !== "function") return;
      editor.innerHTML = "";
      simulatePaste(editor, buildHTML(collectInsertData()));
      close();
    };

    document.addEventListener("keydown", stopKeys, true);
    document.addEventListener("keyup", stopKeys, true);
    document.addEventListener("keypress", stopKeys, true);

    modal.addEventListener("toggle", (event) => {
      if (event.newState === "closed") cleanup();
    });

    if (typeof modal.showPopover === "function") {
      try {
        modal.showPopover();
      } catch {
        modal.classList.add("is-open-fallback");
      }
    } else {
      modal.classList.add("is-open-fallback");
    }

    if (settingsState.activePage === "editor") {
      labelInput.focus();
    } else {
      const activePageButton = pageButtons.find((button) => button.classList.contains("is-active"));
      if (activePageButton) activePageButton.focus();
    }
  };
})(globalThis);

