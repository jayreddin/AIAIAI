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
    if (!authSectionDiv || !chatUiDiv) {
        console.error("Core UI elements (authSectionDiv or chatUiDiv) not found.");
        return;
    }

    if (isSignedIn) {
        try {
            if(authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK or auth module not available.");

            const user = await puter.auth.getUser(); //
            if(authStatusDiv) authStatusDiv.textContent = `Signed in as: ${user.username}`; // [cite: 784, 143]

            authSectionDiv.style.display = 'none';
            chatUiDiv.style.display = 'flex';
            if(signOutButton) signOutButton.style.display = 'inline-block';

            console.log("User signed in:", user);
            initializeAppState(); // Initialize app state AFTER sign-in

        } catch (error) {
             console.error("Error during sign-in update:", error);
             if(authStatusDiv) authStatusDiv.textContent = `Signed in, but error: ${error.message || 'Unknown error'}`;
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
         if(signOutButton) signOutButton.style.display = 'none';
         isChatInitialized = false; // Reset chat init flag on sign out
    }
}

// --- Sign In/Out Listeners ---
if (signInButton) {
    signInButton.addEventListener('click', async () => {
        // ... (implementation remains the same as before) ...
        console.log("Sign in button clicked");
        if(authStatusDiv) authStatusDiv.textContent = 'Attempting sign in...';
        signInButton.disabled = true;
        signInButton.textContent = 'Signing in...';
        try {
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK or auth module not available.");
            const signedIn = await puter.auth.signIn(); //
            console.log("puter.auth.signIn() completed. Result:", signedIn);
            await updateUiForAuthState(Boolean(signedIn));
        } catch (error) {
            console.error("Error during puter.auth.signIn() call:", error);
            if(authStatusDiv) authStatusDiv.textContent = `Sign in error: ${error.message || 'Unknown error'}`;
            signInButton.disabled = false;
            signInButton.textContent = 'Sign In with Puter';
            await updateUiForAuthState(false);
        }
    });
} else {
    console.error("Sign In button (#signin-button) not found!");
}

if (signOutButton) {
    signOutButton.addEventListener('click', () => {
        // ... (implementation remains the same as before) ...
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
}


// --- Phase 4: Model Selection ---

// Function to populate the model selector dropdown
function populateModelSelector() {
    if (!modelSelector) {
        console.error("Model selector element (#model-selector) not found!");
        return;
    }
    // Check if already populated
    if(modelSelector.options.length > 1 && modelSelector.options[0].value !== "") {
        console.log("Model selector already populated.");
        // Ensure current selection matches state variable
        modelSelector.value = selectedModel;
        return;
    }

    console.log("Populating model selector...");
    modelSelector.innerHTML = ''; // Clear existing options (like "Loading...")

    availableModels.forEach(modelId => {
        const option = document.createElement('option');
        option.value = modelId;
        option.textContent = modelId; // Display the model ID
        if (modelId === selectedModel) { // Select the current/default model
            option.selected = true;
        }
        modelSelector.appendChild(option);
    });

    // Add event listener *after* populating
    // Ensure listener isn't added multiple times
    if (!modelSelector.getAttribute('data-listener-added')) {
        modelSelector.addEventListener('change', (event) => {
            selectedModel = event.target.value;
            console.log(`Selected model changed to: ${selectedModel}`);
            // Optional: Maybe clear chat history or add a system message?
            // displayMessage(`Switched model to ${selectedModel}`, 'system');
            if (chatInput) chatInput.focus(); // Refocus input
        });
        modelSelector.setAttribute('data-listener-added', 'true');
         console.log("Model selector change listener added.");
    }

     console.log("Model selector populated and listener checked/added.");
}


// --- Phase 3: Basic Chat Logic ---

function displayMessage(text, sender) {
    // ... (implementation remains the same as before) ...
    if (!messageDisplay) return;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-bubble');

    if (sender === 'user') {
        messageElement.classList.add('user-bubble');
        messageElement.textContent = text;
    } else if (sender === 'ai') {
        messageElement.classList.add('ai-bubble');
        messageElement.textContent = text;
    } else { // System messages
         messageElement.classList.add('system-bubble');
         messageElement.textContent = text;
         if (text && text.toLowerCase().includes('thinking')) {
             messageElement.id = 'loading-indicator';
         }
    }
    messageDisplay.appendChild(messageElement);
    const clearer = document.createElement('div'); clearer.style.clear = 'both'; messageDisplay.appendChild(clearer);
    requestAnimationFrame(() => { messageDisplay.scrollTop = messageDisplay.scrollHeight; });
}

async function sendMessage() {
    // ... (most implementation remains the same as before) ...
    if (!chatInput || !sendButton || !messageDisplay) return;
    const inputText = chatInput.value.trim();
    if (inputText === '') return;

    const currentInputText = inputText;
    displayMessage(currentInputText, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatInput.style.height = 'auto';
    chatInput.style.height = '30px';

    // Include selected model in loading message
    displayMessage(`AI (${selectedModel}) is thinking...`, 'system');

    try {
        if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) throw new Error("Puter SDK or AI module not available.");
        console.log(`Sending to puter.ai.chat with model ${selectedModel}: "${currentInputText}"`);

        // *** USE SELECTED MODEL ***
        const response = await puter.ai.chat(currentInputText, { model: selectedModel });
        console.log("Received response:", response);

        // ... (rest of response handling remains the same) ...
        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
        let aiText = "Sorry, I couldn't get a response.";
        if (response && typeof response === 'string') aiText = response;
        else if (response && response.text) aiText = response.text;
        else if (response && response.message && response.message.content) aiText = response.message.content;
        else if (response && response.error) aiText = `Error from AI: ${response.error}`;
        displayMessage(aiText, 'ai');

    } catch (error) {
        // ... (error handling remains the same) ...
        console.error("Error calling puter.ai.chat:", error);
        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
        displayMessage(`Error communicating with AI: ${error.message || 'Unknown error'}`, 'system');
    } finally {
        // ... (re-enabling controls remains the same) ...
        chatInput.disabled = false;
        sendButton.disabled = false;
        if(document.body.contains(chatInput)) chatInput.focus();
    }
}

// Function to set up chat event listeners
function initializeChatListeners() {
    console.log("Attempting to initialize chat listeners.");
    if (!chatInput || !sendButton || !messageDisplay) {
         console.warn("Chat elements not ready for listener initialization. Retrying soon.");
         setTimeout(initializeChatListeners, 200); // Retry
         return false;
    }
    if (isChatInitialized) {
        console.log("Listeners already initialized.");
        chatInput.disabled = false; sendButton.disabled = false; // Ensure enabled
        if(document.body.contains(chatInput)) chatInput.focus();
        return true;
    }

    console.log("Adding chat event listeners.");
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
    chatInput.addEventListener('input', () => { /* ... height adjustment logic ... */
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

// --- App Initialization ---

// Combined initialization function called after successful sign-in
function initializeAppState() {
     console.log("Initializing app state (populating models, setting up chat).");
     populateModelSelector(); // Populate dropdown
     initializeChatListeners(); // Set up chat listeners
}

// Initial check of authentication status when the DOM is ready
async function initialAuthCheck() {
    // ... (implementation remains the same as before) ...
     if (typeof puter === 'undefined' || !puter.auth || !puter.auth.isSignedIn) {
        console.warn("Puter SDK not ready for initial auth check, retrying in 100ms...");
        setTimeout(initialAuthCheck, 100);
        return;
    }
    console.log("Performing initial authentication check...");
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
    // Add check for puter object existence before initial check
    if (typeof puter !== 'undefined') {
        initialAuthCheck();
    } else {
        console.error("Puter SDK object not found on DOMContentLoaded!");
        // Optionally display an error to the user
        if(authStatusDiv) authStatusDiv.textContent = "Error: Puter SDK failed to load.";
    }
});