# Puter AI Chat App – UI/UX & Performance Improvement Plan

## 1. Performance: Button Slowness on App Launch
- **Audit event listeners**: Check for redundant or repeated event listener attachments in script.js, especially on buttons.
- **Optimize DOM queries**: Cache DOM lookups and avoid repeated queries in initialization.
- **Defer heavy logic**: Move non-critical initialization to after UI is interactive.
- **Profile with browser dev tools**: Identify bottlenecks on launch and optimize accordingly.

---

## 2. Settings Popup Improvements

### a. Hide Scrollbars
- **CSS**: Add/adjust `overflow-y: auto; scrollbar-width: none;` and `::-webkit-scrollbar { display: none; }` for `.popup-content-area` and settings panels.

### b. Models Tab
- **Remove "Close" button**: Delete the close button from the Models tab.
- **"Save Model Selection" button always visible**: Move/save button to bottom of popup, styled as primary action.
- **Ensure Save button closes popup after saving** (optional for UX).

### c. UI Tab
- **Hide scrollbars**: Same as above.
- **Remove "Close" button**: Delete the close button from the UI tab.
- **"Save UI Selection" button always visible**: Move/save button to bottom of popup.
- **Text Size slider live update**: Make text size change as slider moves (already partially implemented, ensure it's smooth and instant).

### d. Add Audio/Video Tab
- **Insert between UI and About tabs**.
- **Tab Content**:
  - Dropdown: "Voice" (for TTS voice selection).
  - Language select:
    ```html
    <select id="language-select">
      <option value="en-US">English (US)</option>
      <option value="fr-FR">French</option>
      <option value="de-DE">German</option>
      <option value="es-ES">Spanish</option>
      <option value="it-IT">Italian</option>
    </select>
    ```
  - "Save Audio/Video Selection" button always visible at bottom.
- **Hide scrollbars**: As above.
- **Remove "Close" button**: Do not include a close button in this tab.
- **On save**: Store selected language/voice in settings and use for TTS.

---

## 3. UI Popups (General)
- **Hide scrollbars**: Apply to all popups as needed.
- **Remove "Close" button**: Remove from all relevant popups.
- **"Save" buttons always visible**: For each popup with a save action, ensure the save button is always present at the bottom, replacing the close button.

---

## 4. Vision Popup
- **Flip Camera Button**: If device has >1 camera, show a "Flip Camera" button to switch between front/rear.
- **Resizable Video Preview**: Allow user to drag to resize the video preview box (implement with mouse/touch events on the container).

---

## 5. TTS Popup & Main UI Mic
- **Mic Button Glow**: When mic is active, glow the mic icon/button red (`.recording` class).
- **Mic Toggle**: Clicking active mic button again deactivates mic and resets icon.
- **TTS Popup**: Same logic for TTS mic button.

---

## 6. Header & Main UI Adjustments
- **Username & Sign Out Button**: Match widths for username container and sign out button (CSS: set same width or use flex).
- **Remove "Puter AI Chat App" Text**: Delete the `<h1>` from main UI.

---

## 7. Implementation Steps

1. **Performance**: Audit and optimize JS initialization.
2. **Settings Popup**: Update HTML structure, move/remove buttons, add Audio/Video tab, update JS for new tab logic and settings storage.
3. **UI Popups**: Remove close buttons, ensure save buttons are always visible, hide scrollbars via CSS.
4. **Vision Popup**: Add flip camera logic (JS), make video preview resizable (JS/CSS).
5. **TTS & Mic**: Update JS to glow mic buttons when active, reset on toggle.
6. **Header/UI**: Adjust CSS for username/sign out width, remove h1.
7. **Test**: Verify all changes, cross-browser, and on devices with multiple cameras/mics.

---

## 8. Files to Update

- `index.html`: Popup/tab structure, button placement, Audio/Video tab.
- `script.js`: Event logic, performance, mic/camera, tab switching, TTS/voice, settings storage.
- `style.css`: Scrollbar hiding, button styles, header layout, popup adjustments.

---

## 9. Notes

- Use feature detection for camera/mic capabilities.
- Ensure accessibility for all new controls.
- Test on both desktop and mobile browsers.
