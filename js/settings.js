// Settings Management
import { elements } from './ui.js';
import { getAllModels, populateModelSelector } from './models.js';
import { applyUISettings } from './ui.js';

let allowedModels = [];
const defaultUISettings = { theme: 'light', textSize: 100 };

export async function loadModelSettings() {
    console.log("Loading model settings...");
    try {
        if (!puter.kv) throw new Error("KV missing.");
        const savedModelsString = await puter.kv.get('settings_models');
        if (savedModelsString) {
            allowedModels = JSON.parse(savedModelsString);
            console.log("Loaded allowed models from KV:", allowedModels);
        } else {
            // Default: allow all models if nothing saved
            allowedModels = getAllModels();
            console.log("No saved models found, defaulting to all models.");
        }
    } catch (error) {
        console.error("Error loading model settings, defaulting to all:", error);
        allowedModels = getAllModels();
    }

    // Update UI with loaded settings
    if (elements.modelSelector) {
        populateModelSelector(elements.modelSelector, allowedModels);
    }

    return allowedModels;
}

export async function saveModelSettings(selectedModels) {
    const { settingsModelsStatus } = elements;
    if (!puter.kv || !settingsModelsStatus) return;

    settingsModelsStatus.textContent = 'Saving...';
    settingsModelsStatus.style.color = 'orange';
    
    try {
        await puter.kv.set('settings_models', JSON.stringify(selectedModels));
        settingsModelsStatus.textContent = 'Model selection saved!';
        settingsModelsStatus.style.color = 'green';
        console.log("Saved allowed models:", selectedModels);
        
        // Update global allowed models
        allowedModels = selectedModels;
        
        // Refresh UI
        await loadModelSettings();
    } catch (error) {
        console.error("Error saving model settings:", error);
        settingsModelsStatus.textContent = 'Error saving settings.';
        settingsModelsStatus.style.color = 'red';
    } finally {
        setTimeout(() => {
            if(settingsModelsStatus) settingsModelsStatus.textContent = '';
        }, 2000);
    }
}

export async function loadUISettings() {
    console.log("Loading UI settings...");
    let loadedSettings = null;
    try {
        if (!puter.kv) throw new Error("KV missing.");
        const savedUISettingsString = await puter.kv.get('settings_ui');
        if (savedUISettingsString) {
            loadedSettings = JSON.parse(savedUISettingsString);
            console.log("Loaded UI settings from KV:", loadedSettings);
        } else {
            console.log("No saved UI settings found, using defaults.");
        }
    } catch (error) {
        console.error("Error loading UI settings, using defaults:", error);
    }
    // Apply loaded settings or defaults
    applyUISettings({ ...defaultUISettings, ...loadedSettings });
}

export async function saveUISettings(settings) {
    const { settingsUIStatus } = elements;
    if (!puter.kv || !settingsUIStatus) return;

    settingsUIStatus.textContent = 'Saving...';
    settingsUIStatus.style.color = 'orange';
    
    try {
        await puter.kv.set('settings_ui', JSON.stringify(settings));
        settingsUIStatus.textContent = 'UI settings saved!';
        settingsUIStatus.style.color = 'green';
        console.log("Saved UI settings:", settings);
    } catch (error) {
        console.error("Error saving UI settings:", error);
        settingsUIStatus.textContent = 'Error saving settings.';
        settingsUIStatus.style.color = 'red';
    } finally {
        setTimeout(() => {
            if(settingsUIStatus) settingsUIStatus.textContent = '';
        }, 2000);
    }
}

export function populateSettingsModelsList() {
    const { settingsModelsList } = elements;
    if (!settingsModelsList) return;
    
    settingsModelsList.innerHTML = '';
    const allModels = getAllModels();

    allModels.forEach(modelId => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'settings-model-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `model-checkbox-${modelId.replace(/[^a-zA-Z0-9]/g, '-')}`;
        checkbox.value = modelId;
        checkbox.checked = allowedModels.includes(modelId);

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        let displayName = modelId;
        if (displayName.includes('/')) displayName = displayName.split('/')[1];
        displayName = displayName.replace(/:free|:thinking|-exp-[\d-]+/g, '');
        label.textContent = displayName;

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        settingsModelsList.appendChild(itemDiv);
    });
    
    console.log("Populated settings model list based on allowed models:", allowedModels);
}

export function setAllModelsChecked(isChecked) {
    const { settingsModelsList } = elements;
    if (!settingsModelsList) return;
    const checkboxes = settingsModelsList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = isChecked);
}

export function getAllowedModels() {
    return allowedModels;
}

export function getDefaultUISettings() {
    return defaultUISettings;
}