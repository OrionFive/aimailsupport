/**
 * Definition of a generic class for the implementation of an LLM service provider,
 * which all actual implementations must extend.
 */
import { ConfigType } from '../helpers/configType'

export abstract class GenericProvider {
    protected mainUserLanguageCode: string
    protected servicesTimeout: number

    public constructor(config: ConfigType) {
        this.mainUserLanguageCode = config.mainUserLanguageCode
        this.servicesTimeout = config.servicesTimeout
    }

    /**
     * Executes a given prompt against the provider's API.
     *
     * This is the core method that subclasses must implement to interact with
     * their specific LLM API.
     *
     * @param systemPrompt - The system-level instructions or context for the LLM.
     * @param userInput - The user's direct input or query.
     * @param customInstructions - Optional user-provided instructions to append or integrate.
     *                         How these are integrated depends on the specific provider implementation.
     *
     * @returns A Promise resolving to the LLM's response text.
     *
     * @throws An error if the API request fails.
     */
    protected abstract _executePrompt(systemPrompt: string, userInput: string, customInstructions?: string): Promise<string>;

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

    // Methods to verify if the object implementing a particular LLM service has
    // specific capabilities.
    public getCanModerateText(): boolean {
        // Check if moderateText is overridden from the base implementation.
        return this.moderateText !== GenericProvider.prototype.moderateText
    }

    public getCanSpeechFromText(): boolean {
        // Check if getSpeechFromText is overridden.
        return this.getSpeechFromText !== GenericProvider.prototype.getSpeechFromText
    }

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
