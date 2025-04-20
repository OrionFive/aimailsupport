import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Ollama APIs.
 * Official documentation:
 * https://github.com/ollama/ollama/blob/main/docs/api.md
 */
export class OllamaProvider extends GenericProvider {
    private readonly temperature: number
    private readonly serviceUrl: string
    private readonly model: string

    public constructor(config: ConfigType) {
        super(config)

        this.temperature = config.temperature
        this.serviceUrl = config.ollama.serviceUrl
        this.model = config.ollama.model
    }

    /**
     * Returns an array of name/model pairs for all downloaded Ollama models
     * in the local installation.
     * Requires the Ollama server URL.
     */
    public static async getModels(serviceUrl: string): Promise<{ name: string, model: string }[]> {
        logMessage(`Ollama: Fetching available models from ${serviceUrl}.`, 'debug')
        if (!serviceUrl || !serviceUrl.startsWith('http')) {
            logMessage('Ollama: Invalid or missing service URL for getModels.', 'error')
            throw new Error('Ollama error: Invalid service URL provided.');
        }

        const requestOptions: RequestInit = {
            method: 'GET',
            redirect: 'follow'
        }

        try {
            const response = await fetch(`${serviceUrl}/api/tags`, requestOptions)

            if (!response.ok) {
                let errorMsg = `Ollama API error fetching models: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    // Ollama error structure might just be an 'error' string
                    errorMsg = `Ollama API error fetching models: ${errorResponse?.error || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('Ollama: Failed to parse error response JSON while fetching models.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage('Ollama: Successfully fetched models.', 'debug')

            // Extract an array of name/model pairs from the response
            if (responseData?.models && Array.isArray(responseData.models)) {
                return responseData.models
                    .map((model: { name: string, model: string }) => ({
                        name: model.name, // Typically includes tag, e.g., "llama2:7b"
                        model: model.model // Base model, e.g., "llama2"
                    }))
                    .filter((m): m is { name: string, model: string } => m.name && m.model);
            } else {
                logMessage('Ollama: Unexpected response format when fetching models.', 'warn');
                return [];
            }
        } catch (error) {
            logMessage(`Ollama: Failed to fetch models from ${serviceUrl} - ${error instanceof Error ? error.message : String(error)}`, 'error');
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(`Ollama: Failed to connect to server at ${serviceUrl}. Ensure the server is running and accessible.`);
            }
            throw error instanceof Error ? error : new Error('Ollama failed to fetch models');
        }
    }

    /**
     * Executes a prompt using the Ollama /api/generate endpoint.
     *
     * Implements the abstract method from GenericProvider.
     * Constructs a POST request using Ollama's specific format, handles custom
     * instructions by appending them to the system prompt, and processes the response.
     *
     * @param systemPrompt - The base system prompt.
     * @param userInput - The main user input text (becomes Ollama's 'prompt').
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
            logMessage(`Ollama: Appending custom instructions to system prompt.`, 'debug')
        }

        // Note: Ollama typically doesn't require Content-Type unless server configured differently
        const requestData = JSON.stringify({
            'model': this.model,
            'system': finalSystemPrompt,
            'prompt': userInput, // User input maps to Ollama's 'prompt' field
            'options': {
                'temperature': this.temperature
                // Add other Ollama options here if needed (e.g., num_predict, top_p)
            },
            'stream': false // Ensure non-streaming response
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Explicitly add for safety
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const endpoint = `${this.serviceUrl}/api/generate`;
        try {
            logMessage(`Ollama: Sending request to model ${this.model} at ${endpoint} with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch(endpoint, requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `Ollama Generate API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `Ollama Generate API error: ${errorResponse?.error || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('Ollama Generate: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`Ollama Generate: Received response.`, 'debug')

            // Check response structure for Ollama's /api/generate
            if (responseData && typeof responseData.response === 'string') {
                return responseData.response
            } else {
                logMessage('Ollama Generate: Received empty or unexpected response format.', 'warn')
                return '';
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('Ollama Generate: Request timed out.', 'error')
                throw new Error('Ollama Generate request timed out.');
            }
            if (error instanceof TypeError && error.message.includes('fetch')) {
                logMessage(`Ollama: Failed to connect to server at ${this.serviceUrl}. Ensure the server is running and accessible.`, 'error');
                throw new Error(`Ollama: Failed to connect to server at ${this.serviceUrl}.`);
            }
            logMessage(`Ollama Generate: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('Ollama Generate request failed');
        }
    }
}
