import { ModelProvider, StoryContext } from './ModelProvider';

type CoreMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string };

export type CloudProvider = 'openai' | 'anthropic' | 'gemini';

export class CloudService implements ModelProvider {
  type: 'openai' | 'anthropic' | 'gemini';

  constructor(
    public id: CloudProvider,
    public name: string,
    public model: string,
    private processAIRequest: (payload: { messages: CoreMessage[] }) => Promise<{ json: () => Promise<any> }>,
  ) {
    this.type = id;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generate(prompt: string, context: StoryContext): Promise<string> {
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: `You are a master historical storyteller for Chronicle Weaver.
Era: ${context.era} | Theme: ${context.theme} | Character: ${context.characterName} | Turn: ${context.turnCount}
Respond with valid JSON only — no markdown, no extra text.`,
      },
      { role: 'user', content: prompt },
    ];
    const response = await this.processAIRequest({ messages });
    const data = await response.json();
    return (data.completion as string) ?? '';
  }

  // Cloud providers don't support true server-side streaming from the frontend;
  // simulate it by yielding word-by-word from the full completion.
  async *stream(prompt: string, context: StoryContext): AsyncIterable<string> {
    const full = await this.generate(prompt, context);
    const words = full.split(' ');
    for (const word of words) {
      yield word + ' ';
      // small artificial delay so the UI renders token-by-token
      await new Promise(r => setTimeout(r, 15));
    }
  }
}
