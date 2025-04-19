import { ProviderFactory } from './llmProviders/providerFactory'
import { getConfigs, getCurrentMessageContent, logMessage, sendMessageToActiveTab } from './helpers/utils'

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

// --- Separator before Custom ---
messenger.menus.create({
    id: 'aiSuggestReplySeparator',
    type: 'separator',
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyCustom = messenger.menus.create({
    id: 'aiSuggestReplyCustom',
    title: browser.i18n.getMessage('mailSuggestReply.custom'),
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
        handleSuggestReply(info, llmProvider)
    }
    else if (info.menuItemId === menuIdSuggestReplyCustom) {
        handleSuggestCustomReply(info, llmProvider)
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
            // For plain text, find the original email header - match only at the beginning of a line
            // The word boundary \b ensures we don't match 'on' within other words
            const emailHeaderRegex = /\n\s*(\bOn\b .+wrote:)/;
            const match = emailHeaderRegex.exec(content);

            if (match && match.index) {
                // Found the email header - replace everything before it
                logMessage(`Found email header at position ${match.index}, match: "${match[1]}"`, 'log');
                const newContent = formattedReply + '\n\n' + content.substring(match.index);
                await browser.compose.setComposeDetails(tabId, { plainTextBody: newContent });
            } else {
                // Try a more specific regex for various date formats in email headers
                const dateHeaderRegex = /\n\s*(\bOn\b .+\d{1,4}[\/,-]\d{1,2}[\/,-]\d{1,4})/;
                const dateMatch = dateHeaderRegex.exec(content);

                if (dateMatch && dateMatch.index) {
                    logMessage(`Found date header at position ${dateMatch.index}, match: "${dateMatch[1]}"`, 'log');
                    const newContent = formattedReply + '\n\n' + content.substring(dateMatch.index);
                    await browser.compose.setComposeDetails(tabId, { plainTextBody: newContent });
                    return;
                }

                // Look for multi-line quote patterns as fallback
                const quoteMatch = content.match(/\n\s*(>[^\n]+\n\s*>[^\n]+)/);

                if (quoteMatch && quoteMatch.index) {
                    // Found multi-line quote - replace everything before it
                    logMessage(`Found multi-line quote at position ${quoteMatch.index}`, 'log');
                    const newContent = formattedReply + '\n\n' + content.substring(quoteMatch.index);
                    await browser.compose.setComposeDetails(tabId, { plainTextBody: newContent });
                } else {
                    // No quotes found - just use our reply
                    logMessage('No quote indicators found, using just our reply', 'log');
                    await browser.compose.setComposeDetails(tabId, { plainTextBody: formattedReply });
                }
            }
        } else {
            // HTML handling
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const bodyElement = doc.body;

            if (!bodyElement) {
                // No body found - just use our reply
                await browser.compose.setComposeDetails(tabId, { body: formattedReply });
                return;
            }

            // Get the body HTML
            const bodyHTML = bodyElement.innerHTML;

            // Find the real email header (using word boundary \b to match whole "On" word)
            const emailHeaderRegex = /(\b(?:On|From|Date).+\d{1,4}[\/,-]\d{1,2}[\/,-]\d{1,4})/i;
            const match = emailHeaderRegex.exec(bodyHTML);

            if (match && match.index) {
                // Found email header - replace everything before it
                logMessage(`Found email header in HTML at position ${match.index}, match: "${match[1]}"`, 'log');
                const newBodyHTML = formattedReply + '<br>' + bodyHTML.substring(match.index);
                bodyElement.innerHTML = newBodyHTML;
            } else {
                // Try to find a blockquote which typically contains the quoted email
                const blockquoteIndex = bodyHTML.indexOf('<blockquote');

                if (blockquoteIndex !== -1) {
                    // Found a blockquote - replace everything before it
                    logMessage(`Found blockquote at position ${blockquoteIndex}`, 'log');
                    const newBodyHTML = formattedReply + '<br>' + bodyHTML.substring(blockquoteIndex);
                    bodyElement.innerHTML = newBodyHTML;
                } else {
                    // Try to find a sequence of quoted lines (>)
                    const quoteIndex = bodyHTML.indexOf('&gt;');

                    if (quoteIndex !== -1) {
                        logMessage(`Found quote marker at position ${quoteIndex}`, 'log');
                        const newBodyHTML = formattedReply + '<br>' + bodyHTML.substring(quoteIndex);
                        bodyElement.innerHTML = newBodyHTML;
                    } else {
                        // No email quote found - just use our reply
                        logMessage('No quote indicators found in HTML', 'log');
                        bodyElement.innerHTML = formattedReply;
                    }
                }
            }

            // Serialize the document back to HTML
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
 * Opens a popup window to get custom reply instructions from the user.
 */
async function handleSuggestCustomReply(info: browser.menus.OnClickData, llmProvider: any): Promise<void> {
    logMessage('Opening custom reply dialog', 'log');
    const promptId = 'customReplySuggest';

    // --- Get context BEFORE opening dialog --- 
    let initialContext: string | null = null;
    let initialTabId: number | undefined = undefined;
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        initialTabId = tabs[0]?.id;
        if (!initialTabId) {
            throw new Error("Could not get active tab ID for context.");
        }
        // Assuming getCurrentMessageContent works for compose context initially
        initialContext = await getCurrentMessageContent();
        if (initialContext === null) {
            throw new Error("Could not get initial message context.");
        }
        logMessage(`Got initial context for tab ${initialTabId}`, 'log');
    } catch (error) {
        logMessage(`Failed to get initial context: ${error}`, 'error');
        sendMessageToActiveTab({ type: 'showError', content: `Failed to get context: ${error.message}` });
        return; // Don't proceed if context fetching fails
    }
    // --- End context fetching ---

    try {
        const params = new URLSearchParams({
            promptId: promptId,
            title: 'Custom Reply Instructions',
            label: 'Enter reply instructions:',
            buttonText: 'Suggest Reply',
            defaultValue: ''
        });
        const dialogUrl = `dialogs/customReplyDialog.html?${params.toString()}`;

        const newWindow = await browser.windows.create({
            url: dialogUrl,
            type: 'popup',
            width: 400,
            height: 250
        });

        // Track the opened dialog window with context
        if (newWindow.id) {
            pendingDialogs.set(newWindow.id, { promptId, context: initialContext, tabId: initialTabId }); // Store context & tabId
            logMessage(`Tracking dialog window ${newWindow.id} for prompt ${promptId}`, 'log');
        } else {
            logMessage('Could not get window ID for created dialog', 'warn');
        }

    } catch (error) {
        logMessage(`Error opening custom reply dialog: ${error}`, 'error');
        sendMessageToActiveTab({ type: 'showError', content: `Error opening dialog: ${error.message}` });
    }
}

/**
 * Handle suggesting a reply for selected or current message text
 * Now accepts optional custom instructions and an optional targetTabId.
 */
async function handleSuggestReply(
    info: browser.menus.OnClickData,
    llmProvider: any,
    customInstructions: string | null = null,
    targetTabId?: number // Added optional tabId
): Promise<void> {
    // Use targetTabId if provided, otherwise try to find active tab (for non-dialog flows)
    let effectiveTabId = targetTabId;
    if (!effectiveTabId) {
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            effectiveTabId = tabs[0]?.id;
        } catch (e) { /* Ignore error, proceed without tab ID if necessary */ }
    }

    // Send thinking message TO THE SPECIFIC TAB if ID is known
    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') }, effectiveTabId);
    logMessage(`handling suggest reply (custom: ${!!customInstructions}, tab: ${effectiveTabId})`, 'log');

    try {
        // Use context from info.selectionText if customInstructions are provided (it was pre-filled)
        // Otherwise, use selection or fetch current content.
        const textForContext = customInstructions ? info.selectionText : (info.selectionText ? info.selectionText : await getCurrentMessageContent());

        if (textForContext == null) { // Simplified check
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') }, effectiveTabId);
            return;
        }

        let textSuggested: string;

        if (customInstructions) {
            // Pass the pre-filled context and custom instructions
            textSuggested = await llmProvider.suggestReplyFromText(textForContext, null, customInstructions);
        } else {
            // Original logic for predefined tones, using fetched/selected context
            const toneOfVoice = (info.menuItemId as string).substring(14).toLowerCase();
            textSuggested = await llmProvider.suggestReplyFromText(textForContext, toneOfVoice);
        }

        // Show the reply in the panel of THE SPECIFIC TAB
        sendMessageToActiveTab({ type: 'addText', content: textSuggested }, effectiveTabId);

        // Try to insert the reply into the compose window OF THE SPECIFIC TAB
        if (effectiveTabId) {
            try {
                await insertReplyIntoComposeWindow(effectiveTabId, textSuggested);
            } catch (error) {
                logMessage(`Failed to insert reply automatically into tab ${effectiveTabId}: ${error}`, 'error');
                sendMessageToActiveTab({ type: 'showError', content: `${messenger.i18n.getMessage('errorSuggestReplyInsertFailed')}: ${error.message}` }, effectiveTabId);
            }
        } else {
            logMessage('Could not determine target tab ID to insert reply.', 'warn');
            // Cannot insert without tab ID, but message was shown in panel if active tab was found earlier
        }
    } catch (error) {
        sendMessageToActiveTab({ type: 'showError', content: error.message }, effectiveTabId);
        logMessage(`Error during reply generation: ${error.message}`, 'error');
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
        logMessage(`Retrieved and removed dialog data for window ${senderWindowId}`, 'log');

        // Route based on promptId
        if (dialogData.promptId === 'customReplySuggest') {
            if (message.status === 'submitted' && message.value) {

                // --- Use stored context and call handleSuggestReply ---
                if (dialogData.context === null || dialogData.tabId === undefined) {
                    logMessage(`Error: Stored context or tabId is invalid for prompt ${dialogData.promptId}`, 'error');
                    sendMessageToActiveTab({ type: 'showError', content: 'Internal error: Could not retrieve original context.' });
                    return;
                }

                const configs = await getConfigs();
                const llmProvider = ProviderFactory.getInstance(configs);
                try {
                    // Create dummy info object with STORED context
                    const dummyInfo: Partial<browser.menus.OnClickData> = {
                        menuItemId: menuIdSuggestReplyCustom,
                        selectionText: dialogData.context // Use stored context
                    };
                    // Call handleSuggestReply, passing the submitted value, stored context (via dummyInfo),
                    // AND the stored tabId for targeting the reply insertion.
                    await handleSuggestReply(dummyInfo as browser.menus.OnClickData, llmProvider, message.value, dialogData.tabId);
                } catch (error) {
                    logMessage(`Error handling custom reply submission: ${error}`, 'error');
                    sendMessageToActiveTab({ type: 'showError', content: `Error processing custom reply: ${error.message}` });
                }
                // --- End custom reply handling ---
            }
            // No need to handle status === 'cancelled', onRemoved handles it
        }
        // --- Add more else if blocks here for other promptIds in the future ---
        else {
            logMessage(`Received dialog response with unknown promptId: ${dialogData.promptId}`, 'warn');
        }
    }
    // Handle other message types if any...
});

// --- Listener for window removal (handles cancellation) ---
browser.windows.onRemoved.addListener((closedWindowId) => {
    if (pendingDialogs.has(closedWindowId)) {
        const { promptId, context, tabId } = pendingDialogs.get(closedWindowId);
        logMessage(`Dialog window ${closedWindowId} (prompt: ${promptId}) was closed without submitting. Treating as cancel.`, 'log');

        // Trigger cancellation logic based on promptId if needed
        if (promptId === 'customReplySuggest') {
            // Optionally notify user or perform specific cleanup for this prompt
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
