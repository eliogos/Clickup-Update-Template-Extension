// ==UserScript==
// @name         ClickUp --update Modal
// @namespace    clickup-update-modal
// @version      10.25
// @description  Insert update template in ClickUp
// @match        https://app.clickup.com/*
// @grant        GM_getResourceText
// @resource     modalCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/modal.css
// @resource     modalInputsCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/inputs.css
// @resource     modalButtonsCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/buttons.css
// @resource     modalSelectsCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/selects.css
// @resource     modalBannerCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/banner.css
// @resource     modalTemplate https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/templates/modal.html
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/constants.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/get-modal-css.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/get-modal-template.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/get-visible-editor.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/simulate-paste.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/build-html.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/is-popover-open.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/create-modal-markup.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/open-modal.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/bootstrap.js
// @updateURL    https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/script.user.js
// @downloadURL  https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/script.user.js
// ==/UserScript==

(function () {
  "use strict";

  const app = globalThis.ClickUpUpdateApp;
  if (app && typeof app.bootstrap === "function") {
    app.bootstrap();
  }
})();
