import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import CustomSlider from "@/components/CustomSlider";
import { useGameStore } from "@/store/gameStore";
import { MapPin, Palette, User, Settings, Feather, Scroll, Crown, Globe, History, Shuffle, Lightbulb } from "lucide-react-native";

const ERA_EXAMPLES = [
  "Napoleon's rise to power in France, 1799-1804",
  "Cowboys vs aliens in 1880s Arizona desert",
  "Viking exploration of North America, 1000 AD",
  "Cyberpunk detective in neo-Tokyo 2080",
  "Medieval court during the War of Roses",
  "Ancient Egypt during pyramid construction",
  "Space colonization of Mars in 2150",
  "Steampunk London with airships and magic",
  "Roman Empire at its peak under Trajan",
  "Wild West gold rush in California 1849",
  "Renaissance Italy with Leonardo da Vinci",
  "Samurai Japan during the Meiji Restoration"
];

const THEME_EXAMPLES = [
  "Dark and gritty survival against all odds",
  "Political intrigue with betrayal and alliances",
  "Epic military campaigns and strategic warfare",
  "Exploration and discovery of unknown lands",
  "Light-hearted adventure with humor and friendship",
  "Mystery and investigation thriller",
  "Trade, economics, and building an empire",
  "Character-driven personal growth story",
  "Romance and relationships in turbulent times",
  "Supernatural horror and dark mysteries",
  "Comedy of errors and mistaken identities",
  "Revenge and justice in a corrupt world"
];

export default function GameSetupScreen() {
  const router = useRouter();
  const { 
    gameSetup, 
    setEra, 
    setTheme, 
    setDifficulty,
    setCharacterName,
    setGenerateBackstory,
    nextSetupStep,
    startNewGame
  } = useGameStore();
  
  const [errors, setErrors] = useState({
    era: "",
    theme: "",
    characterName: ""
  });

  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (gameSetup.setupStep) {
      case "era":
        if (!gameSetup.era.trim()) {
          newErrors.era = "Please describe your chronicle setting";
          isValid = false;
        } else {
          newErrors.era = "";
        }
        break;
      case "theme":
        if (!gameSetup.theme.trim()) {
          newErrors.theme = "Please describe your chronicle theme";
          isValid = false;
        } else {
          newErrors.theme = "";
        }
        break;
      case "character":
        if (!gameSetup.characterName.trim()) {
          newErrors.characterName = "Please enter your character's name";
          isValid = false;
        } else {
          newErrors.characterName = "";
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) return;

    if (gameSetup.setupStep === "character") {
      startNewGame();
      router.replace("/game/play");
    } else {
      nextSetupStep();
    }
  };

  const handleRandomExample = (examples: string[], setter: (value: string) => void) => {
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setter(randomExample);
  };

  const getDifficultyLabel = (value: number) => {
    if (value <= 0.2) return "Hyper Realistic";
    if (value <= 0.4) return "Historically Accurate";
    if (value <= 0.6) return "Balanced";
    if (value <= 0.8) return "Dramatic";
    return "Pure Fantasy";
  };

  const renderStepContent = () => {
    switch (gameSetup.setupStep) {
      case "era":
        return (
          <>
            <View style={styles.stepHeader}>
              <History size={40} color={colors.primary} />
              <Text style={styles.stepTitle}>Your Historical Canvas</Text>
            </View>
            <Text style={styles.stepDescription}>
              Describe any time period, setting, or world you wish to explore. Kronos will weave your chronicle within this realm.
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Chronicle Setting & Era</Text>
                <TouchableOpacity 
                  style={styles.randomButton}
                  onPress={() => handleRandomExample(ERA_EXAMPLES, setEra)}
                >
                  <Shuffle size={18} color={colors.primary} />
                  <Text style={styles.randomButtonText}>Random</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder="Describe your chronicle world and time period..."
                value={gameSetup.era}
                onChangeText={setEra}
                error={errors.era}
                multiline
                numberOfLines={4}
                style={styles.multilineInput}
              />
              
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Quick Examples:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
                  {ERA_EXAMPLES.slice(0, 4).map((example, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.exampleChip}
                      onPress={() => setEra(example)}
                    >
                      <Text style={styles.exampleChipText}>{example}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <CustomSlider
              label={`Realism Level: ${getDifficultyLabel(gameSetup.difficulty)}`}
              leftLabel="Realistic"
              rightLabel="Fantasy"
              value={gameSetup.difficulty}
              onValueChange={setDifficulty}
              minimumValue={0}
              maximumValue={1}
              step={0.25}
            />
          </>
        );
        
      case "theme":
        return (
          <>
            <View style={styles.stepHeader}>
              <Palette size={40} color={colors.primary} />
              <Text style={styles.stepTitle}>Chronicle Theme & Atmosphere</Text>
            </View>
            <Text style={styles.stepDescription}>
              What kind of chronicle experience do you want? Describe the mood, tone, and focus that Kronos should weave into your adventure.
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Chronicle Theme & Mood</Text>
                <TouchableOpacity 
                  style={styles.randomButton}
                  onPress={() => handleRandomExample(THEME_EXAMPLES, setTheme)}
                >
                  <Shuffle size={18} color={colors.primary} />
                  <Text style={styles.randomButtonText}>Random</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder="Describe your chronicle's theme, tone, and atmosphere..."
                value={gameSetup.theme}
                onChangeText={setTheme}
                error={errors.theme}
                multiline
                numberOfLines={4}
                style={styles.multilineInput}
              />
              
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Quick Examples:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
                  {THEME_EXAMPLES.slice(0, 4).map((example, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.exampleChip}
                      onPress={() => setTheme(example)}
                    >
                      <Text style={styles.exampleChipText}>{example}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </>
        );
        
      case "character":
        return (
          <>
            <View style={styles.stepHeader}>
              <User size={40} color={colors.primary} />
              <Text style={styles.stepTitle}>Your Protagonist</Text>
            </View>
            <Text style={styles.stepDescription}>
              Choose a name for your character. Kronos will craft their background and story to fit perfectly into your chosen world.
            </Text>
            
            <TextInput
              label="Character Name"
              placeholder="Enter your character's name..."
              value={gameSetup.characterName}
              onChangeText={setCharacterName}
              error={errors.characterName}
              autoCapitalize="words"
            />
            
            <TouchableOpacity 
              style={styles.backstoryOption}
              onPress={() => setGenerateBackstory(!gameSetup.generateBackstory)}
            >
              <View style={styles.backstoryCheckbox}>
                {gameSetup.generateBackstory && (
                  <View style={styles.backstoryCheckboxFill} />
                )}
              </View>
              <View style={styles.backstoryContent}>
                <Text style={styles.backstoryTitle}>Let Kronos create my backstory</Text>
                <Text style={styles.backstoryDescription}>
                  The Weaver of Chronicles will generate a detailed background that fits your world perfectly
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryHeader}>
                <Crown size={24} color={colors.primary} />
                <Text style={styles.summaryTitle}>Your Chronicle Setup</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Historical Setting:</Text>
                <Text style={styles.summaryValue}>{gameSetup.era}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Chronicle Theme:</Text>
                <Text style={styles.summaryValue}>{gameSetup.theme}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Realism Level:</Text>
                <Text style={styles.summaryValue}>{getDifficultyLabel(gameSetup.difficulty)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Protagonist:</Text>
                <Text style={styles.summaryValue}>{gameSetup.characterName || "Not set"}</Text>
              </View>
            </View>
          </>
        );
        
      default:
        return null;
    }
  };

  const getButtonTitle = () => {
    return gameSetup.setupStep === "character" ? "Begin Your Chronicle" : "Continue";
  };

  const getStepNumber = () => {
    switch (gameSetup.setupStep) {
      case "era": return "1";
      case "theme": return "2";
      case "character": return "3";
      default: return "1";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Crown size={28} color={colors.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chronicle Weaver</Text>
            <Text style={styles.headerSubtitle}>Powered by Kronos</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step {getStepNumber()} of 3</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(parseInt(getStepNumber()) / 3) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {renderStepContent()}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title={getButtonTitle()}
            onPress={handleContinue}
            size="large"
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + "30",
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  progressContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 28,
  },
  content: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
    fontFamily: "serif",
  },
  stepDescription: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 26,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  randomButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  randomButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
  },
  examplesContainer: {
    marginTop: 16,
  },
  examplesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  examplesScroll: {
    flexDirection: "row",
  },
  exampleChip: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 200,
  },
  exampleChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  backstoryOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  backstoryCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  backstoryCheckboxFill: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  backstoryContent: {
    flex: 1,
  },
  backstoryTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  backstoryDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.primary + "30",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  summaryItem: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
  },
  footer: {
    padding: 28,
    borderTopWidth: 2,
    borderTopColor: colors.primary + "30",
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
});