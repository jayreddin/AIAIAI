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
const imgGenModeButtonsContainer = document.getElementById('img-gen-modes');
const imgGenModePanelsContainer = document.getElementById('img-gen-mode-ui');
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModal = document.getElementById('image-modal');
const expandedImage = document.getElementById('expanded-image');
const imageModalSaveBtn = document.getElementById('image-modal-save');
const imageModalCloseBtn = document.getElementById('image-modal-close');
// --- End Phase 11 elements

// Phase 12 elements
const ocrFileInput = document.getElementById('ocr-file-input');
const ocrUploadBtn = document.getElementById('ocr-upload-btn');
const ocrThumbnailArea = document.getElementById('ocr-thumbnail-area');
const ocrExtractBtn = document.getElementById('ocr-extract-btn');
const ocrResultText = document.getElementById('ocr-result-text');
const ocrCopyBtn = document.getElementById('ocr-copy-btn');
const ocrStatus = document.getElementById('ocr-status');
// --- End Phase 12 elements


// --- App State ---
let selectedModel = 'gpt-4o-mini'; // Default model
let isChatInitialized = false;
let activePopup = null;
// Phase 8 state moved to KV store implicitly
let recognition; // Speech recognition object (for main chat)
let isChatMicRecording = false;
let ttsListenersAdded = false;
let ocrListenersAdded = false; // Added for Phase 12 init
let imgGenListenersAdded = false;

// TTS Recording State
let ttsMediaRecorder;
let ttsAudioChunks = [];
let isTTSMicRecording = false;
let ttsStream = null;

// OCR State
let ocrSelectedFile = null; // Added for Phase 12

// Image Gen State
let currentImageGenMode = 'basic'; // Default mode
const historyKeyPrefix = 'chatHistory_'; // Added for Phase 8


// --- Model List (Updated & Grouped) ---
const modelGroups = {
    "OpenAI": ['gpt-4o-mini', 'gpt-4o', 'o1', 'o1-mini', 'o1-pro', 'o3', 'o3-mini', 'o4-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview'],
    "Anthropic": ['claude-3-7-sonnet', 'claude-3-5-sonnet'],
    "Google": ['google/gemini-2.5-pro-exp-03-25:free', 'google/gemini-2.5-flash-preview', 'google/gemini-2.5-flash-preview:thinking', 'google/gemini-2.0-flash-lite-001', 'google/gemini-2.0-flash-thinking-exp:free', 'google/gemini-2.0-flash-001', 'google/gemini-2.0-flash-exp:free', 'gemini-2.0-flash', 'gemini-1.5-flash', 'google/gemma-2-27b-it'],
    "Meta": ['meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout', 'meta-llama/llama-3.3-70b-instruct', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'meta-llama/llama-guard-3-8b', 'meta-llama/llama-guard-2-8b'],
    "Mistral": ['mistral-large-latest', 'pixtral-large-latest', 'codestral-latest'],
    "xAI / Grok": ['grok-beta', 'x-ai/grok-3-beta'],
    "DeepSeek": ['deepseek-chat', 'deepseek-reasoner']
};


// --- Authentication Logic ---
async function updateUiForAuthState(isSignedIn) {
    if (!authSectionDiv || !chatUiDiv) { console.error("Core UI elements missing."); return; }
    if (isSignedIn) {
        try {
            if (authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth module not available.");
            const user = await puter.auth.getUser();
            if (authStatusDiv) authStatusDiv.textContent = `Signed in.`;
            if (usernameDisplay) {
                usernameDisplay.textContent = `User: ${user.username}`;
                usernameDisplay.style.display = 'block';
            }
            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex';
            if (signOutButton) signOutButton.style.display = 'inline-block';
            console.log("User signed in:", user);
            initializeAppState();
        } catch (error) {
            console.error("Error during sign-in update or fetching user:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign-in error: ${error.message || 'Unknown error'}`;
            if (usernameDisplay) usernameDisplay.style.display = 'none';
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
        if (usernameDisplay) usernameDisplay.style.display = 'none';
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
            const signedIn = await puter.auth.signIn();
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
            puter.auth.signOut();
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
    modelSelector.innerHTML = '';
    let defaultModelFound = false;
    for (const group in modelGroups) {
        if (modelGroups[group].includes(selectedModel)) { defaultModelFound = true; break; }
    }
    if (!defaultModelFound) {
         const option = document.createElement('option'); option.value = selectedModel; option.textContent = selectedModel; option.selected = true; modelSelector.appendChild(option); console.warn(`Default model ${selectedModel} added manually.`);
    }
    for (const groupName in modelGroups) {
        const optgroup = document.createElement('optgroup'); optgroup.label = groupName;
        modelGroups[groupName].forEach(modelId => {
            const option = document.createElement('option'); option.value = modelId; option.textContent = modelId.includes('/') ? modelId.split('/')[1] : modelId;
            if (modelId === selectedModel && defaultModelFound) option.selected = true;
            optgroup.appendChild(option);
        });
        modelSelector.appendChild(optgroup);
    }
    if (!modelSelector.getAttribute('data-listener-added')) {
        modelSelector.addEventListener('change', (event) => { selectedModel = event.target.value; console.log(`Selected model changed to: ${selectedModel}`); if (chatInput) chatInput.focus(); });
        modelSelector.setAttribute('data-listener-added', 'true'); console.log("Model selector change listener added.");
    }
    console.log("Model selector populated.");
}


// --- Phase 3 & 5: Chat Logic & Display ---
function displayMessage(text, sender) {
    if (!messageDisplay) { console.error("Msg display missing!"); return; }
    const bubble = document.createElement('div'); bubble.className = 'message-bubble';
    const content = document.createElement('div'); content.className = 'message-content'; content.textContent = text;
    const timestamp = document.createElement('div'); timestamp.className = 'timestamp'; timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.appendChild(content); bubble.appendChild(timestamp);
    if (sender === 'user') bubble.classList.add('user-bubble');
    else if (sender === 'ai') bubble.classList.add('ai-bubble');
    else { bubble.classList.add('system-bubble'); bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : ''; if (bubble.contains(timestamp)) bubble.removeChild(timestamp); }

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
    try { if (typeof puter === 'undefined' || !puter.ai?.txt2speech) throw new Error("txt2speech missing."); const audio = await puter.ai.txt2speech(text); if (audio?.play) { if (buttonElement) buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>'; audio.play(); audio.onended = () => { if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }; audio.onerror = (e) => { console.error("Speech error:", e); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }; } else { console.error("No playable audio returned."); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } } } catch (error) { console.error("speakMessage error:", error); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }
}


async function sendMessage() {
    if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; } const inputText = chatInput.value.trim(); if (inputText === '') return; const currentInputText = inputText; displayMessage(currentInputText, 'user'); chatInput.value = ''; chatInput.disabled = true; sendButton.disabled = true; chatInput.style.height = 'auto'; chatInput.style.height = '30px'; displayMessage(`AI (${selectedModel}) is thinking...`, 'system'); try { if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat not available."); console.log(`Sending (Model: ${selectedModel}): "${currentInputText}"`); const response = await puter.ai.chat(currentInputText, { model: selectedModel }); console.log("Received response:", response); const loadingIndicator = document.getElementById('loading-indicator'); if (loadingIndicator) messageDisplay.removeChild(loadingIndicator); let aiText = "Sorry, couldn't get response."; if (response && typeof response === 'string') aiText = response; else if (response?.text) aiText = response.text; else if (response?.message?.content) aiText = response.message.content; else if (response?.error) aiText = `Error: ${response.error.message || response.error}`; else console.warn("Unexpected response structure:", response); displayMessage(aiText, 'ai'); } catch (error) { console.error("sendMessage error:", error); const loadingIndicator = document.getElementById('loading-indicator'); if (loadingIndicator) messageDisplay.removeChild(loadingIndicator); displayMessage(`Error: ${error.message || 'Unknown error'}`, 'system'); if (error?.error?.message?.includes("insufficient funds")) displayMessage("Insufficient Puter credits.", 'system'); } finally { chatInput.disabled = false; sendButton.disabled = false; if (document.body.contains(chatInput)) chatInput.focus(); }
}


// --- Phase 6: Popup Handling ---
function showPopup(popupId) {
    const popup = popups[popupId]; if (popup && popupBackdrop) { closeActivePopup(); popup.style.display = 'block'; popupBackdrop.style.display = 'block'; activePopup = popup; console.log(`Showing popup: ${popupId}`); popup.dispatchEvent(new CustomEvent('show')); } else { console.error(`Popup element '${popupId}' missing.`); }
}
function closeActivePopup() {
    if (isTTSMicRecording) stopTTSMicRecording(); if (activePopup && popupBackdrop) { activePopup.style.display = 'none'; popupBackdrop.style.display = 'none'; console.log(`Closing popup: ${activePopup.id}`); activePopup = null; } closeImageModal();
}


// --- Phase 8: New Chat & History (KV Implementation) ---
async function startNewChat() {
    console.log("Starting new chat session.");
    if (messageDisplay && messageDisplay.children.length > 0) {
        const messages = Array.from(messageDisplay.querySelectorAll('.message-bubble:not(.system-bubble)')).map(bubble => ({ sender: bubble.classList.contains('user-bubble') ? 'user' : 'ai', text: bubble.querySelector('.message-content')?.textContent || '' }));
        if (messages.length > 0) {
            const sessionObject = { timestamp: Date.now(), model: selectedModel, messages: messages }; const key = historyKeyPrefix + sessionObject.timestamp;
            try { if (typeof puter === 'undefined' || !puter.kv) throw new Error("KV store not available."); console.log(`Saving session: ${key}`); await puter.kv.set(key, JSON.stringify(sessionObject)); } catch (error) { console.error("KV save error:", error); alert("Could not save previous session."); }
        }
    }
    if (messageDisplay) messageDisplay.innerHTML = ''; if (modelSelector) modelSelector.value = 'gpt-4o-mini'; selectedModel = 'gpt-4o-mini'; displayMessage('New chat started.', 'system');
}

async function displayChatHistory() {
    if (!historyList) { console.error("History list element missing."); return; } historyList.innerHTML = '<p>Loading history...</p>'; try { if (typeof puter === 'undefined' || !puter.kv) throw new Error("KV store not available."); console.log("Fetching history keys..."); const keys = await puter.kv.list(historyKeyPrefix + '*'); if (!keys || keys.length === 0) { historyList.innerHTML = '<p>No chat history found.</p>'; return; } const sortedKeys = keys.sort((a, b) => parseInt(b.substring(historyKeyPrefix.length)) - parseInt(a.substring(historyKeyPrefix.length))); historyList.innerHTML = ''; sortedKeys.forEach(key => { const timestamp = parseInt(key.substring(historyKeyPrefix.length)); const dateString = new Date(timestamp).toLocaleString(); const itemDiv = document.createElement('div'); itemDiv.className = 'history-item'; const infoSpan = document.createElement('span'); infoSpan.textContent = `Chat: ${dateString}`; infoSpan.style.marginRight = '10px'; const loadBtn = document.createElement('button'); loadBtn.textContent = 'Load'; loadBtn.onclick = () => loadChatFromHistory(key); const delBtn = document.createElement('button'); delBtn.textContent = 'Delete'; delBtn.style.marginLeft = '5px'; delBtn.style.color = 'red'; delBtn.onclick = (e) => { e.stopPropagation(); if (confirm(`Delete chat from ${dateString}?`)) deleteChatHistory(key, itemDiv); }; itemDiv.append(infoSpan, loadBtn, delBtn); historyList.appendChild(itemDiv); }); } catch (error) { console.error("Error fetching history:", error); historyList.innerHTML = '<p>Error loading history.</p>'; }
}

async function loadChatFromHistory(key) {
    console.log("Loading chat:", key); displayMessage(`Loading chat: ${new Date(parseInt(key.substring(historyKeyPrefix.length))).toLocaleString()}...`, 'system'); closeActivePopup(); try { if (typeof puter === 'undefined' || !puter.kv) throw new Error("KV store not available."); const sessionString = await puter.kv.get(key); if (!sessionString) throw new Error("Session not found."); const session = JSON.parse(sessionString); if (messageDisplay) messageDisplay.innerHTML = ''; if (session.messages?.length) session.messages.forEach(msg => displayMessage(msg.text, msg.sender)); selectedModel = session.model || 'gpt-4o-mini'; if (modelSelector) modelSelector.value = selectedModel; displayMessage(`Loaded chat from ${new Date(session.timestamp).toLocaleString()}.`, 'system'); } catch (error) { console.error(`Error loading session ${key}:`, error); displayMessage(`Error loading chat: ${error.message}`, 'system'); }
}

async function deleteChatHistory(key, listItemElement) {
    console.log("Deleting chat:", key); try { if (typeof puter === 'undefined' || !puter.kv) throw new Error("KV store not available."); await puter.kv.del(key); if (listItemElement?.parentNode === historyList) { historyList.removeChild(listItemElement); console.log("Deleted successfully."); if (historyList.children.length === 0) historyList.innerHTML = '<p>No chat history found.</p>'; } } catch (error) { console.error("Error deleting chat:", key, error); alert("Could not delete chat."); }
}
// --- End Phase 8 ---


// --- Phase 9: TTS Chat Mode ---
async function handleTTSSend() {
    if (!ttsTextInput || !ttsSendButton || !ttsOutputArea) { console.error("TTS elements missing!"); return; } const text = ttsTextInput.value.trim(); if (!text) return; ttsSendButton.disabled = true; ttsTextInput.disabled = true; let statusDiv = ttsOutputArea.querySelector('.tts-status'); if (!statusDiv) { statusDiv = document.createElement('div'); statusDiv.className = 'tts-status'; statusDiv.style.fontStyle = 'italic'; statusDiv.style.color = '#666'; ttsOutputArea.appendChild(statusDiv); } statusDiv.textContent = 'AI Thinking...'; try { if (typeof puter === 'undefined' || !puter.ai?.chat || !puter.ai?.txt2speech) throw new Error("Puter AI modules missing."); console.log(`TTS Mode: Sending to AI: "${text}"`); const response = await puter.ai.chat(text, { model: selectedModel }); console.log("TTS Mode: AI response:", response); let aiText = "Sorry, couldn't process."; if (response && typeof response === 'string') aiText = response; else if (response?.text) aiText = response.text; else if (response?.message?.content) aiText = response.message.content; else if (response?.error) aiText = `Error: ${response.error.message || response.error}`; else console.warn("TTS unexpected response:", response); statusDiv.textContent = 'Generating Speech...'; console.log("TTS Mode: Requesting speech for:", aiText); const audioObject = await puter.ai.txt2speech(aiText); if (audioObject?.play) { console.log("TTS Mode: Playable audio received."); statusDiv.textContent = ''; const entryDiv = document.createElement('div'); entryDiv.className = 'tts-entry'; const textSpan = document.createElement('span'); textSpan.className = 'tts-entry-text'; textSpan.textContent = aiText; const replayButton = document.createElement('button'); replayButton.className = 'tts-replay-button'; replayButton.innerHTML = '<i class="fas fa-play"></i> Replay'; replayButton.onclick = (e) => speakMessage(aiText, e.currentTarget); entryDiv.append(textSpan, replayButton); ttsOutputArea.insertBefore(entryDiv, statusDiv); ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight; audioObject.onerror = (e) => { console.error("TTS play error:", e); statusDiv.textContent = 'Audio play error.'; }; audioObject.onended = () => { console.log("TTS playback finished."); statusDiv.textContent = 'Playback finished.'; }; audioObject.play(); statusDiv.textContent = 'Speaking...'; } else { console.error("TTS Mode: No playable audio returned."); statusDiv.textContent = 'Failed to generate speech.'; } } catch (error) { console.error("Error in TTS mode:", error); if (statusDiv) statusDiv.textContent = `Error: ${error.message || 'Unknown'}`; } finally { setTimeout(() => { if (ttsSendButton) ttsSendButton.disabled = false; if (ttsTextInput) ttsTextInput.disabled = false; }, 500); if (ttsTextInput) ttsTextInput.value = ''; }
}
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
    if (!imgGenPrompt || !imgGenGenerateBtn || !imgGenResults || !imgGenLoading || !imgGenError) { console.error("Img Gen UI elements missing!"); return; } const prompt = imgGenPrompt.value.trim(); if (!prompt) { imgGenError.textContent = "Enter prompt."; imgGenError.style.display = 'block'; return; } imgGenGenerateBtn.disabled = true; imgGenError.style.display = 'none'; imgGenLoading.style.display = 'block'; try { if (typeof puter === 'undefined' || !puter.ai?.txt2img) throw new Error("txt2img missing."); console.log("Requesting img gen:", prompt); const imageElement = await puter.ai.txt2img(prompt, true); if (imageElement?.tagName === 'IMG') { console.log("Img generated."); displayGeneratedImage(imageElement, prompt); } else { throw new Error("Invalid image element returned."); } } catch (error) { console.error("Error generating image:", error); imgGenError.textContent = `Error: ${error.message || 'Unknown'}`; imgGenError.style.display = 'block'; } finally { imgGenLoading.style.display = 'none'; imgGenGenerateBtn.disabled = false; }
}
function displayGeneratedImage(imageElement, prompt = "generated") {
     if (!imgGenResults) return; const container = document.createElement('div'); container.className = 'img-gen-thumbnail-container'; imageElement.className = 'img-gen-thumbnail'; imageElement.alt = prompt; imageElement.onclick = () => expandImage(imageElement.src); const saveButton = document.createElement('button'); saveButton.className = 'img-gen-save-btn'; saveButton.title = 'Save Image'; saveButton.innerHTML = '<i class="fas fa-save"></i>'; saveButton.onclick = (e) => { e.stopPropagation(); const link = document.createElement('a'); link.href = imageElement.src; const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png'; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); }; container.append(imageElement, saveButton); const firstChild = imgGenResults.querySelector('#img-gen-loading, #img-gen-error'); if (firstChild) imgGenResults.insertBefore(container, firstChild); else imgGenResults.prepend(container);
}
function expandImage(imageSrc) {
    if (!imageModal || !imageModalBackdrop || !expandedImage) { console.error("Modal elements missing."); return; } expandedImage.src = imageSrc; expandedImage.alt = document.querySelector(`.img-gen-thumbnail[src="${imageSrc}"]`)?.alt || "Expanded Image"; // Copy alt text
    imageModal.style.display = 'block'; imageModalBackdrop.style.display = 'block';
}
function closeImageModal() {
    if (imageModal && imageModalBackdrop) { imageModal.style.display = 'none'; imageModalBackdrop.style.display = 'none'; expandedImage.src = '#'; expandedImage.alt = ''; }
}
function saveExpandedImage() {
    if (!expandedImage || !expandedImage.src || expandedImage.src.endsWith('#')) return; const link = document.createElement('a'); link.href = expandedImage.src; const promptText = expandedImage.alt || `expanded_${Date.now()}`; const filename = promptText.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png'; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
function initializeImageGenPopup() {
    if (imgGenListenersAdded) return; if (!imgGenGenerateBtn || !imgGenPrompt || !imgGenModeButtonsContainer || !imgGenModePanelsContainer || !imageModalSaveBtn || !imageModalCloseBtn || !imageModalBackdrop) { console.warn("Some Img Gen/Modal elements missing."); return; } console.log("Initializing Img Gen listeners."); imgGenGenerateBtn.addEventListener('click', handleBasicImageGeneration); imgGenPrompt.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBasicImageGeneration(); } }); const modeButtons = imgGenModeButtonsContainer.querySelectorAll('.img-gen-mode-btn'); const modePanels = imgGenModePanelsContainer.querySelectorAll('.img-gen-mode-panel'); modeButtons.forEach(button => { button.addEventListener('click', () => { const mode = button.getAttribute('data-mode'); if (button.disabled) return; modeButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); modePanels.forEach(panel => panel.classList.toggle('active', panel.id === `img-gen-${mode}-mode`)); currentImageGenMode = mode; console.log("Img Gen mode:", mode); }); }); imageModalCloseBtn.addEventListener('click', closeImageModal); imageModalBackdrop.addEventListener('click', closeImageModal); imageModalSaveBtn.addEventListener('click', saveExpandedImage); imgGenListenersAdded = true; console.log("Img Gen listeners added.");
}
// --- End Phase 11 ---

// --- Phase 12: OCR ---
let ocrListenersInitialized = false;

function fileToDataURL(file) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = (error) => reject(error); reader.readAsDataURL(file); });
}
function initializeOcrPopup() {
    if (ocrListenersInitialized) return; if (!ocrUploadBtn || !ocrFileInput || !ocrExtractBtn || !ocrCopyBtn || !ocrThumbnailArea || !ocrResultText || !ocrStatus) { console.error("OCR UI elements missing!"); return; } console.log("Initializing OCR listeners."); ocrUploadBtn.addEventListener('click', () => ocrFileInput.click()); ocrFileInput.addEventListener('change', handleOcrFileSelect); ocrExtractBtn.addEventListener('click', handleOcrExtract); ocrCopyBtn.addEventListener('click', () => { if (!ocrResultText.value) return; navigator.clipboard.writeText(ocrResultText.value).then(() => { const originalText = ocrCopyBtn.innerHTML; ocrCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!'; setTimeout(() => { ocrCopyBtn.innerHTML = originalText; }, 1500); }).catch(err => console.error('OCR Copy failed: ', err)); }); ocrListenersInitialized = true; console.log("OCR listeners added.");
}
async function handleOcrFileSelect(event) {
    const file = event.target.files?.[0]; if (!file) { clearOcrSelection(); return; } if (!file.type.startsWith('image/')) { alert('Please select an image file.'); clearOcrSelection(); return; } ocrSelectedFile = file; try { const dataUrl = await fileToDataURL(file); ocrThumbnailArea.innerHTML = ''; const img = document.createElement('img'); img.src = dataUrl; img.className = 'ocr-thumbnail-img'; img.alt = 'Selected Image'; const removeBtn = document.createElement('button'); removeBtn.className = 'ocr-remove-thumb-btn'; removeBtn.innerHTML = '&times;'; removeBtn.title = 'Remove Image'; removeBtn.onclick = clearOcrSelection; ocrThumbnailArea.append(img, removeBtn); ocrExtractBtn.disabled = false; ocrResultText.value = ''; ocrCopyBtn.disabled = true; ocrStatus.style.display = 'none'; } catch (error) { console.error("FileReader error:", error); alert("Error reading file for thumbnail."); clearOcrSelection(); }
}
function clearOcrSelection() {
    console.log("Clearing OCR selection."); ocrSelectedFile = null; if (ocrFileInput) ocrFileInput.value = ''; if (ocrThumbnailArea) ocrThumbnailArea.innerHTML = ''; if (ocrExtractBtn) ocrExtractBtn.disabled = true; if (ocrResultText) ocrResultText.value = ''; if (ocrCopyBtn) ocrCopyBtn.disabled = true; if (ocrStatus) ocrStatus.style.display = 'none';
}
async function handleOcrExtract() {
    if (!ocrSelectedFile) { alert("Select image first."); return; } if (!ocrExtractBtn || !ocrResultText || !ocrCopyBtn || !ocrStatus) { console.error("OCR UI elements missing for extraction."); return; } ocrExtractBtn.disabled = true; ocrCopyBtn.disabled = true; ocrStatus.textContent = 'Reading image data...'; ocrStatus.style.color = '#6c757d'; ocrStatus.style.display = 'block'; ocrResultText.value = ''; try { if (typeof puter === 'undefined' || !puter.ai?.img2txt) throw new Error("img2txt missing."); const dataUrl = await fileToDataURL(ocrSelectedFile); console.log(`Requesting OCR for file: ${ocrSelectedFile.name} (data URL len: ${dataUrl.length})`); ocrStatus.textContent = 'Extracting text...'; const extractedText = await puter.ai.img2txt(dataUrl); if (typeof extractedText === 'string') { ocrResultText.value = extractedText; ocrCopyBtn.disabled = !extractedText; ocrStatus.style.display = 'none'; console.log("OCR successful."); } else { throw new Error("API did not return valid text."); } } catch (error) { console.error("Error during OCR extraction:", error); ocrResultText.value = ''; ocrStatus.textContent = `Error: ${error.message || 'Unknown OCR error'}`; ocrStatus.style.color = 'red'; ocrStatus.style.display = 'block'; } finally { ocrExtractBtn.disabled = false; }
}
// --- End Phase 12 ---


// --- Initialization ---
function initializeChatListeners() {
    if (!chatInput || !sendButton || !messageDisplay) { console.warn("Chat elements missing."); setTimeout(initializeChatListeners, 200); return false; } if (isChatInitialized) return true; console.log("Adding chat listeners."); if (!sendButton.getAttribute('data-listener-added')) { sendButton.addEventListener('click', sendMessage); sendButton.setAttribute('data-listener-added', 'true'); } if (!chatInput.getAttribute('data-listener-added')) { chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }); chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100; requestAnimationFrame(() => { scrollHeight = chatInput.scrollHeight; chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px'; }); }); chatInput.setAttribute('data-listener-added', 'true'); } isChatInitialized = true; chatInput.disabled = false; sendButton.disabled = false; if (document.body.contains(chatInput)) chatInput.focus(); console.log("Chat listeners added."); return true;
}

function initializeBannerAndPopups() {
    console.log("Initializing banner/popups."); const buttonPopupMap = { 'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr', 'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' }; for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) { const button = document.getElementById(buttonId); if (button && !button.getAttribute('data-popup-listener-added')) { button.addEventListener('click', () => { showPopup(popupId); if (popupId === 'history') displayChatHistory(); else if (popupId === 'tts') initializeTTSListeners(); else if (popupId === 'imgGen') initializeImageGenPopup(); else if (popupId === 'ocr') initializeOcrPopup(); /* Add others */ }); button.setAttribute('data-popup-listener-added', 'true'); } else if (!button) console.warn(`Banner button #${buttonId} missing.`); } const newChatBtn = bannerButtons.newChat; if (newChatBtn && !newChatBtn.getAttribute('data-newchat-listener-added')) { newChatBtn.addEventListener('click', () => { console.log("New Chat clicked"); closeActivePopup(); startNewChat(); }); newChatBtn.setAttribute('data-newchat-listener-added', 'true'); } else if (!newChatBtn) console.warn(`New chat button missing.`); if (popupBackdrop && !popupBackdrop.getAttribute('data-backdrop-listener-added')) { popupBackdrop.addEventListener('click', closeActivePopup); popupBackdrop.setAttribute('data-backdrop-listener-added', 'true'); } else if (!popupBackdrop) console.warn(`Backdrop missing.`); const closeButtons = document.querySelectorAll('.close-popup-btn'); closeButtons.forEach(button => { const parentPopup = button.closest('.popup'); if (parentPopup && !button.getAttribute('data-close-listener-added')) { button.addEventListener('click', closeActivePopup); button.setAttribute('data-close-listener-added', 'true'); } else if (!parentPopup) console.warn("Close button outside popup?", button); }); console.log("Banner/Popup listeners initialized.");
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


// --- Phase 13: Vision (Placeholder) ---


// --- Phase 14: Settings (Placeholder) ---