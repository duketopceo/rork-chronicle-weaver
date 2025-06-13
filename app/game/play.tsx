import React, { useEffect, useState, useRef } from "react";
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
import { User, ArrowLeft, MessageCircle, Crown, Feather } from "lucide-react-native";
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
  const scrollViewRef = useRef<ScrollView>(null);

  // Force show UI for debugging
  const forceShowUIElements = () => {
    console.log("[PLAY] Force showing UI elements");
    setShowChoices(true);
    setInitializing(false);
    setProcessingChoice(false);
  };

  // Retry initialization if it fails
  const retryInitialization = async () => {
    console.log("[PLAY] Retrying initialization");
    setError(null);
    await initializeGame();
  };

  const initializeGame = async () => {
    console.log("[PLAY] Starting game initialization");
    
    if (!currentGame) {
      console.log("[PLAY] No current game, redirecting to home");
      router.replace("/");
      return;
    }
    
    if (!currentGame.currentSegment) {
      console.log("[PLAY] No current segment, generating initial story");
      try {
        setInitializing(true);
        setLoading(true);
        setError(null);
        
        console.log("[PLAY] Calling generateInitialStory");
        
        const { backstory, firstSegment } = await generateInitialStory(currentGame, gameSetup);
        
        console.log("[PLAY] Generated content", {
          backstoryLength: backstory.length,
          segmentTextLength: firstSegment.text.length,
          segmentChoicesCount: firstSegment.choices.length
        });
        
        // Set character backstory
        console.log("[PLAY] Setting character backstory");
        updateCharacterBackstory(backstory);
        
        // Add backstory to lore
        addLoreEntry({
          id: `lore-backstory-${Date.now()}`,
          title: `${currentGame.character.name}'s Origins`,
          content: backstory,
          discovered: true,
          category: "character"
        });
        
        console.log("[PLAY] Added backstory to lore");
        
        // Set first game segment with custom choice enabled
        const segmentWithCustom = {
          ...firstSegment,
          customChoiceEnabled: true
        };
        
        console.log("[PLAY] Updating game segment");
        updateGameSegment(segmentWithCustom);
        
        // Add first memory
        addMemory({
          id: `memory-${Date.now()}`,
          title: "Chronicle Begins",
          description: `Your adventure begins in ${currentGame.era} as ${currentGame.character.name}.`,
          timestamp: Date.now(),
          category: "event"
        });
        
        console.log("[PLAY] Added initial memory");
        
        setError(null);
        setNarrativeKey(prev => prev + 1);
        console.log("[PLAY] Game initialization complete");
        
      } catch (error) {
        console.error("[PLAY] Failed to initialize game:", error);
        setError(`Failed to start your chronicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Show fallback content for debugging
        console.log("[PLAY] Providing fallback content for debugging");
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
      console.log("[PLAY] Game already has current segment, showing UI");
      console.log("[PLAY] Existing segment details", {
        textLength: currentGame.currentSegment.text.length,
        choicesCount: currentGame.currentSegment.choices.length,
        customChoiceEnabled: currentGame.currentSegment.customChoiceEnabled
      });
      setInitializing(false);
      setShowChoices(true);
      setNarrativeKey(prev => prev + 1);
    }
  };

  useEffect(() => {
    console.log("[PLAY] Game play screen mounted");
    console.log("[PLAY] Current game exists", !!currentGame);
    console.log("[PLAY] Current game ID", currentGame?.id);
    console.log("[PLAY] Current segment exists", !!currentGame?.currentSegment);
    console.log("[PLAY] Current segment text length", currentGame?.currentSegment?.text?.length || 0);
    
    if (!currentGame) {
      console.log("[PLAY] No current game, redirecting to home");
      router.replace("/");
      return;
    }

    initializeGame();
  }, [currentGame?.id]);

  const handleNarrativeComplete = () => {
    console.log("[PLAY] Narrative animation complete, showing choices");
    setShowChoices(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleChoiceSelected = async (choiceId: string) => {
    if (!currentGame || !currentGame.currentSegment || processingChoice) {
      console.log("[PLAY] Cannot process choice - invalid state");
      return;
    }
    
    console.log("[PLAY] Choice selected", choiceId);
    setShowChoices(false);
    setShowCustomInput(false);
    setProcessingChoice(true);
    
    const selectedChoice = currentGame.currentSegment.choices.find(
      (choice) => choice.id === choiceId
    );
    
    if (!selectedChoice) {
      console.log("[PLAY] Selected choice not found");
      setProcessingChoice(false);
      setShowChoices(true);
      return;
    }
    
    try {
      console.log("[PLAY] Generating next segment for choice", selectedChoice.text);
      const nextSegment = await generateNextSegment(currentGame, selectedChoice);
      
      console.log("[PLAY] Generated next segment", {
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
      
      console.log("[PLAY] Choice processing complete");
      
      // Scroll to top when new narrative is shown
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
    } catch (error) {
      console.error("[PLAY] Failed to generate next segment:", error);
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
      console.log("[PLAY] Cannot process custom action - invalid state");
      return;
    }
    
    console.log("[PLAY] Custom action submitted", customAction);
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
      
      console.log("[PLAY] Custom action processing complete");
      
      // Scroll to top when new narrative is shown
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
    } catch (error) {
      console.error("[PLAY] Failed to generate next segment for custom action:", error);
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

  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <DebugPanel />
        <View style={styles.loadingContent}>
          <Crown size={72} color={colors.primary} />
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
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <DebugPanel />
        <Crown size={48} color={colors.error} />
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <DebugPanel />
      
      {/* Header */}
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
      
      {/* Main Content */}
      <View style={styles.content}>
        {currentGame.currentSegment ? (
          <>
            {/* Narrative Section */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.narrativeSection} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.narrativeContent}
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
                </View>
              )}
              
              {/* Narrative Text Component */}
              <NarrativeText 
                key={narrativeKey}
                text={currentGame.currentSegment.text} 
                onComplete={handleNarrativeComplete}
                animated={true}
              />
              
              {/* Spacer to ensure good spacing between narrative and choices */}
              <View style={styles.spacer} />
            </ScrollView>
            
            {/* Processing State */}
            {processingChoice ? (
              <View style={styles.processingContainer}>
                <Feather size={48} color={colors.primary} />
                <Text style={styles.processingTitle}>Kronos weaves the next chapter...</Text>
                <ActivityIndicator size="large" color={colors.primary} style={styles.processingSpinner} />
              </View>
            ) : showCustomInput ? (
              /* Custom Input */
              <CustomChoiceInput
                onSubmit={handleCustomAction}
                onCancel={() => setShowCustomInput(false)}
                disabled={processingChoice}
              />
            ) : showChoices ? (
              /* Choices Section */
              <View style={styles.choicesSection}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Custom Action Button */}
                  <TouchableOpacity 
                    style={styles.customActionButton}
                    onPress={() => setShowCustomInput(true)}
                  >
                    <Feather size={28} color={colors.background} />
                    <View style={styles.customActionContent}>
                      <Text style={styles.customActionTitle}>Write Your Own Action</Text>
                      <Text style={styles.customActionDescription}>
                        Describe what you want to do
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Predefined Choices */}
                  <Text style={styles.choicesTitle}>Or choose:</Text>
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
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={navigateToCharacter}>
          <User size={18} color={colors.textMuted} />
          <Text style={styles.navButtonText}>Character</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={navigateToLore}>
          <Feather size={18} color={colors.textMuted} />
          <Text style={styles.navButtonText}>Chronicle</Text>
        </TouchableOpacity>
      </View>
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
  errorButtonsContainer: {
    flexDirection: "row",
    gap: 16,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + "30",
    backgroundColor: colors.surface,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
  narrativeSection: {
    flex: 2,
    marginRight: 10,
  },
  narrativeContent: {
    paddingBottom: 20, // Add padding at the bottom for better spacing
  },
  spacer: {
    height: 20, // Extra space between narrative and choices
  },
  choicesSection: {
    flex: 1,
    marginLeft: 10,
    maxHeight: 350,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface + "80",
  },
  customActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  customActionDescription: {
    color: colors.background,
    fontSize: 14,
    opacity: 0.9,
  },
  choicesTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  processingContainer: {
    padding: 40,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface + "80",
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
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface + "80",
  },
  waitingText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
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
  debugButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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