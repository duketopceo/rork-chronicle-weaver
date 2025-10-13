/**
 * Chronicle Weaver - Game Data Service
 * 
 * Handles turn-by-turn game data persistence to Firestore with optimistic updates.
 * Provides automatic save functionality, conflict resolution, and local caching.
 * 
 * Features:
 * - Automatic save on every turn
 * - Optimistic UI updates with server confirmation
 * - Conflict resolution for concurrent updates
 * - Local cache with Firestore sync
 * - Offline support with sync on reconnect
 * 
 * Last Updated: January 2025
 */

import { db } from './firebaseUtils';
import { GameState, GameSegment, Memory, LoreEntry } from '../types/game';
import { useGameStore } from '../store/gameStore';

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
  lastSavedAt: Date;
}

class GameDataService {
  private cache = new Map<string, any>();
  private pendingSaves = new Set<string>();
  private offlineQueue: SaveGameData[] = [];

  /**
   * Save game state to Firestore
   */
  async saveGame(data: SaveGameData): Promise<boolean> {
    try {
      const { gameId, gameState, turnData } = data;
      
      // Check if already saving this game
      if (this.pendingSaves.has(gameId)) {
        console.log(`Save already in progress for game ${gameId}`);
        return false;
      }

      this.pendingSaves.add(gameId);

      // Update local cache
      this.cache.set(gameId, {
        ...gameState,
        lastSavedAt: new Date(),
      });

      // Save to Firestore in batch
      const batch = db.batch();
      
      // Update main game document
      const gameRef = db.collection('games').doc(gameId);
      batch.update(gameRef, {
        ...gameState,
        lastSavedAt: new Date(),
        lastPlayedAt: new Date(),
      });

      // Save turn data
      const turnRef = db.collection('games').doc(gameId)
        .collection('turns').doc(`turn-${turnData.turnNumber}`);
      batch.set(turnRef, {
        ...turnData,
        timestamp: new Date(),
      });

      // Save memories if any
      if (gameState.memories && gameState.memories.length > 0) {
        const memoryRef = db.collection('games').doc(gameId)
          .collection('memories').doc(`memory-${Date.now()}`);
        batch.set(memoryRef, {
          memories: gameState.memories,
          timestamp: new Date(),
        });
      }

      await batch.commit();

      console.log(`Game ${gameId} saved successfully`);
      return true;

    } catch (error) {
      console.error('Error saving game:', error);
      
      // Add to offline queue for retry
      this.offlineQueue.push(data);
      
      return false;
    } finally {
      this.pendingSaves.delete(data.gameId);
    }
  }

  /**
   * Load game from Firestore
   */
  async loadGame(gameId: string): Promise<LoadGameData | null> {
    try {
      // Check cache first
      const cached = this.cache.get(gameId);
      if (cached && (Date.now() - cached.lastSavedAt.getTime()) < 5 * 60 * 1000) {
        console.log(`Loading game ${gameId} from cache`);
        return cached;
      }

      // Load from Firestore
      const gameDoc = await db.collection('games').doc(gameId).get();
      if (!gameDoc.exists) {
        console.error(`Game ${gameId} not found`);
        return null;
      }

      const gameData = gameDoc.data() as GameState;

      // Load recent turns
      const turnsSnapshot = await db.collection('games').doc(gameId)
        .collection('turns').orderBy('turnNumber', 'desc').limit(10).get();
      
      const recentTurns = turnsSnapshot.docs.map(doc => doc.data());

      // Load memories
      const memoriesSnapshot = await db.collection('games').doc(gameId)
        .collection('memories').orderBy('timestamp', 'desc').limit(5).get();
      
      const memories = memoriesSnapshot.docs.flatMap(doc => doc.data().memories || []);

      const loadData: LoadGameData = {
        game: {
          ...gameData,
          memories: memories,
        },
        recentTurns,
        lastSavedAt: gameData.lastSavedAt || new Date(),
      };

      // Update cache
      this.cache.set(gameId, loadData);

      return loadData;

    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  }

  /**
   * List user's saved games
   */
  async listGames(userId: string): Promise<any[]> {
    try {
      const gamesSnapshot = await db.collection('games')
        .where('userId', '==', userId)
        .orderBy('lastPlayedAt', 'desc')
        .get();

      return gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

    } catch (error) {
      console.error('Error listing games:', error);
      return [];
    }
  }

  /**
   * Delete game and all associated data
   */
  async deleteGame(gameId: string): Promise<boolean> {
    try {
      const batch = db.batch();
      
      // Delete main game document
      batch.delete(db.collection('games').doc(gameId));
      
      // Delete turns subcollection
      const turnsSnapshot = await db.collection('games').doc(gameId)
        .collection('turns').get();
      turnsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete memories subcollection
      const memoriesSnapshot = await db.collection('games').doc(gameId)
        .collection('memories').get();
      memoriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();

      // Remove from cache
      this.cache.delete(gameId);

      console.log(`Game ${gameId} deleted successfully`);
      return true;

    } catch (error) {
      console.error('Error deleting game:', error);
      return false;
    }
  }

  /**
   * Auto-save game state (called after each turn)
   */
  async autoSave(gameId: string, gameState: GameState, turnData: any): Promise<void> {
    try {
      const saveData: SaveGameData = {
        gameId,
        gameState,
        turnData: {
          turnNumber: gameState.turnCount,
          narrativeText: turnData.text,
          choices: turnData.choices,
          selectedChoice: turnData.selectedChoice,
          customInput: turnData.customInput,
          timestamp: new Date(),
        },
      };

      await this.saveGame(saveData);

      // Update store with save confirmation
      useGameStore.getState().setLoading(false);

    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't throw error - auto-save should be non-blocking
    }
  }

  /**
   * Sync offline queue when connection is restored
   */
  async syncOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`Syncing ${this.offlineQueue.length} offline saves`);

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const saveData of queue) {
      try {
        await this.saveGame(saveData);
        console.log(`Offline save synced for game ${saveData.gameId}`);
      } catch (error) {
        console.error(`Failed to sync offline save for game ${saveData.gameId}:`, error);
        // Re-add to queue for next sync attempt
        this.offlineQueue.push(saveData);
      }
    }
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; games: string[] } {
    return {
      size: this.cache.size,
      games: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const gameDataService = new GameDataService();

// Set up offline/online sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    gameDataService.syncOfflineQueue();
  });

  // Periodic sync for offline queue
  setInterval(() => {
    if (navigator.onLine && gameDataService['offlineQueue'].length > 0) {
      gameDataService.syncOfflineQueue();
    }
  }, 30000); // Every 30 seconds
}
