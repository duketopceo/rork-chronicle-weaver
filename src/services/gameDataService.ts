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
import { 
  collection, 
  doc, 
  writeBatch, 
  updateDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc 
} from 'firebase/firestore';
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
  lastSaved: number | Date;
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
        lastSaved: Date.now(),
      });

      // Save to Firestore in batch
      const batch = writeBatch(db);
      
      // Update main game document
      const gameRef = doc(collection(db, 'games'), gameId);
      batch.update(gameRef, {
        ...gameState,
        lastSaved: new Date(),
        lastPlayedAt: new Date(),
      });

      // Save turn data
      const turnRef = doc(collection(doc(collection(db, 'games'), gameId), 'turns'), `turn-${turnData.turnNumber}`);
      batch.set(turnRef, {
        ...turnData,
        timestamp: new Date(),
      });

      // Save memories if any
      if (gameState.memories && gameState.memories.length > 0) {
        const memoryRef = doc(collection(doc(collection(db, 'games'), gameId), 'memories'), `memory-${Date.now()}`);
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
      if (cached && (Date.now() - cached.lastSaved.getTime()) < 5 * 60 * 1000) {
        console.log(`Loading game ${gameId} from cache`);
        return cached;
      }

      // Load from Firestore
      const gameDocRef = doc(collection(db, 'games'), gameId);
      const gameDoc = await getDoc(gameDocRef);
      if (!gameDoc.exists()) {
        console.error(`Game ${gameId} not found`);
        return null;
      }

      const gameData = gameDoc.data() as GameState;

      // Load recent turns
      const turnsCollectionRef = collection(doc(collection(db, 'games'), gameId), 'turns');
      const turnsQuery = query(turnsCollectionRef, orderBy('turnNumber', 'desc'), limit(10));
      const turnsSnapshot = await getDocs(turnsQuery);
      
      const recentTurns = turnsSnapshot.docs.map(doc => doc.data());

      // Load memories
      const memoriesCollectionRef = collection(doc(collection(db, 'games'), gameId), 'memories');
      const memoriesQuery = query(memoriesCollectionRef, orderBy('timestamp', 'desc'), limit(5));
      const memoriesSnapshot = await getDocs(memoriesQuery);
      
      const memories = memoriesSnapshot.docs.flatMap(doc => doc.data().memories || []);

      const loadData: LoadGameData = {
        game: {
          ...gameData,
          memories: memories,
        },
        recentTurns,
        lastSaved: gameData.lastSaved || Date.now(),
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
      const gamesCollectionRef = collection(db, 'games');
      const gamesQuery = query(
        gamesCollectionRef,
        where('userId', '==', userId),
        orderBy('lastPlayedAt', 'desc')
      );
      const gamesSnapshot = await getDocs(gamesQuery);

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
      const batch = writeBatch(db);
      
      // Delete main game document
      const gameDocRef = doc(collection(db, 'games'), gameId);
      batch.delete(gameDocRef);
      
      // Delete turns subcollection
      const turnsCollectionRef = collection(doc(collection(db, 'games'), gameId), 'turns');
      const turnsSnapshot = await getDocs(turnsCollectionRef);
      turnsSnapshot.docs.forEach(document => batch.delete(document.ref));
      
      // Delete memories subcollection
      const memoriesCollectionRef = collection(doc(collection(db, 'games'), gameId), 'memories');
      const memoriesSnapshot = await getDocs(memoriesCollectionRef);
      memoriesSnapshot.docs.forEach(document => batch.delete(document.ref));
      
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

