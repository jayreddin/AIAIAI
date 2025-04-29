// Core UI Elements and State Management

// Convert static DOM element references to getters to ensure retrieval after DOM is ready
export const elements = {
    // Auth Elements
    get signInButton() { return document.getElementById('signin-button'); },
    get signOutButton() { return document.getElementById('signout-button'); },
    get authStatusDiv() { return document.getElementById('auth-status'); },
    get authSectionDiv() { return document.getElementById('auth-section'); },
    get usernameDisplay() { return document.getElementById('username-display'); },

    // Chat Elements
    get chatUiDiv() { return document.getElementById('chat-ui'); },
    get chatInput() { return document.getElementById('chat-input'); },
    get sendButton() { return document.getElementById('send-button'); },
    get messageDisplay() { return document.getElementById('message-display'); },
    get modelSelector() { return document.getElementById('model-selector'); },
    get micButton() { return document.getElementById('mic-button'); },

    // Banner Elements
    get bannerButtons() {
        return {
            newChat: document.getElementById('new-chat-btn'),
            history: document.getElementById('history-btn'),
            imgGen: document.getElementById('img-gen-btn'),
            ocr: document.getElementById('ocr-btn'),
            vision: document.getElementById('vision-btn'),
            tts: document.getElementById('tts-btn'),
            settings: document.getElementById('settings-btn')
        };
    },

    // History Elements
    get historyList() { return document.getElementById('history-list'); },

    // Common Popup Elements
    get popupBackdrop() { return document.getElementById('popup-backdrop'); },
    get popups() {
        return {
            history: document.getElementById('history-popup'),
            imgGen: document.getElementById('img-gen-popup'),
            ocr: document.getElementById('ocr-popup'),
            vision: document.getElementById('vision-popup'),
            tts: document.getElementById('tts-popup'),
            settings: document.getElementById('settings-popup')
        };
    }
};

// UI State
export const state = {
    isChatInitialized: false,
    activePopup: null,
    currentImageGenMode: 'basic',
    defaultUISettings: { theme: 'light', textSize: 100 },
    currentUISettings: { theme: 'light', textSize: 100 },
    selectedModel: 'gpt-4o-mini',
    allowedModels: []
};

// UI Utility Functions
export function createActionButton(title, iconClass) {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.title = title;
    const icon = document.createElement('i');
    icon.className = iconClass;
    button.appendChild(icon);
    return button;
}

// Chat Input Management
export function initializeChatInput(chatInput, sendMessage, getSelectedModel, getAllowedModels) {
    if (!chatInput) return;

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        const scrollHeight = chatInput.scrollHeight;
        const maxHeight = 100;
        requestAnimationFrame(() => {
            chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px';
        });
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(getSelectedModel(), getAllowedModels());
        }
    });

    // Also wire up the send button
    if (elements.sendButton) {
        elements.sendButton.addEventListener('click', () => {
            sendMessage(getSelectedModel(), getAllowedModels());
        });
    }
}

// Theme Management
export function applyUISettings(settings) {
    if (!settings) return;
    state.currentUISettings = settings;

    // Apply Theme
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${settings.theme || 'light'}`);
    console.log(`Applied theme: ${settings.theme || 'light'}`);

    // Apply Text Size
    const multiplier = (settings.textSize || 100) / 100;
    document.body.style.setProperty('--base-font-size-multiplier', multiplier);
    console.log(`Applied text size multiplier: ${multiplier}`);
}

// Popup Management
export function showPopup(popupId) {
    const popup = elements.popups[popupId];
    if (popup && elements.popupBackdrop) {
        closeActivePopup();
        popup.style.display = 'flex';
        elements.popupBackdrop.style.display = 'block';
        state.activePopup = popup;
        console.log(`Showing popup: ${popupId}`);
        popup.dispatchEvent(new CustomEvent('show'));
    } else {
        console.error(`Popup element '${popupId}' or backdrop missing.`);
    }
}

export function closeActivePopup() {
    if (state.activePopup && elements.popupBackdrop) {
        state.activePopup.style.display = 'none';
        elements.popupBackdrop.style.display = 'none';
        console.log(`Closing popup: ${state.activePopup.id}`);
        state.activePopup = null;
    }
}