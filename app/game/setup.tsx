import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import CustomSlider from "@/components/CustomSlider";
import { useGameStore } from "@/store/gameStore";
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
              <History size={28} color={colors.primary} />
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
                  <Shuffle size={14} color={colors.primary} />
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
              <Palette size={28} color={colors.primary} />
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
                  <Shuffle size={14} color={colors.primary} />
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
              <User size={28} color={colors.primary} />
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
                <Crown size={18} color={colors.primary} />
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
            <Crown size={24} color={colors.primary} />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: colors.surface,
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
    padding: 20,
  },
  content: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    fontFamily: "serif",
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  randomButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  randomButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  examplesContainer: {
    marginTop: 8,
  },
  examplesScroll: {
    flexDirection: "row",
  },
  exampleChip: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleChipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  backstoryOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  backstoryCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  backstoryCheckboxFill: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  backstoryContent: {
    flex: 1,
  },
  backstoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  backstoryDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  summaryItem: {
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
});