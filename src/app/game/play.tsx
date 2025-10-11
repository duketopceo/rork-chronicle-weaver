/**
 * MAIN GAMEPLAY SCREEN - Chronicle Weaver v2.0
 * 
 * Purpose: Core game interface for story progression and player choices
 * Features:
 * - AI-generated narrative text display
 * - Player choice selection interface
 * - Character stats and inventory tracking
 * - Save/load game functionality
 * - Pause menu and settings access
 * - Story history and branching visualization
 * 
 * Navigation Options:
 * - Settings overlay
 * - Inventory modal
 * - Character sheet modal
 * - Save/Load menu
 * - Exit to home (with save prompt)
 * 
 * Real-time Features:
 * - AI response streaming
 * - Auto-save functionality
 * - Choice timeout options
 * - Background music/ambient sounds
 * 
 * Dependencies:
 * - AI service for story generation
 * - Game state management
 * - Character progression system
 * - Save/load system
 * 
 * Usage: Main screen where players spend most of their time
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useAIService } from '@/hooks/useAIService';

// Components
import { NarrativeDisplay } from '@/components/game/NarrativeDisplay';
import { ChoiceSelector } from '@/components/game/ChoiceSelector';
import { CharacterStats } from '@/components/game/CharacterStats';
import { GameMenu } from '@/components/game/GameMenu';
import { InventoryPanel } from '@/components/game/InventoryPanel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

// Types
import type { Choice, GameState } from '@/types/game';

/**
 * Main Gameplay Screen Component
 * Core game interface for story progression
 */
export default function GamePlayScreen() {
  const router = useRouter();
  const { 
    currentGame, 
    makeChoice, 
    saveGame, 
    isLoading,
    hasActiveGame 
  } = useGameStore();
  
  const { generateStoryContent, isGenerating } = useAIService();

  // Local state
  const [showMenu, setShowMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isProcessingChoice, setIsProcessingChoice] = useState(false);

  // Redirect if no active game
  useEffect(() => {
    if (!hasActiveGame) {
      router.replace('/');
    }
  }, [hasActiveGame, router]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentGame && !isLoading) {
        saveGame();
      }
    }, 60000); // Auto-save every minute

    return () => clearInterval(autoSaveInterval);
  }, [currentGame, isLoading, saveGame]);

  // Choice handling
  const handleChoiceSelect = async (choice: Choice) => {
    if (isProcessingChoice || isGenerating) return;

    setSelectedChoice(choice);
    setIsProcessingChoice(true);

    try {
      // Make choice in game state
      await makeChoice(choice);
      
      // Generate next story content
      await generateStoryContent(choice);
      
      setSelectedChoice(null);
    } catch (error) {
      console.error('Failed to process choice:', error);
      Alert.alert('Error', 'Failed to process your choice. Please try again.');
    } finally {
      setIsProcessingChoice(false);
    }
  };

  // Menu handlers
  const handleShowMenu = () => setShowMenu(true);
  const handleHideMenu = () => setShowMenu(false);
  
  const handleShowInventory = () => setShowInventory(true);
  const handleHideInventory = () => setShowInventory(false);

  const handleExitGame = () => {
    Alert.alert(
      'Exit Game',
      'Your progress will be saved. Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => {
            saveGame();
            router.replace('/');
          }
        }
      ]
    );
  };

  if (!currentGame) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-white mt-4">Loading your chronicle...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
        <Text className="text-white font-semibold text-lg">
          {currentGame.title}
        </Text>
        
        <View className="flex-row gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={handleShowInventory}
          >
            Inventory
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onPress={handleShowMenu}
          >
            Menu
          </Button>
        </View>
      </View>

      {/* Character Stats Bar */}
      <CharacterStats character={currentGame.character} />

      {/* Main Content Area */}
      <View className="flex-1 flex-row">
        {/* Story Content - Takes most of the space */}
        <View className="flex-1 p-4">
          <ScrollView className="flex-1">
            <NarrativeDisplay 
              story={currentGame.currentStory}
              isGenerating={isGenerating}
            />
          </ScrollView>

          {/* Choice Selection */}
          {currentGame.availableChoices.length > 0 && !isGenerating && (
            <View className="mt-6">
              <ChoiceSelector
                choices={currentGame.availableChoices}
                selectedChoice={selectedChoice}
                onChoiceSelect={handleChoiceSelect}
                disabled={isProcessingChoice}
              />
            </View>
          )}

          {/* Loading State */}
          {(isGenerating || isProcessingChoice) && (
            <View className="mt-6 p-4 bg-gray-800 rounded-lg">
              <LoadingSpinner />
              <Text className="text-gray-300 text-center mt-2">
                {isGenerating ? 'The chronicle unfolds...' : 'Processing your choice...'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Overlays */}
      {showMenu && (
        <GameMenu
          onClose={handleHideMenu}
          onExitGame={handleExitGame}
          onSaveGame={saveGame}
        />
      )}

      {showInventory && (
        <InventoryPanel
          character={currentGame.character}
          onClose={handleHideInventory}
        />
      )}
    </View>
  );
}