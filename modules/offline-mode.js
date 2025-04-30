// Offline Mode Module
export const OfflineMode = {
    // Status tracking
    status: {
        isOnline: true,
        wasOnlineBeforeDisconnect: true,
        disconnectTime: null,
        reconnectTime: null,
        retryCount: 0,
        maxRetries: 5,
        retryInterval: 10000, // 10 seconds between retries
        retryTimer: null,
        pendingMessages: [],
        offlineData: {}
    },
    
    // Configuration
    config: {
        checkInterval: 30000, // 30 seconds between connectivity checks
        messageTimeout: 10000, // 10 seconds timeout for API calls
        checkTimer: null,
        backgroundSync: true,
        cacheLimit: 50, // Max number of messages to cache
        localStorageEnabled: true
    },
    
    // Initialize offline mode
    init() {
        // Check if local storage is available
        this.config.localStorageEnabled = this.isLocalStorageAvailable();
        
        // Load any cached data
        this.loadCachedData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial connectivity check
        this.checkConnectivity();
        
        // Start periodic checks
        this.startPeriodicChecks();
        
        console.log('Offline mode initialized');
    },
    
    // Set up event listeners for online/offline events
    setupEventListeners() {
        // Online event
        window.addEventListener('online', () => {
            console.log('Browser reports online status');
            this.handleOnline();
        });
        
        // Offline event
        window.addEventListener('offline', () => {
            console.log('Browser reports offline status');
            this.handleOffline();
        });
        
        // Before unload - attempt to save pending state
        window.addEventListener('beforeunload', () => {
            this.saveCachedData();
        });
    },
    
    // Start periodic connectivity checks
    startPeriodicChecks() {
        // Clear any existing interval
        if (this.config.checkTimer) {
            clearInterval(this.config.checkTimer);
        }
        
        // Set new interval
        this.config.checkTimer = setInterval(() => {
            this.checkConnectivity();
        }, this.config.checkInterval);
    },
    
    // Check if device is actually connected to the internet
    async checkConnectivity() {
        try {
            // Try to fetch a small resource with a cache buster
            const cacheBuster = `?cacheBust=${Date.now()}`;
            const response = await fetch(`https://puter.com/favicon.ico${cacheBuster}`, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
                timeout: this.config.messageTimeout
            });
            
            // If we got a response, we're online
            this.handleOnline();
            return true;
        } catch (error) {
            // If the fetch failed, we're offline
            this.handleOffline();
            return false;
        }
    },
    
    // Handle going online
    handleOnline() {
        // Only take action if we were previously offline
        if (!this.status.isOnline) {
            this.status.isOnline = true;
            this.status.reconnectTime = Date.now();
            this.status.retryCount = 0;
            
            // Clear any retry timer
            if (this.status.retryTimer) {
                clearTimeout(this.status.retryTimer);
                this.status.retryTimer = null;
            }
            
            // Notify the user
            this.showConnectivityNotification(true);
            
            // Process any pending messages
            this.processPendingMessages();
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('puterAI:online'));
        }
    },
    
    // Handle going offline
    handleOffline() {
        // Only take action if we were previously online
        if (this.status.isOnline) {
            this.status.isOnline = false;
            this.status.wasOnlineBeforeDisconnect = true;
            this.status.disconnectTime = Date.now();
            
            // Notify the user
            this.showConnectivityNotification(false);
            
            // Start retry timer if not already running
            if (!this.status.retryTimer && this.status.retryCount < this.status.maxRetries) {
                this.scheduleRetry();
            }
            
            // Save current state
            this.saveCachedData();
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('puterAI:offline'));
        }
    },
    
    // Schedule a retry
    scheduleRetry() {
        // Clear any existing timer
        if (this.status.retryTimer) {
            clearTimeout(this.status.retryTimer);
        }
        
        // Increment retry count
        this.status.retryCount++;
        
        // Set new timer
        this.status.retryTimer = setTimeout(() => {
            this.checkConnectivity();
            
            // If still offline and under max retries, schedule another retry
            if (!this.status.isOnline && this.status.retryCount < this.status.maxRetries) {
                this.scheduleRetry();
            }
        }, this.status.retryInterval);
    },
    
    // Show notification about connectivity change
    showConnectivityNotification(isOnline) {
        // Only show notification if we have the notification system
        if (!window.NotificationSystem) {
            return this.showFallbackNotification(isOnline);
        }
        
        if (isOnline) {
            window.NotificationSystem.success('Connection restored! You are back online.', {
                duration: 4000
            });
            
            // If there are pending messages, show additional notification
            if (this.status.pendingMessages.length > 0) {
                window.NotificationSystem.info(`Sending ${this.status.pendingMessages.length} pending message(s)...`, {
                    duration: 3000
                });
            }
        } else {
            window.NotificationSystem.warning('You are currently offline. Some features may be limited.', {
                duration: 8000,
                action: {
                    text: 'Retry Connection',
                    handler: () => this.checkConnectivity()
                }
            });
        }
    },
    
    // Fallback notification when notification system is not available
    showFallbackNotification(isOnline) {
        // Attempt to modify the UI to show connectivity status
        const statusElement = document.createElement('div');
        statusElement.id = 'connectivity-status';
        statusElement.style.position = 'fixed';
        statusElement.style.top = '10px';
        statusElement.style.left = '50%';
        statusElement.style.transform = 'translateX(-50%)';
        statusElement.style.padding = '8px 16px';
        statusElement.style.borderRadius = '4px';
        statusElement.style.zIndex = '9999';
        statusElement.style.fontSize = '14px';
        statusElement.style.fontWeight = 'bold';
        
        if (isOnline) {
            statusElement.textContent = 'Connection restored! You are back online.';
            statusElement.style.backgroundColor = '#28a745';
            statusElement.style.color = 'white';
            
            // Remove after 4 seconds
            setTimeout(() => {
                if (statusElement.parentNode) {
                    statusElement.parentNode.removeChild(statusElement);
                }
            }, 4000);
        } else {
            statusElement.textContent = 'You are currently offline. Some features may be limited.';
            statusElement.style.backgroundColor = '#ffc107';
            statusElement.style.color = 'black';
            
            // Add retry button
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Retry';
            retryButton.style.marginLeft = '10px';
            retryButton.style.padding = '2px 8px';
            retryButton.style.backgroundColor = '#6c757d';
            retryButton.style.color = 'white';
            retryButton.style.border = 'none';
            retryButton.style.borderRadius = '3px';
            retryButton.style.cursor = 'pointer';
            
            retryButton.addEventListener('click', () => {
                this.checkConnectivity();
            });
            
            statusElement.appendChild(retryButton);
        }
        
        // Remove any existing status element
        const existingStatus = document.getElementById('connectivity-status');
        if (existingStatus) {
            existingStatus.parentNode.removeChild(existingStatus);
        }
        
        // Add to DOM
        document.body.appendChild(statusElement);
    },
    
    // Queue a message to be sent when online
    queueMessage(message, model) {
        // Add the message to pending queue
        this.status.pendingMessages.push({
            text: message,
            model: model || 'gpt-4o-mini',
            timestamp: Date.now()
        });
        
        // Save pending messages
        this.saveCachedData();
        
        // Limit the queue size
        if (this.status.pendingMessages.length > this.config.cacheLimit) {
            this.status.pendingMessages.shift(); // Remove oldest message
        }
        
        return true;
    },
    
    // Process any pending messages
    async processPendingMessages() {
        if (!this.status.isOnline || this.status.pendingMessages.length === 0) {
            return;
        }
        
        console.log(`Processing ${this.status.pendingMessages.length} pending messages`);
        
        // Create a copy of the pending messages
        const pendingMessages = [...this.status.pendingMessages];
        
        // Clear the pending messages
        this.status.pendingMessages = [];
        
        // Process each message
        for (const message of pendingMessages) {
            try {
                // If sendMessage function exists on window, use it
                if (typeof window.sendMessage === 'function') {
                    await window.sendMessage(message.text, message.model);
                } else {
                    // Otherwise, add back to queue
                    this.status.pendingMessages.push(message);
                }
            } catch (error) {
                console.error('Failed to process pending message:', error);
                
                // Re-queue the message
                this.status.pendingMessages.push(message);
            }
        }
        
        // Save the updated queue
        this.saveCachedData();
    },
    
    // Get a basic AI response to show offline
    getOfflineResponse(message) {
        // Simple canned responses based on message content
        const lowercaseMessage = message.toLowerCase();
        
        // Detect greetings
        if (/^(hi|hello|hey|greetings)/.test(lowercaseMessage)) {
            return "Hello! I'm currently in offline mode. Your message will be sent when you're back online.";
        }
        
        // Detect questions
        if (/^(what|how|why|when|where|who|can you|could you|would you)/.test(lowercaseMessage)) {
            return "I'll need to be online to answer your question properly. Your message has been saved and will be processed when connection is restored.";
        }
        
        // Default response
        return "I'm currently offline. Your message has been saved and will be sent when connectivity is restored. You can still browse your chat history and draft messages while waiting.";
    },
    
    // Check if we can use localStorage
    isLocalStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Save cached data to localStorage
    saveCachedData() {
        if (!this.config.localStorageEnabled) return;
        
        try {
            const dataToSave = {
                pendingMessages: this.status.pendingMessages,
                lastSaveTime: Date.now()
            };
            
            localStorage.setItem('puter_ai_offline_data', JSON.stringify(dataToSave));
        } catch (e) {
            console.error('Failed to save offline data:', e);
        }
    },
    
    // Load cached data from localStorage
    loadCachedData() {
        if (!this.config.localStorageEnabled) return;
        
        try {
            const saved = localStorage.getItem('puter_ai_offline_data');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Restore pending messages
                if (data.pendingMessages && Array.isArray(data.pendingMessages)) {
                    this.status.pendingMessages = data.pendingMessages;
                }
                
                // If there are pending messages, check connectivity immediately
                if (this.status.pendingMessages.length > 0) {
                    setTimeout(() => this.checkConnectivity(), 1000);
                }
            }
        } catch (e) {
            console.error('Failed to load offline data:', e);
        }
    },
    
    // Get current status
    getStatus() {
        return {
            isOnline: this.status.isOnline,
            disconnectTime: this.status.disconnectTime,
            reconnectTime: this.status.reconnectTime,
            pendingMessages: this.status.pendingMessages.length
        };
    },
    
    // Clear all pending messages
    clearPendingMessages() {
        this.status.pendingMessages = [];
        this.saveCachedData();
    }
}; 