// Puter AI Chat App Logic
console.log("Puter AI Chat App script loaded.");


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
const usernameDisplay = document.getElementById('username-display'); // Added
const historyList = document.getElementById('history-list'); // Phase 8


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
    settings: document.getElementById('settings-popup')
};
// --- End Phase 6 Elements ---


// Phase 9 elements
const ttsTextInput = document.getElementById('tts-text-input');
const ttsSendButton = document.getElementById('tts-send-button');
const ttsMicButton = document.getElementById('tts-mic-button');
const ttsOutputArea = document.getElementById('tts-output-area');
// --- End Phase 9 Elements


// Phase 10 elements
const micButton = document.getElementById('mic-button');
// --- End Phase 10 elements


// Phase 11 elements
const imgGenPrompt = document.getElementById('img-gen-prompt');
const imgGenGenerateBtn = document.getElementById('img-gen-generate-btn');
const imgGenResults = document.getElementById('img-gen-results');
const imgGenLoading = document.getElementById('img-gen-loading');
const imgGenError = document.getElementById('img-gen-error');
const imgGenModeButtonsContainer = document.getElementById('img-gen-modes'); // Added
const imgGenModePanelsContainer = document.getElementById('img-gen-mode-ui'); // Added
// Image Modal elements
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModal = document.getElementById('image-modal');
const expandedImage = document.getElementById('expanded-image');
const imageModalSaveBtn = document.getElementById('image-modal-save');
const imageModalCloseBtn = document.getElementById('image-modal-close');
// --- End Phase 11 elements


// --- App State ---
let selectedModel = 'gpt-4o-mini'; // Default model
let isChatInitialized = false;
let activePopup = null;
let chatHistory = []; // Placeholder for KV store
let recognition; // Speech recognition object (for main chat)
let isChatMicRecording = false;
let ttsListenersAdded = false;

// TTS Recording State
let ttsMediaRecorder;
let ttsAudioChunks = [];
let isTTSMicRecording = false;
let ttsStream = null;

// Image Gen State
let imgGenListenersAdded = false;
let currentImageGenMode = 'basic'; // Default mode


// --- Model List (Updated & Grouped) ---
const modelGroups = {
    "OpenAI": [
        'gpt-4o-mini', 'gpt-4o', 'o1', 'o1-mini', 'o1-pro', 'o3', 'o3-mini', 'o4-mini',
        'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview',
        // txt2img likely uses DALL-E 3 by default
    ],
    "Anthropic": [
        'claude-3-7-sonnet', 'claude-3-5-sonnet',
    ],
    "Google": [
        'google/gemini-2.5-pro-exp-03-25:free', // Added
        'google/gemini-2.5-flash-preview',    // Added
        'google/gemini-2.5-flash-preview:thinking', // Added
        'google/gemini-2.0-flash-lite-001',  // Added
        'google/gemini-2.0-flash-thinking-exp:free', // Added
        'google/gemini-2.0-flash-001',       // Added
        'google/gemini-2.0-flash-exp:free',    // Added
        'gemini-2.0-flash', // Existing
        'gemini-1.5-flash', // Existing
        'google/gemma-2-27b-it', // Existing
    ],
     "Meta": [
        'meta-llama/llama-4-maverick', // Added
        'meta-llama/llama-4-scout',    // Added
        'meta-llama/llama-3.3-70b-instruct', // Added
        'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
        'meta-llama/llama-guard-3-8b',  // Added
        'meta-llama/llama-guard-2-8b'   // Added
    ],
    "Mistral": [
        'mistral-large-latest', 'pixtral-large-latest', 'codestral-latest',
    ],
    "xAI / Grok": [ // Combined label
        'grok-beta',
        'x-ai/grok-3-beta' // Added
    ],
    "DeepSeek": [
        'deepseek-chat', 'deepseek-reasoner',
    ]
};


// --- Authentication Logic ---
async function updateUiForAuthState(isSignedIn) {
    if (!authSectionDiv || !chatUiDiv) { console.error("Core UI elements missing."); return; }
    if (isSignedIn) {
        try {
            if (authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth module not available.");

            // Fetch user info
            const user = await puter.auth.getUser(); //
            if (authStatusDiv) authStatusDiv.textContent = `Signed in.`; // Clear status after fetch
            if (usernameDisplay) {
                usernameDisplay.textContent = `User: ${user.username}`; // Display username [cite: 784, 143]
                usernameDisplay.style.display = 'block';
            }

            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex';
            if (signOutButton) signOutButton.style.display = 'inline-block';
            console.log("User signed in:", user);
            initializeAppState(); // Initialize app state AFTER sign-in

        } catch (error) {
            console.error("Error during sign-in update or fetching user:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign-in error: ${error.message || 'Unknown error'}`;
            if (usernameDisplay) usernameDisplay.style.display = 'none'; // Hide username on error
            authSectionDiv.style.display = 'block';
            chatUiDiv.style.display = 'none';
            if (signOutButton) signOutButton.style.display = 'none';
        }
    } else {
        if (authStatusDiv) authStatusDiv.textContent = 'Not signed in.';
        authSectionDiv.style.display = 'block';
        if (signInButton) { signInButton.disabled = false; signInButton.textContent = 'Sign In'; }
        chatUiDiv.style.display = 'none';
        if (signOutButton) signOutButton.style.display = 'none';
        if (usernameDisplay) usernameDisplay.style.display = 'none'; // Hide username
        isChatInitialized = false;
        closeActivePopup();
        if (isChatMicRecording) stopChatMicRecording();
        if (isTTSMicRecording) stopTTSMicRecording();
    }
}


// --- Sign In/Out Listeners ---
if (signInButton) {
    signInButton.addEventListener('click', async () => {
        console.log("Sign in button clicked");
        if (authStatusDiv) authStatusDiv.textContent = 'Attempting sign in...';
        signInButton.disabled = true; signInButton.textContent = 'Signing in...';
        try {
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK or auth module not available.");
            const signedIn = await puter.auth.signIn(); //
            console.log("puter.auth.signIn() completed. Result:", signedIn);
            await updateUiForAuthState(Boolean(signedIn));
        } catch (error) {
            console.error("Error during puter.auth.signIn() call:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign in error: ${error.message || 'Unknown error'}`;
            signInButton.disabled = false; signInButton.textContent = 'Sign In with Puter';
            await updateUiForAuthState(false);
        }
    });
} else { console.error("Sign In button not found!"); }


if (signOutButton) {
    signOutButton.addEventListener('click', () => {
        console.log("Sign out button clicked");
        try {
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK or auth module not available.");
            puter.auth.signOut(); //
            updateUiForAuthState(false);
            console.log("Signed out called. UI updated.");
            if (messageDisplay) messageDisplay.innerHTML = '';
            if (chatInput) chatInput.disabled = true;
            if (sendButton) sendButton.disabled = true;
        } catch (error) {
            console.error("Error during sign out:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign out error: ${error.message}`;
            updateUiForAuthState(false);
        }
    });
}


// --- Phase 4: Model Selection (Updated Grouping) ---
function populateModelSelector() {
    if (!modelSelector) { console.error("Model selector element not found!"); return; }
    if (modelSelector.options.length > 1 && modelSelector.options[0].value !== "") {
        console.log("Model selector already populated."); modelSelector.value = selectedModel; return;
    }
    console.log("Populating model selector with groups...");
    modelSelector.innerHTML = ''; // Clear existing

    // Ensure default model exists
    let defaultModelFound = false;
    for (const group in modelGroups) {
        if (modelGroups[group].includes(selectedModel)) {
            defaultModelFound = true;
            break;
        }
    }
    // If default not in lists, add it to prevent errors
    if (!defaultModelFound) {
         const option = document.createElement('option');
         option.value = selectedModel;
         option.textContent = selectedModel;
         option.selected = true;
         modelSelector.appendChild(option);
         console.warn(`Default model ${selectedModel} not in defined groups, added manually.`);
    }


    // Add grouped models
    for (const groupName in modelGroups) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = groupName;
        modelGroups[groupName].forEach(modelId => {
            const option = document.createElement('option');
            option.value = modelId;
            option.textContent = modelId.includes('/') ? modelId.split('/')[1] : modelId; // Simple name
            if (modelId === selectedModel && defaultModelFound) option.selected = true; // Select default if found
            optgroup.appendChild(option);
        });
        modelSelector.appendChild(optgroup);
    }

    if (!modelSelector.getAttribute('data-listener-added')) {
        modelSelector.addEventListener('change', (event) => { selectedModel = event.target.value; console.log(`Selected model changed to: ${selectedModel}`); if (chatInput) chatInput.focus(); });
        modelSelector.setAttribute('data-listener-added', 'true');
        console.log("Model selector change listener added.");
    }
    console.log("Model selector populated.");
}


// --- Phase 3 & 5: Chat Logic & Display ---
function displayMessage(text, sender) {
    if (!messageDisplay) { console.error("Msg display area missing!"); return; }
    const bubble = document.createElement('div'); bubble.className = 'message-bubble';
    const content = document.createElement('div'); content.className = 'message-content'; content.textContent = text;
    const timestamp = document.createElement('div'); timestamp.className = 'timestamp'; timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.appendChild(content); bubble.appendChild(timestamp);
    if (sender === 'user') bubble.classList.add('user-bubble');
    else if (sender === 'ai') bubble.classList.add('ai-bubble');
    else { bubble.classList.add('system-bubble'); bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : ''; if (bubble.contains(timestamp)) bubble.removeChild(timestamp); }

    // Phase 7: Action Buttons
    if (sender !== 'system') {
        const actions = document.createElement('div'); actions.className = 'message-actions';
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
    }
    messageDisplay.appendChild(bubble);
    requestAnimationFrame(() => { if (document.body.contains(messageDisplay)) messageDisplay.scrollTop = messageDisplay.scrollHeight; });
}

function createActionButton(title, iconClass) {
    const button = document.createElement('button'); button.className = 'action-button'; button.title = title;
    const icon = document.createElement('i'); icon.className = iconClass; button.appendChild(icon); return button;
}


// --- Phase 7: Action Button Functions ---
function resendMessage(text) { if (!chatInput) return; chatInput.value = text; sendMessage(); }
function copyMessage(text, contentElement) { const textToCopy = contentElement.textContent; navigator.clipboard.writeText(textToCopy).then(() => console.log('Copied!')).catch(err => console.error('Copy failed: ', err)); }
function deleteMessage(bubble) { if (!messageDisplay) return; messageDisplay.removeChild(bubble); }
async function speakMessage(text, buttonElement = null) {
    let originalContent = null; if (buttonElement) { originalContent = buttonElement.innerHTML; buttonElement.disabled = true; buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
    try { if (typeof puter === 'undefined' || !puter.ai?.txt2speech) throw new Error("txt2speech not available."); const audio = await puter.ai.txt2speech(text); if (audio?.play) { if (buttonElement) buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>'; audio.play(); audio.onended = () => { if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }; audio.onerror = (e) => { console.error("Speech error:", e); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }; } else { console.error("No playable audio returned."); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } } } catch (error) { console.error("speakMessage error:", error); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }
}


async function sendMessage() {
    if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; } const inputText = chatInput.value.trim(); if (inputText === '') return; const currentInputText = inputText; displayMessage(currentInputText, 'user'); chatInput.value = ''; chatInput.disabled = true; sendButton.disabled = true; chatInput.style.height = 'auto'; chatInput.style.height = '30px'; displayMessage(`AI (${selectedModel}) is thinking...`, 'system'); try { if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat not available."); console.log(`Sending (Model: ${selectedModel}): "${currentInputText}"`); const response = await puter.ai.chat(currentInputText, { model: selectedModel }); console.log("Received response:", response); const loadingIndicator = document.getElementById('loading-indicator'); if (loadingIndicator) messageDisplay.removeChild(loadingIndicator); let aiText = "Sorry, couldn't get response."; if (response && typeof response === 'string') aiText = response; else if (response?.text) aiText = response.text; else if (response?.message?.content) aiText = response.message.content; else if (response?.error) aiText = `Error: ${response.error.message || response.error}`; else console.warn("Unexpected response structure:", response); displayMessage(aiText, 'ai'); } catch (error) { console.error("sendMessage error:", error); const loadingIndicator = document.getElementById('loading-indicator'); if (loadingIndicator) messageDisplay.removeChild(loadingIndicator); displayMessage(`Error: ${error.message || 'Unknown error'}`, 'system'); if (error?.error?.message?.includes("insufficient funds")) displayMessage("Insufficient Puter credits.", 'system'); } finally { chatInput.disabled = false; sendButton.disabled = false; if (document.body.contains(chatInput)) chatInput.focus(); }
}


// --- Phase 6: Popup Handling ---
function showPopup(popupId) {
    const popup = popups[popupId]; if (popup && popupBackdrop) { closeActivePopup(); popup.style.display = 'block'; popupBackdrop.style.display = 'block'; activePopup = popup; console.log(`Showing popup: ${popupId}`); popup.dispatchEvent(new CustomEvent('show')); } else { console.error(`Popup element '${popupId}' missing.`); }
}
function closeActivePopup() {
    if (isTTSMicRecording) stopTTSMicRecording(); if (activePopup && popupBackdrop) { activePopup.style.display = 'none'; popupBackdrop.style.display = 'none'; console.log(`Closing popup: ${activePopup.id}`); activePopup = null; }
    // Also close image modal if open
    closeImageModal();
}


// --- Phase 8: New Chat & History ---
function startNewChat() { console.log("Starting new chat."); if (messageDisplay) messageDisplay.innerHTML = ''; if (modelSelector) modelSelector.value = 'gpt-4o-mini'; selectedModel = 'gpt-4o-mini'; displayMessage('New chat started.', 'system'); }
function displayChatHistory() { if (!historyList) return; historyList.innerHTML = 'History (KV Phase 8 TBD).'; }
function loadChatFromHistory(historyKey) { console.log("Load history (KV Phase 8 TBD):", historyKey); displayMessage(`Loading history "${historyKey}" (Phase 8 TBD)`, 'system'); closeActivePopup(); }
// --- End Phase 8 Placeholders ---


// --- Phase 9: TTS Chat Mode ---
async function handleTTSSend() {
    if (!ttsTextInput || !ttsSendButton || !ttsOutputArea) { console.error("TTS elements missing!"); return; } const text = ttsTextInput.value.trim(); if (!text) return; ttsSendButton.disabled = true; ttsTextInput.disabled = true; let statusDiv = ttsOutputArea.querySelector('.tts-status'); if (!statusDiv) { statusDiv = document.createElement('div'); statusDiv.className = 'tts-status'; statusDiv.style.fontStyle = 'italic'; statusDiv.style.color = '#666'; ttsOutputArea.appendChild(statusDiv); } statusDiv.textContent = 'AI Thinking...'; try { if (typeof puter === 'undefined' || !puter.ai?.chat || !puter.ai?.txt2speech) throw new Error("Puter AI modules missing."); console.log(`TTS Mode: Sending to AI: "${text}"`); const response = await puter.ai.chat(text, { model: selectedModel }); console.log("TTS Mode: AI response:", response); let aiText = "Sorry, couldn't process."; if (response && typeof response === 'string') aiText = response; else if (response?.text) aiText = response.text; else if (response?.message?.content) aiText = response.message.content; else if (response?.error) aiText = `Error: ${response.error.message || response.error}`; else console.warn("TTS unexpected response:", response); statusDiv.textContent = 'Generating Speech...'; console.log("TTS Mode: Requesting speech for:", aiText); const audioObject = await puter.ai.txt2speech(aiText); if (audioObject?.play) { console.log("TTS Mode: Playable audio received."); statusDiv.textContent = ''; const entryDiv = document.createElement('div'); entryDiv.className = 'tts-entry'; const textSpan = document.createElement('span'); textSpan.className = 'tts-entry-text'; textSpan.textContent = aiText; const replayButton = document.createElement('button'); replayButton.className = 'tts-replay-button'; replayButton.innerHTML = '<i class="fas fa-play"></i> Replay'; replayButton.onclick = (e) => speakMessage(aiText, e.currentTarget); entryDiv.append(textSpan, replayButton); ttsOutputArea.insertBefore(entryDiv, statusDiv); ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight; audioObject.onerror = (e) => { console.error("TTS play error:", e); statusDiv.textContent = 'Audio play error.'; }; audioObject.onended = () => { console.log("TTS playback finished."); statusDiv.textContent = 'Playback finished.'; }; audioObject.play(); statusDiv.textContent = 'Speaking...'; } else { console.error("TTS Mode: No playable audio returned."); statusDiv.textContent = 'Failed to generate speech.'; } } catch (error) { console.error("Error in TTS mode:", error); if (statusDiv) statusDiv.textContent = `Error: ${error.message || 'Unknown'}`; } finally { setTimeout(() => { if (ttsSendButton) ttsSendButton.disabled = false; if (ttsTextInput) ttsTextInput.disabled = false; }, 500); if (ttsTextInput) ttsTextInput.value = ''; }
}

// --- Phase 9 Enhancement: TTS Mic Recording ---
function toggleTTSMicRecording() { if (isTTSMicRecording) stopTTSMicRecording(); else startTTSMicRecording(); }
async function startTTSMicRecording() {
    if (!navigator.mediaDevices?.getUserMedia) { alert('Media API not supported.'); console.error('getUserMedia unsupported'); return; } if (!ttsMicButton || !ttsOutputArea) { console.error("TTS Mic/Output missing."); return; } ttsMicButton.disabled = true; try { ttsStream = await navigator.mediaDevices.getUserMedia({ audio: true }); console.log("TTS Mic granted."); ttsAudioChunks = []; const options = {}; if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options.mimeType = 'audio/webm;codecs=opus'; else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) options.mimeType = 'audio/ogg;codecs=opus'; else console.warn("Opus MIME types not supported."); ttsMediaRecorder = new MediaRecorder(ttsStream, options); ttsMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) ttsAudioChunks.push(e.data); }; ttsMediaRecorder.onstop = processTTSAudioRecording; ttsMediaRecorder.onerror = (e) => { console.error("MediaRecorder error:", e.error); isTTSMicRecording = false; if (ttsMicButton) { ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; ttsMicButton.disabled = false; } alert(`Recording error: ${e.error.name || 'Unknown'}`); if (ttsStream) ttsStream.getTracks().forEach(t => t.stop()); ttsStream = null; }; ttsMediaRecorder.start(); isTTSMicRecording = true; ttsMicButton.classList.add('recording'); ttsMicButton.innerHTML = '<i class="fas fa-stop"></i>'; ttsMicButton.disabled = false; console.log("TTS recording started."); let statusDiv = ttsOutputArea.querySelector('.tts-status'); if (statusDiv) statusDiv.textContent = 'Recording audio...'; } catch (err) { console.error('Mic access error:', err); alert(`Mic error: ${err.name}. Check permissions.`); if (ttsMicButton) { ttsMicButton.disabled = false; ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; } isTTSMicRecording = false; }
}
function stopTTSMicRecording() {
    if (ttsMediaRecorder && isTTSMicRecording) { console.log("Stopping TTS recording..."); ttsMediaRecorder.stop(); } else { console.warn("Stop TTS called but not active/init."); isTTSMicRecording = false; if (ttsMicButton) { ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; ttsMicButton.disabled = false; } if (ttsStream) { ttsStream.getTracks().forEach(t => t.stop()); ttsStream = null; } }
}
function processTTSAudioRecording() {
    console.log("Processing TTS audio."); if (ttsStream) { ttsStream.getTracks().forEach(t => t.stop()); ttsStream = null; } isTTSMicRecording = false; if (ttsMicButton) { ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; ttsMicButton.disabled = false; } if (ttsAudioChunks.length === 0) { console.warn("No TTS chunks."); return; } if (!ttsOutputArea) { console.error("TTS output area missing."); return; } const mimeType = ttsMediaRecorder?.mimeType || 'audio/webm'; const audioBlob = new Blob(ttsAudioChunks, { type: mimeType }); const audioUrl = URL.createObjectURL(audioBlob); console.log("TTS Blob size:", audioBlob.size, "URL:", audioUrl); const entryDiv = document.createElement('div'); entryDiv.className = 'tts-audio-entry'; const audioEl = document.createElement('audio'); audioEl.controls = true; audioEl.src = audioUrl; const tsSpan = document.createElement('span'); tsSpan.className = 'tts-audio-timestamp'; tsSpan.textContent = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }); entryDiv.append(audioEl, tsSpan); let statusDiv = ttsOutputArea.querySelector('.tts-status'); if (statusDiv) ttsOutputArea.insertBefore(entryDiv, statusDiv); else ttsOutputArea.appendChild(entryDiv); ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight; ttsAudioChunks = [];
}

function initializeTTSListeners() {
    if (ttsListenersAdded) return; if (!ttsSendButton || !ttsTextInput || !ttsOutputArea || !ttsMicButton) { console.warn("TTS elements missing for init."); return; } console.log("Initializing TTS listeners."); ttsSendButton.addEventListener('click', handleTTSSend); ttsTextInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTTSSend(); } }); ttsMicButton.addEventListener('click', toggleTTSMicRecording); ttsListenersAdded = true; console.log("TTS listeners added.");
}
// --- End Phase 9 ---


// --- Phase 10: Main Chat Microphone Input ---
function initializeChatMicInput() {
    if (!micButton || !chatInput) { console.warn("Main chat mic/input missing."); return; } if (!micButton.getAttribute('data-mic-listener-added')) { micButton.addEventListener('click', toggleChatMicRecording); micButton.setAttribute('data-mic-listener-added', 'true'); console.log("Main chat mic listener added."); }
}
function toggleChatMicRecording() { if (isChatMicRecording) stopChatMicRecording(); else startChatMicRecording(); }
function startChatMicRecording() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) { alert("Browser doesn't support speech recognition."); return; } const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; recognition = new SpeechRecognition(); recognition.continuous = false; recognition.interimResults = false; recognition.onstart = () => { console.log("Chat mic started."); isChatMicRecording = true; micButton.classList.add('recording'); micButton.textContent = "⏺️"; }; recognition.onresult = (e) => { const transcript = e.results[0][0].transcript; console.log("Chat speech recognized:", transcript); chatInput.value = transcript; }; recognition.onend = () => { console.log("Chat mic ended."); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; }; recognition.onerror = (e) => { console.error("Chat mic error:", e.error); let errorMsg = `Speech error: ${e.error}`; if (e.error === 'no-speech') errorMsg = "No speech detected."; else if (e.error === 'audio-capture') errorMsg = "Mic capture failed."; else if (e.error === 'not-allowed') errorMsg = "Mic access denied."; alert(errorMsg); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; }; try { recognition.start(); } catch (e) { console.error("Failed start chat mic:", e); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; alert("Failed to start mic."); }
}
function stopChatMicRecording() { if (recognition && isChatMicRecording) { recognition.stop(); console.log("Chat mic stopped manually."); } }
// --- End Phase 10 ---

// --- Phase 11: Basic Image Generation ---
async function handleBasicImageGeneration() {
    if (!imgGenPrompt || !imgGenGenerateBtn || !imgGenResults || !imgGenLoading || !imgGenError) {
        console.error("Image Gen UI elements missing!"); return;
    }
    const prompt = imgGenPrompt.value.trim();
    if (!prompt) { imgGenError.textContent = "Please enter a prompt."; imgGenError.style.display = 'block'; return; }

    imgGenGenerateBtn.disabled = true;
    imgGenError.style.display = 'none';
    imgGenLoading.style.display = 'block';

    try {
        if (typeof puter === 'undefined' || !puter.ai?.txt2img) throw new Error("txt2img module not available.");
        console.log("Requesting image gen for prompt:", prompt);
        // CHANGE testMode to false for actual generation and billing
        const imageElement = await puter.ai.txt2img(prompt, true); //

        if (imageElement?.tagName === 'IMG') {
            console.log("Image generated successfully.");
            displayGeneratedImage(imageElement, prompt); // Call helper
        } else {
            // If API returns something else (like URL string), handle differently if needed
            throw new Error("API did not return a valid image element.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        imgGenError.textContent = `Error: ${error.message || 'Unknown error'}`;
        imgGenError.style.display = 'block';
    } finally {
        imgGenLoading.style.display = 'none';
        imgGenGenerateBtn.disabled = false;
    }
}

function displayGeneratedImage(imageElement, prompt = "generated-image") {
     if (!imgGenResults) return;

     const container = document.createElement('div');
     container.className = 'img-gen-thumbnail-container';

     imageElement.className = 'img-gen-thumbnail';
     imageElement.alt = prompt;
     imageElement.onclick = () => expandImage(imageElement.src); // Expand on click

     const saveButton = document.createElement('button');
     saveButton.className = 'img-gen-save-btn';
     saveButton.title = 'Save Image';
     saveButton.innerHTML = '<i class="fas fa-save"></i>';
     saveButton.onclick = (e) => {
         e.stopPropagation(); // Prevent expand when clicking save
         const link = document.createElement('a');
         link.href = imageElement.src;
         const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
         link.download = filename;
         document.body.appendChild(link); link.click(); document.body.removeChild(link);
     };

    container.appendChild(imageElement);
    container.appendChild(saveButton);
    // Insert before loading/error placeholders if they exist
    const firstChild = imgGenResults.querySelector('#img-gen-loading, #img-gen-error');
    if (firstChild) {
         imgGenResults.insertBefore(container, firstChild);
    } else {
         imgGenResults.prepend(container); // Add to the top if no placeholders
    }
}

// Image Expansion Modal Logic
function expandImage(imageSrc) {
    if (!imageModal || !imageModalBackdrop || !expandedImage) { console.error("Image modal elements missing."); return; }
    expandedImage.src = imageSrc;
    imageModal.style.display = 'block';
    imageModalBackdrop.style.display = 'block';
}

function closeImageModal() {
    if (imageModal && imageModalBackdrop) {
        imageModal.style.display = 'none';
        imageModalBackdrop.style.display = 'none';
        expandedImage.src = '#'; // Clear src
    }
}

function saveExpandedImage() {
    if (!expandedImage || !expandedImage.src || expandedImage.src.endsWith('#')) return;
    const link = document.createElement('a');
    link.href = expandedImage.src;
    // Try to get prompt from alt text if possible, otherwise use timestamp
    const promptText = expandedImage.alt || `expanded_image_${Date.now()}`;
    const filename = promptText.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}


function initializeImageGenPopup() {
    if (imgGenListenersAdded) return;
    if (!imgGenGenerateBtn || !imgGenPrompt || !imgGenModeButtonsContainer || !imgGenModePanelsContainer || !imageModalSaveBtn || !imageModalCloseBtn || !imageModalBackdrop) {
        console.warn("Some Image Gen or Modal elements missing during init."); return;
    }
    console.log("Initializing Image Gen listeners.");

    // Basic Gen Button Listener
    imgGenGenerateBtn.addEventListener('click', handleBasicImageGeneration);

    // Enter Key Listener for Prompt
    imgGenPrompt.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent newline
            handleBasicImageGeneration();
        }
    });

    // Mode Switching Listeners
    const modeButtons = imgGenModeButtonsContainer.querySelectorAll('.img-gen-mode-btn');
    const modePanels = imgGenModePanelsContainer.querySelectorAll('.img-gen-mode-panel');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            if (button.disabled) return; // Skip disabled (TBD modes)

            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            modePanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === `img-gen-${mode}-mode`);
            });
            currentImageGenMode = mode;
            console.log("Switched Img Gen mode to:", mode);
        });
    });

    // Modal Listeners
    imageModalCloseBtn.addEventListener('click', closeImageModal);
    imageModalBackdrop.addEventListener('click', closeImageModal);
    imageModalSaveBtn.addEventListener('click', saveExpandedImage);

    imgGenListenersAdded = true;
    console.log("Image Gen listeners added.");
}
// --- End Phase 11 ---


// --- Initialization ---
function initializeChatListeners() {
    if (!chatInput || !sendButton || !messageDisplay) { console.warn("Chat elements missing."); setTimeout(initializeChatListeners, 200); return false; } if (isChatInitialized) return true; console.log("Adding chat listeners."); if (!sendButton.getAttribute('data-listener-added')) { sendButton.addEventListener('click', sendMessage); sendButton.setAttribute('data-listener-added', 'true'); } if (!chatInput.getAttribute('data-listener-added')) { chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }); chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100; requestAnimationFrame(() => { scrollHeight = chatInput.scrollHeight; chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px'; }); }); chatInput.setAttribute('data-listener-added', 'true'); } isChatInitialized = true; chatInput.disabled = false; sendButton.disabled = false; if (document.body.contains(chatInput)) chatInput.focus(); console.log("Chat listeners added."); return true;
}

function initializeBannerAndPopups() {
    console.log("Initializing banner/popups."); const buttonPopupMap = { 'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr', 'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' }; for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) { const button = document.getElementById(buttonId); if (button && !button.getAttribute('data-popup-listener-added')) { button.addEventListener('click', () => { showPopup(popupId); if (popupId === 'history') displayChatHistory(); else if (popupId === 'tts') initializeTTSListeners(); else if (popupId === 'imgGen') initializeImageGenPopup(); /* Add others */ }); button.setAttribute('data-popup-listener-added', 'true'); } else if (!button) console.warn(`Banner button #${buttonId} missing.`); } const newChatBtn = bannerButtons.newChat; if (newChatBtn && !newChatBtn.getAttribute('data-newchat-listener-added')) { newChatBtn.addEventListener('click', () => { console.log("New Chat clicked"); closeActivePopup(); startNewChat(); }); newChatBtn.setAttribute('data-newchat-listener-added', 'true'); } else if (!newChatBtn) console.warn(`New chat button missing.`); if (popupBackdrop && !popupBackdrop.getAttribute('data-backdrop-listener-added')) { popupBackdrop.addEventListener('click', closeActivePopup); popupBackdrop.setAttribute('data-backdrop-listener-added', 'true'); } else if (!popupBackdrop) console.warn(`Backdrop missing.`); const closeButtons = document.querySelectorAll('.close-popup-btn'); closeButtons.forEach(button => { const parentPopup = button.closest('.popup'); if (parentPopup && !button.getAttribute('data-close-listener-added')) { button.addEventListener('click', closeActivePopup); button.setAttribute('data-close-listener-added', 'true'); } else if (!parentPopup) console.warn("Close button outside popup?", button); }); console.log("Banner/Popup listeners initialized.");
}

function initializeAppState() {
    console.log("Initializing app state..."); populateModelSelector(); initializeChatListeners(); initializeBannerAndPopups(); initializeChatMicInput();
}

async function initialAuthCheck(retryCount = 0) {
    if (typeof puter === 'undefined' || !puter.auth?.isSignedIn) { if (retryCount < 5) { console.warn(`SDK retry ${retryCount + 1}`); setTimeout(() => initialAuthCheck(retryCount + 1), 500 * (retryCount + 1)); return; } else { console.error("SDK failed."); if (authStatusDiv) authStatusDiv.textContent = "Error: SDK failed."; if (signInButton) signInButton.disabled = true; return; } } console.log("Initial auth check..."); try { const isSignedIn = puter.auth.isSignedIn(); console.log("Initial status:", isSignedIn); await updateUiForAuthState(isSignedIn); } catch (error) { console.error("Initial auth error:", error); await updateUiForAuthState(false); }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded."); if (typeof puter !== 'undefined') initialAuthCheck(); else { console.warn("SDK delay."); setTimeout(initialAuthCheck, 300); }
});


// --- Phase 12: OCR (Placeholder) ---


// --- Phase 13: Vision (Placeholder) ---


// --- Phase 14: Settings (Placeholder) ---