/**
 * Game Store - Central State Management for Chronicle Weaver
 * 
 * This Zustand store manages all game state for Chronicle Weaver, including:
 * - Character data and progression
 * - Game world state and systems
 * - Player choices and narrative history
 * - Setup and configuration state
 * - Communication with AI systems (Chronos)
 * 
 * Features:
 * - Persistent storage using AsyncStorage for mobile
 * - Type-safe state management with TypeScript
 * - Reactive state updates for UI components
 * - Modular action organization
 * 
 * Architecture:
 * - Uses Zustand for lightweight state management
 * - Implements persistence middleware for save games
 * - Separates setup state from active game state
 * - Provides both optimistic and confirmed state updates
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState, GameSetupState, GameSegment, Memory, LoreEntry, Character, CharacterStats, InventoryItem, WorldSystems, ChronosMessage } from "../types/game";
import { gameDataService } from "../services/gameDataService";
import { analyticsService } from "../services/analyticsService";

/**
 * Game Store Interface
 * 
 * Defines the complete state structure and available actions
 * for the Chronicle Weaver game store.
 */
interface GameStore {
  // === CORE GAME STATE ===
  currentGame: GameState | null;     // Active game session data
  gameSetup: GameSetupState;         // Character and world setup state
  isLoading: boolean;                // Loading state for async operations
  error: string | null;              // Error state for user feedback
  chronosMessages: ChronosMessage[]; // AI communication history
  narrative: GameSegment | null;     // Current story segment

  // === USER PROFILE ===
  userType: "free" | "paid";         // User subscription status
  user: {
    uid: string | null;
    email: string | null;
    isAnonymous: boolean;
    isAuthenticated: boolean;
  } | null;
  subscription: {
    plan: string;
    status: string;
    current_period_end?: number;
  } | null;

  // === GAME SETUP ACTIONS ===
  // These actions manage the initial game creation flow
  setEra: (era: string) => void;              // Set historical time period
  setTheme: (theme: string) => void;          // Set narrative theme
  setDifficulty: (difficulty: "easy" | "normal" | "hard") => void; // Set challenge level
  setCharacterName: (name: string) => void;   // Set character name
  setGenerateBackstory: (generate: boolean) => void; // Toggle AI backstory generation
  setCustomEra: (era: string) => void;        // Set custom historical period
  setCustomTheme: (theme: string) => void;    // Set custom narrative theme
  resetSetup: () => void;                     // Reset setup to initial state

  // === ACTIVE GAME ACTIONS ===
  // These actions manage ongoing gameplay
  startNewGame: () => void;                           // Initialize new game session
  loadGameById: (gameId: string) => Promise<boolean>; // Load a saved game by id
  continueMostRecentGame: () => Promise<boolean>;     // Load most recent saved game
  deleteGameById: (gameId: string) => Promise<boolean>; // Delete a saved game
  makeChoice: (choiceId: string) => Promise<void>;   // Process player choice
  updateGameSegment: (segment: GameSegment) => void; // Update current narrative
  addMemory: (memory: Memory) => void;               // Add to player's memory log
  addLoreEntry: (lore: LoreEntry) => void;          // Add world lore discovery
  updateCharacterStats: (stats: Partial<CharacterStats>) => void; // Modify character stats
  updateCharacterBackstory: (backstory: string) => void; // Update character background
  addInventoryItem: (item: InventoryItem) => void;   // Add item to inventory
  removeInventoryItem: (itemId: string) => void;     // Remove item from inventory
  updateWorldSystems: (systems: Partial<WorldSystems>) => void; // Update world state
  endGame: () => void;                               // Conclude game session
  setLoading: (loading: boolean) => void;            // Control loading state
  setError: (error: string | null) => void;         // Handle error states
  setUserType: (type: "free" | "paid") => void;     // Update user subscription
  setUser: (user: { uid: string | null; email: string | null; isAnonymous: boolean; isAuthenticated: boolean } | null) => void;
  setSubscription: (subscription: { plan: string; status: string; current_period_end?: number } | null) => void;

  // === CHRONOS COMMUNICATION ===
  // These actions manage AI advisor interactions
  addChronosMessage: (message: string) => void;              // Send message to AI
  updateChronosResponse: (messageId: string, response: string) => void; // Receive AI response
  markChronosMessageResolved: (messageId: string) => void;   // Mark conversation complete

  // === NARRATIVE ACTIONS ===
  updateNarrative: (newNarrative: GameSegment) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      gameSetup: {
        era: "",
        theme: "",
        difficulty: "normal",
        characterName: "",
        generateBackstory: true,
        customEra: "",
        customTheme: "",
      },
      isLoading: false,
      error: null,
      chronosMessages: [],
      narrative: null,
      userType: "free",
      user: null,
      subscription: null,

      // === GAME SETUP ACTIONS ===
      setEra: (era) => set((state) => ({ gameSetup: { ...state.gameSetup, era } })),
      setTheme: (theme) => set((state) => ({ gameSetup: { ...state.gameSetup, theme } })),
      setDifficulty: (difficulty) => set((state) => ({ gameSetup: { ...state.gameSetup, difficulty } })),
      setCharacterName: (characterName) => set((state) => ({ gameSetup: { ...state.gameSetup, characterName } })),
      setGenerateBackstory: (generateBackstory) => set((state) => ({ gameSetup: { ...state.gameSetup, generateBackstory } })),
      setCustomEra: (customEra) => set((state) => ({ gameSetup: { ...state.gameSetup, customEra } })),
      setCustomTheme: (customTheme) => set((state) => ({ gameSetup: { ...state.gameSetup, customTheme } })),
      resetSetup: () => set({
        gameSetup: {
          era: "",
          theme: "",
          difficulty: "normal",
          characterName: "",
          generateBackstory: true,
          customEra: "",
          customTheme: "",
        },
        error: null,
      }),

      // === ACTIVE GAME ACTIONS ===
      startNewGame: () => {
        const { gameSetup } = get();

        console.log("[GameStore] 🎮 Starting new game with:", gameSetup);

        const { era, theme, difficulty, characterName } = gameSetup;

        if (!era || !theme || !characterName) {
          console.error("[GameStore] ❌ Game setup is incomplete:", gameSetup);
          set({ error: "Game setup is incomplete" });
          return;
        }

        const defaultStats: CharacterStats = {
          health: 100,
          strength: 5,
          intelligence: 5,
          charisma: 5,
          resources: 5,
          reputation: 5,
        };

        const defaultWorldSystems: WorldSystems = {
          politics: [],
          economics: {
            currency: "Gold",
            marketPrices: {},
            tradeRoutes: [],
            playerWealth: 100,
            economicEvents: [],
          },
          war: {
            activeConflicts: [],
            armySize: 0,
            morale: 0,
            playerRole: "Civilian",
            battleExperience: 0,
          },
          activeEvents: [],
        };

        const newGame: GameState = {
          id: Date.now().toString(),
          userId: "",
          era,
          theme,
          character: {
            id: Date.now().toString(),
            name: characterName,
            archetype: "Custom",
            backstory: "",
            stats: defaultStats,
            inventory: [],
            relationships: [],
            skills: [],
            background: "",
            portraitUrl: undefined,
          },
          worldSystems: defaultWorldSystems,
          currentSegment: null,
          pastSegments: [],
          turnCount: 0,
          isGameOver: false,
          lastSaved: Date.now(),
          memories: [],
          lore: [],
        };

        console.log("[GameStore] ✅ Created new game:", newGame);

        // Track game creation in analytics
        analyticsService.trackGameCreated(era, theme, characterName);

        set({
          currentGame: newGame,
          isLoading: false,
          error: null
        });
      },

      loadGameById: async (gameId: string) => {
        try {
          set({ isLoading: true, error: null });
          const loaded = await gameDataService.loadGame(gameId);
          if (!loaded) {
            set({ isLoading: false, error: "Saved game not found" });
            return false;
          }
          const game = loaded.game as GameState;
          set({ currentGame: game, narrative: game.currentSegment || null, isLoading: false });
          return true;
        } catch (err) {
          console.error("[GameStore] Failed to load game:", err);
          set({ isLoading: false, error: "Failed to load game" });
          return false;
        }
      },

      continueMostRecentGame: async () => {
        try {
          const state = get();
          const userId = state.user?.uid || "";
          if (!userId) {
            set({ error: "Please sign in to continue a saved game" });
            return false;
          }
          set({ isLoading: true, error: null });
          const games = await gameDataService.listGames(userId);
          if (!games || games.length === 0) {
            set({ isLoading: false, error: "No saved games found" });
            return false;
          }
          const mostRecent = games[0];
          const ok = await get().loadGameById(mostRecent.id);
          set({ isLoading: false });
          return ok;
        } catch (err) {
          console.error("[GameStore] Failed to continue game:", err);
          set({ isLoading: false, error: "Failed to continue game" });
          return false;
        }
      },

      deleteGameById: async (gameId: string) => {
        try {
          set({ isLoading: true, error: null });
          const ok = await gameDataService.deleteGame(gameId);
          if (ok) {
            const current = get().currentGame;
            if (current?.id === gameId) {
              set({ currentGame: null, narrative: null });
            }
          }
          set({ isLoading: false });
          return ok;
        } catch (err) {
          console.error("[GameStore] Failed to delete game:", err);
          set({ isLoading: false, error: "Failed to delete game" });
          return false;
        }
      },

      makeChoice: async (choiceId) => {
        const currentGame = get().currentGame;
        const userType = get().userType;

        if (!currentGame) {
          console.error("[GameStore] ❌ No current game to make a choice");
          return;
        }

        const turnLimit = userType === "free" ? 50 : 10000;

        if (currentGame.turnCount >= turnLimit) {
          console.error(`[GameStore] ❌ Turn limit reached for ${userType} user`);
          set({ error: "Turn limit reached" });
          return;
        }

        // Proceed with choice logic
        console.log(`[GameStore] ✅ Making choice: ${choiceId}`);

        const updatedGame = {
          ...currentGame,
          turnCount: currentGame.turnCount + 1,
        };

        set({ currentGame: updatedGame });
      },

      updateGameSegment: (segment) => set((state) => {
        console.log("[GameStore] 📖 Updating game segment:", segment);

        if (!state.currentGame) {
          console.error("[GameStore] ❌ No current game to update");
          return state;
        }

        const updatedGame = {
          ...state.currentGame,
          currentSegment: segment,
          pastSegments: state.currentGame.currentSegment
            ? [...state.currentGame.pastSegments, state.currentGame.currentSegment]
            : state.currentGame.pastSegments,
          turnCount: state.currentGame.turnCount + 1,
        };

        console.log("[GameStore] ✅ Updated game:", {
          turnCount: updatedGame.turnCount,
          segmentTextLength: segment.text.length,
          choicesCount: segment.choices.length
        });

        // Track turn completion in analytics
        analyticsService.trackTurnCompleted(updatedGame.id, updatedGame.turnCount, 'predefined');

        // Fire-and-forget auto-save for each turn (non-blocking)
        try {
          gameDataService
            .autoSave(
              updatedGame.id,
              updatedGame,
              {
                text: segment.text,
                choices: segment.choices,
                selectedChoice: "system",
                customInput: undefined,
              }
            )
            .catch((err) => console.warn("[GameStore] Auto-save failed (non-blocking):", err));
        } catch (err) {
          console.warn("[GameStore] Auto-save scheduling failed:", err);
        }

        return { currentGame: updatedGame, isLoading: false };
      }),

      addMemory: (memory) => set((state) => {
        if (!state.currentGame) return state;

        // Keep only the last 20 memories to prevent storage bloat, using an immutable approach
        const updatedMemories = [memory, ...state.currentGame.memories].slice(0, 20);

        return {
          currentGame: {
            ...state.currentGame,
            memories: updatedMemories,
          }
        };
      }),

      addLoreEntry: (lore) => set((state) => {
        if (!state.currentGame) return state;

        console.log("[GameStore] 📚 Adding lore entry:", lore.title);

        return {
          currentGame: {
            ...state.currentGame,
            lore: [lore, ...state.currentGame.lore],
          }
        };
      }),

      updateCharacterStats: (stats) => set((state) => {
        if (!state.currentGame) return state;

        console.log("[GameStore] 📊 Updating character stats:", stats);

        return {
          currentGame: {
            ...state.currentGame,
            character: {
              ...state.currentGame.character,
              stats: {
                ...state.currentGame.character.stats,
                ...stats
              }
            },
          }
        };
      }),

      updateCharacterBackstory: (backstory) => set((state) => {
        if (!state.currentGame) return state;

        console.log("[GameStore] 📜 Updating character backstory, length:", backstory.length);

        return {
          currentGame: {
            ...state.currentGame,
            character: {
              ...state.currentGame.character,
              backstory: backstory
            },
          }
        };
      }),

      addInventoryItem: (item) => set((state) => {
        if (!state.currentGame) return state;

        const existingItem = state.currentGame.character.inventory.find(i => i.id === item.id);
        let updatedInventory;

        if (existingItem) {
          updatedInventory = state.currentGame.character.inventory.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        } else {
          updatedInventory = [...state.currentGame.character.inventory, item];
        }

        return {
          currentGame: {
            ...state.currentGame,
            character: {
              ...state.currentGame.character,
              inventory: updatedInventory
            },
          }
        };
      }),

      removeInventoryItem: (itemId) => set((state) => {
        if (!state.currentGame) return state;

        return {
          currentGame: {
            ...state.currentGame,
            character: {
              ...state.currentGame.character,
              inventory: state.currentGame.character.inventory.filter(item => item.id !== itemId)
            },
          }
        };
      }),

      updateWorldSystems: (worldSystems) => set((state) => {
        if (!state.currentGame) return state;

        return {
          currentGame: {
            ...state.currentGame,
            worldSystems: {
              ...state.currentGame.worldSystems,
              ...worldSystems
            },
          }
        };
      }),

      endGame: () => set({ currentGame: null, narrative: null, chronosMessages: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setUserType: (type) => set({ userType: type }),

      setUser: (user) => set({ user }),

      setSubscription: (subscription) => set({ subscription }),

      // === CHRONOS COMMUNICATION ===
      addChronosMessage: (message) =>
        set((state) => ({
          chronosMessages: [
            {
              id: Date.now().toString(),
              message,
              timestamp: Date.now(),
              status: "pending",
            },
            ...state.chronosMessages.slice(0, 19),
          ],
        })),

      updateChronosResponse: (messageId, response) => set((state) => ({
        chronosMessages: state.chronosMessages.map(msg =>
          msg.id === messageId ? { ...msg, response, status: "answered" } : msg
        )
      })),

      markChronosMessageResolved: (messageId) => set((state) => ({
        chronosMessages: state.chronosMessages.map(msg =>
          msg.id === messageId ? { ...msg, status: "answered" } : msg
        )
      })),

      updateNarrative: (newNarrative) => {
        // Log the new narrative/choices payload
        console.log("Updating narrative with payload:", newNarrative);

        set((state) => ({
          narrative: newNarrative,
        }));
      },
    }),
    {
      name: "chronicle-weaver-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentGame: state.currentGame,
        chronosMessages: state.chronosMessages,
        // Don't persist setup state or loading/error states
      }),
    }
  )
);