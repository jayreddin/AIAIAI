// Chat Backgrounds Module
export const ChatBackgrounds = {
    // Available background types
    types: [
        { id: 'color', name: 'Solid Color' },
        { id: 'gradient', name: 'Gradient' },
        { id: 'pattern', name: 'Pattern' },
        { id: 'image', name: 'Custom Image' }
    ],
    
    // Predefined backgrounds for each type
    presets: {
        color: [
            { id: 'default', name: 'Default', value: '' },
            { id: 'light', name: 'Light', value: '#f0f2f5' },
            { id: 'white', name: 'White', value: '#ffffff' },
            { id: 'soft-blue', name: 'Soft Blue', value: '#e8f0fe' },
            { id: 'beige', name: 'Beige', value: '#f5f5dc' },
            { id: 'mint', name: 'Mint', value: '#e0f7ee' },
            { id: 'lavender', name: 'Lavender', value: '#e6e6fa' },
            { id: 'peach', name: 'Peach', value: '#ffdab9' }
        ],
        gradient: [
            { id: 'blue-purple', name: 'Blue to Purple', value: 'linear-gradient(135deg, #6a85b6 0%, #bac8e0 100%)' },
            { id: 'green-blue', name: 'Green to Blue', value: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
            { id: 'orange-pink', name: 'Orange to Pink', value: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)' },
            { id: 'purple-pink', name: 'Purple to Pink', value: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
            { id: 'blue-teal', name: 'Blue to Teal', value: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
            { id: 'sunset', name: 'Sunset', value: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)' }
        ],
        pattern: [
            { id: 'none', name: 'None', value: 'none' },
            { id: 'dots', name: 'Dots', value: 'radial-gradient(#000 1px, transparent 1px) 0 0 / 20px 20px' },
            { id: 'grid', name: 'Grid', value: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px) 0 0 / 20px 20px' },
            { id: 'stripes', name: 'Stripes', value: 'linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.05) 75%, transparent 75%, transparent) 0 0 / 20px 20px' },
            { id: 'waves', name: 'Waves', value: 'repeating-radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)' }
        ]
    },
    
    // Current background settings
    current: {
        type: 'color',
        value: 'default',
        custom: ''
    },
    
    // Storage key
    storageKey: 'chat_background_settings',
    
    // Elements that will be affected
    targetElements: ['#message-display', 'body'],
    
    // Initialize backgrounds
    init() {
        this.loadSettings();
        this.applyBackground();
    },
    
    // Create UI for background customization
    createBackgroundUI() {
        const container = document.createElement('div');
        container.className = 'background-settings-container';
        
        // Background type selector
        const typeGroup = document.createElement('div');
        typeGroup.className = 'background-type-group';
        
        const typeLabel = document.createElement('label');
        typeLabel.htmlFor = 'background-type';
        typeLabel.textContent = 'Background Type:';
        
        const typeSelect = document.createElement('select');
        typeSelect.id = 'background-type';
        
        this.types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            typeSelect.appendChild(option);
        });
        
        typeGroup.appendChild(typeLabel);
        typeGroup.appendChild(typeSelect);
        
        // Preset selector container (will be populated based on type)
        const presetGroup = document.createElement('div');
        presetGroup.className = 'background-preset-group';
        
        const presetLabel = document.createElement('label');
        presetLabel.htmlFor = 'background-preset';
        presetLabel.textContent = 'Select Background:';
        
        const presetSelect = document.createElement('select');
        presetSelect.id = 'background-preset';
        
        presetGroup.appendChild(presetLabel);
        presetGroup.appendChild(presetSelect);
        
        // Custom color/image input container
        const customGroup = document.createElement('div');
        customGroup.className = 'background-custom-group';
        customGroup.style.display = 'none';
        
        const customLabel = document.createElement('label');
        customLabel.id = 'background-custom-label';
        customLabel.htmlFor = 'background-custom-input';
        customLabel.textContent = 'Custom Value:';
        
        const customColorInput = document.createElement('input');
        customColorInput.type = 'color';
        customColorInput.id = 'background-custom-color';
        customColorInput.className = 'background-custom-input';
        
        const customFileInput = document.createElement('input');
        customFileInput.type = 'file';
        customFileInput.id = 'background-custom-file';
        customFileInput.className = 'background-custom-input';
        customFileInput.accept = 'image/*';
        customFileInput.style.display = 'none';
        
        customGroup.appendChild(customLabel);
        customGroup.appendChild(customColorInput);
        customGroup.appendChild(customFileInput);
        
        // Preview container
        const previewGroup = document.createElement('div');
        previewGroup.className = 'background-preview-group';
        
        const previewLabel = document.createElement('label');
        previewLabel.textContent = 'Preview:';
        
        const preview = document.createElement('div');
        preview.id = 'background-preview';
        preview.className = 'background-preview';
        
        previewGroup.appendChild(previewLabel);
        previewGroup.appendChild(preview);
        
        // Apply button
        const applyButton = document.createElement('button');
        applyButton.id = 'background-apply-button';
        applyButton.className = 'background-apply-button';
        applyButton.textContent = 'Apply Background';
        
        // Add all elements to container
        container.appendChild(typeGroup);
        container.appendChild(presetGroup);
        container.appendChild(customGroup);
        container.appendChild(previewGroup);
        container.appendChild(applyButton);
        
        return container;
    },
    
    // Initialize event listeners for the UI
    initializeListeners() {
        const typeSelect = document.getElementById('background-type');
        const presetSelect = document.getElementById('background-preset');
        const customColorInput = document.getElementById('background-custom-color');
        const customFileInput = document.getElementById('background-custom-file');
        const customLabel = document.getElementById('background-custom-label');
        const customGroup = document.querySelector('.background-custom-group');
        const preview = document.getElementById('background-preview');
        const applyButton = document.getElementById('background-apply-button');
        
        if (!typeSelect || !presetSelect || !preview || !applyButton) {
            console.error('Required background UI elements not found');
            return;
        }
        
        // Set initial values
        typeSelect.value = this.current.type;
        this.populatePresetOptions(typeSelect.value);
        
        // If we have a current custom value and the type is color or image, show it
        if (this.current.custom && (this.current.type === 'color' || this.current.type === 'image')) {
            customGroup.style.display = 'block';
            if (this.current.type === 'color') {
                customColorInput.value = this.current.custom;
                customColorInput.style.display = 'block';
                customFileInput.style.display = 'none';
                customLabel.textContent = 'Custom Color:';
            } else if (this.current.type === 'image') {
                customFileInput.style.display = 'block';
                customColorInput.style.display = 'none';
                customLabel.textContent = 'Custom Image:';
            }
        }
        
        // If current value is in presets, select it
        if (this.current.value !== 'custom') {
            presetSelect.value = this.current.value;
        } else {
            presetSelect.value = 'custom';
        }
        
        // Update preview
        this.updatePreview(preview);
        
        // Type select change event
        typeSelect.addEventListener('change', () => {
            const type = typeSelect.value;
            this.populatePresetOptions(type);
            
            // If type is 'image' show file input, if 'color' show color input
            if (type === 'image') {
                customGroup.style.display = 'block';
                customColorInput.style.display = 'none';
                customFileInput.style.display = 'block';
                customLabel.textContent = 'Custom Image:';
            } else if (type === 'color') {
                customGroup.style.display = 'block';
                customColorInput.style.display = 'block';
                customFileInput.style.display = 'none';
                customLabel.textContent = 'Custom Color:';
            } else {
                customGroup.style.display = 'none';
            }
            
            // Update preview based on the first preset of the selected type
            if (this.presets[type] && this.presets[type].length > 0) {
                this.current.type = type;
                this.current.value = this.presets[type][0].id;
                this.updatePreview(preview);
            }
        });
        
        // Preset select change event
        presetSelect.addEventListener('change', () => {
            const value = presetSelect.value;
            this.current.value = value;
            
            // If "custom" is selected, show custom input
            if (value === 'custom') {
                customGroup.style.display = 'block';
                if (this.current.type === 'color') {
                    customColorInput.style.display = 'block';
                    customFileInput.style.display = 'none';
                } else if (this.current.type === 'image') {
                    customFileInput.style.display = 'block';
                    customColorInput.style.display = 'none';
                }
            } else {
                // Otherwise, hide custom input
                customGroup.style.display = 'none';
            }
            
            this.updatePreview(preview);
        });
        
        // Custom color input change event
        customColorInput.addEventListener('input', () => {
            this.current.custom = customColorInput.value;
            this.updatePreview(preview);
        });
        
        // Custom file input change event
        customFileInput.addEventListener('change', () => {
            const file = customFileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.current.custom = e.target.result;
                    this.updatePreview(preview);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Apply button click event
        applyButton.addEventListener('click', () => {
            this.saveSettings();
            this.applyBackground();
            
            // If we're inside a popup, close it
            const closeButton = document.querySelector('.close-popup-btn');
            if (closeButton) {
                closeButton.click();
            }
        });
    },
    
    // Populate preset options based on selected type
    populatePresetOptions(type) {
        const presetSelect = document.getElementById('background-preset');
        if (!presetSelect) return;
        
        // Clear existing options
        presetSelect.innerHTML = '';
        
        // Add presets for the selected type
        if (this.presets[type]) {
            this.presets[type].forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
            
            // Add custom option for color and image types
            if (type === 'color' || type === 'image') {
                const customOption = document.createElement('option');
                customOption.value = 'custom';
                customOption.textContent = 'Custom';
                presetSelect.appendChild(customOption);
            }
        }
    },
    
    // Update the preview element
    updatePreview(previewElement) {
        if (!previewElement) return;
        
        const style = this.getBackgroundStyle();
        previewElement.style.background = style.background;
        previewElement.style.backgroundSize = style.backgroundSize;
        previewElement.style.backgroundRepeat = style.backgroundRepeat;
    },
    
    // Get background style based on current settings
    getBackgroundStyle() {
        const type = this.current.type;
        const value = this.current.value;
        let background = '';
        let backgroundSize = '';
        let backgroundRepeat = '';
        
        switch (type) {
            case 'color':
                if (value === 'custom') {
                    background = this.current.custom || '#f0f2f5';
                } else {
                    const preset = this.presets.color.find(p => p.id === value);
                    background = preset ? preset.value : '#f0f2f5';
                }
                break;
                
            case 'gradient':
                const gradientPreset = this.presets.gradient.find(p => p.id === value);
                background = gradientPreset ? gradientPreset.value : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                break;
                
            case 'pattern':
                const patternPreset = this.presets.pattern.find(p => p.id === value);
                if (patternPreset && patternPreset.id !== 'none') {
                    background = patternPreset.value;
                    backgroundRepeat = 'repeat';
                }
                break;
                
            case 'image':
                if (value === 'custom' && this.current.custom) {
                    background = `url('${this.current.custom}')`;
                    backgroundSize = 'cover';
                    backgroundRepeat = 'no-repeat';
                }
                break;
        }
        
        return { background, backgroundSize, backgroundRepeat };
    },
    
    // Apply background to target elements
    applyBackground() {
        const style = this.getBackgroundStyle();
        
        this.targetElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element) {
                    element.style.background = style.background;
                    element.style.backgroundSize = style.backgroundSize;
                    element.style.backgroundRepeat = style.backgroundRepeat;
                }
            });
        });
    },
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.current));
        } catch (e) {
            console.error('Failed to save background settings:', e);
        }
    },
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.current = { ...this.current, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load background settings:', e);
        }
    },
    
    // Reset to default background
    resetToDefault() {
        this.current = {
            type: 'color',
            value: 'default',
            custom: ''
        };
        this.saveSettings();
        this.applyBackground();
    }
}; 