// Text-to-Speech Feature
import { elements } from '../ui.js';
import { speakMessage } from '../chat.js';

let ttsRecognition;
let isTTSDictating = false;
let ttsListenersAdded = false;

export async function handleTTSSend() {
    const { ttsTextInput, ttsSendButton, ttsOutputArea } = elements;
    if (!ttsTextInput || !ttsSendButton || !ttsOutputArea) { 
        console.error("TTS elements missing!"); 
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
        ttsOutputArea.appendChild(statusDiv);
    }
    statusDiv.textContent = 'AI Thinking...';

    try {
        if (typeof puter === 'undefined' || !puter.ai?.chat || !puter.ai?.txt2speech) {
            throw new Error("Puter AI modules missing.");
        }

        console.log(`TTS Mode: Sending to AI: "${text}"`);
        const response = await puter.ai.chat(text);
        console.log("TTS Mode: AI response:", response);

        let aiText = "Sorry, couldn't process.";
        if (response && typeof response === 'string') aiText = response;
        else if (response?.text) aiText = response.text;
        else if (response?.message?.content) aiText = response.message.content;
        else if (response?.error) aiText = `Error: ${response.error.message || response.error}`;
        else console.warn("TTS unexpected response:", response);

        statusDiv.textContent = 'Generating Speech...';
        console.log("TTS Mode: Requesting speech for:", aiText);
        
        const audioObject = await puter.ai.txt2speech(aiText);
        if (audioObject?.play) {
            console.log("TTS Mode: Playable audio received.");
            statusDiv.textContent = '';

            const entryDiv = document.createElement('div');
            entryDiv.className = 'tts-entry';
            
            const textSpan = document.createElement('span');
            textSpan.className = 'tts-entry-text';
            textSpan.textContent = aiText;
            
            const replayButton = document.createElement('button');
            replayButton.className = 'tts-replay-button';
            replayButton.innerHTML = '<i class="fas fa-play"></i> Replay';
            replayButton.onclick = (e) => speakMessage(aiText, e.currentTarget);
            
            entryDiv.append(textSpan, replayButton);
            ttsOutputArea.insertBefore(entryDiv, statusDiv);
            ttsOutputArea.scrollTop = ttsOutputArea.scrollHeight;

            audioObject.onerror = (e) => { 
                console.error("TTS play error:", e); 
                statusDiv.textContent = 'Audio play error.'; 
            };
            audioObject.onended = () => { 
                console.log("TTS playback finished."); 
                statusDiv.textContent = 'Playback finished.'; 
            };

            audioObject.play();
            statusDiv.textContent = 'Speaking...';
        } else {
            console.error("TTS Mode: No playable audio returned.");
            statusDiv.textContent = 'Failed to generate speech.';
        }
    } catch (error) {
        console.error("Error in TTS mode:", error);
        if (statusDiv) statusDiv.textContent = `Error: ${error.message || 'Unknown'}`;
    } finally {
        setTimeout(() => {
            if (ttsSendButton) ttsSendButton.disabled = false;
            if (ttsTextInput) ttsTextInput.disabled = false;
        }, 500);
        if (ttsTextInput) ttsTextInput.value = '';
    }
}

export function toggleTTSDictation() {
    if (isTTSDictating) stopTTSDictation();
    else startTTSDictation();
}

function startTTSDictation() {
    const { ttsMicButton, ttsTextInput } = elements;
    
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Browser doesn't support speech recognition.");
        return;
    }
    
    if (!ttsMicButton || !ttsTextInput) { 
        console.error("TTS Mic/Input missing."); 
        return; 
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    ttsRecognition = new SpeechRecognition();
    ttsRecognition.continuous = false;
    ttsRecognition.interimResults = false;

    ttsRecognition.onstart = () => {
        console.log("TTS dictation started.");
        isTTSDictating = true;
        ttsMicButton.classList.add('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-stop"></i>';
    };

    ttsRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        console.log("TTS dictation recognized:", transcript);
        ttsTextInput.value = transcript;
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

    try { 
        ttsRecognition.start(); 
    } catch (e) {
        console.error("Failed start TTS dictation:", e);
        isTTSDictating = false;
        ttsMicButton.classList.remove('recording');
        ttsMicButton.innerHTML = '<i class="fas fa-microphone"></i>';
        alert("Failed to start dictation.");
    }
}

export function stopTTSDictation() {
    if (ttsRecognition && isTTSDictating) {
        ttsRecognition.stop();
        console.log("TTS dictation stopped manually.");
    }
}

export function initializeTTSListeners() {
    if (ttsListenersAdded) return;
    
    const { ttsSendButton, ttsTextInput, ttsOutputArea, ttsMicButton } = elements;
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
    ttsMicButton.addEventListener('click', toggleTTSDictation);
    
    ttsListenersAdded = true;
    console.log("TTS listeners added.");
}