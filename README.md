# ClickUp Task Update Template

Userscript that opens a modal in ClickUp using a configurable trigger, then inserts a formatted task update template.

## What's New

### 15.0.61 (2026-02-22)
- Radio UX enhancements:
  - Added `Shuffle` button in radio channel navigation.
  - Radio station dropdown now sorts alphabetically at runtime.
  - Added dedicated `Pulse` section on the Radio page.
  - Added `Pulse strength` control (0–200), visible only in Party Mode.
- Party Mode visual/audio responsiveness improvements:
  - Modal pulse now follows waveform-derived hit/drum telemetry instead of raw packet frequency.
  - Added stronger drum-hit emphasis and subtler non-drum pulse behavior.
  - Added party tint behavior for radio channel/pulse section border and background.
  - Added Party Mode cursor parallax: modal gently nudges/tilts with pointer position and eases back on leave.
- Radio data/content updates:
  - Added additional Laut.fm channels and Savage stream normalization compatibility.
  - Renamed station label from `9J-Pop Powerplay` to `J-Pop Powerplay`.
- Infrastructure and template updates:
  - Added/expanded waveform preview integration for radio page templates and local sandbox.
  - Updated userscript metadata/resource integrations and bumped version to `15.0.61`.

### 15.0.0 (2026-02-21)
- Major settings and UX expansion across modal pages, including:
  - New `Radio` page for music/SFX controls.
  - New `Usage` page and richer `About` references/tools section.
  - Split settings sections and templates with additional runtime safety fallbacks.
- Added custom expression editor upgrades:
  - Contenteditable-style expression workflow, inline AI actions, evaluate/save flow.
  - Word wrap control and improved monospace/syntax presentation behavior.
  - Better invalid-expression handling and keybind safety behavior.
- Added broader audio system features:
  - Radio channel selector with prev/next controls and provider options.
  - Ambient noise layers (additive, per-layer volume, emoji toggles).
  - `Keep Radio on` option for background listening after modal close.
  - Expanded SFX behavior and party mode audio/visual effects tuning.
- Added stronger accessibility and theming polish:
  - Better color-vision support across status/subtext/tooltips.
  - Density/font-scale propagation to more UI elements.
  - Consistent accent/themed values for controls and tooltips.
- Added party-mode improvements:
  - Reduced lag by shifting to animation-driven behavior where applicable.
  - Beat/visualizer-driven modal pulse with tuned subtle scaling.
  - Konami overlay/key feedback enhancements.
- Added interaction/layout updates:
  - Sidebar collapse now extends main content area.
  - Footer alignment/persistence refinements.
  - Dropdown and menu animation/positioning fixes.
  - Multiple control sizing updates for spacious density mode.
- Bumped script version to major release `15.0.0`.

### 14.3.1 (2026-02-20)
- Fixed settings switch scroll jumps by anchoring the current section during updates.
- Added pill styling for tooltip values/shortcuts and added lo-fi volume value to tooltip.
- Added a `Version History` button in the About page linking to the README.
- Bumped script version to `14.3.1`.

### 14.3.0 (2026-02-20)
- Split modal markup into separate resource pages under `pages/`:
  - `modal-shell.html`
  - `editor.html`
  - `settings.html`
  - `variables.html`
  - `drafts.html`
  - `about.html`
- Added runtime template assembly in `src/get-modal-template.js` (with legacy fallback support).
- Added `Drafts` page support and action-row controls (`Save as Draft`, `Copy as innerHTML`).
- Reworked color-vision support away from hue-rotate filters into semantic, mode-specific palettes.
- Updated status/badge/picker colors to follow color-vision modes consistently.
- Added OKLCH-capable color tokens where supported for a more robust color system.
- Added separate typography controls in Settings:
  - `UI Font Size`
  - `Editor Font Size`
- Added trigger customization in Settings:
  - Custom `Trigger Text`
  - Slash (`/`) validation with error messaging due to ClickUp keybind conflicts
  - Activation mode toggle: trigger on `Space` or immediately after the last trigger character
- Updated bootstrap trigger detection to use saved settings dynamically.
- Updated settings persistence shape and key usage to `clickup-update-modal.settings.v4`.
- Bumped script version to `14.3.0`.

### 14.2.0 (2026-02-20)
- Refactored modal layout into left-sidebar page navigation with 4 pages:
  - `Editor`
  - `Settings`
  - `Variables`
  - `About`
- Added a top-right `X` close button and removed the footer `Cancel` button.
- Updated the Settings header button to behave as a real toggle state.
- Moved About content to the bottom-most page (`About`).
- Simplified density controls by removing `Custom` density scale and keeping `Compact`, `Comfortable`, and `Spacious`.
- Unified banner field label styling with the rest of the form labels.
- Restored modal body vertical scrolling while textareas auto-grow.
- Updated local settings storage key to `v2` to align with the new page/settings model.
- Bumped script version to `14.2.0`.

### 14.1.0 (2026-02-20)
- Moved label suggestion chips back into the main form below the label field.
- Moved the feedback text/link (`Have any suggestions and bug reports?`) into the Settings sidebar.
- Fixed light mode number editor visibility by forcing dark text/caret colors.
- Updated density controls to include `Compact`, `Comfortable`, `Spacious`, and `Custom`.
- Added custom density scale input for `Custom` mode (`1x` to `6x` integer range).
- Applied color blindness filters to the banner color popover for consistency.
- Removed modal close-on-outside-click behavior.
- Added textarea auto-resize behavior for `Accomplishments`, `Blockers`, `Current Focus`, and `Notes`.
- Refined sidebar collapse animation with fade/visibility/overflow containment to reduce content glitching.
- Bumped script version to `14.1.0`.

### 14.0.0 (2026-02-20)
- Fixed sidebar collapse behavior so collapsing settings now animates and the modal card resizes with it.
- Updated density controls to integer scale options: `1x`, `2x`, `3x`.
- Moved label suggestions into the Settings panel (`Suggestions` section).
- Moved credit/version text into the Settings panel (`About` section).
- Updated color-blindness mode behavior so inserted status badges are filtered consistently in generated content.
- Refined chip scroller visuals:
  - Transparent/un-styled chip container.
  - Scrollbar hidden by default and visible on hover without layout shift.
- Bumped script version to major release `14.0.0`.

### 13.0.0 (2026-02-20)
- Added a collapsible settings sidebar directly inside the update modal.
- Added persistent modal settings (saved in browser local storage):
  - Theme mode: `Light`, `Auto`, `Dark`.
  - Density mode for section spacing: `Compact`, `Comfortable`, `Spacious`.
  - Color blindness display filters applied to the whole modal card.
  - Editor font size controls:
    - Stepped slider for quick sizing.
    - Numeric text box for precise values (clamped to the slider min/max range).
- Added live auto-theme behavior that follows system theme changes while the modal is open.
- Added a new Variables settings section as TODO while mentions/emoji formatting behavior is being finalized for the editor.
- Bumped script version to major release `13.0.0`.

### 12.0.0 (2026-02-20)
- Added a more expressive status select interaction:
  - Lively pop-in animation for the status picker panel.
  - Animated trigger bounce and icon motion when opening.
- Modal can now be dismissed by clicking outside the modal card (backdrop click).
- Label suggestion chips are now single-line and horizontally scrollable.
  - Mouse-wheel vertical scrolling now moves chips horizontally.
  - Soft edge gradients appear on clipped sides and alternate as you scroll.
- Chip scroller now uses clipped rounded edges (`clip-path`) so scrollbar visuals stay contained to the shape.
- Redesigned scrollbars for the modal, notes/accomplishment textareas, and chip scroller.
- Added Google Fonts preconnect/stylesheet loading in-app and updated typography:
  - UI text: `Inter` (with `Google Sans` fallback).
  - Text inputs and textareas: `JetBrains Mono` (with monospace fallbacks).
- Bumped script version to major release `12.0.0`.

### 11.0.0 (2026-02-20)
- Added dynamic label suggestion chips from a centralized list in `src/suggestion-chips.js`.
- Added new label chips: `Dev Beta Update` and `Dev Gold Update`.
- Updated Notes behavior to support both add and remove:
  - `Add Notes` shows the notes field.
  - `Remove Notes` hides the notes field and clears its content.
- Notes are now excluded from the inserted output when notes are removed.
- Bumped script version to major release `11.0.0`.
