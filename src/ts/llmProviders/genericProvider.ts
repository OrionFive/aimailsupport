/**
 * Definition of a generic class for the implementation of an LLM service provider,
 * which all actual implementations must extend.
 */
import { ConfigType } from '../helpers/configType'

export class GenericProvider {
    protected mainUserLanguageCode: string
    protected servicesTimeout: number

    protected readonly PROMPTS = {
        REPHRASE: 'Take the following text and rephrase it using a %s style and the same language as the text',
        SUGGEST_IMPROVEMENTS: 'Suggest improvements to the content of the following email, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers',
        SUGGEST_REPLY: 'Suggest a response to the email content in the same language and tone, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers',
        SUMMARIZE: 'Summarize the email content in the same language as the email, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers',
        TRANSLATE: 'Translate the email content to %s, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers'
    }

    public constructor(config: ConfigType) {
        this.mainUserLanguageCode = config.mainUserLanguageCode
        this.servicesTimeout = config.servicesTimeout
    }

    /**
     * Converts text to speech.
     *
     * @param input - The input text to be converted.
     *
     * @returns A Promise resolving to the converted text as a Blob.
     */
    public async getSpeechFromText(input: string): Promise<Blob> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Moderates the input string.
     * 
     * @param input - The string to be moderated.
     *
     * @returns A promise that resolves to the moderated JSON object.
     */
    public async moderateText(input: string): Promise<any> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Rephrase the input text according to the specified tone of voice
     * and provide a modified version.
     *
     * @param input - The input text to be rephrased.
     * @param toneOfVoice - The town on voice to be applied for rewriting
     *        (e.g., "formal", "creative", "polite", ...).
     *
     * @returns A Promise resolving to the rephrased version of the input
     *          text based on the specified style.
     */
    public async rephraseText(input: string, toneOfVoice: string): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Suggests improvements to the provided text input to enhance its clarity,
     * tone, or overall quality.
     *
     * @param input - The input text to be analyzed and improved.
     *
     * @returns A Promise resolving to the improved version of the input text.
     */
    public async suggestImprovementsForText(input: string): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Provides a suggested reply based on the input text according to the
     * specified tone of voice.
     *
     * @param input - The input text for which a reply is suggested.
     * @param customInstructions - Optional custom instructions provided by the user.
     *
     * @returns A Promise resolving to the suggested reply.
     */
    public async suggestReplyFromText(input: string, customInstructions?: string): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Summarizes the input text.
     *
     * @param input - The input text to be summarized.
     *
     * @returns A Promise resolving to the summarized text.
     */
    public async summarizeText(input: string): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Tests the integration of the provider.
     *
     * @returns A Promise resolving to void.
     */
    public async testIntegration(): Promise<void> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Translates the input text.
     *
     * @param input - The input text to be translated.
     *
     * @returns A Promise resolving to the translated text.
     */
    public async translateText(input: string): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    // Methods to verify if the object implementing a particular LLM service has
    // specific capabilities.
    // This is done by checking that the current class actually has a specific
    // implementation for the reference method. -->
    public getCanModerateText(): boolean {
        return this.moderateText !== GenericProvider.prototype.moderateText
    }

    public getCanRephraseText(): boolean {
        return this.rephraseText !== GenericProvider.prototype.rephraseText
    }

    public getCanSpeechFromText(): boolean {
        return this.getSpeechFromText !== GenericProvider.prototype.getSpeechFromText
    }

    public getCanSuggestImprovementsForText(): boolean {
        return this.suggestImprovementsForText !== GenericProvider.prototype.suggestImprovementsForText
    }

    public getCanSuggestReply(): boolean {
        return this.suggestReplyFromText !== GenericProvider.prototype.suggestReplyFromText
    }

    public getCanSummarizeText(): boolean {
        return this.summarizeText !== GenericProvider.prototype.summarizeText
    }

    public getCanTranslateText(): boolean {
        return this.translateText !== GenericProvider.prototype.translateText
    }
    // <-- check capabilities

    /**
     * This function initializes an AbortController and sets a timeout to automatically
     * abort the signal after the given duration.
     * It also provides a clear function to cancel the timeout if the request completes
     * successfully before the timeout.
     *
     * The AbortSignal can be used to interrupt remote calls, ensuring that long-running
     * requests do not hang indefinitely. By passing this signal to a fetch request,
     * the request will be aborted if it takes longer than the specified timeout.
     *
     * @param timeout - The duration in seconds after which the request should be
     *        aborted.
     *
     * @returns An object containing the AbortSignal and a clear function.
     */
    protected createAbortSignalWithTimeout(timeout: number): {
        signal: AbortSignal,
        clearAbortSignalWithTimeout: () => void
    } {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout * 1000)

        // Function to clear the timeout if the request completes successfully
        function clearAbortSignalWithTimeout() {
            clearTimeout(timeoutId)
        }

        return { signal: controller.signal, clearAbortSignalWithTimeout }
    }
}
