// New Features Integration Module
import { VoiceInput } from './voice-input.js';
import { MessageReactions } from './message-reactions.js';
import { ConversationExport } from './conversation-export.js';
import { CodeSnippet } from './code-snippet.js';
import { NotificationSystem } from './notification-system.js';
import { ChatBackgrounds } from './chat-backgrounds.js';
import { MessageSearch } from './message-search.js';
import { AutoSuggestions } from './auto-suggestions.js';
import { OfflineMode } from './offline-mode.js';

export const NewFeatures = {
    // Flags to track initialization status
    initialized: false,
    settings: {
        voiceInput: true,
        reactions: true,
        codeHighlight: true,
        notifications: true,
        backgrounds: true,
        search: true,
        autoSuggestions: true,
        offline: true
    },
    
    // Main initialization function
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing new features...');
        
        // Load saved settings
        this.loadSettings();
        
        // Initialize notification system first (other features might use it)
        if (this.settings.notifications) {
            NotificationSystem.init();
            window.NotificationSystem = NotificationSystem;
        }
        
        try {
            // Initialize code highlighting
            if (this.settings.codeHighlight) {
                await CodeSnippet.init();
                window.CodeSnippet = CodeSnippet;
            }
            
            // Initialize background customization
            if (this.settings.backgrounds) {
                ChatBackgrounds.init();
                window.ChatBackgrounds = ChatBackgrounds;
            }
            
            // Initialize other components
            if (this.settings.reactions) {
                window.MessageReactions = MessageReactions;
            }
            
            if (this.settings.voiceInput) {
                this.initializeVoiceInput();
            }
            
            if (this.settings.autoSuggestions) {
                AutoSuggestions.init();
                window.AutoSuggestions = AutoSuggestions;
                this.initializeAutoSuggestionsUI();
            }
            
            if (this.settings.offline) {
                OfflineMode.init();
                window.OfflineMode = OfflineMode;
            }
            
            // Expose modules globally for use in main script
            window.ConversationExport = ConversationExport;
            window.MessageSearch = MessageSearch;
            
            // After all modules are initialized, set up UI integrations
            this.setupUIIntegrations();
            
            // Mark as initialized
            this.initialized = true;
            
            // Show welcome notification if this is first time
            this.showWelcomeNotification();
            
            console.log('New features initialized successfully');
        } catch (error) {
            console.error('Error initializing new features:', error);
            
            if (window.NotificationSystem) {
                NotificationSystem.error('Failed to initialize some features. Please check the console for details.');
            }
        }
    },
    
    // Initialize voice input
    initializeVoiceInput() {
        const chatInput = document.getElementById('chat-input');
        const micButton = document.getElementById('mic-button');
        
        if (chatInput && micButton) {
            const voiceInitialized = VoiceInput.init(chatInput);
            
            if (voiceInitialized) {
                window.VoiceInput = VoiceInput;
                
                // Replace existing mic button handler
                micButton.removeEventListener('click', window.toggleChatMicRecording);
                
                micButton.addEventListener('click', () => {
                    VoiceInput.toggleListening(micButton);
                });
            } else {
                console.warn('Voice input not supported in this browser');
                micButton.title = 'Voice input not supported in this browser';
                micButton.disabled = true;
                micButton.style.opacity = '0.5';
            }
        }
    },
    
    // Initialize auto-suggestions UI
    initializeAutoSuggestionsUI() {
        const suggestionContainer = document.getElementById('suggestion-container');
        if (!suggestionContainer) return;
        
        // Process new messages to generate suggestions
        const originalDisplayMessage = window.displayMessage;
        if (originalDisplayMessage) {
            window.displayMessage = function(text, sender, ...args) {
                // Call original function first
                const result = originalDisplayMessage(text, sender, ...args);
                
                // Process message for suggestions
                AutoSuggestions.processNewMessage(text, sender);
                
                return result;
            };
        }
        
        // Clear suggestions when user starts typing
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                AutoSuggestions.clearSuggestions();
            });
        }
    },
    
    // Setup UI integrations for all features
    setupUIIntegrations() {
        // Add popup UI elements programmatically
        this.setupSearchPopup();
        this.setupExportPopup();
        this.setupBackgroundPopup();
        this.setupSettingsIntegration();
        
        // Add event listeners for new buttons
        this.setupButtonListeners();
        
        // Hook into message display to add reactions and code highlighting
        this.enhanceMessageDisplay();
    },
    
    // Setup search popup
    setupSearchPopup() {
        const searchContent = document.getElementById('search-content');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchContent && this.settings.search) {
            // Create search UI
            const searchUI = MessageSearch.createSearchUI();
            searchContent.appendChild(searchUI);
            
            // Show the search popup when search button is clicked
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.showPopup('search-popup');
                    MessageSearch.initializeListeners();
                });
            }
            
            // Add search button in settings too
            const searchMessagesBtn = document.getElementById('search-messages-btn');
            if (searchMessagesBtn) {
                searchMessagesBtn.addEventListener('click', () => {
                    // Close settings popup first
                    const closeBtn = document.querySelector('#settings-popup .close-popup-btn');
                    if (closeBtn) closeBtn.click();
                    
                    // Then open search popup
                    setTimeout(() => {
                        this.showPopup('search-popup');
                        MessageSearch.initializeListeners();
                    }, 300);
                });
            }
        } else if (searchBtn) {
            // Hide search button if search is disabled
            searchBtn.style.display = 'none';
        }
    },
    
    // Setup export popup
    setupExportPopup() {
        const exportContent = document.getElementById('export-content');
        const exportBtn = document.getElementById('export-btn');
        
        if (exportContent) {
            // Create export UI
            const exportUI = ConversationExport.createExportUI();
            exportContent.appendChild(exportUI);
            
            // Show the export popup when export button is clicked
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.showPopup('export-popup');
                    
                    // Get current chat data
                    const chatData = this.getCurrentChatData();
                    
                    // Initialize listeners with chat data
                    ConversationExport.initializeListeners(chatData);
                });
            }
            
            // Add export button in settings too
            const exportConversationBtn = document.getElementById('export-conversation-btn');
            if (exportConversationBtn) {
                exportConversationBtn.addEventListener('click', () => {
                    // Close settings popup first
                    const closeBtn = document.querySelector('#settings-popup .close-popup-btn');
                    if (closeBtn) closeBtn.click();
                    
                    // Then open export popup
                    setTimeout(() => {
                        this.showPopup('export-popup');
                        
                        // Get current chat data
                        const chatData = this.getCurrentChatData();
                        
                        // Initialize listeners with chat data
                        ConversationExport.initializeListeners(chatData);
                    }, 300);
                });
            }
        } else if (exportBtn) {
            // Hide export button if export is disabled
            exportBtn.style.display = 'none';
        }
    },
    
    // Setup background customization popup
    setupBackgroundPopup() {
        const backgroundContent = document.getElementById('background-content');
        const backgroundBtn = document.getElementById('background-btn');
        
        if (backgroundContent && this.settings.backgrounds) {
            // Create background UI
            const backgroundUI = ChatBackgrounds.createBackgroundUI();
            backgroundContent.appendChild(backgroundUI);
            
            // Show the background popup when button is clicked
            if (backgroundBtn) {
                backgroundBtn.addEventListener('click', () => {
                    this.showPopup('background-popup');
                    ChatBackgrounds.initializeListeners();
                });
            }
            
            // Add background button in settings too
            const settingsBackgroundBtn = document.getElementById('settings-background-btn');
            if (settingsBackgroundBtn) {
                settingsBackgroundBtn.addEventListener('click', () => {
                    // Close settings popup first
                    const closeBtn = document.querySelector('#settings-popup .close-popup-btn');
                    if (closeBtn) closeBtn.click();
                    
                    // Then open background popup
                    setTimeout(() => {
                        this.showPopup('background-popup');
                        ChatBackgrounds.initializeListeners();
                    }, 300);
                });
            }
        } else if (backgroundBtn) {
            // Hide background button if backgrounds are disabled
            backgroundBtn.style.display = 'none';
        }
    },
    
    // Enhance message display with reactions and code highlighting
    enhanceMessageDisplay() {
        const originalDisplayMessage = window.displayMessage;
        
        if (originalDisplayMessage) {
            window.displayMessage = function(text, sender, ...args) {
                // Call original function first
                const result = originalDisplayMessage(text, sender, ...args);
                
                // If the function returns a bubble element and reactions are enabled
                if (result && result.classList && result.classList.contains('message-bubble') && NewFeatures.settings.reactions) {
                    // Generate a message ID
                    const timestamp = new Date().getTime();
                    const messageId = MessageReactions.generateMessageId(text, timestamp);
                    
                    // Add message ID to bubble
                    result.setAttribute('data-message-id', messageId);
                    
                    // Add reactions
                    MessageReactions.addReactionsToMessage(result, messageId);
                }
                
                // If code highlighting is enabled, process the message content
                if (result && result.querySelector && NewFeatures.settings.codeHighlight) {
                    const contentElement = result.querySelector('.message-content');
                    
                    if (contentElement) {
                        // First convert markdown code blocks to HTML
                        const htmlWithCodeBlocks = CodeSnippet.formatMessageWithCodeBlocks(text);
                        
                        // If we have code blocks, replace the content
                        if (htmlWithCodeBlocks !== text) {
                            contentElement.innerHTML = htmlWithCodeBlocks;
                        }
                        
                        // Process the content for syntax highlighting
                        CodeSnippet.processElement(contentElement);
                    }
                }
                
                return result;
            };
        }
    },
    
    // Setup integration with settings panel
    setupSettingsIntegration() {
        // Connect settings toggles with features
        const settingsToggles = {
            'settings-reactions-toggle': 'reactions',
            'settings-code-highlight-toggle': 'codeHighlight',
            'settings-suggestions-toggle': 'autoSuggestions',
            'settings-voice-toggle': 'voiceInput',
            'settings-offline-toggle': 'offline'
        };
        
        // Load current settings to toggles
        Object.entries(settingsToggles).forEach(([elementId, settingKey]) => {
            const toggle = document.getElementById(elementId);
            if (toggle) {
                toggle.checked = this.settings[settingKey];
            }
        });
        
        // Add save button handler
        const saveBtn = document.getElementById('settings-features-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Update settings based on toggles
                Object.entries(settingsToggles).forEach(([elementId, settingKey]) => {
                    const toggle = document.getElementById(elementId);
                    if (toggle) {
                        this.settings[settingKey] = toggle.checked;
                        
                        // Update specific feature toggles
                        if (settingKey === 'autoSuggestions' && window.AutoSuggestions) {
                            AutoSuggestions.toggleSuggestions(toggle.checked);
                        }
                    }
                });
                
                // Save settings
                this.saveSettings();
                
                // Show confirmation
                const statusElement = document.getElementById('settings-features-status');
                if (statusElement) {
                    statusElement.textContent = 'Settings saved!';
                    statusElement.style.color = '#28a745';
                    
                    setTimeout(() => {
                        statusElement.textContent = '';
                    }, 3000);
                }
                
                // Show notification if notifications are enabled
                if (this.settings.notifications && window.NotificationSystem) {
                    NotificationSystem.success('Feature settings saved successfully');
                }
            });
        }
    },
    
    // Setup button listeners for new features
    setupButtonListeners() {
        // Any additional button listeners not handled elsewhere
    },
    
    // Helper to show popup
    showPopup(popupId) {
        const popup = document.getElementById(popupId);
        const backdrop = document.getElementById('popup-backdrop');
        
        if (popup && backdrop) {
            // Hide any other popups first
            document.querySelectorAll('.popup').forEach(p => {
                if (p.id !== popupId) {
                    p.style.display = 'none';
                }
            });
            
            // Show this popup
            popup.style.display = 'block';
            backdrop.style.display = 'block';
            
            // Add close button functionality
            const closeBtn = popup.querySelector('.close-popup-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    popup.style.display = 'none';
                    backdrop.style.display = 'none';
                });
            }
            
            // Close on backdrop click
            backdrop.addEventListener('click', () => {
                popup.style.display = 'none';
                backdrop.style.display = 'none';
            });
        }
    },
    
    // Get current chat data for export
    getCurrentChatData() {
        try {
            const messageDisplay = document.getElementById('message-display');
            const messages = [];
            
            if (messageDisplay) {
                // Collect messages from the DOM
                const bubbles = messageDisplay.querySelectorAll('.message-bubble');
                
                bubbles.forEach(bubble => {
                    const isAI = bubble.classList.contains('ai-bubble');
                    const isUser = bubble.classList.contains('user-bubble');
                    const sender = isAI ? 'ai' : (isUser ? 'user' : 'system');
                    
                    const contentElement = bubble.querySelector('.message-content');
                    const timestampElement = bubble.querySelector('.bubble-timestamp');
                    
                    if (contentElement) {
                        const timestamp = timestampElement ? 
                            new Date(timestampElement.getAttribute('data-timestamp') || Date.now()).getTime() : 
                            Date.now();
                        
                        messages.push({
                            sender,
                            content: contentElement.textContent || '',
                            timestamp
                        });
                    }
                });
            }
            
            return {
                messages,
                metadata: {
                    model: document.getElementById('model-selector')?.value || 'unknown',
                    date: new Date().toISOString(),
                    appVersion: '1.1.0' // Updated with new features
                }
            };
        } catch (e) {
            console.error('Error getting chat data:', e);
            return { messages: [], metadata: { date: new Date().toISOString() } };
        }
    },
    
    // Save feature settings
    saveSettings() {
        try {
            localStorage.setItem('new_features_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save feature settings:', e);
        }
    },
    
    // Load feature settings
    loadSettings() {
        try {
            const saved = localStorage.getItem('new_features_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load feature settings:', e);
        }
    },
    
    // Show welcome notification for first-time users
    showWelcomeNotification() {
        try {
            // Check if this is the first time running the new features
            const hasSeenWelcome = localStorage.getItem('new_features_welcome_shown');
            
            if (!hasSeenWelcome && this.settings.notifications && window.NotificationSystem) {
                // Show welcome notification
                NotificationSystem.info('New features have been added! Check Settings > Features to customize your experience.', {
                    title: 'Welcome to Puter AI Chat 1.1',
                    duration: 8000,
                    action: {
                        text: 'Open Settings',
                        handler: () => {
                            // Open settings popup
                            const settingsBtn = document.getElementById('settings-btn');
                            if (settingsBtn) settingsBtn.click();
                            
                            // Switch to features tab
                            setTimeout(() => {
                                const featuresTab = document.querySelector('.settings-tab-btn[data-tab="features"]');
                                if (featuresTab) featuresTab.click();
                            }, 300);
                        }
                    }
                });
                
                // Mark as shown
                localStorage.setItem('new_features_welcome_shown', 'true');
            }
        } catch (e) {
            console.error('Error showing welcome notification:', e);
        }
    }
};

// Initialize when imported
setTimeout(() => {
    NewFeatures.init();
}, 1000); // Delay initialization to ensure the main app is loaded first 