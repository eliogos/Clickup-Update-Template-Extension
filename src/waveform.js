(function () {
  "use strict";

  const app = globalThis.ClickUpUpdateApp;
  const CANVAS_ID = "waveform-canvas";
  const WAVEFORM_COLOR = "rgba(255, 255, 255, 0.7)";
  const HISTORY_SIZE = 100;

  const musicHistory = [];
  let sfxFrame = 0;
  let ambientFrame = 0;

  function drawMusicWaveform(ctx, width, height) {
    if (musicHistory.length === 0) return;
    ctx.strokeStyle = WAVEFORM_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = width / (HISTORY_SIZE - 1);
    let x = 0;

    for (let i = 0; i < musicHistory.length; i++) {
      const data = musicHistory[i];
      const magnitude = (data.energy + data.rms) / 2;
      const y = height / 2 + magnitude * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += step;
    }
    ctx.stroke();
  }

  function drawSfxWaveform(ctx, width, height) {
    sfxFrame++;
    ctx.strokeStyle = "rgba(255, 100, 100, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = width / 50;
    for (let i = 0; i < 50; i++) {
        const x = i * step;
        const y = height / 2 + Math.sin(i * 0.5 + sfxFrame * 0.2) * (height / 4) * Math.random();
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
  }

  function drawAmbientWaveform(ctx, width, height) {
    ambientFrame++;
    ctx.strokeStyle = "rgba(100, 255, 100, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const step = width / 100;
    for (let i = 0; i < 100; i++) {
        const x = i * step;
        const y = height / 2 + Math.sin(i * 0.2 + ambientFrame * 0.05) * (height / 3) * Math.sin(i * 0.1 + ambientFrame * 0.02);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
  }

  function draw() {
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const musicCheckbox = document.querySelector('input[value="music"]:checked');
    const sfxCheckbox = document.querySelector('input[value="sfx"]:checked');
    const ambientCheckbox = document.querySelector('input[value="ambient"]:checked');

    if (musicCheckbox) {
      drawMusicWaveform(ctx, width, height);
    }
    if (sfxCheckbox) {
      drawSfxWaveform(ctx, width, height);
    }
    if (ambientCheckbox) {
      drawAmbientWaveform(ctx, width, height);
    }

    requestAnimationFrame(draw);
  }

  function initializeWaveform() {
    console.log("Waveform initialized");
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas) {
      console.error("Waveform canvas not found!");
      return;
    }

    const checkboxes = document.querySelectorAll('input[name="waveform-filter"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checkedCheckboxes = document.querySelectorAll('input[name="waveform-filter"]:checked');
        if (checkedCheckboxes.length === 0) {
          checkbox.checked = true;
        }
      });
    });

    const lofiController = app._lofiController;
    if (lofiController && typeof lofiController.subscribeBeats === "function") {
      lofiController.subscribeBeats(data => {
        musicHistory.push({ energy: data.energy, rms: data.rms });
        if (musicHistory.length > HISTORY_SIZE) {
          musicHistory.shift();
        }
      });
    }

    draw();
  }

  app.bootstrap.then(() => {
    initializeWaveform();
  });

})();
