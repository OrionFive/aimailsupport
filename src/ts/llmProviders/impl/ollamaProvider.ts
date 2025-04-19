import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

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
     * Returns an array of name/model pairs for all active Ollama models in
     * the local installation.
     */
    public static async getModels(serviceUrl: string): Promise<{ name: string, model: string }[]> {
        const requestOptions: RequestInit = {
            method: 'GET',
            redirect: 'follow'
        }

        const response = await fetch(`${serviceUrl}/api/tags`, requestOptions)

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Ollama error: ${errorResponse.error.message}`)
        }

        const responseData = await response.json()

        // Extract an array of name/model pairs from the response
        const models = responseData.models.map((model: { name: string, model: string }) => ({
            name: model.name,
            model: model.model
        }))

        return models
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
     * to the Ollama API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the Ollama API.
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

        const requestData = JSON.stringify({
            'model': this.model,
            'system': systemInput,
            'prompt': userInput,
            'options': {
                'temperature': this.temperature
            },
            'stream': false
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch(`${this.serviceUrl}/api/generate`, requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Ollama error: ${errorResponse.error}`)
        }

        const responseData = await response.json()
        return responseData.response
    }
}
