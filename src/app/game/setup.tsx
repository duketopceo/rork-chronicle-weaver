import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import CustomSlider from "../../components/CustomSlider";
import { useGameStore } from "../../store/gameStore";
import SubscriptionGate from "../../components/SubscriptionGate";
import { Crown, History, Palette, Sparkles } from "lucide-react-native";

const HISTORICAL_ERAS = [
  { id: "ancient_rome", name: "Ancient Rome", description: "The Roman Empire at its height", icon: "🏛️" },
  { id: "medieval_europe", name: "Medieval Europe", description: "Knights, castles, and feudalism", icon: "⚔️" },
  { id: "renaissance", name: "Renaissance Italy", description: "Art, science, and political intrigue", icon: "🎨" },
  { id: "wild_west", name: "Wild West", description: "Frontier America, cowboys and outlaws", icon: "🤠" },
  { id: "victorian", name: "Victorian London", description: "Industrial revolution and social change", icon: "🎩" },
  { id: "napoleonic", name: "Napoleonic Wars", description: "European conflicts and empire building", icon: "🎖️" },
  { id: "custom", name: "Custom Era", description: "Create your own historical setting", icon: "✍️" },
];

const STORY_THEMES = [
  { id: "political", name: "Political Intrigue", description: "Power struggles and diplomacy" },
  { id: "military", name: "Military Campaign", description: "War, strategy, and conquest" },
  { id: "trade", name: "Trade & Commerce", description: "Merchants, markets, and wealth" },
  { id: "mystery", name: "Mystery & Investigation", description: "Secrets, clues, and discovery" },
  { id: "adventure", name: "Adventure & Exploration", description: "Journeys, discovery, and danger" },
  { id: "romance", name: "Romance & Relationships", description: "Love, loyalty, and personal bonds" },
  { id: "custom", name: "Custom Theme", description: "Define your own story focus" },
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
    startNewGame,
  } = useGameStore();

  const [formData, setFormData] = useState({
    characterName: gameSetup.characterName || "",
    era: gameSetup.era || "",
    customEra: gameSetup.customEra || "",
    theme: gameSetup.theme || "",
    customTheme: gameSetup.customTheme || "",
    difficulty: gameSetup.difficulty || 0.5,
    generateBackstory: gameSetup.generateBackstory || false,
  });

  const [errors, setErrors] = useState({ characterName: "", era: "", theme: "" });
  const [isValid, setIsValid] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedHeight = useRef(new Animated.Value(0)).current;
  const advancedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(advancedHeight, {
        toValue: showAdvanced ? 1 : 0,
        duration: 280,
        useNativeDriver: false,
      }),
      Animated.timing(advancedOpacity, {
        toValue: showAdvanced ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [showAdvanced]);

  const validateForm = () => {
    const newErrors = { characterName: "", era: "", theme: "" };
    let valid = true;

    if (!formData.characterName.trim()) {
      newErrors.characterName = "Character name is required";
      valid = false;
    } else if (formData.characterName.trim().length < 2) {
      newErrors.characterName = "Name must be at least 2 characters";
      valid = false;
    }

    if (!formData.era) {
      newErrors.era = "Please select a historical era";
      valid = false;
    } else if (formData.era === "custom" && !formData.customEra.trim()) {
      newErrors.era = "Please specify your custom era";
      valid = false;
    }

    // Theme defaults to first option if advanced panel is collapsed and nothing selected
    if (showAdvanced && !formData.theme) {
      newErrors.theme = "Please select a story theme";
      valid = false;
    } else if (showAdvanced && formData.theme === "custom" && !formData.customTheme.trim()) {
      newErrors.theme = "Please specify your custom theme";
      valid = false;
    }

    setErrors(newErrors);
    setIsValid(valid && Object.values(newErrors).every((e) => !e));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    switch (field) {
      case "characterName": setCharacterName(value); break;
      case "era": setEra(value === "custom" ? formData.customEra : value); break;
      case "customEra": if (formData.era === "custom") setEra(value); break;
      case "theme": setTheme(value === "custom" ? formData.customTheme : value); break;
      case "customTheme": if (formData.theme === "custom") setTheme(value); break;
      case "difficulty": setDifficulty(value); break;
      case "generateBackstory": setGenerateBackstory(value); break;
    }
  };

  const handleBeginChronicle = async () => {
    // Auto-select first theme if advanced is hidden
    const effectiveTheme = formData.theme || STORY_THEMES[0].id;
    if (!formData.theme) {
      handleChange("theme", effectiveTheme);
    }

    if (!formData.characterName.trim() || !formData.era) {
      Alert.alert("Setup Incomplete", "Please enter a name and select an era.");
      return;
    }

    try {
      await startNewGame();
      router.push("/game/play");
    } catch {
      Alert.alert("Error", "Failed to start your chronicle. Please try again.");
    }
  };

  const getDifficultyLabel = (v: number) => {
    if (v <= 0.2) return "Hyper Realistic";
    if (v <= 0.4) return "Historically Accurate";
    if (v <= 0.6) return "Balanced";
    if (v <= 0.8) return "Dramatic";
    return "Pure Fantasy";
  };

  const getDifficultyDescription = (v: number) => {
    if (v <= 0.2) return "Strictly follows historical facts and realistic constraints";
    if (v <= 0.4) return "Historically accurate with some narrative flexibility";
    if (v <= 0.6) return "Balanced mix of realism and engaging storytelling";
    if (v <= 0.8) return "Prioritizes dramatic narrative over strict realism";
    return "Fantasy elements and creative liberties take precedence";
  };

  const canBegin =
    formData.characterName.trim().length >= 2 &&
    !!formData.era &&
    (formData.era !== "custom" || !!formData.customEra.trim());

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.inner}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Chronicle</Text>
              <Text style={styles.subtitle}>Choose your era and begin — 3 taps to adventure</Text>
            </View>

            {/* Character Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Name</Text>
              <TextInput
                value={formData.characterName}
                onChangeText={(v) => handleChange("characterName", v)}
                placeholder="Enter your character's name"
                error={errors.characterName}
              />
            </View>

            {/* Era cards — horizontal swipeable */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historical Era</Text>
              {errors.era ? <Text style={styles.fieldError}>{errors.era}</Text> : null}
              <FlatList
                data={HISTORICAL_ERAS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.eraList}
                renderItem={({ item }) => {
                  const active = formData.era === item.id;
                  return (
                    <TouchableOpacity
                      style={[styles.eraCard, active && styles.eraCardActive]}
                      onPress={() => handleChange("era", item.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.eraIcon}>{item.icon}</Text>
                      <Text style={[styles.eraName, active && styles.eraNameActive]}>
                        {item.name}
                      </Text>
                      <Text style={styles.eraDesc}>{item.description}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
              {formData.era === "custom" && (
                <View style={styles.customInput}>
                  <TextInput
                    value={formData.customEra}
                    onChangeText={(v) => handleChange("customEra", v)}
                    placeholder="Describe your custom historical era"
                    error={errors.era}
                  />
                </View>
              )}
            </View>

            {/* Advanced options toggle */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced((v) => !v)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvanced ? "▲ Hide Advanced Options" : "▼ Advanced Options"}
              </Text>
            </TouchableOpacity>

            <Animated.View style={{ opacity: advancedOpacity, overflow: "hidden" }}>
              <View style={styles.advancedContent}>
                {/* Story Theme */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Story Theme</Text>
                  <Text style={styles.sectionDescription}>What type of story do you want?</Text>
                  <View style={styles.optionsGrid}>
                    {STORY_THEMES.map((theme) => (
                      <TouchableOpacity
                        key={theme.id}
                        style={[
                          styles.optionCard,
                          formData.theme === theme.id && styles.optionCardSelected,
                        ]}
                        onPress={() => handleChange("theme", theme.id)}
                      >
                        <View style={styles.optionHeader}>
                          <Palette
                            size={18}
                            color={
                              formData.theme === theme.id ? colors.primary : colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.optionTitle,
                              formData.theme === theme.id && styles.optionTitleSelected,
                            ]}
                          >
                            {theme.name}
                          </Text>
                        </View>
                        <Text style={styles.optionDescription}>{theme.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {formData.theme === "custom" && (
                    <View style={styles.customInput}>
                      <TextInput
                        value={formData.customTheme}
                        onChangeText={(v) => handleChange("customTheme", v)}
                        placeholder="Describe your custom story theme"
                        error={errors.theme}
                      />
                    </View>
                  )}
                </View>

                {/* Realism slider */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Realism Level</Text>
                  <Text style={styles.sectionDescription}>
                    {getDifficultyDescription(
                      typeof formData.difficulty === "number" ? formData.difficulty : 0.5,
                    )}
                  </Text>
                  <View style={styles.sliderContainer}>
                    <CustomSlider
                      value={typeof formData.difficulty === "number" ? formData.difficulty : 0.5}
                      onValueChange={(v) => handleChange("difficulty", v)}
                      minimumValue={0}
                      maximumValue={1}
                      step={0.1}
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabel}>Hyper Real</Text>
                      <Text style={styles.sliderLabel}>Pure Fantasy</Text>
                    </View>
                    <Text style={styles.difficultyLabel}>
                      {getDifficultyLabel(
                        typeof formData.difficulty === "number" ? formData.difficulty : 0.5,
                      )}
                    </Text>
                  </View>
                </View>

                {/* AI Backstory (Premium) */}
                <View style={styles.section}>
                  <SubscriptionGate
                    requiredTier="premium"
                    feature="AI Backstory Generation"
                    featureDescription="Let AI create a rich backstory for your character"
                    benefits={[
                      "AI-generated character background",
                      "Historical context integration",
                      "Personality traits and motivations",
                      "Starting relationships and reputation",
                    ]}
                  >
                    <View style={styles.premiumFeature}>
                      <View style={styles.premiumHeader}>
                        <Sparkles size={18} color={colors.economicsAccent} />
                        <Text style={styles.premiumTitle}>AI Backstory Generation</Text>
                        <Crown size={14} color={colors.economicsAccent} />
                      </View>
                      <Text style={styles.premiumDescription}>
                        Let AI craft a rich backstory for your character
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          formData.generateBackstory && styles.checkboxSelected,
                        ]}
                        onPress={() =>
                          handleChange("generateBackstory", !formData.generateBackstory)
                        }
                      >
                        {formData.generateBackstory && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </SubscriptionGate>
                </View>
              </View>
            </Animated.View>

            {/* Begin button */}
            <View style={styles.footer}>
              <Button
                title="Begin Your Chronicle"
                onPress={handleBeginChronicle}
                disabled={!canBegin}
                style={
                  canBegin
                    ? styles.beginButton
                    : { ...styles.beginButton, ...styles.beginButtonDisabled }
                }
                textStyle={styles.beginButtonText}
              />
              {!canBegin && (
                <Text style={styles.validationText}>Enter a name and select an era to begin</Text>
              )}
            </View>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { paddingHorizontal: 20 },
  header: { paddingVertical: 24, alignItems: "center" },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  fieldError: { color: colors.error, fontSize: 12, marginBottom: 8 },

  // Era cards
  eraList: { paddingBottom: 4, gap: 12 },
  eraCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  eraCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + "14",
  },
  eraIcon: { fontSize: 28, marginBottom: 8 },
  eraName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  eraNameActive: { color: colors.primary },
  eraDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 15,
  },

  // Advanced toggle
  advancedToggle: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  advancedToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  advancedContent: { overflow: "hidden" },

  // Theme options
  optionsGrid: { gap: 10 },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + "10",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  optionTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  optionTitleSelected: { color: colors.primary },
  optionDescription: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  customInput: { marginTop: 12 },

  // Slider
  sliderContainer: { marginTop: 8 },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  sliderLabel: { fontSize: 11, color: colors.textSecondary },
  difficultyLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
    marginTop: 10,
  },

  // Premium
  premiumFeature: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.economicsAccent,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  premiumTitle: { fontSize: 15, fontWeight: "600", color: colors.text, flex: 1 },
  premiumDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { fontSize: 14, color: colors.background, fontWeight: "bold" },

  // Footer
  footer: { paddingVertical: 24, alignItems: "center" },
  beginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 220,
  },
  beginButtonDisabled: { backgroundColor: colors.buttonDisabled },
  beginButtonText: { color: colors.background, fontSize: 17, fontWeight: "600" },
  validationText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
    textAlign: "center",
  },
});
