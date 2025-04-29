// Image Generation Feature Logic
import { elements } from '../ui.js';

let imgGenListenersAdded = false;
let currentImageGenMode = 'basic';

export function initializeImageGenPopup() {
    if (imgGenListenersAdded) return;
    const {
        imgGenGenerateBtn, imgGenPrompt, imgGenModeButtonsContainer, imgGenModePanelsContainer,
        imageModalSaveBtn, imageModalCloseBtn, imageModalBackdrop,
        storyGenerateBtn, storyDownloadBtn,
        cardGenerateImgBtn, cardSearchImgBtn, cardGenerateBtn, cardDownloadBtn, cardSizeSelect,
        comicGenerateBtn, comicDownloadBtn
    } = elements;

    const elementsArr = [
        imgGenGenerateBtn, imgGenPrompt, imgGenModeButtonsContainer, imgGenModePanelsContainer,
        imageModalSaveBtn, imageModalCloseBtn, imageModalBackdrop,
        storyGenerateBtn, storyDownloadBtn,
        cardGenerateImgBtn, cardSearchImgBtn, cardGenerateBtn, cardDownloadBtn, cardSizeSelect,
        comicGenerateBtn, comicDownloadBtn
    ];
    if (elementsArr.some(el => !el)) {
        console.warn("Some Img Gen elements missing."); return;
    }
    console.log("Initializing Img Gen listeners.");

    // Basic Mode
    imgGenGenerateBtn.addEventListener('click', handleBasicImageGeneration);
    imgGenPrompt.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBasicImageGeneration(); } });

    // Story Mode
    storyGenerateBtn.addEventListener('click', handleStoryGeneration);
    storyDownloadBtn.addEventListener('click', handleStoryDownload);

    // Card Mode
    cardGenerateImgBtn.addEventListener('click', handleCardImageGeneration);
    cardSearchImgBtn.addEventListener('click', handleCardImageSearch);
    cardGenerateBtn.addEventListener('click', handleCardGeneration);
    cardDownloadBtn.addEventListener('click', handleCardDownload);
    cardSizeSelect.addEventListener('change', (e) => {
        if(elements.cardCustomSizeInputs) elements.cardCustomSizeInputs.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    // Comic Mode
    comicGenerateBtn.addEventListener('click', handleComicGeneration);
    comicDownloadBtn.addEventListener('click', handleComicDownload);

    // Mode Switching
    const modeButtons = imgGenModeButtonsContainer.querySelectorAll('.img-gen-mode-btn');
    const modePanels = imgGenModePanelsContainer.querySelectorAll('.img-gen-mode-panel');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            if (button.disabled) return;
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            modePanels.forEach(panel => panel.classList.toggle('active', panel.id === `img-gen-${mode}-mode`));
            document.getElementById('img-gen-basic-results-area').style.display = (mode === 'basic') ? 'block' : 'none';
            currentImageGenMode = mode;
            console.log("Img Gen mode switched to:", mode);
        });
    });

    // Image Modal
    imageModalCloseBtn.addEventListener('click', closeImageModal);
    imageModalBackdrop.addEventListener('click', closeImageModal);
    imageModalSaveBtn.addEventListener('click', saveExpandedImage);

    imgGenListenersAdded = true;
    console.log("Img Gen listeners added.");
}

// Basic Image Generation
async function handleBasicImageGeneration() {
    const { imgGenPrompt, imgGenGenerateBtn, imgGenResults, imgGenLoading, imgGenError } = elements;
    if (!imgGenPrompt || !imgGenGenerateBtn || !imgGenResults || !imgGenLoading || !imgGenError) {
        console.error("Img Gen Basic UI elements missing!"); return;
    }
    const prompt = imgGenPrompt.value.trim();
    if (!prompt) { imgGenError.textContent = "Enter prompt."; imgGenError.style.display = 'block'; return; }
    imgGenGenerateBtn.disabled = true;
    imgGenError.style.display = 'none';
    imgGenLoading.style.display = 'block';
    imgGenResults.innerHTML = '';
    try {
        if (typeof puter === 'undefined' || !puter.ai?.txt2img) throw new Error("txt2img missing.");
        console.log("Requesting img gen (Basic):", prompt);
        const imageElement = await puter.ai.txt2img(prompt, true);
        if (imageElement?.tagName === 'IMG') {
            console.log("Img generated.");
            displayGeneratedImage(imageElement, prompt, imgGenResults);
        } else { throw new Error("Invalid image element returned."); }
    } catch (error) {
        console.error("Error generating image:", error);
        imgGenError.textContent = `Error: ${error.message || 'Unknown'}`;
        imgGenError.style.display = 'block';
    } finally {
        imgGenLoading.style.display = 'none';
        imgGenGenerateBtn.disabled = false;
    }
}

// Helper for displaying generated images
function displayGeneratedImage(imageElement, prompt = "generated", targetContainer) {
    if (!targetContainer) { console.error("Target container missing for image display"); return; }
    const container = document.createElement('div');
    container.className = 'img-gen-thumbnail-container';
    imageElement.className = 'img-gen-thumbnail';
    imageElement.alt = prompt;
    imageElement.onclick = () => expandImage(imageElement.src);
    const saveButton = document.createElement('button');
    saveButton.className = 'img-gen-save-btn';
    saveButton.title = 'Save Image';
    saveButton.innerHTML = '<i class="fas fa-save"></i>';
    saveButton.onclick = (e) => {
        e.stopPropagation(); saveImageFromDataUrl(imageElement.src, prompt);
    };
    container.append(imageElement, saveButton);
    targetContainer.prepend(container);
}

// Modal and Save helpers
function expandImage(imageSrc) {
    const { imageModal, imageModalBackdrop, expandedImage } = elements;
    if (!imageModal || !imageModalBackdrop || !expandedImage) { console.error("Modal elements missing."); return; }
    expandedImage.src = imageSrc;
    expandedImage.alt = "Expanded Image";
    imageModal.style.display = 'block';
    imageModalBackdrop.style.display = 'block';
}

function closeImageModal() {
    const { imageModal, imageModalBackdrop, expandedImage } = elements;
    if (imageModal && imageModalBackdrop) {
        imageModal.style.display = 'none';
        imageModalBackdrop.style.display = 'none';
        expandedImage.src = '#';
        expandedImage.alt = '';
    }
}

function saveImageFromDataUrl(dataUrl, prompt) {
    const link = document.createElement('a');
    link.href = dataUrl;
    const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveExpandedImage() {
    const { expandedImage } = elements;
    if (!expandedImage || !expandedImage.src || expandedImage.src.endsWith('#')) return;
    saveImageFromDataUrl(expandedImage.src, expandedImage.alt || `expanded_${Date.now()}`);
}

// Placeholders for other modes (to be implemented as needed)
function handleStoryGeneration() {}
function handleStoryDownload() {}
function handleCardImageGeneration() {}
function handleCardImageSearch() {}
function handleCardGeneration() {}
function handleCardDownload() {}
function handleComicGeneration() {}
function handleComicDownload() {}