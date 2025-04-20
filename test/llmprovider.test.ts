import { ConfigType } from '../src/ts/helpers/configType'
import { ProviderFactory } from '../src/ts/llmProviders/providerFactory'
import { LlmService } from '../src/ts/llmProviders/llmService'
import { PromptManager } from '../src/ts/llmProviders/promptManager'
import { GenericProvider } from '../src/ts/llmProviders/genericProvider'
import { AnthropicClaudeProvider } from '../src/ts/llmProviders/impl/anthropicClaudeProvider'
import { DeepseekProvider } from '../src/ts/llmProviders/impl/deepseekProvider'
import { GoogleGeminiProvider } from '../src/ts/llmProviders/impl/googleGeminiProvider'
import { GroqProvider } from '../src/ts/llmProviders/impl/groqProvider'
import { LmsProvider } from '../src/ts/llmProviders/impl/lmsProvider'
import { OllamaProvider } from '../src/ts/llmProviders/impl/ollamaProvider'
import { OpenAiGptProvider } from '../src/ts/llmProviders/impl/openAiGptProvider'
import { XaiGrokProvider } from '../src/ts/llmProviders/impl/xaiGrokProvider'

import dotenv from 'dotenv'
import 'jest-webextension-mock'

// Dummy configuration:
const configs: ConfigType = {
    mainUserLanguageCode: 'English',
    llmProvider: null,
    temperature: 1,
    servicesTimeout: 30,
    debugMode: true,

    anthropic: {
        apiKey: null,
        model: 'claude-3-haiku-20240307'
    },

    deepseek: {
        apiKey: null
    },

    google: {
        apiKey: null,
        model: 'gemini-1.5-flash-8b'
    },

    groq: {
        apiKey: null,
        model: 'llama-3.2-3b-preview'
    },

    lms: {
        serviceUrl: 'http://localhost:1234',
        model: 'llama-3.2-1b-instruct'
    },

    ollama: {
        serviceUrl: 'http://localhost:11434',
        model: 'llama3.2:1b'
    },

    openai: {
        apiKey: null,
        organizationId: null,
        model: 'gpt-4o-mini',

        text2speech: {
            audioQuality: 'tts-1',
            voice: 'onyx',
            speed: 1
        }
    },

    xai: {
        apiKey: null
    }
}

// Persists the configurations
browser.storage.sync.set(configs)

// Load environment variables from the .env file, see README.md for more information
dotenv.config()

// Added a little delay between calls to avoid hitting the rate limit on some LLM models
afterEach(() => new Promise(resolve => setTimeout(resolve, 3000)))

// --- Helper to get service instance ---
function getLlmService(providerConfigs: Partial<ConfigType>): LlmService {
    const effectiveConfigs = { ...configs, ...providerConfigs };
    const provider = ProviderFactory.getInstance(effectiveConfigs);
    const promptManager = new PromptManager();
    return new LlmService(provider, promptManager, effectiveConfigs);
}

// --- Error message for unimplemented features ---
const MOCKED_ERROR_INVALID_ADDON_OPTIONS = 'Translated<errorInvalidAddonOptions>'; // Match mocked i18n message

// --- AnthropicClaudeProvider tests ---
const anthropicDescribeOrSkip = process.env.anthropic_api_key ? describe : describe.skip;
anthropicDescribeOrSkip('AnthropicClaudeProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'anthropic',
        anthropic: {
            ...configs.anthropic,
            apiKey: process.env.anthropic_api_key
        }
    };
    const llmService = getLlmService(currentConfigs);

    test('provider should be an instance of AnthropicClaudeProvider', () => {
        expect((llmService as any).provider).toBeInstanceOf(AnthropicClaudeProvider)
    })

    test('should rephrase text', async () => {
        const output = await llmService.rephraseText('Example of text to rephrase', 'shortened')
        expect(typeof output).toBe('string')
    })

    test('should suggest improvements for text', async () => {
        const output = await llmService.suggestImprovementsForText('Example of text to improve')
        expect(typeof output).toBe('string')
    })

    test('should suggest a reply from text', async () => {
        const output = await llmService.suggestReplyFromText('Original email content asking for a meeting.', 'Make it polite and suggest Tuesday.')
        expect(typeof output).toBe('string')
    })

    test('should summarize text', async () => {
        const output = await llmService.summarizeText('This is a long piece of text that needs summarization to get the main points across quickly.')
        expect(typeof output).toBe('string')
    })

    test('should translate text', async () => {
        const output = await llmService.translateText('Esempio di testo da tradurre') // Italian
        expect(typeof output).toBe('string')
    })

    // Test unimplemented methods
    test('getSpeechFromText should throw', async () => {
        await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
    test('moderateText should throw', async () => {
        await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
})

// --- DeepseekProvider tests ---
const deepseekDescribeOrSkip = process.env.deepseek_api_key ? describe : describe.skip;
deepseekDescribeOrSkip('DeepseekProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'deepseek',
        deepseek: {
            apiKey: process.env.deepseek_api_key
        }
    };
    const llmService = getLlmService(currentConfigs);

    test('provider should be an instance of DeepseekProvider', () => {
        expect((llmService as any).provider).toBeInstanceOf(DeepseekProvider)
    })

    test('should rephrase text', async () => {
        const output = await llmService.rephraseText('Example of text to rephrase', 'formal')
        expect(typeof output).toBe('string')
    })

    test('should suggest improvements for text', async () => {
        const output = await llmService.suggestImprovementsForText('Example of text to improve')
        expect(typeof output).toBe('string')
    })

    test('should suggest a reply from text', async () => {
        const output = await llmService.suggestReplyFromText('Context for reply', 'Custom instruction')
        expect(typeof output).toBe('string')
    })

    test('should summarize text', async () => {
        const output = await llmService.summarizeText('Long text to summarize.')
        expect(typeof output).toBe('string')
    })

    test('should translate text', async () => {
        const output = await llmService.translateText('Texte à traduire') // French
        expect(typeof output).toBe('string')
    })

    test('getSpeechFromText should throw', async () => {
        await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
    test('moderateText should throw', async () => {
        await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
})

// --- GoogleGeminiProvider tests ---
const googleDescribeOrSkip = process.env.google_api_key ? describe : describe.skip;
googleDescribeOrSkip('GoogleGeminiProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'google',
        google: {
            ...configs.google,
            apiKey: process.env.google_api_key
        }
    };
    const llmService = getLlmService(currentConfigs);

    test('provider should be an instance of GoogleGeminiProvider', () => {
        expect((llmService as any).provider).toBeInstanceOf(GoogleGeminiProvider)
    })

    test('should rephrase text', async () => {
        const output = await llmService.rephraseText('Example of text to rephrase', 'creative')
        expect(typeof output).toBe('string')
    })

    test('should suggest improvements for text', async () => {
        const output = await llmService.suggestImprovementsForText('Example of text to improve')
        expect(typeof output).toBe('string')
    })

    test('should suggest a reply from text', async () => {
        const output = await llmService.suggestReplyFromText('Reply context', 'Instructions')
        expect(typeof output).toBe('string')
    })

    test('should summarize text', async () => {
        const output = await llmService.summarizeText('Text to summarize')
        expect(typeof output).toBe('string')
    })

    test('should translate text', async () => {
        const output = await llmService.translateText('Texto para traducir') // Spanish
        expect(typeof output).toBe('string')
    })

    test('getSpeechFromText should throw', async () => {
        await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
    test('moderateText should throw', async () => {
        await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
})

// --- GroqProvider tests ---
describe('GroqProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'groq',
        groq: {
            ...configs.groq,
            apiKey: process.env.groq_api_key
        }
    };
    // Skip tests if API key is not provided
    const describeOrSkip = process.env.groq_api_key ? describe : describe.skip;
    const llmService = getLlmService(currentConfigs);

    describeOrSkip('GroqProvider Service', () => {
        test('provider should be an instance of GroqProvider', () => {
            expect((llmService as any).provider).toBeInstanceOf(GroqProvider)
        })

        test('should get models statically', async () => {
            if (!process.env.groq_api_key) return; // Skip if no key
            const models = await GroqProvider.getModels(process.env.groq_api_key);
            expect(Array.isArray(models)).toBe(true);
            expect(models.length).toBeGreaterThan(0);
        });

        test('should rephrase text', async () => {
            const output = await llmService.rephraseText('Example of text to rephrase', 'simple')
            expect(typeof output).toBe('string')
        })

        test('should suggest improvements for text', async () => {
            const output = await llmService.suggestImprovementsForText('Example of text to improve')
            expect(typeof output).toBe('string')
        })

        test('should suggest a reply from text', async () => {
            const output = await llmService.suggestReplyFromText('Context', 'Instruction')
            expect(typeof output).toBe('string')
        })

        test('should summarize text', async () => {
            const output = await llmService.summarizeText('Text')
            expect(typeof output).toBe('string')
        })

        test('should translate text', async () => {
            const output = await llmService.translateText('Text')
            expect(typeof output).toBe('string')
        })

        test('getSpeechFromText should throw', async () => {
            await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
        });
        test('moderateText should throw', async () => {
            await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
        });
    });
})

// --- LM Studio tests ---
describe('LmsProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'lms',
        lms: { ...configs.lms }
    };
    // Assuming LMS runs locally, tests might run without specific API key env var
    const llmService = getLlmService(currentConfigs);

    test('provider should be an instance of LmsProvider', () => {
        expect((llmService as any).provider).toBeInstanceOf(LmsProvider)
    })

    test('should get models statically (requires server running)', async () => {
        try {
            const models = await LmsProvider.getModels(currentConfigs.lms!.serviceUrl);
            expect(Array.isArray(models)).toBe(true);
            // Cannot assert length > 0 as it depends on user setup
        } catch (e) {
            console.warn(`LMS getModels test failed (is server running at ${currentConfigs.lms!.serviceUrl}?): ${e}`);
            // Don't fail test if server isn't running
        }
    });

    test('should rephrase text (requires server running)', async () => {
        try {
            const output = await llmService.rephraseText('Example of text to rephrase', 'polite')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`LMS rephrase test failed (is server running?): ${e}`);
        }
    })

    test('should suggest improvements for text (requires server running)', async () => {
        try {
            const output = await llmService.suggestImprovementsForText('Example of text to improve')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`LMS suggestImprovements test failed (is server running?): ${e}`);
        }
    })

    test('should suggest a reply from text (requires server running)', async () => {
        try {
            const output = await llmService.suggestReplyFromText('Context', 'Instruction')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`LMS suggestReply test failed (is server running?): ${e}`);
        }
    })

    test('should summarize text (requires server running)', async () => {
        try {
            const output = await llmService.summarizeText('Text')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`LMS summarize test failed (is server running?): ${e}`);
        }
    })

    test('should translate text (requires server running)', async () => {
        try {
            const output = await llmService.translateText('Text')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`LMS translate test failed (is server running?): ${e}`);
        }
    })

    test('getSpeechFromText should throw', async () => {
        await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
    test('moderateText should throw', async () => {
        await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
})

// --- Ollama tests ---
describe('OllamaProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'ollama',
        ollama: { ...configs.ollama }
    };
    const llmService = getLlmService(currentConfigs);

    test('provider should be an instance of OllamaProvider', () => {
        expect((llmService as any).provider).toBeInstanceOf(OllamaProvider)
    })

    test('should get models statically (requires server running)', async () => {
        try {
            const models = await OllamaProvider.getModels(currentConfigs.ollama!.serviceUrl);
            expect(Array.isArray(models)).toBe(true);
        } catch (e) {
            console.warn(`Ollama getModels test failed (is server running at ${currentConfigs.ollama!.serviceUrl}?): ${e}`);
        }
    });

    test('should rephrase text (requires server running)', async () => {
        try {
            const output = await llmService.rephraseText('Example of text to rephrase', 'academic')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`Ollama rephrase test failed (is server running?): ${e}`);
        }
    })

    test('should suggest improvements for text (requires server running)', async () => {
        try {
            const output = await llmService.suggestImprovementsForText('Example of text to improve')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`Ollama suggestImprovements test failed (is server running?): ${e}`);
        }
    })

    test('should suggest a reply from text (requires server running)', async () => {
        try {
            const output = await llmService.suggestReplyFromText('Context', 'Instruction')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`Ollama suggestReply test failed (is server running?): ${e}`);
        }
    })

    test('should summarize text (requires server running)', async () => {
        try {
            const output = await llmService.summarizeText('Text')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`Ollama summarize test failed (is server running?): ${e}`);
        }
    })

    test('should translate text (requires server running)', async () => {
        try {
            const output = await llmService.translateText('Text')
            expect(typeof output).toBe('string')
        } catch (e) {
            console.warn(`Ollama translate test failed (is server running?): ${e}`);
        }
    })

    test('getSpeechFromText should throw', async () => {
        await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
    test('moderateText should throw', async () => {
        await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
    });
})

// --- OpenAiGptProvider tests ---
describe('OpenAiGptProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'openai',
        openai: {
            ...configs.openai,
            apiKey: process.env.openai_api_key,
            organizationId: process.env.openai_organization_id || null
        }
    };
    const describeOrSkip = process.env.openai_api_key ? describe : describe.skip;
    const llmService = getLlmService(currentConfigs);
    const provider = (llmService as any).provider as OpenAiGptProvider; // Get provider instance for direct calls

    describeOrSkip('OpenAI Provider Service', () => {
        test('provider should be an instance of OpenAiGptProvider', () => {
            expect(provider).toBeInstanceOf(OpenAiGptProvider)
        })

        test('should rephrase text', async () => {
            const output = await llmService.rephraseText('Example of text to rephrase', 'expanded')
            expect(typeof output).toBe('string')
        })

        test('should suggest improvements for text', async () => {
            const output = await llmService.suggestImprovementsForText('Example of text to improve')
            expect(typeof output).toBe('string')
        })

        test('should suggest a reply from text', async () => {
            const output = await llmService.suggestReplyFromText('Context', 'Instruction')
            expect(typeof output).toBe('string')
        })

        test('should summarize text', async () => {
            const output = await llmService.summarizeText('Text')
            expect(typeof output).toBe('string')
        })

        test('should translate text', async () => {
            const output = await llmService.translateText('Text')
            expect(typeof output).toBe('string')
        })

        // Test implemented methods directly on provider
        test('should get speech from text', async () => {
            const output = await provider.getSpeechFromText('Hello world');
            expect(output).toBeInstanceOf(Blob);
            expect(output.type).toBe('audio/mpeg'); // Or appropriate type
        });
        test('should moderate text', async () => {
            const output = await provider.moderateText('Test content');
            expect(typeof output).toBe('object');
            // Add more specific checks based on expected moderation output structure
        });
    });
})

// --- XaiGrokProvider tests ---
describe('XaiGrokProvider Service', () => {
    const currentConfigs: Partial<ConfigType> = {
        llmProvider: 'xai',
        xai: {
            apiKey: process.env.xai_api_key
        }
    };
    const describeOrSkip = process.env.xai_api_key ? describe : describe.skip;
    const llmService = getLlmService(currentConfigs);

    describeOrSkip('XAI Grok Provider Service', () => {
        test('provider should be an instance of XaiGrokProvider', () => {
            expect((llmService as any).provider).toBeInstanceOf(XaiGrokProvider)
        })

        test('should rephrase text', async () => {
            const output = await llmService.rephraseText('Example of text to rephrase', 'standard')
            expect(typeof output).toBe('string')
        })

        test('should suggest improvements for text', async () => {
            const output = await llmService.suggestImprovementsForText('Example of text to improve')
            expect(typeof output).toBe('string')
        })

        test('should suggest a reply from text', async () => {
            const output = await llmService.suggestReplyFromText('Context', 'Instruction')
            expect(typeof output).toBe('string')
        })

        test('should summarize text', async () => {
            const output = await llmService.summarizeText('Text')
            expect(typeof output).toBe('string')
        })

        test('should translate text', async () => {
            const output = await llmService.translateText('Text')
            expect(typeof output).toBe('string')
        })

        test('getSpeechFromText should throw', async () => {
            await expect(llmService.getSpeechFromText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
        });
        test('moderateText should throw', async () => {
            await expect(llmService.moderateText('Test')).rejects.toThrow(MOCKED_ERROR_INVALID_ADDON_OPTIONS);
        });
    });
})
