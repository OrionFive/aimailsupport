import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * DeepSeek APIs.
 * Official documentation: https://api-docs.deepseek.com/
 */
export class DeepseekProvider extends GenericProvider {
    private readonly temperature: number = 1.0;
    private readonly apiKey: string

    public constructor(config: ConfigType) {
        super(config)
        this.apiKey = config.deepseek.apiKey
        if (typeof config.temperature === 'number') {
            this.temperature = config.temperature;
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
     * Executes a prompt using the DeepSeek API (OpenAI compatible endpoint).
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
            finalSystemPrompt += `\n\nAdditional instructions: ${customInstructions}`;
            logMessage(`DeepSeek: Appending custom instructions to system prompt.`, 'debug')
        }

        const requestData = JSON.stringify({
            'model': 'deepseek-chat',
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
            logMessage(`DeepSeek: Sending request to model deepseek-chat with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch('https://api.deepseek.com/chat/completions', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `DeepSeek Chat API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `DeepSeek Chat API error: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('DeepSeek Chat: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`DeepSeek Chat: Received response.`, 'debug')

            if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
                return responseData.choices[0].message.content
            } else {
                logMessage('DeepSeek Chat: Received empty or unexpected response format.', 'warn')
                return '';
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('DeepSeek Chat: Request timed out.', 'error')
                throw new Error('DeepSeek Chat request timed out.');
            }
            logMessage(`DeepSeek Chat: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('DeepSeek Chat request failed');
        }
    }
}
