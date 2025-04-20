import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * LM Studio APIs.
 * Official documentation: https://lmstudio.ai/docs/api
 */
export class LmsProvider extends GenericProvider {
    private readonly temperature: number
    private readonly serviceUrl: string
    private readonly model: string

    public constructor(config: ConfigType) {
        super(config)

        this.temperature = config.temperature
        this.serviceUrl = config.lms.serviceUrl
        this.model = config.lms.model
    }

    /**
     * Returns an array of model IDs (loaded model file names) available in
     * the local LM Studio installation.
     * Requires the LM Studio server URL.
     */
    public static async getModels(serviceUrl: string): Promise<string[]> {
        logMessage(`LM Studio: Fetching available models from ${serviceUrl}.`, 'debug')
        // Basic validation for the service URL
        if (!serviceUrl || !serviceUrl.startsWith('http')) {
            logMessage('LM Studio: Invalid or missing service URL for getModels.', 'error')
            throw new Error('LM Studio error: Invalid service URL provided.');
        }

        const requestOptions: RequestInit = {
            method: 'GET',
            redirect: 'follow'
            // No Authorization header needed for local LM Studio typically
        }

        try {
            const response = await fetch(`${serviceUrl}/v1/models`, requestOptions)

            if (!response.ok) {
                let errorMsg = `LM Studio API error fetching models: ${response.status} ${response.statusText}`;
                try {
                    // LM Studio error format might differ, attempt to parse common OpenAI-like structure
                    const errorResponse = await response.json();
                    errorMsg = `LM Studio API error fetching models: ${errorResponse?.error?.message || errorResponse?.error || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('LM Studio: Failed to parse error response JSON while fetching models.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage('LM Studio: Successfully fetched models.', 'debug')
            // Return an array of model IDs from the response data
            if (responseData?.data && Array.isArray(responseData.data)) {
                return responseData.data
                    .map((model: { id: string }) => model.id)
                    .filter((id): id is string => typeof id === 'string');
            } else {
                logMessage('LM Studio: Unexpected response format when fetching models.', 'warn');
                return [];
            }
        } catch (error) {
            logMessage(`LM Studio: Failed to fetch models from ${serviceUrl} - ${error instanceof Error ? error.message : String(error)}`, 'error');
            // Add specific hint for connection errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(`LM Studio: Failed to connect to server at ${serviceUrl}. Ensure the server is running and accessible.`);
            }
            throw error instanceof Error ? error : new Error('LM Studio failed to fetch models');
        }
    }

    // testIntegration is inherited.

    /**
     * Executes a prompt using the LM Studio API (OpenAI compatible endpoint).
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
            logMessage(`LM Studio: Appending custom instructions to system prompt.`, 'debug')
        }

        // LM Studio requires Content-Type header
        const headers: Headers = new Headers()
        headers.append('Content-Type', 'application/json')

        const requestData = JSON.stringify({
            'model': this.model, // Uses the specific model file name loaded in LM Studio
            'messages': [
                { 'role': 'system', 'content': finalSystemPrompt },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
            // 'max_tokens': ... // Consider if needed
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const endpoint = `${this.serviceUrl}/v1/chat/completions`;
        try {
            logMessage(`LM Studio: Sending request to model ${this.model} at ${endpoint} with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch(endpoint, requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `LM Studio Chat API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `LM Studio Chat API error: ${errorResponse?.error?.message || errorResponse?.error || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('LM Studio Chat: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`LM Studio Chat: Received response.`, 'debug')

            // Check response structure
            if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
                return responseData.choices[0].message.content
            } else {
                logMessage('LM Studio Chat: Received empty or unexpected response format.', 'warn')
                return '';
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('LM Studio Chat: Request timed out.', 'error')
                throw new Error('LM Studio Chat request timed out.');
            }
            if (error instanceof TypeError && error.message.includes('fetch')) {
                logMessage(`LM Studio: Failed to connect to server at ${this.serviceUrl}. Ensure the server is running and accessible.`, 'error');
                throw new Error(`LM Studio: Failed to connect to server at ${this.serviceUrl}.`);
            }
            logMessage(`LM Studio Chat: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('LM Studio Chat request failed');
        }
    }
}
