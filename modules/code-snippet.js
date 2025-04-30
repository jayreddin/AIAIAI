// Code Snippet Module
export const CodeSnippet = {
    // Language mappings for highlight.js
    languageMappings: {
        'javascript': ['js', 'javascript', 'node'],
        'typescript': ['ts', 'typescript'],
        'python': ['py', 'python'],
        'html': ['html', 'htm'],
        'css': ['css'],
        'java': ['java'],
        'csharp': ['cs', 'csharp', 'c#'],
        'c': ['c'],
        'cpp': ['cpp', 'c++'],
        'go': ['go', 'golang'],
        'rust': ['rs', 'rust'],
        'ruby': ['rb', 'ruby'],
        'php': ['php'],
        'swift': ['swift'],
        'kotlin': ['kt', 'kotlin'],
        'sql': ['sql'],
        'json': ['json'],
        'xml': ['xml'],
        'yaml': ['yml', 'yaml'],
        'bash': ['sh', 'bash', 'shell', 'zsh'],
        'powershell': ['ps1', 'powershell'],
        'markdown': ['md', 'markdown']
    },
    
    // Initialize code highlighting (load highlight.js)
    async init() {
        // Check if highlight.js is already loaded
        if (window.hljs) {
            console.log('highlight.js is already loaded');
            return true;
        }
        
        try {
            // Create link element for CSS
            const linkEl = document.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css';
            document.head.appendChild(linkEl);
            
            // Create script element for JS
            const scriptEl = document.createElement('script');
            scriptEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';
            
            // Wait for script to load
            const loadPromise = new Promise((resolve, reject) => {
                scriptEl.onload = resolve;
                scriptEl.onerror = reject;
            });
            
            document.head.appendChild(scriptEl);
            await loadPromise;
            
            console.log('highlight.js loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load highlight.js:', error);
            return false;
        }
    },
    
    // Process a DOM element to find and enhance code blocks
    processElement(element) {
        if (!element) return;
        
        // Find all pre code blocks in the element
        const codeBlocks = element.querySelectorAll('pre > code, code.block');
        if (codeBlocks.length === 0) return;
        
        // Make sure highlight.js is loaded
        if (!window.hljs) {
            console.warn('highlight.js not loaded, trying to initialize...');
            this.init().then(success => {
                if (success) {
                    this.enhanceCodeBlocks(codeBlocks);
                }
            });
            return;
        }
        
        this.enhanceCodeBlocks(codeBlocks);
    },
    
    // Process message text and convert markdown-style code blocks to HTML
    formatMessageWithCodeBlocks(messageText) {
        if (!messageText) return messageText;
        
        // Simple processing for markdown code blocks
        // Format: ```language\ncode\n```
        const formattedText = messageText.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang.trim().toLowerCase() || 'plaintext';
            return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`;
        });
        
        return formattedText;
    },
    
    // Escape HTML special characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Enhance code blocks with syntax highlighting and copy button
    enhanceCodeBlocks(codeBlocks) {
        codeBlocks.forEach(codeBlock => {
            // Skip if already processed
            if (codeBlock.dataset.processed === 'true') return;
            
            // Create wrapper for the code block
            const wrapper = document.createElement('div');
            wrapper.className = 'code-snippet-wrapper';
            
            // Determine language
            let lang = 'plaintext';
            if (codeBlock.className) {
                const langMatch = codeBlock.className.match(/language-(\w+)/);
                if (langMatch && langMatch[1]) {
                    lang = langMatch[1].toLowerCase();
                }
            }
            
            // Add language indicator
            const langIndicator = document.createElement('div');
            langIndicator.className = 'code-language';
            langIndicator.textContent = this.getPrettyLanguageName(lang);
            wrapper.appendChild(langIndicator);
            
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-button';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Copy code';
            copyButton.addEventListener('click', () => this.copyCodeToClipboard(codeBlock, copyButton));
            
            // Create header with lang indicator and copy button
            const header = document.createElement('div');
            header.className = 'code-header';
            header.appendChild(langIndicator);
            header.appendChild(copyButton);
            wrapper.appendChild(header);
            
            // Apply syntax highlighting
            try {
                if (window.hljs) {
                    // Try to detect language if not specified
                    if (lang === 'plaintext' || lang === '') {
                        const result = window.hljs.highlightAuto(codeBlock.textContent);
                        codeBlock.innerHTML = result.value;
                        // Update language indicator if detected
                        if (result.language) {
                            langIndicator.textContent = this.getPrettyLanguageName(result.language);
                        }
                    } else {
                        // Use specified language
                        const highlightedCode = window.hljs.highlight(codeBlock.textContent, {
                            language: this.getNormalizedLanguage(lang),
                            ignoreIllegals: true
                        });
                        codeBlock.innerHTML = highlightedCode.value;
                    }
                }
            } catch (e) {
                console.warn('Error highlighting code:', e);
                // Fallback - just keep the original code
            }
            
            // Replace the code block with the wrapper
            const preParent = codeBlock.parentNode;
            if (preParent.tagName.toLowerCase() === 'pre') {
                // If inside a pre tag
                const container = document.createElement('div');
                container.className = 'code-container';
                container.appendChild(codeBlock.cloneNode(true));
                wrapper.appendChild(container);
                preParent.parentNode.replaceChild(wrapper, preParent);
            } else {
                // If standalone code block
                const container = document.createElement('div');
                container.className = 'code-container';
                container.appendChild(codeBlock.cloneNode(true));
                wrapper.appendChild(container);
                codeBlock.parentNode.replaceChild(wrapper, codeBlock);
            }
            
            // Mark as processed
            codeBlock.dataset.processed = 'true';
        });
    },
    
    // Copy code to clipboard
    copyCodeToClipboard(codeBlock, copyButton) {
        const code = codeBlock.textContent;
        
        navigator.clipboard.writeText(code)
            .then(() => {
                // Visual feedback
                const originalHtml = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyButton.innerHTML = originalHtml;
                    copyButton.classList.remove('copied');
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code:', err);
                copyButton.innerHTML = '<i class="fas fa-times"></i>';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
    },
    
    // Convert language identifier to normalized form for highlight.js
    getNormalizedLanguage(lang) {
        lang = lang.toLowerCase();
        
        // Try to find in mappings
        for (const [hlLang, aliases] of Object.entries(this.languageMappings)) {
            if (aliases.includes(lang)) {
                return hlLang;
            }
        }
        
        // Default to plaintext if not found
        return 'plaintext';
    },
    
    // Get pretty name for language
    getPrettyLanguageName(lang) {
        lang = lang.toLowerCase();
        
        // Special cases
        const prettyNames = {
            'js': 'JavaScript',
            'javascript': 'JavaScript',
            'ts': 'TypeScript',
            'typescript': 'TypeScript',
            'py': 'Python',
            'python': 'Python',
            'html': 'HTML',
            'css': 'CSS',
            'java': 'Java',
            'csharp': 'C#',
            'cs': 'C#',
            'c': 'C',
            'cpp': 'C++',
            'go': 'Go',
            'rust': 'Rust',
            'rb': 'Ruby',
            'ruby': 'Ruby',
            'php': 'PHP',
            'sql': 'SQL',
            'json': 'JSON',
            'md': 'Markdown',
            'markdown': 'Markdown',
            'xml': 'XML',
            'yaml': 'YAML',
            'yml': 'YAML',
            'bash': 'Bash',
            'sh': 'Shell',
            'shell': 'Shell',
            'powershell': 'PowerShell',
            'ps1': 'PowerShell',
            'plaintext': 'Plain Text'
        };
        
        return prettyNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
    }
}; 