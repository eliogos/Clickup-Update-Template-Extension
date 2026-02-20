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
  const LOFI_STREAM_URL = "https://ec3.yesstreaming.net:3755/stream";
  const LOFI_VOLUME_STORAGE_KEY = "clickup-update-modal.lofi.volume.v1";
  const MAX_DRAFTS = 40;
  const UI_FONT_SIZE_MIN = 11;
  const UI_FONT_SIZE_MAX = 20;
  const EDITOR_FONT_SIZE_MIN = 10;
  const EDITOR_FONT_SIZE_MAX = 24;
  const ANIMATION_SPEED_MIN = 0;
  const ANIMATION_SPEED_MAX = 5;
  // Preset order: Sluggish, Slow, Normal, Fast, Hyper, Off
  // Scale acts as duration multiplier for transitions/decay.
  const ANIMATION_SPEED_SCALES = Object.freeze([1.8, 1.35, 1, 0.72, 0.48, 0]);
  const REDUCED_MOTION_SCALE_CAP = 0.4;
  const INTERPOLATOR_MODE_OPTIONS = new Set(["preset", "expression", "curve"]);
  const INTERPOLATOR_PRESET_OPTIONS = new Set(["default", "linear", "ease-in", "ease-out", "ease-in-out", "stop-motion"]);
  const STOP_MOTION_STEPS = 10;
  const STOP_MOTION_DROP_INTERVAL = 3;
  const DEFAULT_INTERPOLATOR_CURVE = Object.freeze({ p1x: 0.2, p1y: 0.9, p2x: 0.2, p2y: 1 });
  const MAX_CUSTOM_CURVE_POINTS = 6;
  const PHYSICS_INTENSITY_MIN = 0;
  const PHYSICS_INTENSITY_MAX = 100;
  const PHYSICS_BPM_OFFSET_MIN = -40;
  const PHYSICS_BPM_OFFSET_MAX = 40;
  const LOFI_RATE_MIN = 0.5;
  const LOFI_RATE_MAX = 1.5;
  const OVERLAY_BLUR_MIN = 0;
  const OVERLAY_BLUR_MAX = 20;
  const OVERLAY_OPACITY_MIN = 0;
  const OVERLAY_OPACITY_MAX = 100;
  const MODAL_SCALE_MIN = 70;
  const MODAL_SCALE_MAX = 130;
  const MODAL_OPACITY_MIN = 10;
  const MODAL_OPACITY_MAX = 100;
  const BASE_LOFI_BPM = 84;
  const TRIGGER_ACTIVATION_OPTIONS = new Set(["space", "immediate"]);
  const PAGE_OPTIONS = new Set(["editor", "settings", "variables", "drafts", "about"]);
  const THEME_OPTIONS = new Set(["light", "auto", "dark"]);
  const DENSITY_OPTIONS = new Set(["compact", "comfortable", "spacious"]);
  const COLOR_VISION_OPTIONS = new Set(["none", "protanopia", "deuteranopia", "tritanopia"]);
  const COLOR_VISION_MODE_DESCRIPTIONS = Object.freeze({
    none: "No correction applied. Modes approximate channel loss: Protanopia (no red), Deuteranopia (no green), Tritanopia (no blue).",
    protanopia: "Protanopia correction (no red): adjusts surfaces, text, icons, and status colors for missing-red perception.",
    deuteranopia: "Deuteranopia correction (no green): adjusts surfaces, text, icons, and status colors for missing-green perception.",
    tritanopia: "Tritanopia correction (no blue): adjusts surfaces, text, icons, and status colors for missing-blue perception."
  });
  const ACCENT_PRESETS = Object.freeze({
    blue: 218,
    teal: 182,
    green: 146,
    amber: 40,
    violet: 272,
    rose: 342
  });
  const ACCENT_PRESET_OPTIONS = new Set([...Object.keys(ACCENT_PRESETS), "custom"]);
  const DEFAULT_ACCENT_PRESET = "blue";
  const DEFAULT_ACCENT_HUE = ACCENT_PRESETS[DEFAULT_ACCENT_PRESET];
  const COLOR_VISION_ACCENT_HUE_ROTATION = Object.freeze({
    none: 0,
    protanopia: 26,
    deuteranopia: 16,
    tritanopia: -34
  });
  const DEFAULT_MODAL_SETTINGS = Object.freeze({
    sidebarCollapsed: false,
    activePage: "editor",
    theme: "auto",
    density: "comfortable",
    colorVisionMode: "none",
    accentPreset: DEFAULT_ACCENT_PRESET,
    accentHue: DEFAULT_ACCENT_HUE,
    uiFontSize: 13,
    editorFontSize: 13,
    animationSpeed: 2,
    interpolatorMode: "preset",
    interpolatorPreset: "default",
    interpolatorExpression: "1 - pow(1 - t, 2)",
    interpolatorCurve: { ...DEFAULT_INTERPOLATOR_CURVE },
    interpolatorCurvePoints: [],
    musicAutoplay: true,
    lofiSpeedRate: 1,
    lofiPitchRate: 1,
    lofiRatePitchSync: true,
    animationFollowDevice: false,
    physicsEnabled: true,
    physicsIntensity: 55,
    physicsSyncToMusic: false,
    physicsBpmOffset: 0,
    overlayBlur: 2,
    overlayOpacity: 64,
    modalScale: 100,
    modalOpacity: 100,
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
    const accentPresetRaw = String(
      source.accentPreset == null
        ? (source.accentColorPreset == null ? DEFAULT_MODAL_SETTINGS.accentPreset : source.accentColorPreset)
        : source.accentPreset
    ).trim().toLowerCase();
    const accentPreset = ACCENT_PRESET_OPTIONS.has(accentPresetRaw)
      ? accentPresetRaw
      : DEFAULT_MODAL_SETTINGS.accentPreset;
    const accentHue = clampNumber(
      source.accentHue,
      0,
      360,
      DEFAULT_MODAL_SETTINGS.accentHue
    );
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
    const rawAnimationSpeed = parseFloat(source.animationSpeed);
    let animationSpeed = DEFAULT_MODAL_SETTINGS.animationSpeed;
    if (Number.isFinite(rawAnimationSpeed)) {
      if (rawAnimationSpeed > ANIMATION_SPEED_MAX) {
        // Legacy scale 0..100 -> 0..4, while keeping "off" as explicit preset 5.
        if (rawAnimationSpeed <= 0.1) {
          animationSpeed = 5;
        } else {
          animationSpeed = Math.max(0, Math.min(4, Math.round((rawAnimationSpeed / 100) * 4)));
        }
      } else {
        animationSpeed = Math.max(ANIMATION_SPEED_MIN, Math.min(ANIMATION_SPEED_MAX, Math.round(rawAnimationSpeed)));
      }
    }
    const physicsIntensity = clampNumber(
      source.physicsIntensity,
      PHYSICS_INTENSITY_MIN,
      PHYSICS_INTENSITY_MAX,
      DEFAULT_MODAL_SETTINGS.physicsIntensity
    );
    const physicsBpmOffset = clampNumber(
      source.physicsBpmOffset,
      PHYSICS_BPM_OFFSET_MIN,
      PHYSICS_BPM_OFFSET_MAX,
      DEFAULT_MODAL_SETTINGS.physicsBpmOffset
    );
    const lofiSpeedRate = clampNumber(
      source.lofiSpeedRate,
      LOFI_RATE_MIN,
      LOFI_RATE_MAX,
      DEFAULT_MODAL_SETTINGS.lofiSpeedRate
    );
    const lofiPitchRate = clampNumber(
      source.lofiPitchRate,
      LOFI_RATE_MIN,
      LOFI_RATE_MAX,
      DEFAULT_MODAL_SETTINGS.lofiPitchRate
    );
    const interpolatorMode = INTERPOLATOR_MODE_OPTIONS.has(source.interpolatorMode)
      ? source.interpolatorMode
      : DEFAULT_MODAL_SETTINGS.interpolatorMode;
    const interpolatorPreset = INTERPOLATOR_PRESET_OPTIONS.has(source.interpolatorPreset)
      ? source.interpolatorPreset
      : DEFAULT_MODAL_SETTINGS.interpolatorPreset;
    const interpolatorExpression = String(
      source.interpolatorExpression == null
        ? DEFAULT_MODAL_SETTINGS.interpolatorExpression
        : source.interpolatorExpression
    ).trim() || DEFAULT_MODAL_SETTINGS.interpolatorExpression;
    const sourceCurve = source.interpolatorCurve && typeof source.interpolatorCurve === "object"
      ? source.interpolatorCurve
      : {};
    const interpolatorCurve = {
      p1x: clampNumber(sourceCurve.p1x, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p1x),
      p1y: clampNumber(sourceCurve.p1y, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p1y),
      p2x: clampNumber(sourceCurve.p2x, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p2x),
      p2y: clampNumber(sourceCurve.p2y, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p2y)
    };
    const sourceCurvePoints = Array.isArray(source.interpolatorCurvePoints)
      ? source.interpolatorCurvePoints
      : [];
    const interpolatorCurvePoints = sourceCurvePoints
      .map((point) => {
        const safePoint = point && typeof point === "object" ? point : {};
        return {
          x: clampNumber(safePoint.x, 0.02, 0.98, NaN),
          y: clampNumber(safePoint.y, 0, 1, NaN)
        };
      })
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
      .sort((a, b) => a.x - b.x)
      .slice(0, MAX_CUSTOM_CURVE_POINTS);
    const overlayBlur = clampNumber(
      source.overlayBlur,
      OVERLAY_BLUR_MIN,
      OVERLAY_BLUR_MAX,
      DEFAULT_MODAL_SETTINGS.overlayBlur
    );
    const overlayOpacity = clampNumber(
      source.overlayOpacity,
      OVERLAY_OPACITY_MIN,
      OVERLAY_OPACITY_MAX,
      DEFAULT_MODAL_SETTINGS.overlayOpacity
    );
    const modalScale = clampNumber(
      source.modalScale,
      MODAL_SCALE_MIN,
      MODAL_SCALE_MAX,
      DEFAULT_MODAL_SETTINGS.modalScale
    );
    const modalOpacity = clampNumber(
      source.modalOpacity,
      MODAL_OPACITY_MIN,
      MODAL_OPACITY_MAX,
      DEFAULT_MODAL_SETTINGS.modalOpacity
    );

    return {
      sidebarCollapsed: Boolean(source.sidebarCollapsed),
      activePage,
      theme,
      density,
      colorVisionMode,
      accentPreset,
      accentHue,
      uiFontSize,
      editorFontSize,
      animationSpeed,
      interpolatorMode,
      interpolatorPreset,
      interpolatorExpression,
      interpolatorCurve,
      interpolatorCurvePoints,
      musicAutoplay: source.musicAutoplay !== false,
      lofiSpeedRate,
      lofiPitchRate,
      lofiRatePitchSync: source.lofiRatePitchSync !== false,
      animationFollowDevice: source.animationFollowDevice === true,
      physicsEnabled: source.physicsEnabled !== false,
      physicsIntensity,
      physicsSyncToMusic: source.physicsSyncToMusic === true,
      physicsBpmOffset: Math.round(physicsBpmOffset),
      overlayBlur,
      overlayOpacity,
      modalScale,
      modalOpacity,
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

  function getLofiController() {
    if (app._lofiController && app._lofiController.__controllerVersion === "lofi-simple-v1") {
      return app._lofiController;
    }
    if (app._lofiController && typeof app._lofiController.pause === "function") {
      try {
        app._lofiController.pause();
      } catch {
        // Ignore legacy controller errors.
      }
    }
    app._lofiController = null;

    const listeners = new Set();
    const state = {
      playing: false,
      failed: false,
      disabledReason: "",
      volume: 0.35,
      speedRate: 1,
      pitchRate: 1,
      ratePitchSync: true
    };

    const audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.autoplay = false;
    const MODAL_AUDIO_FADE_MS = 260;
    let attemptedAutoplay = false;
    let fadeFrame = 0;
    let fadeToken = 0;
    let sourceInitPromise = null;
    let sourceReady = false;
    let streamAbort = null;
    let streamObjectUrl = "";

    const cleanupStreamSource = () => {
      if (typeof streamAbort === "function") {
        try {
          streamAbort();
        } catch {
          // Ignore cleanup errors.
        }
      }
      streamAbort = null;
      if (streamObjectUrl) {
        try {
          URL.revokeObjectURL(streamObjectUrl);
        } catch {
          // Ignore revoke errors.
        }
      }
      streamObjectUrl = "";
    };

    const toMimeType = (contentType) => {
      const lower = String(contentType || "").toLowerCase();
      if (lower.includes("audio/aac") || lower.includes("audio/aacp")) return "audio/aac";
      if (lower.includes("audio/mpeg")) return "audio/mpeg";
      if (lower.includes("audio/ogg")) return "audio/ogg";
      return "audio/mpeg";
    };

    const streamViaFetch = async (url) => {
      if (typeof MediaSource === "undefined" || typeof fetch !== "function") return false;
      cleanupStreamSource();
      let aborted = false;
      const mediaSource = new MediaSource();
      streamObjectUrl = URL.createObjectURL(mediaSource);
      audio.src = streamObjectUrl;
      streamAbort = () => {
        aborted = true;
        try {
          if (mediaSource.readyState === "open") {
            mediaSource.endOfStream();
          }
        } catch {
          // Ignore.
        }
      };

      return await new Promise((resolve) => {
        const handleOpen = async () => {
          try {
            const response = await fetch(url, { mode: "cors", cache: "no-store" });
            if (!response || !response.ok || !response.body) {
              resolve(false);
              return;
            }
            const mimeType = toMimeType(response.headers.get("content-type"));
            const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
            const queue = [];
            let resolved = false;
            const appendNext = () => {
              if (!queue.length || sourceBuffer.updating || aborted) return;
              const chunk = queue.shift();
              try {
                sourceBuffer.appendBuffer(chunk);
              } catch {
                // Ignore append errors.
              }
            };
            sourceBuffer.addEventListener("updateend", appendNext);

            const reader = response.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done || aborted) break;
              if (value && value.byteLength) {
                const chunk = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
                queue.push(chunk);
                appendNext();
                if (!resolved) {
                  resolved = true;
                  resolve(true);
                }
              }
            }
            if (mediaSource.readyState === "open") {
              try {
                mediaSource.endOfStream();
              } catch {
                // Ignore.
              }
            }
            if (!resolved) resolve(false);
          } catch {
            resolve(false);
          }
        };

        mediaSource.addEventListener("sourceopen", handleOpen, { once: true });
      });
    };

    const streamViaGm = async (url) => {
      if (typeof MediaSource === "undefined" || typeof global.GM_xmlhttpRequest !== "function") return false;
      cleanupStreamSource();
      let aborted = false;
      const mediaSource = new MediaSource();
      streamObjectUrl = URL.createObjectURL(mediaSource);
      audio.src = streamObjectUrl;
      streamAbort = () => {
        aborted = true;
        try {
          if (mediaSource.readyState === "open") {
            mediaSource.endOfStream();
          }
        } catch {
          // Ignore.
        }
      };

      return await new Promise((resolve) => {
        mediaSource.addEventListener("sourceopen", () => {
          const queue = [];
          let resolved = false;
          let lastSize = 0;
          let sourceBuffer = null;
          try {
            sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          } catch {
            resolve(false);
            return;
          }

          const appendNext = () => {
            if (!queue.length || sourceBuffer.updating || aborted) return;
            const chunk = queue.shift();
            try {
              sourceBuffer.appendBuffer(chunk);
            } catch {
              // Ignore append errors.
            }
          };
          sourceBuffer.addEventListener("updateend", appendNext);

          global.GM_xmlhttpRequest({
            method: "GET",
            url,
            responseType: "arraybuffer",
            onprogress: (event) => {
              if (aborted) return;
              const buffer = event && event.response ? event.response : null;
              if (!buffer || buffer.byteLength <= lastSize) return;
              const chunk = buffer.slice(lastSize);
              lastSize = buffer.byteLength;
              queue.push(chunk);
              appendNext();
              if (!resolved) {
                resolved = true;
                resolve(true);
              }
            },
            onload: () => {
              if (!resolved) resolve(true);
              if (mediaSource.readyState === "open") {
                try {
                  mediaSource.endOfStream();
                } catch {
                  // Ignore.
                }
              }
            },
            onerror: () => {
              resolve(false);
            }
          });
        }, { once: true });
      });
    };

    const ensureLofiSource = async () => {
      if (sourceReady) return true;
      if (sourceInitPromise) return await sourceInitPromise;
      sourceInitPromise = (async () => {
        const ok = await streamViaFetch(LOFI_STREAM_URL) || await streamViaGm(LOFI_STREAM_URL);
        if (!ok) {
          audio.src = LOFI_STREAM_URL;
        }
        sourceReady = true;
        return ok;
      })();
      return await sourceInitPromise;
    };

    const readSavedVolume = () => {
      try {
        if (!global.localStorage) return null;
        const raw = global.localStorage.getItem(LOFI_VOLUME_STORAGE_KEY);
        if (raw == null) return null;
        const n = parseFloat(raw);
        if (!Number.isFinite(n)) return null;
        return Math.max(0, Math.min(1, n));
      } catch {
        return null;
      }
    };

    const saveVolume = (value) => {
      try {
        if (!global.localStorage) return;
        global.localStorage.setItem(LOFI_VOLUME_STORAGE_KEY, String(value));
      } catch {
        // Best effort.
      }
    };

    const notify = () => {
      const snapshot = {
        playing: state.playing,
        failed: state.failed,
        disabledReason: state.disabledReason,
        volume: state.volume,
        speedRate: state.speedRate,
        pitchRate: state.pitchRate,
        ratePitchSync: state.ratePitchSync
      };
      listeners.forEach((listener) => {
        try {
          listener(snapshot);
        } catch {
          // Ignore listener exceptions.
        }
      });
    };

    const setFailure = (reason) => {
      if (fadeFrame) {
        global.cancelAnimationFrame(fadeFrame);
        fadeFrame = 0;
      }
      state.failed = false;
      state.disabledReason = String(reason || "Stream unavailable.");
      state.playing = false;
      notify();
    };

    const applyVolume = (value) => {
      const safe = Math.max(0, Math.min(1, Number(value)));
      if (!Number.isFinite(safe)) return;
      audio.volume = safe;
    };

    const stopVolumeFade = () => {
      if (!fadeFrame) return;
      global.cancelAnimationFrame(fadeFrame);
      fadeFrame = 0;
    };

    const fadeVolumeTo = (targetVolume, durationMs = MODAL_AUDIO_FADE_MS, onDone = null) => {
      const safeTarget = Math.max(0, Math.min(1, Number(targetVolume)));
      if (!Number.isFinite(safeTarget)) {
        if (typeof onDone === "function") onDone();
        return;
      }
      const safeDuration = Math.max(0, Number(durationMs) || 0);
      stopVolumeFade();
      const token = ++fadeToken;
      const startedAt = global.performance ? global.performance.now() : Date.now();
      const startVolume = Math.max(0, Math.min(1, Number(audio.volume)));

      if (safeDuration <= 0 || Math.abs(startVolume - safeTarget) < 0.001) {
        applyVolume(safeTarget);
        if (typeof onDone === "function") onDone();
        return;
      }

      const step = () => {
        if (token !== fadeToken) return;
        const now = global.performance ? global.performance.now() : Date.now();
        const progress = Math.max(0, Math.min(1, (now - startedAt) / safeDuration));
        const eased = progress < 1 ? (1 - Math.pow(1 - progress, 2)) : 1;
        applyVolume(startVolume + ((safeTarget - startVolume) * eased));
        if (progress >= 1) {
          fadeFrame = 0;
          applyVolume(safeTarget);
          if (typeof onDone === "function") onDone();
          return;
        }
        fadeFrame = global.requestAnimationFrame(step);
      };
      fadeFrame = global.requestAnimationFrame(step);
    };

    const finishPause = () => {
      try {
        audio.pause();
      } catch {
        // Ignore.
      }
      state.playing = false;
      notify();
    };

    const pause = ({ fadeOutMs = 0 } = {}) => {
      if (fadeOutMs > 0 && state.playing) {
        fadeVolumeTo(0, fadeOutMs, finishPause);
        return;
      }
      stopVolumeFade();
      finishPause();
    };

    const setVolume = (value) => {
      const next = Math.max(0, Math.min(1, Number(value)));
      if (!Number.isFinite(next)) return;
      stopVolumeFade();
      state.volume = next;
      applyVolume(next);
      saveVolume(next);
      notify();
    };

    const setPlaybackTuning = ({ speedRate, pitchRate, ratePitchSync } = {}) => {
      const nextSpeed = clampNumber(speedRate, LOFI_RATE_MIN, LOFI_RATE_MAX, state.speedRate || 1);
      const nextPitch = clampNumber(pitchRate, LOFI_RATE_MIN, LOFI_RATE_MAX, state.pitchRate || 1);
      const synced = ratePitchSync !== false;
      state.ratePitchSync = synced;
      state.speedRate = nextSpeed;
      state.pitchRate = synced ? nextSpeed : nextPitch;
      notify();
    };

    const getEstimatedBpm = () => {
      return Math.round(clampNumber(BASE_LOFI_BPM * state.speedRate, 55, 180, BASE_LOFI_BPM));
    };

    const play = async ({ autoplay = false, fadeInMs = 0 } = {}) => {
      if (!autoplay) attemptedAutoplay = true;
      state.failed = false;
      try {
        stopVolumeFade();
        await ensureLofiSource();
        const targetVolume = Math.max(0, Math.min(1, Number(state.volume)));
        if (fadeInMs > 0) {
          applyVolume(0);
        } else {
          applyVolume(targetVolume);
        }
        const playResult = audio.play();
        if (playResult && typeof playResult.then === "function") {
          await playResult;
        }
        state.playing = true;
        if (fadeInMs > 0) {
          fadeVolumeTo(targetVolume, fadeInMs);
        }
        notify();
        return true;
      } catch (error) {
        const name = error && error.name ? String(error.name) : "";
        if (name === "NotAllowedError") {
          // Browser autoplay policy - keep controllable for user click retry.
          state.playing = false;
          notify();
          return false;
        }
        setFailure("Failed to load stream.");
        return false;
      }
    };

    const maybeAutoplay = async () => {
      if (attemptedAutoplay) return;
      attemptedAutoplay = true;
      await play({ autoplay: true });
    };

    const modalEnter = async ({ autoplay = true } = {}) => {
      if (!autoplay) return false;
      return play({ autoplay, fadeInMs: MODAL_AUDIO_FADE_MS });
    };

    const modalExit = () => {
      pause({ fadeOutMs: MODAL_AUDIO_FADE_MS });
    };

    const toggle = async () => {
      if (state.playing) {
        pause();
        return;
      }
      await play({ autoplay: false });
    };

    const subscribe = (listener) => {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      listener({
        playing: state.playing,
        failed: state.failed,
        disabledReason: state.disabledReason,
        volume: state.volume,
        speedRate: state.speedRate,
        pitchRate: state.pitchRate,
        ratePitchSync: state.ratePitchSync
      });
      return () => {
        listeners.delete(listener);
      };
    };

    audio.addEventListener("error", () => {
      setFailure("Failed to load stream.");
    });

    audio.addEventListener("playing", () => {
      state.playing = true;
      notify();
    });

    audio.addEventListener("pause", () => {
      state.playing = false;
      notify();
    });

    const controller = {
      __controllerVersion: "lofi-simple-v1",
      subscribe,
      toggle,
      maybeAutoplay,
      pause,
      modalEnter,
      modalExit,
      getEstimatedBpm,
      setVolume,
      setPlaybackTuning
    };
    const persistedVolume = readSavedVolume();
    if (persistedVolume != null) {
      state.volume = persistedVolume;
    }
    audio.volume = state.volume;
    app._lofiController = controller;
    return controller;
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
    const lofiVolumeInput = byId("lofi-volume");
    const lofiToggleBtn = byId("lofi-toggle");
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
    const copyMainBtn = byId("copy-main") || byId("copy-html");
    const copyMenuTrigger = byId("copy-menu-trigger");
    const copyMenu = byId("copy-menu");
    const copyMenuItems = Array.from(shadow.querySelectorAll("[data-copy-format]"));
    const actionFeedback = byId("action-feedback");
    const modalToast = byId("modal-toast");
    const draftsList = byId("drafts-list");
    const draftsEmpty = byId("drafts-empty");
    const draftsTable = byId("drafts-table");
    const draftsSelectAll = byId("drafts-select-all");
    const draftsBulkActions = byId("drafts-bulk-actions");
    const draftsSelectedCount = byId("drafts-selected-count");
    const draftsBulkDeleteBtn = byId("drafts-bulk-delete");
    const draftsConfirmBackdrop = byId("drafts-confirm-backdrop");
    const draftsConfirmMessage = byId("drafts-confirm-message");
    const draftsConfirmCancelBtn = byId("drafts-confirm-cancel");
    const draftsConfirmDeleteBtn = byId("drafts-confirm-delete");
    const draftsReplaceConfirmBackdrop = byId("drafts-replace-confirm-backdrop");
    const draftsReplaceConfirmCancelBtn = byId("drafts-replace-confirm-cancel");
    const draftsReplaceConfirmContinueBtn = byId("drafts-replace-confirm-continue");
    const themeButtons = Array.from(shadow.querySelectorAll("[data-theme-option]"));
    const densityButtons = Array.from(shadow.querySelectorAll("[data-density-option]"));
    const accentPresetButtons = Array.from(shadow.querySelectorAll("[data-accent-preset]"));
    const accentCustomTrigger = byId("accent-custom-trigger");
    const accentCustomPopover = byId("accent-custom-popover");
    const accentHueSlider = byId("accent-hue-slider");
    const accentHueWheel = byId("accent-hue-wheel");
    const accentHueThumb = byId("accent-hue-thumb");
    const accentHueValue = byId("accent-hue-value");
    const accentCustomPreview = byId("accent-custom-preview");
    const colorFilterInput = byId("color-filter-mode");
    const colorFilterDescription = byId("color-filter-description");
    const triggerTextInput = byId("trigger-text-input");
    const triggerTextWarning = byId("trigger-text-warning");
    const triggerTextError = byId("trigger-text-error");
    const triggerAfterSpaceInput = byId("trigger-after-space");
    const uiFontSizeInput = byId("ui-font-size-input");
    const uiFontSizeSlider = byId("ui-font-size-slider");
    const editorFontSizeInput = byId("editor-font-size-input");
    const editorFontSizeSlider = byId("editor-font-size-slider");
    const animationPreviewBox = byId("animation-preview-box");
    const animationPreviewDot = byId("animation-preview-dot");
    const animationPreviewToggle = byId("animation-preview-toggle");
    const animationSpeedSlider = byId("animation-speed-slider");
    const interpolatorModeButtons = Array.from(shadow.querySelectorAll("[data-interpolator-mode]"));
    const interpolatorPresetInput = byId("interpolator-preset");
    const interpolatorExpressionInput = byId("interpolator-expression");
    const interpolatorExpressionError = byId("interpolator-expression-error");
    const interpolatorModePreset = byId("interpolator-mode-preset");
    const interpolatorModeExpression = byId("interpolator-mode-expression");
    const interpolatorModeCurve = byId("interpolator-mode-curve");
    const curveEditorCanvas = byId("curve-editor-canvas");
    const interpolatorCurveP1x = byId("interpolator-curve-p1x");
    const interpolatorCurveP1y = byId("interpolator-curve-p1y");
    const interpolatorCurveP2x = byId("interpolator-curve-p2x");
    const interpolatorCurveP2y = byId("interpolator-curve-p2y");
    const lofiAutoplayInput = byId("lofi-autoplay");
    const lofiSpeedRateSlider = byId("lofi-speed-rate-slider");
    const lofiPitchRateSlider = byId("lofi-pitch-rate-slider");
    const lofiSpeedRateValue = byId("lofi-speed-rate-value");
    const lofiPitchRateValue = byId("lofi-pitch-rate-value");
    const lofiRateSyncBtn = byId("lofi-rate-sync");
    const animationFollowDeviceInput = byId("animation-follow-device");
    const animationEnablePhysicsInput = byId("animation-enable-physics");
    const physicsIntensityBody = byId("physics-intensity-body");
    const physicsSyncMusicInput = byId("physics-sync-music");
    const physicsSyncTools = byId("physics-sync-tools");
    const physicsSyncBpmValue = byId("physics-sync-bpm-value");
    const physicsBpmOffsetInput = byId("physics-bpm-offset-input");
    const physicsBpmOffsetDec = byId("physics-bpm-offset-dec");
    const physicsBpmOffsetInc = byId("physics-bpm-offset-inc");
    const physicsSyncBpmHint = byId("physics-sync-bpm-hint");
    const physicsIntensityInput = byId("physics-intensity-input");
    const physicsIntensitySlider = byId("physics-intensity-slider");
    const overlayBlurInput = byId("overlay-blur-input");
    const overlayBlurSlider = byId("overlay-blur-slider");
    const overlayOpacityInput = byId("overlay-opacity-input");
    const overlayOpacitySlider = byId("overlay-opacity-slider");
    const modalScaleInput = byId("modal-scale-input");
    const modalScaleSlider = byId("modal-scale-slider");
    const modalOpacityInput = byId("modal-opacity-input");
    const modalOpacitySlider = byId("modal-opacity-slider");
    const settingsAnchorRail = byId("settings-anchor-rail");
    const settingsAnchorButtons = Array.from(shadow.querySelectorAll("[data-settings-anchor-target]"));
    const settingsPagePanel = byId("page-settings");
    const settingsPageScrollHost = settingsPagePanel ? settingsPagePanel.querySelector(".page-scroll") : null;
    const resetSettingButtons = Array.from(shadow.querySelectorAll("[data-reset-setting]"));
    const checkUpdatesBtn = byId("check-updates");

    if (
      !modal || !labelInput || !numberInput || !accInput ||
      !insertBtn || !incBtn || !decBtn || !closeBtn ||
      !statusInput || !blockInput || !focusInput ||
      !bannerTrigger || !bannerPreview || !bannerPopover || !modalCard ||
      !saveDraftBtn || !copyMainBtn || !actionFeedback || !draftsList || !modalMainContent
    ) {
      host.remove();
      return;
    }

    const allColors = constants.allColors || [];
    const isPopoverOpen = app.isPopoverOpen || (() => false);
    const buildHTML = app.buildHTML;
    const simulatePaste = app.simulatePaste;
    const defaultBannerColor = constants.defaultBannerColor || "blue-strong";
    const currentVersion = String(constants.APP_VERSION || "0.0.0").trim();
    const updateUrl = String(constants.UPDATE_URL || "").trim();
    const editorHintMessage = "You can set Files and Mentions after insert this template.";
    const COPY_FORMATS = Object.freeze({
      "inner-html": { label: "Copy innerHTML", icon: "code" },
      "raw-text": { label: "Copy Raw Text", icon: "text_snippet" },
      markdown: { label: "Copy Markdown", icon: "markdown" }
    });

    let selected = defaultBannerColor;
    let activeCopyFormat = "inner-html";
    let isCheckingUpdates = false;
    let selectedDraftIds = new Set();
    let pendingDeleteDraftIds = [];
    let pendingReplaceDraftId = "";
    let toastHideTimer = 0;
    let closed = false;
    let close = () => {};
    let chipResizeObserver = null;
    let settingsState = readModalSettings();
    let draftsState = readDrafts();
    let physicsController = null;
    const systemColorScheme = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-color-scheme: dark)")
      : null;
    const reducedMotionPreference = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    let onSystemColorSchemeChange = null;
    let onReducedMotionChange = null;
    let onWindowResize = null;
    let pageHeightRafId = 0;
    let settingsAnchorScrollRafId = 0;
    let previewRafId = 0;
    let previewLastTick = 0;
    let previewPhaseMs = 0;
    let previewPaused = false;
    let onSettingsPageScroll = null;
    let unbindLofiButton = null;
    let cleanupFloatingTooltip = null;
    let interpolatorExpressionFn = (t) => t;
    let activeCurveDrag = null;
    const curveEditorCtx = curveEditorCanvas && typeof curveEditorCanvas.getContext === "function"
      ? curveEditorCanvas.getContext("2d")
      : null;
    let curveEditorHitPoints = [];

    const setElementTooltip = (element, text) => {
      if (!element) return;
      const value = String(text || "").trim();
      if (!value) {
        delete element.dataset.tooltip;
        element.removeAttribute("title");
        return;
      }
      element.dataset.tooltip = value;
      element.removeAttribute("title");
    };

    const migrateTitleTooltips = () => {
      const elementsWithTitle = Array.from(shadow.querySelectorAll("[title]"));
      elementsWithTitle.forEach((element) => {
        const title = String(element.getAttribute("title") || "").trim();
        if (!title) return;
        setElementTooltip(element, title);
      });
    };
    migrateTitleTooltips();

    const setupFloatingTooltip = () => {
      if (!shadow || !modal || !modalCard) return () => {};
      modalCard.setAttribute("data-tooltip-mode", "floating");

      const tooltip = document.createElement("div");
      tooltip.className = "floating-tooltip";
      tooltip.hidden = true;
      modal.appendChild(tooltip);

      let visible = false;
      let revealTooltipRafId = 0;
      const TOOLTIP_TOKEN_PATTERN = /(\[[^\]]+\]|\b\d+%?\b)/g;

      const renderTooltipContent = (rawText) => {
        const text = String(rawText || "").trim();
        tooltip.textContent = "";
        if (!text) return;

        const fragment = document.createDocumentFragment();
        const parts = text.split(TOOLTIP_TOKEN_PATTERN);
        parts.forEach((part) => {
          if (!part) return;
          const shortcutMatch = part.match(/^\[([^\]]+)\]$/);
          if (shortcutMatch) {
            const pill = document.createElement("span");
            pill.className = "floating-tooltip-pill floating-tooltip-pill-shortcut";
            pill.textContent = String(shortcutMatch[1] || "").trim();
            fragment.appendChild(pill);
            return;
          }
          if (/^\d+%?$/.test(part)) {
            const pill = document.createElement("span");
            pill.className = "floating-tooltip-pill floating-tooltip-pill-value";
            pill.textContent = part;
            fragment.appendChild(pill);
            return;
          }
          fragment.appendChild(document.createTextNode(part));
        });
        tooltip.appendChild(fragment);
      };

      const hideTooltip = () => {
        if (revealTooltipRafId) {
          global.cancelAnimationFrame(revealTooltipRafId);
          revealTooltipRafId = 0;
        }
        visible = false;
        tooltip.classList.remove("is-visible");
        tooltip.hidden = true;
        tooltip.textContent = "";
        tooltip.style.transform = "translate3d(-9999px, -9999px, 0)";
      };

      const positionTooltip = (clientX, clientY) => {
        const gap = 14;
        const vw = global.innerWidth || document.documentElement.clientWidth || 0;
        const vh = global.innerHeight || document.documentElement.clientHeight || 0;
        const rect = tooltip.getBoundingClientRect();
        let left = clientX + gap;
        let top = clientY + gap;
        if (left + rect.width > vw - 8) left = Math.max(8, clientX - rect.width - gap);
        if (top + rect.height > vh - 8) top = Math.max(8, clientY - rect.height - gap);
        tooltip.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
      };

      const showTooltip = (target, clientX, clientY) => {
        if (!target || !(target instanceof Element)) {
          hideTooltip();
          return;
        }
        const text = String(target.dataset.tooltip || "").trim();
        if (!text) {
          hideTooltip();
          return;
        }
        renderTooltipContent(text);
        if (tooltip.hidden) {
          tooltip.hidden = false;
          tooltip.classList.remove("is-visible");
        }
        positionTooltip(clientX, clientY);
        if (!visible) {
          visible = true;
          if (revealTooltipRafId) {
            global.cancelAnimationFrame(revealTooltipRafId);
            revealTooltipRafId = 0;
          }
          revealTooltipRafId = global.requestAnimationFrame(() => {
            revealTooltipRafId = 0;
            if (!visible) return;
            tooltip.classList.add("is-visible");
          });
          return;
        }
        if (!tooltip.classList.contains("is-visible")) {
          tooltip.classList.add("is-visible");
        }
      };

      const onPointerMove = (event) => {
        if (!event || event.pointerType === "touch") {
          hideTooltip();
          return;
        }
        const target = event.target && typeof event.target.closest === "function"
          ? event.target.closest("[data-tooltip]")
          : null;
        if (!target || !shadow.contains(target)) {
          hideTooltip();
          return;
        }
        showTooltip(target, event.clientX, event.clientY);
      };

      const onPointerDown = () => hideTooltip();
      const onScroll = () => hideTooltip();
      const onLeave = () => hideTooltip();

      shadow.addEventListener("pointermove", onPointerMove, true);
      shadow.addEventListener("pointerdown", onPointerDown, true);
      shadow.addEventListener("wheel", onScroll, { passive: true, capture: true });
      shadow.addEventListener("pointerleave", onLeave, true);
      global.addEventListener("scroll", onScroll, true);

      return () => {
        shadow.removeEventListener("pointermove", onPointerMove, true);
        shadow.removeEventListener("pointerdown", onPointerDown, true);
        shadow.removeEventListener("wheel", onScroll, true);
        shadow.removeEventListener("pointerleave", onLeave, true);
        global.removeEventListener("scroll", onScroll, true);
        hideTooltip();
        tooltip.remove();
      };
    };
    cleanupFloatingTooltip = setupFloatingTooltip();

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
      if (reducedMotionPreference && onReducedMotionChange) {
        if (typeof reducedMotionPreference.removeEventListener === "function") {
          reducedMotionPreference.removeEventListener("change", onReducedMotionChange);
        } else if (typeof reducedMotionPreference.removeListener === "function") {
          reducedMotionPreference.removeListener(onReducedMotionChange);
        }
        onReducedMotionChange = null;
      }
      if (onWindowResize) {
        global.removeEventListener("resize", onWindowResize);
        onWindowResize = null;
      }
      if (pageHeightRafId) {
        global.cancelAnimationFrame(pageHeightRafId);
        pageHeightRafId = 0;
      }
      if (settingsAnchorScrollRafId) {
        global.cancelAnimationFrame(settingsAnchorScrollRafId);
        settingsAnchorScrollRafId = 0;
      }
      if (previewRafId) {
        global.cancelAnimationFrame(previewRafId);
        previewRafId = 0;
      }
      if (settingsPageScrollHost && onSettingsPageScroll) {
        settingsPageScrollHost.removeEventListener("scroll", onSettingsPageScroll);
        onSettingsPageScroll = null;
      }
      if (physicsController && typeof physicsController.cleanup === "function") {
        physicsController.cleanup();
      }
      if (toastHideTimer) {
        global.clearTimeout(toastHideTimer);
        toastHideTimer = 0;
      }
      if (unbindLofiButton) {
        unbindLofiButton();
        unbindLofiButton = null;
      }
      if (cleanupFloatingTooltip) {
        cleanupFloatingTooltip();
        cleanupFloatingTooltip = null;
      }
      if (app._lofiController) {
        if (typeof app._lofiController.modalExit === "function") {
          app._lofiController.modalExit();
        } else if (typeof app._lofiController.pause === "function") {
          app._lofiController.pause();
        }
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

    const isTextEditingElement = (element) => {
      if (!element || !(element instanceof Element)) return false;
      if (element.closest('[contenteditable="true"]')) return true;
      const tagName = String(element.tagName || "").toLowerCase();
      if (tagName === "textarea") return true;
      if (tagName !== "input") return false;
      const type = String(element.getAttribute("type") || "text").toLowerCase();
      const textLikeTypes = new Set([
        "text",
        "search",
        "url",
        "tel",
        "email",
        "password",
        "number"
      ]);
      return textLikeTypes.has(type);
    };

    const isInteractiveControlElement = (element) => {
      if (!element || !(element instanceof Element)) return false;
      const control = element.closest(
        "input, textarea, select, button, [role='switch'], [role='slider'], [role='combobox'], [contenteditable='true']"
      );
      return Boolean(control);
    };

    const toggleLofiFromShortcut = () => {
      if (!lofiToggleBtn || lofiToggleBtn.disabled) return;
      const controller = getLofiController();
      if (!controller || typeof controller.toggle !== "function") return;
      controller.toggle();
    };

    const stopKeys = (e) => {
      if (!isPopoverOpen(modal)) return;
      e.stopPropagation();
      const focused = shadow.activeElement || document.activeElement;
      const focusIsInteractive = isInteractiveControlElement(focused);
      const focusIsText = isTextEditingElement(focused);

      if (e.key === "/") {
        if (focused === triggerTextInput) {
          e.stopPropagation();
          showTriggerSlashError();
          syncActivePageHeight();
          e.preventDefault();
        }
        return;
      }

      if (e.key === "Escape") {
        e.stopPropagation();
        if (draftsReplaceConfirmBackdrop && !draftsReplaceConfirmBackdrop.hidden) {
          e.preventDefault();
          closeDraftReplaceConfirm();
          return;
        }
        if (draftsConfirmBackdrop && !draftsConfirmBackdrop.hidden) {
          e.preventDefault();
          closeDraftDeleteConfirm();
          return;
        }
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        if (e.type !== "keydown") return;
        if (focusIsInteractive) return;
        e.stopPropagation();
        e.preventDefault();
        commitModalSettings({ sidebarCollapsed: !settingsState.sidebarCollapsed });
        return;
      }

      if ((e.key === " " || e.key === "Spacebar") && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.type !== "keydown") return;
        if (focusIsText || focusIsInteractive) return;
        e.stopPropagation();
        e.preventDefault();
        toggleLofiFromShortcut();
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
        setElementTooltip(sw, toDisplayLabel(name));
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

    const positionPopoverNearTrigger = (popover, trigger, alignment = "start") => {
      if (!popover || !trigger) return;
      const rect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportWidth = global.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = global.innerHeight || document.documentElement.clientHeight || 0;

      let left = rect.left;
      if (alignment === "end") {
        left = rect.right - popoverRect.width;
      } else if (alignment === "center") {
        left = rect.left + (rect.width - popoverRect.width) / 2;
      }

      left = Math.max(8, Math.min(left, viewportWidth - popoverRect.width - 8));

      let top = rect.bottom + 8;
      if (top + popoverRect.height > viewportHeight - 8) {
        top = Math.max(8, rect.top - popoverRect.height - 8);
      }

      popover.style.position = "fixed";
      popover.style.left = `${Math.round(left)}px`;
      popover.style.top = `${Math.round(top)}px`;
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

    const showToast = (message, tone = "success") => {
      if (!modalToast) return;
      modalToast.textContent = String(message || "");
      modalToast.setAttribute("data-tone", tone);
      modalToast.hidden = false;
      modalToast.classList.add("is-visible");
      if (toastHideTimer) global.clearTimeout(toastHideTimer);
      toastHideTimer = global.setTimeout(() => {
        modalToast.classList.remove("is-visible");
        modalToast.hidden = true;
        toastHideTimer = 0;
      }, 1800);
    };

    const bindLofiToggle = () => {
      if (!lofiToggleBtn) return () => {};
      const controller = getLofiController();
      const iconNode = lofiToggleBtn.querySelector(".material-symbols-outlined");
      const updateUi = (snapshot) => {
        const isPlaying = Boolean(snapshot && snapshot.playing);
        const isFailed = Boolean(snapshot && snapshot.failed);
        const volume = snapshot && Number.isFinite(snapshot.volume) ? snapshot.volume : 0.35;
        const volumePercent = Math.round(volume * 100);
        lofiToggleBtn.disabled = isFailed;
        lofiToggleBtn.classList.toggle("is-playing", isPlaying && !isFailed);
        if (lofiVolumeInput) {
          lofiVolumeInput.disabled = isFailed;
          lofiVolumeInput.value = String(volumePercent);
          const volumeLabel = `Lo-fi volume ${volumePercent}%`;
          setElementTooltip(lofiVolumeInput, volumeLabel);
          lofiVolumeInput.setAttribute("aria-label", volumeLabel);
        }
        if (iconNode) {
          iconNode.textContent = isFailed ? "wifi_off" : (isPlaying ? "pause" : "play_arrow");
        }
        const title = isFailed
          ? `${snapshot.disabledReason || "Stream unavailable"}`
          : `${isPlaying ? "Pause/Play music [Space]" : "Pause/Play music [Space]"} (when not typing)`;
        setElementTooltip(lofiToggleBtn, title);
        lofiToggleBtn.setAttribute("aria-label", title);
      };
      const unsubscribe = controller.subscribe(updateUi);
      const onToggleClick = () => {
        controller.toggle();
      };
      const onVolumeInput = () => {
        if (!lofiVolumeInput) return;
        const value = clampNumber(lofiVolumeInput.value, 0, 100, 35) / 100;
        controller.setVolume(value);
      };
      lofiToggleBtn.addEventListener("click", onToggleClick);
      if (lofiVolumeInput) {
        lofiVolumeInput.addEventListener("input", onVolumeInput);
      }
      if (settingsState.musicAutoplay !== false) {
        if (typeof controller.modalEnter === "function") {
          controller.modalEnter({ autoplay: true });
        } else {
          controller.maybeAutoplay();
        }
      } else {
        controller.pause();
      }
      controller.setPlaybackTuning({
        speedRate: settingsState.lofiSpeedRate,
        pitchRate: settingsState.lofiPitchRate,
        ratePitchSync: settingsState.lofiRatePitchSync
      });
      return () => {
        lofiToggleBtn.removeEventListener("click", onToggleClick);
        if (lofiVolumeInput) {
          lofiVolumeInput.removeEventListener("input", onVolumeInput);
        }
        unsubscribe();
      };
    };

    const syncCopyMenuState = () => {
      copyMenuItems.forEach((item) => {
        const isActive = item.getAttribute("data-copy-format") === activeCopyFormat;
        item.classList.toggle("is-active", isActive);
      });
    };

    const syncCopyMainButton = () => {
      const config = COPY_FORMATS[activeCopyFormat] || COPY_FORMATS["inner-html"];
      copyMainBtn.setAttribute("data-copy-format", activeCopyFormat);
      setElementTooltip(copyMainBtn, config.label);
      const iconNode = copyMainBtn.querySelector(".material-symbols-outlined");
      const labelNode = copyMainBtn.querySelector("span:last-child");
      if (iconNode) iconNode.textContent = config.icon;
      if (labelNode) labelNode.textContent = config.label;
      syncCopyMenuState();
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
    const TRIGGER_MODIFIER_PATTERN = /(^|[\s+_-])(ctrl|control|alt|shift|meta|cmd|command|option)([\s+_-]|$)/i;
    const TRIGGER_SHIFT_REQUIRED_CHAR_PATTERN = /[A-Z~!@#$%^&*()_+{}|:"<>?]/;

    const syncTriggerFieldState = () => {
      if (!triggerTextInput) return { isValid: true, normalized: DEFAULT_TRIGGER_TEXT };

      const raw = String(triggerTextInput.value || "");
      const hasSlash = raw.includes("/");
      const hasSpace = /\s/.test(raw);
      const hasComboKey = TRIGGER_MODIFIER_PATTERN.test(raw) || raw.includes("+");
      const hasShiftRequiredChars = TRIGGER_SHIFT_REQUIRED_CHAR_PATTERN.test(raw);
      const sanitized = normalizeTriggerText(raw);
      const normalized = sanitized || DEFAULT_TRIGGER_TEXT;
      const isRequiredMissing = sanitized.length === 0;
      const shortTriggerWarning = sanitized.length > 0 && sanitized.replace(/\s+/g, "").length < 3;
      const isValid = !(isRequiredMissing || hasSlash || hasSpace || hasComboKey || hasShiftRequiredChars);
      const message = isRequiredMissing
        ? "Trigger text is required."
        : hasSlash
          ? "Slash / is not allowed because it interferes with ClickUp default keybinds."
          : hasSpace
            ? "Spaces are not allowed in trigger text."
        : hasComboKey
          ? "Modifier/combo keys (Ctrl, Alt, Shift, Meta, +) are not allowed for trigger text."
          : hasShiftRequiredChars
            ? "Shift-required characters (like @, _, +, ?, uppercase letters) are not allowed for trigger text."
          : "";

      if (triggerTextError) {
        triggerTextError.hidden = isValid;
        if (!isValid) triggerTextError.textContent = message;
      }
      if (triggerTextWarning) {
        triggerTextWarning.hidden = !isValid || !shortTriggerWarning;
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

    const copyTextToClipboard = async (text) => {
      const value = String(text || "");
      if (!value) return false;

      if (global.navigator && global.navigator.clipboard && typeof global.navigator.clipboard.writeText === "function") {
        try {
          await global.navigator.clipboard.writeText(value);
          return true;
        } catch {
          // Fallback below.
        }
      }

      try {
        const ta = document.createElement("textarea");
        ta.value = value;
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

    const buildRawText = (data) => {
      const headingText = data.appendNumberSuffix === false
        ? data.label
        : `${data.label} ${data.number}`.trim();
      const lines = [`${headingText}`, "", `Status: ${data.status}`, ""];

      const appendSection = (title, items, required = false) => {
        if (!required && (!items || items.length === 0)) return;
        lines.push(`${title}:`);
        if (!items || items.length === 0) {
          lines.push("(none)");
        } else {
          items.forEach((item) => lines.push(`- ${item}`));
        }
        lines.push("");
      };

      appendSection("Accomplishments", data.accomplishments, true);
      appendSection("Blockers", data.blockers, false);
      appendSection("Current Focus", data.focus, false);
      appendSection("Notes", data.notes, false);
      appendSection("Files", [], true);
      appendSection("Mentions", [], true);

      return lines.join("\n").trim();
    };

    const buildMarkdown = (data) => {
      const headingText = data.appendNumberSuffix === false
        ? data.label
        : `${data.label} ${data.number}`.trim();
      const lines = [`## ${headingText}`, "", `**Status:** ${data.status}`, ""];

      const appendSection = (title, items, required = false) => {
        if (!required && (!items || items.length === 0)) return;
        lines.push(`### ${title}`);
        if (!items || items.length === 0) {
          lines.push("- ");
        } else {
          items.forEach((item) => lines.push(`- ${item}`));
        }
        lines.push("");
      };

      appendSection("Accomplishments", data.accomplishments, true);
      appendSection("Blockers", data.blockers, false);
      appendSection("Current Focus", data.focus, false);
      appendSection("Notes", data.notes, false);
      appendSection("Files", [], true);
      appendSection("Mentions", [], true);

      return lines.join("\n").trim();
    };

    const extractRemoteVersion = (scriptText) => {
      const match = String(scriptText || "").match(/@version\s+([^\r\n]+)/i);
      return match ? String(match[1]).trim() : "";
    };

    const normalizeSemver = (version) => {
      const cleaned = String(version || "").trim().replace(/^v/i, "");
      const [main, pre = ""] = cleaned.split("-", 2);
      const parts = main.split(".").map((n) => parseInt(n, 10));
      return {
        main: [
          Number.isFinite(parts[0]) ? parts[0] : 0,
          Number.isFinite(parts[1]) ? parts[1] : 0,
          Number.isFinite(parts[2]) ? parts[2] : 0
        ],
        pre
      };
    };

    const compareVersions = (left, right) => {
      const a = normalizeSemver(left);
      const b = normalizeSemver(right);
      for (let i = 0; i < 3; i += 1) {
        if (a.main[i] > b.main[i]) return 1;
        if (a.main[i] < b.main[i]) return -1;
      }
      if (a.pre && !b.pre) return -1;
      if (!a.pre && b.pre) return 1;
      if (a.pre > b.pre) return 1;
      if (a.pre < b.pre) return -1;
      return 0;
    };

    const openUpdatePopup = (url) => {
      if (!url) return false;
      const popup = global.open(
        url,
        "clickup-update-modal-update",
        "popup=yes,width=1060,height=760,toolbar=yes,location=yes,status=yes,menubar=no,scrollbars=yes,resizable=yes"
      );
      if (!popup) return false;
      try {
        popup.focus();
      } catch {
        // Best-effort focus.
      }
      return true;
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
        insertBtn.removeAttribute("title");
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
      notesInput.value = notesText;
      setNotesState(false);

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

    const getDraftById = (draftId) => draftsState.find((draft) => draft.id === draftId) || null;

    const getInsertDataFromDraft = (draft) => {
      const safeDraft = normalizeDraft(draft);
      return {
        label: String(safeDraft.label || "DESIGN UPDATE").trim().toUpperCase(),
        number: String(safeDraft.number || "01").trim() || "01",
        appendNumberSuffix: safeDraft.appendNumberSuffix !== false,
        status: String(safeDraft.status || "In Progress"),
        accomplishments: splitLines(String(safeDraft.accomplishmentsText || "")),
        blockers: splitLines(String(safeDraft.blockersText || "")),
        focus: splitLines(String(safeDraft.focusText || "")),
        notes: splitLines(String(safeDraft.notesText || "")),
        colorVisionMode: settingsState.colorVisionMode,
        bannerColor: safeDraft.bannerColor || defaultBannerColor
      };
    };

    const defaultEditorValues = Object.freeze({
      label: String(labelInput.value || "").trim(),
      number: String(numberInput.value || "").trim(),
      appendNumberSuffix: Boolean(appendNumberInput && appendNumberInput.checked),
      status: String(statusInput.value || "").trim(),
      bannerColor: selected
    });

    const hasEditorContent = () => {
      const labelValue = String(labelInput.value || "").trim();
      const numberValue = String(numberInput.value || "").trim();
      const statusValue = String(statusInput.value || "").trim();
      const bannerValue = String(selected || "").trim();

      if (labelValue && labelValue !== defaultEditorValues.label) return true;
      if (numberValue && numberValue !== defaultEditorValues.number) return true;
      if (Boolean(appendNumberInput && appendNumberInput.checked) !== defaultEditorValues.appendNumberSuffix) return true;
      if (statusValue && statusValue !== defaultEditorValues.status) return true;
      if (bannerValue && bannerValue !== defaultEditorValues.bannerColor) return true;

      if (String(accInput.value || "").trim()) return true;
      if (String(blockInput.value || "").trim()) return true;
      if (String(focusInput.value || "").trim()) return true;
      if (String(notesInput && notesInput.value || "").trim()) return true;
      if (notesGroup && !notesGroup.hidden) return true;
      return false;
    };

    const loadDraftIntoEditor = (draft) => {
      fillFormFromDraft(draft);
      setActionFeedback(`Draft loaded (${draft.id.slice(0, 8)}).`, "success");
      commitModalSettings({ activePage: "editor" });
    };

    const closeDraftDeleteConfirm = () => {
      if (!draftsConfirmBackdrop) return;
      draftsConfirmBackdrop.hidden = true;
      pendingDeleteDraftIds = [];
    };

    const openDraftDeleteConfirm = (draftIds) => {
      if (!draftsConfirmBackdrop || !draftsConfirmMessage) return;
      const uniqueIds = Array.from(new Set(draftIds.filter(Boolean)));
      if (!uniqueIds.length) return;
      pendingDeleteDraftIds = uniqueIds;
      draftsConfirmMessage.textContent = uniqueIds.length === 1
        ? "Delete this draft permanently?"
        : `Delete ${uniqueIds.length} drafts permanently?`;
      draftsConfirmBackdrop.hidden = false;
    };

    const closeDraftReplaceConfirm = () => {
      if (!draftsReplaceConfirmBackdrop) return;
      draftsReplaceConfirmBackdrop.hidden = true;
      pendingReplaceDraftId = "";
    };

    const openDraftReplaceConfirm = (draftId) => {
      if (!draftsReplaceConfirmBackdrop || !draftId) return;
      pendingReplaceDraftId = draftId;
      draftsReplaceConfirmBackdrop.hidden = false;
    };

    const syncDraftSelectionUi = () => {
      const allIds = draftsState.map((draft) => draft.id);
      selectedDraftIds = new Set(Array.from(selectedDraftIds).filter((id) => allIds.includes(id)));
      const selectedCount = selectedDraftIds.size;
      const allCount = allIds.length;

      if (draftsSelectAll) {
        draftsSelectAll.checked = allCount > 0 && selectedCount === allCount;
        draftsSelectAll.indeterminate = selectedCount > 0 && selectedCount < allCount;
      }

      if (draftsSelectedCount) {
        draftsSelectedCount.textContent = String(selectedCount);
      }

      if (draftsBulkActions) {
        draftsBulkActions.hidden = selectedCount <= 0;
      }
    };

    const renderDrafts = () => {
      if (!draftsList) return;
      draftsList.innerHTML = "";
      selectedDraftIds = new Set(Array.from(selectedDraftIds).filter((id) => getDraftById(id)));

      if (!draftsState.length) {
        if (draftsEmpty) draftsEmpty.hidden = false;
        if (draftsTable) draftsTable.hidden = true;
        if (draftsBulkActions) draftsBulkActions.hidden = true;
        syncDraftSelectionUi();
        return;
      }
      if (draftsEmpty) draftsEmpty.hidden = true;
      if (draftsTable) draftsTable.hidden = false;

      draftsState.forEach((draft) => {
        const row = document.createElement("div");
        row.className = "draft-row";
        row.setAttribute("data-draft-id", draft.id);

        const selectWrap = document.createElement("label");
        selectWrap.className = "draft-row-select";
        setElementTooltip(selectWrap, "Select draft");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "draft-row-checkbox";
        checkbox.checked = selectedDraftIds.has(draft.id);
        selectWrap.appendChild(checkbox);

        const mainBtn = document.createElement("button");
        mainBtn.type = "button";
        mainBtn.className = "draft-row-main";
        const title = document.createElement("span");
        title.className = "draft-row-title";
        title.textContent = draft.label || "Untitled Draft";
        const meta = document.createElement("span");
        meta.className = "draft-row-meta";
        const numberMeta = draft.appendNumberSuffix ? `#${draft.number || "01"}` : "No suffix";
        meta.textContent = `${draft.status || "In Progress"} - ${numberMeta}`;
        const date = document.createElement("span");
        date.className = "draft-row-date";
        date.textContent = formatDraftDateTime(draft.createdAt);
        mainBtn.appendChild(title);
        mainBtn.appendChild(meta);
        mainBtn.appendChild(date);

        const actions = document.createElement("div");
        actions.className = "draft-row-actions";
        const shareBtn = document.createElement("button");
        shareBtn.type = "button";
        shareBtn.className = "draft-row-icon-btn";
        setElementTooltip(shareBtn, "Share (copy innerHTML)");
        shareBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">ios_share</span>";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "draft-row-icon-btn draft-row-icon-btn-danger";
        setElementTooltip(deleteBtn, "Delete");
        deleteBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">delete</span>";

        actions.appendChild(shareBtn);
        actions.appendChild(deleteBtn);

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedDraftIds.add(draft.id);
          } else {
            selectedDraftIds.delete(draft.id);
          }
          syncDraftSelectionUi();
        });

        mainBtn.addEventListener("click", () => {
          if (hasEditorContent()) {
            openDraftReplaceConfirm(draft.id);
            return;
          }
          loadDraftIntoEditor(draft);
        });

        shareBtn.addEventListener("click", async (event) => {
          event.stopPropagation();
          if (typeof buildHTML !== "function") return;
          const html = buildHTML(getInsertDataFromDraft(draft));
          const copied = await copyInnerHtmlToClipboard(html);
          if (copied) {
            showToast("Copied to clipboard.", "success");
          } else {
            showToast("Copy failed.", "error");
          }
        });

        deleteBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          openDraftDeleteConfirm([draft.id]);
        });

        row.appendChild(selectWrap);
        row.appendChild(mainBtn);
        row.appendChild(actions);
        draftsList.appendChild(row);
      });

      syncDraftSelectionUi();
      syncActivePageHeight();
    };

    const setSettingsAnchorActiveState = (sectionId = "") => {
      settingsAnchorButtons.forEach((button) => {
        const target = String(button.getAttribute("data-settings-anchor-target") || "").trim();
        const isActive = target && target === sectionId;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const syncSettingsAnchorByScroll = () => {
      if (!settingsPageScrollHost || settingsState.activePage !== "settings") return;
      const hostRect = settingsPageScrollHost.getBoundingClientRect();
      const topOffset = hostRect.top + 18;
      let activeSectionId = "";

      settingsAnchorButtons.forEach((button, index) => {
        const target = String(button.getAttribute("data-settings-anchor-target") || "").trim();
        if (!target) return;
        const sectionEl = byId(target);
        if (!sectionEl) return;
        const sectionTop = sectionEl.getBoundingClientRect().top;
        if (sectionTop <= topOffset || index === 0) {
          activeSectionId = target;
        }
      });

      if (!activeSectionId && settingsAnchorButtons[0]) {
        activeSectionId = String(settingsAnchorButtons[0].getAttribute("data-settings-anchor-target") || "").trim();
      }
      setSettingsAnchorActiveState(activeSectionId);
    };

    const scrollToSettingsSection = (sectionId) => {
      if (!sectionId) return;
      const scrollHost = settingsPageScrollHost;
      const targetSection = byId(sectionId);
      if (!scrollHost || !targetSection) return;
      const scrollRect = scrollHost.getBoundingClientRect();
      const targetRect = targetSection.getBoundingClientRect();
      const offset = (targetRect.top - scrollRect.top) + scrollHost.scrollTop - 8;
      scrollHost.scrollTo({
        top: Math.max(0, offset),
        behavior: "smooth"
      });
      setSettingsAnchorActiveState(sectionId);
    };

    const stabilizeSettingsScroll = () => {
      if (!settingsPageScrollHost || settingsState.activePage !== "settings") return;
      const scrollHost = settingsPageScrollHost;
      const clampScrollTop = () => {
        if (!scrollHost || !scrollHost.isConnected) return;
        const maxScrollTop = Math.max(0, scrollHost.scrollHeight - scrollHost.clientHeight);
        if (scrollHost.scrollTop > maxScrollTop) {
          scrollHost.scrollTop = maxScrollTop;
        }
      };

      clampScrollTop();
      global.requestAnimationFrame(() => {
        clampScrollTop();
        global.requestAnimationFrame(() => {
          clampScrollTop();
        });
      });
      global.setTimeout(clampScrollTop, 180);
    };

    const setPageSelection = () => {
      const activePage = PAGE_OPTIONS.has(settingsState.activePage)
        ? settingsState.activePage
        : DEFAULT_MODAL_SETTINGS.activePage;
      settingsState.activePage = activePage;

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

      // Safety net: never allow a state where all panels are hidden.
      const hasVisiblePanel = pagePanels.some((panel) => !panel.hidden);
      if (!hasVisiblePanel) {
        const fallbackPage = DEFAULT_MODAL_SETTINGS.activePage;
        const fallbackPanel = pagePanels.find(
          (panel) => String(panel.getAttribute("data-page") || "").trim() === fallbackPage
        ) || pagePanels[0];
        const fallbackValue = fallbackPanel
          ? String(fallbackPanel.getAttribute("data-page") || "").trim()
          : fallbackPage;
        settingsState.activePage = fallbackValue || fallbackPage;
        pagePanels.forEach((panel) => {
          const page = String(panel.getAttribute("data-page") || "").trim();
          const isActive = page === settingsState.activePage;
          panel.hidden = !isActive;
          panel.classList.toggle("is-active", isActive);
        });
        pageButtons.forEach((button) => {
          const page = String(button.getAttribute("data-page-target") || "").trim();
          const isActive = page === settingsState.activePage;
          button.classList.toggle("is-active", isActive);
          if (isActive) {
            button.setAttribute("aria-current", "page");
          } else {
            button.removeAttribute("aria-current");
          }
        });
      }

      if (activePage === "drafts") {
        renderDrafts();
      }
      if (settingsAnchorRail) {
        settingsAnchorRail.setAttribute("aria-hidden", activePage === "settings" ? "false" : "true");
      }
      if (activePage === "settings") {
        syncSettingsAnchorByScroll();
      }
      syncActivePageHeight();
    };

    const getResolvedTheme = () => {
      if (settingsState.theme === "auto") {
        return systemColorScheme && systemColorScheme.matches ? "dark" : "light";
      }
      return settingsState.theme;
    };

    const getAccentHueRotation = () => (
      COLOR_VISION_ACCENT_HUE_ROTATION[settingsState.colorVisionMode] || 0
    );

    const getBaseAccentHue = () => {
      if (settingsState.accentPreset === "custom") {
        return Math.round(clampNumber(settingsState.accentHue, 0, 360, DEFAULT_ACCENT_HUE));
      }
      return ACCENT_PRESETS[settingsState.accentPreset] || DEFAULT_ACCENT_HUE;
    };

    const getResolvedAccentHue = () => {
      const baseHue = getBaseAccentHue();
      const rotated = (baseHue + getAccentHueRotation()) % 360;
      return Math.round(rotated < 0 ? rotated + 360 : rotated);
    };

    const syncAccentSettingUi = (resolvedHue) => {
      accentPresetButtons.forEach((button) => {
        const preset = String(button.getAttribute("data-accent-preset") || "").trim();
        const isActive = preset === settingsState.accentPreset;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      if (accentCustomTrigger) {
        accentCustomTrigger.classList.toggle("is-active", settingsState.accentPreset === "custom");
      }

      if (accentHueSlider) {
        accentHueSlider.value = String(Math.round(resolvedHue));
      }
      if (accentHueWheel) {
        accentHueWheel.setAttribute("aria-valuenow", String(Math.round(resolvedHue)));
        accentHueWheel.setAttribute("aria-valuetext", `${Math.round(resolvedHue)}°`);
      }
      if (accentHueValue) {
        accentHueValue.textContent = `${Math.round(resolvedHue)}°`;
      }
      if (accentCustomPreview) {
        accentCustomPreview.style.setProperty("--accent-custom-hue", String(Math.round(resolvedHue)));
        accentCustomPreview.style.background = `oklch(0.66 0.19 ${Math.round(resolvedHue)})`;
      }
      if (accentHueThumb) {
        const radians = (resolvedHue * Math.PI) / 180;
        const radius = 63;
        const offsetX = Math.cos(radians) * radius;
        const offsetY = Math.sin(radians) * radius;
        accentHueThumb.style.transform = `translate(calc(-50% + ${offsetX.toFixed(2)}px), calc(-50% + ${offsetY.toFixed(2)}px))`;
        accentHueThumb.style.background = `oklch(0.66 0.19 ${Math.round(resolvedHue)})`;
      }
    };

    const getMotionScale = () => {
      const preset = Math.round(clampNumber(settingsState.animationSpeed, ANIMATION_SPEED_MIN, ANIMATION_SPEED_MAX, 2));
      const followDevice = settingsState.animationFollowDevice !== false;
      const deviceReduced = Boolean(reducedMotionPreference && reducedMotionPreference.matches);
      const scale = ANIMATION_SPEED_SCALES[preset] == null ? 1 : ANIMATION_SPEED_SCALES[preset];
      if (scale <= 0) return 0;
      if (followDevice && deviceReduced) return Math.min(scale, REDUCED_MOTION_SCALE_CAP);
      return scale;
    };

    const getEstimatedLofiBpm = () => {
      const controller = app._lofiController;
      if (controller && typeof controller.getEstimatedBpm === "function") {
        return clampNumber(controller.getEstimatedBpm(), 55, 180, BASE_LOFI_BPM);
      }
      return clampNumber(BASE_LOFI_BPM * settingsState.lofiSpeedRate, 55, 180, BASE_LOFI_BPM);
    };

    const getSyncedPhysicsBpm = () => {
      const bpm = getEstimatedLofiBpm() + clampNumber(
        settingsState.physicsBpmOffset,
        PHYSICS_BPM_OFFSET_MIN,
        PHYSICS_BPM_OFFSET_MAX,
        DEFAULT_MODAL_SETTINGS.physicsBpmOffset
      );
      return clampNumber(bpm, 55, 180, BASE_LOFI_BPM);
    };

    const getEffectivePhysicsIntensity = () => {
      if (settingsState.physicsSyncToMusic === true) {
        const bpm = getSyncedPhysicsBpm();
        const normalized = Math.max(0, Math.min(1, (bpm - 55) / (180 - 55)));
        return Math.round(18 + (normalized * 82));
      }
      return clampNumber(
        settingsState.physicsIntensity,
        PHYSICS_INTENSITY_MIN,
        PHYSICS_INTENSITY_MAX,
        DEFAULT_MODAL_SETTINGS.physicsIntensity
      );
    };

    const getPhysicsStrength = () => {
      if (settingsState.physicsEnabled === false) return 0;
      const base = getEffectivePhysicsIntensity() / 100;
      const motionScale = getMotionScale();
      if (motionScale <= 0) return 0;
      return base * Math.max(0.35, Math.min(1.45, motionScale));
    };

    const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
    const lerp = (a, b, t) => a + ((b - a) * t);
    const cubicBezierY = (t, p1y, p2y) => {
      const u = 1 - t;
      return (3 * u * u * t * p1y) + (3 * u * t * t * p2y) + (t * t * t);
    };

    const buildCurveControlPoints = () => {
      const curve = settingsState.interpolatorCurve || DEFAULT_INTERPOLATOR_CURVE;
      const customPoints = Array.isArray(settingsState.interpolatorCurvePoints)
        ? settingsState.interpolatorCurvePoints
        : [];
      const controls = [
        { x: 0, y: 0, id: "start", type: "endpoint" },
        { x: clamp01(curve.p1x), y: clamp01(curve.p1y), id: "p1", type: "handle" },
        { x: clamp01(curve.p2x), y: clamp01(curve.p2y), id: "p2", type: "handle" },
        ...customPoints.map((point, index) => ({
          x: clampNumber(point.x, 0.02, 0.98, 0.5),
          y: clamp01(point.y),
          id: `custom-${index}`,
          type: "custom",
          customIndex: index
        })),
        { x: 1, y: 1, id: "end", type: "endpoint" }
      ];
      return controls;
    };

    const evaluateBezierPoint = (controls, t) => {
      const x = clamp01(t);
      const working = controls.map((point) => ({ x: point.x, y: point.y }));
      for (let level = 1; level < working.length; level += 1) {
        for (let i = 0; i < working.length - level; i += 1) {
          working[i] = {
            x: lerp(working[i].x, working[i + 1].x, x),
            y: lerp(working[i].y, working[i + 1].y, x)
          };
        }
      }
      return working[0] || { x: x, y: x };
    };

    const getCurvePointFromClient = (clientX, clientY) => {
      if (!curveEditorCanvas) return null;
      const rect = curveEditorCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const x = clamp01((clientX - rect.left) / rect.width);
      const y = clamp01(1 - ((clientY - rect.top) / rect.height));
      return { x, y };
    };

    const findBezierParameterByX = (controls, targetX) => {
      let low = 0;
      let high = 1;
      let mid = clamp01(targetX);
      for (let i = 0; i < 18; i += 1) {
        mid = (low + high) / 2;
        const point = evaluateBezierPoint(controls, mid);
        if (point.x < targetX) {
          low = mid;
        } else {
          high = mid;
        }
      }
      return (low + high) / 2;
    };

    const commitCustomCurvePoints = (points) => {
      const normalized = (Array.isArray(points) ? points : [])
        .map((point) => ({
          x: clampNumber(point && point.x, 0.02, 0.98, NaN),
          y: clampNumber(point && point.y, 0, 1, NaN)
        }))
        .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
        .sort((a, b) => a.x - b.x)
        .slice(0, MAX_CUSTOM_CURVE_POINTS);
      commitModalSettings({ interpolatorCurvePoints: normalized });
    };

    const getStopMotionFrame = (t) => {
      const frameCount = Math.max(2, STOP_MOTION_STEPS);
      const lastFrame = frameCount - 1;
      const rawFrame = Math.min(lastFrame, Math.floor(clamp01(t) * frameCount));
      if (rawFrame <= 0 || STOP_MOTION_DROP_INTERVAL <= 1) {
        return { frame: rawFrame, lastFrame };
      }
      // Simulate dropped frames by skipping every Nth sampled frame.
      const shouldDrop = rawFrame % STOP_MOTION_DROP_INTERVAL === STOP_MOTION_DROP_INTERVAL - 1;
      const frame = shouldDrop ? Math.min(lastFrame, rawFrame + 1) : rawFrame;
      return { frame, lastFrame };
    };

    const getStopMotionCssStepCount = () => {
      const frameCount = Math.max(2, STOP_MOTION_STEPS);
      if (STOP_MOTION_DROP_INTERVAL <= 1) return frameCount;
      const droppedFrames = Math.floor((frameCount - 1) / STOP_MOTION_DROP_INTERVAL);
      return Math.max(2, frameCount - droppedFrames);
    };

    const evaluatePresetInterpolation = (preset, t) => {
      const x = clamp01(t);
      if (preset === "linear") return x;
      if (preset === "ease-in") return x * x;
      if (preset === "ease-out") return 1 - ((1 - x) * (1 - x));
      if (preset === "ease-in-out") {
        return x < 0.5 ? 2 * x * x : 1 - (Math.pow(-2 * x + 2, 2) / 2);
      }
      if (preset === "stop-motion") {
        if (x >= 1) return 1;
        const frameData = getStopMotionFrame(x);
        return frameData.lastFrame > 0 ? (frameData.frame / frameData.lastFrame) : x;
      }
      const strength = getPhysicsStrength();
      const exponent = strength < 0.66 ? 1.85 : 2.45;
      return 1 - Math.pow(1 - x, exponent);
    };

    const normalizeInterpolatorMathExpression = (expression) => {
      if (!expression) return "";
      // Math.js exposes constants like "pi"/"e". Normalize pi()/e() calls for convenience.
      return String(expression)
        .replace(/\bpi\s*\(\s*\)/gi, "pi")
        .replace(/\be\s*\(\s*\)/gi, "e");
    };

    const compileInterpolatorExpression = (expressionText) => {
      const rawExpression = String(expressionText || "").trim();
      if (!rawExpression) {
        return { fn: (t) => t, error: "Expression cannot be empty." };
      }
      const expression = normalizeInterpolatorMathExpression(rawExpression);
      const mathJs = global.math && typeof global.math.compile === "function" ? global.math : null;
      if (!mathJs) {
        return {
          fn: (t) => t,
          error: "Math.js is unavailable. Reload the page or update userscript resources."
        };
      }
      try {
        const compiled = mathJs.compile(expression);
        const scope = {
          t: 0,
          lerp: (a, b, value) => {
            const start = Number(a);
            const end = Number(b);
            const progress = clamp01(Number(value));
            return lerp(
              Number.isFinite(start) ? start : 0,
              Number.isFinite(end) ? end : 0,
              progress
            );
          },
          PI: Math.PI,
          E: Math.E
        };
        const fn = (t) => {
          scope.t = clamp01(t);
          const evaluated = Number(compiled.evaluate(scope));
          return clamp01(evaluated);
        };
        fn(0.5);
        return { fn, error: "" };
      } catch (error) {
        return {
          fn: (t) => t,
          error: error && error.message ? `Invalid expression: ${error.message}` : "Invalid expression."
        };
      }
    };

    const updateCurveEditorPath = () => {
      if (!curveEditorCanvas || !curveEditorCtx) return;
      const controls = buildCurveControlPoints();
      if (controls.length < 2) return;

      const width = curveEditorCanvas.width || 240;
      const height = curveEditorCanvas.height || 240;
      const axisColor = "rgba(140,160,190,0.42)";
      const curveColor = global.getComputedStyle(modalCard).getPropertyValue("--surface-button-primary-soft").trim() || "#4f86ff";
      const handleColor = "rgba(120,150,220,0.55)";
      const endpointColor = "rgba(195,210,235,0.9)";
      const pointColor = curveColor;
      const customPointColor = "rgba(130,180,255,0.95)";

      const toPxX = (x) => x * width;
      const toPxY = (y) => (1 - y) * height;

      curveEditorCtx.clearRect(0, 0, width, height);
      curveEditorCtx.lineWidth = 1;
      curveEditorCtx.strokeStyle = axisColor;
      curveEditorCtx.beginPath();
      curveEditorCtx.moveTo(0, height - 0.5);
      curveEditorCtx.lineTo(width, height - 0.5);
      curveEditorCtx.moveTo(0.5, 0);
      curveEditorCtx.lineTo(0.5, height);
      curveEditorCtx.stroke();

      const p1 = controls.find((point) => point.id === "p1");
      const p2 = controls.find((point) => point.id === "p2");
      if (p1 && p2) {
        curveEditorCtx.strokeStyle = handleColor;
        curveEditorCtx.setLineDash([4, 3]);
        curveEditorCtx.beginPath();
        curveEditorCtx.moveTo(0, height);
        curveEditorCtx.lineTo(toPxX(p1.x), toPxY(p1.y));
        curveEditorCtx.moveTo(toPxX(p2.x), toPxY(p2.y));
        curveEditorCtx.lineTo(width, 0);
        curveEditorCtx.stroke();
        curveEditorCtx.setLineDash([]);
      }

      curveEditorCtx.strokeStyle = curveColor;
      curveEditorCtx.lineWidth = 2;
      curveEditorCtx.beginPath();
      for (let i = 0; i <= 50; i += 1) {
        const point = evaluateBezierPoint(controls, i / 50);
        const px = toPxX(point.x);
        const py = toPxY(point.y);
        if (i === 0) curveEditorCtx.moveTo(px, py);
        else curveEditorCtx.lineTo(px, py);
      }
      curveEditorCtx.stroke();

      curveEditorHitPoints = controls.map((point) => {
        const px = toPxX(point.x);
        const py = toPxY(point.y);
        const radius = point.type === "endpoint" ? 3 : 4.5;
        curveEditorCtx.fillStyle = point.type === "endpoint"
          ? endpointColor
          : (point.type === "custom" ? customPointColor : pointColor);
        curveEditorCtx.beginPath();
        curveEditorCtx.arc(px, py, radius, 0, Math.PI * 2);
        curveEditorCtx.fill();
        return { id: point.id, type: point.type, customIndex: point.customIndex, x: px, y: py, radius };
      });
    };

    const getInterpolatorValueAt = (t) => {
      const x = clamp01(t);
      if (settingsState.interpolatorMode === "expression") {
        return clamp01(interpolatorExpressionFn(x));
      }
      if (settingsState.interpolatorMode === "curve") {
        const controls = buildCurveControlPoints();
        if (controls.length >= 4) {
          const tAtX = findBezierParameterByX(controls, x);
          return clamp01(evaluateBezierPoint(controls, tAtX).y);
        }
        const curve = settingsState.interpolatorCurve || DEFAULT_INTERPOLATOR_CURVE;
        return clamp01(cubicBezierY(x, clamp01(curve.p1y), clamp01(curve.p2y)));
      }
      return clamp01(evaluatePresetInterpolation(settingsState.interpolatorPreset, x));
    };

    const buildCssLinearInterpolator = (sampleFn) => {
      if (typeof sampleFn !== "function") return null;
      const stopCount = 18;
      const stops = [];
      for (let i = 0; i <= stopCount; i += 1) {
        const t = i / stopCount;
        const raw = Number(sampleFn(t));
        const y = clamp01(Number.isFinite(raw) ? raw : t);
        const pct = Number((t * 100).toFixed(2));
        stops.push(`${Number(y.toFixed(4))} ${pct}%`);
      }
      return `linear(${stops.join(", ")})`;
    };

    const getInterpolatorCssEase = () => {
      if (settingsState.interpolatorMode === "preset") {
        if (settingsState.interpolatorPreset === "linear") return "linear";
        if (settingsState.interpolatorPreset === "ease-in") return "cubic-bezier(0.42, 0, 1, 1)";
        if (settingsState.interpolatorPreset === "ease-out") return "cubic-bezier(0, 0, 0.58, 1)";
        if (settingsState.interpolatorPreset === "ease-in-out") return "cubic-bezier(0.42, 0, 0.58, 1)";
        if (settingsState.interpolatorPreset === "stop-motion") return `steps(${getStopMotionCssStepCount()}, end)`;
        return null;
      }
      if (settingsState.interpolatorMode === "expression") {
        const compiledExpression = compileInterpolatorExpression(settingsState.interpolatorExpression);
        if (compiledExpression.error) return null;
        return buildCssLinearInterpolator((t) => compiledExpression.fn(t));
      }
      if (settingsState.interpolatorMode === "curve") {
        const hasCustomPoints = Array.isArray(settingsState.interpolatorCurvePoints) && settingsState.interpolatorCurvePoints.length > 0;
        if (!hasCustomPoints) {
          const curve = settingsState.interpolatorCurve || DEFAULT_INTERPOLATOR_CURVE;
          return `cubic-bezier(${clamp01(curve.p1x).toFixed(3)}, ${clamp01(curve.p1y).toFixed(3)}, ${clamp01(curve.p2x).toFixed(3)}, ${clamp01(curve.p2y).toFixed(3)})`;
        }
        const controls = buildCurveControlPoints();
        if (controls.length >= 4) {
          return buildCssLinearInterpolator((x) => {
            const tAtX = findBezierParameterByX(controls, clamp01(x));
            return evaluateBezierPoint(controls, tAtX).y;
          });
        }
      }
      return null;
    };

    const getPhysicsEasingPreset = (customCssEase) => {
      const resolvedCssEase = typeof customCssEase === "string" && customCssEase.trim()
        ? customCssEase.trim()
        : getInterpolatorCssEase();
      if (resolvedCssEase) {
        return {
          pop: resolvedCssEase,
          tooltip: resolvedCssEase
        };
      }
      const strength = getPhysicsStrength();
      if (strength <= 0) {
        return {
          pop: "cubic-bezier(0.2, 0.9, 0.2, 1)",
          tooltip: "cubic-bezier(0.2, 0.9, 0.2, 1)"
        };
      }
      if (strength < 0.66) {
        return {
          pop: "cubic-bezier(0.2, 1.02, 0.22, 1)",
          tooltip: "cubic-bezier(0.2, 1.05, 0.22, 1.04)"
        };
      }
      return {
        pop: "cubic-bezier(0.18, 1.16, 0.22, 1.04)",
        tooltip: "cubic-bezier(0.16, 1.28, 0.2, 1.08)"
      };
    };
    physicsController = typeof app.createModalPhysicsController === "function"
      ? app.createModalPhysicsController({
        modalCard,
        numControls,
        getMotionScale,
        getPhysicsStrength,
        getInterpolatorValueAt
      })
      : null;

    const clearPhysicsNudge = () => {
      if (physicsController && typeof physicsController.clear === "function") {
        physicsController.clear();
      }
    };

    const applyModalPhysicsPulse = (event, options = {}) => {
      if (physicsController && typeof physicsController.applyPulse === "function") {
        physicsController.applyPulse(event, options);
      }
    };

    const attachSliderPhysics = (slider) => {
      if (physicsController && typeof physicsController.attachSlider === "function") {
        physicsController.attachSlider(slider);
      }
    };

    const syncPhysicsBodyVisibility = () => {
      if (!physicsIntensityBody) return;
      const visible = settingsState.physicsEnabled !== false;
      physicsIntensityBody.hidden = !visible;
      physicsIntensityBody.setAttribute("aria-hidden", visible ? "false" : "true");
    };

    const syncInterpolatorUi = () => {
      setSegmentedSelection(interpolatorModeButtons, "data-interpolator-mode", settingsState.interpolatorMode);
      interpolatorModeButtons.forEach((button) => {
        const mode = String(button.getAttribute("data-interpolator-mode") || "").trim();
        const isActive = mode === settingsState.interpolatorMode;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      if (interpolatorPresetInput) {
        interpolatorPresetInput.value = settingsState.interpolatorPreset;
      }
      if (interpolatorExpressionInput) {
        interpolatorExpressionInput.value = settingsState.interpolatorExpression;
      }

      if (interpolatorModePreset) {
        const isActive = settingsState.interpolatorMode === "preset";
        interpolatorModePreset.hidden = !isActive;
        interpolatorModePreset.setAttribute("aria-hidden", isActive ? "false" : "true");
      }
      if (interpolatorModeExpression) {
        const isActive = settingsState.interpolatorMode === "expression";
        interpolatorModeExpression.hidden = !isActive;
        interpolatorModeExpression.setAttribute("aria-hidden", isActive ? "false" : "true");
      }
      if (interpolatorModeCurve) {
        const isActive = settingsState.interpolatorMode === "curve";
        interpolatorModeCurve.hidden = !isActive;
        interpolatorModeCurve.setAttribute("aria-hidden", isActive ? "false" : "true");
      }

      const compiledExpression = compileInterpolatorExpression(settingsState.interpolatorExpression);
      interpolatorExpressionFn = compiledExpression.fn;
      if (interpolatorExpressionError) {
        const showError = settingsState.interpolatorMode === "expression" && Boolean(compiledExpression.error);
        interpolatorExpressionError.hidden = !showError;
        if (showError) {
          interpolatorExpressionError.textContent = compiledExpression.error;
        }
      }

      const curve = settingsState.interpolatorCurve || DEFAULT_INTERPOLATOR_CURVE;
      if (interpolatorCurveP1x) interpolatorCurveP1x.value = String(clamp01(curve.p1x));
      if (interpolatorCurveP1y) interpolatorCurveP1y.value = String(clamp01(curve.p1y));
      if (interpolatorCurveP2x) interpolatorCurveP2x.value = String(clamp01(curve.p2x));
      if (interpolatorCurveP2y) interpolatorCurveP2y.value = String(clamp01(curve.p2y));
      updateCurveEditorPath();
    };

    const tickAnimationPreview = (now) => {
      previewRafId = 0;
      if (!animationPreviewDot || !animationPreviewBox) return;
      if (previewPaused) return;
      const motionScale = getMotionScale();
      if (motionScale <= 0) {
        animationPreviewDot.style.transform = "translate3d(0px, -50%, 0)";
      } else {
        if (!previewLastTick) previewLastTick = now;
        const dt = Math.max(1, now - previewLastTick);
        previewLastTick = now;
        previewPhaseMs += dt;

        const oneWayDuration = Math.max(220, 740 * Math.max(0.45, motionScale));
        const cycleDuration = oneWayDuration * 2;
        while (previewPhaseMs >= cycleDuration) previewPhaseMs -= cycleDuration;
        const forward = previewPhaseMs < oneWayDuration;
        const localT = forward
          ? (previewPhaseMs / oneWayDuration)
          : ((previewPhaseMs - oneWayDuration) / oneWayDuration);
        const eased = getInterpolatorValueAt(localT);

        const track = animationPreviewBox.querySelector(".animation-preview-track");
        const maxDistance = track
          ? Math.max(0, track.clientWidth - 22)
          : 0;
        const progress = forward ? eased : (1 - eased);
        animationPreviewDot.style.transform = `translate3d(${(progress * maxDistance).toFixed(2)}px, -50%, 0)`;
      }

      previewRafId = global.requestAnimationFrame(tickAnimationPreview);
    };

    const syncAnimationPreviewToggle = () => {
      if (!animationPreviewToggle) return;
      const iconNode = animationPreviewToggle.querySelector(".material-symbols-outlined");
      if (iconNode) {
        iconNode.textContent = previewPaused ? "play_arrow" : "pause";
      }
      animationPreviewToggle.setAttribute("aria-pressed", previewPaused ? "true" : "false");
      setElementTooltip(animationPreviewToggle, previewPaused ? "Play preview motion" : "Pause preview motion");
    };

    const ensureAnimationPreviewLoop = () => {
      if (!animationPreviewDot || !animationPreviewBox) return;
      if (previewPaused) return;
      if (previewRafId) return;
      previewLastTick = 0;
      previewRafId = global.requestAnimationFrame(tickAnimationPreview);
    };

    const applyModalSettings = () => {
      const activePage = PAGE_OPTIONS.has(settingsState.activePage)
        ? settingsState.activePage
        : DEFAULT_MODAL_SETTINGS.activePage;
      settingsState.activePage = activePage;
      const resolvedTheme = getResolvedTheme();
      const resolvedAccentHue = getResolvedAccentHue();
      const motionScale = getMotionScale();
      const physicsStrength = getPhysicsStrength();
      const interpolatorCssEase = getInterpolatorCssEase();
      const easingPreset = getPhysicsEasingPreset(interpolatorCssEase);
      const effectiveMotionEase = interpolatorCssEase || easingPreset.pop;
      modalCard.setAttribute("data-theme", settingsState.theme);
      modalCard.setAttribute("data-resolved-theme", resolvedTheme);
      modalCard.setAttribute("data-density", settingsState.density);
      modalCard.setAttribute("data-active-page", activePage);
      modalCard.setAttribute("data-color-vision", settingsState.colorVisionMode);
      modalCard.setAttribute("data-sidebar-collapsed", settingsState.sidebarCollapsed ? "true" : "false");
      modalCard.setAttribute("data-motion-disabled", motionScale <= 0 ? "true" : "false");
      if (settingsState.physicsEnabled !== false) {
        modalCard.setAttribute("data-physics-enabled", "true");
      } else {
        modalCard.removeAttribute("data-physics-enabled");
      }
      if (physicsStrength > 0) {
        modalCard.setAttribute("data-physics-bouncy", "true");
      } else {
        modalCard.removeAttribute("data-physics-bouncy");
      }
      modalCard.style.setProperty("--ui-font-size", `${settingsState.uiFontSize}px`);
      modalCard.style.setProperty("--editor-font-size", `${settingsState.editorFontSize}px`);
      modalCard.style.setProperty("--motion-scale", String(motionScale));
      modalCard.style.setProperty("--motion-ease", effectiveMotionEase);
      modalCard.style.setProperty("--physics-intensity", String(physicsStrength));
      modalCard.style.setProperty("--physics-pop-ease", effectiveMotionEase);
      modalCard.style.setProperty("--physics-tooltip-ease", effectiveMotionEase);
      modalCard.style.setProperty("--accent-custom-hue", String(resolvedAccentHue));
      modalCard.style.setProperty(
        "--modal-scale",
        String(clampNumber(settingsState.modalScale, MODAL_SCALE_MIN, MODAL_SCALE_MAX, DEFAULT_MODAL_SETTINGS.modalScale) / 100)
      );
      modalCard.style.setProperty(
        "--modal-opacity",
        String(clampNumber(settingsState.modalOpacity, MODAL_OPACITY_MIN, MODAL_OPACITY_MAX, DEFAULT_MODAL_SETTINGS.modalOpacity) / 100)
      );
      if (modal) {
        modal.style.setProperty("--motion-ease", effectiveMotionEase);
        modal.style.setProperty("--overlay-blur", String(Math.round(settingsState.overlayBlur)));
        modal.style.setProperty("--overlay-opacity", String(Math.round(settingsState.overlayOpacity)));
      }

      const accentPrimary = resolvedTheme === "light"
        ? `oklch(0.72 0.16 ${resolvedAccentHue})`
        : `oklch(0.67 0.19 ${resolvedAccentHue})`;
      const accentSoft = resolvedTheme === "light"
        ? `oklch(0.64 0.15 ${resolvedAccentHue})`
        : `oklch(0.62 0.18 ${resolvedAccentHue})`;
      const accentFocus = resolvedTheme === "light"
        ? `oklch(0.60 0.17 ${resolvedAccentHue})`
        : `oklch(0.75 0.14 ${resolvedAccentHue})`;
      const scrollA = resolvedTheme === "light"
        ? `oklch(0.66 0.13 ${resolvedAccentHue})`
        : `oklch(0.69 0.15 ${resolvedAccentHue})`;
      const scrollB = resolvedTheme === "light"
        ? `oklch(0.79 0.10 ${resolvedAccentHue})`
        : `oklch(0.80 0.11 ${resolvedAccentHue})`;
      const accentInvertHue = (resolvedAccentHue + 180) % 360;
      const accentInvertMuted = resolvedTheme === "light"
        ? `oklch(0.73 0.09 ${accentInvertHue})`
        : `oklch(0.70 0.10 ${accentInvertHue})`;
      modalCard.style.setProperty("--surface-button-primary", accentPrimary);
      modalCard.style.setProperty("--surface-button-primary-soft", accentSoft);
      modalCard.style.setProperty("--border-focus", accentFocus);
      modalCard.style.setProperty("--status-color-in-progress", accentSoft);
      modalCard.style.setProperty("--scroll-thumb-a", scrollA);
      modalCard.style.setProperty("--scroll-thumb-b", scrollB);
      modalCard.style.setProperty("--accent-invert-muted", accentInvertMuted);
      if (modal && typeof global.getComputedStyle === "function") {
        const computedStyle = global.getComputedStyle(modalCard);
        modal.style.setProperty(
          "--tooltip-surface",
          computedStyle.getPropertyValue("--surface-picker").trim() || "#1a2438"
        );
        modal.style.setProperty(
          "--tooltip-border",
          computedStyle.getPropertyValue("--border-soft").trim() || "#2a3a57"
        );
        modal.style.setProperty(
          "--tooltip-text",
          computedStyle.getPropertyValue("--text-primary").trim() || "#f3f7ff"
        );
      }

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
        const sidebarTitle = settingsState.sidebarCollapsed
          ? "Show Sidebar [Tab]"
          : "Hide Sidebar [Tab]";
        setElementTooltip(settingsToggle, sidebarTitle);
        settingsToggle.setAttribute("aria-label", sidebarTitle);
      }

      if (closeBtn) {
        setElementTooltip(closeBtn, "Close [Esc]");
        closeBtn.setAttribute("aria-label", "Close [Esc]");
      }

      setSegmentedSelection(themeButtons, "data-theme-option", settingsState.theme);
      setSegmentedSelection(densityButtons, "data-density-option", settingsState.density);

      if (colorFilterInput) {
        colorFilterInput.value = settingsState.colorVisionMode;
      }
      if (colorFilterDescription) {
        colorFilterDescription.textContent = COLOR_VISION_MODE_DESCRIPTIONS[settingsState.colorVisionMode]
          || COLOR_VISION_MODE_DESCRIPTIONS.none;
      }

      syncAccentSettingUi(resolvedAccentHue);

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

      if (animationSpeedSlider) {
        animationSpeedSlider.value = String(Math.round(settingsState.animationSpeed));
      }
      syncInterpolatorUi();

      if (lofiAutoplayInput) {
        lofiAutoplayInput.checked = settingsState.musicAutoplay !== false;
      }
      if (lofiSpeedRateSlider) {
        lofiSpeedRateSlider.value = String(Math.round(settingsState.lofiSpeedRate * 100));
      }
      if (lofiPitchRateSlider) {
        lofiPitchRateSlider.value = String(Math.round(settingsState.lofiPitchRate * 100));
        lofiPitchRateSlider.disabled = settingsState.lofiRatePitchSync !== false;
      }
      if (lofiSpeedRateValue) {
        lofiSpeedRateValue.textContent = `${Math.round(settingsState.lofiSpeedRate * 100)}%`;
      }
      if (lofiPitchRateValue) {
        lofiPitchRateValue.textContent = `${Math.round(settingsState.lofiPitchRate * 100)}%`;
      }
      if (lofiRateSyncBtn) {
        const synced = settingsState.lofiRatePitchSync !== false;
        lofiRateSyncBtn.classList.toggle("is-active", synced);
        lofiRateSyncBtn.setAttribute("aria-pressed", synced ? "true" : "false");
        setElementTooltip(lofiRateSyncBtn, synced ? "Unsync speed and pitch" : "Sync speed and pitch");
      }
      if (app._lofiController && typeof app._lofiController.setPlaybackTuning === "function") {
        app._lofiController.setPlaybackTuning({
          speedRate: settingsState.lofiSpeedRate,
          pitchRate: settingsState.lofiPitchRate,
          ratePitchSync: settingsState.lofiRatePitchSync
        });
      }

      if (animationFollowDeviceInput) {
        animationFollowDeviceInput.checked = settingsState.animationFollowDevice !== false;
      }

      if (animationEnablePhysicsInput) {
        animationEnablePhysicsInput.checked = settingsState.physicsEnabled !== false;
      }

      if (physicsSyncMusicInput) {
        physicsSyncMusicInput.checked = settingsState.physicsSyncToMusic === true;
      }

      const effectivePhysicsIntensity = getEffectivePhysicsIntensity();
      const estimatedBpm = getEstimatedLofiBpm();
      const syncedBpm = getSyncedPhysicsBpm();

      if (physicsIntensitySlider) {
        physicsIntensitySlider.value = String(Math.round(effectivePhysicsIntensity));
      }

      if (physicsIntensityInput) {
        physicsIntensityInput.value = String(Math.round(effectivePhysicsIntensity));
      }

      if (physicsSyncTools) {
        physicsSyncTools.hidden = settingsState.physicsSyncToMusic !== true;
      }

      if (physicsSyncBpmValue) {
        physicsSyncBpmValue.textContent = String(Math.round(syncedBpm));
      }

      if (physicsBpmOffsetInput) {
        physicsBpmOffsetInput.value = String(clampNumber(
          settingsState.physicsBpmOffset,
          PHYSICS_BPM_OFFSET_MIN,
          PHYSICS_BPM_OFFSET_MAX,
          DEFAULT_MODAL_SETTINGS.physicsBpmOffset
        ));
      }

      if (physicsSyncBpmHint) {
        if (settingsState.physicsSyncToMusic === true) {
          const offset = clampNumber(
            settingsState.physicsBpmOffset,
            PHYSICS_BPM_OFFSET_MIN,
            PHYSICS_BPM_OFFSET_MAX,
            DEFAULT_MODAL_SETTINGS.physicsBpmOffset
          );
          const offsetLabel = offset >= 0 ? `+${Math.round(offset)}` : `${Math.round(offset)}`;
          physicsSyncBpmHint.textContent = `Synced to music BPM (${Math.round(estimatedBpm)} + ${offsetLabel} = ${Math.round(syncedBpm)} BPM). Intensity auto-adjusts.`;
        } else {
          physicsSyncBpmHint.textContent = "Controls tilt and modal nudge strength.";
        }
      }

      if (overlayBlurSlider) {
        overlayBlurSlider.value = String(Math.round(settingsState.overlayBlur));
      }

      if (overlayBlurInput) {
        overlayBlurInput.value = String(Math.round(settingsState.overlayBlur));
      }

      if (overlayOpacitySlider) {
        overlayOpacitySlider.value = String(Math.round(settingsState.overlayOpacity));
      }

      if (overlayOpacityInput) {
        overlayOpacityInput.value = String(Math.round(settingsState.overlayOpacity));
      }

      if (modalScaleSlider) {
        modalScaleSlider.value = String(Math.round(settingsState.modalScale));
      }

      if (modalScaleInput) {
        modalScaleInput.value = String(Math.round(settingsState.modalScale));
      }

      if (modalOpacitySlider) {
        modalOpacitySlider.value = String(Math.round(settingsState.modalOpacity));
      }

      if (modalOpacityInput) {
        modalOpacityInput.value = String(Math.round(settingsState.modalOpacity));
      }

      syncPhysicsBodyVisibility();

      if (physicsIntensitySlider) {
        physicsIntensitySlider.disabled = settingsState.physicsEnabled === false || settingsState.physicsSyncToMusic === true;
      }

      if (physicsIntensityInput) {
        physicsIntensityInput.disabled = settingsState.physicsEnabled === false || settingsState.physicsSyncToMusic === true;
      }

      if (physicsBpmOffsetInput) {
        physicsBpmOffsetInput.disabled = settingsState.physicsEnabled === false || settingsState.physicsSyncToMusic !== true;
      }

      if (physicsBpmOffsetDec) {
        physicsBpmOffsetDec.disabled = settingsState.physicsEnabled === false || settingsState.physicsSyncToMusic !== true;
      }

      if (physicsBpmOffsetInc) {
        physicsBpmOffsetInc.disabled = settingsState.physicsEnabled === false || settingsState.physicsSyncToMusic !== true;
      }

      if (animationSpeedSlider) {
        animationSpeedSlider.disabled = false;
      }
      if (settingsState.physicsEnabled === false || motionScale <= 0) {
        clearPhysicsNudge();
      }

      syncAnimationPreviewToggle();
      ensureAnimationPreviewLoop();

      setPageSelection();
    };

    const commitModalSettings = (updates, options = {}) => {
      const preserveScroll = options && options.preserveScroll !== false;
      const stabilizeScroll = !(options && options.stabilizeScroll === false);
      const previousState = settingsState;
      const activePanelBefore = pagePanels.find((panel) => !panel.hidden) || null;
      const scrollHostBefore = activePanelBefore
        ? (activePanelBefore.querySelector(".page-scroll") || activePanelBefore)
        : null;
      const preservedScrollTop = scrollHostBefore ? scrollHostBefore.scrollTop : 0;

      const nextState = normalizeModalSettings({ ...settingsState, ...updates });
      settingsState = nextState;
      saveModalSettings(settingsState);
      applyModalSettings();
      if (stabilizeScroll) {
        stabilizeSettingsScroll();
      }

      const activePageChanged = nextState.activePage !== previousState.activePage;
      if (!preserveScroll || activePageChanged || !scrollHostBefore || typeof preservedScrollTop !== "number") return;

      global.requestAnimationFrame(() => {
        if (!scrollHostBefore || !scrollHostBefore.isConnected) return;
        const maxScrollTop = Math.max(0, scrollHostBefore.scrollHeight - scrollHostBefore.clientHeight);
        scrollHostBefore.scrollTop = Math.min(Math.max(0, preservedScrollTop), maxScrollTop);
      });
    };

    const commitModalSettingsFromSwitch = (updates) => {
      const scrollHost = settingsState.activePage === "settings" ? settingsPageScrollHost : null;
      const anchor = (() => {
        if (!scrollHost) return null;
        const hostRect = scrollHost.getBoundingClientRect();
        const topOffset = hostRect.top + 18;
        const sections = Array.from(scrollHost.querySelectorAll(".settings-section"));
        let activeSection = sections[0] || null;
        sections.forEach((section) => {
          const top = section.getBoundingClientRect().top;
          if (top <= topOffset) {
            activeSection = section;
          }
        });
        if (!activeSection || !activeSection.id) return null;
        const sectionTopInHost = activeSection.getBoundingClientRect().top - hostRect.top + scrollHost.scrollTop;
        const delta = scrollHost.scrollTop - sectionTopInHost;
        return { id: activeSection.id, delta };
      })();

      const restoreScrollTop = () => {
        if (!scrollHost || !scrollHost.isConnected) return;
        if (anchor) {
          const sectionEl = byId(anchor.id);
          if (sectionEl) {
            const hostRect = scrollHost.getBoundingClientRect();
            const sectionTopInHost = sectionEl.getBoundingClientRect().top - hostRect.top + scrollHost.scrollTop;
            const nextScrollTop = sectionTopInHost + anchor.delta;
            const maxScrollTop = Math.max(0, scrollHost.scrollHeight - scrollHost.clientHeight);
            scrollHost.scrollTop = Math.min(Math.max(0, nextScrollTop), maxScrollTop);
            return;
          }
        }
      };

      commitModalSettings(updates, { preserveScroll: true, stabilizeScroll: false });

      restoreScrollTop();
      global.requestAnimationFrame(() => {
        restoreScrollTop();
        global.requestAnimationFrame(() => {
          restoreScrollTop();
        });
      });
      global.setTimeout(restoreScrollTop, 180);
    };

    const resetSettingToDefault = (settingName) => {
      switch (settingName) {
        case "triggerText":
          commitModalSettings({ triggerText: DEFAULT_MODAL_SETTINGS.triggerText });
          break;
        case "triggerActivation":
          commitModalSettings({ triggerActivation: DEFAULT_MODAL_SETTINGS.triggerActivation });
          break;
        case "theme":
          commitModalSettings({ theme: DEFAULT_MODAL_SETTINGS.theme });
          break;
        case "density":
          commitModalSettings({ density: DEFAULT_MODAL_SETTINGS.density });
          break;
        case "accentColor":
          commitModalSettings({
            accentPreset: DEFAULT_MODAL_SETTINGS.accentPreset,
            accentHue: DEFAULT_MODAL_SETTINGS.accentHue
          });
          break;
        case "colorVisionMode":
          commitModalSettings({ colorVisionMode: DEFAULT_MODAL_SETTINGS.colorVisionMode });
          break;
        case "uiFontSize":
          commitModalSettings({ uiFontSize: DEFAULT_MODAL_SETTINGS.uiFontSize });
          break;
        case "editorFontSize":
          commitModalSettings({ editorFontSize: DEFAULT_MODAL_SETTINGS.editorFontSize });
          break;
        case "animationSpeed":
          commitModalSettings({ animationSpeed: DEFAULT_MODAL_SETTINGS.animationSpeed });
          break;
        case "interpolator":
          commitModalSettings({
            interpolatorMode: DEFAULT_MODAL_SETTINGS.interpolatorMode,
            interpolatorPreset: DEFAULT_MODAL_SETTINGS.interpolatorPreset,
            interpolatorExpression: DEFAULT_MODAL_SETTINGS.interpolatorExpression,
            interpolatorCurve: { ...DEFAULT_INTERPOLATOR_CURVE },
            interpolatorCurvePoints: []
          });
          break;
        case "musicAutoplay":
          commitModalSettings({ musicAutoplay: DEFAULT_MODAL_SETTINGS.musicAutoplay });
          break;
        case "lofiTuning":
          commitModalSettings({
            lofiSpeedRate: DEFAULT_MODAL_SETTINGS.lofiSpeedRate,
            lofiPitchRate: DEFAULT_MODAL_SETTINGS.lofiPitchRate,
            lofiRatePitchSync: DEFAULT_MODAL_SETTINGS.lofiRatePitchSync
          });
          break;
        case "animationFollowDevice":
          commitModalSettings({ animationFollowDevice: DEFAULT_MODAL_SETTINGS.animationFollowDevice });
          break;
        case "physicsEnabled":
          commitModalSettings({ physicsEnabled: DEFAULT_MODAL_SETTINGS.physicsEnabled });
          break;
        case "physicsIntensity":
          commitModalSettings({
            physicsIntensity: DEFAULT_MODAL_SETTINGS.physicsIntensity,
            physicsBpmOffset: DEFAULT_MODAL_SETTINGS.physicsBpmOffset
          });
          break;
        case "overlayBlur":
          commitModalSettings({ overlayBlur: DEFAULT_MODAL_SETTINGS.overlayBlur });
          break;
        case "overlayOpacity":
          commitModalSettings({ overlayOpacity: DEFAULT_MODAL_SETTINGS.overlayOpacity });
          break;
        case "modalScale":
          commitModalSettings({ modalScale: DEFAULT_MODAL_SETTINGS.modalScale });
          break;
        case "modalOpacity":
          commitModalSettings({ modalOpacity: DEFAULT_MODAL_SETTINGS.modalOpacity });
          break;
        default:
          break;
      }
    };

    selected = allColors.includes(defaultBannerColor) ? defaultBannerColor : allColors[0];
    renderPalette();

    bannerPopover.addEventListener("toggle", syncBannerOpenState);
    bannerPopover.addEventListener("toggle", () => {
      let open = false;
      try {
        open = bannerPopover.matches(":popover-open");
      } catch {
        open = bannerPopover.classList.contains("is-open-fallback");
      }
      if (open) positionPopoverNearTrigger(bannerPopover, bannerTrigger, "start");
    });

    if (typeof bannerPopover.showPopover === "function" && typeof bannerPopover.hidePopover === "function") {
      bannerTrigger.addEventListener("click", () => {
        syncBannerOpenState();
        global.requestAnimationFrame(() => {
          positionPopoverNearTrigger(bannerPopover, bannerTrigger, "start");
        });
      });
    } else {
      bannerTrigger.addEventListener("click", () => {
        bannerPopover.classList.toggle("is-open-fallback");
        syncBannerOpenState();
        if (bannerPopover.classList.contains("is-open-fallback")) {
          positionPopoverNearTrigger(bannerPopover, bannerTrigger, "start");
        }
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

    if (accentCustomPopover && accentCustomTrigger) {
      if (typeof accentCustomPopover.showPopover === "function" && typeof accentCustomPopover.hidePopover === "function") {
        accentCustomPopover.addEventListener("toggle", () => {
          let open = false;
          try {
            open = accentCustomPopover.matches(":popover-open");
          } catch {
            open = false;
          }
          accentCustomTrigger.classList.toggle("is-active", open || settingsState.accentPreset === "custom");
          if (open) positionPopoverNearTrigger(accentCustomPopover, accentCustomTrigger, "end");
        });
      } else {
        accentCustomTrigger.addEventListener("click", () => {
          accentCustomPopover.classList.toggle("is-open-fallback");
          if (accentCustomPopover.classList.contains("is-open-fallback")) {
            positionPopoverNearTrigger(accentCustomPopover, accentCustomTrigger, "end");
          }
        });

        shadow.addEventListener("click", (event) => {
          if (!accentCustomPopover.classList.contains("is-open-fallback")) return;
          const path = typeof event.composedPath === "function" ? event.composedPath() : [];
          if (path.includes(accentCustomPopover) || path.includes(accentCustomTrigger)) return;
          accentCustomPopover.classList.remove("is-open-fallback");
        });
      }
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

    incBtn.addEventListener("pointerdown", (event) => {
      applyModalPhysicsPulse(event, { direction: 1, pressNumControls: true, multiplier: 1.12 });
    });

    decBtn.addEventListener("pointerdown", (event) => {
      applyModalPhysicsPulse(event, { direction: -1, pressNumControls: true, multiplier: 1.12 });
    });

    shadow.addEventListener("pointerup", (event) => {
      const switchRoot = event.target && typeof event.target.closest === "function"
        ? event.target.closest(".settings-switch")
        : null;
      if (switchRoot) return;
      const target = event.target && typeof event.target.closest === "function"
        ? event.target.closest("button")
        : null;
      if (!target) return;
      if (target === incBtn || target === decBtn) return;
      if (target.disabled) return;
      if (target.closest(".copy-menu, .banner-popover, .accent-custom-popover")) return;
      applyModalPhysicsPulse(event, { direction: 0, pressNumControls: false, multiplier: 0.9 });
    }, true);

    shadow.addEventListener("pointerdown", (event) => {
      const switchRoot = event.target && typeof event.target.closest === "function"
        ? event.target.closest(".settings-switch")
        : null;
      if (switchRoot) return;
      const target = event.target && typeof event.target.closest === "function"
        ? event.target.closest("input, textarea, select")
        : null;
      if (!target) return;
      if (target.disabled) return;

      const tag = target.tagName ? target.tagName.toLowerCase() : "";
      const inputType = tag === "input" ? String(target.type || "").toLowerCase() : "";

      // Range sliders have their own physics model based on drag position/velocity.
      if (inputType === "range") return;

      // Text fields nudge the modal on interaction. Dropdowns are excluded to avoid selection interference.
      if (tag === "textarea" || (tag === "input" && inputType !== "checkbox" && inputType !== "radio")) {
        applyModalPhysicsPulse(event, { direction: 0, pressNumControls: false, multiplier: 0.78 });
      }
    }, true);

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
          setActionFeedback(editorHintMessage, "muted");
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

    accentPresetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const preset = String(button.getAttribute("data-accent-preset") || "").trim();
        if (!ACCENT_PRESET_OPTIONS.has(preset)) return;
        commitModalSettings({ accentPreset: preset });
      });
    });

    const commitAccentHueValue = (value) => {
      const effectiveHue = Math.round(clampNumber(value, 0, 360, settingsState.accentHue));
      const rotation = getAccentHueRotation();
      const baseHue = (effectiveHue - rotation) % 360;
      const normalizedBaseHue = baseHue < 0 ? baseHue + 360 : baseHue;
      commitModalSettings({ accentPreset: "custom", accentHue: normalizedBaseHue });
    };

    if (accentHueSlider) {
      accentHueSlider.addEventListener("input", () => {
        commitAccentHueValue(accentHueSlider.value);
      });
    }

    if (accentCustomTrigger) {
      accentCustomTrigger.addEventListener("click", () => {
        if (settingsState.accentPreset !== "custom") {
          commitModalSettings({ accentPreset: "custom" });
        }
      });
    }

    if (accentHueWheel) {
      const hueFromPointer = (event) => {
        const rect = accentHueWheel.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const radians = Math.atan2(dy, dx);
        const degrees = (radians * 180) / Math.PI;
        return Math.round((degrees + 360) % 360);
      };

      let draggingWheel = false;
      const onPointerMove = (event) => {
        if (!draggingWheel) return;
        commitAccentHueValue(hueFromPointer(event));
      };
      const onPointerEnd = () => {
        draggingWheel = false;
        global.removeEventListener("pointermove", onPointerMove, true);
        global.removeEventListener("pointerup", onPointerEnd, true);
        global.removeEventListener("pointercancel", onPointerEnd, true);
      };

      accentHueWheel.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        draggingWheel = true;
        commitAccentHueValue(hueFromPointer(event));
        global.addEventListener("pointermove", onPointerMove, true);
        global.addEventListener("pointerup", onPointerEnd, true);
        global.addEventListener("pointercancel", onPointerEnd, true);
      });

      accentHueWheel.addEventListener("keydown", (event) => {
        const current = getResolvedAccentHue();
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          commitAccentHueValue(current - 2);
          return;
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          commitAccentHueValue(current + 2);
          return;
        }
        if (event.key === "Home") {
          event.preventDefault();
          commitAccentHueValue(0);
          return;
        }
        if (event.key === "End") {
          event.preventDefault();
          commitAccentHueValue(360);
        }
      });
    }

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
        if (event.ctrlKey || event.altKey || event.metaKey || (event.shiftKey && event.key.length === 1)) {
          event.preventDefault();
          triggerTextInput.classList.add("input-error");
          triggerTextInput.setAttribute("aria-invalid", "true");
          if (triggerTextError) {
            triggerTextError.hidden = false;
            triggerTextError.textContent = "Modifier/combo keys and shift-required characters are blocked for safety.";
          }
          if (triggerTextWarning) triggerTextWarning.hidden = true;
          syncActivePageHeight();
          return;
        }
        if (event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          triggerTextInput.classList.add("input-error");
          triggerTextInput.setAttribute("aria-invalid", "true");
          if (triggerTextError) {
            triggerTextError.hidden = false;
            triggerTextError.textContent = "Spaces are not allowed in trigger text.";
          }
          if (triggerTextWarning) triggerTextWarning.hidden = true;
          syncActivePageHeight();
          return;
        }
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
        commitModalSettingsFromSwitch({
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

    if (animationSpeedSlider) {
      animationSpeedSlider.addEventListener("input", () => {
        const value = clampNumber(
          animationSpeedSlider.value,
          ANIMATION_SPEED_MIN,
          ANIMATION_SPEED_MAX,
          settingsState.animationSpeed
        );
        commitModalSettings({ animationSpeed: Math.round(value) });
      });
    }

    if (animationPreviewToggle) {
      animationPreviewToggle.addEventListener("click", () => {
        previewPaused = !previewPaused;
        syncAnimationPreviewToggle();
        if (previewPaused) {
          if (previewRafId) {
            global.cancelAnimationFrame(previewRafId);
            previewRafId = 0;
          }
          return;
        }
        ensureAnimationPreviewLoop();
      });
    }

    interpolatorModeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = String(button.getAttribute("data-interpolator-mode") || "").trim();
        if (!INTERPOLATOR_MODE_OPTIONS.has(mode)) return;
        commitModalSettings({ interpolatorMode: mode });
      });
      button.addEventListener("keydown", (event) => {
        const currentIndex = interpolatorModeButtons.indexOf(button);
        if (currentIndex < 0) return;
        let nextIndex = -1;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + interpolatorModeButtons.length) % interpolatorModeButtons.length;
        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % interpolatorModeButtons.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = interpolatorModeButtons.length - 1;
        }
        if (nextIndex < 0) return;
        event.preventDefault();
        const nextButton = interpolatorModeButtons[nextIndex];
        if (!nextButton) return;
        nextButton.focus();
        const mode = String(nextButton.getAttribute("data-interpolator-mode") || "").trim();
        if (!INTERPOLATOR_MODE_OPTIONS.has(mode)) return;
        commitModalSettings({ interpolatorMode: mode });
      });
    });

    if (interpolatorPresetInput) {
      interpolatorPresetInput.addEventListener("change", () => {
        const value = String(interpolatorPresetInput.value || "").trim();
        if (!INTERPOLATOR_PRESET_OPTIONS.has(value)) return;
        commitModalSettings({ interpolatorPreset: value });
      });
    }

    if (interpolatorExpressionInput) {
      const commitInterpolatorExpression = () => {
        commitModalSettings({ interpolatorExpression: String(interpolatorExpressionInput.value || "").trim() });
      };
      interpolatorExpressionInput.addEventListener("change", commitInterpolatorExpression);
      interpolatorExpressionInput.addEventListener("blur", commitInterpolatorExpression);
      interpolatorExpressionInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitInterpolatorExpression();
          interpolatorExpressionInput.blur();
        }
      });
    }

    const commitCurveFromInputs = () => {
      commitModalSettings({
        interpolatorCurve: {
          p1x: clampNumber(interpolatorCurveP1x ? interpolatorCurveP1x.value : DEFAULT_INTERPOLATOR_CURVE.p1x, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p1x),
          p1y: clampNumber(interpolatorCurveP1y ? interpolatorCurveP1y.value : DEFAULT_INTERPOLATOR_CURVE.p1y, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p1y),
          p2x: clampNumber(interpolatorCurveP2x ? interpolatorCurveP2x.value : DEFAULT_INTERPOLATOR_CURVE.p2x, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p2x),
          p2y: clampNumber(interpolatorCurveP2y ? interpolatorCurveP2y.value : DEFAULT_INTERPOLATOR_CURVE.p2y, 0, 1, DEFAULT_INTERPOLATOR_CURVE.p2y)
        }
      });
    };
    [interpolatorCurveP1x, interpolatorCurveP1y, interpolatorCurveP2x, interpolatorCurveP2y]
      .filter(Boolean)
      .forEach((input) => {
        input.addEventListener("input", commitCurveFromInputs);
      });

    if (curveEditorCanvas) {
      const getHitPoint = (event, includeEndpoints = false) => {
        const point = getCurvePointFromClient(event.clientX, event.clientY);
        if (!point || !curveEditorCanvas) return null;
        const width = curveEditorCanvas.width || 240;
        const height = curveEditorCanvas.height || 240;
        const x = point.x * width;
        const y = (1 - point.y) * height;
        const hit = curveEditorHitPoints.find((entry) => {
          if (!includeEndpoints && entry.type === "endpoint") return false;
          const dist = Math.hypot(entry.x - x, entry.y - y);
          return dist <= Math.max(8, entry.radius + 5);
        });
        return hit || null;
      };

      curveEditorCanvas.addEventListener("pointerdown", (event) => {
        if (settingsState.interpolatorMode !== "curve") return;
        const hit = getHitPoint(event, false);
        if (hit && hit.type !== "endpoint") {
          event.preventDefault();
          activeCurveDrag = { id: hit.id };
          curveEditorCanvas.setPointerCapture(event.pointerId);
          return;
        }

        const point = getCurvePointFromClient(event.clientX, event.clientY);
        if (!point) return;
        const customPoints = Array.isArray(settingsState.interpolatorCurvePoints)
          ? [...settingsState.interpolatorCurvePoints]
          : [];
        if (customPoints.length >= MAX_CUSTOM_CURVE_POINTS) return;
        customPoints.push(point);
        commitCustomCurvePoints(customPoints);
      });

      curveEditorCanvas.addEventListener("pointermove", (event) => {
        if (!activeCurveDrag || settingsState.interpolatorMode !== "curve") return;
        const next = getCurvePointFromClient(event.clientX, event.clientY);
        if (!next) return;
        event.preventDefault();
        if (activeCurveDrag.id === "p1" || activeCurveDrag.id === "p2") {
          const nextCurve = { ...(settingsState.interpolatorCurve || DEFAULT_INTERPOLATOR_CURVE) };
          if (activeCurveDrag.id === "p1") {
            nextCurve.p1x = next.x;
            nextCurve.p1y = next.y;
          } else {
            nextCurve.p2x = next.x;
            nextCurve.p2y = next.y;
          }
          commitModalSettings({ interpolatorCurve: nextCurve });
          return;
        }
        if (activeCurveDrag.id.startsWith("custom-")) {
          const index = parseInt(activeCurveDrag.id.slice("custom-".length), 10);
          if (!Number.isFinite(index)) return;
          const customPoints = Array.isArray(settingsState.interpolatorCurvePoints)
            ? [...settingsState.interpolatorCurvePoints]
            : [];
          if (!customPoints[index]) return;
          customPoints[index] = { x: next.x, y: next.y };
          commitCustomCurvePoints(customPoints);
        }
      });

      const stopCurveDragging = (event) => {
        if (!activeCurveDrag) return;
        if (typeof event.pointerId === "number" && curveEditorCanvas.hasPointerCapture(event.pointerId)) {
          curveEditorCanvas.releasePointerCapture(event.pointerId);
        }
        activeCurveDrag = null;
        updateCurveEditorPath();
      };

      curveEditorCanvas.addEventListener("pointerup", stopCurveDragging);
      curveEditorCanvas.addEventListener("pointercancel", stopCurveDragging);

      curveEditorCanvas.addEventListener("dblclick", (event) => {
        if (settingsState.interpolatorMode !== "curve") return;
        const hit = getHitPoint(event, false);
        if (!hit || hit.type !== "custom") return;
        const index = Number.isFinite(hit.customIndex) ? hit.customIndex : parseInt(String(hit.id).replace("custom-", ""), 10);
        if (!Number.isFinite(index)) return;
        const customPoints = Array.isArray(settingsState.interpolatorCurvePoints)
          ? [...settingsState.interpolatorCurvePoints]
          : [];
        if (!customPoints[index]) return;
        customPoints.splice(index, 1);
        commitCustomCurvePoints(customPoints);
      });
    }

    if (lofiAutoplayInput) {
      lofiAutoplayInput.addEventListener("change", () => {
        const enabled = lofiAutoplayInput.checked;
        commitModalSettingsFromSwitch({ musicAutoplay: enabled });
        const controller = getLofiController();
        if (enabled) {
          if (typeof controller.modalEnter === "function") {
            controller.modalEnter({ autoplay: true });
          } else {
            controller.maybeAutoplay();
          }
        } else {
          if (typeof controller.modalExit === "function") {
            controller.modalExit();
          } else {
            controller.pause();
          }
        }
      });
    }

    if (lofiSpeedRateSlider) {
      lofiSpeedRateSlider.addEventListener("input", () => {
        const nextSpeedRate = clampNumber(
          Number(lofiSpeedRateSlider.value) / 100,
          LOFI_RATE_MIN,
          LOFI_RATE_MAX,
          settingsState.lofiSpeedRate
        );
        if (settingsState.lofiRatePitchSync !== false) {
          commitModalSettings({
            lofiSpeedRate: nextSpeedRate,
            lofiPitchRate: nextSpeedRate
          });
          return;
        }
        commitModalSettings({ lofiSpeedRate: nextSpeedRate });
      });
    }

    if (lofiPitchRateSlider) {
      lofiPitchRateSlider.addEventListener("input", () => {
        const nextPitchRate = clampNumber(
          Number(lofiPitchRateSlider.value) / 100,
          LOFI_RATE_MIN,
          LOFI_RATE_MAX,
          settingsState.lofiPitchRate
        );
        if (settingsState.lofiRatePitchSync !== false) {
          commitModalSettings({
            lofiPitchRate: nextPitchRate,
            lofiSpeedRate: nextPitchRate
          });
          return;
        }
        commitModalSettings({ lofiPitchRate: nextPitchRate });
      });
    }

    if (lofiRateSyncBtn) {
      lofiRateSyncBtn.addEventListener("click", () => {
        const willSync = !(settingsState.lofiRatePitchSync !== false);
        if (willSync) {
          commitModalSettings({
            lofiRatePitchSync: true,
            lofiPitchRate: settingsState.lofiSpeedRate
          });
          return;
        }
        commitModalSettings({ lofiRatePitchSync: false });
      });
    }

    if (animationFollowDeviceInput) {
      animationFollowDeviceInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ animationFollowDevice: animationFollowDeviceInput.checked });
      });
    }

    if (animationEnablePhysicsInput) {
      animationEnablePhysicsInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ physicsEnabled: animationEnablePhysicsInput.checked });
      });
    }

    if (physicsSyncMusicInput) {
      physicsSyncMusicInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ physicsSyncToMusic: physicsSyncMusicInput.checked });
      });
    }

    if (physicsIntensitySlider) {
      physicsIntensitySlider.addEventListener("input", () => {
        if (settingsState.physicsSyncToMusic === true) return;
        const value = clampNumber(
          physicsIntensitySlider.value,
          PHYSICS_INTENSITY_MIN,
          PHYSICS_INTENSITY_MAX,
          settingsState.physicsIntensity
        );
        commitModalSettings({ physicsIntensity: Math.round(value) });
      });
    }

    if (physicsIntensityInput) {
      const syncPhysicsIntensityFromTextBox = () => {
        if (settingsState.physicsSyncToMusic === true) return;
        const value = clampNumber(
          physicsIntensityInput.value,
          PHYSICS_INTENSITY_MIN,
          PHYSICS_INTENSITY_MAX,
          settingsState.physicsIntensity
        );
        commitModalSettings({ physicsIntensity: Math.round(value) });
      };
      physicsIntensityInput.addEventListener("change", syncPhysicsIntensityFromTextBox);
      physicsIntensityInput.addEventListener("blur", syncPhysicsIntensityFromTextBox);
      physicsIntensityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncPhysicsIntensityFromTextBox();
          physicsIntensityInput.blur();
        }
      });
    }

    if (physicsBpmOffsetDec) {
      physicsBpmOffsetDec.addEventListener("click", () => {
        if (settingsState.physicsSyncToMusic !== true) return;
        const value = clampNumber(
          settingsState.physicsBpmOffset - 1,
          PHYSICS_BPM_OFFSET_MIN,
          PHYSICS_BPM_OFFSET_MAX,
          DEFAULT_MODAL_SETTINGS.physicsBpmOffset
        );
        commitModalSettings({ physicsBpmOffset: Math.round(value) });
      });
    }

    if (physicsBpmOffsetInc) {
      physicsBpmOffsetInc.addEventListener("click", () => {
        if (settingsState.physicsSyncToMusic !== true) return;
        const value = clampNumber(
          settingsState.physicsBpmOffset + 1,
          PHYSICS_BPM_OFFSET_MIN,
          PHYSICS_BPM_OFFSET_MAX,
          DEFAULT_MODAL_SETTINGS.physicsBpmOffset
        );
        commitModalSettings({ physicsBpmOffset: Math.round(value) });
      });
    }

    if (physicsBpmOffsetInput) {
      const syncPhysicsBpmOffsetFromTextBox = () => {
        if (settingsState.physicsSyncToMusic !== true) return;
        const value = clampNumber(
          physicsBpmOffsetInput.value,
          PHYSICS_BPM_OFFSET_MIN,
          PHYSICS_BPM_OFFSET_MAX,
          settingsState.physicsBpmOffset
        );
        commitModalSettings({ physicsBpmOffset: Math.round(value) });
      };
      physicsBpmOffsetInput.addEventListener("change", syncPhysicsBpmOffsetFromTextBox);
      physicsBpmOffsetInput.addEventListener("blur", syncPhysicsBpmOffsetFromTextBox);
      physicsBpmOffsetInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncPhysicsBpmOffsetFromTextBox();
          physicsBpmOffsetInput.blur();
        }
      });
    }

    if (overlayBlurSlider) {
      overlayBlurSlider.addEventListener("input", () => {
        const value = clampNumber(
          overlayBlurSlider.value,
          OVERLAY_BLUR_MIN,
          OVERLAY_BLUR_MAX,
          settingsState.overlayBlur
        );
        commitModalSettings({ overlayBlur: Math.round(value) });
      });
    }

    if (overlayBlurInput) {
      const syncOverlayBlurFromTextBox = () => {
        const value = clampNumber(
          overlayBlurInput.value,
          OVERLAY_BLUR_MIN,
          OVERLAY_BLUR_MAX,
          settingsState.overlayBlur
        );
        commitModalSettings({ overlayBlur: Math.round(value) });
      };
      overlayBlurInput.addEventListener("change", syncOverlayBlurFromTextBox);
      overlayBlurInput.addEventListener("blur", syncOverlayBlurFromTextBox);
      overlayBlurInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncOverlayBlurFromTextBox();
          overlayBlurInput.blur();
        }
      });
    }

    if (overlayOpacitySlider) {
      overlayOpacitySlider.addEventListener("input", () => {
        const value = clampNumber(
          overlayOpacitySlider.value,
          OVERLAY_OPACITY_MIN,
          OVERLAY_OPACITY_MAX,
          settingsState.overlayOpacity
        );
        commitModalSettings({ overlayOpacity: Math.round(value) });
      });
    }

    if (overlayOpacityInput) {
      const syncOverlayOpacityFromTextBox = () => {
        const value = clampNumber(
          overlayOpacityInput.value,
          OVERLAY_OPACITY_MIN,
          OVERLAY_OPACITY_MAX,
          settingsState.overlayOpacity
        );
        commitModalSettings({ overlayOpacity: Math.round(value) });
      };
      overlayOpacityInput.addEventListener("change", syncOverlayOpacityFromTextBox);
      overlayOpacityInput.addEventListener("blur", syncOverlayOpacityFromTextBox);
      overlayOpacityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncOverlayOpacityFromTextBox();
          overlayOpacityInput.blur();
        }
      });
    }

    if (modalScaleSlider) {
      modalScaleSlider.addEventListener("input", () => {
        const value = clampNumber(
          modalScaleSlider.value,
          MODAL_SCALE_MIN,
          MODAL_SCALE_MAX,
          settingsState.modalScale
        );
        commitModalSettings({ modalScale: Math.round(value) });
      });
    }

    if (modalScaleInput) {
      const syncModalScaleFromTextBox = () => {
        const value = clampNumber(
          modalScaleInput.value,
          MODAL_SCALE_MIN,
          MODAL_SCALE_MAX,
          settingsState.modalScale
        );
        commitModalSettings({ modalScale: Math.round(value) });
      };
      modalScaleInput.addEventListener("change", syncModalScaleFromTextBox);
      modalScaleInput.addEventListener("blur", syncModalScaleFromTextBox);
      modalScaleInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncModalScaleFromTextBox();
          modalScaleInput.blur();
        }
      });
    }

    if (modalOpacitySlider) {
      modalOpacitySlider.addEventListener("input", () => {
        const value = clampNumber(
          modalOpacitySlider.value,
          MODAL_OPACITY_MIN,
          MODAL_OPACITY_MAX,
          settingsState.modalOpacity
        );
        commitModalSettings({ modalOpacity: Math.round(value) });
      });
    }

    if (modalOpacityInput) {
      const syncModalOpacityFromTextBox = () => {
        const value = clampNumber(
          modalOpacityInput.value,
          MODAL_OPACITY_MIN,
          MODAL_OPACITY_MAX,
          settingsState.modalOpacity
        );
        commitModalSettings({ modalOpacity: Math.round(value) });
      };
      modalOpacityInput.addEventListener("change", syncModalOpacityFromTextBox);
      modalOpacityInput.addEventListener("blur", syncModalOpacityFromTextBox);
      modalOpacityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncModalOpacityFromTextBox();
          modalOpacityInput.blur();
        }
      });
    }

    settingsAnchorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = String(button.getAttribute("data-settings-anchor-target") || "").trim();
        if (!target) return;
        commitModalSettings({ activePage: "settings" }, { preserveScroll: false });
        scrollToSettingsSection(target);
      });
    });

    if (settingsPageScrollHost) {
      onSettingsPageScroll = () => {
        if (settingsAnchorScrollRafId) return;
        settingsAnchorScrollRafId = global.requestAnimationFrame(() => {
          settingsAnchorScrollRafId = 0;
          syncSettingsAnchorByScroll();
        });
      };
      settingsPageScrollHost.addEventListener("scroll", onSettingsPageScroll, { passive: true });
    }

    Array.from(shadow.querySelectorAll('input[type="range"]'))
      .filter((slider) => slider && slider.id !== "accent-hue-slider")
      .forEach((slider) => attachSliderPhysics(slider));

    resetSettingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const settingName = String(button.getAttribute("data-reset-setting") || "").trim();
        if (!settingName) return;
        resetSettingToDefault(settingName);
        setActionFeedback("Setting reset to default.", "success");
      });
    });

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

    if (reducedMotionPreference) {
      onReducedMotionChange = () => {
        if (settingsState.animationFollowDevice !== false) {
          applyModalSettings();
        }
      };
      if (typeof reducedMotionPreference.addEventListener === "function") {
        reducedMotionPreference.addEventListener("change", onReducedMotionChange);
      } else if (typeof reducedMotionPreference.addListener === "function") {
        reducedMotionPreference.addListener(onReducedMotionChange);
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
      syncSettingsAnchorByScroll();
    };
    global.addEventListener("resize", onWindowResize);

    applyStatusAccent();
    syncLabelChipState();
    syncNumberVisibility();
    syncLabelChipOverflowState();
    applyModalSettings();
    autoResizeTextareas.forEach(autoResizeTextarea);
    setActionFeedback(editorHintMessage, "muted");
    renderDrafts();
    unbindLofiButton = bindLofiToggle();

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

    if (draftsSelectAll) {
      draftsSelectAll.addEventListener("change", () => {
        if (draftsSelectAll.checked) {
          selectedDraftIds = new Set(draftsState.map((draft) => draft.id));
        } else {
          selectedDraftIds.clear();
        }
        renderDrafts();
      });
    }

    if (draftsBulkDeleteBtn) {
      draftsBulkDeleteBtn.addEventListener("click", () => {
        openDraftDeleteConfirm(Array.from(selectedDraftIds));
      });
    }

    if (draftsConfirmCancelBtn) {
      draftsConfirmCancelBtn.addEventListener("click", () => {
        closeDraftDeleteConfirm();
      });
    }

    if (draftsConfirmDeleteBtn) {
      draftsConfirmDeleteBtn.addEventListener("click", () => {
        const deleteIds = new Set(pendingDeleteDraftIds);
        if (!deleteIds.size) {
          closeDraftDeleteConfirm();
          return;
        }
        draftsState = draftsState.filter((draft) => !deleteIds.has(draft.id));
        selectedDraftIds = new Set(Array.from(selectedDraftIds).filter((id) => !deleteIds.has(id)));
        saveDrafts(draftsState);
        closeDraftDeleteConfirm();
        renderDrafts();
        showToast("Drafts deleted.", "success");
      });
    }

    if (draftsConfirmBackdrop) {
      draftsConfirmBackdrop.addEventListener("click", (event) => {
        if (event.target !== draftsConfirmBackdrop) return;
        closeDraftDeleteConfirm();
      });
    }

    if (draftsReplaceConfirmCancelBtn) {
      draftsReplaceConfirmCancelBtn.addEventListener("click", () => {
        closeDraftReplaceConfirm();
      });
    }

    if (draftsReplaceConfirmContinueBtn) {
      draftsReplaceConfirmContinueBtn.addEventListener("click", () => {
        const draft = getDraftById(pendingReplaceDraftId);
        closeDraftReplaceConfirm();
        if (!draft) return;
        loadDraftIntoEditor(draft);
      });
    }

    if (draftsReplaceConfirmBackdrop) {
      draftsReplaceConfirmBackdrop.addEventListener("click", (event) => {
        if (event.target !== draftsReplaceConfirmBackdrop) return;
        closeDraftReplaceConfirm();
      });
    }

    syncCopyMainButton();

    if (copyMenu && copyMenuTrigger) {
      if (typeof copyMenu.showPopover !== "function") {
        copyMenuTrigger.addEventListener("click", () => {
          copyMenu.classList.toggle("is-open-fallback");
          copyMenuTrigger.classList.toggle("is-open", copyMenu.classList.contains("is-open-fallback"));
          if (copyMenu.classList.contains("is-open-fallback")) {
            positionPopoverNearTrigger(copyMenu, copyMenuTrigger, "end");
          }
        });

        shadow.addEventListener("click", (event) => {
          if (!copyMenu.classList.contains("is-open-fallback")) return;
          const path = typeof event.composedPath === "function" ? event.composedPath() : [];
          if (path.includes(copyMenu) || path.includes(copyMenuTrigger)) return;
          copyMenu.classList.remove("is-open-fallback");
          copyMenuTrigger.classList.remove("is-open");
        });
      } else {
        copyMenu.addEventListener("toggle", () => {
          let open = false;
          try {
            open = copyMenu.matches(":popover-open");
          } catch {
            open = false;
          }
          copyMenuTrigger.classList.toggle("is-open", open);
          if (open) positionPopoverNearTrigger(copyMenu, copyMenuTrigger, "end");
        });
      }
    }

    copyMenuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const selectedFormat = String(item.getAttribute("data-copy-format") || "").trim();
        if (!Object.prototype.hasOwnProperty.call(COPY_FORMATS, selectedFormat)) return;
        activeCopyFormat = selectedFormat;
        syncCopyMainButton();

        if (copyMenu) {
          if (typeof copyMenu.hidePopover === "function") {
            copyMenu.hidePopover();
          } else {
            copyMenu.classList.remove("is-open-fallback");
            if (copyMenuTrigger) copyMenuTrigger.classList.remove("is-open");
          }
        }
      });
    });

    copyMainBtn.addEventListener("click", async () => {
      if (typeof buildHTML !== "function") return;
      const insertData = collectInsertData();

      let copied = false;
      if (activeCopyFormat === "inner-html") {
        copied = await copyInnerHtmlToClipboard(buildHTML(insertData));
      } else if (activeCopyFormat === "raw-text") {
        copied = await copyTextToClipboard(buildRawText(insertData));
      } else if (activeCopyFormat === "markdown") {
        copied = await copyTextToClipboard(buildMarkdown(insertData));
      }

      const label = (COPY_FORMATS[activeCopyFormat] || COPY_FORMATS["inner-html"]).label;
      setActionFeedback(copied ? `${label} copied to clipboard.` : "Copy failed. Clipboard blocked.", copied ? "success" : "error");
    });

    if (checkUpdatesBtn) {
      checkUpdatesBtn.addEventListener("click", async () => {
        if (isCheckingUpdates) return;
        if (!updateUrl) {
          setActionFeedback("Update URL is unavailable in this runtime.", "error");
          return;
        }

        isCheckingUpdates = true;
        checkUpdatesBtn.disabled = true;
        setActionFeedback("Checking for updates...", "muted");

        try {
          const response = await fetch(updateUrl, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`Failed to fetch update script (${response.status}).`);
          }

          const remoteScript = await response.text();
          const remoteVersion = extractRemoteVersion(remoteScript);
          if (!remoteVersion) {
            throw new Error("Version token not found in remote userscript.");
          }

          if (compareVersions(remoteVersion, currentVersion) <= 0) {
            setActionFeedback(`You are on the latest version (${currentVersion}).`, "success");
            return;
          }

          const prompt = `New version ${remoteVersion} is available (current ${currentVersion}). Open the update window now?`;
          const confirmed = typeof global.confirm === "function" ? global.confirm(prompt) : true;

          if (!confirmed) {
            setActionFeedback(`Update ${remoteVersion} is available.`, "muted");
            return;
          }

          const opened = openUpdatePopup(updateUrl);
          if (!opened) {
            global.open(updateUrl, "_blank");
          }

          setActionFeedback(
            `Update ${remoteVersion} opened. Confirm install in Tampermonkey.`,
            "success"
          );
        } catch (error) {
          const message = error && error.message ? error.message : "Update check failed.";
          setActionFeedback(message, "error");
        } finally {
          isCheckingUpdates = false;
          checkUpdatesBtn.disabled = false;
        }
      });
    }

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

