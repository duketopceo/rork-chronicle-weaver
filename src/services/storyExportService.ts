import { supabase } from '../lib/supabase';

export interface TrainingExample {
  prompt: string;
  completion: string;
}

export async function exportStoryAsTrainingData(storyId: string): Promise<string> {
  const { data: turns, error } = await supabase
    .from('turns')
    .select('turn_number, player_input, ai_response')
    .eq('story_id', storyId)
    .order('turn_number', { ascending: true });

  if (error || !turns || turns.length === 0) {
    throw new Error('No turns found for this story');
  }

  const examples: TrainingExample[] = turns
    .filter((t) => t.player_input && t.ai_response)
    .map((t) => ({
      prompt: t.player_input as string,
      completion: t.ai_response as string,
    }));

  return examples.map((e) => JSON.stringify(e)).join('\n');
}
