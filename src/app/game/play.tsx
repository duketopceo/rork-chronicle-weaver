/**
 * Game Play Screen - Main Gameplay Interface for Chronicle Weaver
 * 
 * This is the core gameplay screen where players experience the Chronicle Weaver
 * historical RPG. It manages the entire game session including narrative display,
 * choice selection, story progression, and game state management.
 * 
 * Key Features:
 * - Dynamic narrative text display with typing animation
 * - Interactive choice system with immediate feedback
 * - Custom choice input for player creativity
 * - Real-time game state updates and persistence
 * - AI-powered story generation and progression
 * - Haptic feedback for enhanced mobile experience
 * - Debug panel for development and testing
 * 
 * Game Flow:
 * 1. Initialize game session with AI-generated opening
 * 2. Display narrative text with animated typography
 * 3. Present choices to player (predefined + custom options)
 * 4. Process player selection and update game state
 * 5. Generate next story segment based on choice
 * 6. Update character stats, inventory, and relationships
 * 7. Continue cycle until story conclusion
 * 
 * Architecture:
 * - Uses Zustand for reactive state management
 * - Integrates with AI service for dynamic content
 * - Implements smooth UI animations and transitions
 * - Provides accessibility and platform optimizations
 * 
 * UI Components:
 * - NarrativeText: Animated story text display
 * - ChoiceButton: Interactive choice selection
 * - CustomChoiceInput: Player-authored responses
 * - DebugPanel: Development tools and state inspection
 */

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import { useGameStore } from "../../store/gameStore";
import NarrativeText from "../../components/NarrativeText";
import ChoiceButton from "../../components/ChoiceButton";
import CustomChoiceInput from "../../components/CustomChoiceInput";
import { UltraDebugPanel } from "../../components/UltraDebugPanel";
import Button from "../../components/Button";
import { generateInitialStory, generateNextSegment } from "../../services/aiService";
import { User, ArrowLeft, MessageCircle, Crown, Feather, Bug } from "lucide-react-native";
import * as Haptics from "expo-haptics";

// Get screen dimensions for responsive layout
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Main Game Play Screen Component
 * 
 * Orchestrates the entire gameplay experience including story progression,
 * choice handling, and state management for Chronicle Weaver.
 */
export default function GamePlayScreen() {
  const router = useRouter();
  
  // === GAME STATE MANAGEMENT ===
  // Extract necessary state and actions from the game store
  const { 
    currentGame,              // Current game session data
    gameSetup,               // Initial game setup configuration
    isLoading,               // Global loading state
    error,                   // Error state for user feedback
    updateGameSegment,       // Update current story segment
    addMemory,              // Add to player's memory log
    addLoreEntry,           // Add discovered lore
    setLoading,             // Control loading state
    setError,               // Handle error states
    updateCharacterBackstory // Update character background
  } = useGameStore();
  
  // Get current narrative segment with reactive updates
  const narrative = useGameStore((state) => state.narrative);
  
  // === LOCAL COMPONENT STATE ===  // UI state management for interactive elements
  const [showChoices, setShowChoices] = useState(false);           // Control choice visibility
  const [initializing, setInitializing] = useState(true);         // Track initialization state
  const [showCustomInput, setShowCustomInput] = useState(false);  // Custom choice input visibility
  const [processingChoice, setProcessingChoice] = useState(false); // Choice processing state
  const [narrativeKey, setNarrativeKey] = useState(0);            // Force narrative re-render
  const [animationSpeed, setAnimationSpeed] = useState(1);        // Text animation speed control
  const [showUltraDebug, setShowUltraDebug] = useState(false);    // Ultra debug panel visibility
  const scrollViewRef = useRef<ScrollView>(null);                 // Scroll view reference
  
  // === DEVELOPMENT DEBUGGING ===
  // Log narrative state changes for development monitoring
  useEffect(() => {
    console.log('[play.tsx] Narrative state changed:', narrative);
  }, [narrative]);

  /**
   * Force Show UI Elements
   * 
   * Development utility to bypass loading states and show UI elements.
   * Used for debugging and testing interface components.
   */
  const forceShowUIElements = () => {
    setShowChoices(true);
    setInitializing(false);
    setProcessingChoice(false);
  };

  /**
   * Retry Initialization
   * 
   * Attempts to re-initialize the game session after an error.
   * Resets error state and calls the initializeGame function.
   */
  const retryInitialization = async () => {
    setError(null);
    await initializeGame();
  };

  /**
   * Initialize Game Session
   * 
   * Sets up the game for a new session or resets the current session.
   * Generates the initial story segment and character backstory.
   * Updates the game state and UI accordingly.
   */
  const initializeGame = async () => {
    if (!currentGame) {
      router.replace("/");
      return;
    }
    
    if (!currentGame.currentSegment) {
      try {
        setInitializing(true);
        setLoading(true);
        setError(null);
        
        // Generate initial story and backstory for the character
        const { backstory, firstSegment } = await generateInitialStory(currentGame, gameSetup);
        
        // Set character backstory
        updateCharacterBackstory(backstory);
        
        // Add backstory to lore
        addLoreEntry({
          id: `lore-backstory-${Date.now()}`,
          title: `${currentGame.character.name}'s Origins`,
          content: backstory,
          discovered: true,
          category: "character"
        });
        
        // Set first game segment with custom choice enabled
        const segmentWithCustom = {
          ...firstSegment,
          customChoiceEnabled: true
        };
        
        updateGameSegment(segmentWithCustom);
        
        // Add first memory
        addMemory({
          id: `memory-${Date.now()}`,
          title: "Chronicle Begins",
          description: `Your adventure begins in ${currentGame.era} as ${currentGame.character.name}.`,
          timestamp: Date.now(),
          category: "event"
        });
        
        setError(null);
        setNarrativeKey(prev => prev + 1);
        
      } catch (error) {
        console.error("Failed to initialize game:", error);
        setError(`Failed to start your chronicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Show fallback content for debugging
        const fallbackSegment = {
          id: "fallback-segment-1",
          text: `Welcome to Chronicle Weaver, ${currentGame.character.name}. 

You find yourself in ${currentGame.era}, where the theme of ${currentGame.theme} shapes every moment of your existence. The world around you is rich with possibility and danger, where every choice you make will echo through the corridors of time.

As you stand at this crossroads of destiny, you feel the weight of history pressing upon your shoulders. The air is thick with anticipation, and you sense that great events are about to unfold. Your journey as a chronicler of your own fate begins now.

The path ahead is uncertain, but your determination is unwavering. You know that the choices you make will not only determine your own fate but may well influence the course of history itself.

What will you do to begin your chronicle?`,
          choices: [
            { id: "1", text: "Explore your immediate surroundings and gather information about the current situation" },
            { id: "2", text: "Seek out local authorities or influential people to understand the political climate" },
            { id: "3", text: "Focus on establishing yourself economically and securing basic resources" }
          ],
          customChoiceEnabled: true
        };
        
        updateGameSegment(fallbackSegment);
        
      } finally {
        setInitializing(false);
        setLoading(false);
        setShowChoices(true);
      }
    } else {
      setInitializing(false);
      setShowChoices(true);
      setNarrativeKey(prev => prev + 1);
    }
  };

  // Initialize game on component mount or currentGame change
  useEffect(() => {
    if (!currentGame) {
      router.replace("/");
      return;
    }

    initializeGame();
  }, [currentGame?.id]);

  /**
   * Handle Narrative Completion
   * 
   * Callback for when the narrative text animation completes.
   * Triggers haptic feedback and scrolls to the choices section.
   */
  const handleNarrativeComplete = () => {
    setShowChoices(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Scroll to the bottom to show choices
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 300);
  };

  /**
   * Handle Choice Selection
   * 
   * Processes the player's choice selection from the available options.
   * Updates the game state and triggers the generation of the next story segment.
   * 
   * @param choiceId - The ID of the selected choice
   */
  const handleChoiceSelected = async (choiceId: string) => {
    if (!currentGame || !currentGame.currentSegment || processingChoice) {
      return;
    }
    
    setShowChoices(false);
    setShowCustomInput(false);
    setProcessingChoice(true);
    
    const selectedChoice = currentGame.currentSegment.choices.find(
      (choice) => choice.id === choiceId
    );
    
    if (!selectedChoice) {
      setProcessingChoice(false);
      setShowChoices(true);
      return;
    }
    
    try {
      const nextSegment = await generateNextSegment(currentGame, selectedChoice);
      
      // Add memory of the choice
      addMemory({
        id: `memory-${Date.now()}`,
        title: `Turn ${currentGame.turnCount + 1}: ${selectedChoice.text.substring(0, 30)}...`,
        description: `You chose: ${selectedChoice.text}`,
        timestamp: Date.now(),
        category: "choice"
      });
      
      // Enable custom choice for next segment
      const segmentWithCustom = {
        ...nextSegment,
        customChoiceEnabled: true
      };
      
      // Update game with new segment
      updateGameSegment(segmentWithCustom);
      
      // Reset UI state for new segment and force narrative re-render
      setShowChoices(false);
      setNarrativeKey(prev => prev + 1);
      
      // Scroll to top when new narrative is shown
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
    } catch (error) {
      console.error("Failed to generate next segment:", error);
      Alert.alert(
        "Error", 
        "Failed to process your choice. Please check your connection and try again.",
        [{ text: "OK" }]
      );
      setShowChoices(true);
    } finally {
      setProcessingChoice(false);
    }
  };

  /**
   * Handle Custom Action
   * 
   * Processes a custom action input by the player.
   * Updates the game state and triggers the generation of the next story segment.
   * 
   * @param customAction - The custom action text provided by the player
   */
  const handleCustomAction = async (customAction: string) => {
    if (!currentGame || processingChoice) {
      return;
    }
    
    setShowChoices(false);
    setShowCustomInput(false);
    setProcessingChoice(true);
    
    const customChoice = {
      id: "custom",
      text: customAction
    };
    
    try {
      const nextSegment = await generateNextSegment(currentGame, customChoice);
      
      // Add memory of the custom action
      addMemory({
        id: `memory-${Date.now()}`,
        title: `Turn ${currentGame.turnCount + 1}: Custom Action`,
        description: `You chose: ${customAction}`,
        timestamp: Date.now(),
        category: "choice"
      });
      
      // Enable custom choice for next segment
      const segmentWithCustom = {
        ...nextSegment,
        customChoiceEnabled: true
      };
      
      // Update game with new segment
      updateGameSegment(segmentWithCustom);
      
      // Reset UI state for new segment and force narrative re-render
      setShowChoices(false);
      setNarrativeKey(prev => prev + 1);
      
      // Scroll to top when new narrative is shown
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
    } catch (error) {
      console.error("Failed to generate next segment for custom action:", error);
      Alert.alert(
        "Error", 
        "Failed to process your action. Please check your connection and try again.",
        [{ text: "OK" }]
      );
      setShowChoices(true);
    } finally {
      setProcessingChoice(false);
    }
  };

  // === NAVIGATION HANDLERS ===
  // Functions to navigate between different screens in the app

  const navigateToHome = () => {
    Alert.alert(
      "End Chronicle",
      "Are you sure you want to end your current chronicle? Your progress will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End Chronicle", style: "destructive", onPress: () => router.replace("/") }
      ]
    );
  };
  // === LOADING AND ERROR STATES ===
  // Render different UI states based on the game status
  
  if (!currentGame) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chronicle...</Text>
        
        {/* Debug toggle for development */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugToggle}
            onPress={() => setShowUltraDebug(!showUltraDebug)}
            activeOpacity={0.8}
          >
            <Bug size={20} color={colors.text} />
          </TouchableOpacity>
        )}        {/* Ultra Debug Panel */}
        <UltraDebugPanel 
          visible={showUltraDebug} 
          onClose={() => setShowUltraDebug(false)}
        />
      </SafeAreaView>
    );
  }

  // Loading state while initializing the game
  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Crown size={Platform.select({ ios: 80, android: 72, default: 72 })} color={colors.primary} />
          <Text style={styles.loadingTitle}>Kronos Weaves Your Chronicle</Text>
          <Text style={styles.loadingText}>
            Creating your unique narrative in {currentGame.era}...
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingSpinner} />
          
          {/* Debug controls during loading */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Controls:</Text>
              <TouchableOpacity style={styles.debugButton} onPress={forceShowUIElements}>
                <Text style={styles.debugButtonText}>🔧 Force Show UI</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Debug toggle for development */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugToggle}
            onPress={() => setShowUltraDebug(!showUltraDebug)}
            activeOpacity={0.8}
          >
            <Bug size={20} color={colors.text} />
          </TouchableOpacity>
        )}        {/* Ultra Debug Panel */}
        <UltraDebugPanel 
          visible={showUltraDebug} 
          onClose={() => setShowUltraDebug(false)}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Crown size={Platform.select({ ios: 56, android: 48, default: 48 })} color={colors.error} />
        <Text style={styles.errorTitle}>Chronicle Interrupted</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorButtonsContainer}>
          <Button 
            title="Retry" 
            onPress={retryInitialization} 
            style={styles.retryButton} 
          />
          <Button title="Return Home" onPress={navigateToHome} style={styles.errorButton} />
        </View>
        
        {/* Debug controls during error */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <TouchableOpacity style={styles.debugButton} onPress={forceShowUIElements}>
              <Text style={styles.debugButtonText}>🔧 Force Show UI</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Debug toggle for development */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugToggle}
            onPress={() => setShowUltraDebug(!showUltraDebug)}
            activeOpacity={0.8}
          >
            <Bug size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        {/* Ultra Debug Panel */}
        <UltraDebugPanel 
          visible={showUltraDebug} 
          onClose={() => setShowUltraDebug(false)} 
        />
      </SafeAreaView>
    );
  }
  // === MAIN GAMEPLAY UI ===
  // Render the main interface for playing the game
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={navigateToHome}>
          <ArrowLeft size={Platform.select({ ios: 28, android: 24, default: 24 })} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleContainer}>
            <Crown size={Platform.select({ ios: 24, android: 20, default: 20 })} color={colors.primary} />
            <Text style={styles.headerTitle}>Chronicle Weaver</Text>
          </View>
          <Text style={styles.turnText}>Turn {currentGame.turnCount} • {currentGame.era}</Text>
        </View>
        
      </View>
      
      {/* Main Content - Full screen narrative until scroll */}
      <View style={styles.content}>
        {currentGame.currentSegment ? (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.mainScrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* Debug buttons for development */}
            {__DEV__ && (
              <View style={styles.debugButtonsContainer}>
                <TouchableOpacity style={styles.debugButton} onPress={() => setNarrativeKey(prev => prev + 1)}>
                  <Text style={styles.debugButtonText}>🔄 Refresh Narrative</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.debugButton} onPress={() => setShowChoices(true)}>
                  <Text style={styles.debugButtonText}>🎯 Show Choices</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={() => setAnimationSpeed(prev => Math.max(1, prev - 1))}
                >
                  <Text style={styles.debugButtonText}>⏩ Speed Up</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Narrative Text Component - Takes full screen space */}
            <View style={styles.narrativeContainer}>
              <NarrativeText 
                key={narrativeKey}
                text={currentGame.currentSegment.text} 
                onComplete={handleNarrativeComplete}
                animated={true}
                speed={animationSpeed}
              />
            </View>
            
            {/* Large spacer to ensure narrative gets full screen before choices */}
            <View style={styles.narrativeSpacer} />
            
            {/* Processing State */}
            {processingChoice && (
              <View style={styles.processingContainer}>
                <Feather size={Platform.select({ ios: 56, android: 48, default: 48 })} color={colors.primary} />
                <Text style={styles.processingTitle}>Kronos weaves the next chapter...</Text>
                <ActivityIndicator size="large" color={colors.primary} style={styles.processingSpinner} />
              </View>
            )}
            
            {/* Custom Input Section - Appears first when scrolling */}
            {!processingChoice && showChoices && (
              <View style={styles.customActionSection}>
                {showCustomInput ? (
                  <CustomChoiceInput
                    onSubmit={handleCustomAction}
                    onCancel={() => setShowCustomInput(false)}
                    disabled={processingChoice}
                  />
                ) : (
                  <TouchableOpacity 
                    style={styles.customActionButton}
                    onPress={() => setShowCustomInput(true)}
                    activeOpacity={0.8}
                  >
                    <Feather size={Platform.select({ ios: 40, android: 36, default: 36 })} color={colors.background} />
                    <View style={styles.customActionContent}>
                      <Text style={styles.customActionTitle}>Write Your Own Action</Text>
                      <Text style={styles.customActionDescription}>
                        Describe what you want to do in this situation
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Predefined Choices Section - Three distinct boxes */}
            {!processingChoice && showChoices && !showCustomInput && (
              <View style={styles.choicesSection}>
                <Text style={styles.choicesTitle}>Or choose from these actions:</Text>
                <View style={styles.choicesContainer}>
                  {currentGame.currentSegment.choices.map((choice, index) => (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      onSelect={handleChoiceSelected}
                      index={index}
                    />
                  ))}
                </View>
                
                {/* Extra space at bottom for mobile comfort */}
                <View style={styles.choicesBottomSpacer} />
              </View>
            )}
            
            {/* Waiting State */}
            {!processingChoice && !showChoices && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>Reading your chronicle...</Text>
                <TouchableOpacity 
                  style={styles.skipButton} 
                  onPress={() => setShowChoices(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipButtonText}>Skip to Choices</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.noContentContainer}>
            <Crown size={Platform.select({ ios: 56, android: 48, default: 48 })} color={colors.textMuted} />
            <Text style={styles.noContentText}>
              No chronicle segment available. Kronos is preparing your story...
            </Text>
            <Button title="Return Home" onPress={navigateToHome} />
            
            {/* Debug info when no content */}
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <TouchableOpacity style={styles.debugButton} onPress={forceShowUIElements}>
                  <Text style={styles.debugButtonText}>🔧 Force Show UI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Debug toggle for development */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.debugToggle}
          onPress={() => setShowUltraDebug(!showUltraDebug)}
          activeOpacity={0.8}
        >
          <Bug size={20} color={colors.text} />
        </TouchableOpacity>
      )}      {/* Ultra Debug Panel */}
      <UltraDebugPanel 
        visible={showUltraDebug} 
        onClose={() => setShowUltraDebug(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: Platform.select({ ios: 48, android: 40, default: 40 }),
  },
  loadingContent: {
    alignItems: "center",
    maxWidth: 380,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: Platform.select({ ios: 36, android: 32, default: 32 }),
    fontWeight: "800",
    marginTop: Platform.select({ ios: 48, android: 40, default: 40 }),
    marginBottom: Platform.select({ ios: 32, android: 28, default: 28 }),
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 22, android: 20, default: 20 }),
    textAlign: "center",
    lineHeight: Platform.select({ ios: 36, android: 32, default: 32 }),
    marginBottom: Platform.select({ ios: 48, android: 40, default: 40 }),
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  loadingSpinner: {
    marginTop: Platform.select({ ios: 40, android: 32, default: 32 }),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: Platform.select({ ios: 48, android: 40, default: 40 }),
  },
  errorTitle: {
    color: colors.error,
    fontSize: Platform.select({ ios: 32, android: 28, default: 28 }),
    fontWeight: "800",
    marginBottom: Platform.select({ ios: 28, android: 24, default: 24 }),
    textAlign: "center",
    marginTop: Platform.select({ ios: 28, android: 24, default: 24 }),
  },
  errorMessage: {
    color: colors.text,
    fontSize: Platform.select({ ios: 22, android: 20, default: 20 }),
    textAlign: "center",
    marginBottom: Platform.select({ ios: 48, android: 40, default: 40 }),
    lineHeight: Platform.select({ ios: 36, android: 32, default: 32 }),
  },
  errorButtonsContainer: {
    flexDirection: "row",
    gap: Platform.select({ ios: 28, android: 24, default: 24 }),
  },
  retryButton: {
    backgroundColor: colors.primary,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Platform.select({ ios: 32, android: 28, default: 28 }),
    paddingVertical: Platform.select({ ios: 28, android: 24, default: 24 }),
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + "40",
    backgroundColor: colors.surface,
  },
  headerButton: {
    padding: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  headerInfo: {
    alignItems: "center",
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  headerTitle: {
    color: colors.text,
    fontSize: Platform.select({ ios: 26, android: 22, default: 22 }),
    fontWeight: "800",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  turnText: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    fontWeight: "600",
    marginTop: Platform.select({ ios: 10, android: 8, default: 8 }),
    fontStyle: "italic",
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
  mainScrollView: {
    flex: 1,
    padding: 10,
  },
  scrollViewContent: {
    paddingBottom: Platform.select({ ios: 80, android: 60, default: 60 }),
  },
  narrativeContainer: {
    paddingHorizontal: 0,
    paddingTop: Platform.select({ ios: 20, android: 16, default: 16 }),
    width: "100%",
    minHeight: SCREEN_HEIGHT * Platform.select({ ios: 0.75, android: 0.7, default: 0.65 }),
  },
  narrativeSpacer: {
    height: 20,
  },
  customActionSection: {
    margin: 10,
    padding: 10,
  },
  customActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: Platform.select({ ios: 28, android: 24, default: 24 }),
    padding: Platform.select({ ios: 32, android: 28, default: 28 }),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 16, android: 12, default: 12 }) },
    shadowOpacity: 0.4,
    shadowRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    elevation: 12,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  customActionContent: {
    marginLeft: Platform.select({ ios: 32, android: 28, default: 28 }),
    flex: 1,
  },
  customActionTitle: {
    color: colors.background,
    fontSize: Platform.select({ ios: 26, android: 22, default: 22 }),
    fontWeight: "800",
    marginBottom: Platform.select({ ios: 10, android: 8, default: 8 }),
  },
  customActionDescription: {
    color: colors.background,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    opacity: 0.9,
    lineHeight: Platform.select({ ios: 30, android: 28, default: 28 }),
  },
  choicesSection: {
    paddingHorizontal: Platform.select({ ios: 28, android: 24, default: 24 }),
    paddingTop: Platform.select({ ios: 40, android: 32, default: 32 }),
    paddingBottom: Platform.select({ ios: 48, android: 40, default: 40 }),
    width: "100%",
  },
  choicesTitle: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 22, android: 20, default: 20 }),
    fontWeight: "700",
    marginBottom: Platform.select({ ios: 32, android: 28, default: 28 }),
    textAlign: "center",
  },
  choicesContainer: {
    gap: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  choicesBottomSpacer: {
    height: Platform.select({ ios: 80, android: 60, default: 60 }),
  },
  processingContainer: {
    padding: Platform.select({ ios: 72, android: 60, default: 60 }),
    alignItems: "center",
    marginTop: Platform.select({ ios: 40, android: 32, default: 32 }),
    marginHorizontal: Platform.select({ ios: 28, android: 24, default: 24 }),
    backgroundColor: colors.surface + "90",
    borderRadius: Platform.select({ ios: 28, android: 24, default: 24 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  processingTitle: {
    color: colors.text,
    fontSize: Platform.select({ ios: 26, android: 22, default: 22 }),
    fontWeight: "700",
    marginTop: Platform.select({ ios: 40, android: 32, default: 32 }),
    marginBottom: Platform.select({ ios: 28, android: 24, default: 24 }),
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  processingSpinner: {
    marginTop: Platform.select({ ios: 28, android: 24, default: 24 }),
  },
  waitingContainer: {
    padding: Platform.select({ ios: 48, android: 40, default: 40 }),
    alignItems: "center",
    marginTop: Platform.select({ ios: 40, android: 32, default: 32 }),
    marginHorizontal: Platform.select({ ios: 28, android: 24, default: 24 }),
    backgroundColor: colors.surface + "90",
    borderRadius: Platform.select({ ios: 28, android: 24, default: 24 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  waitingText: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 22, android: 20, default: 20 }),
    textAlign: "center",
    marginBottom: Platform.select({ ios: 28, android: 24, default: 24 }),
  },
  skipButton: {
    backgroundColor: colors.primary + "30",
    borderRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    paddingHorizontal: Platform.select({ ios: 32, android: 28, default: 28 }),
    paddingVertical: Platform.select({ ios: 24, android: 20, default: 20 }),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "700",
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Platform.select({ ios: 48, android: 40, default: 40 }),
  },
  noContentText: {
    color: colors.text,
    fontSize: Platform.select({ ios: 22, android: 20, default: 20 }),
    textAlign: "center",
    marginBottom: Platform.select({ ios: 48, android: 40, default: 40 }),
    marginTop: Platform.select({ ios: 28, android: 24, default: 24 }),
    lineHeight: Platform.select({ ios: 36, android: 32, default: 32 }),
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.primary + "40",
    paddingVertical: Platform.select({ ios: 24, android: 20, default: 20 }),
    paddingHorizontal: Platform.select({ ios: 28, android: 24, default: 24 }),
    paddingBottom: Platform.select({ ios: 36, android: 28, default: 28 }),
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Platform.select({ ios: 20, android: 16, default: 16 }),
  },
  navButtonText: {
    color: colors.textMuted,
    fontSize: Platform.select({ ios: 16, android: 14, default: 14 }),
    marginTop: Platform.select({ ios: 10, android: 8, default: 8 }),
    fontWeight: "600",
  },
  debugContainer: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    padding: Platform.select({ ios: 28, android: 24, default: 24 }),
    marginTop: Platform.select({ ios: 40, android: 32, default: 32 }),
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 360,
  },
  debugTitle: {
    color: colors.text,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "700",
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
  },
  debugButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Platform.select({ ios: 28, android: 24, default: 24 }),
    gap: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  debugButton: {
    backgroundColor: colors.primary,
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    flex: 1,
    alignItems: "center",
  },  debugButtonText: {
    color: colors.background,
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    fontWeight: "700",
  },
  debugToggle: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 50, default: 50 }),
    right: Platform.select({ ios: 20, android: 16, default: 16 }),
    backgroundColor: colors.cardBackground,
    borderRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    padding: Platform.select({ ios: 12, android: 10, default: 10 }),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
});