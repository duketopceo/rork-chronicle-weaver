/**
 * GAME SETUP SCREEN - Chronicle Weaver v2.0
 * 
 * Purpose: New game creation and character setup
 * Features:
 * - Historical era selection (Medieval, Renaissance, Industrial, etc.)
 * - Character creation (name, background, attributes)
 * - Game difficulty and AI style preferences
 * - Starting scenario selection
 * - Custom scenario input option
 * 
 * Navigation Flow:
 * - Previous: Home screen
 * - Next: /game/play (start gameplay)
 * 
 * State Management:
 * - Creates new game in gameStore
 * - Sets initial character data
 * - Configures AI preferences
 * 
 * Dependencies:
 * - Historical era data
 * - Character creation forms
 * - AI configuration options
 * 
 * Usage: First step in creating a new Chronicle Weaver game
 */

import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

// Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EraSelector } from '@/components/game/EraSelector';
import { CharacterCreator } from '@/components/game/CharacterCreator';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { ScenarioSelector } from '@/components/game/ScenarioSelector';
import { AIStyleSelector } from '@/components/game/AIStyleSelector';

// Types
import type { GameEra, Character, GameDifficulty, StartingScenario, AIStyle } from '@/types/game';

/**
 * Game Setup Screen Component
 * Handles new game creation and configuration
 */
export default function GameSetupScreen() {
  const router = useRouter();
  const { createNewGame } = useGameStore();

  // Setup state
  const [selectedEra, setSelectedEra] = useState<GameEra | null>(null);
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [scenario, setScenario] = useState<StartingScenario | null>(null);
  const [aiStyle, setAiStyle] = useState<AIStyle>('balanced');
  const [isCreating, setIsCreating] = useState(false);

  // Validation
  const isSetupComplete = selectedEra && character.name && scenario;

  // Handlers
  const handleStartGame = async () => {
    if (!isSetupComplete) return;

    setIsCreating(true);
    try {
      await createNewGame({
        era: selectedEra,
        character: character as Character,
        difficulty,
        scenario,
        aiStyle,
      });
      router.push('/game/play');
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-700">
        <Text className="text-white text-2xl font-bold">Create New Chronicle</Text>
        <Text className="text-gray-400 mt-1">
          Configure your historical adventure
        </Text>
      </View>

      <View className="p-6 space-y-6">
        {/* Era Selection */}
        <Card className="p-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Choose Historical Era
          </Text>
          <EraSelector 
            selectedEra={selectedEra}
            onEraSelect={setSelectedEra}
          />
        </Card>

        {/* Character Creation */}
        {selectedEra && (
          <Card className="p-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Create Your Character
            </Text>
            <CharacterCreator
              era={selectedEra}
              character={character}
              onCharacterUpdate={setCharacter}
            />
          </Card>
        )}

        {/* Scenario Selection */}
        {selectedEra && character.name && (
          <Card className="p-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Choose Starting Scenario
            </Text>
            <ScenarioSelector
              era={selectedEra}
              character={character}
              selectedScenario={scenario}
              onScenarioSelect={setScenario}
            />
          </Card>
        )}

        {/* Game Configuration */}
        {scenario && (
          <Card className="p-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Game Settings
            </Text>
            
            <View className="space-y-4">
              <DifficultySelector
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
              />
              
              <AIStyleSelector
                aiStyle={aiStyle}
                onAIStyleChange={setAiStyle}
              />
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-8">
          <Button
            variant="outline"
            onPress={handleBack}
            className="flex-1"
          >
            Back
          </Button>
          
          <Button
            onPress={handleStartGame}
            disabled={!isSetupComplete || isCreating}
            loading={isCreating}
            className="flex-1 bg-amber-600"
          >
            {isCreating ? 'Creating...' : 'Start Chronicle'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}