// ==UserScript==
// @name         ClickUp --update Modal
// @namespace    clickup-update-modal
// @version      14.3.1
// @description  Insert update template in ClickUp
// @match        https://app.clickup.com/*
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @connect      ec3.yesstreaming.net
// @resource     rootCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/root.css
// @resource     modalMotionCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/animations/motion.css
// @resource     modalCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/modal.css
// @resource     modalInputsCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/inputs.css
// @resource     modalButtonsCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/buttons.css
// @resource     modalSelectsCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/selects.css
// @resource     modalBannerCss https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/styles/banner.css
// @resource     modalShellTemplate https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/modal-shell.html
// @resource     modalPageEditor https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/editor.html
// @resource     modalPageSettings https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/index.html
// @resource     modalPageSettingsAnchorRail https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/anchor-rail.html
// @resource     modalPageSettingsSectionTrigger https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-trigger.html
// @resource     modalPageSettingsSectionAppearance https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-appearance.html
// @resource     modalPageSettingsSectionTypography https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-typography.html
// @resource     modalPageSettingsSectionOverlay https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-overlay.html
// @resource     modalPageSettingsSectionAudio https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-audio.html
// @resource     modalPageSettingsSectionAccessibility https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-accessibility.html
// @resource     modalPageSettingsSectionAnimation https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/settings/section-animation.html
// @resource     modalPageVariables https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/variables.html
// @resource     modalPageDrafts https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/drafts.html
// @resource     modalPageAbout https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/pages/about.html
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/constants.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/suggestion-chips.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/get-modal-css.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/get-modal-template.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/get-visible-editor.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/simulate-paste.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/build-html.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/is-popover-open.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/create-modal-markup.js
// @require      https://raw.githubusercontent.com/eliogos/clickup-task-update-template/main/src/modal-physics.js
// @require      https://cdn.jsdelivr.net/npm/mathjs@12.4.2/lib/browser/math.js
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

