import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Google AI Gemini APIs.
 * Official documentation: https://ai.google.dev/gemini-api/docs
 */
export class GoogleGeminiProvider extends GenericProvider {
    private readonly temperature: number
    private readonly apiKey: string
    private readonly model: string

    public constructor(config: ConfigType) {
        super(config)

        this.temperature = config.temperature
        this.apiKey = config.google.apiKey
        this.model = config.google.model
    }


    /**
     * Function to generate headers for API requests.
     * Note: Google Gemini API uses API key in URL query parameter.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeader(): Headers {
        const headers: Headers = new Headers()
        headers.append('Content-Type', 'application/json')
        return headers
    }

    /**
     * Executes a prompt using the Google Gemini API.
     *
     * Implements the abstract method from GenericProvider.
     * Constructs a POST request using Gemini's specific format (system_instruction,
     * contents, safety_settings), handles custom instructions by appending them
     * to the system instruction, and processes the API response, including safety checks.
     *
     * @param systemPrompt - The base system prompt.
     * @param userInput - The main user input text.
     * @param customInstructions - Optional additional instructions.
     *
     * @returns A promise that resolves to the text content of the API response.
     *
     * @throws An error if the API response is not successful, times out, or blocked by safety settings.
     */
    protected async _executePrompt(systemPrompt: string, userInput: string, customInstructions?: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        let finalSystemPrompt = systemPrompt;
        if (customInstructions) {
            finalSystemPrompt += `\n\nAdditional instructions: ${customInstructions}`;
            logMessage(`Google Gemini: Appending custom instructions to system prompt.`, 'debug')
        }

        const requestData = JSON.stringify({
            'system_instruction': {
                'parts': [{ 'text': finalSystemPrompt }]
            },
            'contents': [
                { 'role': 'user', 'parts': [{ 'text': userInput }] }
            ],
            'safety_settings': [
                { 'category': 'HARM_CATEGORY_HARASSMENT', 'threshold': 'BLOCK_NONE' },
                { 'category': 'HARM_CATEGORY_HATE_SPEECH', 'threshold': 'BLOCK_NONE' },
                { 'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold': 'BLOCK_NONE' },
                { 'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold': 'BLOCK_NONE' }
            ],
            'generationConfig': {
                'temperature': this.temperature
            }
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        try {
            logMessage(`Google Gemini: Sending request to model ${this.model} with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch(endpoint, requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `Google Gemini API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `Google Gemini API error: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('Google Gemini: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`Google Gemini: Received response.`, 'debug')

            const candidate = responseData?.candidates?.[0];
            if (candidate?.finishReason === 'SAFETY') {
                const safetyRatings = candidate.safetyRatings?.map((r: any) => `${r.category}: ${r.probability}`).join(', ') || 'No details';
                const errorMsg = browser.i18n.getMessage('errorGoogleGeminiSafetyThresholdExceeded') + ` (Details: ${safetyRatings})`;
                logMessage(`Google Gemini: Content blocked due to safety settings. Reason: ${candidate.finishReason}. Ratings: ${safetyRatings}`, 'warn')
                throw new Error(errorMsg)
            }
            if (candidate?.finishReason === 'RECITATION') {
                logMessage('Google Gemini: Content blocked due to recitation policy.', 'warn')
                throw new Error('Google Gemini: Response blocked due to recitation policy.');
            }
            if (!candidate?.content?.parts?.[0]?.text) {
                logMessage(`Google Gemini: Received empty or unexpected response format. Finish reason: ${candidate?.finishReason || 'N/A'}`, 'warn')
                if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
                    throw new Error(`Google Gemini: Response generation stopped unexpectedly. Reason: ${candidate.finishReason}`);
                }
                return '';
            }

            return candidate.content.parts[0].text

        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && (error.message.includes('safety settings') || error.message.includes('recitation policy') || error.message.includes('stopped unexpectedly'))) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('Google Gemini: Request timed out.', 'error')
                throw new Error('Google Gemini request timed out.');
            }
            logMessage(`Google Gemini: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('Google Gemini request failed');
        }
    }
}
