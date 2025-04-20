/**
 * Factory class responsible for creating instances of AI LLM providers based on the
 * provided configuration.
 */
import { GenericProvider } from './genericProvider'
import { ConfigType } from '../helpers/configType'

import { AnthropicClaudeProvider } from './impl/anthropicClaudeProvider'
import { DeepseekProvider } from './impl/deepseekProvider'
import { GoogleGeminiProvider } from './impl/googleGeminiProvider'
import { GroqProvider } from './impl/groqProvider'
import { LmsProvider } from './impl/lmsProvider'
import { OllamaProvider } from './impl/ollamaProvider'
import { OpenAiGptProvider } from './impl/openAiGptProvider'
import { XaiGrokProvider } from './impl/xaiGrokProvider'

// Static map to associate the provider name with the corresponding class
const providerMap: Record<string, new (config: ConfigType) => GenericProvider> = {
    anthropic: AnthropicClaudeProvider,
    deepseek: DeepseekProvider,
    google: GoogleGeminiProvider,
    groq: GroqProvider,
    lms: LmsProvider,
    ollama: OllamaProvider,
    openai: OpenAiGptProvider,
    xai: XaiGrokProvider
}

export class ProviderFactory {

    /**
     * Returns an instance of an AI LLM provider based on the provided configuration.
     *
     * @param config - The configuration object specifying the desired provider.
     *
     * @returns An instance of the specified AI LLM provider.
     *
     * @throws Error if the configured llmProvider is invalid or not supported.
     */
    static getInstance(config: ConfigType): GenericProvider {
        const providerName = config.llmProvider;
        if (!providerName || !(providerName in providerMap)) {
            // Throw an error if the provider name is missing, null, or not in our map
            throw new Error(`Invalid or unsupported LLM provider specified in configuration: ${providerName}`);
        }
        const ProviderClass = providerMap[providerName];
        // Now we are sure ProviderClass is a valid, concrete class
        return new ProviderClass(config)
    }
}
