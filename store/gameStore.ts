import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState, GameSetupState, GameSegment, Memory, LoreEntry, Character, CharacterStats, InventoryItem, WorldSystems, ChronosMessage } from "@/types/game";

interface GameStore {
  // Current game state
  currentGame: GameState | null;
  gameSetup: GameSetupState;
  isLoading: boolean;
  error: string | null;
  chronosMessages: ChronosMessage[];

  // Game setup actions
  setEra: (era: string) => void;
  setTheme: (theme: string) => void;
  setDifficulty: (difficulty: number) => void;
  setCharacterName: (name: string) => void;
  setGenerateBackstory: (generate: boolean) => void;
  setCustomEra: (era: string) => void;
  setCustomTheme: (theme: string) => void;
  nextSetupStep: () => void;
  resetSetup: () => void;

  // Game actions
  startNewGame: () => void;
  makeChoice: (choiceId: string) => Promise<void>;
  updateGameSegment: (segment: GameSegment) => void;
  addMemory: (memory: Memory) => void;
  addLoreEntry: (lore: LoreEntry) => void;
  updateCharacterStats: (stats: Partial<CharacterStats>) => void;
  updateCharacterBackstory: (backstory: string) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;
  updateWorldSystems: (systems: Partial<WorldSystems>) => void;
  endGame: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Kronos communication
  addChronosMessage: (message: string) => void;
  updateChronosResponse: (messageId: string, response: string) => void;
  markChronosMessageResolved: (messageId: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      gameSetup: {
        era: "",
        theme: "",
        difficulty: 0.5,
        characterName: "",
        generateBackstory: true,
        setupStep: "era",
      },
      isLoading: false,
      error: null,
      chronosMessages: [],

      setEra: (era) => set((state) => ({
        gameSetup: { ...state.gameSetup, era }
      })),

      setTheme: (theme) => set((state) => ({
        gameSetup: { ...state.gameSetup, theme }
      })),

      setDifficulty: (difficulty) => set((state) => ({
        gameSetup: { ...state.gameSetup, difficulty }
      })),

      setCharacterName: (characterName) => set((state) => ({
        gameSetup: { ...state.gameSetup, characterName }
      })),

      setGenerateBackstory: (generateBackstory) => set((state) => ({
        gameSetup: { ...state.gameSetup, generateBackstory }
      })),

      setCustomEra: (customEra) => set((state) => ({
        gameSetup: { ...state.gameSetup, customEra }
      })),

      setCustomTheme: (customTheme) => set((state) => ({
        gameSetup: { ...state.gameSetup, customTheme }
      })),

      nextSetupStep: () => set((state) => {
        const currentStep = state.gameSetup.setupStep;
        let nextStep: GameSetupState["setupStep"] = "era";

        if (currentStep === "era") nextStep = "theme";
        else if (currentStep === "theme") nextStep = "character";
        else if (currentStep === "character") nextStep = "complete";

        return {
          gameSetup: { ...state.gameSetup, setupStep: nextStep }
        };
      }),

      resetSetup: () => set({
        gameSetup: {
          era: "",
          theme: "",
          difficulty: 0.5,
          characterName: "",
          generateBackstory: true,
          setupStep: "era",
        },
        error: null,
      }),

      startNewGame: () => {
        const { era, theme, difficulty, characterName } = get().gameSetup;
        
        console.log("[GameStore] 🎮 Starting new game with:", { era, theme, difficulty, characterName });
        
        if (!era || !theme || !characterName) {
          console.error("[GameStore] ❌ Game setup is incomplete:", { era, theme, characterName });
          set({ error: "Game setup is incomplete" });
          return;
        }

        const defaultStats: CharacterStats = {
          influence: 5,
          knowledge: 5,
          resources: 5,
          reputation: 5
        };

        const defaultWorldSystems: WorldSystems = {
          politics: [],
          economics: {
            currency: "Gold",
            playerWealth: 100,
            marketPrices: {},
            tradeRoutes: [],
            economicEvents: [],
          },
          war: {
            activeConflicts: [],
            playerRole: "Civilian",
            battleExperience: 0,
          },
          activeEvents: [],
        };

        const newGame: GameState = {
          id: Date.now().toString(),
          era,
          theme,
          difficulty,
          character: {
            name: characterName,
            archetype: "Custom",
            backstory: "",
            stats: defaultStats,
            inventory: [],
            skills: [],
            relationships: [],
            reputation: {},
          },
          worldSystems: defaultWorldSystems,
          currentSegment: null,
          pastSegments: [],
          memories: [],
          lore: [],
          turnCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        console.log("[GameStore] ✅ Created new game:", newGame);

        set({ 
          currentGame: newGame,
          isLoading: false,
          error: null
        });
      },

      makeChoice: async (choiceId) => {
        // This is handled in the component for now
        // Could be moved here for better state management
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
          updatedAt: Date.now()
        };

        console.log("[GameStore] ✅ Updated game:", {
          turnCount: updatedGame.turnCount,
          segmentTextLength: segment.text.length,
          choicesCount: segment.choices.length
        });

        return { currentGame: updatedGame, isLoading: false };
      }),

      addMemory: (memory) => set((state) => {
        if (!state.currentGame) return state;

        // Keep only the last 20 memories to prevent storage bloat
        const updatedMemories = [memory, ...state.currentGame.memories].slice(0, 20);

        return {
          currentGame: {
            ...state.currentGame,
            memories: updatedMemories,
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
          }
        };
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      endGame: () => set({
        currentGame: null,
        gameSetup: {
          era: "",
          theme: "",
          difficulty: 0.5,
          characterName: "",
          generateBackstory: true,
          setupStep: "era",
        },
        error: null,
      }),

      addChronosMessage: (message) => set((state) => {
        const newMessage: ChronosMessage = {
          id: Date.now().toString(),
          message,
          timestamp: Date.now(),
          resolved: false,
        };

        return {
          chronosMessages: [newMessage, ...state.chronosMessages.slice(0, 19)] // Keep last 20
        };
      }),

      updateChronosResponse: (messageId, response) => set((state) => ({
        chronosMessages: state.chronosMessages.map(msg =>
          msg.id === messageId ? { ...msg, response } : msg
        )
      })),

      markChronosMessageResolved: (messageId) => set((state) => ({
        chronosMessages: state.chronosMessages.map(msg =>
          msg.id === messageId ? { ...msg, resolved: true } : msg
        )
      })),
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