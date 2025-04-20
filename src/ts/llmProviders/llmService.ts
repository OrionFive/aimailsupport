import { GenericProvider } from './genericProvider'
import { PromptManager } from './promptManager'
import { ConfigType } from '../helpers/configType'
import { logMessage } from '../helpers/utils'

/**
 * Orchestrates LLM requests by combining prompts from PromptManager
 * with the execution logic of a specific GenericProvider implementation.
 */
export class LlmService {
    private provider: GenericProvider
    private promptManager: PromptManager
    private config: ConfigType

    public constructor(provider: GenericProvider, promptManager: PromptManager, config: ConfigType) {
        this.provider = provider
        this.promptManager = promptManager
        this.config = config
    }

    public async rephraseText(input: string, toneOfVoice: string): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to rephrase the text: ${input}`, 'debug')
        const systemPrompt = this.promptManager.getRephrasePrompt(toneOfVoice)
        // Type assertion needed as _executePrompt is protected
        return (this.provider as any)._executePrompt(systemPrompt, input)
    }

    public async suggestImprovementsForText(input: string): Promise<string> {
        logMessage(`Request suggest improvements for the text: ${input}`, 'debug')
        const systemPrompt = this.promptManager.getSuggestImprovementsPrompt()
        return (this.provider as any)._executePrompt(systemPrompt, input)
    }

    public async suggestReplyFromText(input: string, customInstructions?: string): Promise<string> {
        logMessage(`Request to suggest a reply to the text: ${input}${customInstructions ? ' with custom instructions: ' + customInstructions : ''}`, 'debug')
        const systemPrompt = this.promptManager.getSuggestReplyPrompt()
        return (this.provider as any)._executePrompt(systemPrompt, input, customInstructions)
    }

    public async summarizeText(input: string): Promise<string> {
        logMessage(`Request to summarize the text: ${input}`, 'debug')
        const systemPrompt = this.promptManager.getSummarizePrompt()
        return (this.provider as any)._executePrompt(systemPrompt, input)
    }

    public async translateText(input: string): Promise<string> {
        logMessage(`Request to translate in ${this.config.mainUserLanguageCode} the text: ${input}`, 'debug')
        const systemPrompt = this.promptManager.getTranslatePrompt(this.config.mainUserLanguageCode)
        return (this.provider as any)._executePrompt(systemPrompt, input)
    }

    // --- Pass-through methods for non-prompt-based provider capabilities ---

    public async getSpeechFromText(input: string): Promise<Blob> {
        if (!this.provider.getCanSpeechFromText()) {
            throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
        }
        return this.provider.getSpeechFromText(input)
    }

    public async moderateText(input: string): Promise<any> {
        if (!this.provider.getCanModerateText()) {
            throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
        }
        return this.provider.moderateText(input)
    }

    public getCanSpeechFromText(): boolean {
        return this.provider.getCanSpeechFromText()
    }

    public getCanModerateText(): boolean {
        return this.provider.getCanModerateText()
    }
} 
