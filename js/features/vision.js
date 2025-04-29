// Vision Feature Logic
import { elements } from '../ui.js';
import { speakMessage } from '../chat.js';

let visionStream = null;
let lastCapturedFrameDataUrl = null;
let visionCanvas = null;
let visionListenersAdded = false;

export function initializeVisionPopup() {
    if (visionListenersAdded) return;
    const {
        visionEnableCamBtn, visionVideoContainer, visionVideoPreview, visionControls,
        visionDescribeBtn, visionStopCamBtn, visionStatus, visionResultsText,
        visionActions, visionClearBtn, visionSpeakBtn, visionCopyBtn, visionSaveImgBtn
    } = elements;
    const elementsArr = [
        visionEnableCamBtn, visionVideoContainer, visionVideoPreview, visionControls,
        visionDescribeBtn, visionStopCamBtn, visionStatus, visionResultsText,
        visionActions, visionClearBtn, visionSpeakBtn, visionCopyBtn, visionSaveImgBtn
    ];
    if (elementsArr.some(el => !el)) { console.error("Vision UI elements missing!"); return; }
    console.log("Initializing Vision listeners.");
    visionEnableCamBtn.addEventListener('click', startVisionCamera);
    visionStopCamBtn.addEventListener('click', stopVisionCamera);
    visionDescribeBtn.addEventListener('click', describeVisionFrame);
    visionClearBtn.addEventListener('click', clearVisionResults);
    visionSpeakBtn.addEventListener('click', () => {
        if (visionResultsText.value) speakMessage(visionResultsText.value, visionSpeakBtn);
    });
    visionCopyBtn.addEventListener('click', () => {
        if (visionResultsText.value) navigator.clipboard.writeText(visionResultsText.value)
            .then(() => console.log("Vision text copied."))
            .catch(err => console.error("Vision copy failed:", err));
    });
    visionSaveImgBtn.addEventListener('click', saveVisionImage);
    visionListenersAdded = true;
    console.log("Vision listeners added.");
}

async function startVisionCamera() {
    const { visionVideoPreview, visionEnableCamBtn, visionVideoContainer, visionControls, visionStatus } = elements;
    if (!navigator.mediaDevices?.getUserMedia) { alert('Camera API not supported.'); return; }
    if (!visionVideoPreview || !visionEnableCamBtn || !visionVideoContainer || !visionControls || !visionStatus) return;
    visionStatus.textContent = 'Requesting camera access...';
    visionStatus.style.display = 'block'; visionStatus.style.color = '#6c757d';
    visionEnableCamBtn.disabled = true;
    try {
        visionStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        console.log("Camera stream obtained.");
        visionVideoPreview.srcObject = visionStream;
        visionVideoPreview.onloadedmetadata = () => {
            visionVideoPreview.play().catch(e => console.error("Video play failed:", e));
            visionEnableCamBtn.style.display = 'none';
            visionVideoContainer.style.display = 'block';
            visionControls.style.display = 'block';
            visionStatus.style.display = 'none';
            clearVisionResults();
            console.log("Camera preview started.");
        };
        visionVideoPreview.onerror = (e) => {
            console.error("Video preview error:", e);
            visionStatus.textContent = `Video error: ${e.message || 'Unknown'}`;
            visionStatus.style.color = 'red';
            stopVisionCamera();
        };
    } catch (err) {
        console.error("Error accessing camera:", err);
        visionStatus.textContent = `Error accessing camera: ${err.name}. Check permissions.`;
        visionStatus.style.color = 'red';
        visionEnableCamBtn.disabled = false;
    }
}

function stopVisionCamera() {
    const { visionVideoPreview, visionEnableCamBtn, visionVideoContainer, visionControls, visionActions, visionStatus, visionResultsText } = elements;
    if (visionStream) {
        visionStream.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped.");
    }
    visionStream = null;
    lastCapturedFrameDataUrl = null;
    if (visionVideoPreview) visionVideoPreview.srcObject = null;
    if (visionEnableCamBtn) visionEnableCamBtn.style.display = 'block';
    if (visionVideoContainer) visionVideoContainer.style.display = 'none';
    if (visionControls) visionControls.style.display = 'none';
    if (visionActions) visionActions.style.display = 'none';
    if (visionStatus) visionStatus.style.display = 'none';
    if (visionResultsText) visionResultsText.value = '';
    if (visionEnableCamBtn) visionEnableCamBtn.disabled = false;
}

async function describeVisionFrame() {
    const { visionVideoPreview, visionStream: _vs, visionDescribeBtn, visionResultsText, visionStatus, visionActions, visionSpeakBtn, visionCopyBtn, visionSaveImgBtn } = elements;
    if (!visionVideoPreview || !visionStream || !visionDescribeBtn || !visionResultsText || !visionStatus || !visionActions) {
        console.error("Vision elements missing for description."); return;
    }
    if (visionVideoPreview.readyState < visionVideoPreview.HAVE_CURRENT_DATA) {
        console.warn("Video not ready for capture."); visionStatus.textContent = 'Video not ready...';
        visionStatus.style.display = 'block'; return;
    }
    visionDescribeBtn.disabled = true;
    visionStatus.textContent = 'Capturing frame...'; visionStatus.style.color = '#6c757d';
    visionStatus.style.display = 'block';
    visionResultsText.value = ''; visionActions.style.display = 'none';
    try {
        if (!visionCanvas) visionCanvas = document.createElement('canvas');
        const videoWidth = visionVideoPreview.videoWidth;
        const videoHeight = visionVideoPreview.videoHeight;
        if (videoWidth === 0 || videoHeight === 0) { throw new Error("Video dimensions are zero."); }
        visionCanvas.width = videoWidth;
        visionCanvas.height = videoHeight;
        const context = visionCanvas.getContext('2d');
        context.drawImage(visionVideoPreview, 0, 0, videoWidth, videoHeight);
        lastCapturedFrameDataUrl = visionCanvas.toDataURL('image/jpeg', 0.9);
        console.log("Frame captured (JPEG data URL length):", lastCapturedFrameDataUrl.length);

        visionStatus.textContent = 'Asking AI to describe...';
        if (typeof puter === 'undefined' || !puter.ai?.chat) throw new Error("Puter chat missing.");

        const visionModelToUse = 'gpt-4o-mini';
        console.log(`Sending frame to Vision model: ${visionModelToUse}`);

        const response = await puter.ai.chat("Describe this image in detail.", lastCapturedFrameDataUrl, { model: visionModelToUse });

        console.log("Vision response received:", response);
        let aiText = "Sorry, couldn't get description.";
        if (response && typeof response === 'string') aiText = response;
        else if (response?.text) aiText = response.text;
        else if (response?.message?.content) aiText = response.message.content;
        else if (response?.error) aiText = `Error: ${response.error.message || response.error}`;
        else console.warn("Unexpected vision response:", response);

        visionResultsText.value = aiText;
        visionStatus.style.display = 'none';
        visionActions.style.display = 'block';
        visionSpeakBtn.disabled = !aiText;
        visionCopyBtn.disabled = !aiText;
        visionSaveImgBtn.disabled = false;
    } catch (error) {
        console.error("Error describing vision frame:", error);
        visionStatus.textContent = `Error: ${error.message || 'Unknown error'}`;
        visionStatus.style.color = 'red';
        lastCapturedFrameDataUrl = null;
        visionSaveImgBtn.disabled = true;
    } finally {
        visionDescribeBtn.disabled = false;
    }
}

function clearVisionResults() {
    const { visionResultsText, visionActions, visionStatus, visionSpeakBtn, visionCopyBtn } = elements;
    if (visionResultsText) visionResultsText.value = '';
    if (visionActions) visionActions.style.display = 'none';
    if (visionStatus) visionStatus.style.display = 'none';
    if (visionSpeakBtn) visionSpeakBtn.disabled = true;
    if (visionCopyBtn) visionCopyBtn.disabled = true;
}

function saveVisionImage() {
    if (!lastCapturedFrameDataUrl) { alert("No image captured to save."); return; }
    const link = document.createElement('a');
    link.href = lastCapturedFrameDataUrl;
    link.download = `vision_capture_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}