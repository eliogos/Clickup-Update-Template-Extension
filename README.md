# ClickUp Task Update Template

Userscript that opens a modal in ClickUp when you type `--update` and press space, then inserts a formatted task update template.

## What's New

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
