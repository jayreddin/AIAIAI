// Notification System Module
export const NotificationSystem = {
    // Container for notifications
    container: null,
    
    // Notification types with corresponding icons and colors
    types: {
        info: { icon: 'fa-info-circle', color: '#17a2b8' },
        success: { icon: 'fa-check-circle', color: '#28a745' },
        warning: { icon: 'fa-exclamation-triangle', color: '#ffc107' },
        error: { icon: 'fa-times-circle', color: '#dc3545' },
        update: { icon: 'fa-sync', color: '#6f42c1' }
    },
    
    // Initialize the notification system
    init() {
        // Create notification container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            document.body.appendChild(this.container);
            
            // Add styles if they don't exist
            if (!document.getElementById('notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = this.getStyles();
                document.head.appendChild(style);
            }
        }
    },
    
    // Show a notification
    show({
        title = '',
        message = '',
        type = 'info',
        duration = 5000,
        progress = true,
        closable = true,
        action = null
    }) {
        this.init();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Get icon and color for the notification type
        const typeInfo = this.types[type] || this.types.info;
        
        // Set notification HTML
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${typeInfo.icon}"></i>
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
                ${action ? `
                    <div class="notification-action">
                        <button class="notification-action-button">${action.text}</button>
                    </div>
                ` : ''}
            </div>
            ${closable ? `
                <div class="notification-close">
                    <i class="fas fa-times"></i>
                </div>
            ` : ''}
            ${progress && duration > 0 ? `
                <div class="notification-progress-bar">
                    <div class="notification-progress"></div>
                </div>
            ` : ''}
        `;
        
        // Add notification to container
        this.container.appendChild(notification);
        
        // Add event listener for close button
        if (closable) {
            const closeButton = notification.querySelector('.notification-close');
            closeButton.addEventListener('click', () => {
                this.remove(notification);
            });
        }
        
        // Add event listener for action button
        if (action && action.handler) {
            const actionButton = notification.querySelector('.notification-action-button');
            actionButton.addEventListener('click', () => {
                action.handler();
                // Auto close after action if specified
                if (action.autoClose !== false) {
                    this.remove(notification);
                }
            });
        }
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Set up progress bar animation
        if (progress && duration > 0) {
            const progressBar = notification.querySelector('.notification-progress');
            progressBar.style.transition = `width ${duration}ms linear`;
            
            // Start progress animation after a short delay
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 10);
        }
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        // Return the notification element for reference
        return notification;
    },
    
    // Helper methods for common notification types
    info(message, options = {}) {
        return this.show({ message, type: 'info', ...options });
    },
    
    success(message, options = {}) {
        return this.show({ message, type: 'success', ...options });
    },
    
    warning(message, options = {}) {
        return this.show({ message, type: 'warning', ...options });
    },
    
    error(message, options = {}) {
        return this.show({ message, type: 'error', duration: 8000, ...options });
    },
    
    update(message, options = {}) {
        return this.show({ message, type: 'update', ...options });
    },
    
    // Remove a notification
    remove(notification) {
        if (!notification) return;
        
        // Add fade-out class
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Remove after animation completes
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
            
            // If container is empty, we can remove it
            if (this.container.children.length === 0) {
                // Optionally remove container
                // document.body.removeChild(this.container);
                // this.container = null;
            }
        }, 300); // Match the CSS transition time
    },
    
    // Remove all notifications
    clear() {
        if (!this.container) return;
        
        // Get all notifications
        const notifications = this.container.querySelectorAll('.notification');
        
        // Remove each notification
        notifications.forEach(notification => {
            this.remove(notification);
        });
    },
    
    // CSS styles for notifications
    getStyles() {
        return `
            #notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 320px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .notification {
                background-color: white;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                overflow: hidden;
                display: flex;
                flex-wrap: wrap;
                padding: 12px;
                transform: translateX(120%);
                transition: transform 0.3s ease, opacity 0.3s ease;
                opacity: 0;
                position: relative;
                border-left: 4px solid #ccc;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification.hide {
                transform: translateX(120%);
                opacity: 0;
            }
            
            .notification-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                font-size: 18px;
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 16px;
            }
            
            .notification-message {
                color: #333;
                font-size: 14px;
                line-height: 1.4;
                word-break: break-word;
            }
            
            .notification-action {
                margin-top: 8px;
            }
            
            .notification-action-button {
                background-color: transparent;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .notification-action-button:hover {
                background-color: #f0f0f0;
            }
            
            .notification-close {
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.2s;
                font-size: 12px;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .notification-progress-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background-color: rgba(0, 0, 0, 0.1);
            }
            
            .notification-progress {
                height: 100%;
                width: 100%;
                transition: width linear;
            }
            
            /* Type-specific styles */
            .notification-info {
                border-left-color: #17a2b8;
            }
            
            .notification-info .notification-icon {
                color: #17a2b8;
            }
            
            .notification-info .notification-progress {
                background-color: #17a2b8;
            }
            
            .notification-success {
                border-left-color: #28a745;
            }
            
            .notification-success .notification-icon {
                color: #28a745;
            }
            
            .notification-success .notification-progress {
                background-color: #28a745;
            }
            
            .notification-warning {
                border-left-color: #ffc107;
            }
            
            .notification-warning .notification-icon {
                color: #ffc107;
            }
            
            .notification-warning .notification-progress {
                background-color: #ffc107;
            }
            
            .notification-error {
                border-left-color: #dc3545;
            }
            
            .notification-error .notification-icon {
                color: #dc3545;
            }
            
            .notification-error .notification-progress {
                background-color: #dc3545;
            }
            
            .notification-update {
                border-left-color: #6f42c1;
            }
            
            .notification-update .notification-icon {
                color: #6f42c1;
            }
            
            .notification-update .notification-progress {
                background-color: #6f42c1;
            }
            
            /* Media query for mobile devices */
            @media (max-width: 480px) {
                #notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
    }
}; 