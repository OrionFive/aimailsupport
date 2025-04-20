import { getLanguageNameFromCode } from '../helpers/utils'

/**
 * Manages the standard prompts used for various LLM tasks.
 */
export class PromptManager {
    private readonly PROMPTS = {
        REPHRASE: 'Take the following text and rephrase it using a %s style and the same language as the text',
        SUGGEST_IMPROVEMENTS: 'Suggest improvements to the content of the following email, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers',
        SUGGEST_REPLY: 'Suggest a response to the email content in the same language and tone, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers',
        SUMMARIZE: 'Summarize the email content in the same language as the email, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers',
        TRANSLATE: 'Translate the email content to %s, focusing only on the main message. Ignore any unusual characters, email formatting, signatures, or standard email headers'
    }

    public getRephrasePrompt(toneOfVoice: string): string {
        return this.PROMPTS.REPHRASE.replace('%s', toneOfVoice)
    }

    public getSuggestImprovementsPrompt(): string {
        return this.PROMPTS.SUGGEST_IMPROVEMENTS
    }

    public getSuggestReplyPrompt(): string {
        return this.PROMPTS.SUGGEST_REPLY
    }

    public getSummarizePrompt(): string {
        return this.PROMPTS.SUMMARIZE
    }

    public getTranslatePrompt(languageCode: string): string {
        return this.PROMPTS.TRANSLATE.replace('%s', getLanguageNameFromCode(languageCode))
    }
} 
