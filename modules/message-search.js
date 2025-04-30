// Message Search Module
export const MessageSearch = {
    // Default settings
    settings: {
        caseSensitive: false,
        wholeWord: false,
        includeAI: true,
        includeUser: true,
        historyDepth: 100  // Max number of chats to search in history
    },
    
    // Last search query
    lastQuery: '',
    
    // Create the search UI
    createSearchUI() {
        const container = document.createElement('div');
        container.className = 'search-container';
        
        // Search input
        const searchGroup = document.createElement('div');
        searchGroup.className = 'search-input-group';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'search-input';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Search in messages...';
        
        const searchButton = document.createElement('button');
        searchButton.id = 'search-button';
        searchButton.className = 'search-button';
        searchButton.innerHTML = '<i class="fas fa-search"></i>';
        
        searchGroup.appendChild(searchInput);
        searchGroup.appendChild(searchButton);
        
        // Search options
        const optionsGroup = document.createElement('div');
        optionsGroup.className = 'search-options-group';
        
        // Case sensitive option
        const caseGroup = document.createElement('div');
        caseGroup.className = 'search-option';
        
        const caseCheckbox = document.createElement('input');
        caseCheckbox.type = 'checkbox';
        caseCheckbox.id = 'search-case-sensitive';
        
        const caseLabel = document.createElement('label');
        caseLabel.htmlFor = 'search-case-sensitive';
        caseLabel.textContent = 'Case sensitive';
        
        caseGroup.appendChild(caseCheckbox);
        caseGroup.appendChild(caseLabel);
        
        // Whole word option
        const wordGroup = document.createElement('div');
        wordGroup.className = 'search-option';
        
        const wordCheckbox = document.createElement('input');
        wordCheckbox.type = 'checkbox';
        wordCheckbox.id = 'search-whole-word';
        
        const wordLabel = document.createElement('label');
        wordLabel.htmlFor = 'search-whole-word';
        wordLabel.textContent = 'Whole word';
        
        wordGroup.appendChild(wordCheckbox);
        wordGroup.appendChild(wordLabel);
        
        // Search in option group
        const sourceGroup = document.createElement('div');
        sourceGroup.className = 'search-source-group';
        sourceGroup.innerHTML = '<span>Search in:</span>';
        
        // AI messages option
        const aiGroup = document.createElement('div');
        aiGroup.className = 'search-option';
        
        const aiCheckbox = document.createElement('input');
        aiCheckbox.type = 'checkbox';
        aiCheckbox.id = 'search-include-ai';
        aiCheckbox.checked = true;
        
        const aiLabel = document.createElement('label');
        aiLabel.htmlFor = 'search-include-ai';
        aiLabel.textContent = 'AI messages';
        
        aiGroup.appendChild(aiCheckbox);
        aiGroup.appendChild(aiLabel);
        
        // User messages option
        const userGroup = document.createElement('div');
        userGroup.className = 'search-option';
        
        const userCheckbox = document.createElement('input');
        userCheckbox.type = 'checkbox';
        userCheckbox.id = 'search-include-user';
        userCheckbox.checked = true;
        
        const userLabel = document.createElement('label');
        userLabel.htmlFor = 'search-include-user';
        userLabel.textContent = 'User messages';
        
        userGroup.appendChild(userCheckbox);
        userGroup.appendChild(userLabel);
        
        sourceGroup.appendChild(aiGroup);
        sourceGroup.appendChild(userGroup);
        
        optionsGroup.appendChild(caseGroup);
        optionsGroup.appendChild(wordGroup);
        optionsGroup.appendChild(sourceGroup);
        
        // Search Scope
        const scopeGroup = document.createElement('div');
        scopeGroup.className = 'search-scope-group';
        
        const scopeLabel = document.createElement('label');
        scopeLabel.htmlFor = 'search-scope';
        scopeLabel.textContent = 'Search in:';
        
        const scopeSelect = document.createElement('select');
        scopeSelect.id = 'search-scope';
        
        const currentOption = document.createElement('option');
        currentOption.value = 'current';
        currentOption.textContent = 'Current conversation';
        scopeSelect.appendChild(currentOption);
        
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All conversations';
        scopeSelect.appendChild(allOption);
        
        scopeGroup.appendChild(scopeLabel);
        scopeGroup.appendChild(scopeSelect);
        
        // Results area
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-container';
        
        const resultsLabel = document.createElement('div');
        resultsLabel.className = 'search-results-label';
        resultsLabel.textContent = 'Search Results:';
        
        const resultsList = document.createElement('div');
        resultsList.id = 'search-results-list';
        resultsList.className = 'search-results-list';
        
        resultsContainer.appendChild(resultsLabel);
        resultsContainer.appendChild(resultsList);
        
        // Add all elements to container
        container.appendChild(searchGroup);
        container.appendChild(optionsGroup);
        container.appendChild(scopeGroup);
        container.appendChild(resultsContainer);
        
        return container;
    },
    
    // Initialize event listeners for the search UI
    initializeListeners() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const caseCheckbox = document.getElementById('search-case-sensitive');
        const wordCheckbox = document.getElementById('search-whole-word');
        const aiCheckbox = document.getElementById('search-include-ai');
        const userCheckbox = document.getElementById('search-include-user');
        const scopeSelect = document.getElementById('search-scope');
        
        if (!searchInput || !searchButton) {
            console.error('Required search UI elements not found');
            return;
        }
        
        // Load settings
        caseCheckbox.checked = this.settings.caseSensitive;
        wordCheckbox.checked = this.settings.wholeWord;
        aiCheckbox.checked = this.settings.includeAI;
        userCheckbox.checked = this.settings.includeUser;
        
        // Search button click event
        searchButton.addEventListener('click', () => {
            this.performSearch();
        });
        
        // Search input enter key event
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Update settings when options change
        caseCheckbox.addEventListener('change', () => {
            this.settings.caseSensitive = caseCheckbox.checked;
        });
        
        wordCheckbox.addEventListener('change', () => {
            this.settings.wholeWord = wordCheckbox.checked;
        });
        
        aiCheckbox.addEventListener('change', () => {
            this.settings.includeAI = aiCheckbox.checked;
        });
        
        userCheckbox.addEventListener('change', () => {
            this.settings.includeUser = userCheckbox.checked;
        });
        
        // Focus the search input
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    },
    
    // Perform the search
    async performSearch() {
        const searchInput = document.getElementById('search-input');
        const scopeSelect = document.getElementById('search-scope');
        const resultsList = document.getElementById('search-results-list');
        
        if (!searchInput || !resultsList) return;
        
        const query = searchInput.value.trim();
        if (!query) return;
        
        this.lastQuery = query;
        
        // Clear previous results
        resultsList.innerHTML = '<div class="search-loading">Searching...</div>';
        
        // Get search scope
        const scope = scopeSelect ? scopeSelect.value : 'current';
        
        try {
            let results = [];
            
            if (scope === 'current') {
                // Search in current conversation
                results = this.searchCurrentConversation(query);
            } else {
                // Search in all conversations
                results = await this.searchAllConversations(query);
            }
            
            // Display results
            this.displaySearchResults(results, resultsList);
        } catch (error) {
            console.error('Search error:', error);
            resultsList.innerHTML = '<div class="search-error">Error performing search. Please try again.</div>';
        }
    },
    
    // Search in the current conversation
    searchCurrentConversation(query) {
        const messageDisplay = document.getElementById('message-display');
        if (!messageDisplay) return [];
        
        const bubbles = messageDisplay.querySelectorAll('.message-bubble');
        return this.searchInBubbles(bubbles, query);
    },
    
    // Search in all conversations from history
    async searchAllConversations(query) {
        const results = [];
        
        try {
            // Get all chat history keys
            const historyKeys = Object.keys(localStorage)
                .filter(key => key.startsWith('chatHistory_'))
                .slice(0, this.settings.historyDepth);
            
            // Search in each chat history
            for (const key of historyKeys) {
                try {
                    const chatData = JSON.parse(localStorage.getItem(key));
                    if (!chatData || !chatData.messages) continue;
                    
                    // Get chat title/identifier
                    const chatId = key.replace('chatHistory_', '');
                    const chatTitle = chatData.title || chatId;
                    
                    // Search in messages
                    chatData.messages.forEach((message, index) => {
                        if (!this.shouldIncludeMessage(message)) return;
                        
                        const content = message.content || '';
                        if (this.textMatches(content, query)) {
                            results.push({
                                chatId,
                                chatTitle,
                                messageIndex: index,
                                message,
                                highlight: this.highlightSearchTerm(content, query)
                            });
                        }
                    });
                } catch (e) {
                    console.warn(`Error searching in chat ${key}:`, e);
                }
            }
        } catch (e) {
            console.error('Error searching all conversations:', e);
        }
        
        return results;
    },
    
    // Search in DOM bubbles
    searchInBubbles(bubbles, query) {
        const results = [];
        
        bubbles.forEach((bubble, index) => {
            const isAI = bubble.classList.contains('ai-bubble');
            const isUser = bubble.classList.contains('user-bubble');
            
            // Skip if message type is not included in search
            if ((isAI && !this.settings.includeAI) || (isUser && !this.settings.includeUser)) {
                return;
            }
            
            const contentElement = bubble.querySelector('.message-content');
            if (!contentElement) return;
            
            const content = contentElement.textContent || '';
            if (this.textMatches(content, query)) {
                results.push({
                    messageIndex: index,
                    element: bubble,
                    content,
                    isAI,
                    isUser,
                    highlight: this.highlightSearchTerm(content, query)
                });
            }
        });
        
        return results;
    },
    
    // Check if a message should be included in search
    shouldIncludeMessage(message) {
        if (!message) return false;
        
        const isAI = message.sender === 'ai';
        const isUser = message.sender === 'user';
        
        return (isAI && this.settings.includeAI) || (isUser && this.settings.includeUser);
    },
    
    // Check if text matches the search query
    textMatches(text, query) {
        if (!text || !query) return false;
        
        // Prepare text and query based on case sensitivity
        let searchText = text;
        let searchQuery = query;
        
        if (!this.settings.caseSensitive) {
            searchText = text.toLowerCase();
            searchQuery = query.toLowerCase();
        }
        
        // Check if whole word only
        if (this.settings.wholeWord) {
            const regex = this.settings.caseSensitive
                ? new RegExp(`\\b${this.escapeRegex(query)}\\b`, 'g')
                : new RegExp(`\\b${this.escapeRegex(query)}\\b`, 'gi');
            
            return regex.test(text);
        } else {
            return searchText.includes(searchQuery);
        }
    },
    
    // Escape special characters in regex
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    // Create highlighted version of text with search term
    highlightSearchTerm(text, query) {
        if (!text || !query) return text;
        
        let searchText = text;
        let searchQuery = query;
        
        // Create regex for highlight
        let regex;
        if (this.settings.wholeWord) {
            regex = this.settings.caseSensitive
                ? new RegExp(`(\\b${this.escapeRegex(query)}\\b)`, 'g')
                : new RegExp(`(\\b${this.escapeRegex(query)}\\b)`, 'gi');
        } else {
            regex = this.settings.caseSensitive
                ? new RegExp(`(${this.escapeRegex(query)})`, 'g')
                : new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        }
        
        // Replace with highlighted version
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    },
    
    // Display search results
    displaySearchResults(results, resultsContainer) {
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }
        
        let html = '';
        
        results.forEach((result, index) => {
            const sender = result.isAI ? 'AI' : (result.isUser ? 'You' : result.message?.sender || 'Unknown');
            
            html += `
                <div class="search-result" data-index="${index}">
                    ${result.chatTitle ? `<div class="search-result-chat">${result.chatTitle}</div>` : ''}
                    <div class="search-result-sender">${sender}</div>
                    <div class="search-result-content">${result.highlight}</div>
                    ${result.element ? `
                        <button class="search-result-goto" data-index="${index}">Go to message</button>
                    ` : result.chatId ? `
                        <button class="search-result-open" data-chat-id="${result.chatId}">Open chat</button>
                    ` : ''}
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
        
        // Add event listeners for go to message buttons
        const gotoButtons = resultsContainer.querySelectorAll('.search-result-goto');
        gotoButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                if (index !== null) {
                    this.scrollToMessage(results[index].element);
                }
            });
        });
        
        // Add event listeners for open chat buttons
        const openButtons = resultsContainer.querySelectorAll('.search-result-open');
        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                const chatId = button.getAttribute('data-chat-id');
                if (chatId) {
                    this.openChat(chatId);
                }
            });
        });
    },
    
    // Scroll to a message element and highlight it
    scrollToMessage(element) {
        if (!element) return;
        
        // Scroll the message into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        element.classList.add('search-highlight-bubble');
        
        // Remove highlight after a delay
        setTimeout(() => {
            element.classList.remove('search-highlight-bubble');
        }, 2000);
        
        // Close search popup if open
        const closeButton = document.querySelector('.close-popup-btn');
        if (closeButton) {
            closeButton.click();
        }
    },
    
    // Open a chat from history
    openChat(chatId) {
        if (!chatId) return;
        
        // This function needs to be implemented in the main app
        // to load a chat from history by its ID
        window.loadChatFromHistory?.(`chatHistory_${chatId}`);
        
        // Close search popup
        const closeButton = document.querySelector('.close-popup-btn');
        if (closeButton) {
            closeButton.click();
        }
    }
}; 