import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

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
     * Returns an array of model IDs for all available LM Studio models in
     * the local installation.
     */
    public static async getModels(serviceUrl: string): Promise<string[]> {
        const requestOptions: RequestInit = {
            method: 'GET',
            redirect: 'follow'
        }

        const response = await fetch(`${serviceUrl}/v1/models`, requestOptions)

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`AI Studio error: ${errorResponse.error.message}`)
        }

        const responseData = await response.json()

        // Return an array of model IDs from the response data
        return responseData.data.map((model: { id: string }) => model.id)
    }

    public async rephraseText(input: string, toneOfVoice: string): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to rephrase the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.REPHRASE.replace('%s', toneOfVoice), input)
    }

    public async suggestImprovementsForText(input: string): Promise<string> {
        logMessage(`Request suggest improvements for the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_IMPROVEMENTS, input)
    }

    public async suggestReplyFromText(input: string, customInstructions?: string): Promise<string> {
        logMessage(`Request to suggest a reply to the text: ${input}${customInstructions ? ' with custom instructions: ' + customInstructions : ''}`, 'debug')

        let prompt = this.PROMPTS.SUGGEST_REPLY;
        if (customInstructions) {
            prompt += `\n\nFollow these additional instructions/comments from the recipient: ${customInstructions}`;
        }

        return this.manageMessageContent(prompt, input)
    }

    public async summarizeText(input: string): Promise<string> {
        logMessage(`Request to summarize the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUMMARIZE, input)
    }

    public async testIntegration(): Promise<void> {
        await this.translateText('Hi!')
    }

    public async translateText(input: string): Promise<string> {
        logMessage(`Request to translate in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.TRANSLATE.replace('%s', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    /**
     * This asynchronous method manages message content by sending a request
     * to the AI Studio API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the AI Studio API.
     *
     * @param systemInput - The input for the 'system' role in the conversation.
     * @param userInput - The input for the 'user' role in the conversation.
     *
     * @returns A promise that resolves to the content of the response message
     *          from the API.
     *
     * @throws An error if the API response is not successful.
     */
    private async manageMessageContent(systemInput: string, userInput: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        // The AI Studio APIs explicitly require the declaration of the header
        // field with a content type set to application/json.
        const headers: Headers = new Headers()
        headers.append('Content-Type', 'application/json')

        const requestData = JSON.stringify({
            'model': this.model,
            'messages': [
                { 'role': 'system', 'content': systemInput },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch(`${this.serviceUrl}/v1/chat/completions`, requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`LM Studio error: ${errorResponse.error}`)
        }

        const responseData = await response.json()
        return responseData.choices[0].message.content
    }
}
