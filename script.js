// Puter AI Chat App Logic
console.log("Puter AI Chat App script loaded.");

// Import new features module
import { NewFeatures } from './modules/new-features.js';

// --- DOM Elements ---
const signInButton = document.getElementById('signin-button');
const signOutButton = document.getElementById('signout-button');
const authStatusDiv = document.getElementById('auth-status');
const authSectionDiv = document.getElementById('auth-section');
const chatUiDiv = document.getElementById('chat-ui');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const messageDisplay = document.getElementById('message-display');
const modelSelector = document.getElementById('model-selector');
const usernameDisplay = document.getElementById('username-display');
const historyList = document.getElementById('history-list');

// Phase 6 Elements
const popupBackdrop = document.getElementById('popup-backdrop');
const bannerButtons = {
    newChat: document.getElementById('new-chat-btn'),
    history: document.getElementById('history-btn'),
    imgGen: document.getElementById('img-gen-btn'),
    ocr: document.getElementById('ocr-btn'),
    vision: document.getElementById('vision-btn'),
    tts: document.getElementById('tts-btn'),
    settings: document.getElementById('settings-btn')
};
const popups = {
    history: document.getElementById('history-popup'),
    imgGen: document.getElementById('img-gen-popup'),
    ocr: document.getElementById('ocr-popup'),
    vision: document.getElementById('vision-popup'),
    tts: document.getElementById('tts-popup'),
    settings: document.getElementById('settings-popup') // Added
};

// Phase 9 Elements (TTS)
const ttsTextInput = document.getElementById('tts-text-input');
const ttsSendButton = document.getElementById('tts-send-button');
const ttsMicButton = document.getElementById('tts-mic-button');
const ttsOutputArea = document.getElementById('tts-output-area');

// Phase 10 Elements (Main Chat Mic)
const micButton = document.getElementById('mic-button');

// Phase 11 & 13 Elements (Image Gen)
const imgGenModeButtonsContainer = document.getElementById('img-gen-modes');
const imgGenModePanelsContainer = document.getElementById('img-gen-mode-ui');
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModal = document.getElementById('image-modal');
const expandedImage = document.getElementById('expanded-image');
const imageModalSaveBtn = document.getElementById('image-modal-save');
const imageModalCloseBtn = document.getElementById('image-modal-close');
let imgGenPrompt = document.getElementById('img-gen-prompt');
let imgGenGenerateBtn = document.getElementById('img-gen-generate-btn');
const imgGenResults = document.getElementById('img-gen-results');
const imgGenLoading = document.getElementById('img-gen-loading');
const imgGenError = document.getElementById('img-gen-error');
let imgGenSizeSelect = null; // Initialize as null, will be created dynamically
let imgGenAmountSelect = null; // Initialize as null, will be created dynamically
const storyCharactersInput = document.getElementById('story-characters');
const storySettingInput = document.getElementById('story-setting');
const storyPlotInput = document.getElementById('story-plot');
const storyGenerateBtn = document.getElementById('story-generate-btn');
const storyDownloadBtn = document.getElementById('story-download-btn');
const storyOutputArea = document.getElementById('story-output');
const cardTypeSelect = document.getElementById('card-type');
const cardVisualDescInput = document.getElementById('card-visual-desc-input');
const cardGenerateImgBtn = document.getElementById('card-generate-img-btn');
const cardSearchImgBtn = document.getElementById('card-search-img-btn');
const cardImagePreviewArea = document.getElementById('card-image-preview-area');
const cardImageLoading = document.getElementById('card-image-loading');
const cardImageSearchResults = document.getElementById('card-image-search-results');
const cardSelectedImageDisplay = document.getElementById('card-selected-image-display');
const cardSelectedImageThumb = document.getElementById('card-selected-image-thumb');
const cardRecipientInput = document.getElementById('card-recipient');
const cardMessageInput = document.getElementById('card-message');
const cardSenderInput = document.getElementById('card-sender');
const cardSizeSelect = document.getElementById('card-size');
const cardCustomSizeInputs = document.getElementById('card-custom-size-inputs');
const cardCustomWidthInput = document.getElementById('card-custom-width');
const cardCustomHeightInput = document.getElementById('card-custom-height');
const cardGenerateBtn = document.getElementById('card-generate-btn');
const cardDownloadBtn = document.getElementById('card-download-btn');
const comicCharactersInput = document.getElementById('comic-characters');
const comicPlotInput = document.getElementById('comic-plot');
const comicSettingInput = document.getElementById('comic-setting');
const comicGenerateBtn = document.getElementById('comic-generate-btn');
const comicDownloadBtn = document.getElementById('comic-download-btn');
const comicOutputArea = document.getElementById('comic-output');

// Phase 12 Elements (OCR)
const ocrFileInput = document.getElementById('ocr-file-input');
const ocrUploadBtn = document.getElementById('ocr-upload-btn');
const ocrThumbnailArea = document.getElementById('ocr-thumbnail-area');
const ocrExtractBtn = document.getElementById('ocr-extract-btn');
const ocrResultText = document.getElementById('ocr-result-text');
const ocrCopyBtn = document.getElementById('ocr-copy-btn');
const ocrStatus = document.getElementById('ocr-status');

// Phase 13 Elements (Vision)
const visionEnableCamBtn = document.getElementById('vision-enable-cam-btn');
const visionVideoContainer = document.getElementById('vision-video-container');
const visionVideoPreview = document.getElementById('vision-video-preview');
const visionControls = document.getElementById('vision-controls');
const visionDescribeBtn = document.getElementById('vision-describe-btn');
const visionStopCamBtn = document.getElementById('vision-stop-cam-btn');
const visionStatus = document.getElementById('vision-status');
const visionResultsText = document.getElementById('vision-results-text');
const visionActions = document.getElementById('vision-actions');
const visionClearBtn = document.getElementById('vision-clear-btn');
const visionSpeakBtn = document.getElementById('vision-speak-btn');
const visionCopyBtn = document.getElementById('vision-copy-btn');
const visionSaveImgBtn = document.getElementById('vision-save-img-btn');
const visionFlipCamBtn = document.getElementById('vision-flip-cam-btn');

// Phase 14 Elements (Settings)
const settingsTabsContainer = document.getElementById('settings-tabs');
const settingsTabContentContainer = document.getElementById('settings-tab-content');
const settingsModelsPanel = document.getElementById('settings-models-panel');
const settingsModelsList = document.getElementById('settings-models-list');
const settingsModelsAllBtn = document.getElementById('settings-models-all');
const settingsModelsNoneBtn = document.getElementById('settings-models-none');
const settingsModelsSaveBtn = document.getElementById('settings-models-save');
const settingsModelsStatus = document.getElementById('settings-models-status');
const settingsUIPanel = document.getElementById('settings-ui-panel');
const settingsThemeSelect = document.getElementById('settings-theme-select');
const settingsTextSizeSlider = document.getElementById('settings-text-size');
const settingsTextSizeValue = document.getElementById('settings-text-size-value');
const settingsUISaveBtn = document.getElementById('settings-ui-save');
const settingsUIStatus = document.getElementById('settings-ui-status');
const settingsAboutPanel = document.getElementById('settings-about-panel');
const settingsAboutContent = document.getElementById('settings-about-content');

// Remove duplicate/old Card tab element declarations and update to match new HTML IDs
// const cardTitleInput = document.getElementById('card-title-input');
// const cardVisualDescInput = document.getElementById('card-visual-desc-input');
// const cardSearchImgBtn = document.getElementById('card-search-img-btn');
// const cardImageSearchResults = document.getElementById('card-image-search-results');
// const cardGenerateBtn = document.getElementById('card-generate-btn');
//const cardDownloadBtn = document.getElementById('card-download-btn');
const cardDataPrepared = document.getElementById('card-data-prepared');
const cardPreview = document.getElementById('card-preview');

// --- App State ---
let selectedModel = 'gpt-4o-mini';
let isChatInitialized = false;
let activePopup = null;
const historyKeyPrefix = 'chatHistory_';

// Recognition State
let chatRecognition;
let isChatMicRecording = false;
let ttsRecognition;
let isTTSDictating = false;

// Popup Listener States
let ttsListenersAdded = false;
let imgGenListenersAdded = false;
let ocrListenersAdded = false;
let visionListenersAdded = false;
let settingsListenersAdded = false; // Added

// Image Gen State
let currentImageGenMode = 'basic';
let cardSelectedImageUrl = null;

// OCR State
let ocrSelectedFile = null;

// Vision State
let visionStream = null;
let lastCapturedFrameDataUrl = null;
let visionCanvas = null;

// Settings State (Phase 14)
let allowedModels = []; // Will be loaded from KV or default
const defaultUISettings = { theme: 'light', textSize: 100 };
let currentUISettings = { ...defaultUISettings };

// --- Model List (Grouped) ---
const modelGroups = {
    "OpenAI": ['gpt-4o-mini', 'gpt-4o', 'o1', 'o1-mini', 'o1-pro', 'o3', 'o3-mini', 'o4-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview'],
    "Anthropic": ['claude-3-7-sonnet', 'claude-3-5-sonnet'],
    "Google": ['google/gemini-2.5-pro-exp-03-25:free', 'google/gemini-2.5-flash-preview', 'google/gemini-2.5-flash-preview:thinking', 'google/gemini-2.0-flash-lite-001', 'google/gemini-2.0-flash-thinking-exp:free', 'google/gemini-2.0-flash-001', 'google/gemini-2.0-flash-exp:free', 'gemini-2.0-flash', 'gemini-1.5-flash', 'google/gemma-2-27b-it'],
    "Meta": ['meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout', 'meta-llama/llama-3.3-70b-instruct', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'meta-llama/llama-guard-3-8b', 'meta-llama/llama-guard-2-8b'],
    "Mistral": ['mistral-large-latest', 'pixtral-large-latest', 'codestral-latest'],
    "xAI / Grok": ['grok-beta', 'x-ai/grok-3-beta'],
    "DeepSeek": ['deepseek-chat', 'deepseek-reasoner']
};

// --- Helper: Get All Models from Groups ---
function getAllModels() {
    return Object.values(modelGroups).flat();
}

// --- Authentication Logic ---
async function updateUiForAuthState(isSignedIn) {
    if (!authSectionDiv || !chatUiDiv) { console.error("Core UI missing."); return; }
    if (isSignedIn) {
        document.body.classList.add('signed-in');
        try {
            if (authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth missing.");
            const user = await puter.auth.getUser();
            if (authStatusDiv) authStatusDiv.textContent = ``; // Clear status text
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username;
                usernameDisplay.style.display = 'block';
            }
            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex';
            if (signOutButton) signOutButton.style.display = 'inline-block';
            console.log("User signed in:", user);
            await initializeAppState(); // Load settings and initialize AFTER sign-in
        } catch (error) {
            console.error("Sign-in update/fetch error:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign-in error: ${error.message || 'Unknown'}`;
            if (usernameDisplay) usernameDisplay.style.display = 'none';
            authSectionDiv.style.display = 'block';
            chatUiDiv.style.display = 'none';
            if (signOutButton) signOutButton.style.display = 'none';
        }
    } else {
        document.body.classList.remove('signed-in');
        if (authStatusDiv) authStatusDiv.textContent = 'Not signed in.';
        authSectionDiv.style.display = 'block';
        if (signInButton) { signInButton.disabled = false; signInButton.textContent = 'Sign In'; }
        chatUiDiv.style.display = 'none';
        if (signOutButton) signOutButton.style.display = 'none';
        if (usernameDisplay) usernameDisplay.style.display = 'none';
        isChatInitialized = false;
        closeActivePopup();
        if (isChatMicRecording) stopChatMicRecording();
        if (isTTSDictating) stopTTSDictation();
        // Reset UI settings to default on sign out? Or keep them? Let's keep them for now.
        // applyUISettings(defaultUISettings);
    }
}

// --- Sign In/Out Listeners ---
if (signInButton) {
    signInButton.addEventListener('click', async () => {
        // ... (Sign in logic remains the same)
         console.log("Sign in clicked");
        if (authStatusDiv) authStatusDiv.textContent = 'Signing in...';
        signInButton.disabled = true;
        signInButton.textContent = '...';
        try {
            if (!puter.auth) throw new Error("SDK/auth missing.");
            const signedIn = await puter.auth.signIn();
            console.log("signIn result:", signedIn);
            await updateUiForAuthState(Boolean(signedIn));
        } catch (error) {
            console.error("signIn error:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Error: ${error.message || 'Unknown'}`;
            signInButton.disabled = false;
            signInButton.textContent = 'Sign In';
            await updateUiForAuthState(false);
        }
    });
} else console.error("Sign In button missing!");

if (signOutButton) {
    signOutButton.addEventListener('click', () => {
        // ... (Sign out logic remains the same)
        console.log("Sign out clicked");
        try {
            if (!puter.auth) throw new Error("SDK/auth missing.");
            puter.auth.signOut();
            updateUiForAuthState(false);
            console.log("Signed out.");
            if (messageDisplay) messageDisplay.innerHTML = '';
            if (chatInput) chatInput.disabled = true;
            if (sendButton) sendButton.disabled = true;
        } catch (error) {
            console.error("Sign out error:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Error: ${error.message}`;
            updateUiForAuthState(false);
        }
    });
}

// --- Phase 4 & 14: Model Selection ---
// Now accepts a list of models to populate
function populateModelSelector(modelsToList = getAllModels()) {
    if (!modelSelector) { console.error("Model selector missing!"); return; }
    console.log(`Populating main model selector with ${modelsToList.length} models.`);
    modelSelector.innerHTML = ''; // Clear existing options
    let defaultModelStillAllowed = modelsToList.includes(selectedModel);

    // Add the current selection if it's no longer in the allowed list
    if (!defaultModelStillAllowed) {
        const opt = document.createElement('option');
        opt.value = selectedModel;
        let displayName = selectedModel.includes('/') ? selectedModel.split('/')[1] : selectedModel;
        displayName = displayName.replace(/:free|:thinking|-exp-[\d-]+/g, '');
        opt.textContent = `${displayName} (Not in Settings)`;
        opt.selected = true;
        opt.disabled = true; // Mark it as disabled
        modelSelector.appendChild(opt);
        console.warn(`Current model ${selectedModel} not in allowed list, added as disabled.`);
    }

    // Populate with allowed models, grouped
    for (const groupName in modelGroups) {
        const allowedGroupModels = modelGroups[groupName].filter(id => modelsToList.includes(id));
        if (allowedGroupModels.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            allowedGroupModels.forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                let displayName = id;
                if (displayName.includes('/')) displayName = displayName.split('/')[1];
                displayName = displayName.replace(/:free|:thinking|-exp-[\d-]+/g, '');
                opt.textContent = displayName;
                if (id === selectedModel && defaultModelStillAllowed) opt.selected = true;
                optgroup.appendChild(opt);
            });
            modelSelector.appendChild(optgroup);
        }
    }

    // Add listener if not already added
    if (!modelSelector.getAttribute('data-listener-added')) {
        modelSelector.addEventListener('change', (e) => {
            selectedModel = e.target.value;
            console.log(`Model changed: ${selectedModel}`);
            if (chatInput) chatInput.focus();
        });
        modelSelector.setAttribute('data-listener-added', 'true');
        console.log("Main Model selector listener added/verified.");
    }
}

// --- Phase 3 & 5: Chat Logic & Display ---
// ... (displayMessage, createActionButton, sendMessage remain largely the same) ...
function getModelIconClass(modelId) {
    if (!modelId) return 'fas fa-robot';
    if (modelId.includes('gpt') || modelId.includes('openai')) return 'fab fa-openai';
    if (modelId.includes('claude')) return 'fab fa-aws';
    if (modelId.includes('gemini') || modelId.includes('google')) return 'fab fa-google';
    if (modelId.includes('llama') || modelId.includes('meta')) return 'fas fa-hippo';
    if (modelId.includes('mistral') || modelId.includes('pixtral')) return 'fas fa-wind';
    if (modelId.includes('grok') || modelId.includes('x-ai')) return 'fas fa-brain';
    if (modelId.includes('deepseek')) return 'fas fa-search';
    return 'fas fa-robot';
}

function displayMessage(text, sender) {
    if (!messageDisplay) { console.error("Msg display missing!"); return; }
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sender === 'user' || sender === 'ai') {
        // Header row: name and timestamp
        const header = document.createElement('div');
        header.className = 'bubble-header';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'bubble-name';
        const timeSpan = document.createElement('span');
        timeSpan.className = 'bubble-timestamp';
        timeSpan.textContent = now;
        if (sender === 'user') {
            nameSpan.textContent = usernameDisplay?.textContent || 'User';
            header.appendChild(timeSpan); // timestamp left
            header.appendChild(nameSpan); // username right
            bubble.classList.add('user-bubble');
        } else {
            // Add model icon
            const icon = document.createElement('i');
            icon.className = getModelIconClass(selectedModel) + ' model-bubble-icon';
            nameSpan.appendChild(icon);
            nameSpan.appendChild(document.createTextNode(' ' + selectedModel));
            header.appendChild(nameSpan); // model left
            header.appendChild(timeSpan); // timestamp right
            bubble.classList.add('ai-bubble');
        }
        bubble.appendChild(header);
        // Message text
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    bubble.appendChild(content);
        // Actions
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        const resendBtn = createActionButton('Resend', 'fas fa-redo');
        const copyBtn = createActionButton('Copy', 'fas fa-copy');
        const delBtn = createActionButton('Delete', 'fas fa-trash');
        const speakBtn = createActionButton('Speak', 'fas fa-volume-up');
        actions.append(resendBtn, copyBtn, delBtn, speakBtn);
        bubble.appendChild(actions);
        resendBtn.onclick = () => resendMessage(text);
        copyBtn.onclick = () => copyMessage(text, content);
        delBtn.onclick = () => deleteMessage(bubble);
        speakBtn.onclick = (e) => speakMessage(text, e.currentTarget);
    } else {
        // System message (centered, no border)
        bubble.classList.add('system-bubble');
        bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : '';
        const sysContent = document.createElement('div');
        sysContent.className = 'message-content';
        sysContent.textContent = text;
        bubble.appendChild(sysContent);
    }
    messageDisplay.appendChild(bubble);
    requestAnimationFrame(() => {
        if (document.body.contains(messageDisplay)) messageDisplay.scrollTop = messageDisplay.scrollHeight;
    });
}

function createActionButton(title, iconClass) {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.title = title;
    const icon = document.createElement('i');
    icon.className = iconClass;
    button.appendChild(icon);
    return button;
}

async function sendMessage() {
    if (!requireSignIn()) return;
    if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; }
    const inputText = chatInput.value.trim();
    if (inputText === '') return;
    const currentInputText = inputText;
    if (!allowedModels.includes(selectedModel)) {
        const fallbackModel = allowedModels.includes('gpt-4o-mini') ? 'gpt-4o-mini' : (allowedModels[0] || null);
        if (fallbackModel) {
            selectedModel = fallbackModel;
            if (modelSelector) modelSelector.value = selectedModel;
        } else {
             displayMessage(`Error: No valid AI models are enabled in settings.`, 'system');
            return;
        }
    }
    displayMessage(currentInputText, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatInput.style.height = 'auto';
    chatInput.style.height = '30px';
    displayMessage(`AI (${selectedModel}) is thinking...`, 'system');
    try {
        if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat not available.");
        const response = await puter.ai.chat(currentInputText, { model: selectedModel });
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) messageDisplay.removeChild(loadingIndicator);
        let aiText = "Sorry, couldn't get response.";
        if (response && typeof response === 'string') aiText = response;
        else if (response?.text) aiText = response.text;
        else if (response?.message?.content) aiText = response.message.content;
        else if (response?.error) aiText = `Error: ${response.error.message || response.error}`;
        else console.warn("Unexpected response structure:", response);
        displayMessage(aiText, 'ai');
    } catch (error) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) messageDisplay.removeChild(loadingIndicator);
        let msg = error?.error?.message || error.message || 'Unknown error';
        if (msg.includes('Permission denied') || msg.includes('usage-limited-chat')) {
            msg = 'You do not have permission or have exceeded your usage limit. Please check your account.';
        }
        displayMessage(`Error: ${msg}`, 'system');
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        if (document.body.contains(chatInput)) chatInput.focus();
    }
}


// --- Phase 7: Action Button Functions ---
// ... (resendMessage, copyMessage, deleteMessage, speakMessage remain the same) ...
function resendMessage(text) {
    if (!chatInput) return;
    chatInput.value = text;
    sendMessage();
}

function copyMessage(text, contentElement) {
    const textToCopy = contentElement.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => console.log('Copied!')).catch(err => console.error('Copy failed: ', err));
}

function deleteMessage(bubble) {
    if (!messageDisplay) return;
    messageDisplay.removeChild(bubble);
}

async function speakMessage(text, buttonElement = null) {
    if (!text) return;
    
    // If there's an ongoing speech, stop it
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (buttonElement) {
            buttonElement.classList.remove('speaking');
            buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        return;
    }
    
    try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Update button state when starting
        if (buttonElement) {
            buttonElement.classList.add('speaking');
            buttonElement.innerHTML = '<i class="fas fa-stop"></i>';
        }
        
        // Handle speech end
        utterance.onend = () => {
            if (buttonElement) {
                buttonElement.classList.remove('speaking');
                buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        };
        
        // Handle speech error
        utterance.onerror = () => {
            if (buttonElement) {
                buttonElement.classList.remove('speaking');
                buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            console.error('Speech synthesis error');
        };
        
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Speech synthesis error:', error);
        if (buttonElement) {
            buttonElement.classList.remove('speaking');
            buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
}


// --- Phase 6: Popup Handling ---
// ... (showPopup, closeActivePopup remain the same) ...
async function showPopup(popupId) {
    const popup = popups[popupId];
    if (!popup || !popupBackdrop) { console.error('Popup or backdrop missing:', popupId); return; }
    // Always re-initialize listeners and content for reliability
    switch (popupId) {
        case 'history': displayChatHistory(); break;
        case 'imgGen': initializeImageGenPopup(); break;
        case 'ocr': initializeOcrPopup(); break;
        case 'vision': initializeVisionPopup(); break;
        case 'tts': initializeTTSListeners(); break;
        case 'settings': initializeSettingsPopup(); break;
    }
    // Set display:flex for proper layout
    popup.style.display = 'flex';
    popupBackdrop.style.display = 'block';
    activePopup = popup;
}

function closeActivePopup() {
    if (isTTSDictating) stopTTSDictation();
    if (visionStream) stopVisionCamera();
    if (activePopup && popupBackdrop) {
        activePopup.style.display = 'none';
        popupBackdrop.style.display = 'none';
        activePopup = null;
    }
    closeImageModal();
}

// --- Phase 8: New Chat & History ---
// ... (startNewChat, displayChatHistory, loadChatFromHistory, deleteChatHistory remain the same) ...
async function startNewChat() {
    console.log("Starting new chat session.");
    if (messageDisplay && messageDisplay.children.length > 0) {
        const messages = Array.from(messageDisplay.querySelectorAll('.message-bubble:not(.system-bubble)')).map(bubble => ({
            sender: bubble.classList.contains('user-bubble') ? 'user' : 'ai',
            text: bubble.querySelector('.message-content')?.textContent || ''
        }));
        if (messages.length > 0) {
            const sessionObject = { timestamp: Date.now(), model: selectedModel, messages: messages };
            const key = historyKeyPrefix + sessionObject.timestamp;
            try {
                if (!puter.kv) throw new Error("KV missing.");
                console.log(`Saving session: ${key}`);
                await puter.kv.set(key, JSON.stringify(sessionObject)); //
            } catch (error) {
                console.error("KV save error:", error);
                alert("Could not save session to history.");
            }
        }
    }
    if (messageDisplay) messageDisplay.innerHTML = '';
    if (modelSelector) modelSelector.value = 'gpt-4o-mini'; // Reset to default on new chat
    selectedModel = 'gpt-4o-mini';
    // Ensure the default is allowed by settings
    if (!allowedModels.includes(selectedModel)) {
         selectedModel = allowedModels[0] || null; // Fallback to first allowed if default isn't
         if(modelSelector && selectedModel) modelSelector.value = selectedModel;
    }
    displayMessage('New chat started.', 'system');
}

async function displayChatHistory() {
    if (!requireSignIn()) return;
    if (!historyList) { console.error("History list missing."); return; }
    historyList.innerHTML = '<p>Loading...</p>';
    try {
        if (!puter.kv) throw new Error("KV missing.");
        const keys = await puter.kv.list(historyKeyPrefix + '*');
        if (!keys || keys.length === 0) {
            historyList.innerHTML = '<p>No history found.</p>';
            return;
        }
        const sortedKeys = keys.sort((a, b) => parseInt(b.substring(historyKeyPrefix.length)) - parseInt(a.substring(historyKeyPrefix.length)));
        historyList.innerHTML = '';
        sortedKeys.forEach(key => {
            const timestamp = parseInt(key.substring(historyKeyPrefix.length));
            const dateString = new Date(timestamp).toLocaleString();
            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            const infoSpan = document.createElement('span');
            infoSpan.textContent = `Chat: ${dateString}`;
            infoSpan.style.marginRight = '10px';
            const loadBtn = document.createElement('button');
            loadBtn.textContent = 'Load';
            loadBtn.onclick = () => loadChatFromHistory(key);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.style.marginLeft = '5px';
            delBtn.style.color = 'red';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Delete chat from ${dateString}?`)) deleteChatHistory(key, itemDiv);
            };
            itemDiv.append(infoSpan, loadBtn, delBtn);
            historyList.appendChild(itemDiv);
        });
    } catch (error) {
        historyList.innerHTML = `<p>Error loading history: ${error.message}</p>`;
    }
}

async function loadChatFromHistory(key) {
    console.log("Loading chat:", key);
    displayMessage(`Loading chat: ${new Date(parseInt(key.substring(historyKeyPrefix.length))).toLocaleString()}...`, 'system');
    closeActivePopup();
    try {
        if (!puter.kv) throw new Error("KV missing.");
        const sessionString = await puter.kv.get(key); //
        if (!sessionString) throw new Error("Session not found.");
        const session = JSON.parse(sessionString);
        if (messageDisplay) messageDisplay.innerHTML = ''; // Clear current chat
        if (session.messages?.length) {
            session.messages.forEach(msg => displayMessage(msg.text, msg.sender));
        }
        // Restore model, ensuring it's still allowed by settings
        const restoredModel = session.model || 'gpt-4o-mini';
        if (allowedModels.includes(restoredModel)) {
             selectedModel = restoredModel;
        } else {
            selectedModel = allowedModels.includes('gpt-4o-mini') ? 'gpt-4o-mini' : (allowedModels[0] || null);
             displayMessage(`Note: Original model "${restoredModel}" is not currently enabled. Switched to "${selectedModel}".`, 'system');
        }
        if (modelSelector && selectedModel) modelSelector.value = selectedModel;

        displayMessage(`Loaded chat from ${new Date(session.timestamp).toLocaleString()}.`, 'system');
    } catch (error) {
        console.error(`Error loading session ${key}:`, error);
        displayMessage(`Error loading chat: ${error.message}`, 'system');
    }
}

async function deleteChatHistory(key, listItemElement) {
    console.log("Deleting chat:", key);
    try {
        if (!puter.kv) throw new Error("KV missing.");
        await puter.kv.del(key); //
        if (listItemElement?.parentNode === historyList) {
            historyList.removeChild(listItemElement);
            console.log("Deleted history item from UI.");
            if (historyList.children.length === 0) historyList.innerHTML = '<p>No history found.</p>';
        }
    } catch (error) {
        console.error("Error deleting chat:", key, error);
        alert("Could not delete history item.");
    }
}

// --- Phase 9: TTS Chat Mode & Mic Dictation ---
// ... (handleTTSSend, toggleTTSDictation, startTTSDictation, stopTTSDictation, initializeTTSListeners remain the same) ...
async function handleTTSSend() {
    if (!ttsTextInput || !ttsSendButton || !ttsOutputArea) { console.error("TTS elements missing!"); return; }
    const text = ttsTextInput.value.trim();
    if (!text) return;
    ttsSendButton.disabled = true;
    ttsTextInput.disabled = true;
    let statusDiv = ttsOutputArea.querySelector('.tts-status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'tts-status';
        ttsOutputArea.appendChild(statusDiv);
    }
    statusDiv.textContent = 'AI Thinking...';
    try {
        if (typeof puter === 'undefined' || !puter.ai?.chat || !puter.ai?.txt2speech) throw new Error("Puter AI modules missing.");
        console.log(`TTS Mode: Sending to AI: "${text}"`);
        const response = await puter.ai.chat(text, { model: selectedModel }); //
        console.log("TTS Mode: AI response:", response);
        let aiText = "Sorry, couldn't process.";
        if (response && typeof response === 'string') aiText = response;
        else if (response?.text) aiText = response.text;
        else if (response?.message?.content) aiText = response.message.content;
        else if (response?.error) aiText = `Error: ${response.error.message || response.error}`;
        else console.warn("TTS unexpected response:", response);
        statusDiv.textContent = 'Generating Speech...';
        console.log("TTS Mode: Requesting speech for:", aiText);
        const audioObject = await puter.ai.txt2speech(aiText); //
        if (audioObject?.play) { //
            console.log("TTS Mode: Playable audio received.");
            statusDiv.textContent = ''; // Clear status
            const entryDiv = document.createElement('div');
            entryDiv.className = 'tts-entry';
            const textSpan = document.createElement('span');
            textSpan.className = 'tts-entry-text';
            textSpan.textContent = aiText;
            const replayButton = document.createElement('button');
            replayButton.className = 'tts-replay-button';
            replayButton.innerHTML = '<i class="fas fa-play"></i> Replay';
            replayButton.onclick = (e) => speakMessage(aiText, e.currentTarget); // Use main speak function
            entryDiv.append(textSpan, replayButton);
            ttsOutputArea.insertBefore(entryDiv, statusDiv); // Insert before status
            ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight;
            audioObject.onerror = (e) => { console.error("TTS play error:", e); statusDiv.textContent = 'Audio play error.'; };
            audioObject.onended = () => { console.log("TTS playback finished."); statusDiv.textContent = 'Playback finished.'; };
            audioObject.play(); //
            statusDiv.textContent = 'Speaking...';
        } else {
            console.error("TTS Mode: No playable audio returned.");
            statusDiv.textContent = 'Failed to generate speech.';
        }
    } catch (error) {
        console.error("Error in TTS mode:", error);
        if (statusDiv) statusDiv.textContent = `Error: ${error.message || 'Unknown'}`;
    } finally {
        setTimeout(() => { // Add delay before re-enabling
            if (ttsSendButton) ttsSendButton.disabled = false;
            if (ttsTextInput) ttsTextInput.disabled = false;
        }, 500);
        if (ttsTextInput) ttsTextInput.value = ''; // Clear input after processing
    }
}

function toggleTTSDictation() {
    if (isTTSDictating) stopTTSDictation();
    else startTTSDictation();
}

function startTTSDictation() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Browser doesn't support speech recognition.");
        return;
    }
    if (!ttsMicButton || !ttsTextInput) { console.error("TTS Mic/Input missing."); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    ttsRecognition = new SpeechRecognition();
    ttsRecognition.continuous = false; // Dictate one phrase at a time
    ttsRecognition.interimResults = false; // Get final result only

    ttsRecognition.onstart = () => {
        console.log("TTS dictation started.");
        isTTSDictating = true;
        ttsMicButton.classList.add('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-stop"></i>';
    };
    ttsRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        console.log("TTS dictation recognized:", transcript);
        ttsTextInput.value = transcript; // Populate the text input
    };
    ttsRecognition.onend = () => {
        console.log("TTS dictation ended.");
        isTTSDictating = false;
        ttsMicButton.classList.remove('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>';
    };
    ttsRecognition.onerror = (e) => {
        console.error("TTS dictation error:", e.error);
        let errorMsg = `Dictation error: ${e.error}`;
        if (e.error === 'no-speech') errorMsg = "No speech detected.";
        else if (e.error === 'audio-capture') errorMsg = "Mic capture failed.";
        else if (e.error === 'not-allowed') errorMsg = "Mic access denied.";
        alert(errorMsg);
        isTTSDictating = false;
        ttsMicButton.classList.remove('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>';
    };
    try { ttsRecognition.start(); }
    catch (e) {
        console.error("Failed start TTS dictation:", e);
        isTTSDictating = false;
        ttsMicButton.classList.remove('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>';
        alert("Failed to start dictation.");
    }
}

function stopTTSDictation() {
    if (ttsRecognition && isTTSDictating) {
        ttsRecognition.stop();
        console.log("TTS dictation stopped manually.");
        // UI reset happens in onend handler
    }
}

function initializeTTSListeners() {
    if (ttsListenersAdded) return;
    if (!ttsSendButton || !ttsTextInput || !ttsOutputArea || !ttsMicButton) {
        console.warn("TTS elements missing for init.");
        return;
    }
    console.log("Initializing TTS listeners.");
    ttsSendButton.addEventListener('click', handleTTSSend);
    ttsTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTTSSend();
        }
    });
    ttsMicButton.addEventListener('click', toggleTTSDictation); // Use dictation handler
    ttsListenersAdded = true;
    console.log("TTS listeners added.");
}

// --- Phase 10: Main Chat Microphone Input ---
// ... (initializeChatMicInput, toggleChatMicRecording, startChatMicRecording, stopChatMicRecording remain the same) ...
function initializeChatMicInput() {
    if (!micButton || !chatInput) { console.warn("Main chat mic/input missing."); return; }
    if (!micButton.getAttribute('data-mic-listener-added')) {
        micButton.addEventListener('click', toggleChatMicRecording);
        micButton.setAttribute('data-mic-listener-added', 'true');
        console.log("Main chat mic listener added.");
    }
}

function toggleChatMicRecording() {
    if (isChatMicRecording) stopChatMicRecording();
    else startChatMicRecording();
}

function startChatMicRecording() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Browser doesn't support speech recognition.");
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    chatRecognition = new SpeechRecognition();
    chatRecognition.continuous = false;
    chatRecognition.interimResults = false;
    chatRecognition.onstart = () => {
        console.log("Chat mic started.");
        isChatMicRecording = true;
        micButton.classList.add('recording');
        micButton.textContent = "⏺️";
    };
    chatRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        console.log("Chat speech recognized:", transcript);
        chatInput.value = transcript; // Populate main chat input
    };
    chatRecognition.onend = () => {
        console.log("Chat mic ended.");
        isChatMicRecording = false;
        micButton.classList.remove('recording');
        micButton.textContent = "🎤";
    };
    chatRecognition.onerror = (e) => {
        console.error("Chat mic error:", e.error);
        let errorMsg = `Speech error: ${e.error}`;
        if (e.error === 'no-speech') errorMsg = "No speech detected.";
        else if (e.error === 'audio-capture') errorMsg = "Mic capture failed.";
        else if (e.error === 'not-allowed') errorMsg = "Mic access denied.";
        alert(errorMsg);
        isChatMicRecording = false;
        micButton.classList.remove('recording');
        micButton.textContent = "🎤";
    };
    try { chatRecognition.start(); }
    catch (e) {
        console.error("Failed start chat mic:", e);
        isChatMicRecording = false;
        micButton.classList.remove('recording');
        micButton.textContent = "🎤";
        alert("Failed to start mic.");
    }
}

function stopChatMicRecording() {
    if (chatRecognition && isChatMicRecording) {
        chatRecognition.stop();
        console.log("Chat mic stopped manually.");
        // UI reset happens in onend handler
    }
}

// --- Phase 11 & 13 Updates: Image Generation Logic ---
// ... (handleBasicImageGeneration, displayGeneratedImage, saveImageFromDataUrl, expandImage, closeImageModal, saveExpandedImage remain the same)
// ... (handleStoryGeneration, handleStoryDownload, handleCardImageGeneration, handleCardImageSearch, displayCardImageThumbnail, selectCardImage, handleCardGeneration, handleCardDownload, handleComicGeneration, handleComicDownload remain the same)
// ... (initializeImageGenPopup remains the same)
async function handleBasicImageGeneration() {
    if (!requireSignIn()) return;
    if (!imgGenPrompt || !imgGenGenerateBtn || !imgGenResults || !imgGenLoading || !imgGenError || !imgGenSizeSelect || !imgGenAmountSelect) {
        console.error("Img Gen Basic UI elements missing!"); return;
    }
    
    const prompt = imgGenPrompt.value.trim();
    if (!prompt) {
        imgGenError.textContent = "Enter prompt.";
        imgGenError.style.display = 'block';
        return;
    }
    
    const size = imgGenSizeSelect.value;
    const amount = parseInt(imgGenAmountSelect.value, 10);
    
    // Set dimensions based on size selection
    let width, height;
    switch(size) {
        case 'landscape':
            width = 1024;
            height = 512;
            break;
        case 'portrait':
            width = 512;
            height = 1024;
            break;
        case 'square':
        default:
            width = 512;
            height = 512;
            break;
    }
    
    imgGenGenerateBtn.disabled = true;
    imgGenError.style.display = 'none';
    imgGenLoading.style.display = 'block';
    
    // Create loading placeholders for each image
    for (let i = 0; i < amount; i++) {
        displayGeneratedImage(null, prompt, imgGenResults, true);
    }
    
    try {
        if (typeof puter === 'undefined' || !puter.ai?.txt2img)
            throw new Error("Image generation module missing. Please check your internet connection or reload the page.");
        
        // Generate multiple images in parallel
        const promises = Array(amount).fill().map(async () => {
            try {
                return await puter.ai.txt2img(prompt, false, { width, height });
            } catch (err) {
                console.warn('Real API failed, trying test mode:', err);
                return await puter.ai.txt2img(prompt, true, { width, height });
            }
        });
        
        const results = await Promise.all(promises);
        
        // Replace placeholders with actual images
        results.forEach((imageElement, index) => {
            if (imageElement?.tagName === 'IMG') {
                displayGeneratedImage(imageElement, prompt, imgGenResults, false);
            }
        });
        
        // Remove any remaining placeholders
        const remainingPlaceholders = imgGenResults.querySelectorAll('.img-gen-thumbnail-container[data-placeholder="true"]');
        remainingPlaceholders.forEach(placeholder => placeholder.remove());
        
    } catch (error) {
        imgGenError.textContent = `Error: ${error.message || 'Unknown'}`;
        imgGenError.style.display = 'block';
        // Remove all placeholders on error
        const placeholders = imgGenResults.querySelectorAll('.img-gen-thumbnail-container[data-placeholder="true"]');
        placeholders.forEach(placeholder => placeholder.remove());
    } finally {
        imgGenLoading.style.display = 'none';
        imgGenGenerateBtn.disabled = false;
    }
}

// Modified to accept target container and support loading state
function displayGeneratedImage(imageElement, prompt = "generated", targetContainer, isLoading = false) {
    if (!targetContainer) { console.error("Target container missing for image display"); return; }
    
    const container = document.createElement('div');
    container.className = 'img-gen-thumbnail-container';
    
    if (isLoading) {
        // Create loading placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'img-gen-loading-placeholder';
        placeholder.style.width = '256px';
        placeholder.style.height = '256px';
        placeholder.style.backgroundColor = '#f0f0f0';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.borderRadius = '8px';
        
        const spinner = document.createElement('i');
        spinner.className = 'fas fa-spinner fa-spin fa-2x';
        spinner.style.color = '#666';
        
        placeholder.appendChild(spinner);
        container.appendChild(placeholder);
        container.dataset.placeholder = 'true';
    } else {
        // Real image
        imageElement.className = 'img-gen-thumbnail';
        imageElement.alt = prompt;
        imageElement.onclick = () => expandImage(imageElement.src);
        
        const saveButton = document.createElement('button');
        saveButton.className = 'img-gen-save-btn';
        saveButton.title = 'Save Image';
        saveButton.innerHTML = '<i class="fas fa-save"></i>';
        saveButton.onclick = (e) => {
            e.stopPropagation();
            saveImageFromDataUrl(imageElement.src, prompt);
        };
        
        container.append(imageElement, saveButton);
    }
    
    // If there's a placeholder, replace it, otherwise prepend
    const existingPlaceholder = targetContainer.querySelector('.img-gen-thumbnail-container[data-placeholder="true"]');
    if (existingPlaceholder) {
        targetContainer.replaceChild(container, existingPlaceholder);
    } else {
        targetContainer.prepend(container);
    }
    return container;
}

// Helper for saving image data URLs
function saveImageFromDataUrl(dataUrl, prompt) {
    const link = document.createElement('a');
    link.href = dataUrl;
    const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function expandImage(imageSrc) {
    if (!imageModal || !imageModalBackdrop || !expandedImage) { console.error("Modal elements missing."); return; }
    expandedImage.src = imageSrc;
    expandedImage.alt = "Expanded Image"; // Simple alt text for modal
    imageModal.style.display = 'block'; // Use block display
    imageModalBackdrop.style.display = 'block';
}

function closeImageModal() {
    if (imageModal && imageModalBackdrop) {
        imageModal.style.display = 'none';
        imageModalBackdrop.style.display = 'none';
        expandedImage.src = '#';
        expandedImage.alt = '';
    }
}

function saveExpandedImage() {
    if (!expandedImage || !expandedImage.src || expandedImage.src.endsWith('#')) return;
    saveImageFromDataUrl(expandedImage.src, expandedImage.alt || `expanded_${Date.now()}`);
}

// ---- Story Mode Logic ----
async function handleStoryGeneration() {
    if (!storyCharactersInput || !storySettingInput || !storyPlotInput || !storyGenerateBtn || !storyOutputArea || !storyDownloadBtn) return;

    const characters = storyCharactersInput.value.trim();
    const setting = storySettingInput.value.trim();
    const plot = storyPlotInput.value.trim();

    if (!plot) { alert("Please provide a plot summary."); return; }

    storyGenerateBtn.disabled = true;
    storyDownloadBtn.style.display = 'none';
    storyOutputArea.innerHTML = '<p>Generating story and images... <i class="fas fa-spinner fa-spin"></i></p>';

    try {
        if (!puter.ai?.chat || !puter.ai?.txt2img) throw new Error("AI modules missing.");

        // 1. Generate Story Text using chat
        let storyPrompt = `Write a short story based on the following:\n`;
        if (characters) storyPrompt += `- Characters: ${characters}\n`;
        if (setting) storyPrompt += `- Setting: ${setting}\n`;
        storyPrompt += `- Plot: ${plot}\n\n`;
        storyPrompt += `Structure the story with clear chapter headings (e.g., "Chapter 1: The Beginning") and paragraphs. Keep it concise. Title the story at the top.`;

        console.log("Requesting story text...");
        const storyResponse = await puter.ai.chat(storyPrompt, { model: selectedModel });
        const storyText = storyResponse?.message?.content || storyResponse?.text || storyResponse || "Error generating story text.";
        console.log("Story text received.");

        // 2. Process Text and Generate Images
        storyOutputArea.innerHTML = '';
        let lines = storyText.split('\n').filter(line => line.trim() !== '');
        let contentGenerated = false;
        let currentChapter = null;
        let chapterParagraphs = [];
        let chapterTitle = '';
        let storyTitle = '';
        let isFirstHeading = true;
        let chapterCount = 0;

        // Find the first non-empty line as the story title, fallback if not found
        let foundTitle = false;
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].toLowerCase().startsWith('chapter ')) {
                storyTitle = lines[i].trim();
                lines = lines.slice(i + 1);
                foundTitle = true;
                break;
            }
        }
        if (!foundTitle) {
            storyTitle = 'AI Generated Story';
        }

        // Title centered at the top
        if (storyTitle) {
            const titleElem = document.createElement('h2');
            titleElem.textContent = storyTitle;
            titleElem.style.textAlign = 'center';
            titleElem.style.marginBottom = '18px';
            storyOutputArea.appendChild(titleElem);
        }

        // Fallback: If no chapters, treat all as one chapter
        let hasChapters = lines.some(line => line.toLowerCase().startsWith('chapter '));
        if (!hasChapters) {
            lines = ['Chapter 1', ...lines];
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.toLowerCase().startsWith('chapter ')) {
                // If we have a previous chapter, render it
                if (currentChapter) {
                    await renderChapter(currentChapter, chapterParagraphs, chapterTitle);
                }
                // Start new chapter
                chapterCount++;
                currentChapter = line.trim();
                chapterTitle = line.trim();
                chapterParagraphs = [];
            } else {
                chapterParagraphs.push(line.trim());
            }
        }
        // Render the last chapter
        if (currentChapter) {
            await renderChapter(currentChapter, chapterParagraphs, chapterTitle);
        }

        async function renderChapter(chapterHeading, paragraphs, chapterTitle) {
            contentGenerated = true;
            // Subheading (centered)
            const subheading = document.createElement('h3');
            subheading.textContent = chapterHeading;
            subheading.style.textAlign = 'center';
            subheading.style.margin = '16px 0 8px 0';
            storyOutputArea.appendChild(subheading);
            // Chapter text (all paragraphs)
            const paraDiv = document.createElement('div');
            paraDiv.style.marginBottom = '8px';
            for (const pText of paragraphs) {
                const p = document.createElement('p');
                p.className = 'story-paragraph';
                p.textContent = pText;
                paraDiv.appendChild(p);
            }
            storyOutputArea.appendChild(paraDiv);
            // Line break
            storyOutputArea.appendChild(document.createElement('br'));
            // Loading spinner for image
            const spinner = document.createElement('div');
            spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            spinner.style.textAlign = 'center';
            spinner.style.margin = '8px 0';
            storyOutputArea.appendChild(spinner);
            // Generate image for this chapter
            const imgPrompt = `Illustration for a story chapter titled \"${chapterTitle}\". Setting: ${setting || 'unspecified'}. Characters: ${characters || 'unspecified'}. Style: Storybook illustration.`;
            try {
                const imageElement = await puter.ai.txt2img(imgPrompt, false);
                    if (imageElement?.tagName === 'IMG') {
                        imageElement.className = 'story-image';
                        imageElement.alt = `Image for ${chapterTitle}`;
                    imageElement.style.display = 'block';
                    imageElement.style.margin = '0 auto 12px auto';
                        storyOutputArea.appendChild(imageElement);
                    }
                } catch (imgError) {
                    console.error(`Error generating image for ${chapterTitle}:`, imgError);
                const failMsg = document.createElement('div');
                failMsg.textContent = '[Image generation failed for this chapter]';
                failMsg.style.textAlign = 'center';
                failMsg.style.color = 'red';
                storyOutputArea.appendChild(failMsg);
            } finally {
                storyOutputArea.removeChild(spinner);
            }
            // Line break
            storyOutputArea.appendChild(document.createElement('br'));
        }

        if (contentGenerated) {
            storyDownloadBtn.style.display = 'inline-block';
        } else {
            storyOutputArea.innerHTML = '<p>Could not generate story content.</p>';
        }

    } catch (error) {
        console.error("Error generating story:", error);
        storyOutputArea.innerHTML = `<p style=\"color: red;\">Error generating story: ${error.message}</p>`;
    } finally {
        storyGenerateBtn.disabled = false;
    }
}

// Download story as PDF
function handleStoryDownload() {
    if (!storyOutputArea) return;
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;
    const margin = 40;
    const maxWidth = 515;
    const elements = Array.from(storyOutputArea.children);
    elements.forEach(el => {
        if (el.tagName === 'H2' || el.tagName === 'H3') {
            doc.setFontSize(el.tagName === 'H2' ? 20 : 16);
            doc.text(el.textContent, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += el.tagName === 'H2' ? 32 : 24;
        } else if (el.tagName === 'P') {
            doc.setFontSize(12);
            const lines = doc.splitTextToSize(el.textContent, maxWidth);
            lines.forEach(line => {
                doc.text(line, margin, y);
                y += 16;
            });
        } else if (el.tagName === 'IMG') {
            const img = el;
            const imgWidth = Math.min(img.naturalWidth, maxWidth);
            const imgHeight = img.naturalHeight * (imgWidth / img.naturalWidth);
            doc.addImage(img.src, 'JPEG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 12;
        } else if (el.tagName === 'BR') {
            y += 8;
        }
        if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = 40;
        }
    });
    doc.save('story.pdf');
}

// ---- Card Mode Logic ----
async function handleCardImageGeneration() {
    if (!cardVisualDescInput || !cardGenerateImgBtn || !cardImagePreviewArea || !cardImageLoading || !cardImageSearchResults) return;
    const prompt = cardVisualDescInput.value.trim();
    if (!prompt) { alert("Please enter a visual description."); return; }

    cardGenerateImgBtn.disabled = true;
    cardSearchImgBtn.disabled = true; // Disable search while generating
    cardImageLoading.style.display = 'block';
    cardImageSearchResults.innerHTML = ''; // Clear previous search/generated results
    cardSelectedImageUrl = null; // Clear selection
    cardSelectedImageDisplay.style.display = 'none';

    try {
        if (!puter.ai?.txt2img) throw new Error("txt2img module missing.");
        console.log("Generating card image:", prompt);
        // testMode=true
        const imageElement = await puter.ai.txt2img(prompt, false); //
        if (imageElement?.tagName === 'IMG') {
            displayCardImageThumbnail(imageElement.src, cardImageSearchResults, true); // Display and mark as selected
        } else {
            throw new Error("Failed to generate valid image.");
        }
    } catch (error) {
        console.error("Card image generation error:", error);
        cardImagePreviewArea.innerHTML = `<p style="color: red;">Error generating card image: ${error.message}</p>`; // Show error in preview area
    } finally {
        cardImageLoading.style.display = 'none';
        cardGenerateImgBtn.disabled = false;
        cardSearchImgBtn.disabled = false;
    }
}

function handleCardImageSearch() {
    // Placeholder: Requires google_search tool integration
    alert("Web search for card images is not yet implemented. Please use the 'Generate Card Image' button.");
    console.log("Card image search clicked - requires external tool.");
}

function displayCardImageThumbnail(imageUrl, container, selectOnClick = false) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Card Image Option";
    img.onclick = () => selectCardImage(img);
    container.appendChild(img);
    if (selectOnClick) {
        selectCardImage(img); // Auto-select the generated image
    }
}

function selectCardImage(selectedImgElement) {
    const container = selectedImgElement.parentNode; // Get the container (cardImageSearchResults)
    if (!container) return;
    // Remove 'selected' class from all images in the container
    const siblings = container.querySelectorAll('img');
    siblings.forEach(img => img.classList.remove('selected'));

    // Add 'selected' class to the clicked image
    selectedImgElement.classList.add('selected');
    cardSelectedImageUrl = selectedImgElement.src;

    // Update the main display thumbnail
    if(cardSelectedImageThumb && cardSelectedImageDisplay) {
        cardSelectedImageThumb.src = cardSelectedImageUrl;
        cardSelectedImageDisplay.style.display = 'block';
    }
    console.log("Card image selected:", cardSelectedImageUrl.substring(0, 50) + "...");
}


function handleCardGeneration() {
    if (!cardTypeSelect || !cardVisualDescInput || !cardRecipientInput || !cardMessageInput || !cardSenderInput || !cardSizeSelect || !cardGenerateBtn || !cardDownloadBtn) return;

    if (!cardSelectedImageUrl) {
        alert("Please generate or select an image for the card front.");
        return;
    }
    if (!cardRecipientInput.value.trim() || !cardMessageInput.value.trim() || !cardSenderInput.value.trim()) {
        alert("Please fill in Recipient, Message, and Your Name fields.");
        return;
    }

    cardGenerateBtn.disabled = true;
    console.log("Generating card data...");
    // For now, just show the download button as generation is conceptual
    cardDownloadBtn.style.display = 'inline-block';
    alert("Card data prepared. PDF/Image download is not yet implemented.");
    cardGenerateBtn.disabled = false; // Re-enable immediately for demo
}

function handleCardDownload() {
    // Placeholder for PDF/Image generation using jsPDF or canvas
    alert("PDF/Image Download for Card mode is not yet implemented.");
    console.log("Attempting to download card - PDF/Image logic needed.");
}

// ---- Comic Mode Logic ----
async function handleComicGeneration() {
     if (!comicCharactersInput || !comicPlotInput || !comicSettingInput || !comicGenerateBtn || !comicOutputArea || !comicDownloadBtn) return;

    const characters = comicCharactersInput.value.trim();
    const setting = comicSettingInput.value.trim();
    const plot = comicPlotInput.value.trim(); // Expecting panel descriptions separated by newlines

    if (!plot) { alert("Please provide a panel-by-panel plot summary."); return; }

    comicGenerateBtn.disabled = true;
    comicDownloadBtn.style.display = 'none';
    comicOutputArea.innerHTML = '<p>Generating comic panels... <i class="fas fa-spinner fa-spin"></i></p>';

    try {
        if (!puter.ai?.chat || !puter.ai?.txt2img) throw new Error("AI modules missing.");

        const panels = plot.split('\n').filter(p => p.trim() !== '');
        comicOutputArea.innerHTML = ''; // Clear loading
        let contentGenerated = false;

        for (let i = 0; i < panels.length; i++) {
            contentGenerated = true;
            const panelDescription = panels[i].trim();
            const panelDiv = document.createElement('div');
            panelDiv.className = 'comic-panel';
            panelDiv.innerHTML = `<h4>Panel ${i + 1}</h4>`;

            // 1. Generate Panel Image
            const imgPrompt = `Comic book panel illustration. Characters: ${characters || 'unspecified'}. Setting: ${setting || 'unspecified'}. Action/Dialogue: "${panelDescription}". Style: Comic book art.`;
            console.log(`Generating image for Panel ${i + 1}...`);
            try {
                 // testMode=true
                const imageElement = await puter.ai.txt2img(imgPrompt, false); //
                if (imageElement?.tagName === 'IMG') {
                    imageElement.className = 'comic-panel-image';
                    imageElement.alt = `Comic Panel ${i + 1}`;
                    panelDiv.appendChild(imageElement);
                }
            } catch (imgError) {
                console.error(`Error generating image for Panel ${i + 1}:`, imgError);
                panelDiv.appendChild(document.createTextNode(`[Image generation failed for panel ${i + 1}]`));
            }

            // 2. Add Panel Description/Text
            const descP = document.createElement('p');
            descP.textContent = panelDescription;
            panelDiv.appendChild(descP);

            comicOutputArea.appendChild(panelDiv);
            // Optional delay
            // await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (contentGenerated) {
            comicDownloadBtn.style.display = 'inline-block'; // Show download button
        } else {
            comicOutputArea.innerHTML = '<p>Could not generate comic content.</p>';
        }

    } catch (error) {
        console.error("Error generating comic:", error);
        comicOutputArea.innerHTML = `<p style="color: red;">Error generating comic: ${error.message}</p>`;
    } finally {
        comicGenerateBtn.disabled = false;
    }
}

function handleComicDownload() {
    // Placeholder for PDF generation
    alert("PDF Download for Comic mode is not yet implemented.");
    console.log("Attempting to download comic - PDF logic needed.");
}


function initializeImageGenPopup() {
    if (imgGenListenersAdded) return;
    
    // Create basic mode container if it doesn't exist
    const basicContainer = document.createElement('div');
    basicContainer.className = 'img-gen-basic-container';
    
    // Create prompt textarea if it doesn't exist
    if (!imgGenPrompt) {
        imgGenPrompt = document.createElement('textarea');
        imgGenPrompt.id = 'img-gen-prompt';
        imgGenPrompt.className = 'img-gen-prompt';
        imgGenPrompt.placeholder = 'Describe the image you want to generate...';
    }
    // Always add the prompt textarea to the container
    basicContainer.appendChild(imgGenPrompt);
    
    // Create controls row
    const controlsRow = document.createElement('div');
    controlsRow.className = 'img-gen-controls-row';
    
    // Create size select if it doesn't exist
    if (!imgGenSizeSelect) {
        imgGenSizeSelect = document.createElement('select');
        imgGenSizeSelect.id = 'img-gen-size-select';
        imgGenSizeSelect.className = 'img-gen-control-select';
        imgGenSizeSelect.innerHTML = `
            <option value="square">Square 1:1</option>
            <option value="landscape">Landscape 16:9</option>
            <option value="portrait">Portrait 9:16</option>
        `;
    }
    
    // Create generate button if it doesn't exist
    if (!imgGenGenerateBtn) {
        imgGenGenerateBtn = document.createElement('button');
        imgGenGenerateBtn.id = 'img-gen-generate-btn';
        imgGenGenerateBtn.textContent = 'Generate';
    }
    
    // Create amount select if it doesn't exist
    if (!imgGenAmountSelect) {
        imgGenAmountSelect = document.createElement('select');
        imgGenAmountSelect.id = 'img-gen-amount-select';
        imgGenAmountSelect.className = 'img-gen-control-select';
        imgGenAmountSelect.innerHTML = `
            <option value="1">1 Image</option>
            <option value="2">2 Images</option>
            <option value="3">3 Images</option>
            <option value="4">4 Images</option>
        `;
    }
    
    // Add elements to controls row
    controlsRow.appendChild(imgGenSizeSelect);
    controlsRow.appendChild(imgGenGenerateBtn);
    controlsRow.appendChild(imgGenAmountSelect);
    basicContainer.appendChild(controlsRow);
    
    // Create results area if it doesn't exist
    if (!imgGenResults) {
        imgGenResults = document.createElement('div');
        imgGenResults.id = 'img-gen-results';
    }
    basicContainer.appendChild(imgGenResults);
    
    // Add the container to the popup
    const basicModePanel = document.querySelector('#img-gen-basic-mode');
    if (basicModePanel) {
        basicModePanel.innerHTML = '';
        basicModePanel.appendChild(basicContainer);
    }
    
    // Initialize event listeners
    imgGenGenerateBtn.addEventListener('click', handleBasicImageGeneration);
    imgGenPrompt.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBasicImageGeneration();
        }
    });
    
    imgGenListenersAdded = true;
}


// --- Phase 12: OCR ---
// ... (fileToDataURL, initializeOcrPopup, handleOcrFileSelect, clearOcrSelection, handleOcrExtract remain the same) ...
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

function initializeOcrPopup() {
    if (ocrListenersAdded) return;
    if (!ocrUploadBtn || !ocrFileInput || !ocrExtractBtn || !ocrCopyBtn || !ocrThumbnailArea || !ocrResultText || !ocrStatus) {
        console.error("OCR UI elements missing!");
        return;
    }
    console.log("Initializing OCR listeners.");
    ocrUploadBtn.addEventListener('click', () => ocrFileInput.click());
    ocrFileInput.addEventListener('change', handleOcrFileSelect);
    ocrExtractBtn.addEventListener('click', handleOcrExtract);
    ocrCopyBtn.addEventListener('click', () => {
        if (!ocrResultText.value) return;
        navigator.clipboard.writeText(ocrResultText.value).then(() => {
            const originalText = ocrCopyBtn.innerHTML;
            ocrCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { if (ocrCopyBtn) ocrCopyBtn.innerHTML = originalText; }, 1500);
        }).catch(err => console.error('OCR Copy failed: ', err));
    });
    ocrListenersAdded = true;
    console.log("OCR listeners added.");
}

async function handleOcrFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) { clearOcrSelection(); return; }
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.'); clearOcrSelection(); return;
    }
    ocrSelectedFile = file;
    try {
        const dataUrl = await fileToDataURL(file);
        ocrThumbnailArea.innerHTML = '';
        const img = document.createElement('img');
        img.src = dataUrl; img.className = 'ocr-thumbnail-img'; img.alt = 'Selected Image';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'ocr-remove-thumb-btn'; removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Remove Image'; removeBtn.onclick = clearOcrSelection;
        ocrThumbnailArea.append(img, removeBtn);
        ocrExtractBtn.disabled = false; ocrResultText.value = '';
        ocrCopyBtn.disabled = true; ocrStatus.style.display = 'none';
    } catch (error) {
        console.error("FileReader error:", error); alert("Error reading file for thumbnail.");
        clearOcrSelection();
    }
}

function clearOcrSelection() {
    console.log("Clearing OCR selection.");
    ocrSelectedFile = null;
    if (ocrFileInput) ocrFileInput.value = '';
    if (ocrThumbnailArea) ocrThumbnailArea.innerHTML = '';
    if (ocrExtractBtn) ocrExtractBtn.disabled = true;
    if (ocrResultText) ocrResultText.value = '';
    if (ocrCopyBtn) ocrCopyBtn.disabled = true;
    if (ocrStatus) ocrStatus.style.display = 'none';
}

async function handleOcrExtract() {
    if (!ocrSelectedFile) { alert("Select image first."); return; }
    if (!ocrExtractBtn || !ocrResultText || !ocrCopyBtn || !ocrStatus) { console.error("OCR UI elements missing for extraction."); return; }
    ocrExtractBtn.disabled = true; ocrCopyBtn.disabled = true;
    ocrStatus.textContent = 'Reading image data...'; ocrStatus.style.color = '#6c757d';
    ocrStatus.style.display = 'block'; ocrResultText.value = '';
    try {
        if (typeof puter === 'undefined' || !puter.ai?.img2txt) throw new Error("img2txt missing.");
        // Always convert file to data URL for compatibility
        const dataUrl = await fileToDataURL(ocrSelectedFile);
        console.log(`Requesting OCR for file: ${ocrSelectedFile.name}`);
        ocrStatus.textContent = 'Extracting text...';
        const extractedText = await puter.ai.img2txt(dataUrl); // Use data URL
        if (typeof extractedText === 'string') {
            ocrResultText.value = extractedText;
            ocrCopyBtn.disabled = !extractedText;
            ocrStatus.style.display = 'none';
            console.log("OCR successful.");
        } else { throw new Error("API did not return valid text."); }
    } catch (error) {
        console.error("Error during OCR extraction:", error);
        ocrResultText.value = ''; ocrStatus.textContent = `Error: ${error.message || 'Unknown OCR error'}`;
        ocrStatus.style.color = 'red'; ocrStatus.style.display = 'block';
    } finally { ocrExtractBtn.disabled = false; }
}

// --- Phase 13: Vision ---
// ... (initializeVisionPopup, startVisionCamera, stopVisionCamera, describeVisionFrame, clearVisionResults, saveVisionImage remain the same) ...
function initializeVisionPopup() {
    if (visionListenersAdded) return;
    const elements = [visionEnableCamBtn, visionVideoContainer, visionVideoPreview, visionControls, visionDescribeBtn, visionStopCamBtn, visionStatus, visionResultsText, visionActions, visionClearBtn, visionSpeakBtn, visionCopyBtn, visionSaveImgBtn, visionFlipCamBtn];
    if (elements.some(el => !el)) { console.error("Vision UI elements missing!"); return; }

    // New layout elements
    const visionEnableRow = document.getElementById('vision-enable-row');
    const visionActiveRow = document.getElementById('vision-active-row');

    // Initialize drag variables
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let initialLeft = 0, initialTop = 0;
    let lastDragX = 0, lastDragY = 0;
    let velocityX = 0, velocityY = 0;
    let inertiaFrame = null;
    let isPinching = false;
    let initialDistance = 0;
    let initialWidth = 0, initialHeight = 0;
    let aspectRatio = 1;

    // Make the preview absolutely positioned relative to the viewport
    visionVideoContainer.style.position = 'fixed';
    visionVideoContainer.style.left = '0px';
    visionVideoContainer.style.top = '0px';
    visionVideoContainer.style.cursor = 'move';

    // Helper: Clamp preview within viewport
    function clampToViewport(left, top, width, height) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        left = Math.max(0, Math.min(left, vw - width));
        top = Math.max(0, Math.min(top, vh - height));
        return [left, top];
    }

    // Mouse drag
    visionVideoContainer.addEventListener('mousedown', function(e) {
        if (e.button !== 0 || e.target.classList.contains('vision-resize-handle')) return;
        isDragging = true;
        visionVideoContainer.classList.add('dragging');
        const rect = visionVideoContainer.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        initialLeft = rect.left;
        initialTop = rect.top;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
        aspectRatio = rect.width / rect.height;
        document.body.style.userSelect = 'none';
        if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const width = visionVideoContainer.offsetWidth;
        const height = visionVideoContainer.offsetHeight;
        let newLeft = e.clientX - dragOffsetX;
        let newTop = e.clientY - dragOffsetY;
        [newLeft, newTop] = clampToViewport(newLeft, newTop, width, height);
        visionVideoContainer.style.left = newLeft + 'px';
        visionVideoContainer.style.top = newTop + 'px';
        velocityX = e.clientX - lastDragX;
        velocityY = e.clientY - lastDragY;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) visionVideoContainer.classList.remove('dragging');
        if (isDragging && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
            // Inertia
            let left = parseFloat(visionVideoContainer.style.left);
            let top = parseFloat(visionVideoContainer.style.top);
            const width = visionVideoContainer.offsetWidth;
            const height = visionVideoContainer.offsetHeight;
            function glide() {
                left += velocityX;
                top += velocityY;
                [left, top] = clampToViewport(left, top, width, height);
                visionVideoContainer.style.left = left + 'px';
                visionVideoContainer.style.top = top + 'px';
                velocityX *= 0.92;
                velocityY *= 0.92;
                if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                    inertiaFrame = requestAnimationFrame(glide);
                }
            }
            inertiaFrame = requestAnimationFrame(glide);
        }
        isDragging = false;
        document.body.style.userSelect = '';
    });

    // Touch drag & pinch
    visionVideoContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            visionVideoContainer.classList.add('dragging');
            const rect = visionVideoContainer.getBoundingClientRect();
            dragOffsetX = e.touches[0].clientX - rect.left;
            dragOffsetY = e.touches[0].clientY - rect.top;
            initialLeft = rect.left;
            initialTop = rect.top;
            lastDragX = e.touches[0].clientX;
            lastDragY = e.touches[0].clientY;
            aspectRatio = rect.width / rect.height;
            document.body.style.userSelect = 'none';
            if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
        } else if (e.touches.length === 2) {
            isPinching = true;
            isDragging = false;
            const rect = visionVideoContainer.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            aspectRatio = rect.width / rect.height;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialDistance = Math.sqrt(dx * dx + dy * dy);
        }
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
            const width = visionVideoContainer.offsetWidth;
            const height = visionVideoContainer.offsetHeight;
            let newLeft = e.touches[0].clientX - dragOffsetX;
            let newTop = e.touches[0].clientY - dragOffsetY;
            [newLeft, newTop] = clampToViewport(newLeft, newTop, width, height);
            visionVideoContainer.style.left = newLeft + 'px';
            visionVideoContainer.style.top = newTop + 'px';
            velocityX = e.touches[0].clientX - lastDragX;
            velocityY = e.touches[0].clientY - lastDragY;
            lastDragX = e.touches[0].clientX;
            lastDragY = e.touches[0].clientY;
        } else if (isPinching && e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let scale = dist / initialDistance;
            let newWidth = Math.max(60, Math.min(window.innerWidth, initialWidth * scale));
            let newHeight = newWidth / aspectRatio;
            visionVideoContainer.style.width = newWidth + 'px';
            visionVideoContainer.style.height = newHeight + 'px';
        }
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', function(e) {
        if (isDragging) visionVideoContainer.classList.remove('dragging');
        if (isDragging && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
            // Inertia
            let left = parseFloat(visionVideoContainer.style.left);
            let top = parseFloat(visionVideoContainer.style.top);
            const width = visionVideoContainer.offsetWidth;
            const height = visionVideoContainer.offsetHeight;
            function glide() {
                left += velocityX;
                top += velocityY;
                [left, top] = clampToViewport(left, top, width, height);
                visionVideoContainer.style.left = left + 'px';
                visionVideoContainer.style.top = top + 'px';
                velocityX *= 0.92;
                velocityY *= 0.92;
                if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                    inertiaFrame = requestAnimationFrame(glide);
                }
            }
            inertiaFrame = requestAnimationFrame(glide);
        }
        isDragging = false;
        isPinching = false;
        document.body.style.userSelect = '';
    });

    // Add resize handle
    addResizeHandleToVisionContainer();

    function setCameraUIState(active) {
        if (active) {
            if (visionEnableRow) visionEnableRow.style.display = 'none';
            if (visionActiveRow) visionActiveRow.style.display = 'flex';
        } else {
            if (visionEnableRow) visionEnableRow.style.display = 'flex';
            if (visionActiveRow) visionActiveRow.style.display = 'none';
        }
    }

    // Initial state: camera off
    setCameraUIState(false);

    visionEnableCamBtn.addEventListener('click', () => {
        startVisionCameraPatched();
    });
    
    visionStopCamBtn.addEventListener('click', () => {
        stopVisionCameraPatched();
    });
    
    // Replace the old flip button listener with the improved version
    if (visionFlipCamBtn) {
        visionFlipCamBtn.addEventListener('click', async () => {
            visionStatus.textContent = 'Switching camera...';
            visionStatus.style.display = 'block';
            visionStatus.style.color = '#6c757d';
            
            // Toggle between front and back camera
            visionFacingMode = (visionFacingMode === 'user') ? 'environment' : 'user';
            
            // Inform the user what's happening
            visionFlipCamBtn.disabled = true;
            visionDescribeBtn.disabled = true;
            
            try {
                // Stop existing stream
                if (visionStream) {
                    visionStream.getTracks().forEach(track => track.stop());
                    visionStream = null;
                }
                
                // Small timeout to ensure camera is fully released
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Start new stream with new facing mode
                await startVisionCamera();
            } catch (error) {
                console.error("Error flipping camera:", error);
                visionStatus.textContent = `Error switching camera: ${error.message || 'Unknown'}`;
                visionStatus.style.color = 'red';
            } finally {
                visionFlipCamBtn.disabled = false;
                visionDescribeBtn.disabled = false;
            }
        });
    }
    
    visionDescribeBtn.addEventListener('click', describeVisionFrame);
    visionClearBtn.addEventListener('click', clearVisionResults);
    visionSpeakBtn.addEventListener('click', () => {
        if (visionResultsText.value) speakMessage(visionResultsText.value, visionSpeakBtn);
    });
    visionCopyBtn.addEventListener('click', () => {
        if (visionResultsText.value) navigator.clipboard.writeText(visionResultsText.value)
            .then(() => console.log("Vision text copied."))
            .catch(err => console.error("Vision copy failed:", err));
    });
    visionSaveImgBtn.addEventListener('click', saveVisionImage);

    // ... (existing drag/touch logic remains unchanged) ...

    // Patch start/stop camera to update UI state
    async function startVisionCameraPatched() {
        setCameraUIState(true);
        await startVisionCamera();
    }
    function stopVisionCameraPatched() {
        setCameraUIState(false);
        stopVisionCamera();
    }
    
    const visionResetPreviewBtn = document.getElementById('vision-reset-preview-btn');

    if (visionResetPreviewBtn) {
        visionResetPreviewBtn.addEventListener('click', () => {
            // Default size
            const defaultWidth = 320;
            const defaultHeight = 240;
            visionVideoContainer.style.width = defaultWidth + 'px';
            visionVideoContainer.style.height = defaultHeight + 'px';
            // Center in viewport
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            visionVideoContainer.style.left = ((vw - defaultWidth) / 2) + 'px';
            visionVideoContainer.style.top = ((vh - defaultHeight) / 2) + 'px';
        });
    }

    visionListenersAdded = true;
    console.log("Vision listeners added.");
}

// --- Phase 14: Settings ---
function initializeSettingsPopup() {
    if (settingsListenersAdded) return;
    const elements = [settingsTabsContainer, settingsTabContentContainer, settingsModelsPanel, settingsModelsList, settingsModelsAllBtn, settingsModelsNoneBtn, settingsModelsSaveBtn, settingsModelsStatus, settingsUIPanel, settingsThemeSelect, settingsTextSizeSlider, settingsTextSizeValue, settingsUISaveBtn, settingsUIStatus, settingsAboutPanel, settingsAboutContent];
    if (elements.some(el => !el)) { console.error("Settings UI elements missing!"); return; }

    console.log("Initializing Settings listeners and content.");

    // Create Chat Controls section in UI Panel
    const chatControlsSection = document.createElement('div');
    chatControlsSection.className = 'settings-section';
    chatControlsSection.innerHTML = `
        <h3>Chat Controls</h3>
        <div class="settings-controls-group">
            <button id="settings-search-btn" class="settings-control-btn">
                <i class="fas fa-search"></i> Search Messages
            </button>
            <button id="settings-export-btn" class="settings-control-btn">
                <i class="fas fa-file-export"></i> Export Conversation
            </button>
            <button id="settings-background-btn" class="settings-control-btn">
                <i class="fas fa-image"></i> Change Background
            </button>
        </div>
    `;
    
    // Add styles for the new section
    const style = document.createElement('style');
    style.textContent = `
        .settings-section {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            background: #f8f9fa;
        }
        .settings-section h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .settings-controls-group {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .settings-control-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            width: 100%;
            justify-content: flex-start;
        }
        .settings-control-btn:hover {
            background: #f0f0f0;
            border-color: #ccc;
        }
        .settings-control-btn i {
            font-size: 14px;
            width: 16px;
            text-align: center;
        }
        
        /* Hide the original icon buttons */
        #search-messages-btn,
        #export-conversation-btn,
        #change-background-btn {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Insert the chat controls section into the UI panel
    settingsUIPanel.insertBefore(chatControlsSection, settingsUISaveBtn);
    
    // Add event listeners for the new buttons
    const searchBtn = document.getElementById('settings-search-btn');
    const exportBtn = document.getElementById('settings-export-btn');
    const backgroundBtn = document.getElementById('settings-background-btn');
    
    if (searchBtn) searchBtn.addEventListener('click', () => {
        // Implement search functionality
        showSearchPopup();
    });
    
    if (exportBtn) exportBtn.addEventListener('click', () => {
        // Export conversation
        const messages = Array.from(messageDisplay.querySelectorAll('.message-bubble')).map(bubble => ({
            sender: bubble.classList.contains('user-bubble') ? 'User' : 'AI',
            text: bubble.querySelector('.message-content')?.textContent || ''
        }));
        
        const exportText = messages.map(m => `${m.sender}: ${m.text}`).join('\n\n');
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_export_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    if (backgroundBtn) backgroundBtn.addEventListener('click', () => {
        showBackgroundPopup();
    });

    // Sync theme select dropdown to current theme
    if (settingsThemeSelect && currentUISettings.theme) {
        settingsThemeSelect.value = currentUISettings.theme;
    }

    // Tab Switching Logic
    const tabButtons = settingsTabsContainer.querySelectorAll('.settings-tab-btn');
    const tabPanels = settingsTabContentContainer.querySelectorAll('.settings-tab-panel');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`settings-${tab}-panel`).classList.add('active');
        });
    });

    // Models Tab Logic
    populateSettingsModelsList(); // Populate the list on init
    settingsModelsAllBtn.addEventListener('click', () => setAllModelsChecked(true));
    settingsModelsNoneBtn.addEventListener('click', () => setAllModelsChecked(false));
    settingsModelsSaveBtn.addEventListener('click', saveModelSettings);

    // UI Tab Logic
    settingsThemeSelect.addEventListener('change', () => applyUISettings({ ...currentUISettings, theme: settingsThemeSelect.value }));
    settingsTextSizeSlider.addEventListener('input', () => {
        const newSize = settingsTextSizeSlider.value;
        settingsTextSizeValue.textContent = `${newSize}%`;
        applyUISettings({ ...currentUISettings, textSize: parseInt(newSize, 10) });
    });
    settingsUISaveBtn.addEventListener('click', saveUISettings);

    // About Tab Logic
    populateAboutTab();

    settingsListenersAdded = true;
    console.log("Settings listeners added.");
}

function populateSettingsModelsList() {
    if (!settingsModelsList) return;
    settingsModelsList.innerHTML = ''; // Clear existing
    const allModels = getAllModels(); // Get flat list of all possible models

    allModels.forEach(modelId => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'settings-model-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `model-checkbox-${modelId.replace(/[^a-zA-Z0-9]/g, '-')}`; // Sanitize ID
        checkbox.value = modelId;
        checkbox.checked = allowedModels.includes(modelId); // Check based on loaded settings

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        // Clean display name
        let displayName = modelId;
         if (displayName.includes('/')) displayName = displayName.split('/')[1];
         displayName = displayName.replace(/:free|:thinking|-exp-[\d-]+/g, '');
        label.textContent = displayName;

        // Details button
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'settings-model-details-btn';
        detailsBtn.textContent = 'Details';
        // Description (hidden by default)
        const descDiv = document.createElement('div');
        descDiv.className = 'settings-model-description';
        descDiv.textContent = `Description for ${displayName}. (Add real model descriptions here.)`;
        detailsBtn.addEventListener('click', () => {
            itemDiv.classList.toggle('details-open');
        });

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        itemDiv.appendChild(detailsBtn);
        itemDiv.appendChild(descDiv);
        settingsModelsList.appendChild(itemDiv);
    });
    console.log("Populated settings model list based on allowed models:", allowedModels);
}

function setAllModelsChecked(isChecked) {
    if (!settingsModelsList) return;
    const checkboxes = settingsModelsList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = isChecked);
}

async function saveModelSettings() {
    if (!settingsModelsList || !puter.kv || !settingsModelsStatus) return;
    const checkedBoxes = settingsModelsList.querySelectorAll('input[type="checkbox"]:checked');
    const selected = Array.from(checkedBoxes).map(cb => cb.value);

    settingsModelsStatus.textContent = 'Saving...';
    settingsModelsStatus.style.color = 'orange';
    try {
        await puter.kv.set('settings_models', JSON.stringify(selected)); //
        settingsModelsStatus.textContent = 'Model selection saved!';
        settingsModelsStatus.style.color = 'green';
        console.log("Saved allowed models:", selected);
        // Reload settings to update UI (main dropdown and this list)
        await loadModelSettings();
    } catch (error) {
        console.error("Error saving model settings:", error);
        settingsModelsStatus.textContent = 'Error saving settings.';
        settingsModelsStatus.style.color = 'red';
    } finally {
        setTimeout(() => { if(settingsModelsStatus) settingsModelsStatus.textContent = ''; }, 2000);
    }
}

async function loadModelSettings() {
    console.log("Loading model settings...");
    try {
        if (!puter.kv) throw new Error("KV missing.");
        const savedModelsString = await puter.kv.get('settings_models'); //
        if (savedModelsString) {
            allowedModels = JSON.parse(savedModelsString);
            console.log("Loaded allowed models from KV:", allowedModels);
        } else {
            // Default: allow all models if nothing saved
            allowedModels = getAllModels();
            console.log("No saved models found, defaulting to all models.");
        }
    } catch (error) {
        console.error("Error loading model settings, defaulting to all:", error);
        allowedModels = getAllModels();
    }
    // Repopulate main selector with allowed models
    populateModelSelector(allowedModels);
    // Repopulate settings list (will happen if settings popup is open/opened)
    if (popups.settings?.style.display === 'flex' && settingsModelsList) {
         populateSettingsModelsList();
    }
}

function applyUISettings(settings) {
     if (!settings) return;
     currentUISettings = settings; // Update state

     // Remove all theme classes
     document.body.classList.remove('theme-light', 'theme-dark', 'theme-grey', 'theme-sunset');
     document.body.classList.add(`theme-${settings.theme || 'light'}`);
     console.log(`Applied theme: ${settings.theme || 'light'}`);

     // Apply CSS variables for each theme
     if ((settings.theme || 'light') === 'dark') {
         document.body.style.setProperty('--background-color', '#181a1b');
         document.body.style.setProperty('--foreground-color', '#e8eaed');
         document.body.style.setProperty('--primary-color', '#23272a');
         document.body.style.setProperty('--secondary-color', '#2c2f33');
         document.body.style.setProperty('--accent-color', '#7289da');
         document.body.style.setProperty('--border-color', '#444950');
         document.body.style.setProperty('--input-bg', '#23272a');
         document.body.style.setProperty('--input-fg', '#e8eaed');
     } else if ((settings.theme || 'light') === 'grey') {
         document.body.style.setProperty('--background-color', '#4a4a4a');
         document.body.style.setProperty('--foreground-color', '#ffffff');
         document.body.style.setProperty('--primary-color', '#5a5a5a');
         document.body.style.setProperty('--secondary-color', '#6a6a6a');
         document.body.style.setProperty('--accent-color', '#bdbdbd');
         document.body.style.setProperty('--border-color', '#888');
         document.body.style.setProperty('--input-bg', '#5a5a5a');
         document.body.style.setProperty('--input-fg', '#ffffff');
     } else if ((settings.theme || 'light') === 'sunset') {
         document.body.style.setProperty('--background-color', '#ff7b54');
         document.body.style.setProperty('--foreground-color', '#ffffff');
         document.body.style.setProperty('--primary-color', '#ff9770');
         document.body.style.setProperty('--secondary-color', '#ffd56f');
         document.body.style.setProperty('--accent-color', '#ffb26b');
         document.body.style.setProperty('--border-color', '#ffb26b');
         document.body.style.setProperty('--input-bg', '#ff9770');
         document.body.style.setProperty('--input-fg', '#ffffff');
     } else {
         // Reset to default (light) theme variables
         document.body.style.setProperty('--background-color', '');
         document.body.style.setProperty('--foreground-color', '');
         document.body.style.setProperty('--primary-color', '');
         document.body.style.setProperty('--secondary-color', '');
         document.body.style.setProperty('--accent-color', '');
         document.body.style.setProperty('--border-color', '');
         document.body.style.setProperty('--input-bg', '');
         document.body.style.setProperty('--input-fg', '');
     }

     // Apply Text Size (Using CSS variable on body)
     const multiplier = (settings.textSize || 100) / 100;
     document.body.style.setProperty('--base-font-size-multiplier', multiplier);
     console.log(`Applied text size multiplier: ${multiplier}`);

     // Update controls in settings popup if visible
     if (settingsThemeSelect) settingsThemeSelect.value = settings.theme || 'light';
     if (settingsTextSizeSlider) settingsTextSizeSlider.value = settings.textSize || 100;
     if (settingsTextSizeValue) settingsTextSizeValue.textContent = `${settings.textSize || 100}%`;
}

async function loadUISettings() {
     console.log("Loading UI settings...");
     let loadedSettings = null;
     try {
         if (!puter.kv) throw new Error("KV missing.");
         const savedUISettingsString = await puter.kv.get('settings_ui'); //
         if (savedUISettingsString) {
             loadedSettings = JSON.parse(savedUISettingsString);
             console.log("Loaded UI settings from KV:", loadedSettings);
         } else {
             console.log("No saved UI settings found, using defaults.");
         }
     } catch (error) {
         console.error("Error loading UI settings, using defaults:", error);
     }
     // Apply loaded settings or defaults
     applyUISettings({ ...defaultUISettings, ...loadedSettings });
}

async function saveUISettings() {
    if (!settingsThemeSelect || !settingsTextSizeSlider || !puter.kv || !settingsUIStatus) return;

    const settingsToSave = {
        theme: settingsThemeSelect.value,
        textSize: parseInt(settingsTextSizeSlider.value, 10)
    };

    settingsUIStatus.textContent = 'Saving...';
    settingsUIStatus.style.color = 'orange';
    try {
        await puter.kv.set('settings_ui', JSON.stringify(settingsToSave)); //
        settingsUIStatus.textContent = 'UI settings saved!';
        settingsUIStatus.style.color = 'green';
        console.log("Saved UI settings:", settingsToSave);
        // Settings are already applied live, no need to reload here
    } catch (error) {
        console.error("Error saving UI settings:", error);
        settingsUIStatus.textContent = 'Error saving settings.';
        settingsUIStatus.style.color = 'red';
    } finally {
         setTimeout(() => { if(settingsUIStatus) settingsUIStatus.textContent = ''; }, 2000);
    }
}

function populateAboutTab() {
    if (!settingsAboutContent) return;
    settingsAboutContent.innerHTML = `
        <p>This application utilizes the Puter.js SDK to interact with various AI models and cloud services.</p>
        <p>Developed with assistance from Google AI.</p>
        <p>Powered by <a href="https://puter.com" target="_blank" rel="noopener noreferrer">Puter.com</a></p>
        <p><a href="https://github.com/HeyPuter/puter" target="_blank" rel="noopener noreferrer">Puter on GitHub</a></p>
        <p><a href="https://docs.puter.com" target="_blank" rel="noopener noreferrer">Puter.js Documentation</a></p>
    `;
}

// --- Initialization ---
function initializeChatListeners() {
    // ... (remains the same) ...
    if (!chatInput || !sendButton || !messageDisplay) {
        console.warn("Chat elements missing."); setTimeout(initializeChatListeners, 200); return false;
    }
    if (isChatInitialized) return true;
    console.log("Adding chat listeners.");
    if (!sendButton.getAttribute('data-listener-added')) {
        sendButton.addEventListener('click', sendMessage); sendButton.setAttribute('data-listener-added', 'true');
    }
    if (!chatInput.getAttribute('data-listener-added')) {
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100;
            requestAnimationFrame(() => { scrollHeight = chatInput.scrollHeight; chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px'; });
        });
        chatInput.setAttribute('data-listener-added', 'true');
    }
    isChatInitialized = true; chatInput.disabled = false; sendButton.disabled = false;
    if (document.body.contains(chatInput)) chatInput.focus();
    console.log("Chat listeners added.");
    return true;
}

function initializeBannerAndPopups() {
    console.log("Initializing banner/popups.");
    const buttonPopupMap = {
        'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr',
        'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' // Added settings
    };
    for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) {
        const button = document.getElementById(buttonId);
        if (button && !button.getAttribute('data-popup-listener-added')) {
            button.addEventListener('click', () => {
                showPopup(popupId); // Show the popup

                const targetPopup = popups[popupId];
                // Initialize listeners *once* when the popup is first shown
                if (targetPopup && !targetPopup.getAttribute('data-show-listener-added')) {
                    targetPopup.addEventListener('show', () => {
                        console.log(`Initializing listeners for ${popupId} popup (first show)`);
                        if (popupId === 'tts') initializeTTSListeners();
                        else if (popupId === 'imgGen') initializeImageGenPopup();
                        else if (popupId === 'ocr') initializeOcrPopup();
                        else if (popupId === 'vision') initializeVisionPopup();
                        else if (popupId === 'settings') initializeSettingsPopup(); // Initialize settings
                        // History is slightly different - content loads each time
                        if (popupId === 'history') displayChatHistory();
                    }, { once: true }); // Use { once: true } if listeners only need to be added once
                    targetPopup.setAttribute('data-show-listener-added', 'true');
                }
                 // Special case for history: refresh content each time it's shown
                 if (popupId === 'history') {
                    const targetPopup = popups[popupId];
                     if (targetPopup){
                        targetPopup.removeEventListener('show', displayChatHistory); // Remove previous listener if any
                        targetPopup.addEventListener('show', displayChatHistory); // Add fresh listener
                     }
                 }
                 // Special case for Settings: refresh model list each time
                 if (popupId === 'settings') {
                     const targetPopup = popups[popupId];
                     if(targetPopup) {
                        targetPopup.removeEventListener('show', populateSettingsModelsList);
                        targetPopup.addEventListener('show', populateSettingsModelsList);
                     }
                 }
            });
            button.setAttribute('data-popup-listener-added', 'true');
        } else if (!button) console.warn(`Banner button #${buttonId} missing.`);
    }
    // ... (rest of the banner/popup init remains the same) ...
    const newChatBtn = bannerButtons.newChat;
    if (newChatBtn && !newChatBtn.getAttribute('data-newchat-listener-added')) {
        newChatBtn.addEventListener('click', () => { console.log("New Chat clicked"); closeActivePopup(); startNewChat(); });
        newChatBtn.setAttribute('data-newchat-listener-added', 'true');
    } else if (!newChatBtn) console.warn(`New chat button missing.`);
    if (popupBackdrop && !popupBackdrop.getAttribute('data-backdrop-listener-added')) {
        popupBackdrop.addEventListener('click', closeActivePopup); popupBackdrop.setAttribute('data-backdrop-listener-added', 'true');
    } else if (!popupBackdrop) console.warn(`Backdrop missing.`);
    const closeButtons = document.querySelectorAll('.close-popup-btn');
    closeButtons.forEach(button => {
        const parentPopup = button.closest('.popup');
        if (parentPopup && !button.getAttribute('data-close-listener-added')) {
            button.addEventListener('click', closeActivePopup); button.setAttribute('data-close-listener-added', 'true');
        } else if (!parentPopup) console.warn("Close button outside popup?", button);
    });
    console.log("Banner/Popup listeners initialized.");
}

async function initializeAppState() { // Modified to be async
    console.log("Initializing app state...");
    // Load settings first, as they affect model population
    await loadUISettings(); // Load and apply UI settings (theme, text size)
    await loadModelSettings(); // Load allowed models and populate main dropdown

    initializeChatListeners();
    initializeBannerAndPopups();
    initializeChatMicInput();
    // Specific popup listeners are initialized lazily
}

async function initialAuthCheck(retryCount = 0) {
    if (typeof puter === 'undefined' || !puter.auth?.isSignedIn) {
        if (retryCount < 5) { console.warn(`SDK retry ${retryCount + 1}`); setTimeout(() => initialAuthCheck(retryCount + 1), 500 * (retryCount + 1)); return; }
        else { console.error("SDK failed."); if (authStatusDiv) authStatusDiv.textContent = "Error: SDK failed."; if (signInButton) signInButton.disabled = true; return; }
    }
    console.log("Initial auth check...");
    try {
        const isSignedIn = puter.auth.isSignedIn();
        console.log("Initial status:", isSignedIn);
        await updateUiForAuthState(isSignedIn); // This now calls initializeAppState if signed in
    } catch (error) {
        console.error("Initial auth error:", error);
        await updateUiForAuthState(false);
        applyUISettings(defaultUISettings); // Apply default UI if auth fails
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded.");
    // Set default UI settings immediately before checking auth
    applyUISettings(defaultUISettings);
    if (typeof puter !== 'undefined') initialAuthCheck();
    else { console.warn("SDK delay."); setTimeout(initialAuthCheck, 300); }
});

// First, let's create a function to lazy load popup modules
function lazyLoadPopupModule(popupId) {
    let modulePromise;
    switch(popupId) {
        case 'imgGen':
            modulePromise = import('./modules/imageGeneration.js');
            break;
        case 'ocr':
            modulePromise = import('./modules/ocr.js');
            break;
        case 'vision': 
            modulePromise = import('./modules/vision.js');
            break;
        case 'tts':
            modulePromise = import('./modules/tts.js');
            break;
        case 'settings':
            modulePromise = import('./modules/settings.js');
            break;
    }
    return modulePromise;
}

// Cache DOM elements on load
const UI = {
    elements: new Map(),
    init() {
        // Cache all frequently used elements
        const elements = [
            'chat-input', 'send-button', 'message-display',
            'model-selector', 'auth-section', 'chat-ui',
            // ... other element IDs
        ];
        elements.forEach(id => {
            this.elements.set(id, document.getElementById(id));
        });
    },
    get(id) {
        return this.elements.get(id);
    }
};

// Use event delegation for message actions
messageDisplay.addEventListener('click', (e) => {
    const action = e.target.closest('.action-button');
    if (!action) return;
    
    const messageContent = action.closest('.message-bubble')
        .querySelector('.message-content').textContent;
        
    switch(action.title) {
        case 'Resend': resendMessage(messageContent); break;
        case 'Copy': copyMessage(messageContent); break;
        case 'Delete': deleteMessage(action.closest('.message-bubble')); break;
        case 'Speak': speakMessage(messageContent, action); break;
    }
});

const AppSettings = {
    cache: new Map(),
    async load(key) {
        if (this.cache.has(key)) return this.cache.get(key);
        
        const value = await puter.kv.get(key);
        if (value) {
            this.cache.set(key, JSON.parse(value));
            return this.cache.get(key);
        }
        return null;
    },
    async save(key, value) {
        this.cache.set(key, value);
        await puter.kv.set(key, JSON.stringify(value));
    }
};

function optimizeImage(dataUrl, maxWidth = 800) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (maxWidth * height) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = dataUrl;
    });
}

const Performance = {
    marks: new Map(),
    start(id) {
        this.marks.set(id, performance.now());
    },
    end(id) {
        const start = this.marks.get(id);
        if (start) {
            const duration = performance.now() - start;
            console.debug(`${id} took ${duration.toFixed(2)}ms`);
            this.marks.delete(id);
            return duration;
        }
    }
};

// In the settingsThemeSelect dropdown, ensure 'dark' option is present
if (settingsThemeSelect && !settingsThemeSelect.querySelector('option[value="dark"]')) {
    const darkOption = document.createElement('option');
    darkOption.value = 'dark';
    darkOption.textContent = 'Dark';
    settingsThemeSelect.appendChild(darkOption);
}

// --- Sign In Guard ---
function requireSignIn() {
    if (typeof puter === 'undefined' || !puter.auth?.isSignedIn) {
        alert('Puter SDK not loaded.');
        return false;
    }
    if (!puter.auth.isSignedIn()) {
        alert('You must be signed in to use this feature.');
        return false;
    }
    return true;
}

// --- Image Generation Popup Tab Switching and Button Visibility ---
function updateImgGenFooterButton() {
    const storyTab = document.getElementById('img-gen-story-mode');
    const storyBtn = document.getElementById('story-generate-btn');
    const basicTab = document.getElementById('img-gen-basic-mode');
    const cardTab = document.getElementById('img-gen-card-mode');
    const comicTab = document.getElementById('img-gen-comic-mode');
    const activePanel = document.querySelector('.img-gen-mode-panel.active');
    if (activePanel === storyTab) {
        storyBtn.style.display = '';
    } else {
        storyBtn.style.display = 'none';
    }
    // Center the Generate button in Basic tab
    const basicGenBtn = document.getElementById('img-gen-generate-btn');
    if (activePanel === basicTab && basicGenBtn) {
        basicGenBtn.style.display = 'block';
        basicGenBtn.style.margin = '0 auto';
    } else if (basicGenBtn) {
        basicGenBtn.style.display = '';
        basicGenBtn.style.margin = '';
    }
}

// Patch tab switching to update footer button
const imgGenModes = document.getElementById('img-gen-modes');
if (imgGenModes) {
    imgGenModes.addEventListener('click', updateImgGenFooterButton);
}
document.addEventListener('DOMContentLoaded', updateImgGenFooterButton);

// Also update on popup open
const imgGenPopup = document.getElementById('img-gen-popup');
if (imgGenPopup) {
    imgGenPopup.addEventListener('show', updateImgGenFooterButton);
}

// --- Card Tab: Search Card Image and Download Card Button ---
// Use already declared variables at the top of the file
// const cardSearchImgBtn = document.getElementById('card-search-img-btn');
// const cardImageSearchResults = document.getElementById('card-image-search-results');
// const cardGenerateBtn = document.getElementById('card-generate-btn');
// const cardDownloadBtn = document.getElementById('card-download-btn');

if (cardSearchImgBtn) {
    cardSearchImgBtn.onclick = async function() {
        const query = cardVisualDescInput.value.trim();
        if (!query) { alert('Please enter a visual description to search.'); return; }
        cardImageSearchResults.innerHTML = '<div style="text-align:center;padding:10px;"><i class="fas fa-spinner fa-spin"></i> Searching images...</div>';
        // Simulate search with placeholder images
        setTimeout(() => {
            cardImageSearchResults.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                const img = document.createElement('img');
                img.src = `https://placehold.co/120x80?text=Card+${i+1}`;
                img.alt = `Card Search Result ${i+1}`;
                img.onclick = () => selectCardImage(img);
                cardImageSearchResults.appendChild(img);
            }
        }, 1200);
    };
}

if (cardDownloadBtn) {
    cardDownloadBtn.onclick = function() {
        alert('PDF/Image Download for Card mode is not yet implemented.');
    };
}

// ... existing code ...
    // --- Draggable & Pinch-Resizable Vision Video Container (with inertia, aspect ratio lock, and global drag) ---
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let initialLeft = 0, initialTop = 0;
    let lastDragX = 0, lastDragY = 0;
    let velocityX = 0, velocityY = 0;
    let inertiaFrame = null;
    let isPinching = false;
    let initialDistance = 0;
    let initialWidth = 0, initialHeight = 0;
    let aspectRatio = 1;

    // Make the preview absolutely positioned relative to the viewport
    visionVideoContainer.style.position = 'fixed';
    visionVideoContainer.style.left = '0px';
    visionVideoContainer.style.top = '0px';
    visionVideoContainer.style.cursor = 'move';

    // Helper: Clamp preview within viewport
    function clampToViewport(left, top, width, height) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        left = Math.max(0, Math.min(left, vw - width));
        top = Math.max(0, Math.min(top, vh - height));
        return [left, top];
    }

    // Mouse drag
    visionVideoContainer.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        isDragging = true;
        visionVideoContainer.classList.add('dragging');
        const rect = visionVideoContainer.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        initialLeft = rect.left;
        initialTop = rect.top;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
        aspectRatio = rect.width / rect.height;
        document.body.style.userSelect = 'none';
        if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const width = visionVideoContainer.offsetWidth;
        const height = visionVideoContainer.offsetHeight;
        let newLeft = e.clientX - dragOffsetX;
        let newTop = e.clientY - dragOffsetY;
        [newLeft, newTop] = clampToViewport(newLeft, newTop, width, height);
        visionVideoContainer.style.left = newLeft + 'px';
        visionVideoContainer.style.top = newTop + 'px';
        velocityX = e.clientX - lastDragX;
        velocityY = e.clientY - lastDragY;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
    });
    document.addEventListener('mouseup', function() {
        if (isDragging) visionVideoContainer.classList.remove('dragging');
        if (isDragging && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
            // Inertia
            let left = parseFloat(visionVideoContainer.style.left);
            let top = parseFloat(visionVideoContainer.style.top);
            const width = visionVideoContainer.offsetWidth;
            const height = visionVideoContainer.offsetHeight;
            function glide() {
                left += velocityX;
                top += velocityY;
                [left, top] = clampToViewport(left, top, width, height);
                visionVideoContainer.style.left = left + 'px';
                visionVideoContainer.style.top = top + 'px';
                velocityX *= 0.92;
                velocityY *= 0.92;
                if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                    inertiaFrame = requestAnimationFrame(glide);
                }
            }
            inertiaFrame = requestAnimationFrame(glide);
        }
        isDragging = false;
        document.body.style.userSelect = '';
    });

    // Touch drag & pinch
    visionVideoContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            visionVideoContainer.classList.add('dragging');
            const rect = visionVideoContainer.getBoundingClientRect();
            dragOffsetX = e.touches[0].clientX - rect.left;
            dragOffsetY = e.touches[0].clientY - rect.top;
            initialLeft = rect.left;
            initialTop = rect.top;
            lastDragX = e.touches[0].clientX;
            lastDragY = e.touches[0].clientY;
            aspectRatio = rect.width / rect.height;
            document.body.style.userSelect = 'none';
            if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
        } else if (e.touches.length === 2) {
            isPinching = true;
            isDragging = false;
            const rect = visionVideoContainer.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            aspectRatio = rect.width / rect.height;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialDistance = Math.sqrt(dx * dx + dy * dy);
        }
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
            const width = visionVideoContainer.offsetWidth;
            const height = visionVideoContainer.offsetHeight;
            let newLeft = e.touches[0].clientX - dragOffsetX;
            let newTop = e.touches[0].clientY - dragOffsetY;
            [newLeft, newTop] = clampToViewport(newLeft, newTop, width, height);
            visionVideoContainer.style.left = newLeft + 'px';
            visionVideoContainer.style.top = newTop + 'px';
            velocityX = e.touches[0].clientX - lastDragX;
            velocityY = e.touches[0].clientY - lastDragY;
            lastDragX = e.touches[0].clientX;
            lastDragY = e.touches[0].clientY;
        } else if (isPinching && e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let scale = dist / initialDistance;
            let newWidth = Math.max(60, Math.min(window.innerWidth, initialWidth * scale));
            let newHeight = newWidth / aspectRatio;
            visionVideoContainer.style.width = newWidth + 'px';
            visionVideoContainer.style.height = newHeight + 'px';
        }
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', function(e) {
        if (isDragging) visionVideoContainer.classList.remove('dragging');
        if (isDragging && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
            // Inertia
            let left = parseFloat(visionVideoContainer.style.left);
            let top = parseFloat(visionVideoContainer.style.top);
            const width = visionVideoContainer.offsetWidth;
            const height = visionVideoContainer.offsetHeight;
            function glide() {
                left += velocityX;
                top += velocityY;
                [left, top] = clampToViewport(left, top, width, height);
                visionVideoContainer.style.left = left + 'px';
                visionVideoContainer.style.top = top + 'px';
                velocityX *= 0.92;
                velocityY *= 0.92;
                if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                    inertiaFrame = requestAnimationFrame(glide);
                }
            }
            inertiaFrame = requestAnimationFrame(glide);
        }
        isDragging = false;
        isPinching = false;
        document.body.style.userSelect = '';
    });
// ... existing code ...

if (settingsTextSizeSlider) {
    settingsTextSizeSlider.addEventListener('input', () => {
        const newSize = settingsTextSizeSlider.value;
        if (settingsTextSizeValue) settingsTextSizeValue.textContent = `${newSize}%`;
        document.body.style.setProperty('--base-font-size-multiplier', newSize / 100);
        // Optionally, update other UI elements if needed
    });
}

// Desktop resize handle logic
function addResizeHandleToVisionContainer() {
    let isResizing = false;
    let resizeStartX = 0, resizeStartY = 0, startWidth = 0, startHeight = 0;

    // Add a resize handle (bottom-right corner)
    let resizeHandle = visionVideoContainer.querySelector('.vision-resize-handle');
    if (!resizeHandle) {
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'vision-resize-handle';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.right = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.width = '24px';
        resizeHandle.style.height = '24px';
        resizeHandle.style.background = 'rgba(0,0,0,0.15)';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.zIndex = '30';
        visionVideoContainer.appendChild(resizeHandle);
    }
    
    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        startWidth = visionVideoContainer.offsetWidth;
        startHeight = visionVideoContainer.offsetHeight;
        document.body.style.userSelect = 'none';
        e.stopPropagation();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        let newWidth = Math.max(60, startWidth + (e.clientX - resizeStartX));
        let newHeight = Math.max(40, startHeight + (e.clientY - resizeStartY));
        visionVideoContainer.style.width = newWidth + 'px';
        visionVideoContainer.style.height = newHeight + 'px';
    });
    
    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.userSelect = '';
        }
    });
}

// Call this function after initialization to ensure resize handle is added
if (visionVideoContainer) {
    addResizeHandleToVisionContainer();
}

// Default front camera (selfie mode)
let visionFacingMode = 'user';

async function startVisionCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { alert('Camera API not supported.'); return; }
    if (!visionVideoPreview || !visionEnableCamBtn || !visionVideoContainer || !visionControls || !visionStatus) return;
    visionStatus.textContent = 'Requesting camera access...';
    visionStatus.style.display = 'block'; visionStatus.style.color = '#6c757d';
    visionEnableCamBtn.disabled = true;
    
    try {
        // First, ensure any existing stream is properly stopped
        if (visionStream) {
            visionStream.getTracks().forEach(track => track.stop());
            visionStream = null;
        }
        
        // On mobile, we need to be specific about the camera we want
        const constraints = {
            video: {
                facingMode: visionFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        console.log(`Attempting to access camera with facing mode: ${visionFacingMode}`);
        visionStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log("Camera stream obtained successfully.");
        
        // Update flip button text based on current camera
        if (visionFlipCamBtn) {
            visionFlipCamBtn.innerHTML = visionFacingMode === 'user' 
                ? '<i class="fas fa-sync-alt"></i> Switch to Back Camera'
                : '<i class="fas fa-sync-alt"></i> Switch to Front Camera';
        }
        
        visionVideoPreview.srcObject = visionStream;
        visionVideoPreview.onloadedmetadata = () => {
            visionVideoPreview.play().catch(e => console.error("Video play failed:", e)); 
            visionEnableCamBtn.style.display = 'none';
            visionVideoContainer.style.display = 'block';
            visionControls.style.display = 'block';
            visionStatus.style.display = 'none';
            clearVisionResults(); // Clear previous results when starting camera
            console.log("Camera preview started.");
        };
        visionVideoPreview.onerror = (e) => {
            console.error("Video preview error:", e);
            visionStatus.textContent = `Video error: ${e.message || 'Unknown'}`;
            visionStatus.style.color = 'red';
            stopVisionCamera(); // Stop if video errors out
        };
        // Make video preview resize with container
        visionVideoPreview.style.width = '100%';
        visionVideoPreview.style.height = '100%';
    } catch (err) {
        console.error("Error accessing camera:", err);
        visionStatus.textContent = `Error accessing camera: ${err.name}. Check permissions.`;
        visionStatus.style.color = 'red';
        visionEnableCamBtn.disabled = false;
    }
}

function stopVisionCamera() {
    if (visionStream) {
        visionStream.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped.");
    }
    visionStream = null;
    lastCapturedFrameDataUrl = null;
    if (visionVideoPreview) visionVideoPreview.srcObject = null;
    if (visionEnableCamBtn) visionEnableCamBtn.style.display = 'block';
    if (visionVideoContainer) visionVideoContainer.style.display = 'none';
    if (visionControls) visionControls.style.display = 'none';
    if (visionActions) visionActions.style.display = 'none';
    if (visionStatus) visionStatus.style.display = 'none';
    if (visionResultsText) visionResultsText.value = '';
    if (visionEnableCamBtn) visionEnableCamBtn.disabled = false;
}

async function describeVisionFrame() {
    if (!visionVideoPreview || !visionStream || !visionDescribeBtn || !visionResultsText || !visionStatus || !visionActions) {
        console.error("Vision elements missing for description."); return;
    }
    if (visionVideoPreview.readyState < visionVideoPreview.HAVE_CURRENT_DATA) { // Check if frame data is available
        console.warn("Video not ready for capture."); visionStatus.textContent = 'Video not ready...';
        visionStatus.style.display = 'block'; return;
    }
    visionDescribeBtn.disabled = true;
    visionStatus.textContent = 'Capturing frame...'; visionStatus.style.color = '#6c757d';
    visionStatus.style.display = 'block';
    visionResultsText.value = ''; visionActions.style.display = 'none'; // Hide actions during processing

    try {
        // Create canvas if it doesn't exist
        if (!visionCanvas) visionCanvas = document.createElement('canvas');
        const videoWidth = visionVideoPreview.videoWidth;
        const videoHeight = visionVideoPreview.videoHeight;
        if (videoWidth === 0 || videoHeight === 0) { throw new Error("Video dimensions are zero."); }
        visionCanvas.width = videoWidth;
        visionCanvas.height = videoHeight;
        const context = visionCanvas.getContext('2d');
        context.drawImage(visionVideoPreview, 0, 0, videoWidth, videoHeight);
        // Get frame as JPEG data URL
        lastCapturedFrameDataUrl = visionCanvas.toDataURL('image/jpeg', 0.9);
        console.log("Frame captured (JPEG data URL length):", lastCapturedFrameDataUrl.length);

        visionStatus.textContent = 'Asking AI to describe...';
        if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat missing.");

        // Use a vision-capable model
        const visionModelToUse = 'gpt-4o-mini'; // Or 'gpt-4o', 'pixtral-large-latest' etc.
        console.log(`Sending frame to Vision model: ${visionModelToUse}`);

        // Call puter.ai.chat with prompt and image data URL
        const response = await puter.ai.chat("Describe this image in detail.", lastCapturedFrameDataUrl, { model: visionModelToUse });

        console.log("Vision response received:", response);
        let aiText = "Sorry, couldn't get description.";
        if (response && typeof response === 'string') aiText = response;
        else if (response?.text) aiText = response.text;
        else if (response?.message?.content) aiText = response.message.content;
        else if (response?.error) aiText = `Error: ${response.error.message || response.error}`;
        else console.warn("Unexpected vision response:", response);

        visionResultsText.value = aiText;
        visionStatus.style.display = 'none';
        visionActions.style.display = 'block'; // Show action buttons
        visionSpeakBtn.disabled = !aiText;
        visionCopyBtn.disabled = !aiText;
        visionSaveImgBtn.disabled = false; // Enable save image now that frame is captured

    } catch (error) {
        console.error("Error describing vision frame:", error);
        visionStatus.textContent = `Error: ${error.message || 'Unknown error'}`;
        visionStatus.style.color = 'red';
        lastCapturedFrameDataUrl = null; // Clear invalid frame data
        visionSaveImgBtn.disabled = true; // Disable save if error occurred
    } finally {
        visionDescribeBtn.disabled = false; // Re-enable describe button
    }
}

function clearVisionResults() {
    if (visionResultsText) visionResultsText.value = '';
    if (visionActions) visionActions.style.display = 'none';
    if (visionStatus) visionStatus.style.display = 'none';
    if (visionSpeakBtn) visionSpeakBtn.disabled = true;
    if (visionCopyBtn) visionCopyBtn.disabled = true;
    // Keep save image button enabled if a frame was captured
    // Don't clear lastCapturedFrameDataUrl here
}

function saveVisionImage() {
    if (!lastCapturedFrameDataUrl) { alert("No image captured to save."); return; }
    saveImageFromDataUrl(lastCapturedFrameDataUrl, `vision_capture_${Date.now()}`);
}

// Add helper functions for the popups
function showSearchPopup() {
    const searchPopup = document.createElement('div');
    searchPopup.className = 'popup';
    searchPopup.id = 'search-popup';
    searchPopup.innerHTML = `
        <div class="popup-header">
            <h2>Search Messages</h2>
            <button class="close-popup-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="popup-content-area">
            <div class="search-container">
                <div class="search-input-group">
                    <input type="text" class="search-input" placeholder="Search messages...">
                    <button class="search-button"><i class="fas fa-search"></i></button>
                </div>
                <div class="search-options-group">
                    <label class="search-option">
                        <input type="checkbox" checked> Case sensitive
                    </label>
                    <label class="search-option">
                        <input type="checkbox" checked> Match whole words
                    </label>
                </div>
                <div class="search-results-container">
                    <div class="search-results"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(searchPopup);
    
    // Initialize search functionality
    const searchInput = searchPopup.querySelector('.search-input');
    const searchButton = searchPopup.querySelector('.search-button');
    const searchResults = searchPopup.querySelector('.search-results');
    
    // Add search logic here
    // ... implementation of search functionality ...
    
    // Close button functionality
    const closeBtn = searchPopup.querySelector('.close-popup-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(searchPopup);
    });
}

function showBackgroundPopup() {
    const backgroundPopup = document.createElement('div');
    backgroundPopup.className = 'popup';
    backgroundPopup.id = 'background-popup';
    backgroundPopup.innerHTML = `
        <div class="popup-header">
            <h2>Change Background</h2>
            <button class="close-popup-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="popup-content-area">
            <div class="background-settings-container">
                <div class="background-type-group">
                    <label>
                        <input type="radio" name="bg-type" value="color" checked> Solid Color
                    </label>
                    <label>
                        <input type="radio" name="bg-type" value="gradient"> Gradient
                    </label>
                    <label>
                        <input type="radio" name="bg-type" value="image"> Image
                    </label>
                </div>
                <div class="background-custom-input">
                    <input type="color" id="bg-color-picker" value="#f0f2f5">
                </div>
                <div class="background-preview">
                    Preview
                </div>
                <button class="background-apply-button">Apply Background</button>
            </div>
        </div>
    `;
    document.body.appendChild(backgroundPopup);
    
    // Initialize background settings functionality
    const colorPicker = backgroundPopup.querySelector('#bg-color-picker');
    const applyButton = backgroundPopup.querySelector('.background-apply-button');
    const preview = backgroundPopup.querySelector('.background-preview');
    
    // Add background change logic here
    // ... implementation of background change functionality ...
    
    // Close button functionality
    const closeBtn = backgroundPopup.querySelector('.close-popup-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(backgroundPopup);
    });
}
