import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * OpenAI APIs.
 * Official documentation: https://platform.openai.com/docs/api-reference
 */
export class OpenAiGptProvider extends GenericProvider {
    private readonly temperature: number
    private readonly apiKey: string
    private readonly organizationId: string
    private readonly model: string
    private readonly text2speechAudioQuality: string
    private readonly text2speechVoice: string
    private readonly text2speechSpeed: number

    public constructor(config: ConfigType) {
        super(config)

        this.temperature = config.temperature
        this.apiKey = config.openai.apiKey
        this.organizationId = config.openai.organizationId
        this.model = config.openai.model
        this.text2speechAudioQuality = config.openai.text2speech.audioQuality
        this.text2speechVoice = config.openai.text2speech.voice
        this.text2speechSpeed = config.openai.text2speech.speed
    }

    /**
     * Generates speech from text using OpenAI's TTS API.
     * @param input Text to convert to speech (max 4096 chars).
     * @returns A Promise resolving to the audio Blob.
     */
    public async getSpeechFromText(input: string): Promise<Blob> {
        logMessage(`OpenAI: Request for text2speech of text: "${input.substring(0, 50)}..."`, 'debug')

        // https://platform.openai.com/docs/api-reference/audio/createSpeech
        if (input.length > 4096) {
            logMessage('OpenAI: Text too long for TTS (> 4096 chars).', 'error')
            throw new Error('OpenAI TTS error: The text is too long (max 4096 characters).')
        }

        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData: string = JSON.stringify({
            'model': this.text2speechAudioQuality,
            'input': input,
            'voice': this.text2speechVoice,
            'speed': this.text2speechSpeed
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `OpenAI TTS API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `OpenAI TTS API error: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('OpenAI TTS: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }
            logMessage('OpenAI TTS: Received audio blob.', 'debug')
            return await response.blob()

        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('OpenAI TTS: Request timed out.', 'error')
                throw new Error('OpenAI TTS request timed out.');
            }
            logMessage(`OpenAI TTS: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('OpenAI TTS request failed');
        }
    }

    /**
     * Classifies text using OpenAI's Moderation API.
     * @param input Text to classify.
     * @returns A Promise resolving to an object with translated category names and scores (0-100).
     */
    public async moderateText(input: string): Promise<{ [key: string]: number }> {
        logMessage(`OpenAI: Request for moderation of text: "${input.substring(0, 50)}..."`, 'debug')
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            // 'model': 'text-moderation-latest', // Using latest as per docs
            'input': input
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        try {
            const response = await fetch('https://api.openai.com/v1/moderations', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `OpenAI Moderation API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `OpenAI Moderation API error: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('OpenAI Moderation: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const jsonData = await response.json()
            logMessage('OpenAI Moderation: Received classification results.', 'debug')
            return this.normalizeModerationResponse(jsonData)

        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('OpenAI Moderation: Request timed out.', 'error')
                throw new Error('OpenAI Moderation request timed out.');
            }
            logMessage(`OpenAI Moderation: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('OpenAI Moderation request failed');
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

        if (this.organizationId) {
            headers.append('OpenAI-Organization', this.organizationId)
        }

        return headers
    }

    /**
     * Executes a prompt using the OpenAI Chat Completions API.
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
            logMessage(`OpenAI: Appending custom instructions to system prompt.`, 'debug')
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
            logMessage(`OpenAI: Sending request to model ${this.model} with system prompt: "${finalSystemPrompt.substring(0, 100)}..."`, 'debug');
            const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions)
            clearAbortSignalWithTimeout()

            if (!response.ok) {
                let errorMsg = `OpenAI Chat API error: ${response.status} ${response.statusText}`;
                try {
                    const errorResponse = await response.json();
                    errorMsg = `OpenAI Chat API error: ${errorResponse?.error?.message || 'Unknown error'}`;
                } catch (jsonError) {
                    logMessage('OpenAI Chat: Failed to parse error response JSON.', 'warn');
                }
                logMessage(errorMsg, 'error')
                throw new Error(errorMsg)
            }

            const responseData = await response.json()
            logMessage(`OpenAI Chat: Received response.`, 'debug')

            // Check response structure
            if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
                return responseData.choices[0].message.content
            } else {
                logMessage('OpenAI Chat: Received empty or unexpected response format.', 'warn')
                return '';
            }
        } catch (error) {
            clearAbortSignalWithTimeout()
            if (error instanceof Error && error.name === 'AbortError') {
                logMessage('OpenAI Chat: Request timed out.', 'error')
                throw new Error('OpenAI Chat request timed out.');
            }
            logMessage(`OpenAI Chat: Request failed - ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error instanceof Error ? error : new Error('OpenAI Chat request failed');
        }
    }

    /**
     * Normalizes the moderation response by rounding scores and translating keys.
     *
     * It takes the first result from the provided JSON data and processes its
     * category scores. Uses localization keys like 'mailModerate.openaiClassification.hate_threatening'.
     * See: https://platform.openai.com/docs/guides/moderation/quickstart
     *
     * @param data - The raw JSON response data from the Moderation API.
     * @returns An object mapping translated category names to rounded scores (0-100).
     */
    private normalizeModerationResponse(data: any): { [key: string]: number } {
        // Basic check for expected structure
        if (!data?.results?.[0]?.category_scores) {
            logMessage('OpenAI Moderation: Unexpected response structure for normalization.', 'warn');
            return {};
        }

        const categoryScores = data.results[0].category_scores
        const normalizedScores: { [key: string]: number } = {}

        for (const category in categoryScores) {
            if (Object.prototype.hasOwnProperty.call(categoryScores, category)) {
                try {
                    // Replace / with _ for localization key
                    const localizationKey = 'mailModerate.openaiClassification.' + category.replace(/\//g, '_')
                    const translatedCategory = browser.i18n.getMessage(localizationKey)

                    // Use original category name if translation fails/is missing
                    const finalCategoryName = translatedCategory || category;

                    // Round the value and store it
                    normalizedScores[finalCategoryName] = Math.round(categoryScores[category] * 100)
                } catch (error) {
                    // Handle potential errors from getMessage (e.g., missing key)
                    logMessage(`OpenAI Moderation: Failed to translate category key "${category}". Using original name.`, 'warn');
                    normalizedScores[category] = Math.round(categoryScores[category] * 100)
                }
            }
        }

        return normalizedScores
    }
}
