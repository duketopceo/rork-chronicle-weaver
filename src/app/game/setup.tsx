/**
 * Game Setup and Character Creation Screen
 * 
 * Initial game setup including character creation and world configuration.
 * 
 * Purpose: Guides new players through character creation and game initialization.
 * 
 * References:
 * - File: src/app/game/setup.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import CustomSlider from "../../components/CustomSlider";
import { useGameStore } from "../../store/gameStore";
import { User, Palette, Crown, History, Shuffle } from "lucide-react-native";

// Simplified examples
const ERA_EXAMPLES = [
  "Ancient Rome",
  "Medieval Europe",
  "Renaissance Italy",
  "Wild West",
  "Victorian London",
  "Napoleonic Wars"
];

const THEME_EXAMPLES = [
  "Mystery",
  "Politics",
  "Military",
  "Trade",
  "Adventure",
  "Romance"
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
          newErrors.era = "Please describe your setting";
          isValid = false;
        } else {
          newErrors.era = "";
        }
        break;
      case "theme":
        if (!gameSetup.theme.trim()) {
          newErrors.theme = "Please describe your theme";
          isValid = false;
        } else {
          newErrors.theme = "";
        }
        break;
      case "character":
        if (!gameSetup.characterName.trim()) {
          newErrors.characterName = "Please enter a name";
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
              <History size={Platform.select({ ios: 32, android: 28, default: 28 })} color={colors.primary} />
              <Text style={styles.stepTitle}>Setting</Text>
            </View>
            <Text style={styles.stepDescription}>
              Choose a time period or setting
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Era</Text>
                <TouchableOpacity 
                  style={styles.randomButton}
                  onPress={() => handleRandomExample(ERA_EXAMPLES, setEra)}
                >
                  <Shuffle size={16} color={colors.primary} />
                  <Text style={styles.randomButtonText}>Random</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder="Describe your world..."
                value={gameSetup.era}
                onChangeText={setEra}
                error={errors.era}
                multiline
                numberOfLines={2}
                style={styles.multilineInput}
              />
              
              <View style={styles.examplesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
                  {ERA_EXAMPLES.map((example, index) => (
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
              label={`Realism: ${getDifficultyLabel(gameSetup.difficulty)}`}
              leftLabel="Real"
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
              <Palette size={Platform.select({ ios: 32, android: 28, default: 28 })} color={colors.primary} />
              <Text style={styles.stepTitle}>Theme</Text>
            </View>
            <Text style={styles.stepDescription}>
              What kind of story?
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Theme</Text>
                <TouchableOpacity 
                  style={styles.randomButton}
                  onPress={() => handleRandomExample(THEME_EXAMPLES, setTheme)}
                >
                  <Shuffle size={16} color={colors.primary} />
                  <Text style={styles.randomButtonText}>Random</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder="Describe your theme..."
                value={gameSetup.theme}
                onChangeText={setTheme}
                error={errors.theme}
                multiline
                numberOfLines={2}
                style={styles.multilineInput}
              />
              
              <View style={styles.examplesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
                  {THEME_EXAMPLES.map((example, index) => (
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
              <User size={Platform.select({ ios: 32, android: 28, default: 28 })} color={colors.primary} />
              <Text style={styles.stepTitle}>Character</Text>
            </View>
            <Text style={styles.stepDescription}>
              Name your character
            </Text>
            
            <TextInput
              label="Name"
              placeholder="Enter name..."
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
                <Text style={styles.backstoryTitle}>Generate backstory</Text>
                <Text style={styles.backstoryDescription}>
                  Let Kronos create a detailed background
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryHeader}>
                <Crown size={20} color={colors.primary} />
                <Text style={styles.summaryTitle}>Summary</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Setting:</Text>
                <Text style={styles.summaryValue}>{gameSetup.era}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Theme:</Text>
                <Text style={styles.summaryValue}>{gameSetup.theme}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Realism:</Text>
                <Text style={styles.summaryValue}>{getDifficultyLabel(gameSetup.difficulty)}</Text>
              </View>
            </View>
          </>
        );
        
      default:
        return null;
    }
  };

  const getButtonTitle = () => {
    return gameSetup.setupStep === "character" ? "Begin Chronicle" : "Continue";
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
            <Crown size={Platform.select({ ios: 28, android: 24, default: 24 })} color={colors.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chronicle Weaver</Text>
            <Text style={styles.headerSubtitle}>Step {getStepNumber()} of 3</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerIcon: {
    marginRight: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Platform.select({ ios: 24, android: 20, default: 20 }),
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  headerSubtitle: {
    fontSize: Platform.select({ ios: 16, android: 14, default: 14 }),
    color: colors.textSecondary,
    marginTop: Platform.select({ ios: 4, android: 2, default: 2 }),
  },
  progressContainer: {
    padding: Platform.select({ ios: 20, android: 16, default: 16 }),
    backgroundColor: colors.surface,
  },
  progressBar: {
    height: Platform.select({ ios: 8, android: 6, default: 6 }),
    backgroundColor: colors.surfaceLight,
    borderRadius: Platform.select({ ios: 4, android: 3, default: 3 }),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: Platform.select({ ios: 4, android: 3, default: 3 }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  content: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    gap: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  stepTitle: {
    fontSize: Platform.select({ ios: 28, android: 24, default: 24 }),
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    fontFamily: "serif",
  },
  stepDescription: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.textSecondary,
    marginBottom: Platform.select({ ios: 24, android: 20, default: 20 }),
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
  },
  inputContainer: {
    marginBottom: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  inputLabel: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    fontWeight: "600",
    color: colors.text,
  },
  randomButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: Platform.select({ ios: 14, android: 12, default: 12 }),
    paddingVertical: Platform.select({ ios: 8, android: 6, default: 6 }),
    borderRadius: Platform.select({ ios: 14, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: colors.primary,
    gap: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  randomButtonText: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 14, android: 12, default: 12 }),
    fontWeight: "600",
  },
  multilineInput: {
    height: Platform.select({ ios: 100, android: 80, default: 80 }),
    textAlignVertical: "top",
  },
  examplesContainer: {
    marginTop: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  examplesScroll: {
    flexDirection: "row",
  },
  exampleChip: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 14, android: 12, default: 12 }),
    paddingHorizontal: Platform.select({ ios: 16, android: 12, default: 12 }),
    paddingVertical: Platform.select({ ios: 8, android: 6, default: 6 }),
    marginRight: Platform.select({ ios: 12, android: 8, default: 8 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleChipText: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 14, android: 12, default: 12 }),
  },
  backstoryOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    padding: Platform.select({ ios: 18, android: 14, default: 14 }),
    marginBottom: Platform.select({ ios: 24, android: 20, default: 20 }),
    borderWidth: 1,
    borderColor: colors.border,
    gap: Platform.select({ ios: 14, android: 10, default: 10 }),
  },
  backstoryCheckbox: {
    width: Platform.select({ ios: 22, android: 18, default: 18 }),
    height: Platform.select({ ios: 22, android: 18, default: 18 }),
    borderRadius: Platform.select({ ios: 6, android: 4, default: 4 }),
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.select({ ios: 4, android: 2, default: 2 }),
  },
  backstoryCheckboxFill: {
    width: Platform.select({ ios: 12, android: 10, default: 10 }),
    height: Platform.select({ ios: 12, android: 10, default: 10 }),
    borderRadius: Platform.select({ ios: 3, android: 2, default: 2 }),
    backgroundColor: colors.primary,
  },
  backstoryContent: {
    flex: 1,
  },
  backstoryTitle: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    fontWeight: "600",
    color: colors.text,
    marginBottom: Platform.select({ ios: 4, android: 2, default: 2 }),
  },
  backstoryDescription: {
    fontSize: Platform.select({ ios: 15, android: 13, default: 13 }),
    color: colors.textSecondary,
    lineHeight: Platform.select({ ios: 22, android: 20, default: 20 }),
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    padding: Platform.select({ ios: 20, android: 16, default: 16 }),
    marginTop: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    gap: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  summaryTitle: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  summaryItem: {
    marginBottom: Platform.select({ ios: 12, android: 10, default: 10 }),
  },
  summaryLabel: {
    fontSize: Platform.select({ ios: 15, android: 13, default: 13 }),
    color: colors.textSecondary,
    marginBottom: Platform.select({ ios: 4, android: 2, default: 2 }),
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.text,
    lineHeight: Platform.select({ ios: 24, android: 22, default: 22 }),
  },
  footer: {
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
});