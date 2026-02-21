(function (global) {
  "use strict";

  const app = (global.ClickUpUpdateApp = global.ClickUpUpdateApp || {});

  app.createModalPhysicsController = function createModalPhysicsController(options) {
    const config = options && typeof options === "object" ? options : {};
    const modalCard = config.modalCard || null;
    const numControls = config.numControls || null;
    const getMotionScale = typeof config.getMotionScale === "function"
      ? config.getMotionScale
      : (() => 1);
    const getPhysicsStrength = typeof config.getPhysicsStrength === "function"
      ? config.getPhysicsStrength
      : (() => 0);
    const getEffectivePhysicsIntensity = typeof config.getEffectivePhysicsIntensity === "function"
      ? config.getEffectivePhysicsIntensity
      : (() => Math.max(0, getPhysicsStrength() * 100));
    const getInterpolatorValueAt = typeof config.getInterpolatorValueAt === "function"
      ? config.getInterpolatorValueAt
      : ((t) => t);
    const SPAM_STREAK_WINDOW_MS = 260;
    const SPAM_STREAK_RESET_MS = 900;
    const SPAM_STREAK_TRIGGER_COUNT = 6;

    let physicsFrame = 0;
    let physicsLastTick = 0;
    let decayStartTime = 0;
    let spamLastTargetKey = "";
    let spamStreakCount = 0;
    let spamLastAt = 0;
    const decayStart = {
      nudgeX: 0,
      nudgeY: 0,
      tiltX: 0,
      tiltY: 0,
      pressScale: 1
    };
    const physicsCurrent = {
      nudgeX: 0,
      nudgeY: 0,
      tiltX: 0,
      tiltY: 0,
      pressScale: 1
    };

    const clear = () => {
      if (!modalCard) return;
      if (physicsFrame) {
        global.cancelAnimationFrame(physicsFrame);
        physicsFrame = 0;
      }
      physicsCurrent.nudgeX = 0;
      physicsCurrent.nudgeY = 0;
      physicsCurrent.tiltX = 0;
      physicsCurrent.tiltY = 0;
      physicsCurrent.pressScale = 1;
      decayStart.nudgeX = 0;
      decayStart.nudgeY = 0;
      decayStart.tiltX = 0;
      decayStart.tiltY = 0;
      decayStart.pressScale = 1;
      decayStartTime = 0;
      spamLastTargetKey = "";
      spamStreakCount = 0;
      spamLastAt = 0;
      modalCard.style.setProperty("--modal-nudge-x", "0px");
      modalCard.style.setProperty("--modal-nudge-y", "0px");
      modalCard.style.setProperty("--modal-tilt-x", "0deg");
      modalCard.style.setProperty("--modal-tilt-y", "0deg");
      modalCard.style.setProperty("--modal-press-scale", "1");
      modalCard.style.setProperty("--modal-press-origin-x", "50%");
      modalCard.style.setProperty("--modal-press-origin-y", "50%");
      if (numControls) {
        numControls.classList.remove("is-pressed");
        numControls.style.setProperty("--control-tilt-x", "0deg");
        numControls.style.setProperty("--control-tilt-y", "0deg");
      }
    };

    const getSpamTargetKey = (event) => {
      if (!event || !(event.target instanceof Element)) return "";
      const root = event.target.closest(
        "[data-physics-spam-key], .num-controls, .settings-segmented, .settings-switch, .sidebar-page-btn, .settings-anchor-btn, .btn, button, input, textarea, select, [role='tab'], [role='button']"
      );
      const target = root || event.target;
      if (!(target instanceof Element)) return "";
      const tag = String(target.tagName || "").toLowerCase() || "node";
      const key = String(
        target.getAttribute("data-physics-spam-key")
        || target.id
        || target.getAttribute("name")
        || target.getAttribute("data-page-target")
        || target.getAttribute("data-settings-anchor-target")
        || target.getAttribute("data-theme-option")
        || target.getAttribute("data-density-option")
        || target.getAttribute("data-interpolator-mode")
        || target.getAttribute("data-copy-format")
        || ""
      ).trim();
      if (key) return `${tag}:${key}`;
      const classHint = String(target.className || "").trim().split(/\s+/).filter(Boolean).slice(0, 3).join(".");
      return `${tag}:${classHint || "anon"}`;
    };

    const registerSpamStreak = (event) => {
      const now = global.performance ? global.performance.now() : Date.now();
      const key = getSpamTargetKey(event);
      if (!key) {
        spamLastTargetKey = "";
        spamStreakCount = 0;
        spamLastAt = now;
        return { count: 0, active: false };
      }
      const elapsed = now - spamLastAt;
      if (spamLastTargetKey !== key || elapsed > SPAM_STREAK_RESET_MS) {
        spamLastTargetKey = key;
        spamStreakCount = 1;
      } else if (elapsed <= SPAM_STREAK_WINDOW_MS) {
        spamStreakCount += 1;
      } else {
        spamStreakCount = Math.max(1, spamStreakCount - 1);
      }
      spamLastAt = now;
      return {
        count: spamStreakCount,
        active: spamStreakCount >= SPAM_STREAK_TRIGGER_COUNT
      };
    };

    const renderCurrent = () => {
      if (!modalCard) return;
      modalCard.style.setProperty("--modal-nudge-x", `${physicsCurrent.nudgeX.toFixed(2)}px`);
      modalCard.style.setProperty("--modal-nudge-y", `${physicsCurrent.nudgeY.toFixed(2)}px`);
      modalCard.style.setProperty("--modal-tilt-y", `${physicsCurrent.tiltY.toFixed(2)}deg`);
      modalCard.style.setProperty("--modal-tilt-x", `${physicsCurrent.tiltX.toFixed(2)}deg`);
      modalCard.style.setProperty("--modal-press-scale", `${physicsCurrent.pressScale.toFixed(3)}`);
    };

    const startDecay = () => {
      if (physicsFrame || !modalCard) return;
      physicsLastTick = global.performance ? global.performance.now() : Date.now();
      const step = () => {
        const now = global.performance ? global.performance.now() : Date.now();
        physicsLastTick = now;
        const motionScale = getMotionScale();
        if (motionScale <= 0 || getPhysicsStrength() <= 0) {
          clear();
          physicsFrame = 0;
          return;
        }

        const durationMs = Math.max(220, 520 * Math.max(0.35, motionScale));
        const progress = Math.max(0, Math.min(1, decayStartTime > 0 ? (now - decayStartTime) / durationMs : 1));
        const eased = Math.max(0, Math.min(1, Number(getInterpolatorValueAt(progress))));
        const remain = 1 - eased;

        physicsCurrent.nudgeX = decayStart.nudgeX * remain;
        physicsCurrent.nudgeY = decayStart.nudgeY * remain;
        physicsCurrent.tiltX = decayStart.tiltX * remain;
        physicsCurrent.tiltY = decayStart.tiltY * remain;
        physicsCurrent.pressScale = 1 + ((decayStart.pressScale - 1) * remain);

        if (
          progress >= 1 ||
          (
            Math.abs(physicsCurrent.nudgeX) < 0.02 &&
            Math.abs(physicsCurrent.nudgeY) < 0.02 &&
            Math.abs(physicsCurrent.tiltX) < 0.02 &&
            Math.abs(physicsCurrent.tiltY) < 0.02 &&
            Math.abs(1 - physicsCurrent.pressScale) < 0.001
          )
        ) {
          clear();
          physicsFrame = 0;
          return;
        }

        renderCurrent();
        physicsFrame = global.requestAnimationFrame(step);
      };
      physicsFrame = global.requestAnimationFrame(step);
    };

    const applyPulse = (event, pulseOptions = {}) => {
      const strength = getPhysicsStrength();
      if (strength <= 0 || !modalCard) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const direction = Number.isFinite(pulseOptions.direction) ? pulseOptions.direction : 0;
      const shouldPressNumControls = Boolean(pulseOptions.pressNumControls);
      const multiplier = Number.isFinite(pulseOptions.multiplier)
        ? Math.max(0.2, pulseOptions.multiplier)
        : 1;

      const cardRect = modalCard.getBoundingClientRect();
      const centerX = cardRect.left + cardRect.width / 2;
      const centerY = cardRect.top + cardRect.height / 2;
      const hasExplicitRatio = Number.isFinite(pulseOptions.xRatio) && Number.isFinite(pulseOptions.yRatio);
      const rawXRatio = hasExplicitRatio
        ? pulseOptions.xRatio
        : (event.clientX - centerX) / Math.max(1, cardRect.width / 2);
      const rawYRatio = hasExplicitRatio
        ? pulseOptions.yRatio
        : (event.clientY - centerY) / Math.max(1, cardRect.height / 2);
      const xRatio = Math.max(-1, Math.min(1, rawXRatio));
      const yRatio = Math.max(-1, Math.min(1, rawYRatio));
      const strengthBoost = 0.35 + Math.pow(strength, 1.25) * 2.2;
      const absX = Math.abs(xRatio);
      const absY = Math.abs(yRatio);
      const edgeDistance = Math.max(0, Math.min(1, Math.hypot(xRatio, yRatio) / Math.SQRT2));
      const cornerProximity = Math.max(0, Math.min(1, Math.sqrt(absX * absY)));
      const cornerTiltFactor = Math.pow(cornerProximity, 0.7) * edgeDistance;
      const directionBias = direction === 0 ? 0 : direction * 0.6;

      const tiltStrength = strength * multiplier * strengthBoost;
      const tiltYBase = xRatio + directionBias;
      const tiltXBase = -yRatio;
      const tiltY = Math.max(-16, Math.min(16, tiltYBase * (2.2 + 16.8 * cornerTiltFactor) * tiltStrength));
      const tiltX = Math.max(-14, Math.min(14, tiltXBase * (2.2 + 14.4 * cornerTiltFactor) * tiltStrength));
      const nudgeX = Math.max(-22, Math.min(22, xRatio * (4 + 18 * cornerTiltFactor) * tiltStrength));
      const nudgeY = Math.max(-18, Math.min(18, yRatio * (4 + 14 * cornerTiltFactor) * tiltStrength));

      // Non-corner interactions lean toward scale-down instead of strong tilt.
      const scaleLossRaw = (0.012 + (1 - cornerProximity) * 0.045 + (1 - edgeDistance) * 0.014) * tiltStrength;
      const pressScale = Math.max(0.88, 1 - Math.min(0.12, scaleLossRaw));
      const pressOriginX = Math.max(18, Math.min(82, 50 + xRatio * 32));
      const pressOriginY = Math.max(18, Math.min(82, 50 + yRatio * 32));

      const spamStreak = registerSpamStreak(event);
      const nudgeXClamp = spamStreak.active ? 28 : 24;
      const nudgeYClamp = spamStreak.active ? 24 : 20;
      const tiltXClamp = spamStreak.active ? 30 : 18;
      const tiltYClamp = spamStreak.active ? 34 : 18;
      const minPressScale = spamStreak.active ? 0.42 : 0.84;

      // Apply impulse immediately; animation speed only affects return-to-rest timing.
      const additiveGain = 1;
      physicsCurrent.nudgeX = Math.max(-nudgeXClamp, Math.min(nudgeXClamp, physicsCurrent.nudgeX + (nudgeX * additiveGain)));
      physicsCurrent.nudgeY = Math.max(-nudgeYClamp, Math.min(nudgeYClamp, physicsCurrent.nudgeY + (nudgeY * additiveGain)));
      physicsCurrent.tiltX = Math.max(-tiltXClamp, Math.min(tiltXClamp, physicsCurrent.tiltX + (tiltX * additiveGain)));
      physicsCurrent.tiltY = Math.max(-tiltYClamp, Math.min(tiltYClamp, physicsCurrent.tiltY + (tiltY * additiveGain)));
      physicsCurrent.pressScale = Math.max(minPressScale, Math.min(1, Math.min(physicsCurrent.pressScale, pressScale)));

      if (spamStreak.active) {
        const overdrive = Math.max(0, Math.min(1, (spamStreak.count - SPAM_STREAK_TRIGGER_COUNT + 1) / 5));
        const funnyScale = Math.max(0.42, 0.74 - (overdrive * 0.24));
        const tiltDirectionY = Math.abs(xRatio) > 0.08 ? Math.sign(xRatio) : (Math.random() < 0.5 ? -1 : 1);
        const tiltDirectionX = Math.abs(yRatio) > 0.08 ? -Math.sign(yRatio) : (Math.random() < 0.5 ? -1 : 1);
        const extraTiltY = tiltDirectionY * (16 + (overdrive * 14));
        const extraTiltX = tiltDirectionX * (10 + (overdrive * 10));
        const extraNudgeX = extraTiltY * (0.52 + (overdrive * 0.25));
        const extraNudgeY = -Math.abs(extraTiltX) * (0.3 + (overdrive * 0.22));
        physicsCurrent.pressScale = Math.max(0.42, Math.min(physicsCurrent.pressScale, funnyScale));
        physicsCurrent.tiltX = Math.max(-tiltXClamp, Math.min(tiltXClamp, physicsCurrent.tiltX + extraTiltX));
        physicsCurrent.tiltY = Math.max(-tiltYClamp, Math.min(tiltYClamp, physicsCurrent.tiltY + extraTiltY));
        physicsCurrent.nudgeX = Math.max(-nudgeXClamp, Math.min(nudgeXClamp, physicsCurrent.nudgeX + extraNudgeX));
        physicsCurrent.nudgeY = Math.max(-nudgeYClamp, Math.min(nudgeYClamp, physicsCurrent.nudgeY + extraNudgeY));
      }
      modalCard.style.setProperty("--modal-press-origin-x", `${pressOriginX.toFixed(2)}%`);
      modalCard.style.setProperty("--modal-press-origin-y", `${pressOriginY.toFixed(2)}%`);
      decayStart.nudgeX = physicsCurrent.nudgeX;
      decayStart.nudgeY = physicsCurrent.nudgeY;
      decayStart.tiltX = physicsCurrent.tiltX;
      decayStart.tiltY = physicsCurrent.tiltY;
      decayStart.pressScale = physicsCurrent.pressScale;
      decayStartTime = global.performance ? global.performance.now() : Date.now();
      renderCurrent();
      startDecay();

      if (shouldPressNumControls && numControls) {
        numControls.classList.add("is-pressed");
        numControls.style.setProperty("--control-tilt-x", `${(5.5 * strength * multiplier).toFixed(2)}deg`);
        numControls.style.setProperty("--control-tilt-y", `${(direction * 7 * strength * multiplier).toFixed(2)}deg`);
        global.setTimeout(() => {
          if (!numControls) return;
          numControls.classList.remove("is-pressed");
          numControls.style.setProperty("--control-tilt-x", "0deg");
          numControls.style.setProperty("--control-tilt-y", "0deg");
        }, Math.round(120 + (220 * Math.max(0.35, getMotionScale()))));
      }
    };

    const attachSlider = (slider) => {
      if (!slider) return;
      let pointerDown = false;
      let lastX = 0;
      let lastTime = 0;

      const triggerFromPointer = (event, velocity = 0) => {
        if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
        const rect = slider.getBoundingClientRect();
        if (rect.width <= 0) return;
        const pos = (event.clientX - rect.left) / rect.width;
        const normalized = Math.max(0, Math.min(1, pos));
        const xRatio = (normalized - 0.5) * 2;
        const yRatio = -0.1;
        const speedBoost = Math.max(0, Math.min(1.8, velocity * 0.9));
        applyPulse(event, {
          xRatio,
          yRatio,
          direction: 0,
          pressNumControls: false,
          multiplier: 0.75 + speedBoost
        });
      };

      slider.addEventListener("pointerdown", (event) => {
        pointerDown = true;
        lastX = event.clientX;
        lastTime = global.performance ? global.performance.now() : Date.now();
        triggerFromPointer(event, 0);
      });

      slider.addEventListener("pointermove", (event) => {
        if (!pointerDown) return;
        const now = global.performance ? global.performance.now() : Date.now();
        const dt = Math.max(1, now - lastTime);
        const dx = Math.abs(event.clientX - lastX);
        const velocity = dx / dt;
        lastX = event.clientX;
        lastTime = now;
        triggerFromPointer(event, velocity);
      });

      const onPointerEnd = () => {
        pointerDown = false;
      };
      slider.addEventListener("pointerup", onPointerEnd);
      slider.addEventListener("pointercancel", onPointerEnd);
      slider.addEventListener("lostpointercapture", onPointerEnd);
    };

    return {
      clear,
      applyPulse,
      attachSlider,
      cleanup: clear
    };
  };
})(globalThis);
