// Message Reactions Module
export const MessageReactions = {
    // Available reactions
    availableReactions: [
        { emoji: '👍', name: 'thumbs_up', tooltip: 'Thumbs Up' },
        { emoji: '👎', name: 'thumbs_down', tooltip: 'Thumbs Down' },
        { emoji: '❤️', name: 'heart', tooltip: 'Heart' },
        { emoji: '😂', name: 'laugh', tooltip: 'Laugh' },
        { emoji: '😮', name: 'wow', tooltip: 'Wow' },
        { emoji: '🔍', name: 'insightful', tooltip: 'Insightful' },
        { emoji: '💡', name: 'helpful', tooltip: 'Helpful' }
    ],
    
    // Storage key prefix for reaction counts
    storageKeyPrefix: 'reaction_',
    
    // Initialize reactions for a message
    addReactionsToMessage(messageElement, messageId) {
        // Create reactions container
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        
        // Add each reaction button
        this.availableReactions.forEach(reaction => {
            const reactionButton = this.createReactionButton(reaction, messageId);
            reactionsContainer.appendChild(reactionButton);
        });
        
        // Add reaction picker
        messageElement.appendChild(reactionsContainer);
        
        // Load existing reactions
        this.loadReactionsForMessage(messageId, reactionsContainer);
    },
    
    // Create a single reaction button
    createReactionButton(reaction, messageId) {
        const button = document.createElement('button');
        button.className = 'reaction-button';
        button.setAttribute('data-reaction', reaction.name);
        button.setAttribute('title', reaction.tooltip);
        button.innerHTML = `${reaction.emoji} <span class="reaction-count">0</span>`;
        
        // Add click event
        button.addEventListener('click', () => {
            this.toggleReaction(button, messageId, reaction.name);
        });
        
        return button;
    },
    
    // Toggle a reaction for a message
    toggleReaction(button, messageId, reactionName) {
        const storageKey = `${this.storageKeyPrefix}${messageId}_${reactionName}`;
        const countElement = button.querySelector('.reaction-count');
        let count = parseInt(countElement.textContent) || 0;
        
        // Check if user has already reacted
        const hasReacted = button.classList.contains('reacted');
        
        if (hasReacted) {
            // Remove reaction
            count = Math.max(0, count - 1);
            button.classList.remove('reacted');
        } else {
            // Add reaction
            count += 1;
            button.classList.add('reacted');
        }
        
        // Update count display
        countElement.textContent = count;
        
        // Store reaction state
        if (count > 0) {
            localStorage.setItem(storageKey, count.toString());
        } else {
            localStorage.removeItem(storageKey);
        }
        
        // Animate the button
        button.classList.add('reaction-animated');
        setTimeout(() => {
            button.classList.remove('reaction-animated');
        }, 300);
    },
    
    // Load existing reactions for a message
    loadReactionsForMessage(messageId, reactionsContainer) {
        this.availableReactions.forEach(reaction => {
            const storageKey = `${this.storageKeyPrefix}${messageId}_${reaction.name}`;
            const count = localStorage.getItem(storageKey);
            
            if (count && parseInt(count) > 0) {
                const button = reactionsContainer.querySelector(`[data-reaction="${reaction.name}"]`);
                if (button) {
                    const countElement = button.querySelector('.reaction-count');
                    countElement.textContent = count;
                    button.classList.add('reacted');
                }
            }
        });
    },
    
    // Generate a unique ID for a message
    generateMessageId(message, timestamp) {
        // Create a simple hash from the message content and timestamp
        const combinedString = `${message}_${timestamp}`;
        let hash = 0;
        
        for (let i = 0; i < combinedString.length; i++) {
            const char = combinedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return `msg_${Math.abs(hash)}`;
    }
}; 