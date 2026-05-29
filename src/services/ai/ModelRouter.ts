import { ModelProvider, StoryContext, AvailableModels } from './ModelProvider';
import { OllamaService } from './OllamaService';
import { CloudService } from './CloudService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cw_active_model_provider';

const OLLAMA_MODELS = [
  { id: 'ollama-gemma3', model: 'gemma3:4b', label: 'Gemma 3 4B (Local)' },
  { id: 'ollama-llama32', model: 'llama3.2:3b', label: 'Llama 3.2 3B (Local)' },
  { id: 'ollama-mistral', model: 'mistral:7b', label: 'Mistral 7B (Local)' },
  { id: 'ollama-llama31', model: 'llama3.1:8b', label: 'Llama 3.1 8B (Local)' },
];

export interface ProviderOption {
  id: string;
  label: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'gemini';
  available: boolean;
}

class ModelRouterSingleton {
  private providers: Map<string, ModelProvider> = new Map();
  private activeProviderId: string = 'cloud-gemini';
  private ollamaEndpoint: string;
  private initialized = false;

  constructor() {
    this.ollamaEndpoint =
      (process.env.EXPO_PUBLIC_OLLAMA_ENDPOINT as string) ?? 'http://localhost:11434';
  }

  private registerProviders(processAIRequest: (p: any) => Promise<any>) {
    // Ollama providers
    const defaultOllamaModel =
      (process.env.EXPO_PUBLIC_OLLAMA_DEFAULT_MODEL as string) ?? 'gemma3:4b';

    for (const m of OLLAMA_MODELS) {
      this.providers.set(
        m.id,
        new OllamaService(this.ollamaEndpoint, m.model),
      );
    }

    // Default Ollama entry (uses env-configured model)
    this.providers.set(
      'ollama',
      new OllamaService(this.ollamaEndpoint, defaultOllamaModel),
    );

    // Cloud providers
    this.providers.set(
      'cloud-gemini',
      new CloudService('gemini', 'Cloud (Gemini)', 'gemini-1.5-flash', processAIRequest),
    );
    this.providers.set(
      'cloud-openai',
      new CloudService('openai', 'Cloud (OpenAI)', 'gpt-4', processAIRequest),
    );
    this.providers.set(
      'cloud-anthropic',
      new CloudService('anthropic', 'Cloud (Anthropic)', 'claude-3-5-sonnet-20241022', processAIRequest),
    );
  }

  async init(processAIRequest: (p: any) => Promise<any>): Promise<void> {
    if (this.initialized) return;
    this.registerProviders(processAIRequest);

    const enableLocalAI = process.env.EXPO_PUBLIC_ENABLE_LOCAL_AI !== 'false';

    if (enableLocalAI) {
      const ollama = this.providers.get('ollama') as OllamaService;
      const available = await ollama.isAvailable();
      if (available) {
        this.activeProviderId = 'ollama';
      }
    }

    // Restore saved preference
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && this.providers.has(saved)) {
        this.activeProviderId = saved;
      }
    } catch {
      // ignore storage errors
    }

    this.initialized = true;
  }

  getActiveProvider(): ModelProvider {
    return this.providers.get(this.activeProviderId) ?? this.providers.get('cloud-gemini')!;
  }

  getActiveProviderId(): string {
    return this.activeProviderId;
  }

  async setProvider(id: string): Promise<void> {
    if (!this.providers.has(id)) {
      throw new Error(`Unknown provider: ${id}`);
    }
    this.activeProviderId = id;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }

  setOllamaEndpoint(endpoint: string): void {
    this.ollamaEndpoint = endpoint;
    // Recreate Ollama providers with new endpoint
    for (const m of OLLAMA_MODELS) {
      const existing = this.providers.get(m.id) as OllamaService | undefined;
      if (existing) {
        this.providers.set(m.id, new OllamaService(endpoint, m.model));
      }
    }
    const defaultModel =
      (process.env.EXPO_PUBLIC_OLLAMA_DEFAULT_MODEL as string) ?? 'gemma3:4b';
    this.providers.set('ollama', new OllamaService(endpoint, defaultModel));
  }

  async getProviderOptions(): Promise<ProviderOption[]> {
    const options: ProviderOption[] = [];

    const defaultOllama = this.providers.get('ollama') as OllamaService;
    const ollamaUp = await defaultOllama.isAvailable();

    for (const m of OLLAMA_MODELS) {
      options.push({
        id: m.id,
        label: m.label,
        type: 'ollama',
        available: ollamaUp,
      });
    }

    options.push({ id: 'cloud-gemini', label: 'Cloud (Gemini)', type: 'gemini', available: true });
    options.push({ id: 'cloud-openai', label: 'Cloud (OpenAI)', type: 'openai', available: true });
    options.push({ id: 'cloud-anthropic', label: 'Cloud (Anthropic)', type: 'anthropic', available: true });

    return options;
  }

  async fetchAvailableOllamaModels(): Promise<AvailableModels> {
    try {
      const res = await fetch(`${this.ollamaEndpoint}/api/tags`);
      if (!res.ok) return { ollama: [] };
      const data = await res.json();
      return { ollama: data.models ?? [] };
    } catch {
      return { ollama: [] };
    }
  }

  async generate(prompt: string, context: StoryContext): Promise<string> {
    const provider = this.getActiveProvider();
    try {
      return await provider.generate(prompt, context);
    } catch (err) {
      // fallback to cloud if local model fails
      const enableFallback = process.env.EXPO_PUBLIC_ENABLE_CLOUD_FALLBACK !== 'false';
      if (enableFallback && provider.type === 'ollama') {
        console.warn('[ModelRouter] Ollama failed, falling back to cloud:', err);
        const cloud = this.providers.get('cloud-gemini')!;
        return cloud.generate(prompt, context);
      }
      throw err;
    }
  }

  stream(prompt: string, context: StoryContext): AsyncIterable<string> {
    const provider = this.getActiveProvider();
    return provider.stream(prompt, context);
  }
}

export const modelRouter = new ModelRouterSingleton();
