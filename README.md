# ClickUp Task Update Template

Userscript that opens a modal in ClickUp when you type `--update` and press space, then inserts a formatted task update template.

## What's New

### 11.0.0 (2026-02-20)
- Added dynamic label suggestion chips from a centralized list in `src/suggestion-chips.js`.
- Added new label chips: `Dev Beta Update` and `Dev Gold Update`.
- Updated Notes behavior to support both add and remove:
  - `Add Notes` shows the notes field.
  - `Remove Notes` hides the notes field and clears its content.
- Notes are now excluded from the inserted output when notes are removed.
- Bumped script version to major release `11.0.0`.