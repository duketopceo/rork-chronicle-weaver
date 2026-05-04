export interface StoryContext {
  era: string;
  theme: string;
  characterName: string;
  turnCount: number;
}

export interface ModelProvider {
  id: string;
  name: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'gemini';
  endpoint?: string;
  model: string;
  isAvailable(): Promise<boolean>;
  generate(prompt: string, context: StoryContext): Promise<string>;
  stream(prompt: string, context: StoryContext): AsyncIterable<string>;
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface AvailableModels {
  ollama: OllamaModel[];
}
