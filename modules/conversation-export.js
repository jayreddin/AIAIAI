// Conversation Export Module
export const ConversationExport = {
    // Format options
    formats: [
        { id: 'text', name: 'Text File (.txt)', mime: 'text/plain', ext: '.txt' },
        { id: 'markdown', name: 'Markdown (.md)', mime: 'text/markdown', ext: '.md' },
        { id: 'html', name: 'HTML Document (.html)', mime: 'text/html', ext: '.html' },
        { id: 'json', name: 'JSON (.json)', mime: 'application/json', ext: '.json' },
        { id: 'pdf', name: 'PDF Document (.pdf)', mime: 'application/pdf', ext: '.pdf' }
    ],
    
    // Generate export UI for the popup
    createExportUI() {
        const container = document.createElement('div');
        container.className = 'export-container';
        
        // Format selection
        const formatGroup = document.createElement('div');
        formatGroup.className = 'export-format-group';
        
        const formatLabel = document.createElement('label');
        formatLabel.htmlFor = 'export-format';
        formatLabel.textContent = 'Export Format:';
        
        const formatSelect = document.createElement('select');
        formatSelect.id = 'export-format';
        
        this.formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format.id;
            option.textContent = format.name;
            formatSelect.appendChild(option);
        });
        
        formatGroup.appendChild(formatLabel);
        formatGroup.appendChild(formatSelect);
        
        // Include metadata option
        const metadataGroup = document.createElement('div');
        metadataGroup.className = 'export-option-group';
        
        const metadataCheckbox = document.createElement('input');
        metadataCheckbox.type = 'checkbox';
        metadataCheckbox.id = 'export-include-metadata';
        metadataCheckbox.checked = true;
        
        const metadataLabel = document.createElement('label');
        metadataLabel.htmlFor = 'export-include-metadata';
        metadataLabel.textContent = 'Include timestamps and model info';
        
        metadataGroup.appendChild(metadataCheckbox);
        metadataGroup.appendChild(metadataLabel);
        
        // Export button
        const exportButton = document.createElement('button');
        exportButton.id = 'export-button';
        exportButton.className = 'export-button';
        exportButton.textContent = 'Export Conversation';
        
        container.appendChild(formatGroup);
        container.appendChild(metadataGroup);
        container.appendChild(exportButton);
        
        return container;
    },
    
    // Attach event listeners
    initializeListeners(chatData, fileName = 'conversation') {
        const exportButton = document.getElementById('export-button');
        const formatSelect = document.getElementById('export-format');
        const metadataCheckbox = document.getElementById('export-include-metadata');
        
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const format = formatSelect.value;
                const includeMetadata = metadataCheckbox.checked;
                this.exportConversation(chatData, format, includeMetadata, fileName);
            });
        }
    },
    
    // Main export function
    exportConversation(chatData, format, includeMetadata, fileName) {
        let content;
        let mimeType;
        let fileExtension;
        
        // Find the format info
        const formatInfo = this.formats.find(f => f.id === format);
        if (!formatInfo) {
            console.error('Invalid export format:', format);
            return;
        }
        
        mimeType = formatInfo.mime;
        fileExtension = formatInfo.ext;
        
        // Generate content based on format
        switch (format) {
            case 'text':
                content = this.generateTextExport(chatData, includeMetadata);
                break;
            case 'markdown':
                content = this.generateMarkdownExport(chatData, includeMetadata);
                break;
            case 'html':
                content = this.generateHtmlExport(chatData, includeMetadata);
                break;
            case 'json':
                content = this.generateJsonExport(chatData, includeMetadata);
                break;
            case 'pdf':
                this.generatePdfExport(chatData, includeMetadata, fileName);
                return; // PDF generation is handled separately
            default:
                console.error('Unsupported export format:', format);
                return;
        }
        
        // Trigger download
        this.downloadFile(content, `${fileName}${fileExtension}`, mimeType);
    },
    
    // Generate text export
    generateTextExport(chatData, includeMetadata) {
        let output = 'PUTER AI CHAT CONVERSATION\n';
        output += '===========================\n\n';
        
        if (includeMetadata && chatData.metadata) {
            output += `Date: ${new Date().toLocaleString()}\n`;
            output += `Model: ${chatData.metadata.model || 'Unknown'}\n\n`;
        }
        
        chatData.messages.forEach(msg => {
            const sender = msg.sender === 'ai' ? 'AI' : 'User';
            
            if (includeMetadata && msg.timestamp) {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                output += `[${time}] ${sender}:\n`;
            } else {
                output += `${sender}:\n`;
            }
            
            output += `${msg.content}\n\n`;
        });
        
        return output;
    },
    
    // Generate markdown export
    generateMarkdownExport(chatData, includeMetadata) {
        let output = '# Puter AI Chat Conversation\n\n';
        
        if (includeMetadata && chatData.metadata) {
            output += `**Date:** ${new Date().toLocaleString()}\n`;
            output += `**Model:** ${chatData.metadata.model || 'Unknown'}\n\n`;
            output += '---\n\n';
        }
        
        chatData.messages.forEach(msg => {
            const sender = msg.sender === 'ai' ? '🤖 **AI**' : '👤 **User**';
            
            if (includeMetadata && msg.timestamp) {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                output += `### ${sender} *(${time})*\n\n`;
            } else {
                output += `### ${sender}\n\n`;
            }
            
            output += `${msg.content}\n\n`;
            output += '---\n\n';
        });
        
        return output;
    },
    
    // Generate HTML export
    generateHtmlExport(chatData, includeMetadata) {
        let messagesHtml = '';
        
        chatData.messages.forEach(msg => {
            const sender = msg.sender === 'ai' ? 'AI' : 'User';
            const colorClass = msg.sender === 'ai' ? 'ai-message' : 'user-message';
            
            let timeHtml = '';
            if (includeMetadata && msg.timestamp) {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                timeHtml = `<span class="message-time">${time}</span>`;
            }
            
            messagesHtml += `
                <div class="message ${colorClass}">
                    <div class="message-header">
                        <span class="message-sender">${sender}</span>
                        ${timeHtml}
                    </div>
                    <div class="message-content">
                        ${this.formatHtmlContent(msg.content)}
                    </div>
                </div>
            `;
        });
        
        let metadataHtml = '';
        if (includeMetadata && chatData.metadata) {
            metadataHtml = `
                <div class="metadata">
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Model:</strong> ${chatData.metadata.model || 'Unknown'}</p>
                </div>
            `;
        }
        
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Puter AI Chat Conversation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .message { padding: 15px; margin-bottom: 15px; border-radius: 10px; }
                    .ai-message { background-color: #f0f7ff; border-left: 4px solid #0078d4; }
                    .user-message { background-color: #f0f0f0; border-left: 4px solid #4a4a4a; }
                    .message-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
                    .message-sender { color: #333; }
                    .message-time { color: #777; font-size: 0.9em; }
                    .message-content { white-space: pre-wrap; }
                    code { background: #272822; color: #f8f8f2; display: block; padding: 10px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h1>Puter AI Chat Conversation</h1>
                ${metadataHtml}
                <div class="conversation">
                    ${messagesHtml}
                </div>
            </body>
            </html>
        `;
    },
    
    // Format HTML content with code highlights
    formatHtmlContent(content) {
        // Simple code block detection
        return content.replace(/```([\s\S]*?)```/g, '<code>$1</code>');
    },
    
    // Generate JSON export
    generateJsonExport(chatData, includeMetadata) {
        let exportData = {
            app: 'Puter AI Chat',
            date: new Date().toISOString(),
            messages: []
        };
        
        if (includeMetadata && chatData.metadata) {
            exportData.metadata = chatData.metadata;
        }
        
        chatData.messages.forEach(msg => {
            let exportMessage = {
                role: msg.sender,
                content: msg.content
            };
            
            if (includeMetadata && msg.timestamp) {
                exportMessage.timestamp = msg.timestamp;
            }
            
            exportData.messages.push(exportMessage);
        });
        
        return JSON.stringify(exportData, null, 2);
    },
    
    // Generate PDF export (using HTML conversion)
    generatePdfExport(chatData, includeMetadata, fileName) {
        // First create HTML content
        const htmlContent = this.generateHtmlExport(chatData, includeMetadata);
        
        // Create a hidden iframe to render HTML
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        document.body.appendChild(iframe);
        
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(htmlContent);
        iframe.contentWindow.document.close();
        
        // Wait for the iframe content to load then print to PDF
        setTimeout(() => {
            // Use the iframe's print functionality which allows saving as PDF
            iframe.contentWindow.print();
            
            // Remove the iframe after a delay
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    },
    
    // Utility to trigger file download
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}; 