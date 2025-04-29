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
const modelSelector = document.getElementById('model-selector'); // Added Phase 4

// --- App State ---
let selectedModel = 'gpt-4o-mini'; // Default model [cite: 8] - Added Phase 4
let isChatInitialized = false; // Flag to track listener setup

// List of known models from puterAPI.txt - Added Phase 4
// Ensure this list matches the documentation you have access to
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
    // Ensure critical elements exist before proceeding
    if (!authSectionDiv || !chatUiDiv) {
        console.error("Core UI elements (authSectionDiv or chatUiDiv) not found. Cannot update UI state.");
        return;
    }

    if (isSignedIn) {
        try {
            if(authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK or auth module not available.");
            const user = await puter.auth.getUser(); //
            if(authStatusDiv) authStatusDiv.textContent = `Signed in as: ${user.username}`; // [cite: 784, 143]

            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex'; // Use flex for main chat layout
            if(signOutButton) signOutButton.style.display = 'inline-block'; // Show Sign Out btn

            console.log("User signed in:", user);
            initializeAppState(); // Initialize app state AFTER sign-in

        } catch (error) {
             console.error("Error getting user info or during sign-in update:", error);
             if(authStatusDiv) authStatusDiv.textContent = `Signed in, but error: ${error.message || 'Unknown error'}`;
             // Reset to signed-out state visually on error
             authSectionDiv.style.display = 'block';
             chatUiDiv.style.display = 'none';
             if(signOutButton) signOutButton.style.display = 'none';
        }
    } else {
         if(authStatusDiv) authStatusDiv.textContent = 'Not signed in. Please sign in to use the chat.';
         authSectionDiv.style.display = 'block';
         if(signInButton) {
              signInButton.disabled = false;
              signInButton.textContent = 'Sign In with Puter';
         }
         chatUiDiv.style.display = 'none';
         if(signOutButton) signOutButton.style.display = 'none'; // Hide Sign Out btn
         isChatInitialized = false; // Reset chat init flag on sign out
    }
}

// --- Sign In/Out Listeners ---
if (signInButton) {
    signInButton.addEventListener('click', async () => {
        console.log("Sign in button clicked");
        if(authStatusDiv) authStatusDiv.textContent = 'Attempting sign in...';
        signInButton.disabled = true; signInButton.textContent = 'Signing in...';
        try {
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK or auth module not available.");
            const signedIn = await puter.auth.signIn(); //
            console.log("puter.auth.signIn() completed. Result:", signedIn);
            await updateUiForAuthState(Boolean(signedIn));
        } catch (error) {
            console.error("Error during puter.auth.signIn() call:", error);
            if(authStatusDiv) authStatusDiv.textContent = `Sign in error: ${error.message || 'Unknown error'}`;
            signInButton.disabled = false; signInButton.textContent = 'Sign In with Puter';
            await updateUiForAuthState(false);
        }
    });
} else {
    console.error("Sign In button (#signin-button) not found!");
}

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
        } catch(error) {
            console.error("Error during sign out:", error);
            if(authStatusDiv) authStatusDiv.textContent = `Sign out error: ${error.message}`;
            updateUiForAuthState(false);
        }
    });
} else {
     // It's okay if this isn't found immediately on load
     // console.warn("Sign out button element (#signout-button) not found during initial load.");
}


// --- Phase 4: Model Selection ---
function populateModelSelector() {
    if (!modelSelector) { console.error("Model selector element not found!"); return; }
    // Prevent re-populating if already done
     if(modelSelector.options.length > 1 && modelSelector.options[0].value !== "") {
        console.log("Model selector already populated.");
        modelSelector.value = selectedModel; // Sync with state
        return;
    }
    console.log("Populating model selector...");
    modelSelector.innerHTML = '';
    availableModels.forEach(modelId => { const option = document.createElement('option'); option.value = modelId; option.textContent = modelId; if (modelId === selectedModel) option.selected = true; modelSelector.appendChild(option); });
     // Add listener only once after populating
     if (!modelSelector.getAttribute('data-listener-added')) {
         modelSelector.addEventListener('change', (event) => { selectedModel = event.target.value; console.log(`Selected model changed to: ${selectedModel}`); if (chatInput) chatInput.focus(); });
         modelSelector.setAttribute('data-listener-added', 'true');
         console.log("Model selector change listener added.");
     }
     console.log("Model selector populated.");
}


// --- Phase 3 & 5: Chat Logic & Display ---
// *** UPDATED for Phase 5 ***
function displayMessage(text, sender) {
    if (!messageDisplay) { console.error("Message display area (#message-display) not found!"); return; }

    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');

    const content = document.createElement('div'); // Div for the main text content
    content.classList.add('message-content');
    content.textContent = text;

    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    // Format time simply for now
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.appendChild(content); // Add content first
    // Action buttons placeholder (Phase 7)
    // const actions = document.createElement('div'); actions.classList.add('message-actions'); bubble.appendChild(actions);
    bubble.appendChild(timestamp); // Add timestamp last

    if (sender === 'user') {
        bubble.classList.add('user-bubble');
    } else if (sender === 'ai') {
        bubble.classList.add('ai-bubble');
    } else { // System messages
         bubble.classList.add('system-bubble');
         bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : '';
         // System messages might not need timestamp, remove it
         // Check if timestamp was actually added before removing
         if(bubble.contains(timestamp)) {
              bubble.removeChild(timestamp);
         }
    }

    messageDisplay.appendChild(bubble);

    // Scroll to the bottom using smooth scrolling if available
    requestAnimationFrame(() => {
        // Check if messageDisplay still exists in DOM before scrolling
        if(document.body.contains(messageDisplay)) {
            messageDisplay.scrollTo({ top: messageDisplay.scrollHeight, behavior: 'smooth' });
        }
    });
}

async function sendMessage() {
    if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; }
    const inputText = chatInput.value.trim();
    if (inputText === '') return;

    const currentInputText = inputText;
    displayMessage(currentInputText, 'user');
    chatInput.value = '';
    chatInput.disabled = true; sendButton.disabled = true;
    chatInput.style.height = 'auto'; chatInput.style.height = '30px';

    displayMessage(`AI (${selectedModel}) is thinking...`, 'system');

    try {
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) throw new Error("Puter SDK/AI module not available.");
        console.log(`Sending (Model: ${selectedModel}): "${currentInputText}"`);
        const response = await puter.ai.chat(currentInputText, { model: selectedModel }); // Use selected model
        console.log("Received response:", response);

        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);

        let aiText = "Sorry, couldn't get response.";
        // Handle various response structures
        if (response && typeof response === 'string') aiText = response;
        else if (response && response.text) aiText = response.text;
        else if (response && response.message && response.message.content) aiText = response.message.content;
        else if (response && response.error) aiText = `Error from AI: ${response.error}`;

        displayMessage(aiText, 'ai');

    } catch (error) {
        console.error("Error calling puter.ai.chat:", error);
        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
        displayMessage(`Error communicating with AI: ${error.message || 'Unknown error'}`, 'system');
    } finally {
        chatInput.disabled = false; sendButton.disabled = false;
        if(document.body.contains(chatInput)) chatInput.focus();
    }
}

// --- Initialization ---
function initializeChatListeners() {
    console.log("Attempting to initialize chat listeners.");
    if (!chatInput || !sendButton || !messageDisplay) {
        console.warn("Chat elements not ready for listener init. Retrying.");
        setTimeout(initializeChatListeners, 200); // Retry
        return false;
    }
    if (isChatInitialized) {
        console.log("Listeners already initialized.");
        chatInput.disabled = false; sendButton.disabled = false;
        if(document.body.contains(chatInput)) chatInput.focus();
        return true;
    }

    console.log("Adding chat event listeners.");
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
    chatInput.addEventListener('input', () => { // Auto-resize textarea
         chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100;
         if (scrollHeight > maxHeight) scrollHeight = maxHeight;
         chatInput.style.height = Math.max(30, scrollHeight) + 'px';
    });

    isChatInitialized = true;
    chatInput.disabled = false; sendButton.disabled = false;
    if(document.body.contains(chatInput)) chatInput.focus();
    console.log("Chat event listeners added.");
    return true;
}

function initializeAppState() {
     console.log("Initializing app state (populating models, setting up chat).");
     populateModelSelector();
     initializeChatListeners();
     // Phase 6 logic (initializeBannerAndPopups) is NOT included here yet
}

async function initialAuthCheck() {
    if (typeof puter === 'undefined' || !puter.auth || !puter.auth.isSignedIn) { console.warn("Puter SDK not ready, retrying..."); setTimeout(initialAuthCheck, 100); return; }
     console.log("Performing initial auth check...");
     try {
         const isSignedIn = puter.auth.isSignedIn();
         console.log("Initial isSignedIn status:", isSignedIn);
         await updateUiForAuthState(isSignedIn);
     } catch (error) {
         console.error("Error during initial auth check:", error);
         await updateUiForAuthState(false);
     }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded.");
    if (typeof puter !== 'undefined') { initialAuthCheck(); }
    else { console.error("Puter SDK object not found!"); if(authStatusDiv) authStatusDiv.textContent = "Error: Puter SDK failed to load."; }
});