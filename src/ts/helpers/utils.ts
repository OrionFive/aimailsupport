import { ConfigType } from './configType'

/**
 * Simple function to remove HTML tags from text
 * @param html HTML string to sanitize
 * @returns Plain text with HTML tags removed
 */
function simpleSanitizeHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')  // Replace non-breaking spaces
        .replace(/&lt;/g, '<')    // Replace HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

/**
 * Retrieve data from browser storage for a specific key.
 * Returns null if no data is found or an error occurs.
 *
 * @param key - The key to retrieve data from storage.
 *
 * @returns A promise that resolves with the retrieved data, or null if an error
 *          occurs.
 */
export async function getConfig(key: string): Promise<any> | null {
    let config: any = null

    try {
        config = (await browser.storage.sync.get(key))[key]
    } catch (error) {
        logMessage(`An error occurred while retrieving the config for ${key}: ${error}`, 'error')
    }

    return config
}

/**
 * Retrieve all data from browser storage.
 * Returns null if no data is found or an error occurs.
 *
 * @returns A promise that resolves with the retrieved data, or null if an error
 *          occurs.
 */
export async function getConfigs(): Promise<ConfigType> | null {
    let configs: any = null

    try {
        configs = await browser.storage.sync.get(null)
    } catch (error) {
        logMessage(`An error occurred while retrieving configs: ${error}`, 'error')
    }

    return configs
}

/**
 * Retrieves the content of the currently displayed message.
 *
 * This function asynchronously fetches the content of the currently displayed
 * message.
 * It retrieves the message content in both HTML and plain text format, and
 * returns the plain text content.
 * If the plain text content is not available, it attempts to extract it from
 * the HTML content.
 *
 * @returns A Promise resolving to the plain text content of the current message.
 *          Returns `null` if the content cannot be retrieved.
 */
export async function getCurrentMessageContent(): Promise<string> {
    const tabs = await messenger.tabs.query({ active: true, currentWindow: true })

    // The text of the current message is retrieved by distinguishing two cases:
    // whether we are dealing with an email being viewed, or whether we are in the
    // case of an email being created or edited.
    //
    // The second scenario is considered only if the messageDisplayed variable is
    // not valid.
    const messageDisplayed = await messenger.messageDisplay.getDisplayedMessage(tabs[0].id)
    const composeDetails = !messageDisplayed ? await messenger.compose.getComposeDetails(tabs[0].id) : null

    let fullHtml = null
    let fullPlain = null

    // Case: Email viewing -->
    if (messageDisplayed) {
        // Starting from Thunderbird 128, it is possible to use the function:
        // await messenger.messages.listInlineTextParts(messageDisplayed.id)
        // see https://webextension-api.thunderbird.net/en/128-esr-mv2/messages.html#listinlinetextparts-messageid
        // in combination with the convertToPlainText function to "clean" the
        // HTML code (https://webextension-api.thunderbird.net/en/128-esr-mv2/messengerUtilities.html#messengerutilities-converttoplaintext).
        const full = await messenger.messages.getFull(messageDisplayed.id)
        const stack = [full]

        do {
            const currentPart = stack.pop()

            if (currentPart.body) {
                if (currentPart.contentType?.toLowerCase() == 'text/html') {
                    fullHtml = currentPart.body
                }
                else if (currentPart.contentType?.toLowerCase() == 'text/plain') {
                    fullPlain = currentPart.body
                }
            }

            if (currentPart.parts && currentPart.parts.length > 0) {
                stack.push(...currentPart.parts)
            }
        } while (stack.length > 0)
    }
    // <-- case: Email viewing
    // Case: Email creation or edit -->
    else if (composeDetails) {
        fullHtml = composeDetails.body
        fullPlain = composeDetails.plainTextBody
    }
    // <-- case: Email creation or edit

    if (fullPlain == null && fullHtml) {
        fullPlain = simpleSanitizeHtml(fullHtml);
    }

    // Remove link (https and https), newlines and extra spaces before returning
    // the plain text
    if (fullPlain) {
        fullPlain = fullPlain.replace(/https?:\/\/[^\s]+/g, '')
        fullPlain = fullPlain.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
    }

    return fullPlain || null
}

/**
 * Retrieves the extended name of a language based on its code.
 *
 * @param {string} languageCode - The language code (e.g., 'en' for English).
 *
 * @returns {string | undefined} The extended name of the language if found,
 *          otherwise 'en'.
 */
export function getLanguageNameFromCode(languageCode: string): string | undefined {
    const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

    try {
        return languageNames.of(languageCode)
    } catch (error) {
        logMessage(`Error in retrieving the language name from the code: ${error}`, 'error')
        return 'en'
    }
}

/**
 * Localizes HTML nodes with the 'data-l10n-ref' attribute.
 *
 * This function searches for all HTML nodes with the 'data-l10n-ref' attribute and
 * sets their inner HTML with the corresponding localized message obtained from the
 * internationalization message management module.
 *
 * @returns {void}
 */
export function localizeNodes(): void {
    document.querySelectorAll('[data-l10n-ref]').forEach((node: Element) => {
        const l10nRef = node.getAttribute('data-l10n-ref')
        node.innerHTML = messenger.i18n.getMessage(l10nRef)
    })
}

/**
 * Logs a message to the console if the debug mode is enabled.
 * 
 * This function checks the configuration for the 'debugMode' setting.
 * If 'debugMode' is true, it will log the provided message using the specified 
 * console method (e.g., 'log', 'error', 'warn', 'info').
 * 
 * @param message - The message to log to the console.
 * @param method - The console method to use for logging. Defaults to 'log'.
 * 
 * @returns A promise that resolves to void.
 */
export async function logMessage(message: string, method: string = 'log'): Promise<void> {
    const isDebugModeEnabled = await getConfig('debugMode')

    if (isDebugModeEnabled === true) {
        console[method](`AI Mail Support: ${message}`)
    }
}

/**
 * Sends a message to a specific tab or the currently active tab.
 *
 * @param message - An object containing the message to be sent, with
 *        properties 'type' and 'content'.
 *        The 'content' property can be a Blob object, a string or an index
 *        signature type.
 *        The index signature type is { [key: string]: number }, meaning an
 *        object whose keys are strings and values are numbers.
 *        This type is used to manage graphs.
  * @param targetTabId - (Optional) The ID of the tab to send the message to. 
 *        If not provided, the message is sent to the currently active tab.
 * @returns A Promise that resolves when the message has been sent successfully
 */
export async function sendMessageToActiveTab(message: {
    type: string,
    content: Blob | string | { [key: string]: number }
}, targetTabId?: number): Promise<void> {
    let tabIdToSend: number | undefined = targetTabId; // Use provided ID if available

    if (!tabIdToSend) {
        // Fallback: Find the currently active tab if no specific ID was given
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0 && tabs[0].id) {
                tabIdToSend = tabs[0].id;
            } else {
                logMessage('Could not find active tab to send message to.', 'warn');
                return; // Cannot send message
            }
        } catch (error) {
            logMessage(`Error querying active tab: ${error}`, 'error');
            return; // Cannot send message
        }
    }

    // Send the message to the determined tab ID
    try {
        await browser.tabs.sendMessage(tabIdToSend, message);
    } catch (error) {
        // Log error, especially "Could not establish connection..." if the tab/script is gone
        logMessage(`Error sending message to tab ${tabIdToSend}: ${error}`, 'error');
        // Optionally re-throw or handle differently if needed
        // throw error;
    }
}
