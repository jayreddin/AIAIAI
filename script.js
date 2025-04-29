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
// Add references for mode buttons/containers if needed later
// --- End Phase 11 elements


// --- App State ---
let selectedModel = 'gpt-4o-mini';
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


// Model list
const availableModels = [
    'gpt-4o-mini', 'gpt-4o', 'o1', 'o1-mini', 'o1-pro', 'o3', 'o3-mini', 'o4-mini',
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview',
    'claude-3-7-sonnet', 'claude-3-5-sonnet', 'deepseek-chat', 'deepseek-reasoner',
    'gemini-2.0-flash', 'gemini-1.5-flash',
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    'mistral-large-latest', 'pixtral-large-latest', 'codestral-latest',
    'google/gemma-2-27b-it', 'grok-beta'
];




// --- Authentication Logic ---
async function updateUiForAuthState(isSignedIn) {
    if (!authSectionDiv || !chatUiDiv) { console.error("Core UI elements missing."); return; }
    if (isSignedIn) {
        try {
            if (authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth module not available.");
            const user = await puter.auth.getUser(); //
            if (authStatusDiv) authStatusDiv.textContent = `Signed in as: ${user.username}`; //
            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex';
            if (signOutButton) signOutButton.style.display = 'inline-block';
            console.log("User signed in:", user);
            initializeAppState(); // Initialize app state AFTER sign-in
        } catch (error) {
            console.error("Error during sign-in update:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Signed in, but error: ${error.message || 'Unknown error'}`;
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
        isChatInitialized = false; // Reset flags on sign out
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
            console.log("puter.auth.signIn() completed. Result:", signedIn); //
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
} else {
    // console.warn("Sign out button element (#signout-button) not found during initial load.");
}




// --- Phase 4: Model Selection ---
function populateModelSelector() {
    if (!modelSelector) { console.error("Model selector element not found!"); return; }
    if (modelSelector.options.length > 1 && modelSelector.options[0].value !== "") { console.log("Model selector already populated."); modelSelector.value = selectedModel; return; }
    console.log("Populating model selector...");
    modelSelector.innerHTML = '';
    availableModels.forEach(modelId => { const option = document.createElement('option'); option.value = modelId; option.textContent = modelId; if (modelId === selectedModel) option.selected = true; modelSelector.appendChild(option); }); //
    if (!modelSelector.getAttribute('data-listener-added')) {
        modelSelector.addEventListener('change', (event) => { selectedModel = event.target.value; console.log(`Selected model changed to: ${selectedModel}`); if (chatInput) chatInput.focus(); });
        modelSelector.setAttribute('data-listener-added', 'true');
        console.log("Model selector change listener added.");
    }
    console.log("Model selector populated.");
}


// --- Phase 3 & 5: Chat Logic & Display ---
function displayMessage(text, sender) {
    if (!messageDisplay) { console.error("Message display area (#message-display) not found!"); return; }
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    const content = document.createElement('div');
    content.classList.add('message-content'); content.textContent = text;
    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.appendChild(content); bubble.appendChild(timestamp);
    if (sender === 'user') { bubble.classList.add('user-bubble'); }
    else if (sender === 'ai') { bubble.classList.add('ai-bubble'); }
    else { bubble.classList.add('system-bubble'); bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : ''; if (bubble.contains(timestamp)) { bubble.removeChild(timestamp); } }

    // Phase 7: Message Action Buttons
    if (sender !== 'system') {
        const actions = document.createElement('div');
        actions.classList.add('message-actions');

        const resendButton = createActionButton('Resend', 'fas fa-redo');
        const copyButton = createActionButton('Copy', 'fas fa-copy');
        const deleteButton = createActionButton('Delete', 'fas fa-trash');
        const speakButton = createActionButton('Speak', 'fas fa-volume-up');

        actions.appendChild(resendButton);
        actions.appendChild(copyButton);
        actions.appendChild(deleteButton);
        actions.appendChild(speakButton);

        bubble.appendChild(actions);

        // Add event listeners to the action buttons
        resendButton.addEventListener('click', () => resendMessage(text));
        copyButton.addEventListener('click', () => copyMessage(text, content)); // Pass content element
        deleteButton.addEventListener('click', () => deleteMessage(bubble));
        speakButton.addEventListener('click', (event) => speakMessage(text, event.currentTarget)); // Pass button for feedback
    }

    messageDisplay.appendChild(bubble);
    requestAnimationFrame(() => { if (document.body.contains(messageDisplay)) { messageDisplay.scrollTo({ top: messageDisplay.scrollHeight, behavior: 'smooth' }); } });
}


// Helper function to create action buttons
function createActionButton(title, iconClass) {
    const button = document.createElement('button');
    button.classList.add('action-button');
    button.title = title;
    const icon = document.createElement('i');
    icon.className = iconClass; // Simpler way to set classes
    button.appendChild(icon);
    return button;
}


// --- Phase 7: Action Button Functions ---
function resendMessage(text) {
    if (!chatInput) return;
    chatInput.value = text;
    sendMessage();
}

function copyMessage(text, contentElement) { // Receive contentElement
    const textToCopy = contentElement.textContent; // Use textContent
    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('Message copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function deleteMessage(bubble) {
    if (!messageDisplay) return;
    messageDisplay.removeChild(bubble);
}

async function speakMessage(text, buttonElement = null) { // Optional button element for feedback
    let originalContent = null;
    if (buttonElement) {
        originalContent = buttonElement.innerHTML; // Store original content
        buttonElement.disabled = true; // Disable button while speaking
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; // Loading state
    }
    try {
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.txt2speech) throw new Error("Puter SDK/AI or txt2speech module not available.");
        const audio = await puter.ai.txt2speech(text); //
        if (audio && typeof audio.play === 'function') {
            if (buttonElement) buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>'; // Speaking state
            audio.play();
            audio.onended = () => {
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.innerHTML = originalContent; // Restore original
                }
            };
            audio.onerror = (e) => {
                console.error("Error playing speech:", e);
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.innerHTML = originalContent; // Restore on error
                }
            };
        } else {
            console.error("puter.ai.txt2speech did not return a playable audio object.");
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalContent; // Restore if no audio
            }
        }
    } catch (error) {
        console.error("Error calling puter.ai.txt2speech:", error);
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalContent; // Restore on catch
        }
    }
}


async function sendMessage() {
    if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; }
    const inputText = chatInput.value.trim(); if (inputText === '') return;
    const currentInputText = inputText;
    displayMessage(currentInputText, 'user');
    chatInput.value = ''; chatInput.disabled = true; sendButton.disabled = true;
    chatInput.style.height = 'auto'; chatInput.style.height = '30px'; // Reset height
    displayMessage(`AI (${selectedModel}) is thinking...`, 'system');
    try {
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) throw new Error("Puter SDK/AI module not available.");
        console.log(`Sending (Model: ${selectedModel}): "${currentInputText}"`);
        const response = await puter.ai.chat(currentInputText, { model: selectedModel }); //
        console.log("Received response:", response);
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
        let aiText = "Sorry, couldn't get response."; // Default error message
        // Extract text based on likely response structures
        if (response && typeof response === 'string') { // Simple string response
            aiText = response;
        } else if (response && typeof response.text === 'string') { // Object with 'text' property
            aiText = response.text;
        } else if (response && response.message && typeof response.message.content === 'string') { // Nested message object
            aiText = response.message.content;
        } else if (response && response.error) { // Explicit error in response
            aiText = `Error from AI: ${response.error.message || response.error}`;
            console.error("AI API returned an error:", response.error);
        } else {
            // Fallback if structure is unknown or response is empty/unexpected
            console.warn("Received unexpected response structure from AI:", response);
            aiText = "Received an unexpected response format from the AI.";
        }
        displayMessage(aiText, 'ai');
    } catch (error) {
        console.error("Error calling puter.ai.chat:", error);
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
        displayMessage(`Error communicating with AI: ${error.message || 'Unknown error'}`, 'system');
        // Improved error handling for specific messages
        if (error && error.error && error.error.message && error.error.message.includes("Permission denied")) {
            displayMessage("Please ensure you are properly signed in and have granted the necessary permissions.", 'system');
        } else if (error && error.error && error.error.message && error.error.message.includes("insufficient funds")) {
            displayMessage("Your Puter account has insufficient funds. Please add funds to use this feature.", 'system');
        }
    } finally {
        chatInput.disabled = false; sendButton.disabled = false;
        if (document.body.contains(chatInput)) chatInput.focus();
    }
}


// --- Phase 6: Popup Handling ---
function showPopup(popupId) {
    const popup = popups[popupId];
    if (popup && popupBackdrop) {
        closeActivePopup();
        popup.style.display = 'block';
        popupBackdrop.style.display = 'block';
        activePopup = popup;
        console.log(`Showing popup: ${popupId}`);
        popup.dispatchEvent(new CustomEvent('show')); // Dispatch show event
    } else {
        console.error(`Popup element for '${popupId}' or backdrop not found.`);
    }
}

function closeActivePopup() {
    if (isTTSMicRecording) { stopTTSMicRecording(); } // Stop TTS recording if active
    if (activePopup && popupBackdrop) {
        activePopup.style.display = 'none';
        popupBackdrop.style.display = 'none';
        console.log(`Closing popup: ${activePopup.id}`);
        activePopup = null;
    }
}


// --- Phase 8: New Chat & History ---
function startNewChat() {
    console.log("Starting a new chat session (clearing display).");
    // **Placeholder for Phase 8 KV Saving:** saveCurrentChatToKV();
    if (messageDisplay) messageDisplay.innerHTML = '';
    if (modelSelector) modelSelector.value = 'gpt-4o-mini';
    selectedModel = 'gpt-4o-mini';
    displayMessage('New chat started.', 'system');
}

function displayChatHistory() {
    if (!historyList) { console.error("History list element not found."); return; }
    historyList.innerHTML = 'Chat History using Puter KV Store will be implemented in Phase 8.';
    // **Placeholder for Phase 8 KV Loading:** loadChatHistoryFromKV();
}

function loadChatFromHistory(historyKey) {
    console.log("Loading chat from history (using key):", historyKey);
    // **Placeholder for Phase 8 KV Getting:** const session = await getChatSessionFromKV(historyKey); if (session) { ... }
    displayMessage(`Loading history for key "${historyKey}" will be implemented in Phase 8`, 'system');
    closeActivePopup();
}
// --- End Phase 8 Placeholders ---


// --- Phase 9: TTS Chat Mode ---
async function handleTTSSend() {
    if (!ttsTextInput || !ttsSendButton || !ttsOutputArea) {
        console.error("TTS input, send button or output area missing!");
        return;
    }
    const text = ttsTextInput.value.trim();
    if (!text) return;

    ttsSendButton.disabled = true;
    ttsTextInput.disabled = true;

    let statusDiv = ttsOutputArea.querySelector('.tts-status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'tts-status';
        statusDiv.style.fontStyle = 'italic';
        statusDiv.style.color = '#666';
        ttsOutputArea.appendChild(statusDiv);
    }
    statusDiv.textContent = 'AI Thinking...';

    try {
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat || !puter.ai.txt2speech) {
            throw new Error("Puter SDK/AI or required AI modules not available.");
        }

        console.log(`TTS Mode: Sending to AI (Model: ${selectedModel}): "${text}"`);
        const response = await puter.ai.chat(text, { model: selectedModel }); //
        console.log("TTS Mode: Received AI response:", response);

        let aiText = "Sorry, I could not process that."; // Default
        if (response && typeof response === 'string') aiText = response;
        else if (response && typeof response.text === 'string') aiText = response.text;
        else if (response && response.message && typeof response.message.content === 'string') aiText = response.message.content;
        else if (response && response.error) aiText = `Error from AI: ${response.error.message || response.error}`;
        else console.warn("TTS Mode: Received unexpected response structure from AI:", response);

        statusDiv.textContent = 'Generating Speech...';
        console.log("TTS Mode: Requesting speech for:", aiText);
        const audioObject = await puter.ai.txt2speech(aiText); //

        if (audioObject && typeof audioObject.play === 'function') {
            console.log("TTS Mode: Received playable audio object.");
            statusDiv.textContent = ''; // Clear status before adding entry

            const entryDiv = document.createElement('div');
            entryDiv.className = 'tts-entry';
            const textSpan = document.createElement('span');
            textSpan.className = 'tts-entry-text';
            textSpan.textContent = aiText;
            const replayButton = document.createElement('button');
            replayButton.className = 'tts-replay-button';
            replayButton.innerHTML = '<i class="fas fa-play"></i> Replay';
            replayButton.onclick = (event) => speakMessage(aiText, event.currentTarget);

            entryDiv.appendChild(textSpan);
            entryDiv.appendChild(replayButton);
            ttsOutputArea.insertBefore(entryDiv, statusDiv);
            ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight;

            audioObject.onerror = (e) => { console.error("Error playing initial TTS audio:", e); statusDiv.textContent = 'Error playing audio.'; };
            audioObject.onended = () => { console.log("Initial TTS playback finished."); statusDiv.textContent = 'Playback finished.'; };
            audioObject.play(); //
            statusDiv.textContent = 'Speaking...';
        } else {
            console.error("TTS Mode: puter.ai.txt2speech did not return a valid playable object.");
            statusDiv.textContent = 'Failed to generate playable speech.';
        }
    } catch (error) {
        console.error("Error in TTS mode:", error);
        if (statusDiv) statusDiv.textContent = `Error: ${error.message || 'Unknown TTS error'}`;
    } finally {
        setTimeout(() => {
            if (ttsSendButton) ttsSendButton.disabled = false;
            if (ttsTextInput) ttsTextInput.disabled = false;
        }, 500);
        if (ttsTextInput) ttsTextInput.value = '';
    }
}

// --- Phase 9 Enhancement: TTS Mic Recording ---
function toggleTTSMicRecording() {
    if (isTTSMicRecording) stopTTSMicRecording();
    else startTTSMicRecording();
}

async function startTTSMicRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Media Devices API not supported.'); console.error('getUserMedia not supported'); return;
    }
    if (!ttsMicButton || !ttsOutputArea) { console.error("TTS Mic button or output area is missing."); return; }

    ttsMicButton.disabled = true;

    try {
        ttsStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Mic access granted for TTS recording.");
        ttsAudioChunks = [];
        const options = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options.mimeType = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) options.mimeType = 'audio/ogg;codecs=opus';
        else console.warn("Preferred Opus MIME types not supported, using browser default.");

        ttsMediaRecorder = new MediaRecorder(ttsStream, options);

        ttsMediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) ttsAudioChunks.push(event.data); };
        ttsMediaRecorder.onstop = processTTSAudioRecording; // Call separate function on stop
        ttsMediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error:", event.error);
            isTTSMicRecording = false;
            if (ttsMicButton) { ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; ttsMicButton.disabled = false; }
            alert(`Recording error: ${event.error.name || 'Unknown error'}`);
            if (ttsStream) ttsStream.getTracks().forEach(track => track.stop()); ttsStream = null;
        };

        ttsMediaRecorder.start();
        isTTSMicRecording = true;
        ttsMicButton.classList.add('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-stop"></i>';
        ttsMicButton.disabled = false;
        console.log("TTS recording started.");
        // Add status update
        let statusDiv = ttsOutputArea.querySelector('.tts-status');
        if (statusDiv) statusDiv.textContent = 'Recording audio...';

    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert(`Could not access microphone: ${err.name}. Check permissions.`);
        if (ttsMicButton) { ttsMicButton.disabled = false; ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; }
        isTTSMicRecording = false;
    }
}

function stopTTSMicRecording() {
    if (ttsMediaRecorder && isTTSMicRecording) {
        console.log("Attempting to stop TTS recording...");
        ttsMediaRecorder.stop(); // Triggers onstop
        // Stop tracks in the onstop handler after processing
    } else {
        console.warn("Stop called but TTS recording not active or recorder not initialized.");
        isTTSMicRecording = false;
        if (ttsMicButton) { ttsMicButton.classList.remove('recording'); ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>'; ttsMicButton.disabled = false; }
        if (ttsStream) { ttsStream.getTracks().forEach(track => track.stop()); ttsStream = null; }
    }
}

function processTTSAudioRecording() {
    console.log("Processing TTS audio recording.");
    // Stop tracks now that recording is finished
    if (ttsStream) {
       ttsStream.getTracks().forEach(track => track.stop());
       ttsStream = null;
    }
    isTTSMicRecording = false; // Update state
    if (ttsMicButton) { // Update button UI
       ttsMicButton.classList.remove('recording');
       ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>';
       ttsMicButton.disabled = false;
    }

    if (ttsAudioChunks.length === 0) { console.warn("No audio chunks recorded."); return; }
    if (!ttsOutputArea) { console.error("TTS output area is missing."); return; }

    const mimeType = ttsMediaRecorder?.mimeType || 'audio/webm';
    const audioBlob = new Blob(ttsAudioChunks, { type: mimeType });
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log("Blob size:", audioBlob.size, "URL:", audioUrl);

    const audioEntryDiv = document.createElement('div');
    audioEntryDiv.className = 'tts-audio-entry';
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = audioUrl;
    // Revoking URL immediately might cause issues, browsers handle it differently.
    // It's often safer to revoke onended/onerror or just let the browser manage it.
    // audioElement.onloadedmetadata = () => URL.revokeObjectURL(audioUrl);

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'tts-audio-timestamp';
    timestampSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    audioEntryDiv.appendChild(audioElement);
    audioEntryDiv.appendChild(timestampSpan);

    let statusDiv = ttsOutputArea.querySelector('.tts-status');
    if (statusDiv) ttsOutputArea.insertBefore(audioEntryDiv, statusDiv);
    else ttsOutputArea.appendChild(audioEntryDiv);

    ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight;
    ttsAudioChunks = []; // Clear chunks
}


function initializeTTSListeners() {
    if (ttsListenersAdded) return;
    if (!ttsSendButton || !ttsTextInput || !ttsOutputArea || !ttsMicButton) {
        console.warn("TTS elements not found during listener init."); return;
    }
    console.log("Initializing TTS event listeners.");
    ttsSendButton.addEventListener('click', handleTTSSend);
    ttsTextInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleTTSSend(); } });
    ttsMicButton.addEventListener('click', toggleTTSMicRecording); // Added listener
    ttsListenersAdded = true;
    console.log("TTS listeners added.");
}
// --- End Phase 9 ---


// --- Phase 10: Main Chat Microphone Input ---
function initializeChatMicInput() { // Renamed function
    if (!micButton || !chatInput) { console.warn("Main chat microphone or chat input elements not found."); return; }
    if (!micButton.getAttribute('data-mic-listener-added')) {
        micButton.addEventListener('click', toggleChatMicRecording); // Renamed handler call
        micButton.setAttribute('data-mic-listener-added', 'true');
        console.log("Main chat mic listener added.");
    }
}

function toggleChatMicRecording() { // Renamed function
    if (isChatMicRecording) stopChatMicRecording();
    else startChatMicRecording();
}

function startChatMicRecording() { // Renamed function
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Sorry, your browser doesn't support speech recognition."); return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; recognition.interimResults = false;

    recognition.onstart = () => { console.log("Main chat speech recognition started."); isChatMicRecording = true; micButton.classList.add('recording'); micButton.textContent = "⏺️"; };
    recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; console.log("Main chat speech recognized:", transcript); chatInput.value = transcript; };
    recognition.onend = () => { console.log("Main chat speech recognition ended."); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; };
    recognition.onerror = (event) => {
        console.error("Main chat speech recognition error:", event.error);
        let errorMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'no-speech') errorMsg = "No speech detected. Please try again.";
        else if (event.error === 'audio-capture') errorMsg = "Audio capture failed. Check microphone connection/settings.";
        else if (event.error === 'not-allowed') errorMsg = "Microphone access denied. Please allow access in browser settings.";
        alert(errorMsg); // Simple alert for now
        isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; // Ensure UI reset
    };

    try { recognition.start(); }
    catch (e) { console.error("Failed to start main chat speech recognition:", e); isChatMicRecording = false; micButton.classList.remove('recording'); micButton.textContent = "🎤"; alert("Failed to start speech recognition."); }
}

function stopChatMicRecording() { // Renamed function
    if (recognition && isChatMicRecording) { recognition.stop(); console.log("Main chat speech recognition stopped manually."); }
    // Reset happens in onend
}
// --- End Phase 10 ---

// --- Phase 11: Basic Image Generation ---
async function handleBasicImageGeneration() {
    if (!imgGenPrompt || !imgGenGenerateBtn || !imgGenResults || !imgGenLoading || !imgGenError) {
        console.error("Image Gen UI elements missing!");
        return;
    }
    const prompt = imgGenPrompt.value.trim();
    if (!prompt) {
        imgGenError.textContent = "Please enter a prompt.";
        imgGenError.style.display = 'block';
        return;
    }

    imgGenGenerateBtn.disabled = true;
    imgGenError.style.display = 'none';
    imgGenLoading.style.display = 'block';
    // Clear previous results for this basic mode? Or append? Let's append for now.
    // imgGenResults.innerHTML = ''; // Uncomment to clear previous

    try {
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.txt2img) {
            throw new Error("Puter SDK/AI or txt2img module not available.");
        }
        console.log("Requesting image generation for prompt:", prompt);
        // Using testMode=true to avoid charges during development/testing
        const imageElement = await puter.ai.txt2img(prompt, true); //

        if (imageElement && imageElement.tagName === 'IMG') {
            console.log("Image generated successfully.");
            displayGeneratedImage(imageElement, prompt); // Call helper to display
        } else {
            throw new Error("API did not return a valid image element.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        imgGenError.textContent = `Error: ${error.message || 'Unknown error during image generation.'}`;
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
     imageElement.alt = prompt; // Use prompt for alt text

     const saveButton = document.createElement('button');
     saveButton.className = 'img-gen-save-btn';
     saveButton.title = 'Save Image';
     saveButton.innerHTML = '<i class="fas fa-save"></i>';
     saveButton.onclick = () => {
         // Simple save using download attribute on a link
         const link = document.createElement('a');
         link.href = imageElement.src; // Data URL from the image element
         // Create a filename (sanitize prompt crudely)
         const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
         link.download = filename;
         document.body.appendChild(link); // Required for FF
         link.click();
         document.body.removeChild(link);
     };

    // TODO: Add click listener to imageElement for expansion/modal view

    container.appendChild(imageElement);
    container.appendChild(saveButton);
    imgGenResults.appendChild(container);
}


function initializeImageGenPopup() {
    if (imgGenListenersAdded) return;
    if (!imgGenGenerateBtn) { console.warn("Image Gen generate button not found during init."); return; }

    console.log("Initializing Image Gen listeners.");
    imgGenGenerateBtn.addEventListener('click', handleBasicImageGeneration);
    // Add listeners for mode buttons later

    imgGenListenersAdded = true;
    console.log("Image Gen listeners added.");
}
// --- End Phase 11 ---


// --- Initialization ---
function initializeChatListeners() {
    if (!chatInput || !sendButton || !messageDisplay) { console.warn("Chat elements not ready."); setTimeout(initializeChatListeners, 200); return false; }
    if (isChatInitialized) { return true; }

    console.log("Adding chat event listeners.");
    if (!sendButton.getAttribute('data-listener-added')) { sendButton.addEventListener('click', sendMessage); sendButton.setAttribute('data-listener-added', 'true'); }
    if (!chatInput.getAttribute('data-listener-added')) {
        chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100;
            requestAnimationFrame(() => { scrollHeight = chatInput.scrollHeight; chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px'; });
        });
        chatInput.setAttribute('data-listener-added', 'true');
    }
    isChatInitialized = true; chatInput.disabled = false; sendButton.disabled = false;
    if (document.body.contains(chatInput)) chatInput.focus();
    console.log("Chat event listeners added.");
    return true;
}

function initializeBannerAndPopups() {
    console.log("Initializing banner button listeners and popup close handlers.");
    const buttonPopupMap = { 'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr', 'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' };

    for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) {
        const button = document.getElementById(buttonId);
        if (button && !button.getAttribute('data-popup-listener-added')) {
            button.addEventListener('click', () => {
                showPopup(popupId);
                // Initialize specific popup listeners when shown
                if (popupId === 'history') displayChatHistory();
                else if (popupId === 'tts') initializeTTSListeners();
                else if (popupId === 'imgGen') initializeImageGenPopup(); // Init Img Gen
                // Add other initializers here (OCR, Vision, Settings) when implemented
            });
            button.setAttribute('data-popup-listener-added', 'true');
        } else if (!button) { console.warn(`Banner button #${buttonId} not found.`); }
    }

    const newChatBtn = bannerButtons.newChat;
    if (newChatBtn && !newChatBtn.getAttribute('data-newchat-listener-added')) {
        newChatBtn.addEventListener('click', () => { console.log("New Chat clicked"); closeActivePopup(); startNewChat(); });
        newChatBtn.setAttribute('data-newchat-listener-added', 'true');
    } else if (!newChatBtn) { console.warn(`Banner button #new-chat-btn not found.`); }

    if (popupBackdrop && !popupBackdrop.getAttribute('data-backdrop-listener-added')) {
        popupBackdrop.addEventListener('click', closeActivePopup);
        popupBackdrop.setAttribute('data-backdrop-listener-added', 'true');
    } else if (!popupBackdrop) { console.warn(`Popup backdrop element not found.`); }

    const closeButtons = document.querySelectorAll('.close-popup-btn');
    closeButtons.forEach(button => {
        const parentPopup = button.closest('.popup');
        if (parentPopup && !button.getAttribute('data-close-listener-added')) {
            button.addEventListener('click', closeActivePopup);
            button.setAttribute('data-close-listener-added', 'true');
        } else if (!parentPopup) { console.warn("Found close button outside popup?", button); }
    });
    console.log("Banner/Popup listeners initialized.");
}

function initializeAppState() {
    console.log("Initializing app state...");
    populateModelSelector();
    initializeChatListeners();
    initializeBannerAndPopups();
    initializeChatMicInput();
    // Note: TTS and ImgGen listeners are initialized when their popups are opened
}

async function initialAuthCheck(retryCount = 0) {
    if (typeof puter === 'undefined' || !puter.auth || typeof puter.auth.isSignedIn !== 'function') {
        if (retryCount < 5) { console.warn(`Puter SDK retry ${retryCount + 1}`); setTimeout(() => initialAuthCheck(retryCount + 1), 500 * (retryCount + 1)); return; }
        else { console.error("Puter SDK failed."); if (authStatusDiv) authStatusDiv.textContent = "Error: SDK failed."; if (signInButton) signInButton.disabled = true; return; }
    }
    console.log("Performing initial auth check...");
    try {
        const isSignedIn = puter.auth.isSignedIn(); //
        console.log("Initial isSignedIn status:", isSignedIn);
        await updateUiForAuthState(isSignedIn);
    } catch (error) {
        console.error("Error initial auth check:", error);
        await updateUiForAuthState(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded.");
    if (typeof puter !== 'undefined') initialAuthCheck();
    else { console.warn("SDK not immediate, delaying check."); setTimeout(initialAuthCheck, 300); }
});


// --- Phase 12: OCR (Placeholder) ---


// --- Phase 13: Vision (Placeholder) ---


// --- Phase 14: Settings (Placeholder) ---