// Auto-Suggestions Module
export const AutoSuggestions = {
    // Default settings
    settings: {
        enabled: true,
        maxSuggestions: 3,
        minCharacters: 10,
        suggestAfterInactivity: 15000, // 15 seconds
        suggestAfterAI: true,
        showSuggestionSource: true
    },
    
    // Suggestion types and templates
    suggestionTypes: {
        followUp: {
            label: 'Follow-up',
            templates: [
                "Can you explain more about {topic}?",
                "What are the implications of {topic}?",
                "How does {topic} compare to {related}?",
                "What are some practical applications of {topic}?",
                "Can you provide examples of {topic}?",
                "What are the advantages and disadvantages of {topic}?",
                "How has {topic} evolved over time?",
                "What are common misconceptions about {topic}?",
                "What would be the next steps after {action}?",
                "How would {topic} work in a different context?"
            ]
        },
        clarification: {
            label: 'Clarification',
            templates: [
                "Could you clarify what you mean by {term}?",
                "I'm not sure I understand {term}. Can you explain it differently?",
                "What's the difference between {term1} and {term2}?",
                "Can you break down {concept} into simpler terms?",
                "Could you give a specific example of {concept}?",
                "When you mention {term}, are you referring to {specific}?",
                "Is {term} the same as {alternative}?",
                "Could you expand on your point about {topic}?"
            ]
        },
        expansion: {
            label: 'More Detail',
            templates: [
                "Could you go into more detail about {topic}?",
                "I'd like to learn more about {topic}. What else can you tell me?",
                "What other factors should I consider regarding {topic}?",
                "Are there any alternatives to {approach} worth considering?",
                "Could you elaborate on the relationship between {topic1} and {topic2}?",
                "What are some advanced concepts related to {topic}?",
                "How would experts in the field approach {problem}?",
                "Could you provide a more technical explanation of {topic}?"
            ]
        },
        counterpoint: {
            label: 'Counterpoint',
            templates: [
                "What are some arguments against {position}?",
                "What would critics say about {approach}?",
                "Are there any drawbacks to {method}?",
                "What are the limitations of {solution}?",
                "Could there be unintended consequences of {action}?",
                "What are some alternative perspectives on {topic}?",
                "How might someone with a different background view {topic}?",
                "What are the trade-offs involved in {decision}?"
            ]
        },
        action: {
            label: 'Next Steps',
            templates: [
                "What would be a good first step to implement {solution}?",
                "How can I apply {concept} in practice?",
                "What tools would I need to accomplish {task}?",
                "Could you suggest a step-by-step approach for {goal}?",
                "What resources would you recommend for learning more about {topic}?",
                "How can I measure the success of {approach}?",
                "What common pitfalls should I avoid when working with {topic}?",
                "Who are the experts I should follow regarding {field}?"
            ]
        }
    },
    
    // Recent context and activity tracking
    context: {
        recentTopics: [],
        lastMessageTime: 0,
        lastMessageSender: null,
        conversationFlow: [],
        inactivityTimer: null
    },
    
    // Initialize the suggestions system
    init() {
        this.context.lastMessageTime = Date.now();
        this.setupInactivityDetection();
    },
    
    // Create UI for suggestion chips
    createSuggestionsUI() {
        const container = document.createElement('div');
        container.id = 'suggestion-container';
        container.className = 'suggestion-container';
        return container;
    },
    
    // Set up inactivity detection
    setupInactivityDetection() {
        // Clear existing timer
        if (this.context.inactivityTimer) {
            clearTimeout(this.context.inactivityTimer);
        }
        
        // Set new timer
        this.context.inactivityTimer = setTimeout(() => {
            if (this.settings.enabled && this.context.lastMessageSender === 'ai') {
                this.showSuggestions();
            }
        }, this.settings.suggestAfterInactivity);
    },
    
    // Process new message and update context
    processNewMessage(message, sender) {
        if (!this.settings.enabled) return;
        
        // Update last message info
        this.context.lastMessageTime = Date.now();
        this.context.lastMessageSender = sender;
        
        // Reset inactivity timer
        this.setupInactivityDetection();
        
        // Extract topics from message
        if (message && message.length > this.settings.minCharacters) {
            const extractedTopics = this.extractTopics(message);
            
            // Update recent topics
            this.context.recentTopics = [
                ...extractedTopics,
                ...this.context.recentTopics
            ].slice(0, 10); // Keep only 10 most recent topics
            
            // Update conversation flow
            this.context.conversationFlow.push({
                sender,
                topics: extractedTopics,
                timestamp: Date.now()
            });
            
            // Trim conversation flow to last 10 messages
            if (this.context.conversationFlow.length > 10) {
                this.context.conversationFlow.shift();
            }
        }
        
        // Show suggestions after AI message if enabled
        if (this.settings.suggestAfterAI && sender === 'ai') {
            setTimeout(() => {
                this.showSuggestions();
            }, 1000);
        }
    },
    
    // Extract potential topics from a message
    extractTopics(message) {
        // Simple extraction - more sophisticated NLP could be used
        const topics = [];
        
        // Remove common punctuation and split into words
        const words = message
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(/\s+/);
        
        // Find nouns and noun phrases (simplified approach)
        const stopWords = new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
            'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'of', 'from'
        ]);
        
        // Look for potential noun phrases (2-3 words)
        for (let i = 0; i < words.length - 1; i++) {
            if (!stopWords.has(words[i].toLowerCase())) {
                // Two-word phrases
                if (i < words.length - 1 && !stopWords.has(words[i + 1].toLowerCase())) {
                    topics.push(`${words[i]} ${words[i + 1]}`.toLowerCase());
                }
                
                // Three-word phrases
                if (i < words.length - 2 && 
                    !stopWords.has(words[i + 1].toLowerCase()) && 
                    !stopWords.has(words[i + 2].toLowerCase())) {
                    topics.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`.toLowerCase());
                }
                
                // Single words (if longer than 3 characters)
                if (words[i].length > 3) {
                    topics.push(words[i].toLowerCase());
                }
            }
        }
        
        // Add the last word if it's not a stop word and is long enough
        const lastWord = words[words.length - 1];
        if (lastWord && lastWord.length > 3 && !stopWords.has(lastWord.toLowerCase())) {
            topics.push(lastWord.toLowerCase());
        }
        
        // Deduplicate and return top topics
        return [...new Set(topics)].slice(0, 5);
    },
    
    // Generate and show message suggestions
    showSuggestions() {
        if (!this.settings.enabled || this.context.recentTopics.length === 0) return;
        
        const suggestionContainer = document.getElementById('suggestion-container');
        if (!suggestionContainer) return;
        
        // Clear existing suggestions
        suggestionContainer.innerHTML = '';
        
        // Generate new suggestions
        const suggestions = this.generateSuggestions();
        
        if (suggestions.length === 0) return;
        
        // Show heading
        const heading = document.createElement('div');
        heading.className = 'suggestion-heading';
        heading.textContent = 'Suggested questions:';
        suggestionContainer.appendChild(heading);
        
        // Create and add suggestion chips
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion.text;
            chip.setAttribute('data-suggestion-type', suggestion.type);
            
            // Add source label if enabled
            if (this.settings.showSuggestionSource) {
                const label = document.createElement('span');
                label.className = 'suggestion-type-label';
                label.textContent = this.suggestionTypes[suggestion.type].label;
                chip.appendChild(label);
            }
            
            // Add click handler
            chip.addEventListener('click', () => {
                this.useSuggestion(suggestion.text);
            });
            
            suggestionContainer.appendChild(chip);
        });
        
        // Make container visible
        suggestionContainer.style.display = 'block';
    },
    
    // Use a suggestion (send it to the input)
    useSuggestion(text) {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        // Set the input value
        chatInput.value = text;
        chatInput.focus();
        
        // Trigger input event to adjust textarea height if needed
        const inputEvent = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(inputEvent);
        
        // Clear suggestions
        const suggestionContainer = document.getElementById('suggestion-container');
        if (suggestionContainer) {
            suggestionContainer.innerHTML = '';
            suggestionContainer.style.display = 'none';
        }
    },
    
    // Generate context-aware suggestions
    generateSuggestions() {
        const suggestions = [];
        const usedTemplates = new Set();
        
        // Helper to fill a template with topics
        const fillTemplate = (template, type) => {
            // Skip if we've already used this template
            if (usedTemplates.has(template)) return null;
            
            // Find placeholders in the template
            const placeholders = template.match(/\{([^}]+)\}/g) || [];
            
            // If no topics but template has placeholders, skip it
            if (this.context.recentTopics.length === 0 && placeholders.length > 0) return null;
            
            let filledTemplate = template;
            const usedTopics = new Set();
            
            // Fill each placeholder
            for (const placeholder of placeholders) {
                const placeholderName = placeholder.slice(1, -1); // Remove { and }
                let topicToUse;
                
                // Choose an appropriate topic based on placeholder name
                if (placeholderName.startsWith('topic')) {
                    // Find a topic not already used in this template
                    topicToUse = this.context.recentTopics.find(topic => !usedTopics.has(topic));
                } else if (placeholderName.startsWith('related')) {
                    // Try to find a different topic
                    topicToUse = this.context.recentTopics.find(topic => !usedTopics.has(topic));
                } else if (placeholderName.includes('term')) {
                    // Use shorter topics for terms
                    topicToUse = this.context.recentTopics
                        .filter(topic => topic.split(' ').length === 1)
                        .find(topic => !usedTopics.has(topic));
                } else if (placeholderName.includes('concept')) {
                    // Use longer topics for concepts
                    topicToUse = this.context.recentTopics
                        .filter(topic => topic.split(' ').length > 1)
                        .find(topic => !usedTopics.has(topic));
                } else {
                    // Default to any topic
                    topicToUse = this.context.recentTopics.find(topic => !usedTopics.has(topic));
                }
                
                // If couldn't find an appropriate topic, try any unused one
                if (!topicToUse) {
                    topicToUse = this.context.recentTopics.find(topic => !usedTopics.has(topic));
                }
                
                // If still no topic, just use the first one
                if (!topicToUse && this.context.recentTopics.length > 0) {
                    topicToUse = this.context.recentTopics[0];
                }
                
                // If no topics at all, replace with generic placeholder
                if (!topicToUse) {
                    topicToUse = 'this';
                }
                
                // Replace placeholder and mark topic as used
                filledTemplate = filledTemplate.replace(placeholder, topicToUse);
                usedTopics.add(topicToUse);
            }
            
            // Mark template as used
            usedTemplates.add(template);
            
            return {
                text: filledTemplate,
                type: type
            };
        };
        
        // Try to create suggestions of different types
        const suggestionTypes = Object.keys(this.suggestionTypes);
        
        // Randomize the order to get variety
        const shuffledTypes = this.shuffleArray([...suggestionTypes]);
        
        // Go through each type and try to create a suggestion
        for (const type of shuffledTypes) {
            if (suggestions.length >= this.settings.maxSuggestions) break;
            
            const templates = [...this.suggestionTypes[type].templates];
            const shuffledTemplates = this.shuffleArray(templates);
            
            // Try templates until one works or we run out
            for (const template of shuffledTemplates) {
                const suggestion = fillTemplate(template, type);
                if (suggestion) {
                    suggestions.push(suggestion);
                    break; // One suggestion per type
                }
            }
        }
        
        // If we still need more suggestions, try additional types
        while (suggestions.length < this.settings.maxSuggestions && usedTemplates.size < this.getTotalTemplateCount()) {
            for (const type of shuffledTypes) {
                if (suggestions.length >= this.settings.maxSuggestions) break;
                
                const templates = this.suggestionTypes[type].templates.filter(t => !usedTemplates.has(t));
                if (templates.length === 0) continue;
                
                const template = templates[Math.floor(Math.random() * templates.length)];
                const suggestion = fillTemplate(template, type);
                
                if (suggestion) {
                    suggestions.push(suggestion);
                }
            }
        }
        
        return suggestions;
    },
    
    // Get total number of templates across all types
    getTotalTemplateCount() {
        return Object.values(this.suggestionTypes)
            .reduce((count, type) => count + type.templates.length, 0);
    },
    
    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    // Clear current suggestions
    clearSuggestions() {
        const suggestionContainer = document.getElementById('suggestion-container');
        if (suggestionContainer) {
            suggestionContainer.innerHTML = '';
            suggestionContainer.style.display = 'none';
        }
    },
    
    // Enable or disable suggestions
    toggleSuggestions(enabled) {
        this.settings.enabled = enabled;
        if (!enabled) {
            this.clearSuggestions();
        }
    },
    
    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}; 