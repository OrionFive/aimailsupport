import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * xAI Grok APIs.
 * Official documentation: https://docs.x.ai/api
 */
export class XaiGrokProvider extends GenericProvider {
    private readonly temperature: number
    private readonly apiKey: string

    public constructor(config: ConfigType) {
        super(config)

        this.temperature = config.temperature
        this.apiKey = config.xai.apiKey
    }

    /**
     * Function to generate headers for API requests.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeader(): Headers {
        const headers: Headers = new Headers()
        headers.append('Authorization', `Bearer ${this.apiKey}`)
        headers.append('Content-Type', 'application/json')

        return headers
    }

    /**
     * Executes a prompt using the xAI API.
     *
     * Implements the abstract method from GenericProvider.
     * Constructs a POST request, handles custom instructions by appending them
     * to the system prompt, and processes the API response.
     *
     * @param systemPrompt - The base system prompt.
     * @param userInput - The main user input text.
     * @param customInstructions - Optional additional instructions.
     *
     * @returns A promise that resolves to the text content of the API response.
     *
     * @throws An error if the API response is not successful or times out.
     */
    protected async _executePrompt(systemPrompt: string, userInput: string, customInstructions?: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        let finalSystemPrompt = systemPrompt;
        if (customInstructions) {
            // Append custom instructions to the system prompt
            finalSystemPrompt += `\n\nAdditional instructions: ${customInstructions}`;
            logMessage(`xAI Grok: Appending custom instructions to system prompt.`, 'debug')
        }

        const requestData = JSON.stringify({
            'model': 'grok-2-latest', // Hardcoded as per original implementation
            'messages': [
                { 'role': 'system', 'content': finalSystemPrompt },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        try {
            logMessage(`xAI Grok: Sending request with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch('https://api.x.ai/v1/chat/completions', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `xAI API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    // Adjust based on actual xAI error structure if known, assuming 'error' field for now
                    errorMsg = `xAI API error: ${errorResponse?.error || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('xAI Grok: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`xAI Grok: Received response.`, 'debug')

            // Check response structure
            if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
                return responseData.choices[0].message.content
            } else {
                logMessage('xAI Grok: Received empty or unexpected response format.', 'warn')
                return '';
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('xAI Grok: Request timed out.', 'error')
                throw new Error('xAI Grok request timed out.');
            }
            logMessage(`xAI Grok: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('xAI Grok request failed');
        }
    }
}
