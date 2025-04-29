// Chat Message Handling and Display
import { elements } from './ui.js';
import { createActionButton } from './ui.js';

export function displayMessage(text, sender) {
    const { messageDisplay } = elements;
    if (!messageDisplay) { console.error("Message display missing!"); return; }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    bubble.appendChild(content);
    bubble.appendChild(timestamp);
    
    if (sender === 'user') {
        bubble.classList.add('user-bubble');
    } else if (sender === 'ai') {
        bubble.classList.add('ai-bubble');
    } else {
        bubble.classList.add('system-bubble');
        bubble.id = text.toLowerCase().includes('thinking') ? 'loading-indicator' : '';
        if (bubble.contains(timestamp)) bubble.removeChild(timestamp);
    }

    if (sender !== 'system') {
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
    }

    messageDisplay.appendChild(bubble);
    requestAnimationFrame(() => {
        if (document.body.contains(messageDisplay)) {
            messageDisplay.scrollTop = messageDisplay.scrollHeight;
        }
    });
}

export async function sendMessage(selectedModel, allowedModels) {
    const { chatInput, sendButton, messageDisplay } = elements;
    if (!chatInput || !sendButton || !messageDisplay) { 
        console.error("Chat UI elements missing!"); 
        return; 
    }

    const inputText = chatInput.value.trim();
    if (inputText === '') return;

    // Ensure selectedModel is valid before sending
    if (!allowedModels.includes(selectedModel)) {
        const fallbackModel = allowedModels.includes('gpt-4o-mini') ? 
            'gpt-4o-mini' : (allowedModels[0] || null);
            
        if (fallbackModel) {
            console.warn(`Selected model "${selectedModel}" not allowed, falling back to "${fallbackModel}".`);
            selectedModel = fallbackModel;
        } else {
            displayMessage(`Error: No valid AI models are enabled in settings.`, 'system');
            return;
        }
    }

    displayMessage(inputText, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatInput.style.height = 'auto';
    chatInput.style.height = '30px';
    
    displayMessage(`AI (${selectedModel}) is thinking...`, 'system');

    try {
        if (typeof puter === 'undefined' || !puter.ai?.chat) {
            throw new Error("Puter chat not available.");
        }

        console.log(`Sending (Model: ${selectedModel}): "${inputText}"`);
        const response = await puter.ai.chat(inputText, { model: selectedModel });
        console.log("Received response:", response);

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
        console.error("sendMessage error:", error);
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) messageDisplay.removeChild(loadingIndicator);
        
        displayMessage(`Error: ${error.message || 'Unknown error'}`, 'system');
        if (error?.error?.message?.includes("insufficient funds")) {
            displayMessage("Insufficient Puter credits.", 'system');
        }
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        if (document.body.contains(chatInput)) chatInput.focus();
    }
}

export function resendMessage(text) {
    const { chatInput } = elements;
    if (!chatInput) return;
    chatInput.value = text;
    sendMessage();
}

export function copyMessage(text, contentElement) {
    const textToCopy = contentElement.textContent;
    navigator.clipboard.writeText(textToCopy)
        .then(() => console.log('Copied!'))
        .catch(err => console.error('Copy failed: ', err));
}

export function deleteMessage(bubble) {
    const { messageDisplay } = elements;
    if (!messageDisplay) return;
    messageDisplay.removeChild(bubble);
}

export async function speakMessage(text, buttonElement = null) {
    let originalContent = null;
    if (buttonElement) {
        originalContent = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        if (typeof puter === 'undefined' || !puter.ai?.txt2speech) {
            throw new Error("txt2speech missing.");
        }

        const audio = await puter.ai.txt2speech(text);
        if (audio?.play) {
            if (buttonElement) buttonElement.innerHTML = '<i class="fas fa-volume-up"></i>';
            audio.play();
            
            audio.onended = () => {
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.innerHTML = originalContent;
                }
            };
            
            audio.onerror = (e) => {
                console.error("Speech error:", e);
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.innerHTML = originalContent;
                }
            };
        } else {
            console.error("No playable audio returned.");
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalContent;
            }
        }
    } catch (error) {
        console.error("speakMessage error:", error);
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalContent;
        }
    }
}

export function startNewChat(messageDisplay, modelSelector) {
    console.log("Starting new chat session.");
    if (messageDisplay) messageDisplay.innerHTML = '';
    if (modelSelector) modelSelector.value = 'gpt-4o-mini';
    displayMessage('New chat started.', 'system');
}