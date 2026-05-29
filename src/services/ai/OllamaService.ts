import { ModelProvider, StoryContext } from './ModelProvider';

function buildStoryPrompt(prompt: string, context: StoryContext): string {
  return `You are a master historical storyteller for Chronicle Weaver.
Era: ${context.era} | Theme: ${context.theme} | Character: ${context.characterName} | Turn: ${context.turnCount}

${prompt}

Respond with a valid JSON object only — no markdown, no extra text.`;
}

export class OllamaService implements ModelProvider {
  id = 'ollama';
  type = 'ollama' as const;

  constructor(
    public endpoint: string = 'http://localhost:11434',
    public model: string = 'gemma3:4b',
  ) {}

  get name(): string {
    return `${this.model} (Local)`;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.endpoint}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, context: StoryContext): Promise<string> {
    const res = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: buildStoryPrompt(prompt, context),
        stream: false,
        options: {
          temperature: 0.85,
          top_p: 0.92,
          repeat_penalty: 1.1,
          num_predict: 512,
        },
      }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.response as string;
  }

  async *stream(prompt: string, context: StoryContext): AsyncIterable<string> {
    const res = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: buildStoryPrompt(prompt, context),
        stream: true,
        options: { temperature: 0.85, top_p: 0.92, num_predict: 512 },
      }),
    });
    if (!res.ok || !res.body) throw new Error(`Ollama stream error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) yield parsed.response as string;
        } catch {
          // skip malformed chunk
        }
      }
    }
  }
}
