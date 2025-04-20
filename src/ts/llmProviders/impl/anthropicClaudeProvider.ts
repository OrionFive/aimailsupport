import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Anthropic APIs.
 * Official documentation: https://docs.anthropic.com/en/api/getting-started
 */
export class AnthropicClaudeProvider extends GenericProvider {
    private readonly temperature: number
    private readonly apiKey: string
    private readonly model: string

    public constructor(config: ConfigType) {
        super(config)

        // The temperature value is normalized based on the options, with a
        // range of 0 to 1 for Anthropic, while for other LLM models, and
        // consequently in the add-on options, values can be set between 0
        // and 2.
        this.temperature = config.temperature / 2
        this.apiKey = config.anthropic.apiKey
        this.model = config.anthropic.model
    }

    /**
     * Function to generate headers for API requests.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeader(): Headers {
        const headers: Headers = new Headers()
        headers.append('x-api-key', this.apiKey)
        headers.append('anthropic-version', '2023-06-01')
        headers.append('anthropic-dangerous-direct-browser-access', 'true')
        headers.append('Content-Type', 'application/json')

        return headers
    }

    /**
     * Executes a prompt using the Anthropic API.
     *
     * Implements the abstract method from GenericProvider.
     * It constructs a POST request with the model, temperature, system prompt
     * (potentially augmented with custom instructions), and user input.
     * Handles the API response and errors.
     *
     * @param systemPrompt - The base system prompt (e.g., task description).
     * @param userInput - The main user input text.
     * @param customInstructions - Optional additional instructions.
     *
     * @returns A promise that resolves to the text content of the API response.
     *
     * @throws An error if the API response is not successful.
     */
    protected async _executePrompt(systemPrompt: string, userInput: string, customInstructions?: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        let finalSystemPrompt = systemPrompt;
        if (customInstructions) {
            // Anthropic uses the 'system' parameter for instructions.
            // Append custom instructions to the base system prompt.
            finalSystemPrompt += `\n\nAdditional instructions: ${customInstructions}`;
            logMessage(`Anthropic: Appending custom instructions to system prompt.`, 'debug')
        }

        const requestData = JSON.stringify({
            'model': this.model,
            'temperature': this.temperature,
            'system': finalSystemPrompt,
            'messages': [
                { 'role': 'user', 'content': userInput }
            ]
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        try {
            logMessage(`Anthropic: Sending request to model ${this.model} with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch('https://api.anthropic.com/v1/messages', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `Anthropic API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `Anthropic API error: ${errorResponse?.error?.type} - ${errorResponse?.error?.message}`;
                } catch (jsonError) {
                    logMessage('Anthropic: Failed to parse error response JSON.', 'warn');
                    // Use the initial status text error message
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`Anthropic: Received response.`, 'debug')
            // Ensure content exists and has text
            if (responseData.content && responseData.content.length > 0 && responseData.content[0].text) {
                return responseData.content[0].text
            } else {
                logMessage('Anthropic: Received empty or unexpected response format.', 'warn')
                return ''; // Return empty string for unexpected format
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('Anthropic: Request timed out.', 'error')
                throw new Error('Anthropic request timed out.');
            }
            logMessage(`Anthropic: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            // Rethrow the original error or a generic one
            throw error instanceof Error ? error : new Error('Anthropic request failed');
        }
    }
}
