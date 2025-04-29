// OCR Feature Logic
import { elements } from '../ui.js';

let ocrSelectedFile = null;
let ocrListenersAdded = false;

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

export function initializeOcrPopup() {
    if (ocrListenersAdded) return;
    const { ocrUploadBtn, ocrFileInput, ocrExtractBtn, ocrCopyBtn, ocrThumbnailArea, ocrResultText, ocrStatus } = elements;
    if (!ocrUploadBtn || !ocrFileInput || !ocrExtractBtn || !ocrCopyBtn || !ocrThumbnailArea || !ocrResultText || !ocrStatus) {
        console.error("OCR UI elements missing!");
        return;
    }
    console.log("Initializing OCR listeners.");
    ocrUploadBtn.addEventListener('click', () => ocrFileInput.click());
    ocrFileInput.addEventListener('change', handleOcrFileSelect);
    ocrExtractBtn.addEventListener('click', handleOcrExtract);
    ocrCopyBtn.addEventListener('click', () => {
        if (!ocrResultText.value) return;
        navigator.clipboard.writeText(ocrResultText.value).then(() => {
            const originalText = ocrCopyBtn.innerHTML;
            ocrCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { if (ocrCopyBtn) ocrCopyBtn.innerHTML = originalText; }, 1500);
        }).catch(err => console.error('OCR Copy failed: ', err));
    });
    ocrListenersAdded = true;
    console.log("OCR listeners added.");
}

async function handleOcrFileSelect(event) {
    const { ocrFileInput, ocrThumbnailArea, ocrExtractBtn, ocrResultText, ocrCopyBtn, ocrStatus } = elements;
    const file = event.target.files?.[0];
    if (!file) { clearOcrSelection(); return; }
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.'); clearOcrSelection(); return;
    }
    ocrSelectedFile = file;
    try {
        const dataUrl = await fileToDataURL(file);
        ocrThumbnailArea.innerHTML = '';
        const img = document.createElement('img');
        img.src = dataUrl; img.className = 'ocr-thumbnail-img'; img.alt = 'Selected Image';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'ocr-remove-thumb-btn'; removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Remove Image'; removeBtn.onclick = clearOcrSelection;
        ocrThumbnailArea.append(img, removeBtn);
        ocrExtractBtn.disabled = false; ocrResultText.value = '';
        ocrCopyBtn.disabled = true; ocrStatus.style.display = 'none';
    } catch (error) {
        console.error("FileReader error:", error); alert("Error reading file for thumbnail.");
        clearOcrSelection();
    }
}

function clearOcrSelection() {
    const { ocrFileInput, ocrThumbnailArea, ocrExtractBtn, ocrResultText, ocrCopyBtn, ocrStatus } = elements;
    console.log("Clearing OCR selection.");
    ocrSelectedFile = null;
    if (ocrFileInput) ocrFileInput.value = '';
    if (ocrThumbnailArea) ocrThumbnailArea.innerHTML = '';
    if (ocrExtractBtn) ocrExtractBtn.disabled = true;
    if (ocrResultText) ocrResultText.value = '';
    if (ocrCopyBtn) ocrCopyBtn.disabled = true;
    if (ocrStatus) ocrStatus.style.display = 'none';
}

async function handleOcrExtract() {
    const { ocrExtractBtn, ocrResultText, ocrCopyBtn, ocrStatus } = elements;
    if (!ocrSelectedFile) { alert("Select image first."); return; }
    if (!ocrExtractBtn || !ocrResultText || !ocrCopyBtn || !ocrStatus) { console.error("OCR UI elements missing for extraction."); return; }
    ocrExtractBtn.disabled = true; ocrCopyBtn.disabled = true;
    ocrStatus.textContent = 'Reading image data...'; ocrStatus.style.color = '#6c757d';
    ocrStatus.style.display = 'block'; ocrResultText.value = '';
    try {
        if (typeof puter === 'undefined' || !puter.ai?.img2txt) throw new Error("img2txt missing.");
        console.log(`Requesting OCR for file: ${ocrSelectedFile.name}`);
        ocrStatus.textContent = 'Extracting text...';
        const extractedText = await puter.ai.img2txt(ocrSelectedFile);
        if (typeof extractedText === 'string') {
            ocrResultText.value = extractedText;
            ocrCopyBtn.disabled = !extractedText;
            ocrStatus.style.display = 'none';
            console.log("OCR successful.");
        } else { throw new Error("API did not return valid text."); }
    } catch (error) {
        console.error("Error during OCR extraction:", error);
        ocrResultText.value = ''; ocrStatus.textContent = `Error: ${error.message || 'Unknown OCR error'}`;
        ocrStatus.style.color = 'red'; ocrStatus.style.display = 'block';
    } finally { ocrExtractBtn.disabled = false; }
}
