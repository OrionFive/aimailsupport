// Get references to the DOM elements
const dialogLabel = document.getElementById('dialog-label') as HTMLLabelElement;
const dialogInput = document.getElementById('dialog-input') as HTMLTextAreaElement;
const submitButton = document.getElementById('dialog-submit-button') as HTMLButtonElement;
const cancelButton = document.getElementById('dialog-cancel-button') as HTMLButtonElement;

let promptId: string | null = null; // To store the prompt ID from URL

// Function to parse URL query parameters
function getUrlParameter(name: string): string | null {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to send response back to background script
async function sendResponse(status: 'submitted' | 'cancelled', value?: string) {
    if (!promptId) {
        console.error('Cannot send response, promptId is missing.');
        alert('Internal error: Missing prompt identifier.');
        return;
    }
    if (!browser?.runtime) {
        console.error('browser.runtime API is not available.');
        alert('Error: Could not communicate with the background script.');
        return;
    }

    try {
        await browser.runtime.sendMessage({
            type: 'dialogResponse',
            status: status,
            promptId: promptId,
            value: value // Will be undefined for cancelled status
        });
        window.close();
    } catch (error) {
        console.error('Error sending dialog response message:', error);
        alert(`Error sending response: ${(error as Error).message}`);
    }
}

// --- Event Listeners ---

submitButton.addEventListener('click', async () => {
    const inputValue = dialogInput.value.trim();
    if (inputValue) {
        sendResponse('submitted', inputValue);
    } else {
        dialogInput.focus();
        alert('Please enter some input.'); // Or customize this feedback
    }
});

cancelButton.addEventListener('click', () => {
    // Just close the window; background script handles cancellation via onRemoved
    window.close();
});

window.addEventListener('DOMContentLoaded', () => {
    // Parse URL parameters
    promptId = getUrlParameter('promptId');
    const title = getUrlParameter('title') || 'Input Required';
    const label = getUrlParameter('label') || 'Enter value:';
    const buttonText = getUrlParameter('buttonText') || 'Submit';
    const defaultValue = getUrlParameter('defaultValue') || '';

    // Configure the dialog
    document.title = title;
    if (dialogLabel) dialogLabel.textContent = label;
    if (dialogInput) dialogInput.value = defaultValue;
    if (submitButton) submitButton.textContent = buttonText;

    if (dialogInput) {
        dialogInput.focus();
    }

    // Attempt to resize and center the window
    resizeAndCenterWindow();
});

// --- Window Resizing/Centering --- (Keep existing function)
async function resizeAndCenterWindow() {
    const desiredWidth = 450;
    const desiredHeight = 300;
    try {
        const currentWindow = await browser.windows.getCurrent();
        if (currentWindow.id) {
            const screenWidth = window.screen.availWidth;
            const screenHeight = window.screen.availHeight;
            const left = Math.round((screenWidth - desiredWidth) / 2);
            const top = Math.round((screenHeight - desiredHeight) / 2);
            await browser.windows.update(currentWindow.id, {
                width: desiredWidth,
                height: desiredHeight,
                left: left,
                top: top
            });
            console.log(`Attempted to resize window to ${desiredWidth}x${desiredHeight} and center.`);
        } else {
            console.warn('Could not get current window ID to resize/center.');
        }
    } catch (error) {
        console.error('Error trying to resize/center window:', error);
    }
} 
