# Chronicle Weaver — Full Rework Plan
## Ollama + Supabase + Open-Source Model Integration

> **Status:** Proposal / In Planning  
> **Branch:** `feat/ollama-supabase-ux-rework`  
> **Scope:** Backend migration, AI model layer, UX pipeline overhaul (setup → active play)

---

## 1. Executive Summary

Chronicle Weaver currently depends on Firebase + proprietary cloud APIs. This rework migrates to:

- **Supabase** — PostgreSQL-backed persistence, auth, real-time subscriptions
- **Ollama** — local open-source model runner (Gemma 3, Llama 3.2, Mistral)
- **Streamlined UX** — full pipeline from story setup → character creation → active play, eliminating unnecessary clicks

No existing features are being removed. This is additive and opt-in. Production cloud AI (OpenAI/Anthropic) remains as a fallback.

---

## 2. Current State Audit

| Layer | Current | Problem |
|---|---|---|
| Backend | Firebase Firestore | Vendor lock-in, no SQL, costly at scale |
| AI Provider | OpenAI / Anthropic (cloud) | Cost per token, no fine-tuning, no offline |
| Auth | Firebase Auth | Couples with Firestore migration |
| UX Flow | Multi-step wizard (5-7 screens to start) | Too many clicks before the game begins |
| Story Pipeline | Setup → Character → World → Confirm → Load | Fragmented, no contextual preview |
| Model Selection | None (hardcoded) | No flexibility for power users |

---

## 3. Target Architecture

```
┌─────────────────────────────────────────────┐
│           Chronicle Weaver App               │
│           (React Native / Expo)              │
└────────────┬───────────────────┬────────────┘
             │                   │
     ┌───────▼──────┐   ┌───────▼──────────┐
     │  Supabase    │   │  AI Model Layer  │
     │  (Postgres)  │   │                  │
     │  - Auth      │   │  ┌─────────────┐ │
     │  - Stories   │   │  │ Ollama Local│ │ ← Gemma 3 / Llama 3.2
     │  - Characters│   │  └─────────────┘ │
     │  - Turns     │   │  ┌─────────────┐ │
     │  - Sessions  │   │  │ Cloud API   │ │ ← OpenAI / Anthropic
     └──────────────┘   │  └─────────────┘ │
                        └──────────────────┘
```

### 3.1 Model Provider Interface

```typescript
// src/services/ai/ModelProvider.ts
export interface ModelProvider {
  id: string;
  name: string;
  type: 'ollama' | 'openai' | 'anthropic';
  endpoint?: string; // for Ollama
  model: string;
  isAvailable(): Promise<boolean>;
  generate(prompt: string, context: StoryContext): Promise<string>;
  stream(prompt: string, context: StoryContext): AsyncIterable<string>;
}
```

### 3.2 Ollama Service

```typescript
// src/services/ai/OllamaService.ts
export class OllamaService implements ModelProvider {
  id = 'ollama';
  type = 'ollama' as const;

  constructor(
    private endpoint: string = 'http://localhost:11434',
    public model: string = 'gemma3:4b' // default model
  ) {}

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`);
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
    const data = await res.json();
    return data.response;
  }

  async *stream(prompt: string, context: StoryContext): AsyncIterable<string> {
    const res = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: buildStoryPrompt(prompt, context),
        stream: true,
      }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        const parsed = JSON.parse(line);
        if (parsed.response) yield parsed.response;
      }
    }
  }
}
```

### 3.3 Recommended Open-Source Models

| Model | Size | Best For | Fine-tune Ready |
|---|---|---|---|
| **Gemma 3 4B** | 4B | Fast story turns, mobile-friendly server | ✅ Yes (LoRA) |
| **Llama 3.2 3B** | 3B | Lightweight, fast inference | ✅ Yes (LoRA) |
| **Mistral 7B** | 7B | Long-form narrative, richer prose | ✅ Yes (QLoRA) |
| **Llama 3.1 8B** | 8B | Best quality narrative, GPU recommended | ✅ Yes (LoRA) |

**Recommended default:** `gemma3:4b` — balances quality and speed on consumer hardware.

### 3.4 Fine-Tuning Strategy

Since these are open-source, we can fine-tune on historical narrative datasets:

```
datasets/
  historical-narratives/     # Public domain historical texts
  game-transcripts/          # Player session exports (opt-in)
  era-specific/
    ancient-rome/
    medieval-europe/
    wild-west/
    world-war-ii/
```

Fine-tune method: **LoRA adapters** — lightweight, model stays base, adapters swappable per era.

---

## 4. Supabase Backend Migration

### 4.1 Schema

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique,
  created_at timestamptz default now()
);

-- Stories
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  era text not null,
  setting jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'active' check (status in ('active', 'completed', 'archived'))
);

-- Characters
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade,
  name text not null,
  background text,
  attributes jsonb default '{}',
  created_at timestamptz default now()
);

-- Turns (game state history)
create table public.turns (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade,
  turn_number integer not null,
  player_input text,
  ai_response text not null,
  model_used text, -- track which model generated this turn
  tokens_used integer,
  created_at timestamptz default now()
);

-- Row-level security
alter table public.stories enable row level security;
alter table public.characters enable row level security;
alter table public.turns enable row level security;

create policy "Users own their stories" on public.stories
  for all using (auth.uid() = user_id);

create policy "Users own their turns" on public.turns
  for all using (
    story_id in (select id from public.stories where user_id = auth.uid())
  );
```

### 4.2 Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 5. UX Pipeline Rework — Setup → Active Play

### 5.1 Current Flow (Problem)

```
Screen 1: Era Selection (full page, scroll)
Screen 2: Character Name + Background (form)
Screen 3: World Settings (5+ options)
Screen 4: AI Personality Selector
Screen 5: Confirmation Summary
Screen 6: Loading...
Screen 7: First Turn
```

**7 screens, 15+ taps before first story turn.** This kills new-user retention.

### 5.2 New Flow (Target)

```
━━━━━━━━━━━━━━━━━━━━━━━━
Screen A: Quick Start
━━━━━━━━━━━━━━━━━━━━━━━━
[Era Cards — horizontally swipeable, tap = select]
[Character Name — single text field, inline]
[▶ Begin Story — one CTA]

[⚙ Advanced Setup — expands in-place, optional]
━━━━━━━━━━━━━━━━━━━━━━━━
Screen B: Active Play (persistent)
━━━━━━━━━━━━━━━━━━━━━━━━
```

**2 screens max. 3 taps minimum to first turn.**

### 5.3 Active Play Screen Redesign

The play screen is the product. It should be:

```
┌────────────────────────────────────┐
│ [Era Badge]   [Story Title]   [⚙]  │  ← sticky header (minimal)
├────────────────────────────────────┤
│                                    │
│   [Story scroll — main narrative]  │  ← 70% of screen
│   Prose renders as AI streams      │
│                                    │
├────────────────────────────────────┤
│  [Previous choices — collapsed]    │  ← expandable history
├────────────────────────────────────┤
│  [Input bar — what do you do?]     │  ← sticky bottom
│  [Send ▶]  [Choices 🎲]  [More ⋯] │
└────────────────────────────────────┘
```

**Key UX changes:**
- Story text streams token-by-token (not batch-loaded)
- Input bar is always visible — no scroll to find it
- Suggested action chips replace hard-coded buttons
- History is collapsible, not a separate screen
- Model indicator badge (shows `gemma3:4b` or `cloud`) — transparency

---

## 6. Model Selector UI

```
┌───────────────────────────┐
│  AI Model Settings        │
├───────────────────────────┤
│  ○ Auto (Cloud Fallback)  │
│  ● Gemma 3 4B (Local)    │  ← recommended
│  ○ Llama 3.2 3B (Local)  │
│  ○ Mistral 7B (Local)    │
│  ○ OpenAI GPT-4o          │
│  ○ Claude 3.5 Sonnet      │
├───────────────────────────┤
│  Ollama endpoint:         │
│  [http://localhost:11434] │
│  Status: ✅ Connected     │
└───────────────────────────┘
```

Model switching is live — no restart required. Switching mid-story is flagged in turn history.

---

## 7. Implementation Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Add Supabase client + env vars to `.env.example`
- [ ] Create DB schema + RLS policies (migrations in `supabase/migrations/`)
- [ ] Build `ModelProvider` interface + `OllamaService`
- [ ] Build `ModelRouter` — auto-detect Ollama, fallback to cloud
- [ ] Unit tests for model routing logic

### Phase 2 — UX Pipeline (Week 3-4)
- [ ] Redesign `QuickStartScreen` — era cards + inline character field
- [ ] Collapse advanced setup into expandable panel
- [ ] Rebuild `ActivePlayScreen` with streaming text renderer
- [ ] Sticky input bar with suggestion chips
- [ ] Collapsible history panel

### Phase 3 — Backend Wiring (Week 5-6)
- [ ] Replace Firebase calls with Supabase in all stores
- [ ] Auth migration: Firebase Auth → Supabase Auth
- [ ] Real-time turn subscriptions via Supabase Realtime
- [ ] Turn history persisted with `model_used` field

### Phase 4 — Fine-Tune Prep (Week 7-8)
- [ ] Story export feature (opt-in player data collection)
- [ ] Dataset formatter for LoRA training format
- [ ] Document fine-tuning workflow in `docs/FINETUNING.md`
- [ ] Era-specific prompt templates

---

## 8. New Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x"
  },
  "devDependencies": {
    "supabase": "^1.x"
  }
}
```

Removed dependencies (post-migration):
- `firebase` (Firestore, Auth)
- `@firebase/app`

---

## 9. Environment Variables

```bash
# .env.example additions
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Ollama (local)
EXPO_PUBLIC_OLLAMA_ENDPOINT=http://localhost:11434
EXPO_PUBLIC_OLLAMA_DEFAULT_MODEL=gemma3:4b

# Feature flags
EXPO_PUBLIC_ENABLE_LOCAL_AI=true
EXPO_PUBLIC_ENABLE_CLOUD_FALLBACK=true
```

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Ollama not available on mobile clients | High | Cloud fallback is automatic |
| Supabase migration loses existing user data | High | Firebase export → Supabase import script |
| Open-source model quality vs GPT-4 | Medium | Fine-tuning + prompt engineering close the gap |
| Streaming on React Native (fetch stream) | Medium | Use `expo-fetch` or `eventsource-parser` |
| RLS policy gaps | Medium | Supabase security advisor + test suite |

---

## 11. Out of Scope (This PR)

- Mobile app store submission
- Billing / subscription tier changes
- Multiplayer / shared stories
- Voice narration

These are tracked separately in `ROADMAP.md`.

---

## 12. References

- [Ollama API Docs](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Gemma 3 on Ollama](https://ollama.com/library/gemma3)
- [Llama 3.2 on Ollama](https://ollama.com/library/llama3.2)
- [LoRA Fine-Tuning Guide](https://huggingface.co/docs/peft/conceptual_guides/lora)
