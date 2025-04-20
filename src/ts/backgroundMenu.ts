import { ProviderFactory } from './llmProviders/providerFactory'
import { getConfigs, getCurrentMessageContent, logMessage, sendMessageToActiveTab } from './helpers/utils'
import { GenericProvider } from './llmProviders/genericProvider'
import { LlmService } from './llmProviders/llmService'
import { PromptManager } from './llmProviders/promptManager'

// --- Global state for tracking open dialogs ---
// Map<windowId, { promptId: string; context: string | null; tabId: number | undefined; }>
const pendingDialogs = new Map<number, { promptId: string; context: string | null; tabId: number | undefined; }>();

// Create the menu entries -->
const menuIdSummarize = messenger.menus.create({
    id: 'aiSummarize',
    title: browser.i18n.getMessage('mailSummarize'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu',
        'selection'
    ]
})

// Rephrase submenu -->
const subMenuIdRephrase = messenger.menus.create({
    id: 'aiSubMenuRephrase',
    title: browser.i18n.getMessage('mailRephrase'),
    contexts: [
        'selection'
    ]
})

const menuIdRephraseStandard = messenger.menus.create({
    id: 'aiRephraseStandard',
    title: browser.i18n.getMessage('mailRephrase.standard'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseFluid = messenger.menus.create({
    id: 'aiRephraseFluid',
    title: browser.i18n.getMessage('mailRephrase.fluid'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseCreative = messenger.menus.create({
    id: 'aiRephraseCreative',
    title: browser.i18n.getMessage('mailRephrase.creative'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseSimple = messenger.menus.create({
    id: 'aiRephraseSimple',
    title: browser.i18n.getMessage('mailRephrase.simple'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseFormal = messenger.menus.create({
    id: 'aiRephraseFormal',
    title: browser.i18n.getMessage('mailRephrase.formal'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseAcademic = messenger.menus.create({
    id: 'aiRephraseAcademic',
    title: browser.i18n.getMessage('mailRephrase.academic'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseExpanded = messenger.menus.create({
    id: 'aiRephraseExpanded',
    title: browser.i18n.getMessage('mailRephrase.expanded'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseShortened = messenger.menus.create({
    id: 'aiRephraseShortened',
    title: browser.i18n.getMessage('mailRephrase.shortened'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephrasePolite = messenger.menus.create({
    id: 'aiRephrasePolite',
    title: browser.i18n.getMessage('mailRephrase.polite'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})
// <-- rephrase submenu

// Suggest reply submenu -->
/* REMOVE SUBMENU
const subMenuIdSuggestReply = messenger.menus.create({
    id: 'aiSubMenuSuggestReply',
    title: browser.i18n.getMessage('mailSuggestReply'),
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyStandard = messenger.menus.create({
    id: 'aiSuggestReplyStandard',
    title: browser.i18n.getMessage('mailSuggestReply.standard'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyFluid = messenger.menus.create({
    id: 'aiSuggestReplyFluid',
    title: browser.i18n.getMessage('mailSuggestReply.fluid'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyCreative = messenger.menus.create({
    id: 'aiSuggestReplyCreative',
    title: browser.i18n.getMessage('mailSuggestReply.creative'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplySimple = messenger.menus.create({
    id: 'aiSuggestReplySimple',
    title: browser.i18n.getMessage('mailSuggestReply.simple'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyFormal = messenger.menus.create({
    id: 'aiSuggestReplyFormal',
    title: browser.i18n.getMessage('mailSuggestReply.formal'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyAcademic = messenger.menus.create({
    id: 'aiSuggestReplyAcademic',
    title: browser.i18n.getMessage('mailSuggestReply.academic'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyExpanded = messenger.menus.create({
    id: 'aiSuggestReplyExpanded',
    title: browser.i18n.getMessage('mailSuggestReply.expanded'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyShortened = messenger.menus.create({
    id: 'aiSuggestReplyShortened',
    title: browser.i18n.getMessage('mailSuggestReply.shortened'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyPolite = messenger.menus.create({
    id: 'aiSuggestReplyPolite',
    title: browser.i18n.getMessage('mailSuggestReply.polite'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

// <-- suggest reply submenu
*/

// ADD SINGLE MENU ITEM
const menuIdSuggestReply = messenger.menus.create({
    id: 'aiSuggestReply', // Use a simple ID
    title: browser.i18n.getMessage('mailSuggestReply'),
    contexts: [
        'compose_action_menu'
    ]
})

// Summarize submenu -->
const subMenuIdSummarize = messenger.menus.create({
    id: 'aiSubMenuSummarize',
    title: browser.i18n.getMessage('mailSummarizeAnd'),
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdSummarizeAndText2Speech = messenger.menus.create({
    id: 'aiSummarizeAndText2Speech',
    title: browser.i18n.getMessage('mailListen'),
    parentId: subMenuIdSummarize,
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})
// <-- summarize submenu

const menuIdText2Speech = messenger.menus.create({
    id: 'aiText2Speech',
    title: browser.i18n.getMessage('mailListen'),
    contexts: [
        'selection'
    ]
})

const menuIdTranslate = messenger.menus.create({
    id: 'aiTranslate',
    title: browser.i18n.getMessage('mailTranslate'),
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

// Translate submenu -->
const subMenuIdTranslateAnd = messenger.menus.create({
    id: 'aiSubMenuTranslateSummarize',
    title: browser.i18n.getMessage('mailTranslateAnd'),
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdTranslateAndSummarize = messenger.menus.create({
    id: 'aiTranslateAndSummarize',
    title: browser.i18n.getMessage('mailSummarize'),
    parentId: subMenuIdTranslateAnd,
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdTranslateAndText2Speech = messenger.menus.create({
    id: 'aiTranslateAndText2Speech',
    title: browser.i18n.getMessage('mailListen'),
    parentId: subMenuIdTranslateAnd,
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})
// <-- translate submenu

const menuIdModerate = messenger.menus.create({
    id: 'aiModerate',
    title: browser.i18n.getMessage('mailModerate'),
    contexts: [
        'message_display_action_menu'
    ]
})

/* Not very useful, maybe we can improve it in the future.
const menuIdSuggestImprovements = messenger.menus.create({
    id: 'aiSuggestImprovements',
    title: browser.i18n.getMessage('mailSuggestImprovements'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu',
        'selection'
    ]
})
*/

// Separator for the message display action menu
browser.menus.create({
    id: 'aiMessageDisplayActionMenuSeparator1',
    type: 'separator',
    contexts: [
        'message_display_action_menu'
    ]
})

messenger.menus.create({
    id: 'aiOptions',
    title: browser.i18n.getMessage('options'),
    contexts: [
        'message_display_action_menu'
    ],
    onclick: () => {
        browser.runtime.openOptionsPage()
    }
})

// Invocation of the method to handle the visibility of menu options based on the user-selected LLM.
// This ensures that all menu items are properly handled at add-on startup.
updateMenuVisibility()
// <-- create the menu entries

// Register a listener for the menus.onClicked events
messenger.menus.onClicked.addListener(async (info: browser.menus.OnClickData) => {
    const configs = await getConfigs()

    // --- Create LlmService instance ---
    const promptManager = new PromptManager();
    const provider = ProviderFactory.getInstance(configs);
    const llmService = new LlmService(provider, promptManager, configs);

    // Pass llmService to handlers
    if (info.menuItemId == menuIdSummarize) {
        handleSummarize(info, llmService)
    }
    else if ([menuIdRephraseStandard, menuIdRephraseFluid, menuIdRephraseCreative, menuIdRephraseSimple,
        menuIdRephraseFormal, menuIdRephraseAcademic, menuIdRephraseExpanded, menuIdRephraseShortened,
        menuIdRephrasePolite].includes(info.menuItemId)) {
        handleRephrase(info, llmService)
    }
    else if (info.menuItemId === menuIdSuggestReply) {
        promptForSuggestReply(info, llmService)
    }
    else if (info.menuItemId == menuIdSummarizeAndText2Speech) {
        handleSummarizeAndText2Speech(info, llmService)
    }
    else if (info.menuItemId == menuIdText2Speech) {
        handleText2Speech(info, llmService)
    }
    else if (info.menuItemId == menuIdTranslate) {
        handleTranslate(info, llmService)
    }
    else if (info.menuItemId == menuIdTranslateAndSummarize) {
        handleTranslateAndSummarize(info, llmService)
    }
    else if (info.menuItemId == menuIdTranslateAndText2Speech) {
        handleTranslateAndText2Speech(info, llmService)
    }
    else if (info.menuItemId == menuIdModerate) {
        handleModerate(info, llmService)
    }
    /* 
    else if (info.menuItemId == menuIdSuggestImprovements) {
        handleSuggestImprovements(info, llmService)
    }
    */
    // Fallback message case, but only if the menu does not match any values to
    // ignore, e.g., options.
    else if (!['aiOptions'].includes(info.menuItemId as string)) {
        logMessage(`Invalid menu item selected: ${info.menuItemId}`, 'error')
    }
})

/**
 * Handle summarization of selected or current message text
 */
async function handleSummarize(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToSummarize = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToSummarize == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }

        const textSummarized = await llmService.summarizeText(textToSummarize)
        sendMessageToActiveTab({ type: 'addText', content: textSummarized })

    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Summarization failed' })
        logMessage(`Error during summarization: ${error}`, 'error')
    }
}

/**
 * Handle rephrasing of selected or current message text
 */
async function handleRephrase(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToRephrase = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToRephrase == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }

        const originalItemId = String(info.menuItemId);
        const lowerCaseItemId = originalItemId.toLowerCase();
        const toneOfVoice = lowerCaseItemId.replace('airephrase', ''); // Ensure lowercase for comparison

        // Assertion: Check if tone is empty OR if replace did nothing
        if (!toneOfVoice || toneOfVoice === lowerCaseItemId) {
            logMessage(`Failed to extract valid tone of voice from menu item ID: ${originalItemId}`, 'error');
            sendMessageToActiveTab({ type: 'showError', content: `Internal error: Could not determine rephrase tone for menu item ${originalItemId}` });
            // No need to throw here, just stop processing for this action
            return;
        }

        logMessage(`Request to rephrase with tone "${toneOfVoice}": ${textToRephrase}`, 'debug')
        const textRephrased = await llmService.rephraseText(textToRephrase, toneOfVoice) // Use service and await
        sendMessageToActiveTab({ type: 'addText', content: textRephrased })

    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Rephrasing failed' })
        logMessage(`Error during rephrasing: ${error}`, 'error')
    }
}

/**
 * Finds the starting index of the quoted text within email content.
 * 
 * @param content The email body content (plain text or HTML string).
 * @param isPlainText Whether the content is plain text.
 * @returns The starting index of the quote, or -1 if not found.
 */
function findQuoteStartIndex(content: string, isPlainText: boolean): number {
    let quoteStartIndex = -1;

    if (isPlainText) {
        // Plain text quote detection logic
        const headerRegex = /\n\s*(\bOn\b .+wrote:)/;
        const headerMatch = headerRegex.exec(content);
        if (headerMatch && headerMatch.index > -1) {
            quoteStartIndex = headerMatch.index;
            logMessage(`Found plain text header at index ${quoteStartIndex}`, 'log');
        } else {
            const dateRegex = /\n\s*(\bOn\b .+\d{1,4}[\/,-]\d{1,2}[\/,-]\d{1,4})/;
            const dateMatch = dateRegex.exec(content);
            if (dateMatch && dateMatch.index > -1) {
                quoteStartIndex = dateMatch.index;
                logMessage(`Found plain text date header at index ${quoteStartIndex}`, 'log');
            } else {
                const quoteRegex = /\n\s*(>[^\n]+\n\s*>[^\n]+)/; // Match multi-line quote
                const quoteMatch = quoteRegex.exec(content);
                if (quoteMatch && quoteMatch.index > -1) {
                    quoteStartIndex = quoteMatch.index;
                    logMessage(`Found plain text quote marker at index ${quoteStartIndex}`, 'log');
                }
            }
        }
    } else {
        // HTML quote detection logic
        // NOTE: This operates on the innerHTML of the body for simplicity here,
        // assuming the caller handles the full document parsing if needed.
        const headerRegex = /(\b(?:On|From|Date).+\d{1,4}[\/,-]\d{1,2}[\/,-]\d{1,4})/i;
        const headerMatch = headerRegex.exec(content);
        if (headerMatch && headerMatch.index > -1) {
            quoteStartIndex = headerMatch.index;
            logMessage(`Found HTML header at index ${quoteStartIndex}`, 'log');
        } else {
            const blockquoteIndex = content.indexOf('<blockquote');
            if (blockquoteIndex !== -1) {
                quoteStartIndex = blockquoteIndex;
                logMessage(`Found blockquote at index ${quoteStartIndex}`, 'log');
            } else {
                const quoteIndex = content.indexOf('&gt;');
                if (quoteIndex !== -1) {
                    const lineStartIndex = content.lastIndexOf('<br', quoteIndex);
                    quoteStartIndex = (lineStartIndex > -1) ? lineStartIndex : quoteIndex;
                    logMessage(`Found HTML quote marker (&gt;) at index ${quoteIndex}, using index ${quoteStartIndex}`, 'log');
                }
            }
        }
    }

    return quoteStartIndex;
}

/**
 * Gets the content of the original message being replied to from a compose window.
 * 
 * @param tabId The ID of the tab containing the compose window.
 * @returns A promise resolving to the original message content (quoted part), or null if not found.
 */
async function getOriginalMessageContext(tabId: number): Promise<string | null> {
    try {
        const details = await browser.compose.getComposeDetails(tabId);
        const isPlainText = details.isPlainText;
        let content = isPlainText ? details.plainTextBody : details.body;

        if (!content) {
            logMessage('No content found in compose window for context extraction', 'warn');
            return null;
        }

        let quoteStartIndex = -1;
        if (isPlainText) {
            quoteStartIndex = findQuoteStartIndex(content, true);
        } else {
            // For HTML, we need to find the index within the body's innerHTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const bodyElement = doc.body;
            if (bodyElement) {
                quoteStartIndex = findQuoteStartIndex(bodyElement.innerHTML, false);
                // If quote found, get the substring from the *original* HTML content
                if (quoteStartIndex > -1) {
                    // This might need refinement - ideally, we'd get the substring 
                    // from the *serialized* original body HTML starting at the 
                    // equivalent index. For now, let's return the innerHTML substring.
                    // TODO: Re-evaluate if returning raw innerHTML substring is sufficient.
                    content = bodyElement.innerHTML; // Use innerHTML for substring operation
                }
            } else {
                logMessage('Could not parse body element from HTML content', 'warn');
                // Fallback: try finding quote in the raw HTML string
                quoteStartIndex = findQuoteStartIndex(content, false);
            }
        }

        if (quoteStartIndex > -1) {
            let originalMessage = content.substring(quoteStartIndex);
            // Remove a single leading newline if present, as findQuoteStartIndex might include it.
            if (originalMessage.startsWith('\n')) {
                originalMessage = originalMessage.substring(1);
            }
            logMessage(`Extracted original message context starting at index ${quoteStartIndex}`, 'log');
            return originalMessage;
        } else {
            logMessage('Could not find quote start index in compose window', 'warn');
            return null; // Indicate no original message context found
        }
    } catch (error) {
        logMessage(`Error getting original message context: ${error}`, 'error');
        return null; // Return null on error
    }
}

/**
 * Inserts text into the compose window before the quoted email.
 * 
 * @param tabId The ID of the tab containing the compose window
 * @param replyText The text to insert as a reply
 * @returns A promise that resolves when the operation is complete
 */
async function insertReplyIntoComposeWindow(tabId: number, replyText: string): Promise<void> {
    try {
        logMessage('Inserting reply into compose window', 'log');

        // Get the compose details
        const details = await browser.compose.getComposeDetails(tabId);
        logMessage(`Got compose details: isPlainText=${details.isPlainText}`, 'log');

        // Handle content based on compose mode
        let content = details.isPlainText ? details.plainTextBody : details.body;
        if (!content) {
            logMessage('No content found in compose window', 'log');
            // If no content, just insert the reply directly
            await browser.compose.setComposeDetails(tabId, details.isPlainText ? { plainTextBody: replyText } : { body: replyText });
            return;
        }

        // Format the reply appropriately based on content type
        let formattedReply;
        if (details.isPlainText) {
            formattedReply = replyText;
        } else {
            formattedReply = replyText.startsWith('<') ?
                replyText :
                '<p>' + replyText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
        }

        if (details.isPlainText) {
            // For plain text, find the start of the quote
            const quoteStartIndex = findQuoteStartIndex(content, true);

            // Construct the new content
            let newContent;
            if (quoteStartIndex > -1) {
                // Combine new reply with the identified quote onwards
                const quotePart = content.substring(quoteStartIndex);
                newContent = formattedReply + '\n\n' + quotePart;
            } else {
                // No quote found, just use the new reply
                logMessage('No quote indicators found in plain text, inserting reply at the beginning', 'log');
                newContent = formattedReply + '\n\n' + content; // Insert before existing content
            }
            await browser.compose.setComposeDetails(tabId, { plainTextBody: newContent });

        } else { // HTML Handling
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const bodyElement = doc.body;

            if (!bodyElement) {
                logMessage('No body found in HTML, using just our reply', 'log');
                await browser.compose.setComposeDetails(tabId, { body: formattedReply });
                return;
            }

            const bodyHTML = bodyElement.innerHTML;
            let quoteStartIndex = -1;

            // Find the start of the quote in HTML
            quoteStartIndex = findQuoteStartIndex(bodyHTML, false);

            // Construct the new HTML content
            let newBodyHTML;
            if (quoteStartIndex > -1) {
                // Combine new reply with the identified quote onwards
                const quotePart = bodyHTML.substring(quoteStartIndex);
                newBodyHTML = formattedReply + '<br>' + quotePart; // Add break before quote
            } else {
                // No quote found, just use the new reply
                logMessage('No quote indicators found in HTML, inserting reply at the beginning', 'log');
                newBodyHTML = formattedReply + '<br>' + bodyHTML; // Insert before existing content
            }

            // Update the body and set the details
            bodyElement.innerHTML = newBodyHTML;
            const newContent = doc.documentElement.outerHTML;
            await browser.compose.setComposeDetails(tabId, { body: newContent });
        }

        logMessage('Successfully updated compose window content', 'log');
    } catch (error) {
        logMessage(`Error inserting reply into compose window: ${error}`, 'error');
        throw error; // Re-throw to allow caller to handle it
    }
}

/**
 * Opens a popup window to get custom reply instructions based on the selected reply type.
 */
async function promptForSuggestReply(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    const promptId = `suggestReply-${Date.now()}`; // Simpler unique prompt ID

    logMessage(`Opening suggest reply dialog`, 'log');

    // --- Get context BEFORE opening dialog --- 
    let initialContext: string | null = null;
    let initialTabId: number | undefined = undefined;
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        initialTabId = tabs[0]?.id;
        if (!initialTabId) {
            throw new Error("Could not get active tab ID for context.");
        }
        initialContext = await getOriginalMessageContext(initialTabId);

        if (initialContext === null) {
            logMessage("Could not find/extract original message context from compose window.", 'warn');
        }
        logMessage(`Got initial context for tab ${initialTabId}`, 'log');
    } catch (error) {
        logMessage(`Failed to get initial context: ${error}`, 'error');
        // Send error message using the helper function for consistency
        sendMessageToActiveTab({ type: 'showError', content: `Failed to get context: ${error instanceof Error ? error.message : 'Unknown error'}` });
        return; // Don't proceed if context fetching fails
    }
    // --- End context fetching ---

    // --- Pre-check before opening dialog --- 
    // Ensure we have context to reply to before even opening the dialog
    if (!initialContext || initialContext.trim() === '') {
        logMessage(`Error: Cannot suggest reply for tab ${initialTabId}. Original message context is missing or empty.`, 'error');
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorSuggestReplyNoContext') }, initialTabId);
        return; // Stop processing
    }

    try {
        let dialogTitle = browser.i18n.getMessage('customReplyDialogTitle');
        let dialogLabel = browser.i18n.getMessage('customReplyDialogInstructionLabel');

        const params = new URLSearchParams({
            promptId: promptId,
            title: dialogTitle,
            label: dialogLabel,
            buttonText: 'Suggest Reply',
            defaultValue: '' // Start with empty input
        });
        const dialogUrl = `dialogs/customReplyDialog.html?${params.toString()}`;

        const newWindow = await browser.windows.create({
            url: dialogUrl,
            type: 'popup',
            width: 450,
            height: 300
        });

        if (newWindow.id) {
            pendingDialogs.set(newWindow.id, {
                promptId,
                context: initialContext,
                tabId: initialTabId
            });
            logMessage(`Tracking dialog window ${newWindow.id} for prompt ${promptId}`, 'log');
        } else {
            logMessage('Could not get window ID for created dialog', 'warn');
            // Attempt to show error on the original tab
            if (initialTabId) {
                sendMessageToActiveTab({ type: 'showError', content: 'Failed to track reply dialog.' }, initialTabId);
            }
        }

    } catch (error) {
        logMessage(`Error opening suggest reply dialog: ${error}`, 'error');
        // Attempt to show error on the original tab
        if (initialTabId) {
            sendMessageToActiveTab({ type: 'showError', content: `Error opening dialog: ${error instanceof Error ? error.message : 'Unknown error'}` }, initialTabId);
        } else {
            // Fallback if tab ID wasn't obtained
            alert(`Error opening dialog: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * Handle summarize and text-to-speech of selected or current message text
 */
async function handleSummarizeAndText2Speech(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToProcess = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToProcess == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }
        const textSummarized = await llmService.summarizeText(textToProcess)
        const blob = await llmService.getSpeechFromText(textSummarized)

        sendMessageToActiveTab({ type: 'addAudio', content: blob })
    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Summarize & Speech failed' })
        logMessage(`Error during summarization and text-to-speech: ${error}`, 'error')
    }
}

/**
 * Handle text-to-speech conversion of selected or current message text
 */
async function handleText2Speech(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToPlay = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToPlay == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }

        const blob = await llmService.getSpeechFromText(textToPlay)
        sendMessageToActiveTab({ type: 'addAudio', content: blob })

    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Text-to-speech failed' })
        logMessage(`Error during text-to-speech conversion: ${error}`, 'error')
    }
}

/**
 * Handle translation of selected or current message text
 */
async function handleTranslate(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToTranslate = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToTranslate == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }

        const textTranslated = await llmService.translateText(textToTranslate)
        sendMessageToActiveTab({ type: 'addText', content: textTranslated })

    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Translation failed' })
        logMessage(`Error during translation: ${error}`, 'error')
    }
}

/**
 * Handle translation and summarization of selected or current message text
 */
async function handleTranslateAndSummarize(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToProcess = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToProcess == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }

        const textTranslated = await llmService.translateText(textToProcess)
        const textTranslateAndSummarized = await llmService.summarizeText(textTranslated)

        sendMessageToActiveTab({ type: 'addText', content: textTranslateAndSummarized })
    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Translate & Summarize failed' })
        logMessage(`Error during translation and summarization: ${error}`, 'error')
    }
}

/**
 * Handle translation and text-to-speech of selected or current message text
 */
async function handleTranslateAndText2Speech(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToProcess = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if (textToProcess == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }

        const textTranslated = await llmService.translateText(textToProcess)
        const blob = await llmService.getSpeechFromText(textTranslated)

        sendMessageToActiveTab({ type: 'addAudio', content: blob })
    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Translate & Speech failed' })
        logMessage(`Error during translation and text2Speech: ${error}`, 'error')
    }
}

/**
 * Handle moderation of current message text
 */
async function handleModerate(info: browser.menus.OnClickData, llmService: LlmService): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    try {
        const textToModerate = await getCurrentMessageContent()

        if (textToModerate == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
            return;
        }
        const moderatedResponse = await llmService.moderateText(textToModerate)
        sendMessageToActiveTab({ type: 'addChart', content: moderatedResponse })

    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error instanceof Error ? error.message : 'Moderation failed' })
        logMessage(`Error during moderation: ${error}`, 'error')
    }
}

/**
 * Using the messageDisplayScripts API for customizing the content displayed when
 * viewing a message.
 *
 * For more information check the docs at:
 * https://webextension-api.thunderbird.net/en/stable/messageDisplayScripts.html
 */
messenger.messageDisplayScripts.register({
    js: [{ file: '/messageDisplay/messageDisplayScripts.js' }],
    css: [{ file: '/messageDisplay/messageDisplayScripts.css' }]
})

/**
 * Using the composeScripts API for customizing the content displayed when create
 * or edit a message.
 *
 * For more information check the docs at:
 * https://webextension-api.thunderbird.net/en/stable/composeScripts.html
 */
messenger.composeScripts.register({
    js: [{ file: '/messageDisplay/messageDisplayScripts.js' }],
    css: [{ file: '/messageDisplay/messageDisplayScripts.css' }]
})

// Update the message listener to handle generalized dialog responses
browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === 'optionsChanged') {
        updateMenuVisibility()
        return; // Stop processing here for this message type
    }

    if (message.type === 'dialogResponse') {
        logMessage(`Received dialog response: ${JSON.stringify(message)}`, 'log');
        const senderWindowId = sender.tab?.windowId;

        // Check if we are tracking this dialog
        if (!senderWindowId || !pendingDialogs.has(senderWindowId)) {
            logMessage(`Received dialog response from untracked or invalid window ID: ${senderWindowId}`, 'warn');
            return;
        }

        // Retrieve stored data and remove from tracking
        const dialogData = pendingDialogs.get(senderWindowId);
        pendingDialogs.delete(senderWindowId);
        logMessage(`Retrieved and removed dialog data for window ${senderWindowId}.`, 'log');

        if (!dialogData) { // Should not happen if .has check passes, but good practice
            logMessage(`Error: No stored dialog data found for window ID ${senderWindowId}`, 'error');
            return;
        }

        // --- Route based on promptId prefix ---
        if (dialogData.promptId.startsWith('suggestReply-')) {
            // Allow submission even if the value (custom instructions) is empty
            if (message.status === 'submitted') {
                logMessage(`Processing submitted suggest reply for tabId=${dialogData.tabId}`, 'log');

                // Ensure we have necessary data
                if (dialogData.tabId === undefined) {
                    logMessage(`Error: Stored tabId is invalid for prompt ${dialogData.promptId}`, 'error');
                    // Attempt to send error to active tab if possible
                    sendMessageToActiveTab({ type: 'showError', content: 'Internal error: Could not determine original tab.' });
                    return;
                }
                // Context can be null, handle appropriately
                if (dialogData.context === null) {
                    logMessage(`Warning: Stored context is null for prompt ${dialogData.promptId}`, 'warn');
                    // Consider if an error message is needed if context is mandatory for the LLM
                }

                const effectiveTabId = dialogData.tabId;
                const textForContext = dialogData.context; // Use stored context
                const customInstructions = message.value; // User input from dialog

                // === Pre-LLM Check ===
                // Ensure we have context to reply to before calling the LLM
                if (!textForContext || textForContext.trim() === '') {
                    logMessage(`Error: Cannot suggest reply for tab ${effectiveTabId}. Original message context is missing or empty.`, 'error');
                    sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorSuggestReplyNoContext') }, effectiveTabId);
                    return; // Stop processing
                }

                // Send thinking message TO THE SPECIFIC TAB 
                sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') }, effectiveTabId);

                try {
                    // Re-fetch configs and recreate service as state might be lost
                    const configs = await getConfigs()
                    const provider = ProviderFactory.getInstance(configs)
                    const promptManager = new PromptManager()
                    const service = new LlmService(provider, promptManager, configs)

                    // Call LLM provider with context, type, and custom instructions
                    logMessage(`Calling LLM provider with context: ${textForContext}, customInstructions: ${customInstructions}`, 'log');
                    const textSuggested = await service.suggestReplyFromText(textForContext, customInstructions);

                    // Show the reply in the panel of THE SPECIFIC TAB
                    sendMessageToActiveTab({ type: 'addText', content: textSuggested }, effectiveTabId);

                    // Try to insert the reply into the compose window OF THE SPECIFIC TAB
                    try {
                        await insertReplyIntoComposeWindow(effectiveTabId, textSuggested);
                    } catch (insertError) {
                        logMessage(`Failed to insert reply automatically into tab ${effectiveTabId}: ${insertError}`, 'error');
                        sendMessageToActiveTab({ type: 'showError', content: `${messenger.i18n.getMessage('errorSuggestReplyInsertFailed')}: ${insertError.message}` }, effectiveTabId);
                    }

                } catch (error) {
                    sendMessageToActiveTab({ type: 'showError', content: error.message }, effectiveTabId);
                    logMessage(`Error during reply generation: ${error.message}`, 'error');
                }
            }
            // If status is 'cancelled', it's handled by the onRemoved listener
        }
        // --- Add more else if blocks here for other promptIds in the future ---
        else {
            logMessage(`Received dialog response with unknown promptId prefix: ${dialogData.promptId}`, 'warn');
        }
    }
    // Handle other message types if any...
});

// --- Listener for window removal (handles cancellation) ---
browser.windows.onRemoved.addListener((closedWindowId) => {
    if (pendingDialogs.has(closedWindowId)) {
        const dialogData = pendingDialogs.get(closedWindowId);
        // Use a guard clause for type safety
        if (!dialogData) return;

        const { promptId, context, tabId } = dialogData;
        logMessage(`Dialog window ${closedWindowId} (prompt: ${promptId}) was closed without submitting. Treating as cancel.`, 'log');

        // Trigger cancellation logic based on promptId if needed
        if (promptId.startsWith('suggestReply-')) {
            // Optionally notify user or perform specific cleanup for this prompt type
            // e.g., sendMessageToActiveTab({ type: 'showInfo', content: 'Suggest reply cancelled.' }, tabId);
        }
        // Add more else if blocks for other promptIds

        pendingDialogs.delete(closedWindowId); // Clean up tracking
    }
});

// The function manages the visibility of menu options based on the user-selected
// LLM.
async function updateMenuVisibility(): Promise<void> {
    try {
        const configs = await getConfigs()
        let provider: GenericProvider | null = null;
        let service: LlmService | null = null;
        let providerError: Error | null = null;

        try {
            provider = ProviderFactory.getInstance(configs)
            const promptManager = new PromptManager();
            service = new LlmService(provider, promptManager, configs);
        } catch (error) {
            logMessage(`Visibility Check: Failed to create provider/service. Error: ${error instanceof Error ? error.message : error}`, 'warn')
            providerError = error instanceof Error ? error : new Error('Provider configuration error');
        }

        const isConfigured = !!provider && !providerError;
        // Corrected: Use the actual capability check method names
        const canSpeech = isConfigured && service?.getCanSpeechFromText();
        const canModerate = isConfigured && service?.getCanModerateText();

        // IDs of menus that require a fully configured provider
        // Text generation capabilities are assumed if provider is configured
        const providerRequiredMenus = [
            'aiSummarize', 'aiSubMenuRephrase', 'aiSuggestReply',
            'aiSubMenuSummarize', 'aiTranslate', 'aiSubMenuTranslateAndSummarize'
            // 'aiSuggestImprovements' is commented out
            // 'aiModerate' depends on canModerate
            // 'aiText2Speech' and related depend on canSpeech
        ];

        // Update visibility for general provider-dependent menus
        for (const menuId of providerRequiredMenus) {
            try {
                await messenger.menus.update(menuId, { visible: isConfigured });
            } catch (e) {
                logMessage(`Error updating menu ${menuId}: ${e}`, 'warn'); // Log errors updating individual menus
            }
        }

        // Update visibility for speech-dependent menus
        try {
            await messenger.menus.update('aiSummarizeAndText2Speech', { visible: canSpeech });
            await messenger.menus.update('aiTranslateAndSummarizeAndText2Speech', { visible: canSpeech });
            await messenger.menus.update('aiText2Speech', { visible: canSpeech });
        } catch (e) {
            logMessage(`Error updating speech menus: ${e}`, 'warn');
        }

        // Update visibility for moderation-dependent menus
        try {
            await messenger.menus.update('aiModerate', { visible: canModerate });
        } catch (e) {
            logMessage(`Error updating moderation menu: ${e}`, 'warn');
        }

        // Refresh menus to apply changes
        try {
            await messenger.menus.refresh();
            logMessage('Menu visibility updated based on configuration.', 'info');
        } catch (e) {
            logMessage(`Error refreshing menus: ${e}`, 'error');
        }

    } catch (error) {
        logMessage(`Error updating menu visibility: ${error}`, 'error')
    }
}

