// Voice Input Module
export const VoiceInput = {
    recognition: null,
    isListening: false,
    targetInputElement: null,
    currentLanguage: 'en-US',
    supportedLanguages: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR'],
    
    init(targetInput) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            return false;
        }
        
        this.targetInputElement = targetInput;
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
        
        // Set up event handlers
        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
        this.recognition.onend = this.handleEnd.bind(this);
        
        return true;
    },
    
    handleResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript && this.targetInputElement) {
            // Add the final transcript to the input
            this.targetInputElement.value += finalTranscript + ' ';
            
            // Trigger input event to adjust textarea height if needed
            const inputEvent = new Event('input', { bubbles: true });
            this.targetInputElement.dispatchEvent(inputEvent);
            
            // Focus on the input element
            this.targetInputElement.focus();
        }
    },
    
    handleError(event) {
        console.error('Speech recognition error:', event.error);
        
        // Visual feedback for error
        if (this.toggleButton) {
            this.toggleButton.style.backgroundColor = '#dc3545';
            setTimeout(() => {
                if (!this.isListening) {
                    this.toggleButton.style.backgroundColor = '';
                }
            }, 2000);
        }
    },
    
    handleEnd() {
        // Auto restart if we're still supposed to be listening
        if (this.isListening) {
            try {
                this.recognition.start();
            } catch (e) {
                console.error('Failed to restart recognition:', e);
                this.isListening = false;
                this.updateButtonState();
            }
        }
    },
    
    toggleListening(button) {
        this.toggleButton = button;
        
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },
    
    startListening() {
        if (!this.recognition) return;
        
        try {
            this.recognition.start();
            this.isListening = true;
            this.updateButtonState();
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    },
    
    stopListening() {
        if (!this.recognition) return;
        
        try {
            this.recognition.stop();
            this.isListening = false;
            this.updateButtonState();
        } catch (e) {
            console.error('Failed to stop recognition:', e);
        }
    },
    
    updateButtonState() {
        if (this.toggleButton) {
            if (this.isListening) {
                this.toggleButton.classList.add('recording');
                this.toggleButton.title = 'Stop Voice Input';
            } else {
                this.toggleButton.classList.remove('recording');
                this.toggleButton.title = 'Start Voice Input';
            }
        }
    },
    
    setLanguage(languageCode) {
        if (this.supportedLanguages.includes(languageCode)) {
            this.currentLanguage = languageCode;
            if (this.recognition) {
                this.recognition.lang = languageCode;
            }
            return true;
        }
        return false;
    }
}; 