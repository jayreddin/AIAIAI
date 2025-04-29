// UI and Banner/Popup Initialization Logic

import { elements, showPopup, closeActivePopup } from './ui.js';
import { initializeTTSListeners } from './features/tts.js';
import { initializeOcrPopup } from './features/ocr.js';
import { initializeImageGenPopup } from './features/imagegen.js';
import { initializeVisionPopup } from './features/vision.js';
import { loadModelSettings, populateSettingsModelsList } from './settings.js';
import { displayMessage } from './chat.js';

export function initializeBannerAndPopups() {
    // Banner button to popup mapping
    const buttonPopupMap = {
        'history-btn': 'history',
        'img-gen-btn': 'imgGen',
        'ocr-btn': 'ocr',
        'vision-btn': 'vision',
        'tts-btn': 'tts',
        'settings-btn': 'settings'
    };

    for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) {
        const button = document.getElementById(buttonId);
        if (button && !button.getAttribute('data-popup-listener-added')) {
            button.addEventListener('click', () => {
                showPopup(popupId);

                const targetPopup = elements.popups[popupId];
                // Initialize listeners *once* when the popup is first shown
                if (targetPopup && !targetPopup.getAttribute('data-show-listener-added')) {
                    targetPopup.addEventListener('show', () => {
                        if (popupId === 'tts') initializeTTSListeners();
                        else if (popupId === 'imgGen') initializeImageGenPopup();
                        else if (popupId === 'ocr') initializeOcrPopup();
                        else if (popupId === 'vision') initializeVisionPopup();
                        else if (popupId === 'settings') populateSettingsModelsList();
                    }, { once: true });
                    targetPopup.setAttribute('data-show-listener-added', 'true');
                }
            });
            button.setAttribute('data-popup-listener-added', 'true');
        }
    }

    // New Chat button
    const newChatBtn = elements.bannerButtons.newChat;
    if (newChatBtn && !newChatBtn.getAttribute('data-newchat-listener-added')) {
        newChatBtn.addEventListener('click', () => {
            closeActivePopup();
            displayMessage('New chat started.', 'system');
            if (elements.messageDisplay) elements.messageDisplay.innerHTML = '';
        });
        newChatBtn.setAttribute('data-newchat-listener-added', 'true');
    }

    // Popup backdrop click closes popup
    if (elements.popupBackdrop && !elements.popupBackdrop.getAttribute('data-backdrop-listener-added')) {
        elements.popupBackdrop.addEventListener('click', closeActivePopup);
        elements.popupBackdrop.setAttribute('data-backdrop-listener-added', 'true');
    }

    // All close buttons in popups
    const closeButtons = document.querySelectorAll('.close-popup-btn');
    closeButtons.forEach(button => {
        const parentPopup = button.closest('.popup');
        if (parentPopup && !button.getAttribute('data-close-listener-added')) {
            button.addEventListener('click', closeActivePopup);
            button.setAttribute('data-close-listener-added', 'true');
        }
    });
}