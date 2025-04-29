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
const usernameDisplay = document.getElementById('username-display');
const historyList = document.getElementById('history-list');


// Phase 6 Elements
const popupBackdrop = document.getElementById('popup-backdrop');
const bannerButtons = { /* ... */
    newChat: document.getElementById('new-chat-btn'), history: document.getElementById('history-btn'), imgGen: document.getElementById('img-gen-btn'), ocr: document.getElementById('ocr-btn'), vision: document.getElementById('vision-btn'), tts: document.getElementById('tts-btn'), settings: document.getElementById('settings-btn')
};
const popups = { /* ... */
    history: document.getElementById('history-popup'), imgGen: document.getElementById('img-gen-popup'), ocr: document.getElementById('ocr-popup'), vision: document.getElementById('vision-popup'), tts: document.getElementById('tts-popup'), settings: document.getElementById('settings-popup')
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

// Phase 13 elements
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
// --- End Phase 13 elements


// --- App State ---
let selectedModel = 'gpt-4o-mini';
let isChatInitialized = false;
let activePopup = null;
const historyKeyPrefix = 'chatHistory_'; // Phase 8

// Recognition State
let chatRecognition; // For main chat mic
let isChatMicRecording = false;
let ttsRecognition; // For TTS dictation mic
let isTTSDictating = false; // Renamed state

// Phase 9 TTS (Removed MediaRecorder state)
let ttsListenersAdded = false;

// Phase 11 Image Gen State
let imgGenListenersAdded = false;
let currentImageGenMode = 'basic';

// Phase 12 OCR State
let ocrListenersAdded = false;
let ocrSelectedFile = null;

// Phase 13 Vision State
let visionListenersAdded = false;
let visionStream = null;
let lastCapturedFrameDataUrl = null;


// --- Model List (Updated & Grouped) ---
const modelGroups = { /* ... (no changes from previous) ... */
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
    if (!authSectionDiv || !chatUiDiv) { console.error("Core UI missing."); return; }
    if (isSignedIn) {
        try {
            if (authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth missing.");
            const user = await puter.auth.getUser();
            if (authStatusDiv) authStatusDiv.textContent = `Signed in.`;
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username; // Display only username
                usernameDisplay.style.display = 'block';
            }
            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex';
            if (signOutButton) signOutButton.style.display = 'inline-block';
            console.log("User signed in:", user);
            initializeAppState();
        } catch (error) {
            console.error("Sign-in update/fetch error:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign-in error: ${error.message || 'Unknown'}`;
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
        closeActivePopup(); // Also calls stopVisionCamera if needed
        if (isChatMicRecording) stopChatMicRecording();
        if (isTTSDictating) stopTTSDictation(); // Stop dictation if active
    }
}


// --- Sign In/Out Listeners ---
if (signInButton) { /* ... */
    signInButton.addEventListener('click', async () => { console.log("Sign in clicked"); if (authStatusDiv) authStatusDiv.textContent = 'Signing in...'; signInButton.disabled = true; signInButton.textContent = '...'; try { if (!puter.auth) throw new Error("SDK/auth missing."); const signedIn = await puter.auth.signIn(); console.log("signIn result:", signedIn); await updateUiForAuthState(Boolean(signedIn)); } catch (error) { console.error("signIn error:", error); if (authStatusDiv) authStatusDiv.textContent = `Error: ${error.message || 'Unknown'}`; signInButton.disabled = false; signInButton.textContent = 'Sign In'; await updateUiForAuthState(false); } });
} else console.error("Sign In button missing!");
if (signOutButton) { /* ... */
    signOutButton.addEventListener('click', () => { console.log("Sign out clicked"); try { if (!puter.auth) throw new Error("SDK/auth missing."); puter.auth.signOut(); updateUiForAuthState(false); console.log("Signed out."); if (messageDisplay) messageDisplay.innerHTML = ''; if (chatInput) chatInput.disabled = true; if (sendButton) sendButton.disabled = true; } catch (error) { console.error("Sign out error:", error); if (authStatusDiv) authStatusDiv.textContent = `Error: ${error.message}`; updateUiForAuthState(false); } });
}


// --- Phase 4: Model Selection (Updated Grouping) ---
function populateModelSelector() { /* ... (no changes from previous) ... */
    if (!modelSelector) { console.error("Model selector missing!"); return; } if (modelSelector.options.length > 1 && modelSelector.options[0].value !== "") { console.log("Models already populated."); modelSelector.value = selectedModel; return; } console.log("Populating models with groups..."); modelSelector.innerHTML = ''; let defaultFound = false; for (const group in modelGroups) if (modelGroups[group].includes(selectedModel)) { defaultFound = true; break; } if (!defaultFound) { const opt = document.createElement('option'); opt.value = selectedModel; opt.textContent = selectedModel; opt.selected = true; modelSelector.appendChild(opt); console.warn(`Default model ${selectedModel} added manually.`); } for (const groupName in modelGroups) { const optgroup = document.createElement('optgroup'); optgroup.label = groupName; modelGroups[groupName].forEach(id => { const opt = document.createElement('option'); opt.value = id; opt.textContent = id.includes('/') ? id.split('/')[1] : id; if (id === selectedModel && defaultFound) opt.selected = true; optgroup.appendChild(opt); }); modelSelector.appendChild(optgroup); } if (!modelSelector.getAttribute('data-listener-added')) { modelSelector.addEventListener('change', (e) => { selectedModel = e.target.value; console.log(`Model changed: ${selectedModel}`); if (chatInput) chatInput.focus(); }); modelSelector.setAttribute('data-listener-added', 'true'); console.log("Model selector listener added."); } console.log("Models populated.");
}


// --- Phase 3 & 5: Chat Logic & Display ---
function displayMessage(text, sender) { /* ... (no changes needed) ... */
    if (!messageDisplay) { console.error("Msg display missing!"); return; } const bubble = document.createElement('div'); bubble.className = 'message-bubble'; const content = document.createElement('div'); content.className = 'message-content'; content.textContent = text; const timestamp = document.createElement('div'); timestamp.className = 'timestamp'; timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); bubble.appendChild(content); bubble.appendChild(timestamp); if (sender === 'user') bubble.classList.add('user-bubble'); else if (sender === 'ai') bubble.classList.add('ai-bubble'); else { bubble.classList.add('system-bubble'); bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : ''; if (bubble.contains(timestamp)) bubble.removeChild(timestamp); } if (sender !== 'system') { const actions = document.createElement('div'); actions.className = 'message-actions'; const resendBtn = createActionButton('Resend', 'fas fa-redo'); const copyBtn = createActionButton('Copy', 'fas fa-copy'); const delBtn = createActionButton('Delete', 'fas fa-trash'); const speakBtn = createActionButton('Speak', 'fas fa-volume-up'); actions.append(resendBtn, copyBtn, delBtn, speakBtn); bubble.appendChild(actions); resendBtn.onclick = () => resendMessage(text); copyBtn.onclick = () => copyMessage(text, content); delBtn.onclick = () => deleteMessage(bubble); speakBtn.onclick = (e) => speakMessage(text, e.currentTarget); } messageDisplay.appendChild(bubble); requestAnimationFrame(() => { if (document.body.contains(messageDisplay)) messageDisplay.scrollTop = messageDisplay.scrollHeight; });
}
function createActionButton(title, iconClass) { /* ... (no changes) ... */
    const button = document.createElement('button'); button.className = 'action-button'; button.title = title; const icon = document.createElement('i'); icon.className = iconClass; button.appendChild(icon); return button;
}


// --- Phase 7: Action Button Functions ---
function resendMessage(text) { if (!chatInput) return; chatInput.value = text; sendMessage(); }
function copyMessage(text, contentElement) { const textToCopy = contentElement.textContent; navigator.clipboard.writeText(textToCopy).then(() => console.log('Copied!')).catch(err => console.error('Copy failed: ', err)); }
function deleteMessage(bubble) { if (!messageDisplay) return; messageDisplay.removeChild(bubble); }
async function speakMessage(text, buttonElement = null) { /* ... (no changes needed) ... */
    let originalContent = null; if (buttonElement) { originalContent = buttonElement.innerHTML; buttonElement.disabled = true; buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; } try { if (typeof puter === 'undefined' || !puter.ai?.txt2speech) throw new Error("txt2speech missing."); const audio = await puter.ai.txt2speech(text); if (audio?.play) { if (buttonElement) buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>'; audio.play(); audio.onended = () => { if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }; audio.onerror = (e) => { console.error("Speech error:", e); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }; } else { console.error("No playable audio returned."); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } } } catch (error) { console.error("speakMessage error:", error); if (buttonElement) { buttonElement.disabled = false; buttonElement.innerHTML = originalContent; } }
}


async function sendMessage() { /* ... (no changes needed) ... */
    if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; } const inputText = chatInput.value.trim(); if (inputText === '') return; const currentInputText = inputText; displayMessage(currentInputText, 'user'); chatInput.value = ''; chatInput.disabled = true; sendButton.disabled = true; chatInput.style.height = 'auto'; chatInput.style.height = '30px'; displayMessage(`AI (${selectedModel}) is thinking...`, 'system'); try { if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat not available."); console.log(`Sending (Model: ${selectedModel}): "${currentInputText}"`); const response = await puter.ai.chat(currentInputText, { model: selectedModel }); console.log("Received response:", response); const loadingIndicator = document.getElementById('loading-indicator'); if (loadingIndicator) messageDisplay.removeChild(loadingIndicator); let aiText = "Sorry, couldn't get response."; if (response && typeof response === 'string') aiText = response; else if (response?.text) aiText = response.text; else if (response?.message?.content) aiText = response.message.content; else if (response?.error) aiText = `Error: ${response.error.message || response.error}`; else console.warn("Unexpected response structure:", response); displayMessage(aiText, 'ai'); } catch (error) { console.error("sendMessage error:", error); const loadingIndicator = document.getElementById('loading-indicator'); if (loadingIndicator) messageDisplay.removeChild(loadingIndicator); displayMessage(`Error: ${error.message || 'Unknown error'}`, 'system'); if (error?.error?.message?.includes("insufficient funds")) displayMessage("Insufficient Puter credits.", 'system'); } finally { chatInput.disabled = false; sendButton.disabled = false; if (document.body.contains(chatInput)) chatInput.focus(); }
}


// --- Phase 6: Popup Handling ---
function showPopup(popupId) { /* ... (no changes) ... */
    const popup = popups[popupId]; if (popup && popupBackdrop) { closeActivePopup(); popup.style.display = 'block'; popupBackdrop.style.display = 'block'; activePopup = popup; console.log(`Showing popup: ${popupId}`); popup.dispatchEvent(new CustomEvent('show')); } else { console.error(`Popup element '${popupId}' missing.`); }
}
function closeActivePopup() {
    if (isTTSDictating) stopTTSDictation(); // Stop dictation if active
    if (visionStream) stopVisionCamera(); // Stop camera if active
    if (activePopup && popupBackdrop) {
        activePopup.style.display = 'none';
        popupBackdrop.style.display = 'none';
        console.log(`Closing popup: ${activePopup.id}`);
        activePopup = null;
    }
    closeImageModal();
}


// --- Phase 8: New Chat & History (KV Implementation) ---
async function startNewChat() { /* ... (no changes from previous) ... */
    console.log("Starting new chat session."); if (messageDisplay && messageDisplay.children.length > 0) { const messages = Array.from(messageDisplay.querySelectorAll('.message-bubble:not(.system-bubble)')).map(bubble => ({ sender: bubble.classList.contains('user-bubble') ? 'user' : 'ai', text: bubble.querySelector('.message-content')?.textContent || '' })); if (messages.length > 0) { const sessionObject = { timestamp: Date.now(), model: selectedModel, messages: messages }; const key = historyKeyPrefix + sessionObject.timestamp; try { if (!puter.kv) throw new Error("KV missing."); console.log(`Saving session: ${key}`); await puter.kv.set(key, JSON.stringify(sessionObject)); } catch (error) { console.error("KV save error:", error); alert("Could not save."); } } } if (messageDisplay) messageDisplay.innerHTML = ''; if (modelSelector) modelSelector.value = 'gpt-4o-mini'; selectedModel = 'gpt-4o-mini'; displayMessage('New chat started.', 'system');
}
async function displayChatHistory() { /* ... (no changes from previous) ... */
    if (!historyList) { console.error("History list missing."); return; } historyList.innerHTML = '<p>Loading...</p>'; try { if (!puter.kv) throw new Error("KV missing."); console.log("Fetching history keys..."); const keys = await puter.kv.list(historyKeyPrefix + '*'); if (!keys || keys.length === 0) { historyList.innerHTML = '<p>No history.</p>'; return; } const sortedKeys = keys.sort((a, b) => parseInt(b.substring(historyKeyPrefix.length)) - parseInt(a.substring(historyKeyPrefix.length))); historyList.innerHTML = ''; sortedKeys.forEach(key => { const timestamp = parseInt(key.substring(historyKeyPrefix.length)); const dateString = new Date(timestamp).toLocaleString(); const itemDiv = document.createElement('div'); itemDiv.className = 'history-item'; const infoSpan = document.createElement('span'); infoSpan.textContent = `Chat: ${dateString}`; infoSpan.style.marginRight = '10px'; const loadBtn = document.createElement('button'); loadBtn.textContent = 'Load'; loadBtn.onclick = () => loadChatFromHistory(key); const delBtn = document.createElement('button'); delBtn.textContent = 'Delete'; delBtn.style.marginLeft = '5px'; delBtn.style.color = 'red'; delBtn.onclick = (e) => { e.stopPropagation(); if (confirm(`Delete chat from ${dateString}?`)) deleteChatHistory(key, itemDiv); }; itemDiv.append(infoSpan, loadBtn, delBtn); historyList.appendChild(itemDiv); }); } catch (error) { console.error("Error fetching history:", error); historyList.innerHTML = '<p>Error loading history.</p>'; }
}
async function loadChatFromHistory(key) { /* ... (no changes from previous) ... */
    console.log("Loading chat:", key); displayMessage(`Loading chat: ${new Date(parseInt(key.substring(historyKeyPrefix.length))).toLocaleString()}...`, 'system'); closeActivePopup(); try { if (!puter.kv) throw new Error("KV missing."); const sessionString = await puter.kv.get(key); if (!sessionString) throw new Error("Session not found."); const session = JSON.parse(sessionString); if (messageDisplay) messageDisplay.innerHTML = ''; if (session.messages?.length) session.messages.forEach(msg => displayMessage(msg.text, msg.sender)); selectedModel = session.model || 'gpt-4o-mini'; if (modelSelector) modelSelector.value = selectedModel; displayMessage(`Loaded chat from ${new Date(session.timestamp).toLocaleString()}.`, 'system'); } catch (error) { console.error(`Error loading session ${key}:`, error); displayMessage(`Error loading chat: ${error.message}`, 'system'); }
}
async function deleteChatHistory(key, listItemElement) { /* ... (no changes from previous) ... */
    console.log("Deleting chat:", key); try { if (!puter.kv) throw new Error("KV missing."); await puter.kv.del(key); if (listItemElement?.parentNode === historyList) { historyList.removeChild(listItemElement); console.log("Deleted."); if (historyList.children.length === 0) historyList.innerHTML = '<p>No history.</p>'; } } catch (error) { console.error("Error deleting chat:", key, error); alert("Could not delete."); }
}
// --- End Phase 8 ---


// --- Phase 9: TTS Chat Mode (Mic behavior changed) ---
async function handleTTSSend() { /* ... (no changes needed here) ... */
    if (!ttsTextInput || !ttsSendButton || !ttsOutputArea) { console.error("TTS elements missing!"); return; } const text = ttsTextInput.value.trim(); if (!text) return; ttsSendButton.disabled = true; ttsTextInput.disabled = true; let statusDiv = ttsOutputArea.querySelector('.tts-status'); if (!statusDiv) { statusDiv = document.createElement('div'); statusDiv.className = 'tts-status'; statusDiv.style.fontStyle = 'italic'; statusDiv.style.color = '#666'; ttsOutputArea.appendChild(statusDiv); } statusDiv.textContent = 'AI Thinking...'; try { if (typeof puter === 'undefined' || !puter.ai?.chat || !puter.ai?.txt2speech) throw new Error("Puter AI modules missing."); console.log(`TTS Mode: Sending to AI: "${text}"`); const response = await puter.ai.chat(text, { model: selectedModel }); console.log("TTS Mode: AI response:", response); let aiText = "Sorry, couldn't process."; if (response && typeof response === 'string') aiText = response; else if (response?.text) aiText = response.text; else if (response?.message?.content) aiText = response.message.content; else if (response?.error) aiText = `Error: ${response.error.message || response.error}`; else console.warn("TTS unexpected response:", response); statusDiv.textContent = 'Generating Speech...'; console.log("TTS Mode: Requesting speech for:", aiText); const audioObject = await puter.ai.txt2speech(aiText); if (audioObject?.play) { console.log("TTS Mode: Playable audio received."); statusDiv.textContent = ''; const entryDiv = document.createElement('div'); entryDiv.className = 'tts-entry'; const textSpan = document.createElement('span'); textSpan.className = 'tts-entry-text'; textSpan.textContent = aiText; const replayButton = document.createElement('button'); replayButton.className = 'tts-replay-button'; replayButton.innerHTML = '<i class="fas fa-play"></i> Replay'; replayButton.onclick = (e) => speakMessage(aiText, e.currentTarget); entryDiv.append(textSpan, replayButton); ttsOutputArea.insertBefore(entryDiv, statusDiv); ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight; audioObject.onerror = (e) => { console.error("TTS play error:", e); statusDiv.textContent = 'Audio play error.'; }; audioObject.onended = () => { console.log("TTS playback finished."); statusDiv.textContent = 'Playback finished.'; }; audioObject.play(); statusDiv.textContent = 'Speaking...'; } else { console.error("TTS Mode: No playable audio returned."); statusDiv.textContent = 'Failed to generate speech.'; } } catch (error) { console.error("Error in TTS mode:", error); if (statusDiv) statusDiv.textContent = `Error: ${error.message || 'Unknown'}`; } finally { setTimeout(() => { if (ttsSendButton) ttsSendButton.disabled = false; if (ttsTextInput) ttsTextInput.disabled = false; }, 500); if (ttsTextInput) ttsTextInput.value = ''; }
}
// --- Phase 9 Enhancement: TTS Mic Dictation ---
function toggleTTSDictation() { // Renamed from toggleTTSMicRecording
    if (isTTSDictating) stopTTSDictation();
    else startTTSDictation();
}

function startTTSDictation() { // Renamed from startTTSMicRecording
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Browser doesn't support speech recognition."); return;
    }
    if (!ttsMicButton || !ttsTextInput) { console.error("TTS Mic/Input missing."); return; }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    ttsRecognition = new SpeechRecognition();
    ttsRecognition.continuous = false; ttsRecognition.interimResults = false;

    ttsRecognition.onstart = () => { console.log("TTS dictation started."); isTTSDictating = true; ttsMicButton.classList.add('recording'); ttsMicButton.innerHTML = '<i class="fas fa-stop"></i>'; };
    ttsRecognition.onresult = (e) => { const transcript = e.results[0][0].transcript; console.log("TTS dictation recognized:", transcript); ttsTextInput.value = transcript; }; // Target TTS input
    ttsRecognition.onend = () => { console.log("TTS dictation ended."); isTTSDictating = false; ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; };
    ttsRecognition.onerror = (e) => { console.error("TTS dictation error:", e.error); let errorMsg = `Dictation error: ${e.error}`; if (e.error === 'no-speech') errorMsg = "No speech detected."; else if (e.error === 'audio-capture') errorMsg = "Mic capture failed."; else if (e.error === 'not-allowed') errorMsg = "Mic access denied."; alert(errorMsg); isTTSDictating = false; ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; };

    try { ttsRecognition.start(); }
    catch (e) { console.error("Failed start TTS dictation:", e); isTTSDictating = false; ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; alert("Failed to start dictation."); }
}

function stopTTSDictation() { // Renamed from stopTTSMicRecording
    if (ttsRecognition && isTTSDictating) { ttsRecognition.stop(); console.log("TTS dictation stopped manually."); }
    // Reset happens in onend
}

function initializeTTSListeners() {
    if (ttsListenersAdded) return; if (!ttsSendButton || !ttsTextInput || !ttsOutputArea || !ttsMicButton) { console.warn("TTS elements missing for init."); return; } console.log("Initializing TTS listeners."); ttsSendButton.addEventListener('click', handleTTSSend); ttsTextInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTTSSend(); } });
    ttsMicButton.addEventListener('click', toggleTTSDictation); // Changed listener target
    ttsListenersAdded = true; console.log("TTS listeners added.");
}
// --- End Phase 9 ---


// --- Phase 10: Main Chat Microphone Input ---
function initializeChatMicInput() { /* ... (no changes needed) ... */
    if (!micButton || !chatInput) { console.warn("Main chat mic/input missing."); return; } if (!micButton.getAttribute('data-mic-listener-added')) { micButton.addEventListener('click', toggleChatMicRecording); micButton.setAttribute('data-mic-listener-added', 'true'); console.log("Main chat mic listener added."); }
}
function toggleChatMicRecording() { if (isChatMicRecording) stopChatMicRecording(); else startChatMicRecording(); }
function startChatMicRecording() { /* ... (no changes needed) ... */
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) { alert("Browser doesn't support speech recognition."); return; } const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; chatRecognition = new SpeechRecognition(); chatRecognition.continuous = false; chatRecognition.interimResults = false; chatRecognition.onstart = () => { console.log("Chat mic started."); isChatMicRecording = true; micButton.classList.add('recording'); micButton.textContent = "⏺️"; }; chatRecognition.onresult = (e) => { const transcript = e.results[0][0].transcript; console.log("Chat speech recognized:", transcript); chatInput.value = transcript; }; chatRecognition.onend = () => { console.log("Chat mic ended."); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; }; chatRecognition.onerror = (e) => { console.error("Chat mic error:", e.error); let errorMsg = `Speech error: ${e.error}`; if (e.error === 'no-speech') errorMsg = "No speech detected."; else if (e.error === 'audio-capture') errorMsg = "Mic capture failed."; else if (e.error === 'not-allowed') errorMsg = "Mic access denied."; alert(errorMsg); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; }; try { chatRecognition.start(); } catch (e) { console.error("Failed start chat mic:", e); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; alert("Failed to start mic."); }
}
function stopChatMicRecording() { if (chatRecognition && isChatMicRecording) { chatRecognition.stop(); console.log("Chat mic stopped manually."); } }
// --- End Phase 10 ---

// --- Phase 11: Basic Image Generation ---
async function handleBasicImageGeneration() { /* ... (no changes needed) ... */
    if (!imgGenPrompt || !imgGenGenerateBtn || !imgGenResults || !imgGenLoading || !imgGenError) { console.error("Img Gen UI elements missing!"); return; } const prompt = imgGenPrompt.value.trim(); if (!prompt) { imgGenError.textContent = "Enter prompt."; imgGenError.style.display = 'block'; return; } imgGenGenerateBtn.disabled = true; imgGenError.style.display = 'none'; imgGenLoading.style.display = 'block'; try { if (typeof puter === 'undefined' || !puter.ai?.txt2img) throw new Error("txt2img missing."); console.log("Requesting img gen:", prompt); const imageElement = await puter.ai.txt2img(prompt, true); if (imageElement?.tagName === 'IMG') { console.log("Img generated."); displayGeneratedImage(imageElement, prompt); } else { throw new Error("Invalid image element returned."); } } catch (error) { console.error("Error generating image:", error); imgGenError.textContent = `Error: ${error.message || 'Unknown'}`; imgGenError.style.display = 'block'; } finally { imgGenLoading.style.display = 'none'; imgGenGenerateBtn.disabled = false; }
}
function displayGeneratedImage(imageElement, prompt = "generated") { /* ... (no changes needed) ... */
     if (!imgGenResults) return; const container = document.createElement('div'); container.className = 'img-gen-thumbnail-container'; imageElement.className = 'img-gen-thumbnail'; imageElement.alt = prompt; imageElement.onclick = () => expandImage(imageElement.src); const saveButton = document.createElement('button'); saveButton.className = 'img-gen-save-btn'; saveButton.title = 'Save Image'; saveButton.innerHTML = '<i class="fas fa-save"></i>'; saveButton.onclick = (e) => { e.stopPropagation(); const link = document.createElement('a'); link.href = imageElement.src; const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png'; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); }; container.append(imageElement, saveButton); const firstChild = imgGenResults.querySelector('#img-gen-loading, #img-gen-error'); if (firstChild) imgGenResults.insertBefore(container, firstChild); else imgGenResults.prepend(container);
}
function expandImage(imageSrc) { /* ... (no changes needed) ... */
    if (!imageModal || !imageModalBackdrop || !expandedImage) { console.error("Modal elements missing."); return; } expandedImage.src = imageSrc; expandedImage.alt = document.querySelector(`.img-gen-thumbnail[src="${imageSrc}"]`)?.alt || "Expanded Image"; imageModal.style.display = 'block'; imageModalBackdrop.style.display = 'block';
}
function closeImageModal() { /* ... (no changes needed) ... */
    if (imageModal && imageModalBackdrop) { imageModal.style.display = 'none'; imageModalBackdrop.style.display = 'none'; expandedImage.src = '#'; expandedImage.alt = ''; }
}
function saveExpandedImage() { /* ... (no changes needed) ... */
    if (!expandedImage || !expandedImage.src || expandedImage.src.endsWith('#')) return; const link = document.createElement('a'); link.href = expandedImage.src; const promptText = expandedImage.alt || `expanded_${Date.now()}`; const filename = promptText.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png'; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
function initializeImageGenPopup() { /* ... (no changes needed) ... */
    if (imgGenListenersAdded) return; if (!imgGenGenerateBtn || !imgGenPrompt || !imgGenModeButtonsContainer || !imgGenModePanelsContainer || !imageModalSaveBtn || !imageModalCloseBtn || !imageModalBackdrop) { console.warn("Some Img Gen/Modal elements missing."); return; } console.log("Initializing Img Gen listeners."); imgGenGenerateBtn.addEventListener('click', handleBasicImageGeneration); imgGenPrompt.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBasicImageGeneration(); } }); const modeButtons = imgGenModeButtonsContainer.querySelectorAll('.img-gen-mode-btn'); const modePanels = imgGenModePanelsContainer.querySelectorAll('.img-gen-mode-panel'); modeButtons.forEach(button => { button.addEventListener('click', () => { const mode = button.getAttribute('data-mode'); if (button.disabled) return; modeButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); modePanels.forEach(panel => panel.classList.toggle('active', panel.id === `img-gen-${mode}-mode`)); currentImageGenMode = mode; console.log("Img Gen mode:", mode); }); }); imageModalCloseBtn.addEventListener('click', closeImageModal); imageModalBackdrop.addEventListener('click', closeImageModal); imageModalSaveBtn.addEventListener('click', saveExpandedImage); imgGenListenersAdded = true; console.log("Img Gen listeners added.");
}
// --- End Phase 11 ---

// --- Phase 12: OCR ---
let ocrListenersInitialized = false;

function fileToDataURL(file) { /* ... (no changes needed) ... */
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = (error) => reject(error); reader.readAsDataURL(file); });
}
function initializeOcrPopup() { /* ... (no changes needed) ... */
    if (ocrListenersInitialized) return; if (!ocrUploadBtn || !ocrFileInput || !ocrExtractBtn || !ocrCopyBtn || !ocrThumbnailArea || !ocrResultText || !ocrStatus) { console.error("OCR UI elements missing!"); return; } console.log("Initializing OCR listeners."); ocrUploadBtn.addEventListener('click', () => ocrFileInput.click()); ocrFileInput.addEventListener('change', handleOcrFileSelect); ocrExtractBtn.addEventListener('click', handleOcrExtract); ocrCopyBtn.addEventListener('click', () => { if (!ocrResultText.value) return; navigator.clipboard.writeText(ocrResultText.value).then(() => { const originalText = ocrCopyBtn.innerHTML; ocrCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!'; setTimeout(() => { ocrCopyBtn.innerHTML = originalText; }, 1500); }).catch(err => console.error('OCR Copy failed: ', err)); }); ocrListenersInitialized = true; console.log("OCR listeners added.");
}
async function handleOcrFileSelect(event) { /* ... (no changes needed) ... */
    const file = event.target.files?.[0]; if (!file) { clearOcrSelection(); return; } if (!file.type.startsWith('image/')) { alert('Please select an image file.'); clearOcrSelection(); return; } ocrSelectedFile = file; try { const dataUrl = await fileToDataURL(file); ocrThumbnailArea.innerHTML = ''; const img = document.createElement('img'); img.src = dataUrl; img.className = 'ocr-thumbnail-img'; img.alt = 'Selected Image'; const removeBtn = document.createElement('button'); removeBtn.className = 'ocr-remove-thumb-btn'; removeBtn.innerHTML = '&times;'; removeBtn.title = 'Remove Image'; removeBtn.onclick = clearOcrSelection; ocrThumbnailArea.append(img, removeBtn); ocrExtractBtn.disabled = false; ocrResultText.value = ''; ocrCopyBtn.disabled = true; ocrStatus.style.display = 'none'; } catch (error) { console.error("FileReader error:", error); alert("Error reading file for thumbnail."); clearOcrSelection(); }
}
function clearOcrSelection() { /* ... (no changes needed) ... */
    console.log("Clearing OCR selection."); ocrSelectedFile = null; if (ocrFileInput) ocrFileInput.value = ''; if (ocrThumbnailArea) ocrThumbnailArea.innerHTML = ''; if (ocrExtractBtn) ocrExtractBtn.disabled = true; if (ocrResultText) ocrResultText.value = ''; if (ocrCopyBtn) ocrCopyBtn.disabled = true; if (ocrStatus) ocrStatus.style.display = 'none';
}
async function handleOcrExtract() { /* ... (no changes needed) ... */
    if (!ocrSelectedFile) { alert("Select image first."); return; } if (!ocrExtractBtn || !ocrResultText || !ocrCopyBtn || !ocrStatus) { console.error("OCR UI elements missing for extraction."); return; } ocrExtractBtn.disabled = true; ocrCopyBtn.disabled = true; ocrStatus.textContent = 'Reading image data...'; ocrStatus.style.color = '#6c757d'; ocrStatus.style.display = 'block'; ocrResultText.value = ''; try { if (typeof puter === 'undefined' || !puter.ai?.img2txt) throw new Error("img2txt missing."); const dataUrl = await fileToDataURL(ocrSelectedFile); console.log(`Requesting OCR for file: ${ocrSelectedFile.name} (data URL len: ${dataUrl.length})`); ocrStatus.textContent = 'Extracting text...'; const extractedText = await puter.ai.img2txt(dataUrl); if (typeof extractedText === 'string') { ocrResultText.value = extractedText; ocrCopyBtn.disabled = !extractedText; ocrStatus.style.display = 'none'; console.log("OCR successful."); } else { throw new Error("API did not return valid text."); } } catch (error) { console.error("Error during OCR extraction:", error); ocrResultText.value = ''; ocrStatus.textContent = `Error: ${error.message || 'Unknown OCR error'}`; ocrStatus.style.color = 'red'; ocrStatus.style.display = 'block'; } finally { ocrExtractBtn.disabled = false; }
}
// --- End Phase 12 ---

// --- Phase 13: Vision ---
let visionListenersInitialized = false;
let visionCanvas = null; // Canvas for frame capture

function initializeVisionPopup() {
    if (visionListenersInitialized) return;
    if (!visionEnableCamBtn || !visionVideoContainer || !visionVideoPreview || !visionControls || !visionDescribeBtn || !visionStopCamBtn || !visionStatus || !visionResultsText || !visionActions || !visionClearBtn || !visionSpeakBtn || !visionCopyBtn || !visionSaveImgBtn) {
        console.error("Vision UI elements missing!"); return;
    }
    console.log("Initializing Vision listeners.");

    visionEnableCamBtn.addEventListener('click', startVisionCamera);
    visionStopCamBtn.addEventListener('click', stopVisionCamera);
    visionDescribeBtn.addEventListener('click', describeVisionFrame);
    visionClearBtn.addEventListener('click', clearVisionResults);
    visionSpeakBtn.addEventListener('click', () => { if (visionResultsText.value) speakMessage(visionResultsText.value, visionSpeakBtn); });
    visionCopyBtn.addEventListener('click', () => { if (visionResultsText.value) navigator.clipboard.writeText(visionResultsText.value).then(() => console.log("Vision text copied.")).catch(err => console.error("Vision copy failed:", err)); });
    visionSaveImgBtn.addEventListener('click', saveVisionImage);

    visionListenersInitialized = true;
    console.log("Vision listeners added.");
}

async function startVisionCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { alert('Camera API not supported.'); return; }
    if (!visionVideoPreview || !visionEnableCamBtn || !visionVideoContainer || !visionControls || !visionStatus) return;

    visionStatus.textContent = 'Requesting camera access...';
    visionStatus.style.display = 'block';
    visionEnableCamBtn.disabled = true;

    try {
        visionStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); // Default to front camera
        console.log("Camera stream obtained.");
        visionVideoPreview.srcObject = visionStream;
        visionVideoPreview.onloadedmetadata = () => {
            visionVideoPreview.play();
            visionEnableCamBtn.style.display = 'none';
            visionVideoContainer.style.display = 'block';
            visionControls.style.display = 'block'; // Show controls only when video is ready
            visionStatus.style.display = 'none';
            console.log("Camera preview started.");
        };
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
    if (visionActions) visionActions.style.display = 'none'; // Hide actions too
    if (visionStatus) visionStatus.style.display = 'none';
    if (visionResultsText) visionResultsText.value = '';
    if (visionEnableCamBtn) visionEnableCamBtn.disabled = false; // Re-enable button
}

async function describeVisionFrame() {
    if (!visionVideoPreview || !visionStream || !visionDescribeBtn || !visionResultsText || !visionStatus || !visionActions) {
        console.error("Vision elements missing for description."); return;
    }
    if (visionVideoPreview.readyState < visionVideoPreview.HAVE_METADATA) {
        console.warn("Video not ready for capture."); return;
    }

    visionDescribeBtn.disabled = true;
    visionStatus.textContent = 'Capturing frame...';
    visionStatus.style.color = '#6c757d';
    visionStatus.style.display = 'block';
    visionResultsText.value = '';
    visionActions.style.display = 'none'; // Hide actions while processing


    try {
        // Create canvas if it doesn't exist
        if (!visionCanvas) visionCanvas = document.createElement('canvas');
        const videoWidth = visionVideoPreview.videoWidth;
        const videoHeight = visionVideoPreview.videoHeight;
        visionCanvas.width = videoWidth;
        visionCanvas.height = videoHeight;

        const context = visionCanvas.getContext('2d');
        context.drawImage(visionVideoPreview, 0, 0, videoWidth, videoHeight);

        lastCapturedFrameDataUrl = visionCanvas.toDataURL('image/jpeg', 0.9); // Use JPEG for potentially smaller size
        console.log("Frame captured as data URL (length):", lastCapturedFrameDataUrl.length);

        visionStatus.textContent = 'Asking AI to describe...';
        if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat missing.");

        // Explicitly use a vision-capable model
        const visionModel = 'gpt-4o-mini'; // Or 'gpt-4o' [cite: 8]
        console.log(`Sending frame to Vision model: ${visionModel}`);
        const response = await puter.ai.chat("Describe this image in detail.", lastCapturedFrameDataUrl, { model: visionModel }); // [cite: 6, 13]

        console.log("Vision response:", response);
        let aiText = "Sorry, couldn't get description.";
        if (response && typeof response === 'string') aiText = response;
        else if (response?.text) aiText = response.text;
        else if (response?.message?.content) aiText = response.message.content;
        else if (response?.error) aiText = `Error: ${response.error.message || response.error}`;
        else console.warn("Unexpected vision response:", response);

        visionResultsText.value = aiText;
        visionStatus.style.display = 'none'; // Hide status
        visionActions.style.display = 'block'; // Show actions
        visionSpeakBtn.disabled = false;
        visionCopyBtn.disabled = false;
        visionSaveImgBtn.disabled = false; // Enable save image button

    } catch (error) {
        console.error("Error describing vision frame:", error);
        visionStatus.textContent = `Error: ${error.message || 'Unknown error'}`;
        visionStatus.style.color = 'red';
        lastCapturedFrameDataUrl = null; // Clear captured frame on error
    } finally {
        visionDescribeBtn.disabled = false; // Re-enable describe button
    }
}

function clearVisionResults() {
    if (visionResultsText) visionResultsText.value = '';
    if (visionActions) visionActions.style.display = 'none';
    if (visionStatus) visionStatus.style.display = 'none';
    visionSpeakBtn.disabled = true;
    visionCopyBtn.disabled = true;
    visionSaveImgBtn.disabled = true;
    lastCapturedFrameDataUrl = null;
}

function saveVisionImage() {
    if (!lastCapturedFrameDataUrl) { alert("No image captured to save."); return; }
    const link = document.createElement('a');
    link.href = lastCapturedFrameDataUrl;
    link.download = `vision_capture_${Date.now()}.jpg`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function initializeVisionListeners() { // Wrapper for event listeners
    if (visionListenersInitialized) return;
    if (!visionEnableCamBtn || !visionStopCamBtn || !visionDescribeBtn || !visionClearBtn || !visionSpeakBtn || !visionCopyBtn || !visionSaveImgBtn) {
        console.error("Cannot initialize Vision listeners, elements missing."); return;
    }
    console.log("Initializing Vision listeners.");
    visionEnableCamBtn.addEventListener('click', startVisionCamera);
    visionStopCamBtn.addEventListener('click', stopVisionCamera);
    visionDescribeBtn.addEventListener('click', describeVisionFrame);
    visionClearBtn.addEventListener('click', clearVisionResults);
    visionSpeakBtn.addEventListener('click', () => { if (visionResultsText.value) speakMessage(visionResultsText.value, visionSpeakBtn); });
    visionCopyBtn.addEventListener('click', () => { if (visionResultsText.value) navigator.clipboard.writeText(visionResultsText.value).then(() => console.log("Vision text copied.")).catch(err => console.error("Vision copy failed:", err)); });
    visionSaveImgBtn.addEventListener('click', saveVisionImage);
    visionListenersInitialized = true;
    console.log("Vision listeners added.");
}
// --- End Phase 13 ---


// --- Initialization ---
function initializeChatListeners() {
    if (!chatInput || !sendButton || !messageDisplay) { console.warn("Chat elements missing."); setTimeout(initializeChatListeners, 200); return false; } if (isChatInitialized) return true; console.log("Adding chat listeners."); if (!sendButton.getAttribute('data-listener-added')) { sendButton.addEventListener('click', sendMessage); sendButton.setAttribute('data-listener-added', 'true'); } if (!chatInput.getAttribute('data-listener-added')) { chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }); chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100; requestAnimationFrame(() => { scrollHeight = chatInput.scrollHeight; chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px'; }); }); chatInput.setAttribute('data-listener-added', 'true'); } isChatInitialized = true; chatInput.disabled = false; sendButton.disabled = false; if (document.body.contains(chatInput)) chatInput.focus(); console.log("Chat listeners added."); return true;
}

function initializeBannerAndPopups() { // Modified to init Vision
    console.log("Initializing banner/popups."); const buttonPopupMap = { 'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr', 'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' }; for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) { const button = document.getElementById(buttonId); if (button && !button.getAttribute('data-popup-listener-added')) { button.addEventListener('click', () => { showPopup(popupId); if (popupId === 'history') displayChatHistory(); else if (popupId === 'tts') initializeTTSListeners(); else if (popupId === 'imgGen') initializeImageGenPopup(); else if (popupId === 'ocr') initializeOcrPopup(); else if (popupId === 'vision') initializeVisionListeners(); /* Add others */ }); button.setAttribute('data-popup-listener-added', 'true'); } else if (!button) console.warn(`Banner button #${buttonId} missing.`); } const newChatBtn = bannerButtons.newChat; if (newChatBtn && !newChatBtn.getAttribute('data-newchat-listener-added')) { newChatBtn.addEventListener('click', () => { console.log("New Chat clicked"); closeActivePopup(); startNewChat(); }); newChatBtn.setAttribute('data-newchat-listener-added', 'true'); } else if (!newChatBtn) console.warn(`New chat button missing.`); if (popupBackdrop && !popupBackdrop.getAttribute('data-backdrop-listener-added')) { popupBackdrop.addEventListener('click', closeActivePopup); popupBackdrop.setAttribute('data-backdrop-listener-added', 'true'); } else if (!popupBackdrop) console.warn(`Backdrop missing.`); const closeButtons = document.querySelectorAll('.close-popup-btn'); closeButtons.forEach(button => { const parentPopup = button.closest('.popup'); if (parentPopup && !button.getAttribute('data-close-listener-added')) { button.addEventListener('click', closeActivePopup); button.setAttribute('data-close-listener-added', 'true'); } else if (!parentPopup) console.warn("Close button outside popup?", button); }); console.log("Banner/Popup listeners initialized.");
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


// --- Phase 14: Settings (Placeholder) ---