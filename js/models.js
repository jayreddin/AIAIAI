// Model Management and Configuration

export const modelGroups = {
    "OpenAI": ['gpt-4o-mini', 'gpt-4o', 'o1', 'o1-mini', 'o1-pro', 'o3', 'o3-mini', 'o4-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview'],
    "Anthropic": ['claude-3-7-sonnet', 'claude-3-5-sonnet'],
    "Google": ['google/gemini-2.5-pro-exp-03-25:free', 'google/gemini-2.5-flash-preview', 'google/gemini-2.5-flash-preview:thinking', 'google/gemini-2.0-flash-lite-001', 'google/gemini-2.0-flash-thinking-exp:free', 'google/gemini-2.0-flash-001', 'google/gemini-2.0-flash-exp:free', 'gemini-2.0-flash', 'gemini-1.5-flash', 'google/gemma-2-27b-it'],
    "Meta": ['meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout', 'meta-llama/llama-3.3-70b-instruct', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'meta-llama/llama-guard-3-8b', 'meta-llama/llama-guard-2-8b'],
    "Mistral": ['mistral-large-latest', 'pixtral-large-latest', 'codestral-latest'],
    "xAI / Grok": ['grok-beta', 'x-ai/grok-3-beta'],
    "DeepSeek": ['deepseek-chat', 'deepseek-reasoner']
};

export function getAllModels() {
    return Object.values(modelGroups).flat();
}

export function populateModelSelector(modelSelector, selectedModel, allowedModels = getAllModels()) {
    if (!modelSelector) { console.error("Model selector missing!"); return; }
    console.log(`Populating main model selector with ${allowedModels.length} models.`);
    modelSelector.innerHTML = '';
    let defaultModelStillAllowed = allowedModels.includes(selectedModel);

    // Add the current selection if it's no longer in the allowed list
    if (!defaultModelStillAllowed) {
        const opt = document.createElement('option');
        opt.value = selectedModel;
        let displayName = typeof selectedModel === 'string' ? selectedModel : String(selectedModel ?? '');
        if (displayName.includes('/')) displayName = displayName.split('/')[1];
        displayName = displayName.replace(/:free|:thinking|-exp-[\d-]+/g, '');
        opt.textContent = `${displayName} (Not in Settings)`;
        opt.selected = true;
        opt.disabled = true;
        modelSelector.appendChild(opt);
        console.warn(`Current model ${selectedModel} not in allowed list, added as disabled.`);
    }

    // Populate with allowed models, grouped
    for (const groupName in modelGroups) {
        const allowedGroupModels = modelGroups[groupName].filter(id => allowedModels.includes(id));
        if (allowedGroupModels.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            allowedGroupModels.forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                let displayName = typeof id === 'string' ? id : String(id ?? '');
                if (displayName.includes('/')) displayName = displayName.split('/')[1];
                displayName = displayName.replace(/:free|:thinking|-exp-[\d-]+/g, '');
                opt.textContent = displayName;
                if (id === selectedModel && defaultModelStillAllowed) opt.selected = true;
                optgroup.appendChild(opt);
            });
            modelSelector.appendChild(optgroup);
        }
    }
}