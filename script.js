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
// Get banner buttons using a more robust method if needed
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
const ttsAudioPlayer = document.getElementById('tts-audio-player');
// --- End Phase 9 Elements


// Phase 10 elements
const micButton = document.getElementById('mic-button');
// --- End Phase 10 elements


// --- App State ---
let selectedModel = 'gpt-4o-mini';
let isChatInitialized = false;
let activePopup = null; // Track the currently open popup - Phase 6
let chatHistory = []; // Array to store chat history
let recognition; // Speech recognition object
let isRecording = false;


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
   if(authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
   if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth module not available.");
   const user = await puter.auth.getUser();
   if(authStatusDiv) authStatusDiv.textContent = `Signed in as: ${user.username}`;
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
  if(authStatusDiv) authStatusDiv.textContent = 'Not signed in.';
  authSectionDiv.style.display = 'block';
  if(signInButton) { signInButton.disabled = false; signInButton.textContent = 'Sign In'; }
  chatUiDiv.style.display = 'none';
  if(signOutButton) signOutButton.style.display = 'none';
  isChatInitialized = false; // Reset flags on sign out
  // If popups exist, ensure they are hidden on sign out
  closeActivePopup();
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
   const signedIn = await puter.auth.signIn();
   console.log("puter.auth.signIn() completed. Result:", signedIn);
   await updateUiForAuthState(Boolean(signedIn));
  } catch (error) {
   console.error("Error during puter.auth.signIn() call:", error);
   if(authStatusDiv) authStatusDiv.textContent = `Sign in error: ${error.message || 'Unknown error'}`;
   signInButton.disabled = false; signInButton.textContent = 'Sign In with Puter';
   await updateUiForAuthState(false);
  }
 });
} else { console.error("Sign In button not found!");}


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
  } catch(error) {
   console.error("Error during sign out:", error);
   if(authStatusDiv) authStatusDiv.textContent = `Sign out error: ${error.message}`;
   updateUiForAuthState(false);
  }
 });
}else {
 // This might log normally if the button isn't visible yet on initial load
 // console.warn("Sign out button element (#signout-button) not found during initial load.");
}




// --- Phase 4: Model Selection ---
function populateModelSelector() {
 if (!modelSelector) { console.error("Model selector element not found!"); return; }
 if(modelSelector.options.length > 1 && modelSelector.options[0].value !== "") { console.log("Model selector already populated."); modelSelector.value = selectedModel; return; }
 console.log("Populating model selector...");
 modelSelector.innerHTML = '';
 availableModels.forEach(modelId => { const option = document.createElement('option'); option.value = modelId; option.textContent = modelId; if (modelId === selectedModel) option.selected = true; modelSelector.appendChild(option); });
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
 else { bubble.classList.add('system-bubble'); bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : ''; if(bubble.contains(timestamp)) { bubble.removeChild(timestamp); } }
 
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
  speakButton.addEventListener('click', () => speakMessage(text));
 }


 messageDisplay.appendChild(bubble);
 requestAnimationFrame(() => { if(document.body.contains(messageDisplay)) { messageDisplay.scrollTo({ top: messageDisplay.scrollHeight, behavior: 'smooth' }); } });
}


// Helper function to create action buttons
function createActionButton(title, iconClass) {
 const button = document.createElement('button');
 button.classList.add('action-button');
 button.title = title;
 const icon = document.createElement('i');
 icon.classList.add(...iconClass.split(' ')); // Add multiple classes
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
  // Provide user feedback (e.g., a small popup or change button text briefly)
  console.log('Message copied to clipboard!');
 }).catch(err => {
  console.error('Failed to copy text: ', err);
 });
}


function deleteMessage(bubble) {
 if (!messageDisplay) return;
 messageDisplay.removeChild(bubble);
}


async function speakMessage(text) {
 try {
  if (typeof puter === 'undefined' || !puter.ai || !puter.ai.txt2speech) throw new Error("Puter SDK/AI or txt2speech module not available.");
  const audio = await puter.ai.txt2speech(text);
  audio.play();
 } catch (error) {
  console.error("Error calling puter.ai.txt2speech:", error);
 }
}


async function sendMessage() {
 if (!chatInput || !sendButton || !messageDisplay) { console.error("Chat UI elements missing!"); return; }
 const inputText = chatInput.value.trim(); if (inputText === '') return;
 const currentInputText = inputText;
 displayMessage(currentInputText, 'user');
 chatInput.value = ''; chatInput.disabled = true; sendButton.disabled = true;
 chatInput.style.height = 'auto'; chatInput.style.height = '30px';
 displayMessage(`AI (${selectedModel}) is thinking...`, 'system');
 try {
  if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) throw new Error("Puter SDK/AI module not available.");
  console.log(`Sending (Model: <span class="math-inline">\{selectedModel\}\)\: "</span>{currentInputText}"`);
  const response = await puter.ai.chat(currentInputText, { model: selectedModel });
  console.log("Received response:", response);
  const loadingIndicator = document.getElementById('loading-indicator');
  if(loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
  let aiText = "Sorry, couldn't get response.";
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
  // Improved error handling for specific messages
  if (error && error.error && error.error.message && error.error.message.includes("Permission denied")) {
      displayMessage("Please ensure you are properly signed in and have granted the necessary permissions.", 'system');
  } else if (error && error.error && error.error.message && error.error.message.includes("insufficient funds")) {
      displayMessage("Your Puter account has insufficient funds. Please add funds to use this feature.", 'system');
  }
 } finally {
  chatInput.disabled = false; sendButton.disabled = false;
  if(document.body.contains(chatInput)) chatInput.focus();
 }
}


// --- Phase 6: Popup Handling --- ADDED THIS SECTION
function showPopup(popupId) {
 const popup = popups[popupId]; // Get popup from our 'popups' object
 if (popup && popupBackdrop) {
  closeActivePopup(); // Close any previous one
  popup.style.display = 'block';
  popupBackdrop.style.display = 'block';
  activePopup = popup; // Track the currently open one
  console.log(`Showing popup: ${popupId}`);
 } else {
  console.error(`Popup element for '${popupId}' or backdrop not found.`);
 }
}


function closeActivePopup() {
 if (activePopup && popupBackdrop) {
  activePopup.style.display = 'none';
  popupBackdrop.style.display = 'none';
  console.log(`Closing popup: ${activePopup.id}`);
  activePopup = null;
 }
}


function initializeBannerAndPopups() {
 console.log("Initializing banner button listeners and popup close handlers.");
 const buttonPopupMap = { 'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr', 'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' };


 // Add listeners for buttons that show popups
 for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) {
  const button = document.getElementById(buttonId);
  if (button) {
   if (!button.getAttribute('data-popup-listener-added')) {
    button.addEventListener('click', () => {
     showPopup(popupId);
     if (popupId === 'history') {
      displayChatHistory();
     }
    });
    button.setAttribute('data-popup-listener-added', 'true');
   }
  } else { console.warn(`Banner button #${buttonId} not found.`); }
 }


 // Add listener for New Chat button
 const newChatBtn = bannerButtons.newChat; // Use pre-fetched element
 if (newChatBtn) {
  if (!newChatBtn.getAttribute('data-newchat-listener-added')) {
   newChatBtn.addEventListener('click', () => {
    console.log("New Chat button clicked");
    closeActivePopup();
    if (messageDisplay) messageDisplay.innerHTML = '';
    displayMessage('New chat started.', 'system');
    if (chatInput) chatInput.focus();
    startNewChat(); // Call startNewChat() here
   });
   newChatBtn.setAttribute('data-newchat-listener-added', 'true');
  }
 } else { console.warn(`Banner button #new-chat-btn not found.`); }


 // Add listener for backdrop click
 if (popupBackdrop) {
  if (!popupBackdrop.getAttribute('data-backdrop-listener-added')) {
   popupBackdrop.addEventListener('click', closeActivePopup);
   popupBackdrop.setAttribute('data-backdrop-listener-added', 'true');
  }
 } else { console.warn(`Popup backdrop element not found.`); }


 // Add listeners for close buttons inside popups
 const closeButtons = document.querySelectorAll('.close-popup-btn');
 closeButtons.forEach(button => {
  // Check parent popup exists before adding listener
  const parentPopup = button.closest('.popup');
  if (parentPopup && !button.getAttribute('data-close-listener-added')) {
   button.addEventListener('click', closeActivePopup);
   button.setAttribute('data-close-listener-added', 'true');
  } else if (!parentPopup) {
   console.warn("Found a close button outside a popup?", button);
  }
 });
 console.log("Banner/Popup listeners initialized.");
}




// --- Initialization ---
function initializeChatListeners() {
 // Ensure elements are ready before adding listeners
 if (!chatInput || !sendButton || !messageDisplay) {
  console.warn("Chat elements not ready for listener init. Retrying.");
  setTimeout(initializeChatListeners, 200);
  return false;
 }
 if (isChatInitialized) { return true; } // Already done


 console.log("Adding chat event listeners.");
 sendButton.addEventListener('click', sendMessage);
 chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
 chatInput.addEventListener('input', () => { /* ... height adjustment ... */
  chatInput.style.height = 'auto'; let scrollHeight = chatInput.scrollHeight; let maxHeight = 100;
  if (scrollHeight > maxHeight) scrollHeight = maxHeight;
  chatInput.style.height = Math.max(30, scrollHeight) + 'px';
 });


 isChatInitialized = true; // Set flag
 chatInput.disabled = false; sendButton.disabled = false;
 if(document.body.contains(chatInput)) chatInput.focus();
 console.log("Chat event listeners added.");
 return true;
}


// **MODIFIED** to call banner/popup init as well
function initializeAppState() {
 console.log("Initializing app state (populating models, setting up chat, popups).");
 populateModelSelector();
 initializeChatListeners();
 initializeBannerAndPopups(); // *** ADDED CALL HERE ***
}


async function initialAuthCheck(retryCount = 0) { // Added retryCount
 if (typeof puter === 'undefined' || !puter.auth || !puter.auth.isSignedIn) {
  if (retryCount < 5) { // Example: Retry up to 5 times
   console.warn("Puter SDK not ready, retrying... (Attempt " + (retryCount + 1) + ")");
   setTimeout(() => initialAuthCheck(retryCount + 1), 500); // Longer delay
   return;
  } else {
   console.error("Puter SDK failed to load after multiple retries!");
   if(authStatusDiv) authStatusDiv.textContent = "Error: Puter SDK failed to load.";
   return;
  }
 }
 console.log("Performing initial auth check...");
 try {
  const isSignedIn = puter.auth.isSignedIn();
  console.log("Initial isSignedIn status:", isSignedIn);
  await updateUiForAuthState(isSignedIn); // This will call initializeAppState if signed in
 } catch (error) {
  console.error("Error during initial auth check:", error);
  await updateUiForAuthState(false);
 }
}


document.addEventListener('DOMContentLoaded', () => {
 console.log("DOM fully loaded.");
 // Make sure puter object is ready before the first check
 if (typeof puter !== 'undefined') {
  initialAuthCheck();
 } else {
  // If puter isn't ready immediately, wait a bit and check again
  // This can happen depending on script loading order/speed
  console.warn("Puter SDK not immediately available, delaying initial check.");
  setTimeout(() => {
   if (typeof puter !== 'undefined') {
    initialAuthCheck();
   } else {
    console.error("Puter SDK object not found after delay!");
    if(authStatusDiv) authStatusDiv.textContent = "Error: Puter SDK failed to load.";
   }
  }, 200); // Wait 200ms
 }
});




// --- Phase 8: New Chat & History ---


function startNewChat() {
 console.log("Starting a new chat session.");
 chatHistory.push({
  timestamp: Date.now(),
  model: selectedModel,
  messages: Array.from(messageDisplay.children).map(bubble => ({
   sender: bubble.classList.contains('user-bubble') ? 'user' : 'ai',
   text: bubble.querySelector('.message-content').textContent
  }))
 });
 localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
 chatHistory = [];
 if (messageDisplay) messageDisplay.innerHTML = '';
 if (modelSelector) modelSelector.value = 'gpt-4o-mini';
 selectedModel = 'gpt-4o-mini';
 displayMessage('New chat started.', 'system');
}


function displayChatHistory() {
 if (!historyList) { console.error("History list element not found."); return; }
 historyList.innerHTML = '';
 try {
  const savedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  savedHistory.forEach((session, index) => {
   const historyItem = document.createElement('div');
   historyItem.classList.add('history-item');
   historyItem.textContent = `Chat ${index + 1}: <span class="math-inline">\{session\.messages\[0\]\.text\.substring\(0, 50\)\}\.\.\. \(</span>{new Date(session.timestamp).toLocaleString()})`;
   historyItem.addEventListener('click', () => loadChatFromHistory(index));
   historyList.appendChild(historyItem);
  });
 } catch (error) {
  console.error("Error parsing chat history from localStorage:", error);
  // Optionally display an error message to the user
 }
}


function loadChatFromHistory(index) {
 const savedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
 const session = savedHistory[index];
 if (!session) { console.error("Chat session not found in history."); return; }


 messageDisplay.innerHTML = '';
 session.messages.forEach(msg => displayMessage(msg.text, msg.sender));
 if (modelSelector) modelSelector.value = session.model;
 selectedModel = session.model;
 closeActivePopup();
}


// Modify initializeBannerAndPopups to call displayChatHistory
function initializeBannerAndPopups() {
 console.log("Initializing banner button listeners and popup close handlers.");
 const buttonPopupMap = { 'history-btn': 'history', 'img-gen-btn': 'imgGen', 'ocr-btn': 'ocr', 'vision-btn': 'vision', 'tts-btn': 'tts', 'settings-btn': 'settings' };


 // Add listeners for buttons that show popups
 for (const [buttonId, popupId] of Object.entries(buttonPopupMap)) {
  const button = document.getElementById(buttonId);
  if (button) {
   if (!button.getAttribute('data-popup-listener-added')) {
    button.addEventListener('click', () => {
     showPopup(popupId);
     if (popupId === 'history') {
      displayChatHistory();
     }
    });
    button.setAttribute('data-popup-listener-added', 'true');
   }
  } else { console.warn(`Banner button #${buttonId} not found.`); }
 }


 // Add listener for New Chat button
 const newChatBtn = bannerButtons.newChat; // Use pre-fetched element
 if (newChatBtn) {
  if (!newChatBtn.getAttribute('data-newchat-listener-added')) {
   newChatBtn.addEventListener('click', () => {
    console.log("New Chat button clicked");
    closeActivePopup();
    if (messageDisplay) messageDisplay.innerHTML = '';
    displayMessage('New chat started.', 'system');
    if (chatInput) chatInput.focus();
    startNewChat(); // Call startNewChat() here
   });
   newChatBtn.setAttribute('data-newchat-listener-added', 'true');
  }
 } else { console.warn(`Banner button #new-chat-btn not found.`); }


 // Add listener for backdrop click
 if (popupBackdrop) {
  if (!popupBackdrop.getAttribute('data-backdrop-listener-added')) {
   popupBackdrop.addEventListener('click', closeActivePopup);
   popupBackdrop.setAttribute('data-backdrop-listener-added', 'true');
  }
 } else { console.warn(`Popup backdrop element not found.`); }


 // Add listeners for close buttons inside popups
 const closeButtons = document.querySelectorAll('.close-popup-btn');
 closeButtons.forEach(button => {
  // Check parent popup exists before adding listener
  const parentPopup = button.closest('.popup');
  if (parentPopup && !button.getAttribute('data-close-listener-added')) {
   button.addEventListener('click', closeActivePopup);
   button.setAttribute('data-close-listener-added', 'true');
  } else if (!parentPopup) {
   console.warn("Found a close button outside a popup?", button);
  }
 });
 console.log("Banner/Popup listeners initialized.");
}




// --- Phase 9: TTS Chat Mode ---


function initializeTTS() {
 if (!ttsSendButton || !ttsTextInput || !ttsAudioPlayer || !ttsMicButton) {
  console.warn("TTS elements not found. TTS mode might not function correctly.");
  return;
 }


 ttsSendButton.addEventListener('click', handleTTSSend);
 ttsTextInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
   event.preventDefault();
   handleTTSSend();
  }
 });
 //ttsMicButton.addEventListener('click', handleTTsMic); // Placeholder for mic functionality
}


async function handleTTSSend() {
 const text = ttsTextInput.value.trim();
 if (!text) return;


 try {
  if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat || !puter.ai.txt2speech) {
   throw new Error("Puter SDK/AI or txt2speech module not available.");
  }


  const response = await puter.ai.chat(text, { model: selectedModel });
  const aiText = response?.text || "Sorry, couldn't get response.";
  console.log("AI response for TTS:", aiText); // Log AI response


  const audio = await puter.ai.txt2speech(aiText);
  if (audio) {
   // Basic audio playback
   const audioEl = new Audio();
   audioEl.src = URL.createObjectURL(audio);
   audioEl.play();
  } else {
   console.warn("puter.ai.txt2speech returned null or undefined audio.");
  }
 } catch (error) {
  console.error("Error in TTS mode:", error);
 } finally {
  ttsTextInput.value = '';
 }
}


// Placeholder function for mic input
//function handleTTsMic() {
// console.log("Microphone input not implemented yet.");
//}


// Call initializeTTS when the TTS popup is shown
popups.tts.addEventListener('show', initializeTTS);




// --- Phase 10: Microphone Input ---


function initializeMicInput() {
 if (!micButton || !chatInput) {
  console.warn("Microphone or chat input elements not found.");
  return;
 }


 micButton.addEventListener('click', toggleRecording);
}


function toggleRecording() {
 if (isRecording) {
  stopRecording();
 } else {
  startRecording();
 }
}


function startRecording() {
 if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;


  recognition.onstart = () => {
   isRecording = true;
   micButton.textContent = "⏺️"; // Change icon to recording
  };


  recognition.onresult = (event) => {
   const transcript = Array.from(event.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');
   chatInput.value = transcript;
  };


  recognition.onend = () => {
   isRecording = false;
   micButton.textContent = "🎤"; // Change icon back
  };


  recognition.onerror = (event) => {
   console.error("Speech recognition error:", event.error);
   isRecording = false;
   micButton.textContent = "🎤";
  };


  recognition.start();
 } else {
  console.warn("Web Speech API is not supported in this browser.");
 }
}


function stopRecording() {
 if (recognition) {
  recognition.stop();
 }
 isRecording = false;
 micButton.textContent = "🎤";
}


// Call initializeMicInput when the main chat UI is displayed
chatUiDiv.addEventListener('show', initializeMicInput);




// --- Phase 11: Image Generation ---




// --- Phase 12: OCR ---




// --- Phase 13: Vision ---




// --- Phase 14: Settings ---