import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Groq Cloud APIs.
 * Official documentation: https://console.groq.com/docs/overview
 */
export class GroqProvider extends GenericProvider {
    private readonly temperature: number
    private readonly apiKey: string
    private readonly model: string

    public constructor(config: ConfigType) {
        super(config)

        this.temperature = config.temperature
        this.apiKey = config.groq.apiKey
        this.model = config.groq.model
    }

    /**
     * Returns an array of model IDs for available Groq Cloud models.
     * Requires a valid API key.
     */
    public static async getModels(apiKey: string): Promise<string[]> {
        logMessage('Groq: Fetching available models.', 'debug')
        const requestOptions: RequestInit = {
            method: 'GET',
            redirect: 'follow',
            headers: new Headers({
                'Authorization': `Bearer ${apiKey}`
            })
        }

        try {
            const response = await fetch('https://api.groq.com/openai/v1/models', requestOptions)

            if (!response.ok) {
                let errorMsg = `Groq API error fetching models: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `Groq API error fetching models: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('Groq: Failed to parse error response JSON while fetching models.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage('Groq: Successfully fetched models.', 'debug')
            // Return an array of model IDs from the response data
            if (responseData?.data && Array.isArray(responseData.data)) {
                return responseData.data
                    .map((model: { id: string }) => model.id)
                    .filter((id): id is string => typeof id === 'string'); // Ensure only strings are returned
            } else {
                logMessage('Groq: Unexpected response format when fetching models.', 'warn');
                return [];
            }
        } catch (error) {
            logMessage(`Groq: Failed to fetch models - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('Groq failed to fetch models');
        }
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
     * Executes a prompt using the Groq Cloud API (OpenAI compatible endpoint).
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
            logMessage(`Groq: Appending custom instructions to system prompt.`, 'debug')
        }

        const requestData = JSON.stringify({
            'model': this.model,
            'messages': [
                { 'role': 'system', 'content': finalSystemPrompt },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
            // 'max_tokens': ... // Consider if needed
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        try {
            logMessage(`Groq: Sending request to model ${this.model} with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `Groq Chat API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `Groq Chat API error: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('Groq Chat: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`Groq Chat: Received response.`, 'debug')

            // Check response structure
            if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
                return responseData.choices[0].message.content
            } else {
                logMessage('Groq Chat: Received empty or unexpected response format.', 'warn')
                return '';
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('Groq Chat: Request timed out.', 'error')
                throw new Error('Groq Chat request timed out.');
            }
            logMessage(`Groq Chat: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('Groq Chat request failed');
        }
    }
}
