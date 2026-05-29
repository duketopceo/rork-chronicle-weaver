import { supabase } from '../lib/supabase';
import { GameState, GameSegment } from '../types/game';
import { modelRouter } from './ai/ModelRouter';

export interface SaveGameData {
  gameId: string;
  gameState: GameState;
  turnData: {
    turnNumber: number;
    narrativeText: string;
    choices: any[];
    selectedChoice: string;
    customInput?: string;
    timestamp: Date;
  };
}

export interface LoadGameData {
  game: GameState;
  recentTurns: any[];
  lastSaved: number | Date;
}

class SupabaseService {
  async saveGame(data: SaveGameData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { gameState, turnData } = data;

      // Upsert story row
      const { error: storyErr } = await supabase.from('stories').upsert({
        id: data.gameId,
        user_id: user.id,
        title: `${gameState.character.name}'s Chronicle`,
        era: gameState.era,
        setting: { theme: gameState.theme },
        status: gameState.isGameOver ? 'completed' : 'active',
        updated_at: new Date().toISOString(),
      });
      if (storyErr) throw storyErr;

      // Insert turn
      const { error: turnErr } = await supabase.from('turns').insert({
        story_id: data.gameId,
        turn_number: turnData.turnNumber,
        player_input: turnData.selectedChoice,
        ai_response: turnData.narrativeText,
        model_used: modelRouter.getActiveProviderId(),
      });
      if (turnErr) throw turnErr;

      return true;
    } catch (err) {
      console.error('[SupabaseService] saveGame error:', err);
      return false;
    }
  }

  async loadGame(gameId: string): Promise<LoadGameData | null> {
    try {
      const { data: story, error: storyErr } = await supabase
        .from('stories')
        .select('*')
        .eq('id', gameId)
        .single();
      if (storyErr || !story) return null;

      const { data: turns } = await supabase
        .from('turns')
        .select('*')
        .eq('story_id', gameId)
        .order('turn_number', { ascending: false })
        .limit(10);

      return {
        game: story as unknown as GameState,
        recentTurns: turns ?? [],
        lastSaved: story.updated_at,
      };
    } catch {
      return null;
    }
  }

  async listGames(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, era, status, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    } catch {
      return [];
    }
  }

  async deleteGame(gameId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('stories').delete().eq('id', gameId);
      return !error;
    } catch {
      return false;
    }
  }

  async saveTurn(
    storyId: string,
    turnNumber: number,
    playerInput: string,
    aiResponse: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('turns').insert({
        story_id: storyId,
        turn_number: turnNumber,
        player_input: playerInput,
        ai_response: aiResponse,
        model_used: modelRouter.getActiveProviderId(),
      });
      return !error;
    } catch {
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
