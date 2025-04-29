// Puter AI Chat App Entrypoint (Modular)
// Import all modules and initialize the app

import { elements, applyUISettings, state } from './js/ui.js';
import { initializeChatInput } from './js/ui.js';
import { displayMessage, sendMessage } from './js/chat.js';
import { loadModelSettings, loadUISettings, getAllowedModels } from './js/settings.js';
import { initializeBannerAndPopups } from './js/ui-init.js';
import { updateUiForAuthState, handleSignIn, handleSignOut } from './js/auth.js';

// Optionally import other modules as needed

console.log("Puter AI Chat App script loaded (modular).");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded.");
    applyUISettings({ theme: 'light', textSize: 100 });

    // Wait for Puter SDK to be ready, then initialize auth and UI
    function waitForPuterSDK(retry = 0) {
        if (typeof puter === 'undefined' || !puter.auth) {
            if (retry < 10) {
                setTimeout(() => waitForPuterSDK(retry + 1), 200 * (retry + 1));
            } else {
                if (elements.authStatusDiv) elements.authStatusDiv.textContent = "Error: SDK failed to load.";
                if (elements.signInButton) elements.signInButton.disabled = true;
            }
            return;
        }

        // Attach sign in/out listeners
        if (elements.signInButton) {
            elements.signInButton.addEventListener('click', async () => {
                const signedIn = await handleSignIn(elements.authStatusDiv, elements.signInButton);
                await afterAuth(Boolean(signedIn));
            });
        }
        if (elements.signOutButton) {
            elements.signOutButton.addEventListener('click', () => {
                handleSignOut(elements);
                updateUiForAuthState(false, elements);
            });
        }

        // Initial auth check
        let isSignedIn = false;
        try {
            isSignedIn = puter.auth.isSignedIn();
        } catch (e) {
            isSignedIn = false;
        }
        afterAuth(isSignedIn);
    }

    async function afterAuth(isSignedIn) {
        await updateUiForAuthState(isSignedIn, elements);
        if (isSignedIn) {
            await loadUISettings();
            // Load allowed models and update state
            state.allowedModels = await loadModelSettings();
            // Set up model selector change
            if (elements.modelSelector) {
                elements.modelSelector.addEventListener('change', (e) => {
                    state.selectedModel = e.target.value;
                });
                // Set initial selected model
                state.selectedModel = elements.modelSelector.value || 'gpt-4o-mini';
            }
            // Initialize chat input and send button
            if (elements.chatInput && sendMessage) {
                initializeChatInput(
                    elements.chatInput,
                    sendMessage,
                    () => state.selectedModel,
                    () => state.allowedModels
                );
            }
            initializeBannerAndPopups();
            displayMessage('Welcome to Puter AI Chat!', 'system');
        }
    }

    waitForPuterSDK();
});
