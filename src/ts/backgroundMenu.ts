import { ProviderFactory } from './llmProviders/providerFactory'
import { getConfigs, getCurrentMessageContent, logMessage, sendMessageToActiveTab } from './helpers/utils'

// --- Global state for tracking open dialogs ---
// Map<windowId, { promptId: string; context: string | null; tabId: number | undefined; replyType: string; }>
const pendingDialogs = new Map<number, { promptId: string; context: string | null; tabId: number | undefined; replyType: string; }>();

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

const menuIdSuggestImprovements = messenger.menus.create({
    id: 'aiSuggestImprovements',
    title: browser.i18n.getMessage('mailSuggestImprovements'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu',
        'selection'
    ]
})

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
    const llmProvider = ProviderFactory.getInstance(configs)

    if (info.menuItemId == menuIdSummarize) {
        handleSummarize(info, llmProvider)
    }
    else if ([menuIdRephraseStandard, menuIdRephraseFluid, menuIdRephraseCreative, menuIdRephraseSimple,
        menuIdRephraseFormal, menuIdRephraseAcademic, menuIdRephraseExpanded, menuIdRephraseShortened,
        menuIdRephrasePolite].includes(info.menuItemId)) {
        handleRephrase(info, llmProvider)
    }
    else if ([menuIdSuggestReplyStandard, menuIdSuggestReplyFluid, menuIdSuggestReplyCreative, menuIdSuggestReplySimple,
        menuIdSuggestReplyFormal, menuIdSuggestReplyAcademic, menuIdSuggestReplyExpanded, menuIdSuggestReplyShortened,
        menuIdSuggestReplyPolite].includes(info.menuItemId)) {
        promptForSuggestReply(info, llmProvider)
    }
    else if (info.menuItemId == menuIdSummarizeAndText2Speech) {
        handleSummarizeAndText2Speech(info, llmProvider)
    }
    else if (info.menuItemId == menuIdText2Speech) {
        handleText2Speech(info, llmProvider)
    }
    else if (info.menuItemId == menuIdTranslate) {
        handleTranslate(info, llmProvider)
    }
    else if (info.menuItemId == menuIdTranslateAndSummarize) {
        handleTranslateAndSummarize(info, llmProvider)
    }
    else if (info.menuItemId == menuIdTranslateAndText2Speech) {
        handleTranslateAndText2Speech(info, llmProvider)
    }
    else if (info.menuItemId == menuIdModerate) {
        handleModerate(info, llmProvider)
    }
    else if (info.menuItemId == menuIdSuggestImprovements) {
        handleSuggestImprovements(info, llmProvider)
    }
    // Fallback message case, but only if the menu does not match any values to
    // ignore, e.g., options.
    else if (!['aiOptions'].includes(info.menuItemId as string)) {
        logMessage(`Invalid menu item selected: ${info.menuItemId}`, 'error')
    }
})

/**
 * Handle summarization of selected or current message text
 */
async function handleSummarize(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToSummarize = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToSummarize == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        llmProvider.summarizeText(textToSummarize).then(textSummarized => {
            sendMessageToActiveTab({ type: 'addText', content: textSummarized })
        }).catch(error => {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during summarization: ${error.message}`, 'error')
        })
    }
}

/**
 * Handle rephrasing of selected or current message text
 */
async function handleRephrase(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToRephrase = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToRephrase == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        // Extracts the tone of voice from the menuItemId by taking a substring
        // starting from the 10th character.
        // The value 10 corresponds to the length of the string 'aiRephrase',
        // allowing the code to retrieve the portion of the menuItemId that
        // follows 'aiRephrase'.
        const toneOfVoice = (info.menuItemId as string).substring(10).toLowerCase()

        llmProvider.rephraseText(textToRephrase, toneOfVoice).then(textRephrased => {
            sendMessageToActiveTab({ type: 'addText', content: textRephrased })
        }).catch(error => {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during rephrasing: ${error.message}`, 'error')
        })
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
            let quoteStartIndex = -1;
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

            // Construct the new content
            let newContent;
            if (quoteStartIndex > -1) {
                // Combine new reply with the identified quote onwards
                const quotePart = content.substring(quoteStartIndex);
                newContent = formattedReply + '\n\n' + quotePart;
            } else {
                // No quote found, just use the new reply
                logMessage('No quote indicators found in plain text, using just our reply', 'log');
                newContent = formattedReply;
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
            const headerRegex = /(\b(?:On|From|Date).+\d{1,4}[\/,-]\d{1,2}[\/,-]\d{1,4})/i;
            const headerMatch = headerRegex.exec(bodyHTML);
            if (headerMatch && headerMatch.index > -1) {
                quoteStartIndex = headerMatch.index;
                logMessage(`Found HTML header at index ${quoteStartIndex}`, 'log');
            } else {
                const blockquoteIndex = bodyHTML.indexOf('<blockquote');
                if (blockquoteIndex !== -1) {
                    quoteStartIndex = blockquoteIndex;
                    logMessage(`Found blockquote at index ${quoteStartIndex}`, 'log');
                } else {
                    const quoteIndex = bodyHTML.indexOf('&gt;');
                    if (quoteIndex !== -1) {
                        // Try to find the start of the line containing &gt;
                        const lineStartIndex = bodyHTML.lastIndexOf('<br', quoteIndex);
                        quoteStartIndex = (lineStartIndex > -1) ? lineStartIndex : quoteIndex; // Prefer start of line
                        logMessage(`Found HTML quote marker (&gt;) at index ${quoteIndex}, using index ${quoteStartIndex}`, 'log');
                    }
                }
            }

            // Construct the new HTML content
            let newBodyHTML;
            if (quoteStartIndex > -1) {
                // Combine new reply with the identified quote onwards
                const quotePart = bodyHTML.substring(quoteStartIndex);
                newBodyHTML = formattedReply + '<br>' + quotePart; // Add break before quote
            } else {
                // No quote found, just use the new reply
                logMessage('No quote indicators found in HTML, using just our reply', 'log');
                newBodyHTML = formattedReply;
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
async function promptForSuggestReply(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    const menuItemId = info.menuItemId as string;
    const replyType = menuItemId.substring(14).toLowerCase(); // e.g., "standard", "polite"
    const promptId = `suggestReply-${replyType}-${Date.now()}`; // Unique prompt ID

    logMessage(`Opening suggest reply dialog for type: ${replyType}`, 'log');

    // --- Get context BEFORE opening dialog --- 
    let initialContext: string | null = null;
    let initialTabId: number | undefined = undefined;
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        initialTabId = tabs[0]?.id;
        if (!initialTabId) {
            throw new Error("Could not get active tab ID for context.");
        }
        initialContext = await getCurrentMessageContent(); // Use current message as context
        if (initialContext === null) {
            // Don't throw error, proceed without context if necessary, but log it
            logMessage("Could not get initial message context.", 'warn');
        }
        logMessage(`Got initial context for tab ${initialTabId}`, 'log');
    } catch (error) {
        logMessage(`Failed to get initial context: ${error}`, 'error');
        sendMessageToActiveTab({ type: 'showError', content: `Failed to get context: ${error.message}` });
        return; // Don't proceed if context fetching fails
    }
    // --- End context fetching ---

    try {
        // Get the title of the clicked menu item to use as the dialog label
        // Reconstruct the i18n key and fetch the localized title
        // TODO: Remove all fallbacks for localization - if it's not found, the code is wrong!
        const i18nKey = `mailSuggestReply.${replyType}`;
        let dialogLabel = browser.i18n.getMessage(i18nKey);
        // Fallback if i18n lookup fails (e.g., key missing)
        if (!dialogLabel || dialogLabel === i18nKey) {
            dialogLabel = `Instructions for ${replyType} reply:`;
            logMessage(`Could not find i18n message for key: ${i18nKey}, using fallback.`, 'warn');
        }

        const dialogTitle = `Suggest ${replyType.charAt(0).toUpperCase() + replyType.slice(1)} Reply`;

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
            width: 450, // Slightly wider default
            height: 300
        });

        // Track the opened dialog window with context and reply type
        if (newWindow.id) {
            pendingDialogs.set(newWindow.id, {
                promptId,
                context: initialContext,
                tabId: initialTabId,
                replyType // Store the reply type
            });
            logMessage(`Tracking dialog window ${newWindow.id} for prompt ${promptId} (type: ${replyType})`, 'log');
        } else {
            logMessage('Could not get window ID for created dialog', 'warn');
        }

    } catch (error) {
        logMessage(`Error opening suggest reply dialog: ${error}`, 'error');
        sendMessageToActiveTab({ type: 'showError', content: `Error opening dialog: ${error.message}` });
    }
}

/**
 * Handle summarize and text-to-speech of selected or current message text
 */
async function handleSummarizeAndText2Speech(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToProcess = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToProcess == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        try {
            const textSummarized = await llmProvider.summarizeText(textToProcess)
            const blob = await llmProvider.getSpeechFromText(textSummarized)

            sendMessageToActiveTab({ type: 'addAudio', content: blob })
        } catch (error) {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during summarization and text-to-speech: ${error.message}`, 'error')
        }
    }
}

/**
 * Handle text-to-speech conversion of selected or current message text
 */
async function handleText2Speech(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToPlay = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToPlay == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        llmProvider.getSpeechFromText(textToPlay).then(blob => {
            sendMessageToActiveTab({ type: 'addAudio', content: blob })
        }).catch(error => {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during text-to-speech conversion: ${error.message}`, 'error')
        })
    }
}

/**
 * Handle translation of selected or current message text
 */
async function handleTranslate(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToTranslate = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToTranslate == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        llmProvider.translateText(textToTranslate).then(textTranslated => {
            sendMessageToActiveTab({ type: 'addText', content: textTranslated })
        }).catch(error => {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during translation: ${error.message}`, 'error')
        })
    }
}

/**
 * Handle translation and summarization of selected or current message text
 */
async function handleTranslateAndSummarize(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToProcess = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToProcess == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        try {
            const textTranslated = await llmProvider.translateText(textToProcess)
            const textTranslateAndSummarized = await llmProvider.summarizeText(textTranslated)

            sendMessageToActiveTab({ type: 'addText', content: textTranslateAndSummarized })
        } catch (error) {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during translation and summarization: ${error.message}`, 'error')
        }
    }
}

/**
 * Handle translation and text-to-speech of selected or current message text
 */
async function handleTranslateAndText2Speech(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToProcess = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

    if (textToProcess == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        try {
            const textTranslated = await llmProvider.translateText(textToProcess)
            const blob = await llmProvider.getSpeechFromText(textTranslated)

            sendMessageToActiveTab({ type: 'addAudio', content: blob })
        } catch (error) {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during translation and text2Speech: ${error.message}`, 'error')
        }
    }
}

/**
 * Handle moderation of current message text
 */
async function handleModerate(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToModerate = await getCurrentMessageContent()

    if (textToModerate == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        llmProvider.moderateText(textToModerate).then(moderatedResponse => {
            sendMessageToActiveTab({ type: 'addChart', content: moderatedResponse })
        }).catch(error => {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error during moderation: ${error.message}`, 'error')
        })
    }
}

/**
 * Handle suggesting improvements for current message text
 */
async function handleSuggestImprovements(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const textToImprove = await getCurrentMessageContent()

    if (textToImprove == null) {
        sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
    }
    else {
        llmProvider.suggestImprovementsForText(textToImprove).then(improvedText => {
            sendMessageToActiveTab({ type: 'addText', content: improvedText })
        }).catch(error => {
            sendMessageToActiveTab({ type: 'showError', content: error.message })
            logMessage(`Error while improving the text: ${error.message}`, 'error')
        })
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
        logMessage(`Retrieved and removed dialog data for window ${senderWindowId}: ${JSON.stringify(dialogData)}`, 'log');

        if (!dialogData) { // Should not happen if .has check passes, but good practice
            logMessage(`Error: No dialog data found for window ID ${senderWindowId}`, 'error');
            return;
        }

        // --- Route based on promptId prefix ---
        if (dialogData.promptId.startsWith('suggestReply-')) {
            if (message.status === 'submitted' && message.value) {
                logMessage(`Processing submitted suggest reply: type=${dialogData.replyType}, tabId=${dialogData.tabId}`, 'log');

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
                const replyType = dialogData.replyType; // Use stored reply type
                const customInstructions = message.value; // User input from dialog

                // Send thinking message TO THE SPECIFIC TAB 
                sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') }, effectiveTabId);

                try {
                    const configs = await getConfigs();
                    const llmProvider = ProviderFactory.getInstance(configs);

                    // Call LLM provider with context, type, and custom instructions
                    logMessage(`Calling LLM provider with context: ${textForContext}, type: ${replyType}, customInstructions: ${customInstructions}`, 'log');
                    const textSuggested = await llmProvider.suggestReplyFromText(textForContext, replyType/* TODO: , customInstructions */);

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
                    logMessage(`Error during reply generation (type: ${replyType}): ${error.message}`, 'error');
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

        const { promptId, context, tabId, replyType } = dialogData;
        logMessage(`Dialog window ${closedWindowId} (prompt: ${promptId}, type: ${replyType}) was closed without submitting. Treating as cancel.`, 'log');

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
    const configs = await getConfigs()
    const llmProvider = ProviderFactory.getInstance(configs)

    // canModerateText -->
    messenger.menus.update(menuIdModerate, {
        enabled: llmProvider.getCanModerateText()
    })
    // <-- canModerateText

    // canRephraseText -->
    messenger.menus.update(subMenuIdRephrase, {
        enabled: llmProvider.getCanRephraseText()
    })
    // <-- canRephraseText

    // canSpeechFromText -->
    messenger.menus.update(menuIdText2Speech, {
        enabled: llmProvider.getCanSpeechFromText()
    })

    messenger.menus.update(menuIdSummarizeAndText2Speech, {
        enabled: llmProvider.getCanSpeechFromText()
    })

    messenger.menus.update(menuIdTranslateAndText2Speech, {
        enabled: llmProvider.getCanSpeechFromText()
    })
    // <-- canSpeechFromText

    // canSuggestImprovementsForText -->
    messenger.menus.update(menuIdSuggestImprovements, {
        enabled: llmProvider.getCanSuggestImprovementsForText()
    })
    // <-- canSuggestImprovementsForText

    // canSuggestReply -->
    messenger.menus.update(subMenuIdSuggestReply, {
        enabled: llmProvider.getCanSuggestReply()
    })
    // <-- canSuggestReply

    // canSummarizeText -->
    messenger.menus.update(menuIdSummarize, {
        enabled: llmProvider.getCanSummarizeText()
    })

    messenger.menus.update(subMenuIdSummarize, {
        enabled: llmProvider.getCanSummarizeText()
    })
    // <-- canSummarizeText

    // canTranslateText -->
    messenger.menus.update(menuIdTranslate, {
        enabled: llmProvider.getCanTranslateText()
    })

    messenger.menus.update(subMenuIdTranslateAnd, {
        enabled: llmProvider.getCanTranslateText()
    })
    // <-- canTranslateText
}

