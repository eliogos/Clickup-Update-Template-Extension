(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});
  const constants = app.constants || {};
  const FONT_STYLESHEET_HREF =
    "https://fonts.googleapis.com/css2?family=Darumadrop+One&family=Geist+Mono:wght@100..900&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=National+Park:wght@200..800&family=VT323&display=swap";
  const SETTINGS_STORAGE_KEY = "clickup-update-modal.settings.v1";
  const FONT_SIZE_MIN = 10;
  const FONT_SIZE_MAX = 24;
  const THEME_OPTIONS = new Set(["light", "auto", "dark"]);
  const DENSITY_SCALE_OPTIONS = new Set(["1", "2", "3"]);
  const COLOR_FILTER_OPTIONS = new Set(["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"]);
  const DEFAULT_MODAL_SETTINGS = Object.freeze({
    sidebarCollapsed: false,
    theme: "auto",
    densityScale: 2,
    colorFilter: "none",
    editorFontSize: 13
  });

  let modalCssCache = null;

  function clampNumber(value, min, max, fallback) {
    const n = parseFloat(String(value).trim());
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function normalizeModalSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const theme = THEME_OPTIONS.has(source.theme) ? source.theme : DEFAULT_MODAL_SETTINGS.theme;
    const legacyDensityScale = source.density === "compact"
      ? 1
      : source.density === "spacious"
        ? 3
        : source.density === "comfortable"
          ? 2
          : DEFAULT_MODAL_SETTINGS.densityScale;
    const densityScale = Math.round(
      clampNumber(
        source.densityScale == null ? legacyDensityScale : source.densityScale,
        1,
        3,
        DEFAULT_MODAL_SETTINGS.densityScale
      )
    );
    const colorFilter = COLOR_FILTER_OPTIONS.has(source.colorFilter)
      ? source.colorFilter
      : DEFAULT_MODAL_SETTINGS.colorFilter;
    const editorFontSize = clampNumber(
      source.editorFontSize,
      FONT_SIZE_MIN,
      FONT_SIZE_MAX,
      DEFAULT_MODAL_SETTINGS.editorFontSize
    );

    return {
      sidebarCollapsed: Boolean(source.sidebarCollapsed),
      theme,
      densityScale,
      colorFilter,
      editorFontSize
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

  function ensureFontLinks() {
    if (document.head.querySelector('link[data-clickup-update-fonts="styles"]')) return;

    const preconnectGoogleApis = document.createElement("link");
    preconnectGoogleApis.rel = "preconnect";
    preconnectGoogleApis.href = "https://fonts.googleapis.com";
    preconnectGoogleApis.setAttribute("data-clickup-update-fonts", "preconnect-googleapis");
    document.head.appendChild(preconnectGoogleApis);

    const preconnectGstatic = document.createElement("link");
    preconnectGstatic.rel = "preconnect";
    preconnectGstatic.href = "https://fonts.gstatic.com";
    preconnectGstatic.crossOrigin = "anonymous";
    preconnectGstatic.setAttribute("data-clickup-update-fonts", "preconnect-gstatic");
    document.head.appendChild(preconnectGstatic);

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = FONT_STYLESHEET_HREF;
    stylesheet.setAttribute("data-clickup-update-fonts", "styles");
    document.head.appendChild(stylesheet);
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
    const cancelBtn = byId("cancel");
    const statusInput = byId("status");
    const statusSelectWrap = statusInput ? statusInput.closest(".status-select-wrap") : null;
    const blockInput = byId("block");
    const focusInput = byId("focus");
    const addNotesBtn = byId("add-notes");
    const notesGroup = byId("notes-group");
    const notesInput = byId("notes");
    const modalBodyLayout = byId("modal-body-layout");
    const settingsSidebar = byId("settings-sidebar");
    const settingsToggle = byId("settings-toggle");
    const themeButtons = Array.from(shadow.querySelectorAll("[data-theme-option]"));
    const densityButtons = Array.from(shadow.querySelectorAll("[data-density-scale-option]"));
    const colorFilterInput = byId("color-filter-mode");
    const editorFontSizeInput = byId("editor-font-size-input");
    const editorFontSizeSlider = byId("editor-font-size-slider");

    if (
      !modal || !labelInput || !numberInput || !accInput ||
      !insertBtn || !incBtn || !decBtn || !cancelBtn ||
      !statusInput || !blockInput || !focusInput ||
      !bannerTrigger || !bannerPreview || !bannerPopover || !modalCard
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
    const systemColorScheme = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-color-scheme: dark)")
      : null;
    let onSystemColorSchemeChange = null;

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

    const setSegmentedSelection = (buttons, attrName, selectedValue) => {
      buttons.forEach((button) => {
        const value = button.getAttribute(attrName);
        const isActive = value === selectedValue;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
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
      modalCard.setAttribute("data-density-scale", String(settingsState.densityScale));
      modalCard.setAttribute("data-color-filter", settingsState.colorFilter);
      modalCard.setAttribute("data-sidebar-collapsed", settingsState.sidebarCollapsed ? "true" : "false");
      modalCard.style.setProperty("--editor-font-size", `${settingsState.editorFontSize}px`);

      if (modalBodyLayout) {
        modalBodyLayout.classList.toggle("is-sidebar-collapsed", settingsState.sidebarCollapsed);
      }

      if (settingsSidebar) {
        settingsSidebar.setAttribute("aria-hidden", settingsState.sidebarCollapsed ? "true" : "false");
      }

      if (settingsToggle) {
        settingsToggle.textContent = settingsState.sidebarCollapsed ? "Show Settings" : "Hide Settings";
        settingsToggle.setAttribute("aria-expanded", settingsState.sidebarCollapsed ? "false" : "true");
      }

      setSegmentedSelection(themeButtons, "data-theme-option", settingsState.theme);
      setSegmentedSelection(densityButtons, "data-density-scale-option", String(settingsState.densityScale));

      if (colorFilterInput) {
        colorFilterInput.value = settingsState.colorFilter;
      }

      if (editorFontSizeSlider) {
        editorFontSizeSlider.value = String(Math.round(settingsState.editorFontSize));
      }

      if (editorFontSizeInput) {
        editorFontSizeInput.value = formatFontSize(settingsState.editorFontSize);
      }
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
      });
    }

    labelInput.addEventListener("input", () => {
      validate();
      syncLabelChipState();
    });

    labelChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.getAttribute("data-label-chip");
        if (!value) return;
        labelInput.value = value;
        validate();
        syncLabelChipState();
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

    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-theme-option");
        if (!value || !THEME_OPTIONS.has(value)) return;
        commitModalSettings({ theme: value });
      });
    });

    densityButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = String(button.getAttribute("data-density-scale-option") || "").trim();
        if (!DENSITY_SCALE_OPTIONS.has(value)) return;
        commitModalSettings({ densityScale: parseInt(value, 10) });
      });
    });

    if (colorFilterInput) {
      colorFilterInput.addEventListener("change", () => {
        const value = String(colorFilterInput.value || "").trim();
        if (!COLOR_FILTER_OPTIONS.has(value)) return;
        commitModalSettings({ colorFilter: value });
      });
    }

    if (editorFontSizeSlider) {
      editorFontSizeSlider.addEventListener("input", () => {
        const value = clampNumber(
          editorFontSizeSlider.value,
          FONT_SIZE_MIN,
          FONT_SIZE_MAX,
          settingsState.editorFontSize
        );
        commitModalSettings({ editorFontSize: Math.round(value) });
      });
    }

    if (editorFontSizeInput) {
      const syncFromTextBox = () => {
        const value = clampNumber(
          editorFontSizeInput.value,
          FONT_SIZE_MIN,
          FONT_SIZE_MAX,
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

    accInput.addEventListener("input", validate);
    statusInput.addEventListener("change", applyStatusAccent);

    applyStatusAccent();
    syncLabelChipState();
    syncNumberVisibility();
    syncLabelChipOverflowState();
    applyModalSettings();

    if (addNotesBtn && notesGroup && notesInput) {
      const setNotesState = (isVisible) => {
        notesGroup.hidden = !isVisible;
        addNotesBtn.textContent = isVisible ? "Remove Notes" : "Add Notes";
        addNotesBtn.setAttribute("aria-expanded", isVisible ? "true" : "false");
      };
      setNotesState(!notesGroup.hidden);
      addNotesBtn.addEventListener("click", () => {
        const willShow = notesGroup.hidden;
        if (willShow) {
          setNotesState(true);
          notesInput.focus();
          return;
        }
        notesInput.value = "";
        setNotesState(false);
      });
    }
    cancelBtn.onclick = close;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        close();
      }
    });

    insertBtn.onclick = () => {
      if (typeof buildHTML !== "function" || typeof simulatePaste !== "function") return;

      const data = {
        label: labelInput.value.trim().toUpperCase() || "DESIGN UPDATE",
        number: numberInput.value.trim() || "01",
        appendNumberSuffix: appendNumberInput ? appendNumberInput.checked : true,
        status: statusInput.value,
        accomplishments: splitLines(accInput.value),
        blockers: splitLines(blockInput.value),
        focus: splitLines(focusInput.value),
        notes: notesInput && notesGroup && !notesGroup.hidden ? splitLines(notesInput.value) : [],
        colorFilterMode: settingsState.colorFilter,
        bannerColor: selected
      };

      editor.innerHTML = "";
      simulatePaste(editor, buildHTML(data));
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

    labelInput.focus();
  };
})(globalThis);

