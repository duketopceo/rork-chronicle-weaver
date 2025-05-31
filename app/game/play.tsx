import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useGameStore } from "@/store/gameStore";
import NarrativeText from "@/components/NarrativeText";
import ChoiceButton from "@/components/ChoiceButton";
import CustomChoiceInput from "@/components/CustomChoiceInput";
import DebugPanel from "@/components/DebugPanel";
import Button from "@/components/Button";
import { generateInitialStory, generateNextSegment } from "@/services/aiService";
import { Book, User, Clock, ArrowLeft, Menu, MessageCircle, Edit3, History, Settings, Scroll, Crown, Feather } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function GamePlayScreen() {
  const router = useRouter();
  const { 
    currentGame, 
    gameSetup,
    isLoading, 
    error,
    updateGameSegment,
    updateCharacterStats,
    addMemory,
    addLoreEntry,
    setLoading,
    setError,
    updateCharacterBackstory
  } = useGameStore();
  
  const [showChoices, setShowChoices] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [processingChoice, setProcessingChoice] = useState(false);
  const [narrativeKey, setNarrativeKey] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [forceShowUI, setForceShowUI] = useState(false);

  // Enhanced debug logging function
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = data ? `${message} | Data: ${JSON.stringify(data)}` : message;
    console.log(`[PLAY DEBUG ${timestamp}] ${logMessage}`);
    setDebugInfo(prev => [`${timestamp}: ${logMessage}`, ...prev.slice(0, 29)]);
  };

  // Force show UI for debugging
  const forceShowUIElements = () => {
    addDebugLog("🔧 FORCE SHOWING UI ELEMENTS");
    setForceShowUI(true);
    setShowChoices(true);
    setInitializing(false);
    setProcessingChoice(false);
  };

  useEffect(() => {
    addDebugLog("=== 🎮 GAME PLAY SCREEN MOUNTED ===");
    addDebugLog("Current game exists", !!currentGame);
    addDebugLog("Current game ID", currentGame?.id);
    addDebugLog("Current segment exists", !!currentGame?.currentSegment);
    addDebugLog("Current segment text length", currentGame?.currentSegment?.text?.length || 0);
    addDebugLog("Current segment choices count", currentGame?.currentSegment?.choices?.length || 0);
    addDebugLog("Game setup", { era: gameSetup.era, theme: gameSetup.theme, character: gameSetup.characterName });
    
    if (!currentGame) {
      addDebugLog("❌ No current game, redirecting to home");
      router.replace("/");
      return;
    }

    const initializeGame = async () => {
      addDebugLog("=== 🚀 STARTING GAME INITIALIZATION ===");
      
      if (!currentGame.currentSegment) {
        addDebugLog("📝 No current segment, generating initial story");
        try {
          setInitializing(true);
          setLoading(true);
          setError(null);
          
          addDebugLog("🤖 Calling generateInitialStory", {
            era: currentGame.era,
            theme: currentGame.theme,
            character: currentGame.character.name,
            difficulty: currentGame.difficulty
          });
          
          const { backstory, firstSegment } = await generateInitialStory(currentGame, gameSetup);
          
          addDebugLog("✅ Generated content", {
            backstoryLength: backstory.length,
            segmentTextLength: firstSegment.text.length,
            segmentChoicesCount: firstSegment.choices.length
          });
          
          // Validate the generated content
          if (!firstSegment.text || firstSegment.text.length < 100) {
            throw new Error(`Generated segment text is too short: ${firstSegment.text.length} characters`);
          }
          
          if (!firstSegment.choices || firstSegment.choices.length === 0) {
            throw new Error("Generated segment has no choices");
          }
          
          // Set character backstory
          addDebugLog("📚 Setting character backstory");
          updateCharacterBackstory(backstory);
          
          // Add backstory to lore
          addLoreEntry({
            id: `lore-backstory-${Date.now()}`,
            title: `${currentGame.character.name}'s Origins`,
            content: backstory,
            discovered: true,
            category: "character"
          });
          
          addDebugLog("📖 Added backstory to lore");
          
          // Set first game segment with custom choice enabled
          const segmentWithCustom = {
            ...firstSegment,
            customChoiceEnabled: true
          };
          
          addDebugLog("🎯 Updating game segment");
          updateGameSegment(segmentWithCustom);
          
          // Add first memory
          addMemory({
            id: `memory-${Date.now()}`,
            title: "Chronicle Begins",
            description: `Your adventure begins in ${currentGame.era} as ${currentGame.character.name}.`,
            timestamp: Date.now(),
            category: "event"
          });
          
          addDebugLog("💭 Added initial memory");
          
          setError(null);
          setNarrativeKey(prev => prev + 1);
          addDebugLog("=== ✅ GAME INITIALIZATION COMPLETE ===");
          
          // Show UI immediately after initialization
          setTimeout(() => {
            addDebugLog("🎬 Auto-showing UI after initialization");
            setInitializing(false);
            setShowChoices(true);
          }, 1000);
          
        } catch (error) {
          addDebugLog("❌ FAILED to initialize game", error);
          console.error("Failed to initialize game:", error);
          setError(`Failed to start your chronicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Show fallback content for debugging
          addDebugLog("🔧 Providing fallback content for debugging");
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
          setInitializing(false);
          setShowChoices(true);
          setNarrativeKey(prev => prev + 1);
          
        } finally {
          setLoading(false);
        }
      } else {
        addDebugLog("📖 Game already has current segment, showing UI");
        addDebugLog("Existing segment details", {
          textLength: currentGame.currentSegment.text.length,
          choicesCount: currentGame.currentSegment.choices.length,
          customChoiceEnabled: currentGame.currentSegment.customChoiceEnabled
        });
        setInitializing(false);
        setShowChoices(true);
        setNarrativeKey(prev => prev + 1);
      }
    };

    initializeGame();
  }, [currentGame?.id]);

  const handleNarrativeComplete = () => {
    addDebugLog("📚 Narrative animation complete, ensuring choices are visible");
    setShowChoices(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleChoiceSelected = async (choiceId: string) => {
    if (!currentGame || !currentGame.currentSegment || processingChoice) {
      addDebugLog("❌ Cannot process choice - invalid state", {
        hasGame: !!currentGame,
        hasSegment: !!currentGame?.currentSegment,
        isProcessing: processingChoice
      });
      return;
    }
    
    addDebugLog("🎯 Choice selected", choiceId);
    setShowChoices(false);
    setShowCustomInput(false);
    setProcessingChoice(true);
    
    const selectedChoice = currentGame.currentSegment.choices.find(
      (choice) => choice.id === choiceId
    );
    
    if (!selectedChoice) {
      addDebugLog("❌ Selected choice not found");
      setProcessingChoice(false);
      setShowChoices(true);
      return;
    }
    
    try {
      addDebugLog("🤖 Generating next segment for choice", selectedChoice.text);
      const nextSegment = await generateNextSegment(currentGame, selectedChoice);
      
      addDebugLog("✅ Generated next segment", {
        textLength: nextSegment.text.length,
        choicesCount: nextSegment.choices.length
      });
      
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
      
      addDebugLog("✅ Choice processing complete");
      
      // Show choices after a short delay
      setTimeout(() => {
        addDebugLog("🎬 Auto-showing choices after choice processing");
        setShowChoices(true);
      }, 1500);
      
    } catch (error) {
      addDebugLog("❌ Failed to generate next segment", error);
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

  const handleCustomAction = async (customAction: string) => {
    if (!currentGame || processingChoice) {
      addDebugLog("❌ Cannot process custom action - invalid state");
      return;
    }
    
    addDebugLog("✏️ Custom action submitted", customAction);
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
      
      addDebugLog("✅ Custom action processing complete");
      
      // Show choices after narrative completes
      setTimeout(() => {
        addDebugLog("🎬 Auto-showing choices after custom action");
        setShowChoices(true);
      }, 1500);
      
    } catch (error) {
      addDebugLog("❌ Failed to generate next segment for custom action", error);
      console.error("Failed to generate next segment:", error);
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

  const navigateToCharacter = () => {
    router.push("/game/character");
  };

  const navigateToLore = () => {
    router.push("/game/lore");
  };

  const navigateToSystems = () => {
    router.push("/game/systems");
  };

  const navigateToKronos = () => {
    router.push("/game/kronos");
  };

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

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <DebugPanel />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chronicle...</Text>
      </SafeAreaView>
    );
  }

  if (initializing && !forceShowUI) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <DebugPanel />
        <View style={styles.loadingContent}>
          <Crown size={72} color={colors.primary} />
          <Text style={styles.loadingTitle}>Kronos Weaves Your Chronicle</Text>
          <Text style={styles.loadingText}>
            The Weaver of Chronicles is crafting your unique narrative in {currentGame.era}...
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingSpinner} />
          
          {/* Debug controls during loading */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Controls:</Text>
              <TouchableOpacity style={styles.debugButton} onPress={forceShowUIElements}>
                <Text style={styles.debugButtonText}>🔧 Force Show UI</Text>
              </TouchableOpacity>
              {debugInfo.slice(0, 3).map((info, index) => (
                <Text key={index} style={styles.debugText}>{info}</Text>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (error && !forceShowUI) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <DebugPanel />
        <Crown size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Chronicle Interrupted</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button title="Return Home" onPress={navigateToHome} style={styles.errorButton} />
        
        {/* Debug controls during error */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <TouchableOpacity style={styles.debugButton} onPress={forceShowUIElements}>
              <Text style={styles.debugButtonText}>🔧 Force Show UI</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <DebugPanel />
      
      {/* Enhanced Historical Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={navigateToHome}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleContainer}>
            <Crown size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Chronicle Weaver</Text>
          </View>
          <Text style={styles.turnText}>Turn {currentGame.turnCount} • {currentGame.era}</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton} onPress={navigateToKronos}>
          <MessageCircle size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Main Content - Focus on Narrative */}
      <View style={styles.content}>
        {currentGame.currentSegment ? (
          <>
            {/* Narrative Section - Takes most space */}
            <View style={styles.narrativeSection}>
              <NarrativeText 
                key={narrativeKey}
                text={currentGame.currentSegment.text} 
                onComplete={handleNarrativeComplete}
                animated={true}
              />
            </View>
            
            {/* Debug buttons for development */}
            {__DEV__ && (
              <View style={styles.debugButtonsContainer}>
                <TouchableOpacity style={styles.debugButton} onPress={() => setShowChoices(true)}>
                  <Text style={styles.debugButtonText}>🎯 Force Show Choices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.debugButton} onPress={forceShowUIElements}>
                  <Text style={styles.debugButtonText}>🔧 Force Show All UI</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Processing State */}
            {processingChoice ? (
              <View style={styles.processingContainer}>
                <Feather size={48} color={colors.primary} />
                <Text style={styles.processingTitle}>Kronos weaves the next chapter...</Text>
                <ActivityIndicator size="large" color={colors.primary} style={styles.processingSpinner} />
              </View>
            ) : showCustomInput ? (
              /* Custom Input - Primary Action */
              <CustomChoiceInput
                onSubmit={handleCustomAction}
                onCancel={() => setShowCustomInput(false)}
                disabled={processingChoice}
              />
            ) : (showChoices || forceShowUI) ? (
              /* Choices Section - Custom First */
              <View style={styles.choicesSection}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Custom Action Button - Primary and Prominent */}
                  <TouchableOpacity 
                    style={styles.customActionButton}
                    onPress={() => setShowCustomInput(true)}
                  >
                    <Edit3 size={28} color={colors.background} />
                    <View style={styles.customActionContent}>
                      <Text style={styles.customActionTitle}>Write Your Own Action</Text>
                      <Text style={styles.customActionDescription}>
                        Describe exactly what you want to do - the main way to play
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Predefined Choices - Secondary */}
                  <Text style={styles.choicesTitle}>Or choose from these suggestions:</Text>
                  {currentGame.currentSegment.choices.map((choice, index) => (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      onSelect={handleChoiceSelected}
                      index={index}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : (
              /* Waiting for narrative to complete */
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>Reading your chronicle...</Text>
                <TouchableOpacity style={styles.skipButton} onPress={() => setShowChoices(true)}>
                  <Text style={styles.skipButtonText}>Skip to Choices</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noContentContainer}>
            <Crown size={48} color={colors.textMuted} />
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
      
      {/* Enhanced Historical Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={navigateToCharacter}>
          <User size={18} color={colors.textMuted} />
          <Text style={styles.navButtonText}>Character</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={navigateToSystems}>
          <Settings size={18} color={colors.textMuted} />
          <Text style={styles.navButtonText}>Systems</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={navigateToLore}>
          <Book size={18} color={colors.textMuted} />
          <Text style={styles.navButtonText}>Lore</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  loadingContent: {
    alignItems: "center",
    maxWidth: 320,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "serif",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 28,
    fontFamily: "serif",
  },
  loadingSpinner: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    marginTop: 16,
  },
  errorMessage: {
    color: colors.text,
    fontSize: 17,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 26,
  },
  errorButton: {
    minWidth: 200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + "30",
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerInfo: {
    alignItems: "center",
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "serif",
  },
  turnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
    fontStyle: "italic",
  },
  content: {
    flex: 1,
  },
  narrativeSection: {
    flex: 1,
    minHeight: 400,
  },
  choicesSection: {
    maxHeight: 350,
    padding: 16,
  },
  customActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  customActionContent: {
    marginLeft: 20,
    flex: 1,
  },
  customActionTitle: {
    color: colors.background,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  customActionDescription: {
    color: colors.background,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  choicesTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  processingContainer: {
    padding: 40,
    alignItems: "center",
  },
  processingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "serif",
  },
  processingSpinner: {
    marginTop: 16,
  },
  waitingContainer: {
    padding: 40,
    alignItems: "center",
  },
  waitingText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noContentText: {
    color: colors.text,
    fontSize: 17,
    textAlign: "center",
    marginBottom: 28,
    marginTop: 16,
    lineHeight: 26,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.primary + "30",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  debugContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 300,
  },
  debugTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  debugText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  debugButtonsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  debugButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: "center",
  },
  debugButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "600",
  },
});