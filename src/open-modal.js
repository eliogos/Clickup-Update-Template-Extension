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
  const RADIO_STATION_OPTIONS = Object.freeze([
    Object.freeze({
      id: "zeno-tabzverz0fctv",
      label: "Zeno - tabzverz0fctv",
      url: "https://stream.zeno.fm/tabzverz0fctv"
    }),
    Object.freeze({
      id: "yesstreaming-ec6-1455",
      label: "Yesstreaming - ec6:1455",
      url: "https://ec6.yesstreaming.net:1455/stream"
    }),
    Object.freeze({
      id: "zeno-60cb36c29heuv",
      label: "Zeno - 60cb36c29heuv",
      url: "https://stream-148.zeno.fm/60cb36c29heuv"
    }),
    Object.freeze({
      id: "zeno-sh37pvfd938uv",
      label: "Zeno - sh37pvfd938uv",
      url: "https://stream-142.zeno.fm/sh37pvfd938uv"
    }),
    Object.freeze({
      id: "radioboss-c22",
      label: "RadioBoss - c22/autodj",
      url: "https://c22.radioboss.fm:8808/autodj"
    }),
    Object.freeze({
      id: "live-streams-mscp3",
      label: "Live Streams NL - mscp3",
      url: "https://mscp3.live-streams.nl:8020/radio"
    }),
    Object.freeze({
      id: "radiomerge-uk7",
      label: "RadioMerge - UK7",
      url: "https://uk7.internet-radio.com/proxy/radiomerge?mp=/stream;"
    }),
    Object.freeze({
      id: "magic-radiocast",
      label: "Magic RadioCast",
      url: "https://magic.radioca.st/stream/1/"
    }),
    Object.freeze({
      id: "starfm-zamboanga",
      label: "Star FM - Zamboanga",
      url: "https://stream-142.zeno.fm/sfaqs2c29heuv"
    })
  ]);
  const AMBIENT_NOISE_TRACKS = Object.freeze([
    Object.freeze({
      id: "rain",
      label: "Rain",
      emoji: "🌧️",
      url: "https://cdn.pixabay.com/audio/2024/01/25/audio_b05a8ceddc.mp3",
      delayMs: 280
    }),
    Object.freeze({
      id: "beach",
      label: "Beach Waves",
      emoji: "🌊",
      url: "https://cdn.pixabay.com/audio/2025/09/28/audio_9dfcc1b4a0.mp3",
      delayMs: 440
    }),
    Object.freeze({
      id: "crickets",
      label: "Crickets",
      emoji: "🦗",
      url: "https://cdn.pixabay.com/audio/2024/07/11/audio_8e769c443c.mp3",
      delayMs: 900
    }),
    Object.freeze({
      id: "thunder",
      label: "Thunder",
      emoji: "⛈️",
      url: "https://cdn.pixabay.com/audio/2025/07/20/audio_ccae6a4443.mp3",
      delayMs: 1800
    }),
    Object.freeze({
      id: "city",
      label: "City",
      emoji: "🏙️",
      url: "https://cdn.pixabay.com/audio/2022/10/03/audio_dbd7cf044b.mp3",
      delayMs: 620
    }),
    Object.freeze({
      id: "white",
      label: "White Noise",
      emoji: "📻",
      url: "https://cdn.pixabay.com/audio/2025/06/11/audio_74ef2ac17b.mp3",
      delayMs: 220
    })
  ]);
  const AMBIENT_NOISE_IDS = new Set(AMBIENT_NOISE_TRACKS.map((track) => track.id));
  const RADIO_STATION_URLS = new Set(RADIO_STATION_OPTIONS.map((station) => String(station.url || "").trim().toLowerCase()));
  const DEFAULT_RADIO_STATION_URL = RADIO_STATION_OPTIONS[0].url;
  const LOFI_VOLUME_STORAGE_KEY = "clickup-update-modal.lofi.volume.v1";
  const MAX_DRAFTS = 40;
  const UI_FONT_SIZE_MIN = 11;
  const UI_FONT_SIZE_MAX = 20;
  const EDITOR_FONT_SIZE_MIN = 10;
  const EDITOR_FONT_SIZE_MAX = 24;
  const ANIMATION_SPEED_MIN = 0;
  const ANIMATION_SPEED_MAX = 5;
  // Preset order: Sluggish, Slow, Normal, Fast, Hyper, Off
  // Values are speed factors; final CSS duration scale is derived as 1 / speed.
  const ANIMATION_SPEED_SCALES = Object.freeze([0.1, 0.5, 1, 1.5, 3, 0]);
  const REDUCED_MOTION_SCALE_CAP = 0.4;
  const INTERPOLATOR_MODE_OPTIONS = new Set(["preset", "expression", "curve"]);
  const AI_QUERY_PROVIDER_OPTIONS = new Set(["chatgpt", "claude", "perplexity", "grok", "gemini"]);
  const AUDIO_BPM_INFLUENCE_MODE_OPTIONS = new Set(["animation", "both", "physics"]);
  const AUDIO_STREAM_SOURCE_OPTIONS = new Set(["lofi", "radio"]);
  const INTERPOLATOR_NERD_RATINGS = Object.freeze({
    preset: 1,
    curve: 2,
    expression: 3
  });
  const INTERPOLATOR_PRESET_OPTIONS = new Set(["default", "linear", "ease-in", "ease-out", "ease-in-out", "stop-motion"]);
  const STOP_MOTION_STEPS = 10;
  const STOP_MOTION_DROP_INTERVAL = 3;
  const DEFAULT_INTERPOLATOR_CURVE = Object.freeze({ p1x: 0.2, p1y: 0.9, p2x: 0.2, p2y: 1 });
  const MAX_CUSTOM_CURVE_POINTS = 6;
  const PHYSICS_INTENSITY_MIN = 0;
  const PHYSICS_INTENSITY_MAX = 500;
  const PHYSICS_BPM_OFFSET_MIN = -40;
  const PHYSICS_BPM_OFFSET_MAX = 40;
  const LOFI_RATE_MIN = 0.5;
  const LOFI_RATE_MAX = 1.5;
  const LOFI_8D_DEPTH_MIN = 0;
  const LOFI_8D_DEPTH_MAX = 100;
  const LOFI_8D_RATE_MIN = 0.1;
  const LOFI_8D_RATE_MAX = 4;
  const AUDIO_BPM_INFLUENCE_STRENGTH_MIN = 0;
  const AUDIO_BPM_INFLUENCE_STRENGTH_MAX = 100;
  const SFX_VOLUME_MIN = 0;
  const SFX_VOLUME_MAX = 200;
  const SFX_VOLUME_SNAP_POINTS = Object.freeze([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200]);
  const AMBIENT_VOLUME_MIN = 0;
  const AMBIENT_VOLUME_MAX = 100;
  const OVERLAY_BLUR_MIN = 0;
  const OVERLAY_BLUR_MAX = 20;
  const OVERLAY_OPACITY_MIN = 0;
  const OVERLAY_OPACITY_MAX = 100;
  const ACCESSIBILITY_CONTRAST_MIN = 50;
  const ACCESSIBILITY_CONTRAST_MAX = 150;
  const ACCESSIBILITY_SATURATION_MIN = 50;
  const ACCESSIBILITY_SATURATION_MAX = 150;
  const MODAL_SCALE_MIN = 70;
  const MODAL_SCALE_MAX = 130;
  const MODAL_OPACITY_MIN = 10;
  const MODAL_OPACITY_MAX = 100;
  const BASE_LOFI_BPM = 84;
  const LOCAL_STORAGE_ESTIMATED_LIMIT_BYTES = 5 * 1024 * 1024;
  const TRIGGER_ACTIVATION_OPTIONS = new Set(["space", "immediate"]);
  const PAGE_OPTIONS = new Set(["editor", "settings", "variables", "drafts", "usage", "radio", "about"]);
  const THEME_OPTIONS = new Set(["light", "auto", "dark"]);
  const DENSITY_OPTIONS = new Set(["compact", "comfortable", "spacious"]);
  const COLOR_VISION_OPTIONS = new Set(["none", "protanopia", "deuteranopia", "tritanopia"]);
  const COLOR_VISION_MODE_DESCRIPTIONS = Object.freeze({
    none: "No filter is applied. Choose a mode if you want color adjustment support.",
    protanopia: "Protanopia mode (no red): adjusts colors to make the UI easier to read.",
    deuteranopia: "Deuteranopia mode (no green): adjusts colors to make the UI easier to read.",
    tritanopia: "Tritanopia mode (no blue): adjusts colors to make the UI easier to read."
  });
  const ACCENT_PRESETS = Object.freeze({
    blue: 218,
    teal: 182,
    green: 146,
    amber: 40,
    violet: 272,
    rose: 342
  });
  const ACCENT_PRESET_OKLCH_HUES = Object.freeze({
    ...ACCENT_PRESETS,
    amber: 92,
    violet: 308,
    rose: 20
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
    accentPartyMode: false,
    uiFontSize: 13,
    editorFontSize: 13,
    animationSpeed: 2,
    interpolatorMode: "preset",
    interpolatorPreset: "default",
    interpolatorExpression: "1 - pow(1 - t, 2)",
    interpolatorWordWrap: true,
    aiQueryProvider: "chatgpt",
    interpolatorCurve: { ...DEFAULT_INTERPOLATOR_CURVE },
    interpolatorCurvePoints: [],
    musicAutoplay: true,
    lofiSpeedRate: 1,
    lofiPitchRate: 1,
    lofiRatePitchSync: true,
    lofi8dEnabled: true,
    lofi8dDepth: 94,
    lofi8dRate: 1,
    keepRadioOn: false,
    audioStreamSource: "lofi",
    radioStationUrl: DEFAULT_RADIO_STATION_URL,
    ambientRainEnabled: false,
    ambientRainVolume: 35,
    ambientBeachEnabled: false,
    ambientBeachVolume: 35,
    ambientCricketsEnabled: false,
    ambientCricketsVolume: 35,
    ambientThunderEnabled: false,
    ambientThunderVolume: 35,
    ambientCityEnabled: false,
    ambientCityVolume: 35,
    ambientWhiteEnabled: false,
    ambientWhiteVolume: 35,
    sfxVolume: 100,
    sfxMuted: false,
    sfxAdaptiveBlend: false,
    audioBpmInfluenceEnabled: false,
    audioBpmInfluenceMode: "both",
    audioBpmInfluenceStrength: 40,
    animationFollowDevice: false,
    physicsEnabled: true,
    physicsIntensity: 55,
    physicsSyncToMusic: false,
    physicsBpmOffset: 0,
    overlayBlur: 2,
    overlayOpacity: 64,
    accessibilityContrast: 100,
    accessibilitySaturation: 100,
    modalScale: 100,
    modalOpacity: 100,
    insertAnimatedPaste: false,
    triggerText: DEFAULT_TRIGGER_TEXT,
    triggerActivation: DEFAULT_TRIGGER_ACTIVATION
  });

  let modalCssCache = null;

  function clampNumber(value, min, max, fallback) {
    const n = parseFloat(String(value).trim());
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function snapToNearestPoint(value, points, fallback) {
    const source = Array.isArray(points) ? points : [];
    if (!source.length) return fallback;
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    let best = source[0];
    let bestDistance = Math.abs(n - best);
    for (let index = 1; index < source.length; index += 1) {
      const candidate = source[index];
      const distance = Math.abs(n - candidate);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    return best;
  }

  function snapSfxVolumeValue(value, fallback = 100) {
    const clamped = clampNumber(value, SFX_VOLUME_MIN, SFX_VOLUME_MAX, fallback);
    return snapToNearestPoint(clamped, SFX_VOLUME_SNAP_POINTS, fallback);
  }

  function normalizeAmbientVolume(value, fallback = 35) {
    return Math.round(clampNumber(value, AMBIENT_VOLUME_MIN, AMBIENT_VOLUME_MAX, fallback));
  }

  function normalizeRadioStationUrl(value, fallback = DEFAULT_RADIO_STATION_URL) {
    const fallbackUrl = String(fallback || DEFAULT_RADIO_STATION_URL).trim() || DEFAULT_RADIO_STATION_URL;
    const canonicalizeRadioUrl = (url) => {
      const rawUrl = String(url == null ? "" : url).trim();
      if (rawUrl === "http://c22.radioboss.fm:8808/autodj") return "https://c22.radioboss.fm:8808/autodj";
      if (rawUrl === "http://mscp3.live-streams.nl:8020/radio") return "https://mscp3.live-streams.nl:8020/radio";
      return rawUrl;
    };
    const canonicalFallback = canonicalizeRadioUrl(fallbackUrl) || fallbackUrl;
    const raw = canonicalizeRadioUrl(value);
    if (!raw) return canonicalFallback;
    const normalized = raw.toLowerCase();
    if (!RADIO_STATION_URLS.has(normalized)) return canonicalFallback;
    const match = RADIO_STATION_OPTIONS.find((station) => String(station.url || "").trim().toLowerCase() === normalized);
    return match ? match.url : canonicalFallback;
  }

  function getRadioStationByUrl(url) {
    const normalized = normalizeRadioStationUrl(url, DEFAULT_RADIO_STATION_URL).toLowerCase();
    return RADIO_STATION_OPTIONS.find((station) => String(station.url || "").trim().toLowerCase() === normalized)
      || RADIO_STATION_OPTIONS[0];
  }

  function getAudioStreamUrlForSettings(settings) {
    const source = settings && AUDIO_STREAM_SOURCE_OPTIONS.has(settings.audioStreamSource)
      ? settings.audioStreamSource
      : DEFAULT_MODAL_SETTINGS.audioStreamSource;
    if (source === "radio") {
      return normalizeRadioStationUrl(
        settings ? settings.radioStationUrl : DEFAULT_MODAL_SETTINGS.radioStationUrl,
        DEFAULT_MODAL_SETTINGS.radioStationUrl
      );
    }
    return LOFI_STREAM_URL;
  }

  function normalizeModalSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const sourceActivePage = String(source.activePage || "").trim().toLowerCase();
    const normalizedActivePage = sourceActivePage === "audio" ? "radio" : sourceActivePage;
    const activePage = PAGE_OPTIONS.has(normalizedActivePage)
      ? normalizedActivePage
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
    const insertAnimatedPaste = source.insertAnimatedPaste === true;
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
    const lofi8dDepth = clampNumber(
      source.lofi8dDepth,
      LOFI_8D_DEPTH_MIN,
      LOFI_8D_DEPTH_MAX,
      DEFAULT_MODAL_SETTINGS.lofi8dDepth
    );
    const lofi8dRate = clampNumber(
      source.lofi8dRate,
      LOFI_8D_RATE_MIN,
      LOFI_8D_RATE_MAX,
      DEFAULT_MODAL_SETTINGS.lofi8dRate
    );
    const audioStreamSource = AUDIO_STREAM_SOURCE_OPTIONS.has(String(source.audioStreamSource || "").trim().toLowerCase())
      ? String(source.audioStreamSource).trim().toLowerCase()
      : DEFAULT_MODAL_SETTINGS.audioStreamSource;
    const radioStationUrl = normalizeRadioStationUrl(
      source.radioStationUrl == null ? source.radioChannel : source.radioStationUrl,
      DEFAULT_MODAL_SETTINGS.radioStationUrl
    );
    const sfxVolume = snapSfxVolumeValue(
      source.sfxVolume,
      DEFAULT_MODAL_SETTINGS.sfxVolume
    );
    const ambientRainVolume = normalizeAmbientVolume(
      source.ambientRainVolume,
      DEFAULT_MODAL_SETTINGS.ambientRainVolume
    );
    const ambientBeachVolume = normalizeAmbientVolume(
      source.ambientBeachVolume,
      DEFAULT_MODAL_SETTINGS.ambientBeachVolume
    );
    const ambientCricketsVolume = normalizeAmbientVolume(
      source.ambientCricketsVolume,
      DEFAULT_MODAL_SETTINGS.ambientCricketsVolume
    );
    const ambientThunderVolume = normalizeAmbientVolume(
      source.ambientThunderVolume,
      DEFAULT_MODAL_SETTINGS.ambientThunderVolume
    );
    const ambientCityVolume = normalizeAmbientVolume(
      source.ambientCityVolume,
      DEFAULT_MODAL_SETTINGS.ambientCityVolume
    );
    const ambientWhiteVolume = normalizeAmbientVolume(
      source.ambientWhiteVolume,
      DEFAULT_MODAL_SETTINGS.ambientWhiteVolume
    );
    const audioBpmInfluenceMode = AUDIO_BPM_INFLUENCE_MODE_OPTIONS.has(String(source.audioBpmInfluenceMode || "").trim().toLowerCase())
      ? String(source.audioBpmInfluenceMode).trim().toLowerCase()
      : DEFAULT_MODAL_SETTINGS.audioBpmInfluenceMode;
    const audioBpmInfluenceStrength = clampNumber(
      source.audioBpmInfluenceStrength,
      AUDIO_BPM_INFLUENCE_STRENGTH_MIN,
      AUDIO_BPM_INFLUENCE_STRENGTH_MAX,
      DEFAULT_MODAL_SETTINGS.audioBpmInfluenceStrength
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
    const aiQueryProvider = AI_QUERY_PROVIDER_OPTIONS.has(String(source.aiQueryProvider || "").trim().toLowerCase())
      ? String(source.aiQueryProvider).trim().toLowerCase()
      : DEFAULT_MODAL_SETTINGS.aiQueryProvider;
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
    const accessibilityContrast = clampNumber(
      source.accessibilityContrast,
      ACCESSIBILITY_CONTRAST_MIN,
      ACCESSIBILITY_CONTRAST_MAX,
      DEFAULT_MODAL_SETTINGS.accessibilityContrast
    );
    const accessibilitySaturation = clampNumber(
      source.accessibilitySaturation,
      ACCESSIBILITY_SATURATION_MIN,
      ACCESSIBILITY_SATURATION_MAX,
      DEFAULT_MODAL_SETTINGS.accessibilitySaturation
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
      accentPartyMode: source.accentPartyMode === true,
      uiFontSize,
      editorFontSize,
      animationSpeed,
      interpolatorMode,
      interpolatorPreset,
      interpolatorExpression,
      interpolatorWordWrap: source.interpolatorWordWrap !== false,
      aiQueryProvider,
      interpolatorCurve,
      interpolatorCurvePoints,
      musicAutoplay: source.musicAutoplay !== false,
      lofiSpeedRate,
      lofiPitchRate,
      lofiRatePitchSync: source.lofiRatePitchSync !== false,
      lofi8dEnabled: source.lofi8dEnabled !== false,
      lofi8dDepth,
      lofi8dRate,
      keepRadioOn: source.keepRadioOn === true,
      audioStreamSource,
      radioStationUrl,
      ambientRainEnabled: source.ambientRainEnabled === true,
      ambientRainVolume,
      ambientBeachEnabled: source.ambientBeachEnabled === true,
      ambientBeachVolume,
      ambientCricketsEnabled: source.ambientCricketsEnabled === true,
      ambientCricketsVolume,
      ambientThunderEnabled: source.ambientThunderEnabled === true,
      ambientThunderVolume,
      ambientCityEnabled: source.ambientCityEnabled === true,
      ambientCityVolume,
      ambientWhiteEnabled: source.ambientWhiteEnabled === true,
      ambientWhiteVolume,
      sfxVolume: Math.round(sfxVolume),
      sfxMuted: source.sfxMuted === true,
      sfxAdaptiveBlend: source.sfxAdaptiveBlend === true,
      audioBpmInfluenceEnabled: source.audioBpmInfluenceEnabled === true,
      audioBpmInfluenceMode,
      audioBpmInfluenceStrength: Math.round(audioBpmInfluenceStrength),
      animationFollowDevice: source.animationFollowDevice === true,
      physicsEnabled: source.physicsEnabled !== false,
      physicsIntensity,
      physicsSyncToMusic: source.physicsSyncToMusic === true,
      physicsBpmOffset: Math.round(physicsBpmOffset),
      overlayBlur,
      overlayOpacity,
      accessibilityContrast: Math.round(accessibilityContrast),
      accessibilitySaturation: Math.round(accessibilitySaturation),
      modalScale,
      modalOpacity,
      insertAnimatedPaste,
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
    if (app._lofiController && app._lofiController.__controllerVersion === "lofi-spatial-v2") {
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
    const beatListeners = new Set();
    const state = {
      playing: false,
      failed: false,
      disabledReason: "",
      volume: 0.35,
      speedRate: 1,
      pitchRate: 1,
      ratePitchSync: true,
      spatialEnabled: true,
      spatialDepth: 0.94,
      spatialRate: 1
    };

    const audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.autoplay = false;
    const MODAL_AUDIO_FADE_IN_MS = 900;
    const MODAL_AUDIO_FADE_OUT_MS = 900;
    const LOFI_8D_PAN_RATE_HZ = 0.095;
    const LOFI_8D_PROXIMITY_GAIN_MIN = 0.78;
    const LOFI_8D_PROXIMITY_GAIN_MAX = 1.0;
    const LOFI_8D_PROXIMITY_CUTOFF_MIN = 2600;
    const LOFI_8D_PROXIMITY_CUTOFF_MAX = 12000;
    const BPM_DEBUG_MIN_BEAT_GAP_MS = 240;
    let attemptedAutoplay = false;
    let fadeFrame = 0;
    let fadeToken = 0;
    let sourceInitPromise = null;
    let sourceReady = false;
    let streamAbort = null;
    let streamObjectUrl = "";
    let currentStreamUrl = LOFI_STREAM_URL;
    let lastNonZeroVolume = state.volume;
    let spatialAudioContext = null;
    let spatialSourceNode = null;
    let spatialPannerNode = null;
    let spatialFilterNode = null;
    let spatialGainNode = null;
    let spatialAnalyserNode = null;
    let spatialPanFrame = 0;
    let spatialPanStartedAt = 0;
    let beatDetectFrame = 0;
    let beatLastDetectedAt = 0;
    let beatLastEmitAt = 0;
    let beatLastVisualizerEmitAt = 0;
    let beatEnergyEma = 0;
    let beatRmsEma = 0;
    let beatIntervalsMs = [];

    const emitBeat = (payload) => {
      beatListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch {
          // Ignore listener errors.
        }
      });
    };

    const stopBeatDebugLoop = () => {
      if (beatDetectFrame) {
        global.cancelAnimationFrame(beatDetectFrame);
        beatDetectFrame = 0;
      }
      beatLastEmitAt = 0;
      beatLastVisualizerEmitAt = 0;
    };

    const startBeatDebugLoop = () => {
      if (!spatialAnalyserNode) return;
      if (!state.playing) return;
      if (beatDetectFrame) return;
      const frequencyData = new Uint8Array(spatialAnalyserNode.frequencyBinCount);
      const timeDomainData = new Uint8Array(spatialAnalyserNode.fftSize);

      const step = () => {
        beatDetectFrame = 0;
        if (!state.playing || !spatialAnalyserNode) return;
        spatialAnalyserNode.getByteFrequencyData(frequencyData);
        spatialAnalyserNode.getByteTimeDomainData(timeDomainData);
        const now = global.performance ? global.performance.now() : Date.now();

        const lowBandCount = Math.max(8, Math.floor(frequencyData.length * 0.2));
        let lowBandEnergy = 0;
        for (let i = 0; i < lowBandCount; i += 1) {
          lowBandEnergy += frequencyData[i];
        }
        lowBandEnergy /= (lowBandCount * 255);

        let rms = 0;
        for (let i = 0; i < timeDomainData.length; i += 1) {
          const centered = (timeDomainData[i] - 128) / 128;
          rms += centered * centered;
        }
        rms = Math.sqrt(rms / Math.max(1, timeDomainData.length));

        beatEnergyEma = beatEnergyEma > 0 ? ((beatEnergyEma * 0.9) + (lowBandEnergy * 0.1)) : lowBandEnergy;
        beatRmsEma = beatRmsEma > 0 ? ((beatRmsEma * 0.88) + (rms * 0.12)) : rms;
        const beatThreshold = Math.max(0.07, beatEnergyEma * 1.27);
        const rmsThreshold = Math.max(0.028, beatRmsEma * 1.12);
        const beatDetected = lowBandEnergy > beatThreshold && rms > rmsThreshold && (now - beatLastDetectedAt) > BPM_DEBUG_MIN_BEAT_GAP_MS;
        let detectedBeatBpm = null;

        if (beatDetected) {
          const interval = beatLastDetectedAt > 0 ? (now - beatLastDetectedAt) : 0;
          beatLastDetectedAt = now;
          const emitInterval = beatLastEmitAt > 0 ? (now - beatLastEmitAt) : interval;
          beatLastEmitAt = now;
          if (interval >= BPM_DEBUG_MIN_BEAT_GAP_MS && interval <= 1600) {
            beatIntervalsMs.push(interval);
            if (beatIntervalsMs.length > 8) beatIntervalsMs.shift();
          } else if (interval > 1600) {
            beatIntervalsMs = [];
          }
          if (beatIntervalsMs.length >= 2) {
            const averageInterval = beatIntervalsMs.reduce((sum, value) => sum + value, 0) / beatIntervalsMs.length;
            detectedBeatBpm = clampNumber(Math.round(60000 / averageInterval), 55, 180, BASE_LOFI_BPM);
          }
          emitBeat({
            mode: "beat",
            estimatedBpm: Math.round(getEstimatedBpm()),
            beatBpm: detectedBeatBpm == null ? null : Math.round(detectedBeatBpm),
            intervalMs: emitInterval > 0 ? emitInterval : 0,
            energy: lowBandEnergy,
            rms
          });
        } else {
          const visualizerInterval = 88;
          const sinceVisualizerEmit = beatLastVisualizerEmitAt > 0
            ? (now - beatLastVisualizerEmitAt)
            : Number.POSITIVE_INFINITY;
          if (sinceVisualizerEmit >= visualizerInterval) {
            beatLastVisualizerEmitAt = now;
            const visualEnergy = clampNumber((lowBandEnergy * 0.72) + (rms * 0.56), 0, 1, 0.14);
            const visualRms = clampNumber((rms * 0.8) + (lowBandEnergy * 0.12), 0, 1, 0.02);
            emitBeat({
              mode: "visualizer",
              estimatedBpm: Math.round(getEstimatedBpm()),
              beatBpm: null,
              intervalMs: visualizerInterval,
              energy: visualEnergy,
              rms: visualRms
            });
          }

          const estimatedInterval = Math.round(60000 / Math.max(55, Math.min(180, getEstimatedBpm())));
          const sinceLastEmit = beatLastEmitAt > 0 ? (now - beatLastEmitAt) : Number.POSITIVE_INFINITY;
          const canEmitFallback = sinceLastEmit >= Math.max(BPM_DEBUG_MIN_BEAT_GAP_MS, estimatedInterval * 0.92);
          const analyzerFlat = lowBandEnergy < 0.01 && rms < 0.008;
          if (canEmitFallback && analyzerFlat) {
            beatLastEmitAt = now;
            emitBeat({
              mode: "fallback",
              estimatedBpm: Math.round(getEstimatedBpm()),
              beatBpm: null,
              intervalMs: estimatedInterval,
              energy: 0.2,
              rms: 0.03
            });
          }
        }

        beatDetectFrame = global.requestAnimationFrame(step);
      };

      beatDetectFrame = global.requestAnimationFrame(step);
    };

    const stopSpatialPanSweep = () => {
      if (spatialPanFrame) {
        global.cancelAnimationFrame(spatialPanFrame);
        spatialPanFrame = 0;
      }
      if (spatialPannerNode && spatialAudioContext) {
        try {
          spatialPannerNode.pan.setValueAtTime(0, spatialAudioContext.currentTime);
        } catch {
          spatialPannerNode.pan.value = 0;
        }
      }
      if (spatialGainNode && spatialAudioContext) {
        try {
          spatialGainNode.gain.setValueAtTime(1, spatialAudioContext.currentTime);
        } catch {
          spatialGainNode.gain.value = 1;
        }
      }
      if (spatialFilterNode && spatialAudioContext) {
        try {
          spatialFilterNode.frequency.setValueAtTime(LOFI_8D_PROXIMITY_CUTOFF_MAX, spatialAudioContext.currentTime);
        } catch {
          spatialFilterNode.frequency.value = LOFI_8D_PROXIMITY_CUTOFF_MAX;
        }
      }
    };

    const startSpatialPanSweep = () => {
      if (!spatialPannerNode) return;
      if (spatialPanFrame) return;
      spatialPanStartedAt = global.performance ? global.performance.now() : Date.now();

      const step = () => {
        spatialPanFrame = 0;
        if (!state.playing || !spatialPannerNode) return;
        const now = global.performance ? global.performance.now() : Date.now();
        const elapsedSeconds = Math.max(0, (now - spatialPanStartedAt) / 1000);
        const rate = LOFI_8D_PAN_RATE_HZ * clampNumber(state.spatialRate, LOFI_8D_RATE_MIN, LOFI_8D_RATE_MAX, 1);
        const angle = elapsedSeconds * Math.PI * 2 * rate;
        const panValue = Math.sin(angle) * clampNumber(state.spatialDepth, 0, 1, 0.94);
        const proximityPhase = Math.sin(angle - (Math.PI / 2));
        const proximity = (proximityPhase + 1) / 2;
        const proximityGain = LOFI_8D_PROXIMITY_GAIN_MIN + ((LOFI_8D_PROXIMITY_GAIN_MAX - LOFI_8D_PROXIMITY_GAIN_MIN) * proximity);
        const proximityCutoff = LOFI_8D_PROXIMITY_CUTOFF_MIN + ((LOFI_8D_PROXIMITY_CUTOFF_MAX - LOFI_8D_PROXIMITY_CUTOFF_MIN) * proximity);
        if (spatialAudioContext) {
          try {
            spatialPannerNode.pan.setValueAtTime(panValue, spatialAudioContext.currentTime);
          } catch {
            spatialPannerNode.pan.value = panValue;
          }
          if (spatialGainNode) {
            try {
              spatialGainNode.gain.setValueAtTime(proximityGain, spatialAudioContext.currentTime);
            } catch {
              spatialGainNode.gain.value = proximityGain;
            }
          }
          if (spatialFilterNode) {
            try {
              spatialFilterNode.frequency.setValueAtTime(proximityCutoff, spatialAudioContext.currentTime);
            } catch {
              spatialFilterNode.frequency.value = proximityCutoff;
            }
          }
        } else {
          spatialPannerNode.pan.value = panValue;
          if (spatialGainNode) {
            spatialGainNode.gain.value = proximityGain;
          }
          if (spatialFilterNode) {
            spatialFilterNode.frequency.value = proximityCutoff;
          }
        }
        spatialPanFrame = global.requestAnimationFrame(step);
      };

      spatialPanFrame = global.requestAnimationFrame(step);
    };

    const ensureSpatialPipeline = async () => {
      if (spatialPannerNode) return true;
      try {
        const AudioContextCtor = global.AudioContext || global.webkitAudioContext;
        if (!AudioContextCtor) return false;
        const ctx = spatialAudioContext || new AudioContextCtor();
        spatialAudioContext = ctx;
        if (!spatialSourceNode) {
          spatialSourceNode = ctx.createMediaElementSource(audio);
        }
        if (!spatialPannerNode) {
          spatialPannerNode = ctx.createStereoPanner();
        }
        if (!spatialFilterNode) {
          spatialFilterNode = ctx.createBiquadFilter();
          spatialFilterNode.type = "lowpass";
          spatialFilterNode.Q.value = 0.72;
          spatialFilterNode.frequency.value = LOFI_8D_PROXIMITY_CUTOFF_MAX;
        }
        if (!spatialGainNode) {
          spatialGainNode = ctx.createGain();
          spatialGainNode.gain.value = 1;
        }
        if (!spatialAnalyserNode) {
          spatialAnalyserNode = ctx.createAnalyser();
          spatialAnalyserNode.fftSize = 1024;
          spatialAnalyserNode.smoothingTimeConstant = 0.76;
        }
        try {
          spatialSourceNode.disconnect();
        } catch {
          // Ignore reconnect cleanup failures.
        }
        try {
          spatialPannerNode.disconnect();
        } catch {
          // Ignore reconnect cleanup failures.
        }
        try {
          spatialFilterNode.disconnect();
        } catch {
          // Ignore reconnect cleanup failures.
        }
        try {
          spatialGainNode.disconnect();
        } catch {
          // Ignore reconnect cleanup failures.
        }
        try {
          spatialAnalyserNode.disconnect();
        } catch {
          // Ignore reconnect cleanup failures.
        }
        spatialSourceNode.connect(spatialPannerNode);
        spatialPannerNode.connect(spatialFilterNode);
        spatialFilterNode.connect(spatialGainNode);
        spatialGainNode.connect(spatialAnalyserNode);
        spatialAnalyserNode.connect(ctx.destination);
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        if (state.playing) {
          startBeatDebugLoop();
        }
        return true;
      } catch {
        return false;
      }
    };

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

    const resetActiveSource = () => {
      cleanupStreamSource();
      sourceReady = false;
      sourceInitPromise = null;
      try {
        audio.pause();
      } catch {
        // Ignore pause errors.
      }
      try {
        audio.removeAttribute("src");
        audio.load();
      } catch {
        // Ignore source reset errors.
      }
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
        const targetUrl = currentStreamUrl;
        const tryInitStream = async (url) => {
          const isHttpTarget = /^http:\/\//i.test(url);
          if (isHttpTarget) return await streamViaGm(url);
          return await streamViaGm(url) || await streamViaFetch(url);
        };
        let ok = await tryInitStream(targetUrl);
        if (targetUrl !== currentStreamUrl) {
          sourceReady = false;
          sourceInitPromise = null;
          return false;
        }
        if (!ok) {
          if (targetUrl !== LOFI_STREAM_URL) {
            // Safety fallback so radio failures do not leave the player silent.
            currentStreamUrl = LOFI_STREAM_URL;
            ok = await tryInitStream(LOFI_STREAM_URL);
          }
        }
        sourceReady = ok === true;
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
      stopSpatialPanSweep();
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
      stopSpatialPanSweep();
      stopBeatDebugLoop();
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
      if (next > 0.001) {
        lastNonZeroVolume = next;
      }
      applyVolume(next);
      saveVolume(next);
      notify();
    };

    const toggleMute = () => {
      if (state.volume > 0.001) {
        setVolume(0);
        return;
      }
      const restore = Math.max(0, Math.min(1, Number(lastNonZeroVolume)));
      setVolume(Number.isFinite(restore) && restore > 0.001 ? restore : 0.35);
    };

    const setPlaybackTuning = ({ speedRate, pitchRate, ratePitchSync, spatialEnabled, spatialDepth, spatialRate } = {}) => {
      const nextSpeed = clampNumber(speedRate, LOFI_RATE_MIN, LOFI_RATE_MAX, state.speedRate || 1);
      const nextPitch = clampNumber(pitchRate, LOFI_RATE_MIN, LOFI_RATE_MAX, state.pitchRate || 1);
      const synced = ratePitchSync !== false;
      state.ratePitchSync = synced;
      state.speedRate = nextSpeed;
      state.pitchRate = synced ? nextSpeed : nextPitch;
      state.spatialEnabled = spatialEnabled !== false;
      state.spatialDepth = clampNumber(spatialDepth, 0, 1, state.spatialDepth || 0.94);
      state.spatialRate = clampNumber(spatialRate, LOFI_8D_RATE_MIN, LOFI_8D_RATE_MAX, state.spatialRate || 1);
      if (!state.spatialEnabled) {
        stopSpatialPanSweep();
      } else if (state.playing) {
        startSpatialPanSweep();
      }
      notify();
    };

    const setStreamUrl = (url, { restartPlayback = true } = {}) => {
      let nextUrl = String(url || "").trim();
      if (nextUrl === "http://c22.radioboss.fm:8808/autodj") nextUrl = "https://c22.radioboss.fm:8808/autodj";
      if (nextUrl === "http://mscp3.live-streams.nl:8020/radio") nextUrl = "https://mscp3.live-streams.nl:8020/radio";
      if (!nextUrl) return false;
      if (nextUrl === currentStreamUrl) return true;
      const wasPlaying = state.playing;
      stopVolumeFade();
      stopSpatialPanSweep();
      stopBeatDebugLoop();
      currentStreamUrl = nextUrl;
      resetActiveSource();
      state.playing = false;
      state.failed = false;
      state.disabledReason = "";
      notify();
      if (wasPlaying && restartPlayback !== false) {
        play({ autoplay: false }).catch(() => {});
      }
      return true;
    };

    const getStreamUrl = () => currentStreamUrl;

    const getEstimatedBpm = () => {
      return Math.round(clampNumber(BASE_LOFI_BPM * state.speedRate, 55, 180, BASE_LOFI_BPM));
    };

    const play = async ({ autoplay = false, fadeInMs = 0 } = {}) => {
      if (!autoplay) attemptedAutoplay = true;
      state.failed = false;
      try {
        stopVolumeFade();
        const sourceOk = await ensureLofiSource();
        if (!sourceOk) {
          setFailure("Failed to load stream.");
          return false;
        }
        await ensureSpatialPipeline();
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
        if (state.spatialEnabled) {
          startSpatialPanSweep();
        } else {
          stopSpatialPanSweep();
        }
        startBeatDebugLoop();
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
      return play({ autoplay, fadeInMs: MODAL_AUDIO_FADE_IN_MS });
    };

    const modalExit = () => {
      pause({ fadeOutMs: MODAL_AUDIO_FADE_OUT_MS });
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

    const subscribeBeats = (listener) => {
      if (typeof listener !== "function") return () => {};
      beatListeners.add(listener);
      return () => {
        beatListeners.delete(listener);
      };
    };

    audio.addEventListener("error", () => {
      setFailure("Failed to load stream.");
    });

    audio.addEventListener("playing", () => {
      state.playing = true;
      if (state.spatialEnabled) {
        startSpatialPanSweep();
      } else {
        stopSpatialPanSweep();
      }
      startBeatDebugLoop();
      notify();
    });

    audio.addEventListener("pause", () => {
      state.playing = false;
      stopSpatialPanSweep();
      stopBeatDebugLoop();
      notify();
    });

    const controller = {
      __controllerVersion: "lofi-spatial-v2",
      subscribe,
      toggle,
      toggleMute,
      maybeAutoplay,
      pause,
      modalEnter,
      modalExit,
      getEstimatedBpm,
      setVolume,
      setPlaybackTuning,
      setStreamUrl,
      getStreamUrl,
      subscribeBeats
    };
    const persistedVolume = readSavedVolume();
    if (persistedVolume != null) {
      state.volume = persistedVolume;
      if (persistedVolume > 0.001) {
        lastNonZeroVolume = persistedVolume;
      }
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

    // Safety net for stale/cached templates: ensure Physics exists in Settings.
    const modalCardEl = shadow.querySelector(".modal-card");
    if (modalCardEl) {
      modalCardEl.innerHTML = modalCardEl.innerHTML.replace(/{{\s*MODAL_[A-Z_]+\s*}}/g, "");
      modalCardEl.innerHTML = modalCardEl.innerHTML.replace(/{{\s*PAGE_[A-Z_]+\s*}}/g, "");
    }

    const settingsPageContent = shadow.querySelector("#page-settings .settings-page-content");
    if (settingsPageContent) {
      settingsPageContent.innerHTML = settingsPageContent.innerHTML.replace(/{{\s*SETTINGS_SECTION_[A-Z_]+\s*}}/g, "");
    }
    if (settingsPageContent && !shadow.getElementById("settings-section-physics")) {
      const physicsSection = document.createElement("section");
      physicsSection.className = "settings-section";
      physicsSection.id = "settings-section-physics";
      physicsSection.setAttribute("data-settings-anchor", "Physics");
      physicsSection.innerHTML = `
        <p class="settings-section-title">Physics</p>
        <div class="settings-field" id="physics-intensity-field">
          <div class="settings-label-row">
            <span class="settings-label">Physics Effects <span class="floating-tooltip-pill floating-tooltip-pill-value settings-shortcut-pill">P</span></span>
            <button class="settings-reset-btn" type="button" data-reset-setting="physicsEnabled" title="Reset physics effects">
              <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
            </button>
          </div>
          <label class="settings-switch" for="animation-enable-physics">
            <input type="checkbox" id="animation-enable-physics" checked />
            <span class="settings-switch-track" aria-hidden="true"><span class="settings-switch-thumb"></span></span>
            <span class="settings-switch-text">Enable physics effects</span>
          </label>
          <p class="field-subtext">Adds subtle bounce and tilt feedback to controls.</p>
          <div class="settings-conditional-body" id="physics-intensity-body">
            <div class="settings-label-row">
              <label class="settings-label" for="physics-intensity-slider">Physics Intensity</label>
              <button class="settings-reset-btn" type="button" data-reset-setting="physicsIntensity" title="Reset physics intensity">
                <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
              </button>
            </div>
            <div class="editor-font-size-row">
              <input class="field editor-font-size-input" id="physics-intensity-input" type="number" min="0" max="500" step="1" inputmode="numeric" />
              <input class="editor-font-size-slider" id="physics-intensity-slider" type="range" min="0" max="500" step="1" />
            </div>
            <p class="field-subtext">Changes how strong the bounce and tilt feel.</p>
          </div>
        </div>`;
      settingsPageContent.appendChild(physicsSection);
    }
    if (settingsPageContent && !shadow.getElementById("settings-section-ai-search-provider")) {
      const aiSearchSection = document.createElement("section");
      aiSearchSection.className = "settings-section";
      aiSearchSection.id = "settings-section-ai-search-provider";
      aiSearchSection.setAttribute("data-settings-anchor", "AI Search");
      aiSearchSection.innerHTML = `
        <p class="settings-section-title">AI Search Engine</p>
        <div class="settings-field ai-provider-field">
          <div class="settings-label-row">
            <span class="settings-label">Engine</span>
            <button class="settings-reset-btn" type="button" data-reset-setting="aiQueryProvider" title="Reset AI search engine">
              <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
            </button>
          </div>
          <div class="ai-provider-grid" role="radiogroup" aria-label="AI Search Engine">
            <label class="ai-provider-card">
              <input type="radio" name="ai-query-provider" value="chatgpt" data-ai-query-provider />
              <img class="ai-provider-logo" src="https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64" alt="" aria-hidden="true" />
              <span>ChatGPT</span>
            </label>
            <label class="ai-provider-card">
              <input type="radio" name="ai-query-provider" value="claude" data-ai-query-provider />
              <img class="ai-provider-logo" src="https://cdn.simpleicons.org/anthropic/ffffff" alt="" aria-hidden="true" />
              <span>Claude</span>
            </label>
            <label class="ai-provider-card">
              <input type="radio" name="ai-query-provider" value="perplexity" data-ai-query-provider />
              <img class="ai-provider-logo" src="https://cdn.simpleicons.org/perplexity/ffffff" alt="" aria-hidden="true" />
              <span>Perplexity</span>
            </label>
            <label class="ai-provider-card">
              <input type="radio" name="ai-query-provider" value="grok" data-ai-query-provider />
              <img class="ai-provider-logo" src="https://cdn.simpleicons.org/x/ffffff" alt="" aria-hidden="true" />
              <span>Grok</span>
            </label>
            <label class="ai-provider-card">
              <input type="radio" name="ai-query-provider" value="gemini" data-ai-query-provider />
              <img class="ai-provider-logo" src="https://cdn.simpleicons.org/googlegemini/ffffff" alt="" aria-hidden="true" />
              <span>Gemini</span>
            </label>
          </div>
          <p class="field-subtext">Currently used for interpolation Ask/Explain actions.</p>
        </div>`;
      const physicsSectionEl = shadow.getElementById("settings-section-physics");
      if (physicsSectionEl && physicsSectionEl.parentNode === settingsPageContent) {
        physicsSectionEl.insertAdjacentElement("afterend", aiSearchSection);
      } else {
        settingsPageContent.appendChild(aiSearchSection);
      }
    }

    const settingsAnchorRailEl = shadow.querySelector("#settings-anchor-rail");
    if (settingsAnchorRailEl && !settingsAnchorRailEl.querySelector("[data-settings-anchor-target='settings-section-physics']")) {
      const physicsAnchorBtn = document.createElement("button");
      physicsAnchorBtn.className = "settings-anchor-btn";
      physicsAnchorBtn.type = "button";
      physicsAnchorBtn.setAttribute("data-settings-anchor-target", "settings-section-physics");
      physicsAnchorBtn.setAttribute("aria-label", "Go to Physics");
      physicsAnchorBtn.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">bolt</span>
        <span class="settings-anchor-label">Physics</span>`;
      settingsAnchorRailEl.appendChild(physicsAnchorBtn);
    }
    if (settingsAnchorRailEl && !settingsAnchorRailEl.querySelector("[data-settings-anchor-target='settings-section-ai-search-provider']")) {
      const aiSearchAnchorBtn = document.createElement("button");
      aiSearchAnchorBtn.className = "settings-anchor-btn";
      aiSearchAnchorBtn.type = "button";
      aiSearchAnchorBtn.setAttribute("data-settings-anchor-target", "settings-section-ai-search-provider");
      aiSearchAnchorBtn.setAttribute("aria-label", "Go to AI Search");
      aiSearchAnchorBtn.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">manage_search</span>
        <span class="settings-anchor-label">AI Search</span>`;
      settingsAnchorRailEl.appendChild(aiSearchAnchorBtn);
    }
    if (settingsAnchorRailEl) {
      const legacyAudioAnchorBtn = settingsAnchorRailEl.querySelector("[data-settings-anchor-target='settings-section-audio']");
      if (legacyAudioAnchorBtn) {
        legacyAudioAnchorBtn.remove();
      }
    }

    // Normalize section and anchor order.
    if (settingsPageContent) {
      const desiredSectionOrder = [
        "settings-section-trigger",
        "settings-section-appearance",
        "settings-section-typography",
        "settings-section-overlay",
        "settings-section-accessibility",
        "settings-section-animation",
        "settings-section-physics",
        "settings-section-audio",
        "settings-section-ai-search-provider"
      ];
      desiredSectionOrder.forEach((sectionId) => {
        const section = shadow.getElementById(sectionId);
        if (section && section.parentNode === settingsPageContent) {
          settingsPageContent.appendChild(section);
        }
      });
    }
    if (settingsAnchorRailEl) {
      const desiredAnchorOrder = [
        "settings-section-trigger",
        "settings-section-appearance",
        "settings-section-typography",
        "settings-section-overlay",
        "settings-section-accessibility",
        "settings-section-animation",
        "settings-section-physics",
        "settings-section-ai-search-provider"
      ];
      desiredAnchorOrder.forEach((targetId) => {
        const anchorBtn = settingsAnchorRailEl.querySelector(`[data-settings-anchor-target='${targetId}']`);
        if (anchorBtn) {
          settingsAnchorRailEl.appendChild(anchorBtn);
        }
      });
    }

    const modalMainContentEl = shadow.querySelector("#modal-main-content");
    if (modalMainContentEl && !shadow.querySelector('[data-page="usage"]')) {
      const usagePanel = document.createElement("section");
      usagePanel.className = "page-panel";
      usagePanel.setAttribute("data-page", "usage");
      usagePanel.id = "page-usage";
      usagePanel.hidden = true;
      usagePanel.innerHTML = `
        <div class="page-scroll">
          <div class="settings-page-content">
            <section class="settings-section">
              <p class="settings-section-title">Local Storage Usage</p>
              <p class="field-subtext">Quick look at your saved data footprint on this ClickUp origin.</p>
              <div class="usage-meter" id="usage-storage-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Local storage usage">
                <span class="usage-meter-fill" id="usage-storage-fill"></span>
              </div>
              <p class="field-subtext" id="usage-storage-text">Using 0 B of 5.00 MiB (0.00%).</p>
              <div class="settings-two-column">
                <div class="settings-field">
                  <p class="settings-label">Drafts</p>
                  <div class="usage-meter" id="usage-drafts-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Drafts storage usage">
                    <span class="usage-meter-fill" id="usage-drafts-fill"></span>
                  </div>
                  <p class="field-subtext" id="usage-drafts-text">0 B (0.00%).</p>
                </div>
                <div class="settings-field">
                  <p class="settings-label">Settings</p>
                  <div class="usage-meter" id="usage-settings-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Settings storage usage">
                    <span class="usage-meter-fill" id="usage-settings-fill"></span>
                  </div>
                  <p class="field-subtext" id="usage-settings-text">0 B (0.00%).</p>
                </div>
                <div class="settings-field">
                  <p class="settings-label">Others (used by ClickUp)</p>
                  <div class="usage-meter" id="usage-others-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Other local storage usage">
                    <span class="usage-meter-fill" id="usage-others-fill"></span>
                  </div>
                  <p class="field-subtext" id="usage-others-text">0 B (0.00%).</p>
                </div>
              </div>
              <p class="field-subtext" id="usage-storage-limit-note">
                Estimated localStorage limit is around 5 MiB on most browsers.
                <a href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria" target="_blank" rel="noopener noreferrer">See browser quota notes.</a>
              </p>
              <div class="settings-inline-actions">
                <button class="btn btn-secondary" id="usage-reset-settings-btn" type="button">
                  <span class="material-symbols-outlined" aria-hidden="true">delete_sweep</span>
                  Reset Settings
                </button>
              </div>
            </section>
          </div>
        </div>`;
      modalMainContentEl.insertBefore(usagePanel, shadow.querySelector("#page-about") || null);
    }
    if (modalMainContentEl && !shadow.querySelector('[data-page="radio"]')) {
      const radioPanel = document.createElement("section");
      radioPanel.className = "page-panel";
      radioPanel.setAttribute("data-page", "radio");
      radioPanel.id = "page-radio";
      radioPanel.hidden = true;
      radioPanel.innerHTML = `
        <div class="page-scroll">
          <div class="settings-page-content">
            <section class="settings-section">
              <p class="settings-section-title">Radio</p>
              <p class="field-subtext">Music and SFX controls live here.</p>

              <div class="settings-two-column audio-settings-split">
                <div class="settings-field audio-settings-column">
                  <p class="audio-settings-subtitle">Music</p>

                  <div class="settings-field">
                    <div class="settings-label-row">
                      <span class="settings-label">Music Autoplay</span>
                      <button class="settings-reset-btn" type="button" data-reset-setting="musicAutoplay" title="Reset music autoplay">
                        <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                      </button>
                    </div>
                    <label class="settings-switch" for="lofi-autoplay">
                      <input type="checkbox" id="lofi-autoplay" checked />
                      <span class="settings-switch-track" aria-hidden="true"><span class="settings-switch-thumb"></span></span>
                      <span class="settings-switch-text">Autoplay music when opening the modal [Double Space]</span>
                    </label>
                  </div>
                  <div class="settings-field">
                    <label class="settings-switch" for="keep-radio-on">
                      <input type="checkbox" id="keep-radio-on" />
                      <span class="settings-switch-track" aria-hidden="true"><span class="settings-switch-thumb"></span></span>
                      <span class="settings-switch-text">Keep Radio on (play in background after closing modal)</span>
                    </label>
                  </div>

                  <div class="settings-field">
                    <div class="settings-label-row">
                      <span class="settings-label">8D Audio</span>
                      <button class="settings-reset-btn" type="button" data-reset-setting="lofi8d" title="Reset 8D audio">
                        <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                      </button>
                    </div>
                    <label class="settings-switch" for="lofi-8d-enabled">
                      <input type="checkbox" id="lofi-8d-enabled" checked />
                      <span class="settings-switch-track" aria-hidden="true"><span class="settings-switch-thumb"></span></span>
                      <span class="settings-switch-text">Sweep audio around you with surround/proximity movement</span>
                    </label>
                    <p class="field-subtext field-subtext-warning settings-tip-row">
                      <span class="material-symbols-outlined settings-tip-icon" aria-hidden="true">headphones</span>
                      <span>Best when wearing headphones</span>
                    </p>
                    <div class="settings-conditional-body" id="lofi-8d-controls-body">
                      <div class="settings-field">
                        <label class="settings-label" for="lofi-8d-rate-slider">8D Sweep Speed</label>
                        <div class="editor-font-size-row">
                          <input class="field editor-font-size-input" id="lofi-8d-rate-input" type="number" min="0.1" max="4" step="0.1" inputmode="decimal" />
                          <input class="editor-font-size-slider" id="lofi-8d-rate-slider" type="range" min="0.1" max="4" step="0.1" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div class="settings-field audio-settings-column">
                  <div class="settings-label-row">
                    <p class="audio-settings-subtitle">SFX</p>
                    <button class="settings-reset-btn" type="button" data-reset-setting="sfxMix" title="Reset SFX settings">
                      <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                    </button>
                  </div>

                  <label class="settings-label" for="sfx-volume-slider">SFX Volume</label>
                  <div class="sfx-volume-row">
                    <button class="btn audio-inline-mute-btn" id="sfx-mute-btn" type="button" aria-pressed="false">Mute</button>
                    <input class="editor-font-size-slider sfx-volume-slider" id="sfx-volume-slider" type="range" min="0" max="200" step="1" />
                    <span class="sfx-volume-value" id="sfx-volume-value">100</span>
                    <span class="sfx-volume-max">200</span>
                  </div>

                  <label class="append-number-wrap settings-checkbox" for="sfx-adaptive-blend">
                    <input type="checkbox" id="sfx-adaptive-blend" />
                    <span>Adaptive blend <span class="experimental-pill">Experimental</span></span>
                  </label>
                  <p class="field-subtext">Tries to reduce SFX and music overlap during busy moments.</p>
                </div>
              </div>
              <div class="settings-field audio-settings-column audio-channel-column">
                <div class="settings-label-row">
                  <p class="audio-settings-subtitle">Channel</p>
                  <button class="settings-reset-btn" type="button" data-reset-setting="audioStreamSource" title="Reset music source and station">
                    <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                  </button>
                </div>
                <div class="settings-segmented" id="audio-stream-source-group" role="tablist" aria-label="Music source">
                  <button class="settings-segment-btn" type="button" data-audio-stream-source="lofi">Default</button>
                  <button class="settings-segment-btn" type="button" data-audio-stream-source="radio">Radio</button>
                </div>
                <div class="audio-channel-nav">
                  <button class="btn btn-secondary audio-channel-nav-btn" id="radio-channel-prev" type="button">Prev</button>
                  <div class="select-wrap settings-select-wrap">
                    <select class="field settings-select" id="radio-channel-select">
                      <option value="https://stream.zeno.fm/tabzverz0fctv">Zeno - tabzverz0fctv</option>
                      <option value="https://stream-148.zeno.fm/60cb36c29heuv">Zeno - 60cb36c29heuv</option>
                      <option value="https://stream-142.zeno.fm/sh37pvfd938uv">Zeno - sh37pvfd938uv</option>
                      <option value="https://ec6.yesstreaming.net:1455/stream">Yesstreaming - ec6:1455</option>
                      <option value="https://c22.radioboss.fm:8808/autodj">RadioBoss - c22/autodj</option>
                      <option value="https://mscp3.live-streams.nl:8020/radio">Live Streams NL - mscp3</option>
                      <option value="https://uk7.internet-radio.com/proxy/radiomerge?mp=/stream;">RadioMerge - UK7</option>
                      <option value="https://magic.radioca.st/stream/1/">Magic RadioCast</option>
                      <option value="https://stream-142.zeno.fm/sfaqs2c29heuv">Star FM - Zamboanga</option>
                    </select>
                    <span class="select-icon" aria-hidden="true"></span>
                  </div>
                  <button class="btn btn-secondary audio-channel-nav-btn" id="radio-channel-next" type="button">Next</button>
                </div>
                <p class="field-subtext" id="radio-channel-status">Switches only when the selected channel is valid.</p>
              </div>

              <div class="settings-field audio-settings-column audio-ambient-section">
                <div class="settings-label-row">
                  <p class="audio-settings-subtitle">Ambient Noise</p>
                  <button class="settings-reset-btn" type="button" data-reset-setting="ambientNoise" title="Reset ambient noise">
                    <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                  </button>
                </div>
                <p class="field-subtext">Additive layers that can run together with music/radio.</p>
                <div class="ambient-noise-selector" aria-label="Ambient noise layers">
                  <button class="ambient-noise-chip" type="button" data-ambient-track-button="rain" title="Rain">🌧️</button>
                  <button class="ambient-noise-chip" type="button" data-ambient-track-button="beach" title="Beach Waves">🌊</button>
                  <button class="ambient-noise-chip" type="button" data-ambient-track-button="crickets" title="Crickets">🦗</button>
                  <button class="ambient-noise-chip" type="button" data-ambient-track-button="thunder" title="Thunder">⛈️</button>
                  <button class="ambient-noise-chip" type="button" data-ambient-track-button="city" title="City">🏙️</button>
                  <button class="ambient-noise-chip" type="button" data-ambient-track-button="white" title="White Noise">📻</button>
                </div>
                <div class="settings-inline-actions">
                  <button class="btn btn-secondary" id="ambient-randomize-btn" type="button" hidden>Randomize Volumes</button>
                </div>
                <div class="ambient-noise-panels">
                  <div class="ambient-noise-panel" data-ambient-panel="rain" hidden>
                    <div class="ambient-noise-panel-head">
                      <span class="ambient-noise-name">Rain</span>
                    </div>
                    <div class="ambient-noise-volume-row">
                      <input class="editor-font-size-slider" id="ambient-rain-volume" type="range" min="0" max="100" step="1" />
                      <span class="sfx-volume-value" id="ambient-rain-volume-value">35</span>
                    </div>
                  </div>
                  <div class="ambient-noise-panel" data-ambient-panel="beach" hidden>
                    <div class="ambient-noise-panel-head">
                      <span class="ambient-noise-name">Beach Waves</span>
                    </div>
                    <div class="ambient-noise-volume-row">
                      <input class="editor-font-size-slider" id="ambient-beach-volume" type="range" min="0" max="100" step="1" />
                      <span class="sfx-volume-value" id="ambient-beach-volume-value">35</span>
                    </div>
                  </div>
                  <div class="ambient-noise-panel" data-ambient-panel="crickets" hidden>
                    <div class="ambient-noise-panel-head">
                      <span class="ambient-noise-name">Crickets</span>
                    </div>
                    <div class="ambient-noise-volume-row">
                      <input class="editor-font-size-slider" id="ambient-crickets-volume" type="range" min="0" max="100" step="1" />
                      <span class="sfx-volume-value" id="ambient-crickets-volume-value">35</span>
                    </div>
                  </div>
                  <div class="ambient-noise-panel" data-ambient-panel="thunder" hidden>
                    <div class="ambient-noise-panel-head">
                      <span class="ambient-noise-name">Thunder</span>
                    </div>
                    <div class="ambient-noise-volume-row">
                      <input class="editor-font-size-slider" id="ambient-thunder-volume" type="range" min="0" max="100" step="1" />
                      <span class="sfx-volume-value" id="ambient-thunder-volume-value">35</span>
                    </div>
                  </div>
                  <div class="ambient-noise-panel" data-ambient-panel="city" hidden>
                    <div class="ambient-noise-panel-head">
                      <span class="ambient-noise-name">City</span>
                    </div>
                    <div class="ambient-noise-volume-row">
                      <input class="editor-font-size-slider" id="ambient-city-volume" type="range" min="0" max="100" step="1" />
                      <span class="sfx-volume-value" id="ambient-city-volume-value">35</span>
                    </div>
                  </div>
                  <div class="ambient-noise-panel" data-ambient-panel="white" hidden>
                    <div class="ambient-noise-panel-head">
                      <span class="ambient-noise-name">White Noise</span>
                    </div>
                    <div class="ambient-noise-volume-row">
                      <input class="editor-font-size-slider" id="ambient-white-volume" type="range" min="0" max="100" step="1" />
                      <span class="sfx-volume-value" id="ambient-white-volume-value">35</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>`;
      modalMainContentEl.insertBefore(radioPanel, shadow.querySelector("#page-about") || null);
    }
    const sidebarNavEl = shadow.querySelector("#sidebar-nav");
    if (sidebarNavEl && !sidebarNavEl.querySelector('[data-page-target="usage"]')) {
      const usageBtn = document.createElement("button");
      usageBtn.className = "sidebar-page-btn";
      usageBtn.type = "button";
      usageBtn.setAttribute("data-page-target", "usage");
      usageBtn.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">database</span>
        <span>Usage</span>`;
      sidebarNavEl.insertBefore(usageBtn, sidebarNavEl.querySelector('[data-page-target="about"]') || null);
    }
    if (sidebarNavEl && !sidebarNavEl.querySelector('[data-page-target="radio"]')) {
      const radioBtn = document.createElement("button");
      radioBtn.className = "sidebar-page-btn";
      radioBtn.type = "button";
      radioBtn.setAttribute("data-page-target", "radio");
      radioBtn.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">radio</span>
        <span>Radio</span>`;
      sidebarNavEl.insertBefore(radioBtn, sidebarNavEl.querySelector('[data-page-target="about"]') || null);
    }

    // Safety net for stale/cached templates: ensure overlay fragments exist.
    if (modalCardEl && !shadow.getElementById("modal-confetti-canvas")) {
      const confettiFallback = document.createElement("canvas");
      confettiFallback.className = "modal-confetti-canvas";
      confettiFallback.id = "modal-confetti-canvas";
      confettiFallback.setAttribute("aria-hidden", "true");
      confettiFallback.hidden = true;
      const modalBodyLayoutEl = shadow.getElementById("modal-body-layout");
      if (modalBodyLayoutEl) {
        modalBodyLayoutEl.appendChild(confettiFallback);
      } else {
        modalCardEl.appendChild(confettiFallback);
      }
    }
    if (modalCardEl && !shadow.getElementById("modal-toast")) {
      const toastFallback = document.createElement("div");
      toastFallback.className = "modal-toast";
      toastFallback.id = "modal-toast";
      toastFallback.hidden = true;
      modalCardEl.appendChild(toastFallback);
    }
    if (modalCardEl && !shadow.getElementById("modal-konami-overlay")) {
      const konamiOverlayFallback = document.createElement("div");
      konamiOverlayFallback.className = "modal-konami-overlay";
      konamiOverlayFallback.id = "modal-konami-overlay";
      konamiOverlayFallback.hidden = true;
      konamiOverlayFallback.setAttribute("aria-hidden", "true");
      konamiOverlayFallback.innerHTML = `
        <div class="modal-konami-overlay-chip">
          <div class="modal-konami-overlay-symbol" id="modal-konami-overlay-symbol">↑</div>
          <div class="modal-konami-overlay-label" id="modal-konami-overlay-label">Arrow Up</div>
        </div>`;
      modalCardEl.appendChild(konamiOverlayFallback);
    }

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
    const actionStatus = byId("action-status");
    const modalToast = byId("modal-toast");
    const modalKonamiOverlay = byId("modal-konami-overlay");
    const modalKonamiOverlaySymbol = byId("modal-konami-overlay-symbol");
    const modalKonamiOverlayLabel = byId("modal-konami-overlay-label");
    const modalConfettiCanvas = byId("modal-confetti-canvas");
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
    const accentPartyToggle = byId("accent-party-toggle");
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
    const insertAnimatedPasteInput = byId("insert-animated-paste");
    const uiFontSizeInput = byId("ui-font-size-input");
    const uiFontSizeSlider = byId("ui-font-size-slider");
    const editorFontSizeInput = byId("editor-font-size-input");
    const editorFontSizeSlider = byId("editor-font-size-slider");
    const animationPreviewBox = byId("animation-preview-box");
    const animationPreviewDot = byId("animation-preview-dot");
    const animationPreviewToggle = byId("animation-preview-toggle");
    const animationSpeedSlider = byId("animation-speed-slider");
    const interpolatorModeButtons = Array.from(shadow.querySelectorAll("[data-interpolator-mode]"));
    const interpolatorNerdRating = shadow.querySelector(".interpolator-nerd-rating");
    const interpolatorPresetInput = byId("interpolator-preset");
    const interpolatorExpressionEditor = byId("interpolator-expression-editor");
    const interpolatorExpressionInput = byId("interpolator-expression");
    const interpolatorExpressionSaveBtn = byId("interpolator-expression-save");
    const interpolatorWordWrapInput = byId("interpolator-word-wrap");
    const interpolatorAskAiLink = byId("interpolator-ask-ai-link");
    const interpolatorExplainExpressionLink = byId("interpolator-explain-expression-link");
    const aiQueryProviderInputs = Array.from(shadow.querySelectorAll("[data-ai-query-provider]"));
    const interpolatorExpressionValid = byId("interpolator-expression-valid");
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
    const keepRadioOnInput = byId("keep-radio-on");
    const lofi8dEnabledInput = byId("lofi-8d-enabled");
    const lofi8dControlsBody = byId("lofi-8d-controls-body");
    const lofi8dRateInput = byId("lofi-8d-rate-input");
    const lofi8dRateSlider = byId("lofi-8d-rate-slider");
    const audioStreamSourceButtons = Array.from(shadow.querySelectorAll("[data-audio-stream-source]"));
    const radioChannelSelect = byId("radio-channel-select");
    const radioChannelPrevBtn = byId("radio-channel-prev");
    const radioChannelNextBtn = byId("radio-channel-next");
    const radioChannelStatus = byId("radio-channel-status");
    const sfxVolumeSlider = byId("sfx-volume-slider");
    const sfxVolumeValue = byId("sfx-volume-value");
    const sfxMuteBtn = byId("sfx-mute-btn");
    const sfxAdaptiveBlendInput = byId("sfx-adaptive-blend");
    const ambientTrackButtons = Array.from(shadow.querySelectorAll("[data-ambient-track-button]"));
    const ambientTrackPanels = Array.from(shadow.querySelectorAll("[data-ambient-panel]"));
    const ambientRandomizeBtn = byId("ambient-randomize-btn");
    const audioBpmInfluenceEnabledInput = byId("audio-bpm-influence-enabled");
    const audioBpmInfluenceBody = byId("audio-bpm-influence-body");
    const audioBpmInfluenceModeSlider = byId("audio-bpm-influence-mode-slider");
    const audioBpmInfluenceStrengthInput = byId("audio-bpm-influence-strength-input");
    const audioBpmInfluenceStrengthSlider = byId("audio-bpm-influence-strength-slider");
    const audioBpmInfluencePreview = byId("audio-bpm-influence-preview");
    const lofiSpeedRateSlider = byId("lofi-speed-rate-slider");
    const lofiPitchRateSlider = byId("lofi-pitch-rate-slider");
    const lofiSpeedRateValue = byId("lofi-speed-rate-value");
    const lofiPitchRateValue = byId("lofi-pitch-rate-value");
    const lofiRateSyncBtn = byId("lofi-rate-sync");
    const animationFollowDeviceInput = byId("animation-follow-device");
    const animationEnablePhysicsInput = byId("animation-enable-physics");
    const physicsIntensityBody = byId("physics-intensity-body");
    const physicsIntensityInput = byId("physics-intensity-input");
    const physicsIntensitySlider = byId("physics-intensity-slider");
    const overlayBlurInput = byId("overlay-blur-input");
    const overlayBlurSlider = byId("overlay-blur-slider");
    const overlayOpacityInput = byId("overlay-opacity-input");
    const overlayOpacitySlider = byId("overlay-opacity-slider");
    const accessibilityContrastInput = byId("accessibility-contrast-input");
    const accessibilityContrastSlider = byId("accessibility-contrast-slider");
    const accessibilitySaturationInput = byId("accessibility-saturation-input");
    const accessibilitySaturationSlider = byId("accessibility-saturation-slider");
    const modalScaleInput = byId("modal-scale-input");
    const modalScaleSlider = byId("modal-scale-slider");
    const modalOpacityInput = byId("modal-opacity-input");
    const modalOpacitySlider = byId("modal-opacity-slider");
    const settingsAnchorRail = byId("settings-anchor-rail");
    const settingsAnchorButtons = Array.from(shadow.querySelectorAll("[data-settings-anchor-target]"));
    const settingsPagePanel = byId("page-settings");
    const settingsPageScrollHost = settingsPagePanel ? settingsPagePanel.querySelector(".page-scroll") : null;
    const usageStorageMeter = byId("usage-storage-meter");
    const usageStorageFill = byId("usage-storage-fill");
    const usageStorageText = byId("usage-storage-text");
    const usageDraftsMeter = byId("usage-drafts-meter");
    const usageDraftsFill = byId("usage-drafts-fill");
    const usageDraftsText = byId("usage-drafts-text");
    const usageSettingsMeter = byId("usage-settings-meter");
    const usageSettingsFill = byId("usage-settings-fill");
    const usageSettingsText = byId("usage-settings-text");
    const usageOthersMeter = byId("usage-others-meter");
    const usageOthersFill = byId("usage-others-fill");
    const usageOthersText = byId("usage-others-text");
    const usageResetSettingsBtn = byId("usage-reset-settings-btn");
    const themeGroup = byId("theme-group");
    const densityGroup = byId("density-group");
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
    const editorHintMessage = "You can set Files and Mentions after insert.";
    const COPY_FORMATS = Object.freeze({
      "inner-html": { label: "Copy innerHTML", icon: "code" },
      "plain-text": { label: "Plain Text", icon: "text_snippet" },
      markdown: { label: "Copy Markdown", icon: "markdown" }
    });

    let selected = defaultBannerColor;
    let isCheckingUpdates = false;
    let selectedDraftIds = new Set();
    let pendingDeleteDraftIds = [];
    let pendingReplaceDraftId = "";
    let toastHideTimer = 0;
    let toastProgressRafId = 0;
    let toastStartedAt = 0;
    let toastDurationMs = 0;
    let closed = false;
    let close = () => {};
    let chipResizeObserver = null;
    let settingsState = readModalSettings();
    let draftsState = readDrafts();
    const settingsSuccessTimers = new WeakMap();
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
    let unbindLofiBeatSnap = null;
    let lofiPlaybackSnapshot = { playing: false, volume: 0.35, failed: false };
    let lastPartyBeatAt = 0;
    let partyBeatIntervalEma = 0;
    let partyBeatEnergyEma = 0;
    let partyBeatRmsEma = 0;
    let audioInfluenceBeatBoost = 0;
    let audioInfluenceLastBeatImpact = 0;
    let audioInfluenceLastFactorAt = 0;
    let cleanupFloatingTooltip = null;
    let showFloatingTooltipForElement = () => {};
    let syncKonamiTooltipProgress = () => {};
    let accentPartyTimer = 0;
    let partyBassPulseResetTimer = 0;
    let partyBassScaleCurrent = 1;
    let partyBassEnergyEma = 0;
    let partyBassRmsEma = 0;
    let partyBassPeakEma = 0;
    let partyBassLastPulseAt = 0;
    let partyHueCurrent = 0;
    let uiSfxAudioContext = null;
    let uiSfxMasterGain = null;
    let uiSfxNoiseBuffer = null;
    let uiSfxLastTypingAt = 0;
    let uiSfxLastClickAt = 0;
    let uiSfxLastConfettiAt = 0;
    let uiSfxLastSliderAt = 0;
    let radioStationValidationToken = 0;
    let radioStationApplyPending = false;
    const ambientTrackState = new Map();
    let pendingSpaceShortcutTimer = 0;
    let pendingSpaceShortcutAt = 0;
    const uiSfxSliderLastValue = new WeakMap();
    let konamiProgressIndex = 0;
    let konamiLastKeyAt = 0;
    let konamiOverlayHideTimer = 0;
    let confettiCanvas = null;
    let confettiContext = null;
    let confettiRafId = 0;
    let confettiUntil = 0;
    let confettiParticles = [];
    let iconNoTranslateObserver = null;
    let interpolatorExpressionFn = (t) => t;
    let interpolatorExpressionDraft = String(settingsState.interpolatorExpression || "");
    let interpolatorExpressionDirty = false;
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

    const ICON_TRANSLATE_SELECTOR = ".material-symbols-outlined, .material-icons";
    const enforceIconNoTranslate = (iconNode) => {
      if (!(iconNode instanceof Element)) return;
      iconNode.setAttribute("translate", "no");
      iconNode.classList.add("notranslate");
    };
    const enforceIconsNoTranslate = (rootNode) => {
      const isElementRoot = rootNode instanceof Element;
      const isShadowRoot = typeof global.ShadowRoot === "function" && rootNode instanceof global.ShadowRoot;
      if (!isElementRoot && !isShadowRoot) return;
      const iconNodes = Array.from(rootNode.querySelectorAll(ICON_TRANSLATE_SELECTOR));
      iconNodes.forEach(enforceIconNoTranslate);
    };

    enforceIconsNoTranslate(shadow);
    if (typeof global.MutationObserver === "function") {
      iconNoTranslateObserver = new global.MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches(ICON_TRANSLATE_SELECTOR)) {
              enforceIconNoTranslate(node);
            }
            enforceIconsNoTranslate(node);
          });
        });
      });
      iconNoTranslateObserver.observe(shadow, { childList: true, subtree: true });
    }
    migrateTitleTooltips();

    const formatBytes = (bytes) => {
      const safeBytes = Math.max(0, Number(bytes) || 0);
      if (safeBytes < 1024) return `${safeBytes.toFixed(0)} B`;
      const kib = safeBytes / 1024;
      if (kib < 1024) return `${kib.toFixed(2)} KiB`;
      const mib = kib / 1024;
      return `${mib.toFixed(2)} MiB`;
    };

    const getLocalStorageUsageBytes = () => {
      if (!global.localStorage) return 0;
      let bytes = 0;
      try {
        for (let index = 0; index < global.localStorage.length; index += 1) {
          const key = global.localStorage.key(index) || "";
          const value = global.localStorage.getItem(key) || "";
          bytes += (new Blob([key]).size + new Blob([value]).size);
        }
      } catch {
        return 0;
      }
      return bytes;
    };

    const getLocalStorageEntryBytes = (storageKey) => {
      if (!global.localStorage || !storageKey) return 0;
      try {
        const value = global.localStorage.getItem(storageKey);
        if (value == null) return 0;
        return new Blob([storageKey]).size + new Blob([value]).size;
      } catch {
        return 0;
      }
    };

    const updateUsagePanel = () => {
      if (!usageStorageMeter || !usageStorageFill || !usageStorageText) return;
      const usedBytes = getLocalStorageUsageBytes();
      const maxBytes = LOCAL_STORAGE_ESTIMATED_LIMIT_BYTES;
      const ratio = Math.max(0, Math.min(1, usedBytes / Math.max(1, maxBytes)));
      const percent = ratio * 100;
      usageStorageFill.style.width = `${percent.toFixed(2)}%`;
      usageStorageMeter.setAttribute("aria-valuenow", percent.toFixed(2));
      usageStorageText.textContent = `Using ${formatBytes(usedBytes)} of ${formatBytes(maxBytes)} (${percent.toFixed(2)}%).`;

      const draftsBytes = getLocalStorageEntryBytes(DRAFTS_STORAGE_KEY);
      const draftsRatio = Math.max(0, Math.min(1, draftsBytes / Math.max(1, maxBytes)));
      const draftsPercent = draftsRatio * 100;
      if (usageDraftsFill) {
        usageDraftsFill.style.width = `${draftsPercent.toFixed(2)}%`;
      }
      if (usageDraftsMeter) {
        usageDraftsMeter.setAttribute("aria-valuenow", draftsPercent.toFixed(2));
      }
      if (usageDraftsText) {
        usageDraftsText.textContent = `${formatBytes(draftsBytes)} (${draftsPercent.toFixed(2)}%).`;
      }

      const settingsBytes = getLocalStorageEntryBytes(SETTINGS_STORAGE_KEY);
      const settingsRatio = Math.max(0, Math.min(1, settingsBytes / Math.max(1, maxBytes)));
      const settingsPercent = settingsRatio * 100;
      if (usageSettingsFill) {
        usageSettingsFill.style.width = `${settingsPercent.toFixed(2)}%`;
      }
      if (usageSettingsMeter) {
        usageSettingsMeter.setAttribute("aria-valuenow", settingsPercent.toFixed(2));
      }
      if (usageSettingsText) {
        usageSettingsText.textContent = `${formatBytes(settingsBytes)} (${settingsPercent.toFixed(2)}%).`;
      }

      const otherBytes = Math.max(0, usedBytes - draftsBytes - settingsBytes);
      const othersRatio = Math.max(0, Math.min(1, otherBytes / Math.max(1, maxBytes)));
      const othersPercent = othersRatio * 100;
      if (usageOthersFill) {
        usageOthersFill.style.width = `${othersPercent.toFixed(2)}%`;
      }
      if (usageOthersMeter) {
        usageOthersMeter.setAttribute("aria-valuenow", othersPercent.toFixed(2));
      }
      if (usageOthersText) {
        usageOthersText.textContent = `${formatBytes(otherBytes)} (${othersPercent.toFixed(2)}%).`;
      }
    };

    const setupFloatingTooltip = () => {
      if (!shadow || !modal || !modalCard) return () => {};
      modalCard.setAttribute("data-tooltip-mode", "floating");

      const tooltip = document.createElement("div");
      tooltip.className = "floating-tooltip";
      tooltip.setAttribute("popover", "manual");
      tooltip.hidden = true;
      modal.appendChild(tooltip);
      const canUseTooltipPopover = typeof tooltip.showPopover === "function" && typeof tooltip.hidePopover === "function";

      let visible = false;
      let revealTooltipRafId = 0;
      let stickyTooltipTimer = 0;
      let activeTooltipTarget = null;
      const TOOLTIP_TOKEN_PATTERN = /(\[[^\]]+\]|\b\d+%?\b)/g;
      const normalizeTooltipToken = (token) => {
        const key = String(token || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
        if (key === "↑") return "up";
        if (key === "↓") return "down";
        if (key === "←") return "left";
        if (key === "→") return "right";
        if (key === "<-") return "left";
        if (key === "->") return "right";
        if (key === "arrowup") return "up";
        if (key === "arrowdown") return "down";
        if (key === "arrowleft") return "left";
        if (key === "arrowright") return "right";
        return key;
      };
      const getAiProviderLogoUrl = (providerKey) => {
        const key = String(providerKey || "").trim().toLowerCase();
        if (key === "chatgpt") return "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64";
        if (key === "claude") return "https://cdn.simpleicons.org/anthropic/ffffff";
        if (key === "perplexity") return "https://cdn.simpleicons.org/perplexity/ffffff";
        if (key === "grok") return "https://cdn.simpleicons.org/x/ffffff";
        if (key === "gemini") return "https://cdn.simpleicons.org/googlegemini/ffffff";
        return "";
      };
      const appendTooltipTokens = (container, lineText) => {
        const parts = String(lineText || "").split(TOOLTIP_TOKEN_PATTERN);
        parts.forEach((part) => {
          if (!part) return;
          const shortcutMatch = part.match(/^\[([^\]]+)\]$/);
          if (shortcutMatch) {
            const rawShortcut = String(shortcutMatch[1] || "").trim();
            const aiLogoMatch = rawShortcut.match(/^ai-logo:([a-z0-9_-]+)$/i);
            if (aiLogoMatch) {
              const logoUrl = getAiProviderLogoUrl(aiLogoMatch[1]);
              if (logoUrl) {
                const logo = document.createElement("img");
                logo.className = "floating-tooltip-provider-logo";
                logo.src = logoUrl;
                logo.alt = "";
                logo.setAttribute("aria-hidden", "true");
                container.appendChild(logo);
                return;
              }
            }
            if (rawShortcut.toLowerCase() === "auto_awesome") {
              const icon = document.createElement("span");
              icon.className = "material-symbols-outlined floating-tooltip-inline-icon";
              icon.setAttribute("aria-hidden", "true");
              icon.setAttribute("translate", "no");
              icon.classList.add("notranslate");
              icon.textContent = "auto_awesome";
              container.appendChild(icon);
              return;
            }
            const pill = document.createElement("span");
            const normalizedShortcut = normalizeTooltipToken(rawShortcut);
            pill.className = "floating-tooltip-pill floating-tooltip-pill-shortcut";
            pill.textContent = rawShortcut;
            if (normalizedShortcut) {
              const tokenCount = container.querySelectorAll(".floating-tooltip-pill-shortcut").length;
              pill.setAttribute("data-tooltip-token", normalizedShortcut);
              pill.setAttribute("data-tooltip-token-seq", String(tokenCount));
            }
            container.appendChild(pill);
            return;
          }
          if (/^\d+%?$/.test(part)) {
            const pill = document.createElement("span");
            pill.className = "floating-tooltip-pill floating-tooltip-pill-value";
            pill.textContent = part;
            container.appendChild(pill);
            return;
          }
          container.appendChild(document.createTextNode(part));
        });
      };

      const renderTooltipContent = (rawText) => {
        const text = String(rawText || "").trim();
        tooltip.textContent = "";
        tooltip.classList.remove("is-multiline");
        tooltip.classList.remove("is-party-code");
        if (!text) return;
        if (text.includes("Party Mode:")) {
          tooltip.classList.add("is-party-code");
        }

        const fragment = document.createDocumentFragment();
        const lines = text.split(/\r?\n/);
        const hasMultiline = lines.length > 1;
        if (hasMultiline) {
          tooltip.classList.add("is-multiline");
          lines.forEach((rawLine) => {
            const line = String(rawLine || "").trim();
            if (!line) return;
            if (/^-{3,}$/.test(line)) {
              const separator = document.createElement("span");
              separator.className = "floating-tooltip-separator";
              fragment.appendChild(separator);
              return;
            }
            const row = document.createElement("span");
            row.className = "floating-tooltip-line";
            appendTooltipTokens(row, line);
            fragment.appendChild(row);
          });
        } else {
          appendTooltipTokens(fragment, text);
        }
        tooltip.appendChild(fragment);
      };

      const hideTooltip = () => {
        if (stickyTooltipTimer) {
          global.clearTimeout(stickyTooltipTimer);
          stickyTooltipTimer = 0;
        }
        if (revealTooltipRafId) {
          global.cancelAnimationFrame(revealTooltipRafId);
          revealTooltipRafId = 0;
        }
        visible = false;
        activeTooltipTarget = null;
        tooltip.classList.remove("is-visible");
        if (canUseTooltipPopover && tooltip.matches(":popover-open")) {
          tooltip.hidePopover();
        }
        tooltip.hidden = true;
        tooltip.textContent = "";
        tooltip.style.left = "-9999px";
        tooltip.style.top = "-9999px";
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
        tooltip.style.left = `${Math.round(left)}px`;
        tooltip.style.top = `${Math.round(top)}px`;
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
        activeTooltipTarget = target;
        renderTooltipContent(text);
        if (tooltip.hidden) {
          tooltip.hidden = false;
          tooltip.classList.remove("is-visible");
        }
        syncKonamiTooltipProgress(konamiProgressIndex);
        if (canUseTooltipPopover && !tooltip.matches(":popover-open")) {
          tooltip.showPopover();
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

      const showTooltipForElement = (target, durationMs = 0) => {
        if (!target || !(target instanceof Element) || !shadow.contains(target)) return;
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = rect.left + (rect.width / 2);
        const y = rect.top + (rect.height / 2);
        showTooltip(target, x, y);
        if (stickyTooltipTimer) {
          global.clearTimeout(stickyTooltipTimer);
          stickyTooltipTimer = 0;
        }
        if (durationMs > 0) {
          stickyTooltipTimer = global.setTimeout(() => {
            stickyTooltipTimer = 0;
            if (activeTooltipTarget === target) {
              hideTooltip();
            }
          }, Math.max(200, Math.round(durationMs)));
        }
      };

      showFloatingTooltipForElement = showTooltipForElement;

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

      const KONAMI_RAINBOW_HUES = [0, 32, 54, 120, 170, 210, 252, 286, 318, 342];
      const applyKonamiProgress = (progressValue = 0) => {
        if (!activeTooltipTarget || !(activeTooltipTarget instanceof Element)) return;
        const tooltipText = String(activeTooltipTarget.dataset.tooltip || "");
        if (!tooltipText.includes("Party Mode:")) return;
        const pills = Array.from(tooltip.querySelectorAll(".floating-tooltip-pill-shortcut[data-tooltip-token-seq]"));
        if (!pills.length) return;

        pills.forEach((pill) => {
          pill.classList.remove("is-key-active");
          pill.style.removeProperty("--pill-rainbow-hue");
        });

        const progress = Math.max(0, Math.min(pills.length, Math.floor(progressValue)));
        for (let index = 0; index < progress; index += 1) {
          const pill = pills.find((node) => Number(node.getAttribute("data-tooltip-token-seq")) === index);
          if (!pill) continue;
          pill.classList.add("is-key-active");
          pill.style.setProperty("--pill-rainbow-hue", String(KONAMI_RAINBOW_HUES[index % KONAMI_RAINBOW_HUES.length]));
        }
      };

      syncKonamiTooltipProgress = applyKonamiProgress;

      return () => {
        shadow.removeEventListener("pointermove", onPointerMove, true);
        shadow.removeEventListener("pointerdown", onPointerDown, true);
        shadow.removeEventListener("wheel", onScroll, true);
        shadow.removeEventListener("pointerleave", onLeave, true);
        global.removeEventListener("scroll", onScroll, true);
        showFloatingTooltipForElement = () => {};
        syncKonamiTooltipProgress = () => {};
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
      if (iconNoTranslateObserver) {
        iconNoTranslateObserver.disconnect();
        iconNoTranslateObserver = null;
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
      clearToastTimers();
      stopConfettiOverlay();
      stopAccentPartyMode();
      hideKonamiOverlay();
      radioStationValidationToken += 1;
      radioStationApplyPending = false;
      clearPendingSpaceShortcut();
      if (uiSfxAudioContext && uiSfxAudioContext.state !== "closed") {
        uiSfxAudioContext.close().catch(() => {});
      }
      uiSfxAudioContext = null;
      uiSfxMasterGain = null;
      uiSfxNoiseBuffer = null;
      uiSfxLastTypingAt = 0;
      uiSfxLastClickAt = 0;
      if (unbindLofiButton) {
        unbindLofiButton();
        unbindLofiButton = null;
      }
      if (unbindLofiBeatSnap) {
        unbindLofiBeatSnap();
        unbindLofiBeatSnap = null;
      }
      if (cleanupFloatingTooltip) {
        cleanupFloatingTooltip();
        cleanupFloatingTooltip = null;
      }
      if (app._lofiController) {
        const keepRadioAlive = settingsState.keepRadioOn === true
          && settingsState.audioStreamSource === "radio";
        if (!keepRadioAlive) {
          if (typeof app._lofiController.modalExit === "function") {
            app._lofiController.modalExit();
          } else if (typeof app._lofiController.pause === "function") {
            app._lofiController.pause();
          }
        }
      }
      stopAllAmbientNoise();
      ambientTrackState.forEach((entry) => {
        if (entry && entry.audio) {
          try { entry.audio.pause(); } catch {}
          try {
            entry.audio.removeAttribute("src");
            entry.audio.load();
          } catch {}
          if (entry.objectUrl) {
            try { URL.revokeObjectURL(entry.objectUrl); } catch {}
            entry.objectUrl = "";
          }
        }
      });
      ambientTrackState.clear();
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

    const isTextSelectionAllowedElement = (element) => {
      if (!element || !(element instanceof Element)) return false;
      if (element.closest('textarea, [contenteditable="true"]')) return true;
      const input = element.closest("input");
      if (!(input instanceof HTMLInputElement)) return false;
      const type = String(input.getAttribute("type") || "text").toLowerCase();
      return type === "text"
        || type === "search"
        || type === "url"
        || type === "tel"
        || type === "email"
        || type === "password";
    };

    const UI_SFX_TYPING_MIN_GAP_MS = 34;
    const UI_SFX_CLICK_MIN_GAP_MS = 26;
    const UI_SFX_SLIDER_MIN_GAP_MS = 14;
    const SPACE_DOUBLE_TAP_WINDOW_MS = 260;
    const getUiSfxAudioContext = () => {
      const AudioContextCtor = global.AudioContext || global.webkitAudioContext;
      if (!AudioContextCtor) return null;
      if (uiSfxAudioContext && uiSfxAudioContext.state !== "closed") return uiSfxAudioContext;
      try {
        uiSfxAudioContext = new AudioContextCtor({ latencyHint: "interactive" });
        uiSfxMasterGain = uiSfxAudioContext.createGain();
        uiSfxMasterGain.gain.value = 0.95;
        uiSfxMasterGain.connect(uiSfxAudioContext.destination);
        uiSfxNoiseBuffer = null;
      } catch {
        uiSfxAudioContext = null;
        uiSfxMasterGain = null;
        uiSfxNoiseBuffer = null;
      }
      return uiSfxAudioContext;
    };

    const resumeUiSfxAudioContext = () => {
      const ctx = getUiSfxAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    };

    const getEffectiveSfxGainScale = () => {
      if (settingsState.sfxMuted === true) return 0;
      const sfxRatio = clampNumber(
        settingsState.sfxVolume,
        SFX_VOLUME_MIN,
        SFX_VOLUME_MAX,
        DEFAULT_MODAL_SETTINGS.sfxVolume
      ) / 100;
      if (settingsState.sfxAdaptiveBlend !== true) return sfxRatio;
      if (!lofiPlaybackSnapshot.playing || lofiPlaybackSnapshot.failed) return sfxRatio;
      const musicRatio = clampNumber(lofiPlaybackSnapshot.volume, 0, 1, 0);
      const blendScale = clampNumber(1 - (musicRatio * 0.45), 0.4, 1, 1);
      return sfxRatio * blendScale;
    };

    const playUiSfxTone = ({
      frequency = 620,
      endFrequency = null,
      type = "triangle",
      gain = 0.015,
      attackMs = 2,
      holdMs = 22,
      releaseMs = 48,
      delayMs = 0
    } = {}) => {
      const ctx = getUiSfxAudioContext();
      if (!ctx || !uiSfxMasterGain) return;
      const gainScale = getEffectiveSfxGainScale();
      if (gainScale <= 0.0001) return;
      const startAt = ctx.currentTime + (Math.max(0, delayMs) / 1000);
      const oscillator = ctx.createOscillator();
      const toneGain = ctx.createGain();
      const toneFilter = ctx.createBiquadFilter();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(Math.max(80, frequency), startAt);
      if (Number.isFinite(endFrequency) && endFrequency > 0) {
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(80, endFrequency),
          startAt + ((attackMs + holdMs + releaseMs) / 1000)
        );
      }

      toneFilter.type = "bandpass";
      toneFilter.frequency.setValueAtTime(Math.max(120, frequency * 1.8), startAt);
      toneFilter.Q.value = 0.8;

      const peak = Math.max(0.0006, gain * gainScale);
      toneGain.gain.setValueAtTime(0.0001, startAt);
      toneGain.gain.exponentialRampToValueAtTime(peak, startAt + (Math.max(1, attackMs) / 1000));
      toneGain.gain.setValueAtTime(peak, startAt + ((Math.max(1, attackMs) + Math.max(1, holdMs)) / 1000));
      toneGain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + ((Math.max(1, attackMs) + Math.max(1, holdMs) + Math.max(1, releaseMs)) / 1000)
      );

      oscillator.connect(toneFilter);
      toneFilter.connect(toneGain);
      toneGain.connect(uiSfxMasterGain);
      oscillator.start(startAt);
      oscillator.stop(startAt + ((Math.max(1, attackMs) + Math.max(1, holdMs) + Math.max(1, releaseMs)) / 1000) + 0.01);
      oscillator.addEventListener("ended", () => {
        try { oscillator.disconnect(); } catch {}
        try { toneFilter.disconnect(); } catch {}
        try { toneGain.disconnect(); } catch {}
      }, { once: true });
    };

    const getUiSfxNoiseBuffer = () => {
      const ctx = getUiSfxAudioContext();
      if (!ctx) return null;
      if (uiSfxNoiseBuffer && uiSfxNoiseBuffer.sampleRate === ctx.sampleRate) {
        return uiSfxNoiseBuffer;
      }
      const length = Math.max(1, Math.floor(ctx.sampleRate * 0.24));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) {
        data[index] = (Math.random() * 2) - 1;
      }
      uiSfxNoiseBuffer = buffer;
      return uiSfxNoiseBuffer;
    };

    const playUiSfxNoiseHit = ({
      gain = 0.02,
      attackMs = 1,
      holdMs = 10,
      releaseMs = 56,
      highpassHz = 900,
      lowpassHz = 10000,
      delayMs = 0
    } = {}) => {
      const ctx = getUiSfxAudioContext();
      const noiseBuffer = getUiSfxNoiseBuffer();
      if (!ctx || !uiSfxMasterGain || !noiseBuffer) return;
      const gainScale = getEffectiveSfxGainScale();
      if (gainScale <= 0.0001) return;

      const startAt = ctx.currentTime + (Math.max(0, delayMs) / 1000);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.setValueAtTime(Math.max(20, highpassHz), startAt);
      highpass.Q.value = 0.7;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(Math.max(120, lowpassHz), startAt);
      lowpass.Q.value = 0.8;

      const noiseGain = ctx.createGain();
      const peak = Math.max(0.0008, gain * gainScale);
      noiseGain.gain.setValueAtTime(0.0001, startAt);
      noiseGain.gain.exponentialRampToValueAtTime(peak, startAt + (Math.max(1, attackMs) / 1000));
      noiseGain.gain.setValueAtTime(peak, startAt + ((Math.max(1, attackMs) + Math.max(1, holdMs)) / 1000));
      noiseGain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + ((Math.max(1, attackMs) + Math.max(1, holdMs) + Math.max(1, releaseMs)) / 1000)
      );

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(noiseGain);
      noiseGain.connect(uiSfxMasterGain);
      source.start(startAt);
      source.stop(startAt + ((Math.max(1, attackMs) + Math.max(1, holdMs) + Math.max(1, releaseMs)) / 1000) + 0.02);
      source.addEventListener("ended", () => {
        try { source.disconnect(); } catch {}
        try { highpass.disconnect(); } catch {}
        try { lowpass.disconnect(); } catch {}
        try { noiseGain.disconnect(); } catch {}
      }, { once: true });
    };

    const playUiPartyDrumSfx = () => {
      const pick = Math.floor(Math.random() * 5);
      switch (pick) {
        case 0:
          // Kick
          playUiSfxTone({
            frequency: 172 + (Math.random() * 14),
            endFrequency: 48 + (Math.random() * 8),
            type: "sine",
            gain: 0.088,
            attackMs: 1,
            holdMs: 8,
            releaseMs: 132
          });
          playUiSfxNoiseHit({
            gain: 0.014,
            attackMs: 1,
            holdMs: 2,
            releaseMs: 20,
            highpassHz: 1500,
            lowpassHz: 7600
          });
          break;
        case 1:
          // Snare
          playUiSfxNoiseHit({
            gain: 0.050,
            attackMs: 1,
            holdMs: 8,
            releaseMs: 110,
            highpassHz: 1200,
            lowpassHz: 7200
          });
          playUiSfxTone({
            frequency: 235 + (Math.random() * 25),
            endFrequency: 142 + (Math.random() * 18),
            type: "triangle",
            gain: 0.026,
            attackMs: 1,
            holdMs: 5,
            releaseMs: 72
          });
          break;
        case 2:
          // Hi-hat
          playUiSfxNoiseHit({
            gain: 0.030,
            attackMs: 1,
            holdMs: 2,
            releaseMs: 48,
            highpassHz: 5200,
            lowpassHz: 12000
          });
          break;
        case 3:
          // Tom
          playUiSfxTone({
            frequency: 252 + (Math.random() * 36),
            endFrequency: 92 + (Math.random() * 22),
            type: "triangle",
            gain: 0.060,
            attackMs: 1,
            holdMs: 10,
            releaseMs: 150
          });
          break;
        default:
          // Clap
          playUiSfxNoiseHit({
            gain: 0.028,
            attackMs: 1,
            holdMs: 3,
            releaseMs: 52,
            highpassHz: 1900,
            lowpassHz: 9800
          });
          playUiSfxNoiseHit({
            gain: 0.020,
            attackMs: 1,
            holdMs: 2,
            releaseMs: 46,
            highpassHz: 1900,
            lowpassHz: 9800,
            delayMs: 18
          });
          playUiSfxNoiseHit({
            gain: 0.014,
            attackMs: 1,
            holdMs: 2,
            releaseMs: 42,
            highpassHz: 1900,
            lowpassHz: 9800,
            delayMs: 34
          });
          break;
      }
    };

    const playUiConfettiSfx = () => {
      const now = Date.now();
      if ((now - uiSfxLastConfettiAt) < 180) return;
      uiSfxLastConfettiAt = now;
      resumeUiSfxAudioContext();

      // Pop/explosion core (low thump + noisy burst) so confetti feels punchy.
      playUiSfxTone({
        frequency: 224 + (Math.random() * 20),
        endFrequency: 82 + (Math.random() * 14),
        type: "sine",
        gain: 0.11,
        attackMs: 1,
        holdMs: 10,
        releaseMs: 150
      });
      playUiSfxTone({
        frequency: 360 + (Math.random() * 30),
        endFrequency: 148 + (Math.random() * 16),
        type: "triangle",
        gain: 0.065,
        attackMs: 1,
        holdMs: 8,
        releaseMs: 120
      });
      playUiSfxNoiseHit({
        gain: 0.095,
        attackMs: 1,
        holdMs: 7,
        releaseMs: 118,
        highpassHz: 180,
        lowpassHz: 3200
      });
      playUiSfxNoiseHit({
        gain: 0.058,
        attackMs: 1,
        holdMs: 4,
        releaseMs: 82,
        highpassHz: 1400,
        lowpassHz: 10200,
        delayMs: 18
      });

      // Celebration sparkle layer (quick, bright ascending fanfare).
      const flourish = [740, 988, 1320, 1568, 1760];
      flourish.forEach((frequency, index) => {
        const delayMs = 30 + (index * 40);
        playUiSfxTone({
          frequency: frequency * (0.99 + (Math.random() * 0.02)),
          endFrequency: frequency * 1.1,
          type: index % 2 === 0 ? "square" : "triangle",
          gain: 0.055 - (index * 0.006),
          attackMs: 1,
          holdMs: 18,
          releaseMs: 96,
          delayMs
        });
      });
      playUiSfxNoiseHit({
        gain: 0.03,
        attackMs: 1,
        holdMs: 3,
        releaseMs: 68,
        highpassHz: 2600,
        lowpassHz: 11800,
        delayMs: 122
      });
    };

    const playUiSliderScratchSfx = (sliderInput) => {
      if (!(sliderInput instanceof HTMLInputElement)) return;
      if (settingsState.accentPartyMode !== true) return;
      const now = Date.now();
      if ((now - uiSfxLastSliderAt) < UI_SFX_SLIDER_MIN_GAP_MS) return;
      uiSfxLastSliderAt = now;
      resumeUiSfxAudioContext();

      const min = Number.parseFloat(String(sliderInput.min || ""));
      const max = Number.parseFloat(String(sliderInput.max || ""));
      const value = Number.parseFloat(String(sliderInput.value || ""));
      const safeMin = Number.isFinite(min) ? min : 0;
      const safeMax = Number.isFinite(max) && max > safeMin ? max : (safeMin + 1);
      const safeValue = clampNumber(value, safeMin, safeMax, safeMin);
      const range = Math.max(0.0001, safeMax - safeMin);
      const normalized = clampNumber((safeValue - safeMin) / range, 0, 1, 0);
      const previousValue = uiSfxSliderLastValue.get(sliderInput);
      uiSfxSliderLastValue.set(sliderInput, safeValue);
      const delta = Number.isFinite(previousValue) ? (safeValue - previousValue) : 0;
      const direction = delta < 0 ? -1 : 1;
      const movement = Number.isFinite(previousValue)
        ? clampNumber(Math.abs(delta) / range, 0, 1, 0.08)
        : 0.12;

      const baseFrequency = 380 + (normalized * 960) + ((Math.random() * 26) - 13);
      const sweepAmount = 110 + (movement * 520);
      const endFrequency = Math.max(120, baseFrequency + (direction * sweepAmount));
      const highpass = 950 + (normalized * 3600);
      const lowpass = 7600 + (normalized * 3800);
      const noiseGain = 0.010 + (movement * 0.05);
      const toneGain = 0.008 + (movement * 0.03);

      playUiSfxNoiseHit({
        gain: noiseGain,
        attackMs: 1,
        holdMs: 4,
        releaseMs: 32,
        highpassHz: highpass,
        lowpassHz: lowpass
      });
      playUiSfxTone({
        frequency: baseFrequency,
        endFrequency,
        type: "sawtooth",
        gain: toneGain,
        attackMs: 1,
        holdMs: 4,
        releaseMs: 30
      });
    };

    const playUiPianoNote = ({
      frequency = 440,
      velocity = 1,
      durationMs = 760,
      delayMs = 0
    } = {}) => {
      const ctx = getUiSfxAudioContext();
      if (!ctx || !uiSfxMasterGain) return;
      const gainScale = getEffectiveSfxGainScale();
      if (gainScale <= 0.0001) return;

      const safeFrequency = clampNumber(frequency, 60, 2400, 440);
      const safeVelocity = clampNumber(velocity, 0.1, 2.4, 1);
      const startAt = ctx.currentTime + (Math.max(0, delayMs) / 1000);
      const lifeSeconds = Math.max(0.18, Number(durationMs) / 1000);
      const stopAt = startAt + lifeSeconds;
      const releaseAt = stopAt + 0.03;

      const voiceGain = ctx.createGain();
      const toneHighpass = ctx.createBiquadFilter();
      const toneLowpass = ctx.createBiquadFilter();

      toneHighpass.type = "highpass";
      toneHighpass.frequency.setValueAtTime(72, startAt);
      toneHighpass.Q.value = 0.58;

      toneLowpass.type = "lowpass";
      toneLowpass.frequency.setValueAtTime(
        clampNumber(safeFrequency * 8.2, 1400, 7600, 4200),
        startAt
      );
      toneLowpass.Q.value = 0.64;

      const peak = Math.max(0.0006, Math.min(0.18, 0.082 * safeVelocity * gainScale));
      const attackEnd = startAt + 0.009;
      const decayEnd = startAt + 0.12;
      const sustainEnd = startAt + Math.max(0.16, lifeSeconds * 0.36);
      voiceGain.gain.setValueAtTime(0.0001, startAt);
      voiceGain.gain.linearRampToValueAtTime(peak, attackEnd);
      voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.0003, peak * 0.44), decayEnd);
      voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * 0.2), sustainEnd);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      voiceGain.connect(toneHighpass);
      toneHighpass.connect(toneLowpass);
      toneLowpass.connect(uiSfxMasterGain);

      const partialSpecs = [
        { ratio: 1.0, type: "triangle", gain: 0.88, detune: -2.1 },
        { ratio: 2.0, type: "sine", gain: 0.25, detune: 1.2 },
        { ratio: 3.0, type: "triangle", gain: 0.11, detune: -3.2 },
        { ratio: 0.5, type: "sine", gain: 0.16, detune: 0.8 }
      ];
      partialSpecs.forEach((spec) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = spec.type;
        osc.frequency.setValueAtTime(Math.max(40, safeFrequency * spec.ratio), startAt);
        osc.detune.setValueAtTime(spec.detune, startAt);
        oscGain.gain.setValueAtTime(spec.gain, startAt);
        osc.connect(oscGain);
        oscGain.connect(voiceGain);
        osc.start(startAt);
        osc.stop(releaseAt);
        osc.addEventListener("ended", () => {
          try { osc.disconnect(); } catch {}
          try { oscGain.disconnect(); } catch {}
        }, { once: true });
      });

      const noiseBuffer = getUiSfxNoiseBuffer();
      if (noiseBuffer) {
        const hammer = ctx.createBufferSource();
        const hammerHighpass = ctx.createBiquadFilter();
        const hammerLowpass = ctx.createBiquadFilter();
        const hammerGain = ctx.createGain();
        const hammerPeak = Math.max(0.0005, Math.min(0.08, 0.028 * safeVelocity * gainScale));
        hammer.buffer = noiseBuffer;
        hammerHighpass.type = "highpass";
        hammerHighpass.frequency.setValueAtTime(1900, startAt);
        hammerLowpass.type = "lowpass";
        hammerLowpass.frequency.setValueAtTime(9200, startAt);
        hammerGain.gain.setValueAtTime(0.0001, startAt);
        hammerGain.gain.linearRampToValueAtTime(hammerPeak, startAt + 0.0016);
        hammerGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.034);
        hammer.connect(hammerHighpass);
        hammerHighpass.connect(hammerLowpass);
        hammerLowpass.connect(hammerGain);
        hammerGain.connect(voiceGain);
        hammer.start(startAt);
        hammer.stop(startAt + 0.05);
        hammer.addEventListener("ended", () => {
          try { hammer.disconnect(); } catch {}
          try { hammerHighpass.disconnect(); } catch {}
          try { hammerLowpass.disconnect(); } catch {}
          try { hammerGain.disconnect(); } catch {}
        }, { once: true });
      }

      global.setTimeout(() => {
        try { voiceGain.disconnect(); } catch {}
        try { toneHighpass.disconnect(); } catch {}
        try { toneLowpass.disconnect(); } catch {}
      }, Math.max(80, Math.ceil((releaseAt - ctx.currentTime) * 1000) + 40));
    };

    const resolveSidebarPianoFrequency = (target) => {
      if (!(target instanceof Element)) return 659.25;
      const button = target.closest(".sidebar-page-btn");
      if (!button) return 659.25;
      const page = String(button.getAttribute("data-page-target") || "").trim().toLowerCase();
      switch (page) {
        case "editor":
          return 523.25;
        case "settings":
          return 587.33;
        case "variables":
          return 659.25;
        case "drafts":
          return 698.46;
        case "usage":
          return 783.99;
        case "radio":
          return 880;
        case "about":
          return 987.77;
        default:
          return 659.25;
      }
    };

    const playUiSidebarPianoSfx = (target) => {
      const frequency = resolveSidebarPianoFrequency(target);
      resumeUiSfxAudioContext();
      const velocity = 0.96 + (Math.random() * 0.2);
      playUiPianoNote({
        frequency,
        velocity,
        durationMs: 760
      });
      playUiPianoNote({
        frequency: frequency * 2,
        velocity: velocity * 0.48,
        durationMs: 520,
        delayMs: 7
      });
      if (frequency <= 660) {
        playUiPianoNote({
          frequency: Math.max(80, frequency * 0.5),
          velocity: velocity * 0.44,
          durationMs: 860,
          delayMs: 4
        });
      }
    };

    const playUiClickSfx = (target = null) => {
      const now = Date.now();
      if ((now - uiSfxLastClickAt) < UI_SFX_CLICK_MIN_GAP_MS) return;
      uiSfxLastClickAt = now;
      resumeUiSfxAudioContext();
      if (settingsState.accentPartyMode === true && target instanceof Element && target.closest(".sidebar-page-btn")) {
        playUiSidebarPianoSfx(target);
        return;
      }
      if (settingsState.accentPartyMode === true) {
        playUiPartyDrumSfx();
        return;
      }
      const jitter = (Math.random() * 30) - 15;
      playUiSfxTone({
        frequency: 760 + jitter,
        endFrequency: 560 + (jitter * 0.7),
        type: "triangle",
        gain: 0.034,
        attackMs: 1,
        holdMs: 16,
        releaseMs: 34
      });
      playUiSfxTone({
        frequency: 1180 + jitter,
        endFrequency: 900 + (jitter * 0.6),
        type: "square",
        gain: 0.0125,
        attackMs: 1,
        holdMs: 8,
        releaseMs: 24
      });
    };

    const shouldPlayTypingSfxForKey = (event) => {
      if (!event || event.isComposing) return false;
      if (event.ctrlKey || event.altKey || event.metaKey) return false;
      const key = String(event.key || "");
      if (!key) return false;
      if (key.length === 1) return true;
      return key === "Backspace" || key === "Delete" || key === "Enter";
    };

    const playUiTypingSfx = () => {
      const now = Date.now();
      if ((now - uiSfxLastTypingAt) < UI_SFX_TYPING_MIN_GAP_MS) return;
      uiSfxLastTypingAt = now;
      resumeUiSfxAudioContext();
      const jitter = (Math.random() * 22) - 11;
      playUiSfxTone({
        frequency: 460 + jitter,
        endFrequency: 350 + (jitter * 0.6),
        type: "sine",
        gain: 0.0145,
        attackMs: 1,
        holdMs: 8,
        releaseMs: 22
      });
    };

    const toggleLofiFromShortcut = () => {
      if (!lofiToggleBtn || lofiToggleBtn.disabled) return;
      const controller = getLofiController();
      if (!controller || typeof controller.toggle !== "function") return;
      controller.toggle();
    };

    const clearPendingSpaceShortcut = () => {
      if (pendingSpaceShortcutTimer) {
        global.clearTimeout(pendingSpaceShortcutTimer);
        pendingSpaceShortcutTimer = 0;
      }
      pendingSpaceShortcutAt = 0;
    };

    const queueSingleSpaceShortcut = () => {
      clearPendingSpaceShortcut();
      pendingSpaceShortcutAt = Date.now();
      pendingSpaceShortcutTimer = global.setTimeout(() => {
        pendingSpaceShortcutTimer = 0;
        pendingSpaceShortcutAt = 0;
        if (closed || !isPopoverOpen(modal)) return;
        toggleLofiFromShortcut();
      }, SPACE_DOUBLE_TAP_WINDOW_MS + 8);
    };

    const toggleMusicAutoplayFromShortcut = () => {
      const enabled = settingsState.musicAutoplay === false;
      commitModalSettingsFromSwitch({ musicAutoplay: enabled });
      const controller = getLofiController();
      if (enabled) {
        if (typeof controller.modalEnter === "function") {
          controller.modalEnter({ autoplay: true });
        } else {
          controller.maybeAutoplay();
        }
      } else if (typeof controller.modalExit === "function") {
        controller.modalExit();
      } else {
        controller.pause();
      }
      if (lofiAutoplayInput) {
        showSettingsFieldSuccess(
          lofiAutoplayInput,
          enabled ? "Music autoplay enabled." : "Music autoplay disabled."
        );
      }
      showToast(enabled ? "Music autoplay: On" : "Music autoplay: Off", enabled ? "success" : "muted");
    };

    const toggleLofiMuteFromShortcut = () => {
      const controller = getLofiController();
      if (!controller || typeof controller.toggleMute !== "function") return;
      controller.toggleMute();
    };

    const cycleThemeFromShortcut = () => {
      const order = ["light", "auto", "dark"];
      const current = THEME_OPTIONS.has(settingsState.theme) ? settingsState.theme : DEFAULT_MODAL_SETTINGS.theme;
      const index = order.indexOf(current);
      const next = order[(index + 1) % order.length];
      commitModalSettings({ theme: next }, { preserveScroll: true, stabilizeScroll: false });
      const themeLabel = next.charAt(0).toUpperCase() + next.slice(1);
      showToast(`Theme set to: ${themeLabel}`, "success");
    };

    const cycleDensityFromShortcut = () => {
      const order = ["compact", "comfortable", "spacious"];
      const current = DENSITY_OPTIONS.has(settingsState.density) ? settingsState.density : DEFAULT_MODAL_SETTINGS.density;
      const index = order.indexOf(current);
      const next = order[(index + 1) % order.length];
      commitModalSettings({ density: next }, { preserveScroll: true, stabilizeScroll: false });
      const densityLabel = next.charAt(0).toUpperCase() + next.slice(1);
      showToast(`Density set to: ${densityLabel}`, "success");
    };

    const togglePhysicsFromShortcut = () => {
      const nextPhysicsEnabled = settingsState.physicsEnabled === false;
      commitModalSettings({ physicsEnabled: nextPhysicsEnabled });
      showToast(
        nextPhysicsEnabled ? "Physics effects: On" : "Physics effects: Off",
        nextPhysicsEnabled ? "success" : "muted"
      );
    };

    const KONAMI_SEQUENCE = Object.freeze([
      "arrowup",
      "arrowup",
      "arrowdown",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "arrowleft",
      "arrowright",
      "b",
      "a"
    ]);
    const KONAMI_MAX_KEY_GAP_MS = 700;
    const KONAMI_ARROW_SYMBOLS = Object.freeze({
      arrowup: { symbol: "↑", label: "Arrow Up" },
      arrowdown: { symbol: "↓", label: "Arrow Down" },
      arrowleft: { symbol: "←", label: "Arrow Left" },
      arrowright: { symbol: "→", label: "Arrow Right" },
      b: { symbol: "B", label: "Key B" },
      a: { symbol: "A", label: "Key A" }
    });

    const hideKonamiOverlay = () => {
      if (konamiOverlayHideTimer) {
        global.clearTimeout(konamiOverlayHideTimer);
        konamiOverlayHideTimer = 0;
      }
      if (!modalKonamiOverlay) return;
      modalKonamiOverlay.classList.remove("is-visible");
      modalKonamiOverlay.hidden = true;
    };

    const showKonamiOverlayKey = (keyName) => {
      if (!modalKonamiOverlay || !modalKonamiOverlaySymbol || !modalKonamiOverlayLabel) return;
      const entry = KONAMI_ARROW_SYMBOLS[String(keyName || "").trim().toLowerCase()];
      if (!entry) return;
      modalKonamiOverlaySymbol.textContent = entry.symbol;
      modalKonamiOverlayLabel.textContent = entry.label;
      modalKonamiOverlay.hidden = false;
      modalKonamiOverlay.classList.add("is-visible");
      modalKonamiOverlay.classList.remove("is-pop");
      void modalKonamiOverlay.offsetWidth;
      modalKonamiOverlay.classList.add("is-pop");
      if (konamiOverlayHideTimer) {
        global.clearTimeout(konamiOverlayHideTimer);
      }
      konamiOverlayHideTimer = global.setTimeout(() => {
        konamiOverlayHideTimer = 0;
        if (!modalKonamiOverlay) return;
        modalKonamiOverlay.classList.remove("is-pop");
        modalKonamiOverlay.classList.remove("is-visible");
        modalKonamiOverlay.hidden = true;
      }, 680);
    };

    const handleKonamiPartyUnlock = (event) => {
      if (!event || event.type !== "keydown") return false;
      if (event.ctrlKey || event.altKey || event.metaKey) return false;
      const now = Date.now();
      if (konamiProgressIndex > 0 && (now - konamiLastKeyAt) > KONAMI_MAX_KEY_GAP_MS) {
        konamiProgressIndex = 0;
        syncKonamiTooltipProgress(0);
        hideKonamiOverlay();
      }
      const key = String(event.key || "").trim().toLowerCase();
      if (!key) return false;

      if (key === KONAMI_SEQUENCE[konamiProgressIndex]) {
        konamiLastKeyAt = now;
        konamiProgressIndex += 1;
        syncKonamiTooltipProgress(konamiProgressIndex);
        if (konamiProgressIndex >= 2) {
          showKonamiOverlayKey(key);
        }
        if (konamiProgressIndex < KONAMI_SEQUENCE.length) return false;
        konamiProgressIndex = 0;
        konamiLastKeyAt = 0;
        syncKonamiTooltipProgress(0);
        hideKonamiOverlay();

        const nextPartyMode = settingsState.accentPartyMode !== true;
        if (nextPartyMode && settingsState.accentPreset !== "custom") {
          commitModalSettings({ accentPreset: "custom", accentPartyMode: true });
        } else {
          commitModalSettings({ accentPartyMode: nextPartyMode });
        }
        if (nextPartyMode) {
          launchConfettiOverlay(2200);
        }
        showToast(nextPartyMode ? "🎉 What a gamer! Party mode unlocked!" : "Party mode disabled", "success");
        return true;
      }

      konamiProgressIndex = 0;
      konamiLastKeyAt = 0;
      syncKonamiTooltipProgress(0);
      hideKonamiOverlay();
      return false;
    };

    const stopKeys = (e) => {
      if (!isPopoverOpen(modal)) return;
      const preventDefaultIfCancelable = () => {
        if (e && e.cancelable) e.preventDefault();
      };
      e.stopPropagation();
      const focused = shadow.activeElement || document.activeElement;
      const focusIsText = isTextEditingElement(focused);
      if (!focusIsText) {
        handleKonamiPartyUnlock(e);
      }

      if (e.key === "/") {
        if (focused === triggerTextInput) {
          e.stopPropagation();
          showTriggerSlashError();
          syncActivePageHeight();
          preventDefaultIfCancelable();
          return;
        }
      }

      if (e.key === "Escape") {
        clearPendingSpaceShortcut();
        e.stopPropagation();
        if (draftsReplaceConfirmBackdrop && !draftsReplaceConfirmBackdrop.hidden) {
          preventDefaultIfCancelable();
          closeDraftReplaceConfirm();
          return;
        }
        if (draftsConfirmBackdrop && !draftsConfirmBackdrop.hidden) {
          preventDefaultIfCancelable();
          closeDraftDeleteConfirm();
          return;
        }
        preventDefaultIfCancelable();
        close();
        return;
      }

      if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        if (e.type !== "keydown") return;
        if (focusIsText) return;
        e.stopPropagation();
        preventDefaultIfCancelable();
        commitModalSettings({ sidebarCollapsed: !settingsState.sidebarCollapsed });
        return;
      }

      if ((e.key === " " || e.key === "Spacebar") && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.type !== "keydown") return;
        if (focusIsText) return;
        if (e.repeat) return;
        e.stopPropagation();
        preventDefaultIfCancelable();
        const now = Date.now();
        const isFastDoubleSpace = pendingSpaceShortcutAt > 0
          && (now - pendingSpaceShortcutAt) <= SPACE_DOUBLE_TAP_WINDOW_MS;
        if (isFastDoubleSpace) {
          clearPendingSpaceShortcut();
          toggleMusicAutoplayFromShortcut();
          return;
        }
        queueSingleSpaceShortcut();
        return;
      }

      if ((e.key === "1" || e.code === "Digit1") && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        if (e.type !== "keydown") return;
        if (focusIsText) return;
        e.stopPropagation();
        preventDefaultIfCancelable();
        cycleThemeFromShortcut();
        return;
      }

      if ((e.key === "2" || e.code === "Digit2") && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        if (e.type !== "keydown") return;
        if (focusIsText) return;
        e.stopPropagation();
        preventDefaultIfCancelable();
        cycleDensityFromShortcut();
        return;
      }

      if ((e.key === "p" || e.key === "P" || e.code === "KeyP") && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        if (e.type !== "keydown") return;
        if (focusIsText) return;
        e.stopPropagation();
        preventDefaultIfCancelable();
        togglePhysicsFromShortcut();
        return;
      }

      if ((e.key === "m" || e.key === "M" || e.code === "KeyM") && e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.type !== "keydown") return;
        e.stopPropagation();
        preventDefaultIfCancelable();
        toggleLofiMuteFromShortcut();
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
      let placement = "bottom";
      if (top + popoverRect.height > viewportHeight - 8) {
        top = Math.max(8, rect.top - popoverRect.height - 8);
        placement = "top";
      }

      popover.style.position = "fixed";
      popover.style.left = `${Math.round(left)}px`;
      popover.style.top = `${Math.round(top)}px`;
      popover.style.right = "auto";
      popover.style.bottom = "auto";
      popover.setAttribute("data-popover-placement", placement);
    };

    const applyStatusAccent = () => {
      const value = statusInput.value || "In Progress";
      statusInput.setAttribute("data-status", value);
      if (statusSelectWrap) statusSelectWrap.setAttribute("data-status", value);
    };

    const setTipFeedback = (message) => {
      if (!actionFeedback) return;
      actionFeedback.textContent = String(message || "");
      actionFeedback.setAttribute("data-tone", "muted");
    };

    const setActionFeedback = (message, tone = "muted") => {
      if (!actionStatus) return;
      const text = String(message || "").trim();
      actionStatus.textContent = text;
      actionStatus.setAttribute("data-tone", tone);
      actionStatus.hidden = !text;
    };

    const showSettingsFieldSuccess = (control, message = "Saved.") => {
      if (!control || !(control instanceof Element) || !settingsPagePanel) return;
      const field = control.closest(".settings-field");
      if (!field || !settingsPagePanel.contains(field)) return;
      let successNote = field.querySelector(".settings-field-status");
      if (!successNote) {
        successNote = document.createElement("p");
        successNote.className = "field-subtext field-subtext-success settings-field-status";
        successNote.hidden = true;
        field.appendChild(successNote);
      }
      successNote.textContent = String(message || "Saved.");
      successNote.hidden = false;

      const existingTimer = settingsSuccessTimers.get(field);
      if (existingTimer) {
        global.clearTimeout(existingTimer);
      }
      const timer = global.setTimeout(() => {
        successNote.hidden = true;
        settingsSuccessTimers.delete(field);
      }, 1600);
      settingsSuccessTimers.set(field, timer);
    };

    const setPartyModeActive = (active) => {
      if (!modalCard) return;
      if (active) {
        modalCard.setAttribute("data-party-mode", "true");
      } else {
        modalCard.removeAttribute("data-party-mode");
      }
    };

    const clearPartyBassPulse = () => {
      if (partyBassPulseResetTimer) {
        global.clearTimeout(partyBassPulseResetTimer);
        partyBassPulseResetTimer = 0;
      }
      partyBassScaleCurrent = 1;
      partyBassEnergyEma = 0;
      partyBassRmsEma = 0;
      partyBassPeakEma = 0;
      partyBassLastPulseAt = 0;
      if (modalCard) {
        modalCard.style.setProperty("--modal-party-bass-scale", "1");
      }
    };

    const pulseModalPartyBass = (beatPayload) => {
      if (!modalCard) return;
      if (settingsState.accentPartyMode !== true) return;
      if (isMotionDisabled()) {
        clearPartyBassPulse();
        return;
      }

      const energy = clampNumber(Number(beatPayload && beatPayload.energy), 0, 1, 0);
      const rms = clampNumber(Number(beatPayload && beatPayload.rms), 0, 1, 0);
      const mode = String(beatPayload && beatPayload.mode || "beat");
      const now = global.performance ? global.performance.now() : Date.now();
      const intervalMs = clampNumber(Number(beatPayload && beatPayload.intervalMs), 90, 1600, 420);
      partyBassEnergyEma = partyBassEnergyEma > 0
        ? ((partyBassEnergyEma * 0.84) + (energy * 0.16))
        : energy;
      partyBassRmsEma = partyBassRmsEma > 0
        ? ((partyBassRmsEma * 0.86) + (rms * 0.14))
        : rms;

      if (mode === "fallback") return;

      const baseline = (partyBassEnergyEma * 0.68) + (partyBassRmsEma * 0.32);
      const instant = (energy * 0.7) + (rms * 0.3);
      const spike = Math.max(0, instant - baseline);
      partyBassPeakEma = partyBassPeakEma > 0
        ? ((partyBassPeakEma * 0.88) + (spike * 0.12))
        : spike;

      const bassDrive = Math.max(0, Math.min(1, (energy - 0.12) / 0.52));
      const rmsDrive = Math.max(0, Math.min(1, (rms - 0.018) / 0.09));
      const spikeFloor = Math.max(0.005, partyBassPeakEma * 0.6);
      const spikeCeil = Math.max(0.035, partyBassPeakEma * 2.2);
      const spikeDrive = clampNumber((spike - spikeFloor) / Math.max(0.0001, spikeCeil - spikeFloor), 0, 1, 0);

      const isBeatMode = mode === "beat";
      const pulseCooldownMs = isBeatMode ? 132 : 248;
      if ((now - partyBassLastPulseAt) < pulseCooldownMs) return;

      // Visualizer frames should only pulse on high spikes, not every frame.
      if (!isBeatMode) {
        const visualGate = energy > Math.max(0.08, partyBassEnergyEma * 1.12) && spikeDrive > 0.55;
        if (!visualGate) return;
      }

      let beatDrive = Math.max(bassDrive, rmsDrive * 0.8);
      beatDrive = isBeatMode
        ? ((beatDrive * 0.72) + (spikeDrive * 0.56))
        : ((beatDrive * 0.42) + (spikeDrive * 0.9));
      if (beatDrive < 0.18) return;

      partyBassLastPulseAt = now;
      const pulseScale = 1 + (0.002 + (beatDrive * 0.012));
      partyBassScaleCurrent = Math.max(partyBassScaleCurrent * 0.94, pulseScale);
      modalCard.style.setProperty("--modal-party-bass-scale", partyBassScaleCurrent.toFixed(4));

      if (partyBassPulseResetTimer) {
        global.clearTimeout(partyBassPulseResetTimer);
      }
      const releaseMs = Math.round(Math.max(120, Math.min(320, (intervalMs * 0.4) + 90)));
      partyBassPulseResetTimer = global.setTimeout(() => {
        partyBassPulseResetTimer = 0;
        partyBassScaleCurrent = 1;
        if (!modalCard || settingsState.accentPartyMode !== true) return;
        modalCard.style.setProperty("--modal-party-bass-scale", "1");
      }, releaseMs);
    };

    const applyPartyHueStyles = (hueValue) => {
      if (!modalCard) return;
      const hue = Math.round(clampNumber(hueValue, 0, 360, getResolvedAccentHue()));
      const resolvedTheme = getResolvedTheme();
      const accentPrimary = resolvedTheme === "light"
        ? `oklch(0.72 0.16 ${hue})`
        : `oklch(0.67 0.19 ${hue})`;
      const accentSoft = resolvedTheme === "light"
        ? `oklch(0.64 0.15 ${hue})`
        : `oklch(0.62 0.18 ${hue})`;
      const accentFocus = resolvedTheme === "light"
        ? `oklch(0.60 0.17 ${hue})`
        : `oklch(0.75 0.14 ${hue})`;
      const scrollA = resolvedTheme === "light"
        ? `oklch(0.66 0.13 ${hue})`
        : `oklch(0.69 0.15 ${hue})`;
      const scrollB = resolvedTheme === "light"
        ? `oklch(0.79 0.10 ${hue})`
        : `oklch(0.80 0.11 ${hue})`;
      const accentInvertHue = (hue + 180) % 360;
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
      if (modal) {
        modal.style.setProperty("--surface-button-primary", accentPrimary);
        modal.style.setProperty("--surface-button-primary-soft", accentSoft);
      }
    };

    const stopAccentPartyMode = () => {
      if (accentPartyTimer) {
        global.clearInterval(accentPartyTimer);
        accentPartyTimer = 0;
      }
      clearPartyBassPulse();
      setPartyModeActive(false);
    };

    const getPartyBaseHueStep = () => {
      const preset = Math.round(clampNumber(settingsState.animationSpeed, ANIMATION_SPEED_MIN, ANIMATION_SPEED_MAX, DEFAULT_MODAL_SETTINGS.animationSpeed));
      const speed = ANIMATION_SPEED_SCALES[preset] == null ? 1 : ANIMATION_SPEED_SCALES[preset];
      if (speed <= 0) return 0;
      // Keep party hue movement continuous and tied to animation speed preset.
      return clampNumber(0.6 + (speed * 2.4), 0.6, 8, 3);
    };

    const startAccentPartyMode = () => {
      if (accentPartyTimer) return;
      partyHueCurrent = getResolvedAccentHue();
      clearPartyBassPulse();
      accentPartyTimer = global.setInterval(() => {
        const baseStep = getPartyBaseHueStep();
        if (baseStep <= 0) return;
        partyHueCurrent = (partyHueCurrent + baseStep) % 360;
        applyPartyHueStyles(partyHueCurrent);
      }, 120);
      setPartyModeActive(true);
    };

    const applyBeatDrivenPartySnap = (beatPayload) => {
      if (settingsState.accentPartyMode !== true) return;
      if (settingsState.audioBpmInfluenceEnabled !== true) return;
      const now = global.performance ? global.performance.now() : Date.now();
      const intervalMs = lastPartyBeatAt > 0 ? Math.max(1, now - lastPartyBeatAt) : 710;
      lastPartyBeatAt = now;
      partyBeatIntervalEma = partyBeatIntervalEma > 0
        ? ((partyBeatIntervalEma * 0.84) + (intervalMs * 0.16))
        : intervalMs;

      const energy = clampNumber(Number(beatPayload && beatPayload.energy), 0, 1, 0.35);
      const rms = clampNumber(Number(beatPayload && beatPayload.rms), 0, 1, 0.03);
      const previousEnergyEma = partyBeatEnergyEma > 0 ? partyBeatEnergyEma : energy;
      const previousRmsEma = partyBeatRmsEma > 0 ? partyBeatRmsEma : rms;
      const energyDelta = energy - previousEnergyEma;
      const rmsDelta = rms - previousRmsEma;
      partyBeatEnergyEma = partyBeatEnergyEma > 0
        ? ((partyBeatEnergyEma * 0.88) + (energy * 0.12))
        : energy;
      partyBeatRmsEma = partyBeatRmsEma > 0
        ? ((partyBeatRmsEma * 0.88) + (rms * 0.12))
        : rms;

      const cadenceNormalized = Math.max(0, Math.min(1, (640 - partyBeatIntervalEma) / 360));
      const energyNormalized = Math.max(0, Math.min(1, (energy - 0.16) / 0.56));
      const transientEnergy = Math.max(0, Math.min(1, Math.abs(energyDelta) * 3.8));
      const transientRms = Math.max(0, Math.min(1, Math.abs(rmsDelta) * 10));
      const variability = Math.max(transientEnergy, transientRms);
      const strength = clampNumber(
        settingsState.audioBpmInfluenceStrength,
        AUDIO_BPM_INFLUENCE_STRENGTH_MIN,
        AUDIO_BPM_INFLUENCE_STRENGTH_MAX,
        DEFAULT_MODAL_SETTINGS.audioBpmInfluenceStrength
      ) / 100;
      const reactiveScore = Math.max(0, Math.min(1, (cadenceNormalized * 0.42) + (energyNormalized * 0.38) + (variability * 0.2)));
      const beatStep = (reactiveScore * 14) + (variability * 10) + (strength * 8);
      const directionScore = (energyDelta * 0.72) + (rmsDelta * 0.28);
      const direction = directionScore < -0.0015 ? -1 : 1;
      partyHueCurrent = (partyHueCurrent + (beatStep * direction) + 360) % 360;
      applyPartyHueStyles(partyHueCurrent);
      setPartyModeActive(true);
    };

    const syncAccentPartyMode = () => {
      if (settingsState.accentPartyMode === true) {
        startAccentPartyMode();
      } else {
        stopAccentPartyMode();
      }
    };

    const ensureConfettiCanvas = () => {
      if (!modalCard) return null;
      if (!confettiCanvas) {
        confettiCanvas = modalConfettiCanvas || null;
      }
      if (!confettiCanvas) {
        confettiCanvas = document.createElement("canvas");
        confettiCanvas.className = "modal-confetti-canvas";
        confettiCanvas.id = "modal-confetti-canvas";
        confettiCanvas.setAttribute("aria-hidden", "true");
        confettiCanvas.hidden = true;
        modalCard.appendChild(confettiCanvas);
      }
      if (!confettiContext) {
        confettiContext = confettiCanvas.getContext("2d");
      }
      return confettiCanvas;
    };

    const resizeConfettiCanvas = () => {
      if (!confettiCanvas || !modalCard) return;
      const width = Math.max(1, Math.floor(modalCard.clientWidth));
      const height = Math.max(1, Math.floor(modalCard.clientHeight));
      if (confettiCanvas.width === width && confettiCanvas.height === height) return;
      confettiCanvas.width = width;
      confettiCanvas.height = height;
    };

    const stopConfettiOverlay = () => {
      if (confettiRafId) {
        global.cancelAnimationFrame(confettiRafId);
        confettiRafId = 0;
      }
      confettiParticles = [];
      confettiUntil = 0;
      if (confettiCanvas) {
        confettiCanvas.classList.remove("is-active");
        confettiCanvas.hidden = true;
      }
    };

    const launchConfettiOverlay = (durationMs = 1800) => {
      const canvas = ensureConfettiCanvas();
      if (!canvas || !confettiContext) return;
      resizeConfettiCanvas();
      stopConfettiOverlay();
      playUiConfettiSfx();

      const width = canvas.width;
      const height = canvas.height;
      const palette = ["#ff4d6d", "#ff8f3d", "#ffd447", "#41d87d", "#2cb4ff", "#8a6bff", "#ff58c0"];
      confettiParticles = Array.from({ length: 120 }, (_, index) => {
        const shapeType = index % 3;
        return {
          x: Math.random() * width,
          y: -20 - (Math.random() * height * 0.45),
          vx: (Math.random() - 0.5) * 2.8,
          vy: 1.2 + (Math.random() * 3.2),
          spin: (Math.random() - 0.5) * 0.3,
          rot: Math.random() * Math.PI * 2,
          size: 4 + (Math.random() * 7),
          shape: shapeType === 0 ? "rect" : (shapeType === 1 ? "circle" : "triangle"),
          color: palette[index % palette.length],
          drift: (Math.random() - 0.5) * 0.8
        };
      });
      confettiUntil = performance.now() + Math.max(700, durationMs);
      canvas.hidden = false;
      canvas.classList.add("is-active");

      const drawParticle = (particle) => {
        confettiContext.save();
        confettiContext.translate(particle.x, particle.y);
        confettiContext.rotate(particle.rot);
        confettiContext.fillStyle = particle.color;
        if (particle.shape === "circle") {
          confettiContext.beginPath();
          confettiContext.arc(0, 0, particle.size * 0.5, 0, Math.PI * 2);
          confettiContext.fill();
        } else if (particle.shape === "triangle") {
          const half = particle.size * 0.55;
          confettiContext.beginPath();
          confettiContext.moveTo(0, -half);
          confettiContext.lineTo(half, half);
          confettiContext.lineTo(-half, half);
          confettiContext.closePath();
          confettiContext.fill();
        } else {
          confettiContext.fillRect(-particle.size * 0.45, -particle.size * 0.25, particle.size * 0.9, particle.size * 0.5);
        }
        confettiContext.restore();
      };

      const tickConfetti = () => {
        if (!confettiCanvas || !confettiContext) return;
        const now = performance.now();
        resizeConfettiCanvas();
        const w = confettiCanvas.width;
        const h = confettiCanvas.height;
        confettiContext.clearRect(0, 0, w, h);

        const remaining = Math.max(0, confettiUntil - now);
        const fade = Math.max(0.16, Math.min(1, remaining / Math.max(700, durationMs)));
        confettiContext.globalAlpha = fade;
        confettiParticles.forEach((particle) => {
          particle.x += particle.vx + particle.drift;
          particle.y += particle.vy;
          particle.vy += 0.028;
          particle.rot += particle.spin;
          if (particle.x < -24) particle.x = w + 24;
          if (particle.x > w + 24) particle.x = -24;
          drawParticle(particle);
        });
        confettiContext.globalAlpha = 1;

        const allPastBottom = confettiParticles.every((particle) => particle.y > h + 28);
        if (remaining <= 0 || allPastBottom) {
          stopConfettiOverlay();
          return;
        }
        confettiRafId = global.requestAnimationFrame(tickConfetti);
      };

      confettiRafId = global.requestAnimationFrame(tickConfetti);
    };

    const updateToastProgress = () => {
      if (!modalToast || !toastDurationMs || !toastStartedAt) return;
      const elapsed = Date.now() - toastStartedAt;
      const progress = Math.max(0, Math.min(1, 1 - (elapsed / toastDurationMs)));
      modalToast.style.setProperty("--toast-progress", progress.toFixed(4));
      if (progress <= 0) {
        toastProgressRafId = 0;
        return;
      }
      toastProgressRafId = global.requestAnimationFrame(updateToastProgress);
    };

    const clearToastTimers = () => {
      if (toastHideTimer) {
        global.clearTimeout(toastHideTimer);
        toastHideTimer = 0;
      }
      if (toastProgressRafId) {
        global.cancelAnimationFrame(toastProgressRafId);
        toastProgressRafId = 0;
      }
    };

    const showToast = (message, tone = "success", durationMs = 2200) => {
      if (!modalToast) return;
      clearToastTimers();
      modalToast.textContent = String(message || "");
      modalToast.setAttribute("data-tone", tone);
      modalToast.style.setProperty("--toast-progress", "1");
      modalToast.hidden = false;
      modalToast.classList.add("is-visible");
      toastStartedAt = Date.now();
      toastDurationMs = Math.max(900, Math.round(durationMs));
      toastProgressRafId = global.requestAnimationFrame(updateToastProgress);
      toastHideTimer = global.setTimeout(() => {
        modalToast.classList.remove("is-visible");
        modalToast.hidden = true;
        modalToast.style.setProperty("--toast-progress", "0");
        toastStartedAt = 0;
        toastDurationMs = 0;
        if (toastProgressRafId) {
          global.cancelAnimationFrame(toastProgressRafId);
          toastProgressRafId = 0;
        }
        toastHideTimer = 0;
      }, toastDurationMs);
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
        lofiPlaybackSnapshot = {
          playing: isPlaying && !isFailed,
          failed: isFailed,
          volume: clampNumber(volume, 0, 1, 0.35)
        };
        lofiToggleBtn.disabled = isFailed;
        lofiToggleBtn.classList.toggle("is-playing", isPlaying && !isFailed);
        if (lofiVolumeInput) {
          lofiVolumeInput.disabled = isFailed;
          lofiVolumeInput.value = String(volumePercent);
          const volumeTooltip = `Music volume ${volumePercent}%\n---\n[Ctrl + M] to mute`;
          setElementTooltip(lofiVolumeInput, volumeTooltip);
          lofiVolumeInput.setAttribute("aria-label", `Music volume ${volumePercent} percent. Ctrl + M to mute.`);
        }
        if (iconNode) {
          iconNode.textContent = isFailed ? "wifi_off" : (isPlaying ? "pause" : "play_arrow");
        }
        const playPauseTooltip = `${isPlaying ? "Pause music [Space]" : "Play music [Space]"} (when not typing)`;
        const title = isFailed
          ? `${snapshot.disabledReason || "Stream unavailable"}`
          : `Be in the zone whenever you send a task update... or not\n---\n${playPauseTooltip}`;
        setElementTooltip(lofiToggleBtn, title);
        lofiToggleBtn.setAttribute("aria-label", isFailed ? title : playPauseTooltip);
      };
      const unsubscribe = controller.subscribe(updateUi);
      if (typeof controller.subscribeBeats === "function") {
        if (unbindLofiBeatSnap) {
          unbindLofiBeatSnap();
          unbindLofiBeatSnap = null;
        }
        unbindLofiBeatSnap = controller.subscribeBeats((beatPayload) => {
          const beatMode = String(beatPayload && beatPayload.mode || "beat");
          if (beatMode !== "visualizer") {
            registerAudioInfluenceBeat(beatPayload);
          }
          if (settingsState.audioBpmInfluenceEnabled === true && beatMode !== "visualizer") {
            applyModalSettings();
          }
          pulseModalPartyBass(beatPayload);
          applyBeatDrivenPartySnap(beatPayload);
        });
      }
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
      const currentStreamUrl = getAudioStreamUrlForSettings(settingsState);
      if (typeof controller.setStreamUrl === "function") {
        controller.setStreamUrl(currentStreamUrl, { restartPlayback: false });
      }
      if (settingsState.musicAutoplay !== false) {
        if (typeof controller.modalEnter === "function") {
          controller.modalEnter({ autoplay: true });
        } else {
          controller.maybeAutoplay();
        }
      } else {
        const keepRadioAlive = settingsState.keepRadioOn === true
          && settingsState.audioStreamSource === "radio";
        if (!keepRadioAlive) {
          controller.pause();
        }
      }
      controller.setPlaybackTuning({
        speedRate: settingsState.lofiSpeedRate,
        pitchRate: settingsState.lofiPitchRate,
        ratePitchSync: settingsState.lofiRatePitchSync,
        spatialEnabled: settingsState.lofi8dEnabled !== false,
        spatialDepth: DEFAULT_MODAL_SETTINGS.lofi8dDepth / 100,
        spatialRate: clampNumber(settingsState.lofi8dRate, LOFI_8D_RATE_MIN, LOFI_8D_RATE_MAX, DEFAULT_MODAL_SETTINGS.lofi8dRate)
      });
      return () => {
        lofiToggleBtn.removeEventListener("click", onToggleClick);
        if (lofiVolumeInput) {
          lofiVolumeInput.removeEventListener("input", onVolumeInput);
        }
        if (unbindLofiBeatSnap) {
          unbindLofiBeatSnap();
          unbindLofiBeatSnap = null;
        }
        unsubscribe();
      };
    };

    const isAllowedAudioStreamUrl = (url) => {
      const raw = String(url || "").trim();
      if (!raw) return false;
      const lowerRaw = raw.toLowerCase();
      if (lowerRaw === String(LOFI_STREAM_URL).toLowerCase()) return true;
      if (RADIO_STATION_URLS.has(lowerRaw)) return true;
      try {
        const parsed = new URL(raw);
        const normalized = String(parsed.href || "").trim().toLowerCase();
        if (!normalized) return false;
        if (normalized === String(LOFI_STREAM_URL).toLowerCase()) return true;
        return RADIO_STATION_URLS.has(normalized);
      } catch {
        return false;
      }
    };

    const getAmbientEnabledKey = (trackId) => {
      switch (String(trackId || "").trim().toLowerCase()) {
        case "rain": return "ambientRainEnabled";
        case "beach": return "ambientBeachEnabled";
        case "crickets": return "ambientCricketsEnabled";
        case "thunder": return "ambientThunderEnabled";
        case "city": return "ambientCityEnabled";
        case "white": return "ambientWhiteEnabled";
        default: return "";
      }
    };

    const getAmbientVolumeKey = (trackId) => {
      switch (String(trackId || "").trim().toLowerCase()) {
        case "rain": return "ambientRainVolume";
        case "beach": return "ambientBeachVolume";
        case "crickets": return "ambientCricketsVolume";
        case "thunder": return "ambientThunderVolume";
        case "city": return "ambientCityVolume";
        case "white": return "ambientWhiteVolume";
        default: return "";
      }
    };

    const getAmbientTrackConfig = (trackId) =>
      AMBIENT_NOISE_TRACKS.find((track) => track.id === trackId) || null;

    const isAmbientTrackEnabled = (trackId) => {
      const enabledKey = getAmbientEnabledKey(trackId);
      return enabledKey ? settingsState[enabledKey] === true : false;
    };

    const getAmbientTrackVolumePercent = (trackId) => {
      const volumeKey = getAmbientVolumeKey(trackId);
      if (!volumeKey) return 0;
      return normalizeAmbientVolume(settingsState[volumeKey], 35);
    };

    const stopAmbientTrack = (trackId) => {
      const entry = ambientTrackState.get(trackId);
      if (!entry) return;
      if (entry.restartTimer) {
        global.clearTimeout(entry.restartTimer);
        entry.restartTimer = 0;
      }
      if (entry.audio) {
        try { entry.audio.pause(); } catch {}
      }
    };

    const ensureAmbientTrackEntry = (trackId) => {
      const config = getAmbientTrackConfig(trackId);
      if (!config) return null;
      const existing = ambientTrackState.get(trackId);
      if (existing && existing.audio) return existing;
      const audio = new Audio();
      audio.preload = "none";
      audio.autoplay = false;
      audio.loop = false;
      audio.volume = 0;
      const entry = {
        audio,
        restartTimer: 0,
        objectUrl: "",
        gmFallbackAttempted: false,
        gmFallbackPromise: null,
        unavailableNotified: false
      };
      const playWithFallback = () => {
        const loadViaGmFallback = () => {
          if (entry.gmFallbackAttempted) return;
          entry.gmFallbackAttempted = true;
          if (typeof global.GM_xmlhttpRequest !== "function") {
            if (!entry.unavailableNotified) {
              entry.unavailableNotified = true;
              showToast(`SFX unavailable: ${config.label}.`, "error");
            }
            return;
          }
          if (!entry.gmFallbackPromise) {
            entry.gmFallbackPromise = new Promise((resolve) => {
              try {
                global.GM_xmlhttpRequest({
                  method: "GET",
                  url: config.url,
                  responseType: "blob",
                  timeout: 6000,
                  onload: (response) => {
                    const status = Number(response && response.status);
                    const blob = response && response.response;
                    if (!Number.isFinite(status) || status < 200 || status >= 400 || !(blob instanceof Blob)) {
                      resolve(false);
                      return;
                    }
                    try {
                      const nextObjectUrl = URL.createObjectURL(blob);
                      if (entry.objectUrl) {
                        try { URL.revokeObjectURL(entry.objectUrl); } catch {}
                      }
                      entry.objectUrl = nextObjectUrl;
                      audio.src = nextObjectUrl;
                      resolve(true);
                    } catch {
                      resolve(false);
                    }
                  },
                  ontimeout: () => resolve(false),
                  onerror: () => resolve(false),
                  onabort: () => resolve(false)
                });
              } catch {
                resolve(false);
              }
            });
          }
          entry.gmFallbackPromise.then((ok) => {
            if (!ok) {
              if (!entry.unavailableNotified) {
                entry.unavailableNotified = true;
                showToast(`SFX unavailable: ${config.label}.`, "error");
              }
              return;
            }
            if (closed || !isAmbientTrackEnabled(trackId)) return;
            audio.currentTime = 0;
            audio.volume = clampNumber(getAmbientTrackVolumePercent(trackId) / 100, 0, 1, 0);
            audio.play().catch(() => {});
          });
        };
        const attemptPlay = () => {
          if (!audio.src) {
            loadViaGmFallback();
            return;
          }
          try {
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {
                loadViaGmFallback();
              });
            }
          } catch {
            // Ignore play start errors; async fallback handles loading failures.
          }
        };
        attemptPlay();
      };
      audio.addEventListener("ended", () => {
        if (closed) return;
        if (!isAmbientTrackEnabled(trackId)) return;
        const delayMs = Math.max(0, Math.round(config.delayMs || 0));
        entry.restartTimer = global.setTimeout(() => {
          entry.restartTimer = 0;
          if (closed || !isAmbientTrackEnabled(trackId)) return;
          const liveVolume = getAmbientTrackVolumePercent(trackId) / 100;
          audio.volume = clampNumber(liveVolume, 0, 1, 0);
          audio.currentTime = 0;
          playWithFallback();
        }, delayMs);
      });
      audio.addEventListener("error", () => {
        playWithFallback();
      });
      ambientTrackState.set(trackId, entry);
      return entry;
    };

    const syncAmbientTrackPlayback = (trackId) => {
      const config = getAmbientTrackConfig(trackId);
      if (!config) return;
      const enabled = isAmbientTrackEnabled(trackId);
      const volumeRatio = clampNumber(getAmbientTrackVolumePercent(trackId) / 100, 0, 1, 0);
      const entry = ensureAmbientTrackEntry(trackId);
      if (!entry || !entry.audio) return;
      if (entry.restartTimer) {
        global.clearTimeout(entry.restartTimer);
        entry.restartTimer = 0;
      }
      entry.audio.volume = volumeRatio;
      if (!enabled || volumeRatio <= 0.0001) {
        stopAmbientTrack(trackId);
        return;
      }
      if (entry.audio.paused || entry.audio.ended) {
        try {
          const playPromise = entry.audio.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
              if (typeof entry.audio.dispatchEvent === "function") {
                try {
                  entry.audio.dispatchEvent(new Event("error"));
                } catch {}
              }
            });
          }
        } catch {}
      }
    };

    const stopAllAmbientNoise = () => {
      AMBIENT_NOISE_TRACKS.forEach((track) => stopAmbientTrack(track.id));
    };

    const validateAudioStreamUrl = async (url, { timeoutMs = 2600 } = {}) => {
      const targetUrl = String(url || "").trim();
      if (!isAllowedAudioStreamUrl(targetUrl)) return false;
      const safeTimeoutMs = Math.max(900, Math.round(timeoutMs) || 2600);

      if (typeof global.GM_xmlhttpRequest === "function") {
        return await new Promise((resolve) => {
          let settled = false;
          const finish = (value) => {
            if (settled) return;
            settled = true;
            resolve(Boolean(value));
          };
          const hardTimeout = global.setTimeout(() => finish(false), safeTimeoutMs + 320);
          try {
            global.GM_xmlhttpRequest({
              method: "GET",
              url: targetUrl,
              headers: { Range: "bytes=0-16384" },
              timeout: safeTimeoutMs,
              onprogress: (event) => {
                const status = Number(event && event.status);
                if (!Number.isFinite(status) || (status >= 200 && status < 400)) {
                  global.clearTimeout(hardTimeout);
                  finish(true);
                }
              },
              onload: (response) => {
                global.clearTimeout(hardTimeout);
                const status = Number(response && response.status);
                finish(Number.isFinite(status) && status >= 200 && status < 400);
              },
              ontimeout: () => {
                global.clearTimeout(hardTimeout);
                finish(false);
              },
              onerror: () => {
                global.clearTimeout(hardTimeout);
                finish(false);
              },
              onabort: () => {
                global.clearTimeout(hardTimeout);
                finish(false);
              }
            });
          } catch {
            global.clearTimeout(hardTimeout);
            finish(false);
          }
        });
      }

      try {
        const canAbort = typeof AbortController === "function";
        const controller = canAbort ? new AbortController() : null;
        let timer = 0;
        if (controller) {
          timer = global.setTimeout(() => controller.abort(), safeTimeoutMs);
        }
        const response = await fetch(targetUrl, {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          signal: controller ? controller.signal : undefined
        });
        if (timer) global.clearTimeout(timer);
        if (response && response.type === "opaque") return true;
        return Boolean(response && response.ok);
      } catch {
        return false;
      }
    };

    const applyAudioStreamSelection = async ({ source, stationUrl } = {}) => {
      const normalizedSource = AUDIO_STREAM_SOURCE_OPTIONS.has(String(source || "").trim().toLowerCase())
        ? String(source).trim().toLowerCase()
        : settingsState.audioStreamSource;
      const normalizedStationUrl = normalizeRadioStationUrl(
        stationUrl,
        settingsState.radioStationUrl
      );
      const sourceChanged = normalizedSource !== settingsState.audioStreamSource;
      const stationChanged = normalizedStationUrl !== settingsState.radioStationUrl;
      if (!sourceChanged && !stationChanged) {
        return true;
      }

      const targetUrl = normalizedSource === "radio"
        ? normalizedStationUrl
        : LOFI_STREAM_URL;
      if (normalizedSource === "radio") {
        const token = ++radioStationValidationToken;
        radioStationApplyPending = true;
        applyModalSettings();
        const valid = await validateAudioStreamUrl(targetUrl);
        if (token !== radioStationValidationToken) return false;
        radioStationApplyPending = false;
        if (!valid) {
          // Pre-check can fail for some providers even when playback still works.
          const station = getRadioStationByUrl(normalizedStationUrl);
          showToast(`Radio validation timed out, trying anyway: ${station.label}.`, "muted");
        }
      }

      commitModalSettings(
        {
          audioStreamSource: normalizedSource,
          radioStationUrl: normalizedStationUrl
        },
        { preserveScroll: true, stabilizeScroll: false }
      );

      if (normalizedSource === "radio") {
        const station = getRadioStationByUrl(normalizedStationUrl);
        showToast(`Radio channel switched: ${station.label}`, "success");
      } else if (sourceChanged) {
        showToast("Music source switched to Default stream.", "success");
      }
      return true;
    };

    const syncCopyMainButton = () => {
      const config = COPY_FORMATS["inner-html"];
      copyMainBtn.setAttribute("data-copy-format", "inner-html");
      setElementTooltip(copyMainBtn, config.label);
      const iconNode = copyMainBtn.querySelector(".material-symbols-outlined");
      const labelNode = copyMainBtn.querySelector("span:last-child");
      if (iconNode) iconNode.textContent = config.icon;
      if (labelNode) labelNode.textContent = config.label;
    };

    const showTriggerSlashError = () => {
      if (!triggerTextInput) return;
      triggerTextInput.classList.add("input-error");
      triggerTextInput.setAttribute("aria-invalid", "true");
      if (triggerTextError) {
        triggerTextError.hidden = false;
        triggerTextError.textContent = "Slash / is not allowed because ClickUp already uses it for shortcuts.";
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
          ? "Slash / is not allowed because ClickUp already uses it for shortcuts."
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

    const buildPlainText = (data) => {
      if (typeof buildHTML !== "function") return "";
      const scratch = document.createElement("div");
      scratch.innerHTML = buildHTML(data);
      const value = String(scratch.innerText || scratch.textContent || "")
        .replace(/\u00a0/g, " ")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      scratch.remove();
      return value;
    };

    const buildMarkdown = (data) => {
      const headingText = data.appendNumberSuffix === false
        ? data.label
        : `${data.label} ${data.number}`.trim();
      const lines = [`## ${headingText}`, "", `**Status:** ${data.status}`, ""];

      const formatMarkdownListLine = (item) => {
        const value = String(item || "").trim();
        if (!value) return "- ";
        if (/^(>+|\#{1,6}\s|[-*]\s|\d+\.\s)/.test(value)) return value;
        return `- ${value}`;
      };

      const appendSection = (title, items, required = false) => {
        if (!required && (!items || items.length === 0)) return;
        lines.push(`### ${title}`);
        if (!items || items.length === 0) {
          lines.push("- ");
        } else {
          items.forEach((item) => lines.push(formatMarkdownListLine(item)));
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

    const openAiPopup = (url, popupName) => {
      if (!url) return false;
      const safeName = String(popupName || "ai").trim() || "ai";
      const popup = global.open(
        url,
        `clickup-update-modal-${safeName}`,
        "popup=yes,width=920,height=700,toolbar=no,location=yes,status=yes,menubar=no,scrollbars=yes,resizable=yes"
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
      setFieldError(accInput, accError, accInvalid, "Accomplishments are required.");

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
      const scrollTop = settingsPageScrollHost.scrollTop;
      const topOffset = scrollTop + 18;
      const nearBottom = scrollTop + settingsPageScrollHost.clientHeight >= settingsPageScrollHost.scrollHeight - 6;
      let activeSectionId = "";

      settingsAnchorButtons.forEach((button, index) => {
        const target = String(button.getAttribute("data-settings-anchor-target") || "").trim();
        if (!target) return;
        const sectionEl = byId(target);
        if (!sectionEl) return;
        const sectionTop = sectionEl.offsetTop;
        if (sectionTop <= topOffset || index === 0) {
          activeSectionId = target;
        }
      });

      if (nearBottom) {
        const lastButton = settingsAnchorButtons[settingsAnchorButtons.length - 1];
        if (lastButton) {
          const lastTarget = String(lastButton.getAttribute("data-settings-anchor-target") || "").trim();
          if (lastTarget) activeSectionId = lastTarget;
        }
      }

      if (!activeSectionId && settingsAnchorButtons[0]) {
        activeSectionId = String(settingsAnchorButtons[0].getAttribute("data-settings-anchor-target") || "").trim();
      }
      setSettingsAnchorActiveState(activeSectionId);
    };

    const scrollToSettingsSection = (sectionId, behavior = "smooth") => {
      if (!sectionId) return;
      const scrollHost = settingsPageScrollHost;
      let targetSection = byId(sectionId);
      if (!targetSection && settingsPageContent) {
        const normalizedId = String(sectionId).trim().toLowerCase();
        const anchorName = normalizedId.replace(/^settings-section-/, "");
        targetSection = settingsPageContent.querySelector(`[data-settings-anchor="${anchorName.charAt(0).toUpperCase()}${anchorName.slice(1)}"]`);
      }
      if (!scrollHost || !targetSection) return;
      const offset = targetSection.offsetTop - 8;
      scrollHost.scrollTo({
        top: Math.max(0, offset),
        behavior
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
      if (activePage === "usage") {
        updateUsagePanel();
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
      return ACCENT_PRESET_OKLCH_HUES[settingsState.accentPreset] || DEFAULT_ACCENT_HUE;
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
      if (accentPartyToggle) {
        const isPartying = settingsState.accentPartyMode === true;
        accentPartyToggle.classList.toggle("is-active", isPartying);
        accentPartyToggle.setAttribute("aria-pressed", isPartying ? "true" : "false");
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
        // Hue ring is drawn with 0deg at top; convert to screen angle (0deg at right).
        const radians = ((resolvedHue - 90) * Math.PI) / 180;
        const radius = 63;
        const offsetX = Math.cos(radians) * radius;
        const offsetY = Math.sin(radians) * radius;
        accentHueThumb.style.transform = `translate(calc(-50% + ${offsetX.toFixed(2)}px), calc(-50% + ${offsetY.toFixed(2)}px))`;
        accentHueThumb.style.background = `oklch(0.66 0.19 ${Math.round(resolvedHue)})`;
      }
    };

    const isReducedMotionActive = () => (
      settingsState.animationFollowDevice !== false
      && Boolean(reducedMotionPreference && reducedMotionPreference.matches)
    );

    const isPreviewReducedMotionLocked = () => settingsState.animationFollowDevice !== false;

    const isMotionDisabled = () => {
      const preset = Math.round(clampNumber(settingsState.animationSpeed, ANIMATION_SPEED_MIN, ANIMATION_SPEED_MAX, 2));
      return preset === ANIMATION_SPEED_MAX || isReducedMotionActive();
    };

    const getMotionScale = () => {
      if (isMotionDisabled()) return 1;
      const preset = Math.round(clampNumber(settingsState.animationSpeed, ANIMATION_SPEED_MIN, ANIMATION_SPEED_MAX, 2));
      const followDevice = settingsState.animationFollowDevice !== false;
      const deviceReduced = Boolean(reducedMotionPreference && reducedMotionPreference.matches);
      let speed = ANIMATION_SPEED_SCALES[preset] == null ? 1 : ANIMATION_SPEED_SCALES[preset];
      if (followDevice && deviceReduced) {
        speed = Math.min(speed, REDUCED_MOTION_SCALE_CAP);
      }
      let motionScale = 1 / speed;
      if (shouldInfluenceAnimationFromAudio()) {
        motionScale /= getAudioBpmInfluenceFactor();
        motionScale = clampNumber(motionScale, 0.25, 2.5, 1 / speed);
      }
      return motionScale;
    };

    const getEstimatedLofiBpm = () => {
      const controller = app._lofiController;
      if (controller && typeof controller.getEstimatedBpm === "function") {
        return clampNumber(controller.getEstimatedBpm(), 55, 180, BASE_LOFI_BPM);
      }
      return clampNumber(BASE_LOFI_BPM * settingsState.lofiSpeedRate, 55, 180, BASE_LOFI_BPM);
    };

    const getAudioBpmInfluenceFactor = () => {
      if (settingsState.audioBpmInfluenceEnabled !== true) return 1;
      const now = global.performance ? global.performance.now() : Date.now();
      if (audioInfluenceLastFactorAt > 0) {
        const elapsed = Math.max(0, now - audioInfluenceLastFactorAt);
        const decay = Math.exp(-elapsed / 420);
        audioInfluenceBeatBoost *= decay;
      }
      audioInfluenceLastFactorAt = now;

      const strength = clampNumber(
        settingsState.audioBpmInfluenceStrength,
        AUDIO_BPM_INFLUENCE_STRENGTH_MIN,
        AUDIO_BPM_INFLUENCE_STRENGTH_MAX,
        DEFAULT_MODAL_SETTINGS.audioBpmInfluenceStrength
      ) / 100;
      if (strength <= 0) return 1;
      const bpm = getEstimatedLofiBpm();
      const deltaNormalized = (bpm - BASE_LOFI_BPM) / BASE_LOFI_BPM;
      const tempoComponent = deltaNormalized * strength * 1.2;
      const beatComponent = audioInfluenceBeatBoost * (0.25 + (strength * 0.75));
      const factor = 1 + tempoComponent + beatComponent;
      return clampNumber(factor, 0.5, 1.75, 1);
    };

    const registerAudioInfluenceBeat = (beatPayload) => {
      const energy = clampNumber(Number(beatPayload && beatPayload.energy), 0, 1, 0.32);
      const rms = clampNumber(Number(beatPayload && beatPayload.rms), 0, 1, 0.03);
      const intervalMs = clampNumber(Number(beatPayload && beatPayload.intervalMs), 0, 2000, 710);
      const cadence = Math.max(0, Math.min(1, (760 - intervalMs) / 520));
      const energyDrive = Math.max(0, Math.min(1, (energy - 0.14) / 0.58));
      const rmsDrive = Math.max(0, Math.min(1, (rms - 0.018) / 0.09));
      const beatImpact = (cadence * 0.45) + (energyDrive * 0.4) + (rmsDrive * 0.15);
      audioInfluenceLastBeatImpact = beatImpact;
      audioInfluenceBeatBoost = Math.max(0, Math.min(0.95, (audioInfluenceBeatBoost * 0.35) + (beatImpact * 0.75)));
      audioInfluenceLastFactorAt = global.performance ? global.performance.now() : Date.now();
    };

    const shouldInfluenceAnimationFromAudio = () => {
      if (settingsState.audioBpmInfluenceEnabled !== true) return false;
      return settingsState.audioBpmInfluenceMode === "animation" || settingsState.audioBpmInfluenceMode === "both";
    };

    const shouldInfluencePhysicsFromAudio = () => {
      if (settingsState.audioBpmInfluenceEnabled !== true) return false;
      return settingsState.audioBpmInfluenceMode === "physics" || settingsState.audioBpmInfluenceMode === "both";
    };

    const getAudioBpmInfluenceModeIndex = (mode) => {
      if (mode === "animation") return 0;
      if (mode === "physics") return 2;
      return 1;
    };

    const getAudioBpmInfluenceModeFromIndex = (indexValue) => {
      const index = Math.round(clampNumber(indexValue, 0, 2, 1));
      if (index <= 0) return "animation";
      if (index >= 2) return "physics";
      return "both";
    };

    const getEffectivePhysicsIntensity = () => {
      let intensity = clampNumber(
        settingsState.physicsIntensity,
        PHYSICS_INTENSITY_MIN,
        PHYSICS_INTENSITY_MAX,
        DEFAULT_MODAL_SETTINGS.physicsIntensity
      );
      if (shouldInfluencePhysicsFromAudio()) {
        intensity *= getAudioBpmInfluenceFactor();
      }
      return clampNumber(
        Math.round(intensity),
        PHYSICS_INTENSITY_MIN,
        PHYSICS_INTENSITY_MAX,
        DEFAULT_MODAL_SETTINGS.physicsIntensity
      );
    };

    const getPhysicsStrength = () => {
      if (settingsState.physicsEnabled === false) return 0;
      if (isMotionDisabled()) return 0;
      const base = getEffectivePhysicsIntensity() / 100;
      const motionScale = getMotionScale();
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

    const escapeHtml = (value) => String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const INTERPOLATOR_HIGHLIGHT_FUNCTIONS = new Set([
      "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
      "sqrt", "pow", "abs", "min", "max", "round", "floor", "ceil",
      "log", "log10", "exp", "mod", "sign", "clamp", "lerp"
    ]);

    const buildInterpolatorExpressionHighlightHtml = (expressionText) => {
      const raw = String(expressionText || "");
      if (!raw.trim()) return "";
      const tokenPattern = /([A-Za-z_][A-Za-z0-9_]*|\d*\.?\d+(?:e[+-]?\d+)?|[+\-*/^%=(),])/gi;
      const chunks = raw.split(tokenPattern);
      return chunks.map((chunk) => {
        if (!chunk) return "";
        if (/^\d*\.?\d+(?:e[+-]?\d+)?$/i.test(chunk)) {
          return `<span class="expression-highlight-token-num">${escapeHtml(chunk)}</span>`;
        }
        if (/^[+\-*/^%=]$/.test(chunk)) {
          return `<span class="expression-highlight-token-op">${escapeHtml(chunk)}</span>`;
        }
        if (/^[(),]$/.test(chunk)) {
          const tokenClass = chunk === "," ? "expression-highlight-token-punct" : "expression-highlight-token-paren";
          return `<span class="${tokenClass}">${escapeHtml(chunk)}</span>`;
        }
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(chunk)) {
          const normalized = chunk.toLowerCase();
          if (normalized === "t") {
            return `<span class="expression-highlight-token-var">${escapeHtml(chunk)}</span>`;
          }
          if (normalized === "pi" || normalized === "e") {
            return `<span class="expression-highlight-token-const">${escapeHtml(chunk)}</span>`;
          }
          if (INTERPOLATOR_HIGHLIGHT_FUNCTIONS.has(normalized)) {
            return `<span class="expression-highlight-token-fn">${escapeHtml(chunk)}</span>`;
          }
        }
        return escapeHtml(chunk);
      }).join("");
    };

    const getInterpolatorExpressionText = () => {
      if (!interpolatorExpressionInput) return "";
      return String(interpolatorExpressionInput.innerText || "")
        .replace(/\r\n/g, "\n")
        .replace(/\u00a0/g, " ");
    };

    const getCaretOffsetInElement = (element) => {
      if (!element) return null;
      const selection = (typeof shadow.getSelection === "function")
        ? shadow.getSelection()
        : (typeof global.getSelection === "function" ? global.getSelection() : null);
      if (!selection || selection.rangeCount <= 0) return null;
      const activeRange = selection.getRangeAt(0);
      const targetNode = activeRange.endContainer;
      if (!element.contains(targetNode)) return null;

      const range = activeRange.cloneRange();
      range.selectNodeContents(element);
      range.setEnd(targetNode, activeRange.endOffset);
      return range.toString().length;
    };

    const setCaretOffsetInElement = (element, offset) => {
      if (!element) return;
      const selection = (typeof shadow.getSelection === "function")
        ? shadow.getSelection()
        : (typeof global.getSelection === "function" ? global.getSelection() : null);
      if (!selection) return;

      const safeOffset = Math.max(0, Number.isFinite(offset) ? Math.floor(offset) : 0);
      const range = document.createRange();
      const walker = document.createTreeWalker(
        element,
        global.NodeFilter ? global.NodeFilter.SHOW_TEXT : 4
      );

      let remaining = safeOffset;
      let current = walker.nextNode();
      while (current) {
        const length = current.nodeValue ? current.nodeValue.length : 0;
        if (remaining <= length) {
          range.setStart(current, remaining);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        remaining -= length;
        current = walker.nextNode();
      }

      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const renderInterpolatorExpressionHighlight = (expressionText, options = {}) => {
      if (!interpolatorExpressionInput) return;
      const preserveCaret = options.preserveCaret !== false;
      const previousCaretOffset = preserveCaret ? getCaretOffsetInElement(interpolatorExpressionInput) : null;
      const previousScrollTop = interpolatorExpressionInput.scrollTop || 0;
      const previousScrollLeft = interpolatorExpressionInput.scrollLeft || 0;
      interpolatorExpressionInput.innerHTML = buildInterpolatorExpressionHighlightHtml(expressionText);
      if (previousCaretOffset != null) {
        setCaretOffsetInElement(interpolatorExpressionInput, previousCaretOffset);
      }
      interpolatorExpressionInput.scrollTop = previousScrollTop;
      interpolatorExpressionInput.scrollLeft = previousScrollLeft;
    };

    const syncInterpolatorExpressionEditorSize = () => {
      if (!interpolatorExpressionInput) return;
      interpolatorExpressionInput.style.height = "auto";
      const nextHeight = Math.max(70, Math.ceil(interpolatorExpressionInput.scrollHeight || 0));
      interpolatorExpressionInput.style.height = `${nextHeight}px`;
      if (interpolatorExpressionEditor) {
        interpolatorExpressionEditor.style.minHeight = `${nextHeight}px`;
      }
    };

    const syncInterpolatorWordWrapMode = () => {
      const wordWrapEnabled = settingsState.interpolatorWordWrap !== false;
      if (interpolatorExpressionEditor) {
        interpolatorExpressionEditor.classList.toggle("is-nowrap", !wordWrapEnabled);
      }
      if (interpolatorWordWrapInput) {
        interpolatorWordWrapInput.checked = wordWrapEnabled;
      }
    };

    const getInterpolatorAiQueryPrompt = (expressionText) => {
      const currentExpression = String(expressionText || "").trim();
      const expressionLine = currentExpression
        ? `Current expression: ${currentExpression}. `
        : "Current expression: (empty). ";
      return (
        "Help me create smooth animation interpolation expressions using Math.js for f(t) where t is 0 to 1. "
        + expressionLine
        + "Include easy, medium, and advanced examples and explain when to use each. "
        + "Reference: https://mathjs.org/docs/expressions/syntax.html"
      );
    };

    const getInterpolatorExplainQueryPrompt = (expressionText) => {
      const currentExpression = String(expressionText || "").trim();
      return (
        "Explain this Math.js interpolation expression for f(t), where t is from 0 to 1. "
        + `Expression: ${currentExpression || "(empty)"}. `
        + "Break down each part, note edge cases, and suggest an improved alternative if needed."
      );
    };

    const buildAiQueryUrl = (provider, promptText) => {
      const selectedProvider = AI_QUERY_PROVIDER_OPTIONS.has(provider)
        ? provider
        : DEFAULT_MODAL_SETTINGS.aiQueryProvider;
      const encodedQuery = encodeURIComponent(String(promptText || "").trim());
      switch (selectedProvider) {
        case "claude":
          return `https://claude.ai/new?q=${encodedQuery}`;
        case "perplexity":
          return `https://www.perplexity.ai/?q=${encodedQuery}`;
        case "grok":
          return `https://grok.com/?q=${encodedQuery}`;
        case "gemini":
          return `https://google.ai/?q=${encodedQuery}`;
        case "chatgpt":
        default:
          return `https://chatgpt.com/?q=${encodedQuery}`;
      }
    };
    const buildInterpolatorAiQueryUrl = (provider, expressionText) => (
      buildAiQueryUrl(provider, getInterpolatorAiQueryPrompt(expressionText))
    );
    const buildInterpolatorExplainQueryUrl = (provider, expressionText) => (
      buildAiQueryUrl(provider, getInterpolatorExplainQueryPrompt(expressionText))
    );

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

    const resetInvalidInterpolatorExpressionToDefault = () => {
      const currentExpression = String(settingsState.interpolatorExpression || "").trim();
      const defaultExpression = String(DEFAULT_MODAL_SETTINGS.interpolatorExpression || "").trim();
      if (!currentExpression || currentExpression === defaultExpression) return;
      const probe = compileInterpolatorExpression(currentExpression);
      if (!probe.error || !/^Invalid expression/i.test(String(probe.error || ""))) return;
      settingsState = normalizeModalSettings({
        ...settingsState,
        interpolatorExpression: defaultExpression
      });
      saveModalSettings(settingsState);
      interpolatorExpressionDraft = defaultExpression;
      interpolatorExpressionDirty = false;
    };
    resetInvalidInterpolatorExpressionToDefault();

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
        getEffectivePhysicsIntensity,
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
      const nerdLevel = INTERPOLATOR_NERD_RATINGS[settingsState.interpolatorMode] || 1;
      if (interpolatorNerdRating) {
        interpolatorNerdRating.textContent = "\uD83E\uDD13".repeat(Math.max(1, Math.min(3, nerdLevel)));
        interpolatorNerdRating.setAttribute("aria-label", `Nerd rating ${nerdLevel} of 3`);
      }
      if (aiQueryProviderInputs.length) {
        aiQueryProviderInputs.forEach((input) => {
          if (!(input instanceof HTMLInputElement)) return;
          const value = String(input.value || "").trim().toLowerCase();
          input.checked = value === settingsState.aiQueryProvider;
        });
      }
      if (interpolatorAskAiLink) {
        const provider = AI_QUERY_PROVIDER_OPTIONS.has(settingsState.aiQueryProvider)
          ? settingsState.aiQueryProvider
          : DEFAULT_MODAL_SETTINGS.aiQueryProvider;
        const expressionForAi = interpolatorExpressionDirty
          ? interpolatorExpressionDraft
          : String(settingsState.interpolatorExpression || "");
        const label = provider.charAt(0).toUpperCase() + provider.slice(1);
        interpolatorAskAiLink.href = buildInterpolatorAiQueryUrl(provider, expressionForAi);
        interpolatorAskAiLink.setAttribute("aria-label", `Ask AI (${label}) about interpolation expressions`);
        setElementTooltip(
          interpolatorAskAiLink,
          `Ask AI\n---\nPowered by [ai-logo:${provider}] ${label}\nSwitch AI search engine below`
        );
      }
      if (interpolatorExplainExpressionLink) {
        const provider = AI_QUERY_PROVIDER_OPTIONS.has(settingsState.aiQueryProvider)
          ? settingsState.aiQueryProvider
          : DEFAULT_MODAL_SETTINGS.aiQueryProvider;
        const expressionForAi = interpolatorExpressionDirty
          ? interpolatorExpressionDraft
          : String(settingsState.interpolatorExpression || "");
        const label = provider.charAt(0).toUpperCase() + provider.slice(1);
        interpolatorExplainExpressionLink.href = buildInterpolatorExplainQueryUrl(provider, expressionForAi);
        interpolatorExplainExpressionLink.setAttribute("aria-label", `Explain current expression with ${label}`);
        setElementTooltip(
          interpolatorExplainExpressionLink,
          `Explain expression\n---\nPowered by [ai-logo:${provider}] ${label}\nSwitch AI search engine below`
        );
      }

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
        if (!interpolatorExpressionDirty) {
          interpolatorExpressionDraft = String(settingsState.interpolatorExpression || "");
        }
        const expressionToRender = interpolatorExpressionDirty
          ? interpolatorExpressionDraft
          : String(settingsState.interpolatorExpression || "");
        const currentExpressionText = getInterpolatorExpressionText();
        if (currentExpressionText !== expressionToRender) {
          renderInterpolatorExpressionHighlight(expressionToRender, { preserveCaret: false });
        }
      }
      syncInterpolatorWordWrapMode();
      syncInterpolatorExpressionEditorSize();

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

      const compiledSavedExpression = compileInterpolatorExpression(settingsState.interpolatorExpression);
      interpolatorExpressionFn = compiledSavedExpression.fn;
      const expressionForFeedback = interpolatorExpressionDirty
        ? interpolatorExpressionDraft
        : String(settingsState.interpolatorExpression || "");
      const compiledDraftExpression = compileInterpolatorExpression(expressionForFeedback);
      if (interpolatorExpressionError) {
        const showError = settingsState.interpolatorMode === "expression" && Boolean(compiledDraftExpression.error);
        interpolatorExpressionError.hidden = !showError;
        if (showError) {
          interpolatorExpressionError.textContent = compiledDraftExpression.error;
        }
      }
      if (interpolatorExpressionValid) {
        const hasValue = Boolean(String(expressionForFeedback || "").trim());
        const showValid = settingsState.interpolatorMode === "expression" && hasValue && !compiledDraftExpression.error;
        interpolatorExpressionValid.hidden = !showValid;
      }
      if (interpolatorExpressionSaveBtn) {
        const currentSavedExpression = String(settingsState.interpolatorExpression || "").trim();
        const pendingExpression = String(expressionForFeedback || "").trim();
        const canSave = Boolean(pendingExpression)
          && !compiledDraftExpression.error
          && pendingExpression !== currentSavedExpression;
        interpolatorExpressionSaveBtn.disabled = !canSave;
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
      if (isPreviewReducedMotionLocked()) {
        previewPaused = true;
        syncAnimationPreviewToggle();
        return;
      }
      if (isMotionDisabled()) {
        animationPreviewDot.style.transform = "translate3d(0px, -50%, 0)";
      } else {
        const motionScale = getMotionScale();
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
      const previewMotionLocked = isPreviewReducedMotionLocked();
      if (previewMotionLocked && !previewPaused) {
        previewPaused = true;
      }
      if (previewMotionLocked && previewRafId) {
        global.cancelAnimationFrame(previewRafId);
        previewRafId = 0;
        previewLastTick = 0;
        previewPhaseMs = 0;
      }
      const iconNode = animationPreviewToggle.querySelector(".material-symbols-outlined");
      if (iconNode) {
        iconNode.textContent = previewPaused ? "play_arrow" : "pause";
      }
      animationPreviewToggle.disabled = previewMotionLocked;
      animationPreviewToggle.setAttribute("aria-pressed", previewPaused ? "true" : "false");
      setElementTooltip(
        animationPreviewToggle,
        previewMotionLocked
          ? "Preview disabled while Reduced Motion is on"
          : (previewPaused ? "Play preview motion" : "Pause preview motion")
      );
    };

    const ensureAnimationPreviewLoop = () => {
      if (!animationPreviewDot || !animationPreviewBox) return;
      if (previewPaused) return;
      if (isPreviewReducedMotionLocked()) return;
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
      if (modal) {
        modal.setAttribute("data-density", settingsState.density);
      }
      modalCard.setAttribute("data-active-page", activePage);
      modalCard.setAttribute("data-color-vision", settingsState.colorVisionMode);
      modalCard.setAttribute("data-sidebar-collapsed", settingsState.sidebarCollapsed ? "true" : "false");
      modalCard.setAttribute("data-motion-disabled", isMotionDisabled() ? "true" : "false");
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
      modalCard.style.filter = `contrast(${Math.max(0.5, settingsState.accessibilityContrast / 100)}) saturate(${Math.max(0.5, settingsState.accessibilitySaturation / 100)})`;
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
          "--ui-font-size",
          computedStyle.getPropertyValue("--ui-font-size").trim() || `${settingsState.uiFontSize}px`
        );
        modal.style.setProperty(
          "--control-height",
          computedStyle.getPropertyValue("--control-height").trim() || "36px"
        );
        modal.style.setProperty(
          "--space-1",
          computedStyle.getPropertyValue("--space-1").trim() || "6px"
        );
        modal.style.setProperty(
          "--space-2",
          computedStyle.getPropertyValue("--space-2").trim() || "10px"
        );
        modal.style.setProperty(
          "--surface-button-primary",
          computedStyle.getPropertyValue("--surface-button-primary").trim() || accentPrimary
        );
        modal.style.setProperty(
          "--surface-button-primary-soft",
          computedStyle.getPropertyValue("--surface-button-primary-soft").trim() || accentSoft
        );
        modal.style.setProperty(
          "--icon-active",
          computedStyle.getPropertyValue("--icon-active").trim() || "#ffffff"
        );
        modal.style.setProperty(
          "--tone-success",
          computedStyle.getPropertyValue("--tone-success").trim() || "#4fd38a"
        );
        modal.style.setProperty(
          "--tone-error",
          computedStyle.getPropertyValue("--tone-error").trim() || "#d85b5b"
        );
        modal.style.setProperty(
          "--tone-warning",
          computedStyle.getPropertyValue("--tone-warning").trim() || "#d9ae3b"
        );
        modal.style.setProperty(
          "--tone-muted-emphasis",
          computedStyle.getPropertyValue("--tone-muted-emphasis").trim() || "#f6d885"
        );
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

      syncAccentPartyMode();
      syncAccentSettingUi(resolvedAccentHue);

      if (triggerTextInput) {
        triggerTextInput.value = settingsState.triggerText;
        syncTriggerFieldState();
      }

      if (triggerAfterSpaceInput) {
        triggerAfterSpaceInput.checked = settingsState.triggerActivation === "space";
      }
      if (insertAnimatedPasteInput) {
        insertAnimatedPasteInput.checked = settingsState.insertAnimatedPaste === true;
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
        setElementTooltip(lofiAutoplayInput, "Autoplay music when opening modal\n---\nDouble-tap [Space] quickly to toggle");
        lofiAutoplayInput.setAttribute("aria-label", "Autoplay music when opening modal. Double-tap Space quickly to toggle.");
      }
      if (keepRadioOnInput) {
        keepRadioOnInput.checked = settingsState.keepRadioOn === true;
      }
      if (lofi8dEnabledInput) {
        lofi8dEnabledInput.checked = settingsState.lofi8dEnabled !== false;
      }
      if (lofi8dControlsBody) {
        lofi8dControlsBody.hidden = settingsState.lofi8dEnabled === false;
        lofi8dControlsBody.setAttribute("aria-hidden", settingsState.lofi8dEnabled === false ? "true" : "false");
      }
      if (lofi8dRateSlider) {
        lofi8dRateSlider.value = String(clampNumber(settingsState.lofi8dRate, LOFI_8D_RATE_MIN, LOFI_8D_RATE_MAX, DEFAULT_MODAL_SETTINGS.lofi8dRate));
        lofi8dRateSlider.disabled = settingsState.lofi8dEnabled === false;
      }
      if (lofi8dRateInput) {
        lofi8dRateInput.value = String(clampNumber(settingsState.lofi8dRate, LOFI_8D_RATE_MIN, LOFI_8D_RATE_MAX, DEFAULT_MODAL_SETTINGS.lofi8dRate));
        lofi8dRateInput.disabled = settingsState.lofi8dEnabled === false;
      }
      if (audioStreamSourceButtons.length) {
        setSegmentedSelection(audioStreamSourceButtons, "data-audio-stream-source", settingsState.audioStreamSource);
        audioStreamSourceButtons.forEach((button) => {
          const sourceName = String(button.getAttribute("data-audio-stream-source") || "").trim().toLowerCase();
          const isActive = sourceName === settingsState.audioStreamSource;
          button.setAttribute("role", "tab");
          button.setAttribute("aria-selected", isActive ? "true" : "false");
          button.setAttribute("tabindex", isActive ? "0" : "-1");
        });
      }
      const normalizedRadioStationUrl = normalizeRadioStationUrl(
        settingsState.radioStationUrl,
        DEFAULT_MODAL_SETTINGS.radioStationUrl
      );
      const selectedRadioStation = getRadioStationByUrl(normalizedRadioStationUrl);
      if (radioChannelSelect) {
        if (radioChannelSelect.value !== normalizedRadioStationUrl) {
          radioChannelSelect.value = normalizedRadioStationUrl;
        }
        radioChannelSelect.disabled = radioStationApplyPending === true;
      }
      if (radioChannelPrevBtn) {
        radioChannelPrevBtn.disabled = radioStationApplyPending === true;
      }
      if (radioChannelNextBtn) {
        radioChannelNextBtn.disabled = radioStationApplyPending === true;
      }
      if (radioChannelStatus) {
        if (radioStationApplyPending === true) {
          radioChannelStatus.textContent = "Checking radio channel availability...";
        } else if (settingsState.audioStreamSource === "radio") {
          radioChannelStatus.textContent = `Live source: ${selectedRadioStation.label}.`;
        } else {
          radioChannelStatus.textContent = `Live source: Default stream. Ready radio: ${selectedRadioStation.label}.`;
        }
      }
      if (sfxVolumeSlider) {
        const currentSfxVolume = snapSfxVolumeValue(
          settingsState.sfxVolume,
          DEFAULT_MODAL_SETTINGS.sfxVolume
        );
        sfxVolumeSlider.value = String(currentSfxVolume);
        const sfxTooltip = `SFX volume ${currentSfxVolume}%${settingsState.sfxAdaptiveBlend === true ? "\nAdaptive blend: on" : ""}`;
        setElementTooltip(sfxVolumeSlider, sfxTooltip);
        sfxVolumeSlider.setAttribute("aria-label", `SFX volume ${currentSfxVolume} percent.`);
      }
      if (sfxVolumeValue) {
        const currentSfxVolume = snapSfxVolumeValue(
          settingsState.sfxVolume,
          DEFAULT_MODAL_SETTINGS.sfxVolume
        );
        sfxVolumeValue.textContent = String(currentSfxVolume);
      }
      if (sfxMuteBtn) {
        const isMuted = settingsState.sfxMuted === true;
        sfxMuteBtn.textContent = isMuted ? "Unmute" : "Mute";
        sfxMuteBtn.setAttribute("aria-pressed", isMuted ? "true" : "false");
        sfxMuteBtn.setAttribute("aria-label", isMuted ? "Unmute SFX" : "Mute SFX");
        sfxMuteBtn.classList.toggle("is-active", isMuted);
        setElementTooltip(sfxMuteBtn, isMuted ? "Unmute SFX" : "Mute SFX");
      }
      if (sfxAdaptiveBlendInput) {
        sfxAdaptiveBlendInput.checked = settingsState.sfxAdaptiveBlend === true;
      }
      let enabledAmbientCount = 0;
      if (ambientTrackButtons.length) {
        ambientTrackButtons.forEach((button) => {
          const trackId = String(button.getAttribute("data-ambient-track-button") || "").trim().toLowerCase();
          const isEnabled = isAmbientTrackEnabled(trackId);
          if (isEnabled) enabledAmbientCount += 1;
          button.classList.toggle("is-active", isEnabled);
          button.setAttribute("aria-pressed", isEnabled ? "true" : "false");
        });
      }
      if (ambientTrackPanels.length) {
        ambientTrackPanels.forEach((panel) => {
          const trackId = String(panel.getAttribute("data-ambient-panel") || "").trim().toLowerCase();
          panel.hidden = !isAmbientTrackEnabled(trackId);
        });
      }
      if (ambientRandomizeBtn) {
        ambientRandomizeBtn.hidden = enabledAmbientCount < 2;
      }
      AMBIENT_NOISE_TRACKS.forEach((track) => {
        const enabledKey = getAmbientEnabledKey(track.id);
        const volumeKey = getAmbientVolumeKey(track.id);
        const volumeControl = byId(`ambient-${track.id}-volume`);
        const valueLabel = byId(`ambient-${track.id}-volume-value`);
        const enabled = enabledKey ? settingsState[enabledKey] === true : false;
        const volume = volumeKey ? normalizeAmbientVolume(settingsState[volumeKey], 35) : 0;
        if (volumeControl) volumeControl.value = String(volume);
        if (valueLabel) valueLabel.textContent = String(volume);
        syncAmbientTrackPlayback(track.id);
      });
      if (audioBpmInfluenceEnabledInput) {
        audioBpmInfluenceEnabledInput.checked = settingsState.audioBpmInfluenceEnabled === true;
      }
      if (audioBpmInfluenceBody) {
        audioBpmInfluenceBody.hidden = settingsState.audioBpmInfluenceEnabled !== true;
        audioBpmInfluenceBody.setAttribute("aria-hidden", settingsState.audioBpmInfluenceEnabled !== true ? "true" : "false");
      }
      if (audioBpmInfluenceModeSlider) {
        audioBpmInfluenceModeSlider.value = String(getAudioBpmInfluenceModeIndex(settingsState.audioBpmInfluenceMode));
        audioBpmInfluenceModeSlider.disabled = settingsState.audioBpmInfluenceEnabled !== true;
      }
      if (audioBpmInfluenceStrengthSlider) {
        audioBpmInfluenceStrengthSlider.value = String(Math.round(settingsState.audioBpmInfluenceStrength));
        audioBpmInfluenceStrengthSlider.disabled = settingsState.audioBpmInfluenceEnabled !== true;
      }
      if (audioBpmInfluenceStrengthInput) {
        audioBpmInfluenceStrengthInput.value = String(Math.round(settingsState.audioBpmInfluenceStrength));
        audioBpmInfluenceStrengthInput.disabled = settingsState.audioBpmInfluenceEnabled !== true;
      }
      if (audioBpmInfluencePreview) {
        const estimatedBpm = Math.round(getEstimatedLofiBpm());
        const influenceFactor = getAudioBpmInfluenceFactor();
        const beatBoostPct = Math.round(clampNumber(audioInfluenceBeatBoost * 100, 0, 100, 0));
        const beatImpactPct = Math.round(clampNumber(audioInfluenceLastBeatImpact * 100, 0, 100, 0));
        let targetLabel = "both";
        if (settingsState.audioBpmInfluenceMode === "animation") targetLabel = "animation only";
        if (settingsState.audioBpmInfluenceMode === "physics") targetLabel = "physics only";
        if (settingsState.audioBpmInfluenceEnabled === true) {
          audioBpmInfluencePreview.textContent = `Current BPM: ${estimatedBpm}. Influence factor: x${influenceFactor.toFixed(2)} (${targetLabel}). Beat pulse: ${beatImpactPct}%. Live boost: ${beatBoostPct}%.`;
        } else {
          audioBpmInfluencePreview.textContent = `Current BPM: ${estimatedBpm}. Influence is off.`;
        }
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
          ratePitchSync: settingsState.lofiRatePitchSync,
          spatialEnabled: settingsState.lofi8dEnabled !== false,
          spatialDepth: DEFAULT_MODAL_SETTINGS.lofi8dDepth / 100,
          spatialRate: clampNumber(settingsState.lofi8dRate, LOFI_8D_RATE_MIN, LOFI_8D_RATE_MAX, DEFAULT_MODAL_SETTINGS.lofi8dRate)
        });
      }

      if (animationFollowDeviceInput) {
        animationFollowDeviceInput.checked = settingsState.animationFollowDevice !== false;
      }

      if (animationEnablePhysicsInput) {
        animationEnablePhysicsInput.checked = settingsState.physicsEnabled !== false;
      }

      const effectivePhysicsIntensity = getEffectivePhysicsIntensity();

      if (physicsIntensitySlider) {
        physicsIntensitySlider.value = String(Math.round(effectivePhysicsIntensity));
      }

      if (physicsIntensityInput) {
        physicsIntensityInput.value = String(Math.round(effectivePhysicsIntensity));
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

      if (accessibilityContrastSlider) {
        accessibilityContrastSlider.value = String(Math.round(settingsState.accessibilityContrast));
      }

      if (accessibilityContrastInput) {
        accessibilityContrastInput.value = String(Math.round(settingsState.accessibilityContrast));
      }

      if (accessibilitySaturationSlider) {
        accessibilitySaturationSlider.value = String(Math.round(settingsState.accessibilitySaturation));
      }

      if (accessibilitySaturationInput) {
        accessibilitySaturationInput.value = String(Math.round(settingsState.accessibilitySaturation));
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
        physicsIntensitySlider.disabled = settingsState.physicsEnabled === false;
      }

      if (physicsIntensityInput) {
        physicsIntensityInput.disabled = settingsState.physicsEnabled === false;
      }

      if (animationSpeedSlider) {
        animationSpeedSlider.disabled = false;
      }
      if (settingsState.physicsEnabled === false || isMotionDisabled()) {
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
      const audioStreamChanged = nextState.audioStreamSource !== previousState.audioStreamSource
        || nextState.radioStationUrl !== previousState.radioStationUrl;
      if (audioStreamChanged && app._lofiController && typeof app._lofiController.setStreamUrl === "function") {
        app._lofiController.setStreamUrl(getAudioStreamUrlForSettings(nextState));
      }
      if (stabilizeScroll) {
        stabilizeSettingsScroll();
      }

      const activePageChanged = nextState.activePage !== previousState.activePage;
      const updateKeys = updates && typeof updates === "object" ? Object.keys(updates) : [];
      if (updateKeys.includes("interpolatorExpression")) {
        interpolatorExpressionDraft = String(nextState.interpolatorExpression || "");
        interpolatorExpressionDirty = false;
      }
      const activeControl = shadow.activeElement instanceof Element ? shadow.activeElement : null;
      const isSettingsUpdate = nextState.activePage === "settings"
        && updateKeys.some((key) => key !== "activePage" && key !== "sidebarCollapsed");
      let isSuccessfulSettingsUpdate = isSettingsUpdate;
      if (isSuccessfulSettingsUpdate && updateKeys.includes("interpolatorExpression")) {
        const probe = compileInterpolatorExpression(nextState.interpolatorExpression);
        isSuccessfulSettingsUpdate = !probe.error;
      }
      if (isSuccessfulSettingsUpdate) {
        const statusMessage = updateKeys.includes("interpolatorExpression")
          ? "Expression is valid."
          : "Saved.";
        showSettingsFieldSuccess(activeControl, statusMessage);
      }

      if (!preserveScroll || activePageChanged || !scrollHostBefore || typeof preservedScrollTop !== "number") return;

      global.requestAnimationFrame(() => {
        if (!scrollHostBefore || !scrollHostBefore.isConnected) return;
        const maxScrollTop = Math.max(0, scrollHostBefore.scrollHeight - scrollHostBefore.clientHeight);
        scrollHostBefore.scrollTop = Math.min(Math.max(0, preservedScrollTop), maxScrollTop);
      });
    };

    const commitModalSettingsFromSwitch = (updates) => {
      const scrollHost = settingsState.activePage === "settings" ? settingsPageScrollHost : null;
      const preservedScrollTop = scrollHost ? scrollHost.scrollTop : null;

      const restoreScrollTop = () => {
        if (!scrollHost || !scrollHost.isConnected) return;
        if (typeof preservedScrollTop !== "number") return;
        const maxScrollTop = Math.max(0, scrollHost.scrollHeight - scrollHost.clientHeight);
        scrollHost.scrollTop = Math.min(Math.max(0, preservedScrollTop), maxScrollTop);
      };

      commitModalSettings(updates, { preserveScroll: true, stabilizeScroll: false });

      restoreScrollTop();
      global.requestAnimationFrame(() => {
        restoreScrollTop();
      });
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
            accentHue: DEFAULT_MODAL_SETTINGS.accentHue,
            accentPartyMode: DEFAULT_MODAL_SETTINGS.accentPartyMode
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
            interpolatorWordWrap: DEFAULT_MODAL_SETTINGS.interpolatorWordWrap,
            aiQueryProvider: DEFAULT_MODAL_SETTINGS.aiQueryProvider,
            interpolatorCurve: { ...DEFAULT_INTERPOLATOR_CURVE },
            interpolatorCurvePoints: []
          });
          break;
        case "aiQueryProvider":
          commitModalSettings({ aiQueryProvider: DEFAULT_MODAL_SETTINGS.aiQueryProvider });
          break;
        case "musicAutoplay":
          commitModalSettings({ musicAutoplay: DEFAULT_MODAL_SETTINGS.musicAutoplay });
          break;
        case "audioStreamSource":
          commitModalSettings({
            keepRadioOn: DEFAULT_MODAL_SETTINGS.keepRadioOn,
            audioStreamSource: DEFAULT_MODAL_SETTINGS.audioStreamSource,
            radioStationUrl: DEFAULT_MODAL_SETTINGS.radioStationUrl
          });
          break;
        case "radioChannel":
          commitModalSettings({
            audioStreamSource: "radio",
            radioStationUrl: DEFAULT_MODAL_SETTINGS.radioStationUrl
          });
          break;
        case "lofiTuning":
          commitModalSettings({
            lofiSpeedRate: DEFAULT_MODAL_SETTINGS.lofiSpeedRate,
            lofiPitchRate: DEFAULT_MODAL_SETTINGS.lofiPitchRate,
            lofiRatePitchSync: DEFAULT_MODAL_SETTINGS.lofiRatePitchSync
          });
          break;
        case "lofi8d":
          commitModalSettings({
            lofi8dEnabled: DEFAULT_MODAL_SETTINGS.lofi8dEnabled,
            lofi8dRate: DEFAULT_MODAL_SETTINGS.lofi8dRate
          });
          break;
        case "sfxMix":
          commitModalSettings({
            sfxVolume: DEFAULT_MODAL_SETTINGS.sfxVolume,
            sfxMuted: DEFAULT_MODAL_SETTINGS.sfxMuted,
            sfxAdaptiveBlend: DEFAULT_MODAL_SETTINGS.sfxAdaptiveBlend
          });
          break;
        case "ambientNoise":
          commitModalSettings({
            ambientRainEnabled: DEFAULT_MODAL_SETTINGS.ambientRainEnabled,
            ambientRainVolume: DEFAULT_MODAL_SETTINGS.ambientRainVolume,
            ambientBeachEnabled: DEFAULT_MODAL_SETTINGS.ambientBeachEnabled,
            ambientBeachVolume: DEFAULT_MODAL_SETTINGS.ambientBeachVolume,
            ambientCricketsEnabled: DEFAULT_MODAL_SETTINGS.ambientCricketsEnabled,
            ambientCricketsVolume: DEFAULT_MODAL_SETTINGS.ambientCricketsVolume,
            ambientThunderEnabled: DEFAULT_MODAL_SETTINGS.ambientThunderEnabled,
            ambientThunderVolume: DEFAULT_MODAL_SETTINGS.ambientThunderVolume,
            ambientCityEnabled: DEFAULT_MODAL_SETTINGS.ambientCityEnabled,
            ambientCityVolume: DEFAULT_MODAL_SETTINGS.ambientCityVolume,
            ambientWhiteEnabled: DEFAULT_MODAL_SETTINGS.ambientWhiteEnabled,
            ambientWhiteVolume: DEFAULT_MODAL_SETTINGS.ambientWhiteVolume
          });
          break;
        case "audioBpmInfluence":
          commitModalSettings({
            audioBpmInfluenceEnabled: DEFAULT_MODAL_SETTINGS.audioBpmInfluenceEnabled,
            audioBpmInfluenceMode: DEFAULT_MODAL_SETTINGS.audioBpmInfluenceMode,
            audioBpmInfluenceStrength: DEFAULT_MODAL_SETTINGS.audioBpmInfluenceStrength
          });
          break;
        case "audioBpmInfluenceMode":
          commitModalSettings({ audioBpmInfluenceMode: DEFAULT_MODAL_SETTINGS.audioBpmInfluenceMode });
          break;
        case "audioBpmInfluenceStrength":
          commitModalSettings({ audioBpmInfluenceStrength: DEFAULT_MODAL_SETTINGS.audioBpmInfluenceStrength });
          break;
        case "animationFollowDevice":
          commitModalSettings({ animationFollowDevice: DEFAULT_MODAL_SETTINGS.animationFollowDevice });
          break;
        case "physicsEnabled":
          commitModalSettings({ physicsEnabled: DEFAULT_MODAL_SETTINGS.physicsEnabled });
          break;
        case "physicsIntensity":
          commitModalSettings({ physicsIntensity: DEFAULT_MODAL_SETTINGS.physicsIntensity });
          break;
        case "overlayBlur":
          commitModalSettings({ overlayBlur: DEFAULT_MODAL_SETTINGS.overlayBlur });
          break;
        case "overlayOpacity":
          commitModalSettings({ overlayOpacity: DEFAULT_MODAL_SETTINGS.overlayOpacity });
          break;
        case "accessibilityContrast":
          commitModalSettings({ accessibilityContrast: DEFAULT_MODAL_SETTINGS.accessibilityContrast });
          break;
        case "accessibilitySaturation":
          commitModalSettings({ accessibilitySaturation: DEFAULT_MODAL_SETTINGS.accessibilitySaturation });
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
        accentCustomTrigger.addEventListener("click", (event) => {
          event.preventDefault();
          let open = false;
          try {
            open = accentCustomPopover.matches(":popover-open");
          } catch {
            open = false;
          }
          if (open) {
            accentCustomPopover.hidePopover();
            return;
          }
          positionPopoverNearTrigger(accentCustomPopover, accentCustomTrigger, "end");
          accentCustomPopover.showPopover();
        });
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
        ? event.target.closest("button, a.btn, [role='button']")
        : null;
      if (!target) return;
      if (target.disabled) return;
      playUiClickSfx(target);
      if (target === incBtn || target === decBtn) return;
      if (target.closest(".copy-menu, .banner-popover, .accent-custom-popover")) return;
      applyModalPhysicsPulse(event, { direction: 0, pressNumControls: false, multiplier: 0.9 });
    }, true);

    shadow.addEventListener("click", (event) => {
      const target = event.target && typeof event.target.closest === "function"
        ? event.target.closest("button, a.btn, [role='button']")
        : null;
      if (!target) return;
      if (target.disabled) return;
      // Keyboard-triggered activation emits click without pointerup.
      if (event.detail === 0) {
        playUiClickSfx(target);
      }
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

    shadow.addEventListener("input", (event) => {
      const target = event.target instanceof HTMLInputElement ? event.target : null;
      if (!target) return;
      if (String(target.type || "").toLowerCase() !== "range") return;
      if (target.disabled) return;
      if (settingsState.accentPartyMode !== true) {
        const value = Number.parseFloat(String(target.value || ""));
        if (Number.isFinite(value)) {
          uiSfxSliderLastValue.set(target, value);
        }
        return;
      }
      playUiSliderScratchSfx(target);
    }, true);

    shadow.addEventListener("keydown", (event) => {
      const target = event.target instanceof Element
        ? event.target
        : (shadow.activeElement || document.activeElement);
      if (!isTextEditingElement(target)) return;
      if (!shouldPlayTypingSfxForKey(event)) return;
      playUiTypingSfx();
    }, true);

    shadow.addEventListener("selectstart", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (isTextSelectionAllowedElement(target)) return;
      event.preventDefault();
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
          setTipFeedback(editorHintMessage);
        }
        commitModalSettings({ activePage: value });
      });
    });

    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-theme-option");
        if (!value || !THEME_OPTIONS.has(value)) return;
        if (value === settingsState.theme) return;
        commitModalSettings({ theme: value });
        const themeLabel = value.charAt(0).toUpperCase() + value.slice(1);
        showToast(`Theme set to: ${themeLabel}`, "success");
      });
    });

    densityButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = String(button.getAttribute("data-density-option") || "").trim();
        if (!DENSITY_OPTIONS.has(value)) return;
        if (value === settingsState.density) return;
        commitModalSettings({ density: value });
        const densityLabel = value.charAt(0).toUpperCase() + value.slice(1);
        showToast(`Density set to: ${densityLabel}`, "success");
      });
    });

    accentPresetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const preset = String(button.getAttribute("data-accent-preset") || "").trim();
        if (!ACCENT_PRESET_OPTIONS.has(preset)) return;
        commitModalSettings({ accentPreset: preset, accentPartyMode: false });
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

    if (accentPartyToggle) {
      setElementTooltip(accentPartyToggle, "Party Mode: [↑] [↑] [↓] [↓] [<-] [->] [<-] [->] [B] [A]");
      accentPartyToggle.setAttribute("aria-label", "Party mode unlock code: up up down down left right left right b a");
      accentPartyToggle.addEventListener("click", () => {
        if (settingsState.accentPartyMode === true) {
          commitModalSettings({ accentPartyMode: false });
          showToast("Party mode disabled", "success");
          return;
        }
        showToast("Party mode is locked. Use the key combo.", "muted");
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
        // atan2 is 0deg at right; wheel hue is 0deg at top.
        return Math.round((degrees + 90 + 360) % 360);
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

    if (insertAnimatedPasteInput) {
      insertAnimatedPasteInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({
          insertAnimatedPaste: insertAnimatedPasteInput.checked
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
        if (isPreviewReducedMotionLocked()) {
          previewPaused = true;
          syncAnimationPreviewToggle();
          return;
        }
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
        const pendingExpression = getInterpolatorExpressionText().trim();
        const probe = compileInterpolatorExpression(pendingExpression);
        if (probe.error) {
          if (interpolatorExpressionError) {
            interpolatorExpressionError.hidden = false;
            interpolatorExpressionError.textContent = probe.error;
          }
          if (interpolatorExpressionValid) {
            interpolatorExpressionValid.hidden = true;
          }
          if (interpolatorExpressionSaveBtn) {
            interpolatorExpressionSaveBtn.disabled = true;
          }
          return;
        }
        interpolatorExpressionDraft = pendingExpression;
        interpolatorExpressionDirty = false;
        commitModalSettings({ interpolatorExpression: pendingExpression });
      };
      interpolatorExpressionInput.addEventListener("input", () => {
        const expressionText = getInterpolatorExpressionText();
        interpolatorExpressionDraft = expressionText;
        interpolatorExpressionDirty = expressionText.trim() !== String(settingsState.interpolatorExpression || "").trim();
        renderInterpolatorExpressionHighlight(expressionText);
        syncInterpolatorExpressionEditorSize();
        syncInterpolatorUi();
      });
      interpolatorExpressionInput.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          commitInterpolatorExpression();
        }
      });
      if (interpolatorExpressionSaveBtn) {
        interpolatorExpressionSaveBtn.addEventListener("click", commitInterpolatorExpression);
      }
    }

    if (interpolatorWordWrapInput) {
      interpolatorWordWrapInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ interpolatorWordWrap: interpolatorWordWrapInput.checked });
      });
    }

    if (aiQueryProviderInputs.length) {
      aiQueryProviderInputs.forEach((input) => {
        if (!(input instanceof HTMLInputElement)) return;
        input.addEventListener("change", () => {
          if (!input.checked) return;
          const provider = String(input.value || "").trim().toLowerCase();
          if (!AI_QUERY_PROVIDER_OPTIONS.has(provider)) return;
          commitModalSettings({ aiQueryProvider: provider });
        });
      });
    }

    if (interpolatorAskAiLink) {
      interpolatorAskAiLink.addEventListener("click", (event) => {
        event.preventDefault();
        const url = String(interpolatorAskAiLink.getAttribute("href") || "").trim();
        if (!url) return;
        const opened = openAiPopup(url, "ai-ask");
        if (!opened) setActionFeedback("Popup blocked. Allow popups for this site.", "error");
      });
    }

    if (interpolatorExplainExpressionLink) {
      interpolatorExplainExpressionLink.addEventListener("click", (event) => {
        event.preventDefault();
        const url = String(interpolatorExplainExpressionLink.getAttribute("href") || "").trim();
        if (!url) return;
        const opened = openAiPopup(url, "ai-explain");
        if (!opened) setActionFeedback("Popup blocked. Allow popups for this site.", "error");
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

    const getRequestedRadioStationUrl = () => normalizeRadioStationUrl(
      radioChannelSelect ? radioChannelSelect.value : settingsState.radioStationUrl,
      settingsState.radioStationUrl
    );

    if (audioStreamSourceButtons.length) {
      audioStreamSourceButtons.forEach((button) => {
        button.addEventListener("click", () => {
          if (radioStationApplyPending) return;
          const source = String(button.getAttribute("data-audio-stream-source") || "").trim().toLowerCase();
          if (!AUDIO_STREAM_SOURCE_OPTIONS.has(source)) return;
          applyAudioStreamSelection({
            source,
            stationUrl: getRequestedRadioStationUrl()
          });
        });
      });
    }

    const getRadioStationIndexByUrl = (stationUrl) => {
      const normalizedUrl = normalizeRadioStationUrl(stationUrl, settingsState.radioStationUrl).toLowerCase();
      const index = RADIO_STATION_OPTIONS.findIndex((station) => String(station.url || "").trim().toLowerCase() === normalizedUrl);
      return index >= 0 ? index : 0;
    };

    const applyRadioSelectionByIndex = (index) => {
      const total = RADIO_STATION_OPTIONS.length;
      if (!total) return;
      const safeIndex = ((index % total) + total) % total;
      const station = RADIO_STATION_OPTIONS[safeIndex];
      if (!station || !station.url) return;
      if (radioChannelSelect) {
        radioChannelSelect.value = station.url;
      }
      applyAudioStreamSelection({
        source: "radio",
        stationUrl: station.url
      });
    };

    if (radioChannelSelect) {
      radioChannelSelect.addEventListener("change", () => {
        if (radioStationApplyPending) return;
        applyAudioStreamSelection({
          source: "radio",
          stationUrl: getRequestedRadioStationUrl()
        });
      });
    }

    if (radioChannelPrevBtn) {
      radioChannelPrevBtn.addEventListener("click", () => {
        if (radioStationApplyPending) return;
        const currentIndex = getRadioStationIndexByUrl(getRequestedRadioStationUrl());
        applyRadioSelectionByIndex(currentIndex - 1);
      });
    }

    if (radioChannelNextBtn) {
      radioChannelNextBtn.addEventListener("click", () => {
        if (radioStationApplyPending) return;
        const currentIndex = getRadioStationIndexByUrl(getRequestedRadioStationUrl());
        applyRadioSelectionByIndex(currentIndex + 1);
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

    if (keepRadioOnInput) {
      keepRadioOnInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ keepRadioOn: keepRadioOnInput.checked });
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

    if (lofi8dEnabledInput) {
      lofi8dEnabledInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ lofi8dEnabled: lofi8dEnabledInput.checked });
      });
    }

    if (lofi8dRateSlider) {
      lofi8dRateSlider.addEventListener("input", () => {
        const value = clampNumber(
          lofi8dRateSlider.value,
          LOFI_8D_RATE_MIN,
          LOFI_8D_RATE_MAX,
          settingsState.lofi8dRate
        );
        commitModalSettings({ lofi8dRate: Math.round(value * 10) / 10 });
      });
    }

    if (lofi8dRateInput) {
      const syncLofi8dRateFromTextBox = () => {
        const value = clampNumber(
          lofi8dRateInput.value,
          LOFI_8D_RATE_MIN,
          LOFI_8D_RATE_MAX,
          settingsState.lofi8dRate
        );
        commitModalSettings({ lofi8dRate: Math.round(value * 10) / 10 });
      };
      lofi8dRateInput.addEventListener("change", syncLofi8dRateFromTextBox);
      lofi8dRateInput.addEventListener("blur", syncLofi8dRateFromTextBox);
      lofi8dRateInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncLofi8dRateFromTextBox();
          lofi8dRateInput.blur();
        }
      });
    }

    if (sfxVolumeSlider) {
      sfxVolumeSlider.addEventListener("input", () => {
        const snapped = snapSfxVolumeValue(
          sfxVolumeSlider.value,
          settingsState.sfxVolume
        );
        sfxVolumeSlider.value = String(snapped);
        commitModalSettings({
          sfxVolume: snapped,
          sfxMuted: snapped <= 0 ? true : false
        }, { preserveScroll: true, stabilizeScroll: false });
      });
    }

    if (sfxMuteBtn) {
      sfxMuteBtn.addEventListener("click", () => {
        const isMuted = settingsState.sfxMuted === true;
        if (isMuted) {
          const restoreVolume = snapSfxVolumeValue(
            settingsState.sfxVolume,
            DEFAULT_MODAL_SETTINGS.sfxVolume
          );
          commitModalSettings({
            sfxMuted: false,
            sfxVolume: restoreVolume > 0 ? restoreVolume : DEFAULT_MODAL_SETTINGS.sfxVolume
          }, { preserveScroll: true, stabilizeScroll: false });
          return;
        }
        commitModalSettings({
          sfxMuted: true
        }, { preserveScroll: true, stabilizeScroll: false });
      });
    }

    if (sfxAdaptiveBlendInput) {
      sfxAdaptiveBlendInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ sfxAdaptiveBlend: sfxAdaptiveBlendInput.checked });
      });
    }

    if (ambientTrackButtons.length) {
      ambientTrackButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const trackId = String(button.getAttribute("data-ambient-track-button") || "").trim().toLowerCase();
          if (!AMBIENT_NOISE_IDS.has(trackId)) return;
          const enabledKey = getAmbientEnabledKey(trackId);
          if (!enabledKey) return;
          const willEnable = settingsState[enabledKey] !== true;
          commitModalSettingsFromSwitch({ [enabledKey]: willEnable });
        });
      });
    }

    AMBIENT_NOISE_TRACKS.forEach((track) => {
      const volumeKey = getAmbientVolumeKey(track.id);
      const volumeControl = byId(`ambient-${track.id}-volume`);
      if (volumeControl && volumeKey) {
        volumeControl.addEventListener("input", () => {
          const value = normalizeAmbientVolume(volumeControl.value, settingsState[volumeKey]);
          commitModalSettings({ [volumeKey]: value });
        });
      }
    });

    if (ambientRandomizeBtn) {
      ambientRandomizeBtn.addEventListener("click", () => {
        const updates = {};
        let enabledCount = 0;
        AMBIENT_NOISE_TRACKS.forEach((track) => {
          const enabledKey = getAmbientEnabledKey(track.id);
          const volumeKey = getAmbientVolumeKey(track.id);
          if (!enabledKey || !volumeKey) return;
          if (settingsState[enabledKey] !== true) return;
          enabledCount += 1;
          updates[volumeKey] = Math.round(Math.random() * 100);
        });
        if (enabledCount < 2) return;
        commitModalSettings(updates);
      });
    }

    if (audioBpmInfluenceEnabledInput) {
      audioBpmInfluenceEnabledInput.addEventListener("change", () => {
        commitModalSettingsFromSwitch({ audioBpmInfluenceEnabled: audioBpmInfluenceEnabledInput.checked });
      });
    }

    if (audioBpmInfluenceModeSlider) {
      audioBpmInfluenceModeSlider.addEventListener("input", () => {
        if (settingsState.audioBpmInfluenceEnabled !== true) return;
        const mode = getAudioBpmInfluenceModeFromIndex(audioBpmInfluenceModeSlider.value);
        if (!AUDIO_BPM_INFLUENCE_MODE_OPTIONS.has(mode)) return;
        commitModalSettings({ audioBpmInfluenceMode: mode });
      });
    }

    if (audioBpmInfluenceStrengthSlider) {
      audioBpmInfluenceStrengthSlider.addEventListener("input", () => {
        if (settingsState.audioBpmInfluenceEnabled !== true) return;
        const value = clampNumber(
          audioBpmInfluenceStrengthSlider.value,
          AUDIO_BPM_INFLUENCE_STRENGTH_MIN,
          AUDIO_BPM_INFLUENCE_STRENGTH_MAX,
          settingsState.audioBpmInfluenceStrength
        );
        commitModalSettings({ audioBpmInfluenceStrength: Math.round(value) });
      });
    }

    if (audioBpmInfluenceStrengthInput) {
      const syncAudioBpmInfluenceStrengthFromTextBox = () => {
        if (settingsState.audioBpmInfluenceEnabled !== true) return;
        const value = clampNumber(
          audioBpmInfluenceStrengthInput.value,
          AUDIO_BPM_INFLUENCE_STRENGTH_MIN,
          AUDIO_BPM_INFLUENCE_STRENGTH_MAX,
          settingsState.audioBpmInfluenceStrength
        );
        commitModalSettings({ audioBpmInfluenceStrength: Math.round(value) });
      };
      audioBpmInfluenceStrengthInput.addEventListener("change", syncAudioBpmInfluenceStrengthFromTextBox);
      audioBpmInfluenceStrengthInput.addEventListener("blur", syncAudioBpmInfluenceStrengthFromTextBox);
      audioBpmInfluenceStrengthInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncAudioBpmInfluenceStrengthFromTextBox();
          audioBpmInfluenceStrengthInput.blur();
        }
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

    if (physicsIntensitySlider) {
      physicsIntensitySlider.addEventListener("input", () => {
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

    if (accessibilityContrastSlider) {
      accessibilityContrastSlider.addEventListener("input", () => {
        const value = clampNumber(
          accessibilityContrastSlider.value,
          ACCESSIBILITY_CONTRAST_MIN,
          ACCESSIBILITY_CONTRAST_MAX,
          settingsState.accessibilityContrast
        );
        commitModalSettings({ accessibilityContrast: Math.round(value) });
      });
    }

    if (accessibilityContrastInput) {
      const syncAccessibilityContrastFromTextBox = () => {
        const value = clampNumber(
          accessibilityContrastInput.value,
          ACCESSIBILITY_CONTRAST_MIN,
          ACCESSIBILITY_CONTRAST_MAX,
          settingsState.accessibilityContrast
        );
        commitModalSettings({ accessibilityContrast: Math.round(value) });
      };
      accessibilityContrastInput.addEventListener("change", syncAccessibilityContrastFromTextBox);
      accessibilityContrastInput.addEventListener("blur", syncAccessibilityContrastFromTextBox);
      accessibilityContrastInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncAccessibilityContrastFromTextBox();
          accessibilityContrastInput.blur();
        }
      });
    }

    if (accessibilitySaturationSlider) {
      accessibilitySaturationSlider.addEventListener("input", () => {
        const value = clampNumber(
          accessibilitySaturationSlider.value,
          ACCESSIBILITY_SATURATION_MIN,
          ACCESSIBILITY_SATURATION_MAX,
          settingsState.accessibilitySaturation
        );
        commitModalSettings({ accessibilitySaturation: Math.round(value) });
      });
    }

    if (accessibilitySaturationInput) {
      const syncAccessibilitySaturationFromTextBox = () => {
        const value = clampNumber(
          accessibilitySaturationInput.value,
          ACCESSIBILITY_SATURATION_MIN,
          ACCESSIBILITY_SATURATION_MAX,
          settingsState.accessibilitySaturation
        );
        commitModalSettings({ accessibilitySaturation: Math.round(value) });
      };
      accessibilitySaturationInput.addEventListener("change", syncAccessibilitySaturationFromTextBox);
      accessibilitySaturationInput.addEventListener("blur", syncAccessibilitySaturationFromTextBox);
      accessibilitySaturationInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          syncAccessibilitySaturationFromTextBox();
          accessibilitySaturationInput.blur();
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
        const runAnchorScroll = () => scrollToSettingsSection(target, "smooth");

        if (settingsState.activePage !== "settings") {
          commitModalSettings(
            { activePage: "settings" },
            { preserveScroll: false, stabilizeScroll: false }
          );
          global.requestAnimationFrame(runAnchorScroll);
          return;
        }

        runAnchorScroll();
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

    if (usageResetSettingsBtn) {
      usageResetSettingsBtn.addEventListener("click", () => {
        try {
          if (global.localStorage) {
            global.localStorage.removeItem(SETTINGS_STORAGE_KEY);
          }
        } catch {
          // Ignore storage remove errors.
        }
        settingsState = readModalSettings();
        commitModalSettings(
          { ...settingsState, activePage: "settings" },
          { preserveScroll: false, stabilizeScroll: false }
        );
        syncStorageUsage();
        showToast("Settings cleared from local storage.", "success");
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
      resizeConfettiCanvas();
    };
    global.addEventListener("resize", onWindowResize);

    applyStatusAccent();
    syncLabelChipState();
    syncNumberVisibility();
    syncLabelChipOverflowState();
    applyModalSettings();
    autoResizeTextareas.forEach(autoResizeTextarea);
    setTipFeedback(editorHintMessage);
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
        copyMenuTrigger.addEventListener("click", (event) => {
          event.preventDefault();
          let open = false;
          try {
            open = copyMenu.matches(":popover-open");
          } catch {
            open = false;
          }
          if (open) {
            copyMenu.hidePopover();
            return;
          }
          positionPopoverNearTrigger(copyMenu, copyMenuTrigger, "end");
          copyMenu.showPopover();
        });
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
      item.addEventListener("click", async () => {
        const selectedFormat = String(item.getAttribute("data-copy-format") || "").trim();
        if (!Object.prototype.hasOwnProperty.call(COPY_FORMATS, selectedFormat)) return;

        const insertData = collectInsertData();
        let copied = false;
        if (selectedFormat === "plain-text") {
          copied = await copyTextToClipboard(buildPlainText(insertData));
        } else if (selectedFormat === "markdown") {
          copied = await copyTextToClipboard(buildMarkdown(insertData));
        }
        const selectedLabel = (COPY_FORMATS[selectedFormat] || { label: "Copy" }).label;
        setActionFeedback(copied ? `${selectedLabel} copied to clipboard.` : "Copy failed. Clipboard blocked.", copied ? "success" : "error");

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

      const copied = await copyInnerHtmlToClipboard(buildHTML(insertData));
      const label = COPY_FORMATS["inner-html"].label;
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

    insertBtn.onclick = async () => {
      if (typeof buildHTML !== "function" || typeof simulatePaste !== "function") return;
      editor.innerHTML = "";
      const html = buildHTML(collectInsertData());
      if (settingsState.insertAnimatedPaste === true && typeof app.simulatePasteBlockByBlock === "function") {
        await app.simulatePasteBlockByBlock(editor, html);
      } else {
        simulatePaste(editor, html);
      }
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
