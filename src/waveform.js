(function () {
  "use strict";

  const app = globalThis.ClickUpUpdateApp;
  const CANVAS_ID = "waveform-canvas";
  const DEFAULT_ACCENT_HUE = 218;
  const HISTORY_SIZE = 140;
  const BAR_COUNT = 56;

  const musicHistory = [];
  const peakHistory = [];
  const waveformPulseTelemetry = (app._waveformPulseTelemetry = app._waveformPulseTelemetry || {
    updatedAt: 0,
    mode: "idle",
    hitScore: 0,
    drumScore: 0,
    transientScore: 0,
    cadenceScore: 0
  });
  const barLevels = Array.from({ length: BAR_COUNT }, () => 0);
  const sfxBarLevels = Array.from({ length: BAR_COUNT }, () => 0);
  const ambientBarLevels = Array.from({ length: BAR_COUNT }, () => 0);
  const barTargets = Array.from({ length: BAR_COUNT }, () => 0);
  const bandAdaptiveMax = Array.from({ length: BAR_COUNT }, () => 0.16);
  const barPhases = Array.from({ length: BAR_COUNT }, (_, i) => (i * 0.37) + (Math.random() * Math.PI));
  let frame = 0;
  let drawRaf = 0;
  let initialized = false;
  let sfxLevel = 0;
  let beatSubscribed = false;
  let currentBpm = 84;
  let lastBeatAt = 0;
  let beatStrength = 0;
  let beatIntervalMs = 714;
  let adaptiveBodyMax = 0.22;
  let musicDrive = 0;
  let harmonicMix = 0.5;
  let harmonicFlux = 0;
  let phaseJitter = 0;
  let loudnessEma = 0.15;
  let transientEma = 0;
  let bassDrive = 0;
  let kickDrive = 0;
  let kickTransientEma = 0;
  let fastCadenceDrive = 0;
  let melodyDrive = 0;
  let grooveSwing = 0;
  let spectrumLast = null;

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  }

  function clampBpm(value, fallback = 84) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(55, Math.min(190, n));
  }

  function getModalShadowRoots() {
    const hosts = Array.from(document.querySelectorAll(".clickup-update-modal-host"));
    return hosts
      .map((host) => (host && host.shadowRoot ? host.shadowRoot : null))
      .filter(Boolean);
  }

  function findElementById(id) {
    const direct = document.getElementById(id);
    if (direct) return direct;
    const roots = getModalShadowRoots();
    for (const root of roots) {
      const inside = root.getElementById(id);
      if (inside) return inside;
    }
    return null;
  }

  function queryAllAcrossRoots(selector) {
    const results = Array.from(document.querySelectorAll(selector));
    const roots = getModalShadowRoots();
    roots.forEach((root) => {
      results.push(...Array.from(root.querySelectorAll(selector)));
    });
    return results;
  }

  function ensureFilterBehavior() {
    const checkboxes = queryAllAcrossRoots('input[name="waveform-filter"]');
    checkboxes.forEach((checkbox) => {
      if (checkbox.__waveformBound) return;
      checkbox.__waveformBound = true;
      checkbox.addEventListener("change", () => {
        const all = queryAllAcrossRoots('input[name="waveform-filter"]');
        const checked = all.filter((item) => item.checked);
        if (checked.length === 0) {
          checkbox.checked = true;
        }
      });
    });
  }

  function isFilterOn(value) {
    const boxes = queryAllAcrossRoots(`input[name="waveform-filter"][value="${value}"]`);
    if (boxes.length === 0) return true;
    return boxes.some((box) => box.checked);
  }

  function getSelectedFactor() {
    const radios = queryAllAcrossRoots('input[name="waveform-factor"]');
    const selected = radios.find((item) => item.checked);
    const value = String(selected && selected.value ? selected.value : "all").toLowerCase();
    if (value === "beat" || value === "melody" || value === "amplitude") return value;
    return "all";
  }

  function getAccentHue() {
    const roots = getModalShadowRoots();
    for (const root of roots) {
      const modalCard = root.querySelector(".modal-card");
      if (!modalCard) continue;
      const style = globalThis.getComputedStyle ? globalThis.getComputedStyle(modalCard) : null;
      const raw = style ? style.getPropertyValue("--accent-custom-hue") : "";
      const parsed = Number.parseFloat(String(raw || "").trim());
      if (Number.isFinite(parsed)) return parsed;
    }
    return DEFAULT_ACCENT_HUE;
  }

  function toRgbaHue(hue, alpha) {
    const h = ((Number(hue) % 360) + 360) % 360;
    const a = Math.max(0, Math.min(1, Number(alpha) || 0));
    return `hsla(${h}, 92%, 66%, ${a})`;
  }

  function getWaveformPalette() {
    const accentHue = getAccentHue();
    return {
      music: toRgbaHue(accentHue, 0.42),
      sfx: toRgbaHue(accentHue + 90, 0.36),
      ambient: toRgbaHue(accentHue + 180, 0.3)
    };
  }

  function drawMusicWaveform(ctx, width, height, nowMs, options = {}) {
    if (musicHistory.length === 0) return;
    const strength = Number.isFinite(options.strength) ? options.strength : 1;
    const fillColor = String(options.fillColor || "rgba(120, 140, 255, 0.45)");
    const factor = String(options.factor || "all");
    const volumeScale = Number.isFinite(options.volumeScale) ? options.volumeScale : 1;
    const top = 0;
    const bottom = 0;
    const graphHeight = Math.max(8, height - top - bottom);
    const centerY = top + (graphHeight * 0.5);
    const maxHalfHeight = Math.max(4, Math.floor(graphHeight * 0.5));
    const slotWidth = width / BAR_COUNT;
    const gap = Math.max(0.75, Math.min(1.25, slotWidth * 0.08));
    const barWidth = Math.max(1, slotWidth - gap);

    // Subtle guide rows like an equalizer bed
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let row = 0; row <= 3; row += 1) {
      const y = top + (graphHeight * (row / 3));
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    // Attack/release smoothing for bar motion + subtle per-bar micro movement
    const sinceBeat = Math.max(0, nowMs - lastBeatAt);
    const beatWindow = Math.max(120, beatIntervalMs * 0.24);
    const beatPulse = Math.exp(-sinceBeat / beatWindow) * beatStrength;
    const beatPhase = ((nowMs + (phaseJitter * 90)) % Math.max(280, beatIntervalMs)) / Math.max(280, beatIntervalMs);
    const swingPulse = 0.5 + (0.5 * Math.sin((beatPhase * Math.PI * 2) + (harmonicMix * Math.PI)));
    const groovePulse = 1 + (beatPulse * 0.08) + (swingPulse * grooveSwing * 0.03);
    const beatGroovePulse = 1 + (beatPulse * 0.14) + (kickTransientEma * 0.22) + (fastCadenceDrive * 0.12);
    const travelBarsPerBeat = BAR_COUNT * (0.92 + ((currentBpm - 55) / 170) * 0.5);
    const travelFront = beatPhase * travelBarsPerBeat;
    const travelSpread = 1.3 + (grooveSwing * 0.45);
    const travelEnergyBase = beatPulse * (0.26 + (bassDrive * 0.38));
    const intensity = Math.max(0.65, Math.min(1.7,
      0.72 +
      (musicDrive * 0.5) +
      (beatPulse * 0.16) +
      (harmonicFlux * 0.22) +
      (transientEma * 0.18)
    ));
    const waveformInterpolatorFn = app && typeof app._waveformInterpolatorFn === "function"
      ? app._waveformInterpolatorFn
      : null;
    const riseInterpolation = waveformInterpolatorFn ? clamp01(waveformInterpolatorFn(0.65)) : 0.65;
    const fallInterpolation = waveformInterpolatorFn ? clamp01(waveformInterpolatorFn(0.35)) : 0.35;
    const attackBase = Math.max(0.56, Math.min(0.9, 0.66 + (transientEma * 0.2) + (beatPulse * 0.08)));
    const releaseBase = Math.max(0.2, Math.min(0.44, 0.28 + ((1 - beatPulse) * 0.08) + ((1 - transientEma) * 0.06)));
    const attack = Math.max(0.2, Math.min(0.98, attackBase * (0.72 + (riseInterpolation * 0.62))));
    const release = Math.max(0.08, Math.min(0.82, releaseBase * (0.72 + ((1 - fallInterpolation) * 0.68))));

    for (let index = 0; index < BAR_COUNT; index += 1) {
      const bandPos = index / Math.max(1, BAR_COUNT - 1);
      const bassWeight = Math.max(0, 1 - (bandPos * 1.45));
      const kickWeight = Math.max(0, 1 - (bandPos * 3.4));
      const melodyWeight = Math.max(0, 1 - Math.abs(bandPos - 0.56) * 2.8);
      const vibeLift = (bassDrive * bassWeight * 0.22) + (melodyDrive * melodyWeight * 0.2);
      const leaderBias = Math.max(0, 1 - (bandPos * 8.0));
      const leaderKick = beatPulse * (0.015 + (leaderBias * 0.09));
      const distanceFromFront = index - travelFront;
      const travelEnvelope = Math.exp(-((distanceFromFront * distanceFromFront) / Math.max(0.8, 2 * travelSpread * travelSpread)));
      const travelPulse = travelEnvelope * travelEnergyBase;
      const handoff = index > 0
        ? Math.max(0, (barLevels[index - 1] - barLevels[index])) * (0.18 + (beatPulse * 0.18))
        : 0;
      const localTravelDelay = index / Math.max(1, travelBarsPerBeat);
      let envelopePhase = beatPhase - localTravelDelay;
      while (envelopePhase < 0) envelopePhase += 1;
      const attackWindow = 0.06;
      const beatEnvelope = envelopePhase <= attackWindow
        ? (envelopePhase / Math.max(0.001, attackWindow))
        : Math.exp(-((envelopePhase - attackWindow) / Math.max(0.001, 1 - attackWindow)) * 12.5);
      const initiatorBoost = 1 + (leaderBias * (0.28 + (beatStrength * 0.32)));
      const localBeat = 0.5 + (0.5 * Math.sin((beatPhase * Math.PI * 2) + (barPhases[index] * 1.4) + (bandPos * Math.PI)));
      const localBeatLift = (beatPulse * (0.012 + (bassWeight * 0.04))) + (localBeat * grooveSwing * 0.008);
      const micro = Math.sin((nowMs * 0.0092) + barPhases[index]) * (0.004 + (harmonicFlux * 0.012));
      const spectralBase = Math.max(0, (barTargets[index] * 0.96) + (vibeLift * 0.25));
      const envelopeGain = Math.max(0, Math.min(1.15, beatEnvelope * initiatorBoost));
      const travelKick = envelopeGain * (0.07 + (leaderBias * 0.11) + (handoff * 0.32)) * (0.2 + (spectralBase * 0.8));
      const lateralBalance = 0.95 + (bandPos * 0.14);
      const amplitudeComponent = (spectralBase * intensity * lateralBalance) * volumeScale;
      const beatComponent = (travelKick + (travelPulse * 0.16) + (leaderKick * 0.16)) * volumeScale;
      const kickComponent = (kickDrive * (0.1 + (kickWeight * 0.36))
        + (kickTransientEma * (0.08 + (kickWeight * 0.32)))
        + (fastCadenceDrive * (0.04 + (kickWeight * 0.12)))) * volumeScale;
      const melodyComponent = (vibeLift + localBeatLift + micro) * volumeScale;
      let composed = amplitudeComponent + beatComponent + kickComponent + melodyComponent;
      if (factor === "beat") {
        composed = (amplitudeComponent * 0.12) + (beatComponent * 1.12) + (kickComponent * 1.7) + (melodyComponent * 0.12);
      } else if (factor === "melody") {
        composed = (amplitudeComponent * 0.35) + (beatComponent * 0.25) + (melodyComponent * 1.15);
      } else if (factor === "amplitude") {
        composed = (amplitudeComponent * 1.2) + (beatComponent * 0.15) + (melodyComponent * 0.25);
      }
      const target = Math.max(
        0,
        Math.min(
          1,
          (composed * strength * (factor === "beat" ? beatGroovePulse : groovePulse))
        )
      );
      const current = barLevels[index];
      if (target > current) {
        barLevels[index] = current + ((target - current) * attack);
      } else {
        barLevels[index] = current + ((target - current) * release);
      }
      if (barLevels[index] < 0.0075) {
        barLevels[index] = 0;
      }
    }

    // Draw bars
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const x = (index * slotWidth);
      const value = Math.max(0, Math.min(1, barLevels[index] * strength));
      const barHalf = Math.max(1, Math.round(value * maxHalfHeight));
      const y = Math.round(centerY - barHalf);
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, barWidth, barHalf * 2);
    }
  }

  function drawLayerBars(ctx, width, height, levels, color, intensity = 0) {
    if (!levels || levels.length === 0) return;
    if (intensity <= 0.0001) {
      for (let i = 0; i < levels.length; i += 1) levels[i] *= 0.78;
    }
    const centerY = height * 0.5;
    const maxHalfHeight = Math.max(4, Math.floor(height * 0.5));
    const slotWidth = width / BAR_COUNT;
    const gap = Math.max(0.75, Math.min(1.25, slotWidth * 0.08));
    const barWidth = Math.max(1, slotWidth - gap);

    for (let index = 0; index < BAR_COUNT; index += 1) {
      const phase = barPhases[index];
      const shape = 0.35 + (0.65 * Math.abs(Math.sin((frame * 0.09) + (phase * 1.6) + (index * 0.08))));
      const target = Math.max(0, Math.min(1, intensity * shape));
      const current = levels[index];
      const attack = 0.42;
      const release = 0.18;
      levels[index] = target > current
        ? current + ((target - current) * attack)
        : current + ((target - current) * release);
      if (levels[index] < 0.004) levels[index] = 0;
    }

    ctx.fillStyle = color;
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const x = index * slotWidth;
      const value = Math.max(0, Math.min(1, levels[index]));
      const barHalf = Math.max(1, Math.round(value * maxHalfHeight));
      const y = Math.round(centerY - barHalf);
      ctx.fillRect(x, y, barWidth, barHalf * 2);
    }
  }

  function draw() {
    frame += 1;

    if (!beatSubscribed) {
      const lofiController = app && app._lofiController;
      if (lofiController && typeof lofiController.subscribeBeats === "function") {
        lofiController.subscribeBeats((data) => {
          const energy = clamp01(data && data.energy);
          const rms = clamp01(data && data.rms);
          const peak = Math.max(
            0,
            Math.min(
              1,
              Number(data && data.peak) || (energy * 0.68 + rms * 0.92)
            )
          );

          const estimated = clampBpm(data && data.estimatedBpm, currentBpm);
          const beatBpm = clampBpm(data && data.beatBpm, estimated);
          currentBpm = (currentBpm * 0.82) + (beatBpm * 0.18);

          const spectrumData = Array.isArray(data && data.spectrum) ? data.spectrum : null;
          let kickBand = energy;
          let kickTransient = 0;
          if (spectrumData && spectrumData.length > 0) {
            let weighted = 0;
            let total = 0;
            let flux = 0;
            const kickEnd = Math.max(1, Math.floor(spectrumData.length * 0.12));
            const subEnd = Math.max(kickEnd + 1, Math.floor(spectrumData.length * 0.24));
            let kickSum = 0;
            let subSum = 0;
            let kickTransientSum = 0;
            let kickTransientCount = 0;
            for (let i = 0; i < spectrumData.length; i += 1) {
              const value = clamp01(spectrumData[i]);
              weighted += value * i;
              total += value;
              if (i < kickEnd) kickSum += value;
              if (i < subEnd) subSum += value;
              if (spectrumLast && i < spectrumLast.length) {
                const delta = value - clamp01(spectrumLast[i]);
                if (delta > 0) flux += delta;
                if (i < subEnd) {
                  kickTransientSum += Math.max(0, delta);
                  kickTransientCount += 1;
                }
              }
            }
            const kickAvg = kickSum / Math.max(1, kickEnd);
            const subAvg = subSum / Math.max(1, subEnd);
            kickBand = Math.max(0, Math.min(1, (kickAvg * 0.76) + (subAvg * 0.34)));
            kickTransient = kickTransientCount > 0
              ? Math.max(0, Math.min(1, (kickTransientSum / kickTransientCount) * 5.2))
              : 0;
            const centroid = total > 0 ? (weighted / total) / Math.max(1, spectrumData.length - 1) : 0;
            harmonicMix = (harmonicMix * 0.78) + (centroid * 0.22);
            harmonicFlux = (harmonicFlux * 0.72) + (Math.max(0, Math.min(1, flux / Math.max(1, spectrumData.length))) * 0.28);
            spectrumLast = spectrumData.slice();
          } else {
            harmonicFlux *= 0.94;
          }

          const intervalMsRaw = Number(data && data.intervalMs);
          if (Number.isFinite(intervalMsRaw) && intervalMsRaw >= 240 && intervalMsRaw <= 1600) {
            beatIntervalMs = (beatIntervalMs * 0.72) + (intervalMsRaw * 0.28);
          } else {
            beatIntervalMs = (beatIntervalMs * 0.92) + ((60000 / currentBpm) * 0.08);
          }
          const cadence = Math.max(0, Math.min(1, (560 - beatIntervalMs) / 260));
          fastCadenceDrive = (fastCadenceDrive * 0.72) + (cadence * 0.28);

          if (data && data.mode === "beat") {
            lastBeatAt = (globalThis.performance && typeof globalThis.performance.now === "function")
              ? globalThis.performance.now()
              : Date.now();
            beatStrength = Math.max(beatStrength * 0.45, clamp01((energy * 0.6) + (peak * 0.7)));
            phaseJitter = (phaseJitter * 0.52) + ((Math.random() - 0.5) * 0.9);
          } else {
            beatStrength *= 0.965;
            phaseJitter *= 0.985;
          }

          const rawBody = Math.max(0, Math.min(1, (energy * 0.6) + (rms * 0.75)));
          const transient = Math.max(0, peak - rawBody);

          loudnessEma = (loudnessEma * 0.9) + (rawBody * 0.1);
          transientEma = (transientEma * 0.78) + (Math.max(0, Math.min(1, transient * 1.45)) * 0.22);

          adaptiveBodyMax = Math.max(rawBody, adaptiveBodyMax * 0.992);
          const normalizedBody = Math.max(0, Math.min(1, rawBody / Math.max(0.08, adaptiveBodyMax)));
          const boostedBody = Math.max(0, Math.min(1, (normalizedBody * 0.72) + (transient * 1.6)));

          musicDrive = (musicDrive * 0.84) + (boostedBody * 0.16);

          const spectrum = spectrumData || [];
          let bassBand = boostedBody;
          let melodyBand = boostedBody * 0.75;
          if (spectrum.length > 0) {
            const bassEnd = Math.max(1, Math.floor(spectrum.length * 0.22));
            const melodyStart = Math.max(0, Math.floor(spectrum.length * 0.35));
            const melodyEnd = Math.max(melodyStart + 1, Math.floor(spectrum.length * 0.72));
            let bassSum = 0;
            for (let i = 0; i < bassEnd; i += 1) bassSum += clamp01(spectrum[i]);
            bassBand = bassSum / Math.max(1, bassEnd);
            let melodySum = 0;
            let melodyCount = 0;
            for (let i = melodyStart; i < melodyEnd && i < spectrum.length; i += 1) {
              melodySum += clamp01(spectrum[i]);
              melodyCount += 1;
            }
            melodyBand = melodyCount > 0 ? (melodySum / melodyCount) : boostedBody;
          }
          bassDrive = (bassDrive * 0.76) + (Math.max(0, Math.min(1, (bassBand * 0.72) + (beatStrength * 0.62))) * 0.24);
          kickDrive = (kickDrive * 0.7) + (Math.max(0, Math.min(1, (kickBand * 0.78) + (beatStrength * 0.42) + (kickTransient * 0.36))) * 0.3);
          kickTransientEma = (kickTransientEma * 0.66) + (kickTransient * 0.34);
          melodyDrive = (melodyDrive * 0.8) + (Math.max(0, Math.min(1, (melodyBand * 0.84) + (harmonicFlux * 0.5))) * 0.2);
          grooveSwing = (grooveSwing * 0.82) + (Math.max(0, Math.min(1, (harmonicFlux * 1.25) + (beatStrength * 0.45))) * 0.18);

          const waveformDrumScore = clamp01(
            (kickDrive * 0.56)
            + (kickTransientEma * 0.34)
            + (fastCadenceDrive * 0.2)
            + (beatStrength * 0.22)
          );
          const waveformHitScore = clamp01(
            (waveformDrumScore * 0.62)
            + (musicDrive * 0.16)
            + (transientEma * 0.16)
            + (harmonicFlux * 0.1)
          );
          const nowMs = (globalThis.performance && typeof globalThis.performance.now === "function")
            ? globalThis.performance.now()
            : Date.now();
          waveformPulseTelemetry.updatedAt = nowMs;
          waveformPulseTelemetry.mode = String(data && data.mode || "visualizer");
          waveformPulseTelemetry.hitScore = waveformHitScore;
          waveformPulseTelemetry.drumScore = waveformDrumScore;
          waveformPulseTelemetry.transientScore = clamp01(kickTransientEma);
          waveformPulseTelemetry.cadenceScore = clamp01(fastCadenceDrive);

          const spectralProfile = new Array(BAR_COUNT).fill(boostedBody);
          const remapPower = 0.82;
          for (let index = 0; index < BAR_COUNT; index += 1) {
            const start = Math.floor(Math.pow((index / BAR_COUNT), remapPower) * spectrum.length);
            const end = Math.max(start + 1, Math.floor(Math.pow(((index + 1) / BAR_COUNT), remapPower) * spectrum.length));
            let sum = 0;
            let count = 0;
            for (let i = start; i < end && i < spectrum.length; i += 1) {
              sum += clamp01(spectrum[i]);
              count += 1;
            }
            const rawSpectral = count > 0 ? (sum / count) : boostedBody;
            const logSpectral = Math.log(1 + (rawSpectral * 9)) / Math.log(10);
            bandAdaptiveMax[index] = Math.max(logSpectral, bandAdaptiveMax[index] * 0.992);
            const normalizedSpectral = Math.max(0, Math.min(1, logSpectral / Math.max(0.08, bandAdaptiveMax[index])));
            spectralProfile[index] = normalizedSpectral;
          }

          for (let index = 0; index < BAR_COUNT; index += 1) {
            const spectral = spectralProfile[index];
            const prev = index > 0 ? spectralProfile[index - 1] : spectral;
            const next = index < (BAR_COUNT - 1) ? spectralProfile[index + 1] : spectral;
            const neighborAvg = (prev + next) * 0.5;
            const contrast = Math.max(0, spectral - neighborAvg);
            const bandPos = index / Math.max(1, BAR_COUNT - 1);
            const bassWeight = Math.max(0, 1 - (bandPos * 1.6));
            const melodyWeight = Math.max(0, 1 - Math.abs(bandPos - 0.52) * 2.05);
            const airWeight = Math.max(0, (bandPos - 0.5) / 0.5);
            const bandWeight = (0.9
              + (bassWeight * (0.1 + (bassDrive * 0.08)))
              + (melodyWeight * (0.16 + (melodyDrive * 0.12)))
              + (airWeight * 0.1)
              + (0.08 * Math.sin((bandPos * Math.PI * 2.1) + (harmonicMix * Math.PI * 1.1))))
              * (0.96 + (bandPos * 0.12));
            const antiFlat = Math.max(0, spectral - (boostedBody * 0.32));
            let level = (spectral * 0.86) + (boostedBody * 0.03) + (antiFlat * 0.52);
            if (!spectrum.length) {
              // fallback shape when analyzer bands aren't present
              const shaped = Math.abs(Math.sin((index * 0.33) + (frame * 0.03) + phaseJitter + (grooveSwing * 0.8)));
              level = Math.max(level, shaped * boostedBody * 0.86);
              bandAdaptiveMax[index] = Math.max(0.12, bandAdaptiveMax[index] * 0.996);
            }
            const transientLift = transientEma * (0.18 + (contrast * 0.85));
            const grooveLift = beatStrength * (0.06 + (bassWeight * 0.08) + (melodyWeight * 0.08) + (airWeight * 0.05));
            level = (level * bandWeight) + (contrast * 0.88) + transientLift + grooveLift;
            barTargets[index] = Math.max(0, Math.min(1, level));
          }

          musicHistory.push(boostedBody);
          peakHistory.push(Math.max(boostedBody, Math.min(1, peak * 1.08)));
          if (musicHistory.length > HISTORY_SIZE) {
            musicHistory.shift();
            peakHistory.shift();
          }
        });
        beatSubscribed = true;
      }
    }

    const canvas = findElementById(CANVAS_ID);
    if (!canvas) {
      drawRaf = requestAnimationFrame(draw);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width < 2 || rect.height < 2) {
      drawRaf = requestAnimationFrame(draw);
      return;
    }
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * pixelRatio));
    const height = Math.max(1, Math.floor(rect.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      drawRaf = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const telemetry = app && app._waveformTelemetry ? app._waveformTelemetry : {};
    const factor = getSelectedFactor();
    const palette = getWaveformPalette();
    const now = Date.now();
    const lastSfxAt = Number(telemetry.lastSfxAt || 0);
    const sfxStrength = Math.max(0, Math.min(1, Number(telemetry.sfxStrength || 0)));
    const elapsed = Math.max(0, now - lastSfxAt);
    const sfxPulse = lastSfxAt > 0 ? Math.exp(-elapsed / 260) * sfxStrength : 0;
    sfxLevel = Math.max(sfxLevel * 0.88, sfxPulse);
    const ambientLevel = Math.max(0, Math.min(1, Number(telemetry.ambientLevel || 0)));
    let musicVolumeScale = 1;
    try {
      const lofiController = app && app._lofiController;
      const audioEl = lofiController && typeof lofiController.getAudioElement === "function"
        ? lofiController.getAudioElement()
        : null;
      const volume = audioEl && Number.isFinite(audioEl.volume) ? Math.max(0, Math.min(1, audioEl.volume)) : 1;
      musicVolumeScale = volume < 0.999 ? Math.max(0.12, Math.pow(volume, 0.84)) : 1;
    } catch (e) {
      musicVolumeScale = 1;
    }
    const hasAnyActivity = musicHistory.length > 0 || sfxLevel > 0.01 || ambientLevel > 0.01;

    if (isFilterOn("ambient")) {
      drawLayerBars(ctx, width, height, ambientBarLevels, palette.ambient, ambientLevel * 0.9);
    }
    if (isFilterOn("sfx")) {
      drawLayerBars(ctx, width, height, sfxBarLevels, palette.sfx, sfxLevel * 1.1);
    }
    if (isFilterOn("music")) {
      drawMusicWaveform(ctx, width, height, now, {
        strength: 1,
        fillColor: palette.music,
        factor,
        volumeScale: musicVolumeScale
      });
    }

    if (!hasAnyActivity) {
      ctx.strokeStyle = "rgba(80,180,255,0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const step = width / 80;
      for (let i = 0; i <= 80; i++) {
        const x = i * step;
        const y = (height / 2) + Math.sin((i * 0.35) + (frame * 0.03)) * (height * 0.08);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    drawRaf = requestAnimationFrame(draw);
  }

  function initializeWaveform() {
    if (initialized) return;
    initialized = true;
    console.log("Waveform initialized");

    ensureFilterBehavior();

    draw();

    // Rebind filters and re-check canvas as modal opens/closes.
    try {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of Array.from(m.addedNodes || [])) {
            try {
              if (node && node.nodeType === 1 && node.classList && node.classList.contains("clickup-update-modal-host")) {
                ensureFilterBehavior();
              }
            } catch (e) { }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: false });
    } catch (e) { }
  }

  // app.bootstrap may be either a function (initializer) or a Promise-like object
  if (app && app.bootstrap) {
    try {
      if (typeof app.bootstrap.then === "function") {
        app.bootstrap.then(initializeWaveform);
      } else {
        setTimeout(initializeWaveform, 250);
        document.addEventListener("DOMContentLoaded", initializeWaveform);
      }
    } catch (err) {
      setTimeout(initializeWaveform, 250);
    }
  } else {
    setTimeout(initializeWaveform, 250);
    document.addEventListener("DOMContentLoaded", initializeWaveform);
  }

})();
