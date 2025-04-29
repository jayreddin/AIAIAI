# Plan for UI and Functional Enhancements

## 1. Fix Button Slowness
- **Issue:** Buttons are slow to respond when the app is launched.
- **Solution:**
  - Optimize event listeners by ensuring they are added only once.
  - Use `debounce` or `throttle` for high-frequency events.
  - Profile the app to identify performance bottlenecks.

## 2. Settings Popup Enhancements
- **Hide Scrollbars:**
  - Apply CSS to hide scrollbars while maintaining scrollability.
- **Models Tab:**
  - Remove the "Close" button.
  - Ensure the "Save Model Selection" button is always visible in place of the "Close" button.
- **UI Tab:**
  - Remove the "Close" button.
  - Ensure the "Save UI Selection" button is always visible in place of the "Close" button.
  - Make the Text Size slider dynamically adjust text size as the user interacts with it.
- **Add Audio/Video Tab:**
  - Add a new tab between "UI" and "About".
  - Include a dropdown for voice selection:
    ```html
    <select id="language-select">
        <option value="en-US">English (US)</option>
        <option value="fr-FR">French</option>
        <option value="de-DE">German</option>
        <option value="es-ES">Spanish</option>
        <option value="it-IT">Italian</option>
    </select>
    ```
  - Add a "Save Audio/Video Selection" button that replaces the "Close" button.
  - Save the selected voice as the new TTS voice.

## 3. Vision Popup Enhancements
- **Flip Camera Button:**
  - Add a button to flip the camera if the device has multiple cameras.
- **Resizable Video Preview:**
  - Allow the user to drag and resize the video preview display box.

## 4. TTS Popup Enhancements
- **Mic Button Glow:**
  - When the mic is active, make the mic icon button glow red.
  - When the mic is deactivated, reset the icon to its normal state.

## 5. Main UI Enhancements
- **Mic Button Glow:**
  - When the mic is active, make the mic icon button glow red.
  - When the mic is deactivated, reset the icon to its normal state.
- **Header Username and Sign Out Button:**
  - Match the width of the username container and the sign-out button.
- **Remove Header Text:**
  - Remove the "Puter AI Chat App" text from the header.