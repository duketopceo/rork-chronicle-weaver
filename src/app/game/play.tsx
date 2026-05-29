import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import { useGameStore } from "../../store/gameStore";
import NarrativeText from "../../components/NarrativeText";
import ChoiceButton from "../../components/ChoiceButton";
import CustomChoiceInput from "../../components/CustomChoiceInput";
import { UltraDebugPanel } from "../../components/UltraDebugPanel";
import Button from "../../components/Button";
import ErrorState from "../../components/ErrorState";
import ModelSelector from "../../components/ModelSelector";
import { generateInitialStory, generateNextSegment } from "../../services/aiService";
import { modelRouter } from "../../services/ai/ModelRouter";
import { ArrowLeft, Crown, Feather, Bug } from "lucide-react-native";
import * as Haptics from "expo-haptics";

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
    updateCharacterBackstory,
  } = useGameStore();

  const narrative = useGameStore((state) => state.narrative);

  const [showChoices, setShowChoices] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [processingChoice, setProcessingChoice] = useState(false);
  const [narrativeKey, setNarrativeKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showUltraDebug, setShowUltraDebug] = useState(false);
  const [activeModelId, setActiveModelId] = useState(modelRouter.getActiveProviderId());
  const scrollViewRef = useRef<ScrollView>(null);
  const historyHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(historyHeight, {
      toValue: showHistory ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [showHistory]);

  const retryInitialization = async () => {
    setError(null);
    await initializeGame();
  };

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

        const { backstory, firstSegment } = await generateInitialStory(currentGame, gameSetup);
        updateCharacterBackstory(backstory);

        addLoreEntry({
          id: `lore-backstory-${Date.now()}`,
          title: `${currentGame.character.name}'s Origins`,
          content: backstory,
          unlocked: true,
          category: "character",
        });

        updateGameSegment({ ...firstSegment, customChoiceEnabled: true });

        addMemory({
          id: `memory-${Date.now()}`,
          segmentId: firstSegment.id,
          title: "Chronicle Begins",
          summary: `Your adventure begins in ${currentGame.era} as ${currentGame.character.name}.`,
          description: `Your adventure begins in ${currentGame.era} as ${currentGame.character.name}.`,
          choiceMade: "Start adventure",
          consequence: "Your journey has begun",
          timestamp: Date.now(),
          category: "event",
          importance: "high" as const,
        });

        setError(null);
        setNarrativeKey((prev) => prev + 1);
      } catch (err) {
        setError(
          `Failed to start your chronicle: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        updateGameSegment({
          id: "fallback-segment-1",
          text: `Welcome to Chronicle Weaver, ${currentGame.character.name}. You find yourself in ${currentGame.era}. Your chronicle begins now.`,
          choices: [
            { id: "1", text: "Explore your surroundings" },
            { id: "2", text: "Seek out local people" },
            { id: "3", text: "Take stock of your situation" },
          ],
          customChoiceEnabled: true,
        });
      } finally {
        setInitializing(false);
        setLoading(false);
        setShowChoices(true);
      }
    } else {
      setInitializing(false);
      setShowChoices(true);
      setNarrativeKey((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (!currentGame) {
      router.replace("/");
      return;
    }
    initializeGame();
  }, [currentGame?.id]);

  const handleNarrativeComplete = () => {
    setShowChoices(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const processChoice = async (choiceText: string, choiceId: string) => {
    if (!currentGame || !currentGame.currentSegment || processingChoice) return;

    setShowChoices(false);
    setShowCustomInput(false);
    setProcessingChoice(true);

    const choice = { id: choiceId, text: choiceText };

    try {
      const nextSegment = await generateNextSegment(currentGame, choice);

      addMemory({
        id: `memory-${Date.now()}`,
        segmentId: currentGame.currentSegment?.id ?? "",
        title: `Turn ${currentGame.turnCount + 1}: ${choiceText.substring(0, 30)}...`,
        summary: `You chose: ${choiceText}`,
        description: `You chose: ${choiceText}`,
        choiceMade: choiceText,
        consequence: "Awaiting outcome",
        timestamp: Date.now(),
        category: "choice",
        importance: "medium" as const,
      });

      updateGameSegment({ ...nextSegment, customChoiceEnabled: true });
      setShowChoices(false);
      setNarrativeKey((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });

      // Update model badge
      setActiveModelId(modelRouter.getActiveProviderId());
    } catch {
      Alert.alert("Error", "Failed to process your choice. Please try again.", [{ text: "OK" }]);
      setShowChoices(true);
    } finally {
      setProcessingChoice(false);
    }
  };

  const handleChoiceSelected = (choiceId: string) => {
    const choice = currentGame?.currentSegment?.choices.find((c) => c.id === choiceId);
    if (choice) processChoice(choice.text, choiceId);
  };

  const handleCustomAction = (customAction: string) => {
    processChoice(customAction, "custom");
  };

  const navigateToHome = () => {
    Alert.alert("End Chronicle", "End your current chronicle? Progress will be saved.", [
      { text: "Cancel", style: "cancel" },
      { text: "End Chronicle", style: "destructive", onPress: () => router.replace("/") },
    ]);
  };

  const modelLabel = activeModelId.startsWith("cloud-")
    ? activeModelId.replace("cloud-", "").toUpperCase()
    : activeModelId.replace("ollama-", "").replace("ollama", "local");

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chronicle...</Text>
      </SafeAreaView>
    );
  }

  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Crown size={64} color={colors.primary} />
          <Text style={styles.loadingTitle}>Kronos Weaves Your Chronicle</Text>
          <Text style={styles.loadingText}>Creating your narrative in {currentGame.era}...</Text>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    let errorType: "network" | "server" | "validation" | "auth" | "generic" = "generic";
    if (error.toLowerCase().includes("network") || error.toLowerCase().includes("fetch"))
      errorType = "network";
    else if (error.toLowerCase().includes("server") || error.toLowerCase().includes("500"))
      errorType = "server";
    else if (error.toLowerCase().includes("auth")) errorType = "auth";

    return (
      <SafeAreaView style={styles.errorContainer}>
        <ErrorState
          type={errorType}
          title="Chronicle Interrupted"
          message={error}
          onRetry={retryInitialization}
          onDismiss={navigateToHome}
          retryText="Try Again"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={navigateToHome}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <Crown size={18} color={colors.primary} />
            <Text style={styles.headerTitle}>Chronicle Weaver</Text>
          </View>
          <Text style={styles.turnText}>
            Turn {currentGame.turnCount} • {currentGame.era}
          </Text>
        </View>

        {/* Model badge */}
        <TouchableOpacity style={styles.modelBadge} onPress={() => setShowModelSelector(true)}>
          <Text style={styles.modelBadgeText}>{modelLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {currentGame.currentSegment ? (
          <>
            {/* Scrollable narrative area */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Collapsible history */}
              {currentGame.pastSegments && currentGame.pastSegments.length > 0 && (
                <View style={styles.historySection}>
                  <TouchableOpacity
                    style={styles.historyToggle}
                    onPress={() => setShowHistory((v) => !v)}
                  >
                    <Text style={styles.historyToggleText}>
                      {showHistory
                        ? "▲ Hide History"
                        : `▼ History (${currentGame.pastSegments.length} turns)`}
                    </Text>
                  </TouchableOpacity>

                  <Animated.View style={{ opacity: historyHeight, overflow: "hidden" }}>
                    {currentGame.pastSegments.slice(-5).map((seg: any, i: number) => (
                      <View key={seg.id ?? i} style={styles.historyEntry}>
                        <Text style={styles.historyText} numberOfLines={3}>
                          {seg.text}
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                </View>
              )}

              {/* Narrative */}
              <View style={styles.narrativeContainer}>
                <NarrativeText
                  key={narrativeKey}
                  text={currentGame.currentSegment.text}
                  onComplete={handleNarrativeComplete}
                  animated={true}
                  speed={1}
                />
              </View>

              {/* "Skip to choices" when animating */}
              {!processingChoice && !showChoices && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => setShowChoices(true)}
                >
                  <Text style={styles.skipButtonText}>Skip to Choices</Text>
                </TouchableOpacity>
              )}

              {/* Processing state */}
              {processingChoice && (
                <View style={styles.processingContainer}>
                  <Feather size={40} color={colors.primary} />
                  <Text style={styles.processingTitle}>Kronos weaves the next chapter...</Text>
                  <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                </View>
              )}
            </ScrollView>

            {/* Sticky bottom choices/input */}
            {!processingChoice && showChoices && (
              <View style={styles.stickyBottom}>
                {showCustomInput ? (
                  <CustomChoiceInput
                    onSubmit={handleCustomAction}
                    onCancel={() => setShowCustomInput(false)}
                    disabled={processingChoice}
                  />
                ) : (
                  <>
                    {/* "Write your own" prompt */}
                    <TouchableOpacity
                      style={styles.customActionButton}
                      onPress={() => setShowCustomInput(true)}
                      activeOpacity={0.8}
                    >
                      <Feather size={20} color={colors.background} />
                      <Text style={styles.customActionText}>Write Your Own Action</Text>
                    </TouchableOpacity>

                    {/* Predefined choices */}
                    <View style={styles.choicesList}>
                      {currentGame.currentSegment.choices.map((choice: any, index: number) => (
                        <ChoiceButton
                          key={choice.id}
                          choice={choice}
                          onSelect={handleChoiceSelected}
                          index={index}
                        />
                      ))}
                    </View>
                  </>
                )}
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
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Debug toggle */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.debugToggle}
          onPress={() => setShowUltraDebug(!showUltraDebug)}
        >
          <Bug size={18} color={colors.text} />
        </TouchableOpacity>
      )}
      {__DEV__ && (
        <UltraDebugPanel visible={showUltraDebug} onClose={() => setShowUltraDebug(false)} />
      )}

      {/* Model selector modal */}
      <ModelSelector
        visible={showModelSelector}
        onClose={() => {
          setShowModelSelector(false);
          setActiveModelId(modelRouter.getActiveProviderId());
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 40,
  },
  loadingContent: { alignItems: "center", maxWidth: 360 },
  loadingTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 32,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + "40",
    backgroundColor: colors.surface,
  },
  headerButton: { padding: 8, borderRadius: 8 },
  headerInfo: { flex: 1, alignItems: "center" },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  },
  turnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  modelBadge: {
    backgroundColor: colors.primary + "25",
    borderWidth: 1,
    borderColor: colors.primary + "60",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modelBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "600" },

  // Body
  body: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 20 },

  // History
  historySection: { marginBottom: 12 },
  historyToggle: { paddingVertical: 8 },
  historyToggleText: { color: colors.primary, fontSize: 13, fontWeight: "500" },
  historyEntry: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary + "50",
  },
  historyText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },

  // Narrative
  narrativeContainer: { paddingTop: 8, paddingBottom: 16 },
  skipButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary + "20",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 12,
  },
  skipButtonText: { color: colors.primary, fontSize: 14, fontWeight: "600" },

  // Processing
  processingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: colors.surface + "90",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  processingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  },

  // Sticky bottom
  stickyBottom: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 8 : 12,
  },
  customActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 10,
  },
  customActionText: { color: colors.background, fontSize: 15, fontWeight: "700", flex: 1 },
  choicesList: { gap: 8 },

  // No content
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noContentText: {
    color: colors.text,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    marginTop: 16,
    lineHeight: 28,
  },

  // Debug
  debugToggle: {
    position: "absolute",
    top: 56,
    right: 14,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 8,
    zIndex: 1000,
  },
});
