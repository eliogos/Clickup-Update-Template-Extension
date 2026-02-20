// ==UserScript==
// @name         ClickUp --update Modal
// @namespace    clickup-update-modal
// @version      8.1
// @description  Insert update template in ClickUp
// @match        https://app.clickup.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/eliogos/clickup-task-update-template/script.user.js
// @downloadURL  https://raw.githubusercontent.com/eliogos/clickup-task-update-template/script.user.js
// ==/UserScript==

(function () {
  "use strict";

  const TRIGGER = "--update";

  const statusColor = {
    "Not Started": "pink",
    "In Progress": "blue",
    "For QA": "yellow",
    "Completed": "green"
  };
  
  const bannerPalette = {
    "red-strong":   "#E53935",
    "orange-strong":"#FB8C00",
    "yellow-strong":"#FDD835",
    "blue-strong": "#1E88E5",
    "purple-strong":"#5E35B1",
    "pink-strong": "#EC407A",
    "green-strong":"#43A047",
    "grey-strong": "#616161",

    "red":   "#B71C1C",
    "orange":"#8D4C00",
    "yellow":"#8D7A00",
    "blue":  "#0D47A1",
    "purple":"#311B92",
    "pink":  "#6A1B9A",
    "green": "#1B5E20",
    "grey":  "#424242"
  };

  function getVisibleEditor() {
    const editors = [...document.querySelectorAll(".ql-editor")];
    return editors.find(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function simulatePaste(editor, html) {
    editor.focus();

    const event = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer()
    });

    event.clipboardData.setData("text/html", html);
    event.clipboardData.setData("text/plain", html);

    editor.dispatchEvent(event);
  }

  function buildHTML(data) {
    function blockSection(title, emoji, items, force = false) {
      if (!force && (!items || items.length === 0)) return "";

      let html = `<blockquote><strong>${emoji} ${title}</strong></blockquote>`;
      items.forEach(item => {
        html += `<blockquote>${item}</blockquote>`;
      });
      html += `<br/>`;
      return html;
    }

    // Keep status line single-line (avoid whitespace nodes rendering)
    let html =
      `<h2 data-advanced-banner="${crypto.randomUUID()}" data-advanced-banner-color="${data.bannerColor || 'blue-strong'}"><strong>${data.label} ${data.number}</strong></h2>` +
      `<p><strong>Status:</strong> <span class="ql-badge ql-badge-${statusColor[data.status]}">${data.status}</span></p>` +
      `<br/>`;

    html += blockSection("Accomplishments", "🏆", data.accomplishments, true);
    html += blockSection("Blockers", "🚧", data.blockers);
    html += blockSection("Current Focus", "🎯", data.focus);

    return html;
  }

  function openModal(editor) {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "9999999";
    document.body.appendChild(host);

    // Stop ClickUp shortcuts while modal is open
    const stopKeys = (e) => {
      e.stopPropagation();
      if (e.key === "/" || e.key === "Escape") e.preventDefault();
    };
    host.addEventListener("keydown", stopKeys, true);
    host.addEventListener("keyup", stopKeys, true);
    host.addEventListener("keypress", stopKeys, true);

    const shadow = host.attachShadow({ mode: "open" });

    const close = () => host.remove();

    const strongOrder = [
      "red-strong","orange-strong","yellow-strong","blue-strong",
      "purple-strong","pink-strong","green-strong","grey-strong"
    ];
    const mutedOrder = ["red","orange","yellow","blue","purple","pink","green","grey"];

    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        * { box-sizing: border-box; font-family: system-ui; }

        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); }

        .modal {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 720px;
          background: #1a1a1a;
          color: #fff;
          padding: 22px;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,.5);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .title { font-weight: 700; font-size: 16px; margin: 0; }

        .row-inline {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .palette {
          display: grid;
          grid-template-columns: repeat(8, 22px);
          grid-auto-rows: 22px;
          gap: 8px;
          padding: 10px;
          border: 1px solid #2e2e2e;
          border-radius: 12px;
          background: #111;
        }

        .swatch {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          outline: none;
          background: #999;
        }

        .swatch:hover { filter: brightness(1.08); }
        .swatch.selected { border-color: #fff; }

        .field {
          background: #111;
          color: #fff;
          border: 1px solid #333;
          padding: 8px 10px;
          border-radius: 10px;
          outline: none;
        }

        .field:focus { border-color: #4b84ff; box-shadow: 0 0 0 2px rgba(75,132,255,.25); }

        .label-input { flex: 1; min-width: 180px; }

        .num-controls {
          display: inline-flex;
          align-items: center;
          border: 1px solid #333;
          border-radius: 10px;
          overflow: hidden;
          background: #111;
        }

        .num-btn {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          border: none;
          cursor: pointer;
        }

        .num-btn:hover { background: #181818; }

        .num-input {
          width: 56px;
          height: 34px;
          text-align: center;
          border: none;
          background: transparent;
          color: #fff;
          outline: none;
        }

        .group label { display: inline-block; margin: 0 0 6px 0; font-size: 12px; }

        textarea.field { width: 100%; min-height: 80px; resize: vertical; }

        select.field { min-width: 180px; }

        .req { color: #ff4d4d; font-weight: 700; margin-left: 3px; }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .btn {
          height: 34px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid #333;
          background: #111;
          color: #fff;
          cursor: pointer;
        }

        .btn:hover { background: #181818; }

        .btn-primary {
          background: #2f6fed;
          border-color: #2f6fed;
        }

        .btn-primary:hover { filter: brightness(1.06); }

        .btn-primary:disabled {
          opacity: .45;
          cursor: not-allowed;
          filter: none;
        }

        .note { font-size: 12px; opacity: .7; }
      </style>

      <div class="overlay"></div>
      <div class="modal" role="dialog" aria-modal="true">
        <p class="title">Insert Update Template</p>

        <div class="row-inline">
          <div class="palette" id="palette" aria-label="Banner color"></div>
          <input class="field label-input" id="label" value="Design Update" />
          <div class="num-controls" aria-label="Update number">
            <button class="num-btn" id="dec" type="button">−</button>
            <input class="num-input" id="number" value="01" inputmode="numeric" />
            <button class="num-btn" id="inc" type="button">+</button>
          </div>
        </div>

        <div class="group">
          <label>Status<span class="req">*</span></label><br/>
          <select class="field" id="status">
            <option>Not Started</option>
            <option selected>In Progress</option>
            <option>For QA</option>
            <option>Completed</option>
          </select>
        </div>

        <div class="group">
          <label>Accomplishments<span class="req">*</span></label>
          <textarea class="field" id="acc"></textarea>
        </div>

        <div class="group">
          <label>Blockers</label>
          <textarea class="field" id="block"></textarea>
        </div>

        <div class="group">
          <label>Current Focus</label>
          <textarea class="field" id="focus"></textarea>
        </div>

        <div class="actions">
          <button class="btn" id="cancel" type="button">Cancel</button>
          <button class="btn btn-primary" id="insert" type="button" disabled>Insert</button>
        </div>

        <div class="note">You can insert Files and Mentions after inserting this template.</div>
      </div>
    `;

    const overlay = shadow.querySelector(".overlay");
    const paletteEl = shadow.getElementById("palette");
    const labelInput = shadow.getElementById("label");
    const numberInput = shadow.getElementById("number");
    const accInput = shadow.getElementById("acc");
    const insertBtn = shadow.getElementById("insert");

    const allColors = [...strongOrder, ...mutedOrder];
    let selected = "blue-strong";

    function renderPalette() {
      paletteEl.innerHTML = "";
      allColors.forEach(name => {
        const sw = document.createElement("button");
        sw.type = "button";
        sw.className = "swatch" + (name === selected ? " selected" : "");
        sw.title = name;
        sw.setAttribute("aria-label", name);
        sw.style.background = bannerPalette[name] || "#999";
        sw.onclick = () => {
          selected = name;
          renderPalette();
          validate();
        };
        paletteEl.appendChild(sw);
      });
    }

    renderPalette();

    function formatNumber(n) { return n < 10 ? "0" + n : String(n); }

    function clampInt(v) {
      const n = parseInt(String(v).replace(/\D+/g, ""), 10);
      return Number.isFinite(n) ? Math.max(1, n) : 1;
    }

    shadow.getElementById("inc").onclick = () => {
      const n = clampInt(numberInput.value) + 1;
      numberInput.value = formatNumber(n);
      validate();
    };

    shadow.getElementById("dec").onclick = () => {
      const n = Math.max(1, clampInt(numberInput.value) - 1);
      numberInput.value = formatNumber(n);
      validate();
    };

    numberInput.addEventListener("input", () => {
      const n = clampInt(numberInput.value);
      numberInput.value = formatNumber(n);
      validate();
    });

    function validate() {
      const ok = !!labelInput.value.trim() && !!accInput.value.trim() && !!numberInput.value.trim();
      insertBtn.disabled = !ok;
    }

    labelInput.addEventListener("input", validate);
    accInput.addEventListener("input", validate);
    validate();

    overlay.onclick = close;
    shadow.getElementById("cancel").onclick = close;

    host.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, true);

    labelInput.focus();

    shadow.getElementById("insert").onclick = () => {
      const data = {
        label: labelInput.value.trim().toUpperCase() || "DESIGN UPDATE",
        number: numberInput.value.trim() || "01",
        status: shadow.getElementById("status").value,
        accomplishments: accInput.value.split("\n").map(s => s.trim()).filter(Boolean),
        blockers: shadow.getElementById("block").value.split("\n").map(s => s.trim()).filter(Boolean),
        focus: shadow.getElementById("focus").value.split("\n").map(s => s.trim()).filter(Boolean),
        bannerColor: selected
      };

      editor.innerHTML = "";
      simulatePaste(editor, buildHTML(data));
      close();
    };
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;

    const editor = getVisibleEditor();
    if (!editor) return;

    const text = editor.innerText.trim();

    if (text === TRIGGER) {
      e.preventDefault();
      openModal(editor);
    }
  });

})();
