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
 const ttsMicButton = document.getElementById('tts-mic-button'); // Mic button still exists but functionality deferred
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
 let ttsListenersAdded = false; // Flag for TTS listeners
 

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
    const user = await puter.auth.getUser(); //
    if(authStatusDiv) authStatusDiv.textContent = `Signed in as: ${user.username}`; // [cite: 784]
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
    const signedIn = await puter.auth.signIn(); //
    console.log("puter.auth.signIn() completed. Result:", signedIn); //
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
   const audio = await puter.ai.txt2speech(text); //
   if (audio && typeof audio.play === 'function') { // Check if audio is valid and playable
       audio.play(); // [cite: 75]
   } else {
       console.error("puter.ai.txt2speech did not return a playable audio object.");
       // Optionally display an error to the user in the UI
   }
  } catch (error) {
   console.error("Error calling puter.ai.txt2speech:", error);
   // Optionally display an error to the user in the UI
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
   console.log(`Sending (Model: ${selectedModel}): "${currentInputText}"`);
   const response = await puter.ai.chat(currentInputText, { model: selectedModel }); //
   console.log("Received response:", response);
   const loadingIndicator = document.getElementById('loading-indicator');
   if(loadingIndicator && loadingIndicator.parentNode === messageDisplay) messageDisplay.removeChild(loadingIndicator);
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
 

 // --- Phase 6: Popup Handling ---
 function showPopup(popupId) {
  const popup = popups[popupId]; // Get popup from our 'popups' object
  if (popup && popupBackdrop) {
   closeActivePopup(); // Close any previous one
   popup.style.display = 'block';
   popupBackdrop.style.display = 'block';
   activePopup = popup; // Track the currently open one
   console.log(`Showing popup: ${popupId}`);
   // Dispatch a 'show' event for potential listeners (like TTS init)
   popup.dispatchEvent(new CustomEvent('show'));
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
 

 // --- Phase 8: New Chat & History ---
 // **REMOVED CHAT HISTORY IMPLEMENTATION FROM HERE - Use KV store instead**
 // LocalStorage is not suitable for Puter apps aiming for cross-device persistence.
 // The PRD mentions puter.kv, which should be implemented in Phase 8.
 // This keeps Phase 9 focused. We'll just have the New Chat button clear the display.
 function startNewChat() {
  console.log("Starting a new chat session (clearing display).");
  // **Placeholder for Phase 8 KV Saving:**
  // saveCurrentChatToKV(); // Function to be implemented in Phase 8
  if (messageDisplay) messageDisplay.innerHTML = '';
  if (modelSelector) modelSelector.value = 'gpt-4o-mini'; // Reset model
  selectedModel = 'gpt-4o-mini';
  displayMessage('New chat started.', 'system');
 }
 

 function displayChatHistory() {
  if (!historyList) { console.error("History list element not found."); return; }
  historyList.innerHTML = 'Chat History using Puter KV Store will be implemented in Phase 8.';
  // **Placeholder for Phase 8 KV Loading:**
  // loadChatHistoryFromKV(); // Function to be implemented in Phase 8
 }
 

 function loadChatFromHistory(historyKey) {
  console.log("Loading chat from history (using key):", historyKey);
  // **Placeholder for Phase 8 KV Getting:**
  // const session = await getChatSessionFromKV(historyKey);
  // if (session) {
  //  messageDisplay.innerHTML = '';
  //  session.messages.forEach(msg => displayMessage(msg.text, msg.sender));
  //  if (modelSelector) modelSelector.value = session.model;
  //  selectedModel = session.model;
  //  closeActivePopup();
  // } else {
  //  console.error("Chat session not found in KV store for key:", historyKey);
  // }
  displayMessage(`Loading history for key "${historyKey}" will be implemented in Phase 8`, 'system');
  closeActivePopup();
 }
 // --- End Phase 8 Placeholders ---
 

 // --- Phase 9: TTS Chat Mode ---
 async function handleTTSSend() {
  if (!ttsTextInput || !ttsSendButton) {
   console.error("TTS input or send button missing!");
   return;
  }
  const text = ttsTextInput.value.trim();
  if (!text) return;
 

  ttsSendButton.disabled = true;
  ttsTextInput.disabled = true;
  if (ttsAudioPlayer) ttsAudioPlayer.textContent = 'AI Thinking...'; // Status update
 

  try {
   if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat || !puter.ai.txt2speech) {
    throw new Error("Puter SDK/AI or required AI modules not available.");
   }
 

   console.log(`TTS Mode: Sending to AI (Model: ${selectedModel}): "${text}"`);
   const response = await puter.ai.chat(text, { model: selectedModel }); //
   console.log("TTS Mode: Received AI response:", response);
 

   let aiText = "Sorry, I could not process that."; // Default
   // ** MODIFIED AI TEXT EXTRACTION LOGIC **
   if (response && typeof response === 'string') {
       aiText = response;
   } else if (response && typeof response.text === 'string') { // Check for .text first
       aiText = response.text;
   } else if (response && response.message && typeof response.message.content === 'string') { // Then check .message.content
       aiText = response.message.content;
   } else if (response && response.error) {
       aiText = `Error from AI: ${response.error.message || response.error}`;
       console.error("TTS Mode: AI API returned an error:", response.error);
   } else {
       console.warn("TTS Mode: Received unexpected response structure from AI:", response);
       aiText = "Received an unexpected response format from the AI.";
   }
   // ** END MODIFIED AI TEXT EXTRACTION **
 

   if (ttsAudioPlayer) ttsAudioPlayer.textContent = 'Generating Speech...';
   console.log("TTS Mode: Requesting speech for:", aiText);
   const audioObject = await puter.ai.txt2speech(aiText); //
 

   // ** MODIFIED AUDIO HANDLING **
   if (audioObject && typeof audioObject.play === 'function') { // Check if it's playable
    console.log("TTS Mode: Received playable audio object.");
    if (ttsAudioPlayer) ttsAudioPlayer.innerHTML = ''; // Clear status
 

    audioObject.onerror = (e) => {
     console.error("Error playing TTS audio:", e);
     if (ttsAudioPlayer) ttsAudioPlayer.textContent = 'Error playing audio.';
    };
    audioObject.onended = () => {
     console.log("TTS playback finished.");
     if (ttsAudioPlayer) ttsAudioPlayer.textContent = 'Playback finished.';
     // Optional: Re-enable input/button or focus
     // ttsSendButton.disabled = false;
     // ttsTextInput.disabled = false;
     // if(document.body.contains(ttsTextInput)) ttsTextInput.focus();
    };
 

    audioObject.play(); // [cite: 75]
    if (ttsAudioPlayer) ttsAudioPlayer.textContent = 'Speaking...';
 

   } else {
    // This case handles the error you reported
    console.error("TTS Mode: puter.ai.txt2speech did not return a valid playable object."); // Updated log message
    if (ttsAudioPlayer) ttsAudioPlayer.textContent = 'Failed to generate playable speech.';
   }
   // ** END MODIFIED AUDIO HANDLING **
 

  } catch (error) {
   console.error("Error in TTS mode:", error);
   if (ttsAudioPlayer) ttsAudioPlayer.textContent = `Error: ${error.message || 'Unknown TTS error'}`;
   // Handle specific errors like in sendMessage if needed
  } finally {
   // Re-enable buttons slightly later to avoid issues if playback starts immediately
   setTimeout(() => {
       if (ttsSendButton) ttsSendButton.disabled = false;
       if (ttsTextInput) ttsTextInput.disabled = false;
   }, 500); // Adjust delay as needed
   if (ttsTextInput) ttsTextInput.value = ''; // Clear input after processing
  }
 }
 

 function initializeTTSListeners() {
  if (ttsListenersAdded) return; // Don't add multiple times
 

  if (!ttsSendButton || !ttsTextInput) {
   console.warn("TTS elements not found during listener initialization. Retrying.");
   // Optional: Add a small delay and retry if needed, similar to initialAuthCheck
   return;
  }
  console.log("Initializing TTS event listeners.");
 

  ttsSendButton.addEventListener('click', handleTTSSend);
  ttsTextInput.addEventListener('keypress', (event) => {
   if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleTTSSend();
   }
  });
  // Placeholder for Mic button listener (Phase 10)
  // ttsMicButton.addEventListener('click', handleTTsMic);
 

  ttsListenersAdded = true;
  console.log("TTS listeners added.");
 }
 // --- End Phase 9 ---
 

 // --- Phase 10: Microphone Input ---
 function initializeMicInput() {
  if (!micButton || !chatInput) {
   console.warn("Microphone or chat input elements not found.");
   return;
  }
  // Check if listener already added
  if (!micButton.getAttribute('data-mic-listener-added')) {
   micButton.addEventListener('click', toggleRecording);
   micButton.setAttribute('data-mic-listener-added', 'true');
  }
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
   recognition.continuous = false; // Process after user stops talking
   recognition.interimResults = false; // We only want the final result
 

   recognition.onstart = () => {
    console.log("Speech recognition started.");
    isRecording = true;
    micButton.classList.add('recording'); // Add visual feedback if CSS exists
    micButton.textContent = "⏺️"; // Or change icon
   };
 

   recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Speech recognized:", transcript);
    chatInput.value = transcript; // Populate the main chat input
    // Optionally automatically send the message:
    // sendMessage();
   };
 

   recognition.onend = () => {
    console.log("Speech recognition ended.");
    isRecording = false;
    micButton.classList.remove('recording'); // Remove visual feedback
    micButton.textContent = "🎤"; // Change icon back
   };
 

   recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error === 'no-speech') {
     console.warn("No speech detected.");
    } else if (event.error === 'audio-capture') {
     console.error("Audio capture failed. Ensure microphone is connected and permissions granted.");
    } else if (event.error === 'not-allowed') {
     console.error("Microphone access denied. Please allow microphone access in browser settings.");
     // Optionally display a message to the user
    }
    // Reset state regardless of error
    isRecording = false;
    micButton.classList.remove('recording');
    micButton.textContent = "🎤";
   };
 

   try {
    recognition.start();
   } catch (e) {
    console.error("Failed to start speech recognition:", e);
    isRecording = false; // Ensure state is reset
    micButton.classList.remove('recording');
    micButton.textContent = "🎤";
   }
 

  } else {
   console.warn("Web Speech API is not supported in this browser.");
   alert("Sorry, your browser doesn't support speech recognition."); // User feedback
  }
 }
 

 function stopRecording() {
  if (recognition && isRecording) { // Only stop if active
   recognition.stop();
   console.log("Speech recognition stopped manually.");
  }
  // State reset happens in recognition.onend
 }
 // --- End Phase 10 ---
 

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
  if (!sendButton.getAttribute('data-listener-added')) {
      sendButton.addEventListener('click', sendMessage);
      sendButton.setAttribute('data-listener-added', 'true');
  }
  if (!chatInput.getAttribute('data-listener-added')) {
      chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
      chatInput.addEventListener('input', () => {
          chatInput.style.height = 'auto';
          let scrollHeight = chatInput.scrollHeight;
          let maxHeight = 100; // Max height 100px
          // Ensure scrollHeight is calculated after setting height to auto
          // Use requestAnimationFrame for potentially better timing
          requestAnimationFrame(() => {
              scrollHeight = chatInput.scrollHeight;
              chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px';
          });
      });
      chatInput.setAttribute('data-listener-added', 'true');
  }
 

  isChatInitialized = true; // Set flag
  chatInput.disabled = false; sendButton.disabled = false;
  if(document.body.contains(chatInput)) chatInput.focus();
  console.log("Chat event listeners added.");
  return true;
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
       displayChatHistory(); // Placeholder call
      } else if (popupId === 'tts') {
       initializeTTSListeners(); // Initialize TTS listeners when popup is shown
      }
     });
     button.setAttribute('data-popup-listener-added', 'true');
    }
   } else { console.warn(`Banner button #${buttonId} not found.`); }
  }
 

  // Add listener for New Chat button
  const newChatBtn = bannerButtons.newChat;
  if (newChatBtn) {
   if (!newChatBtn.getAttribute('data-newchat-listener-added')) {
    newChatBtn.addEventListener('click', () => {
     console.log("New Chat button clicked");
     closeActivePopup();
     startNewChat(); // Clears display, resets model
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
 

 function initializeAppState() {
  console.log("Initializing app state (populating models, setting up chat, popups, mic).");
  populateModelSelector();
  initializeChatListeners();
  initializeBannerAndPopups();
  initializeMicInput(); // Initialize mic input listener here
 }
 

 async function initialAuthCheck(retryCount = 0) { // Added retryCount
  if (typeof puter === 'undefined' || !puter.auth || typeof puter.auth.isSignedIn !== 'function') { // More robust check
   if (retryCount < 5) { // Example: Retry up to 5 times
    console.warn("Puter SDK or auth module not ready, retrying... (Attempt " + (retryCount + 1) + ")");
    setTimeout(() => initialAuthCheck(retryCount + 1), 500 * (retryCount + 1)); // Exponential backoff
    return;
   } else {
    console.error("Puter SDK failed to load after multiple retries!");
    if(authStatusDiv) authStatusDiv.textContent = "Error: Puter SDK failed to load.";
    if(signInButton) signInButton.disabled = true; // Disable sign-in if SDK fails
    return;
   }
  }
  console.log("Performing initial auth check...");
  try {
   const isSignedIn = puter.auth.isSignedIn(); //
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
   console.warn("Puter SDK not immediately available, delaying initial check.");
   setTimeout(() => {
    initialAuthCheck(); // Rely on the retry logic inside initialAuthCheck
   }, 300); // Wait 300ms
  }
 });
 

 

 // --- Phase 11: Image Generation (Placeholder) ---
 

 // --- Phase 12: OCR (Placeholder) ---
 

 // --- Phase 13: Vision (Placeholder) ---
 

 // --- Phase 14: Settings (Placeholder) ---