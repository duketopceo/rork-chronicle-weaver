/**
 * Chronicle Weaver - Single-Page Game Setup
 * 
 * Complete rewrite of setup screen as single-page form with all options visible.
 * Consolidates era selection, character creation, theme choice, and difficulty
 * into one streamlined interface for faster setup.
 * 
 * Features:
 * - Single scrollable view, no multi-step wizard
 * - Radio buttons for era/theme with "Custom" option
 * - Slider for difficulty/realism level
 * - Real-time validation (red borders for errors)
 * - "Begin Chronicle" button disabled until valid
 * - Responsive grid layout for desktop/mobile
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import CustomSlider from "../../components/CustomSlider";
import { useGameStore } from "../../store/gameStore";
import SubscriptionGate from "../../components/SubscriptionGate";
import { User, Palette, Crown, History, Shuffle, Sparkles } from "lucide-react-native";

// Historical Era Options
const HISTORICAL_ERAS = [
  { id: "ancient_rome", name: "Ancient Rome", description: "The Roman Empire at its height" },
  { id: "medieval_europe", name: "Medieval Europe", description: "Knights, castles, and feudalism" },
  { id: "renaissance", name: "Renaissance Italy", description: "Art, science, and political intrigue" },
  { id: "wild_west", name: "Wild West", description: "Frontier America, cowboys and outlaws" },
  { id: "victorian", name: "Victorian London", description: "Industrial revolution and social change" },
  { id: "napoleonic", name: "Napoleonic Wars", description: "European conflicts and empire building" },
  { id: "custom", name: "Custom Era", description: "Create your own historical setting" },
];

// Story Theme Options
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
    startNewGame
  } = useGameStore();
  
  const [formData, setFormData] = useState({
    characterName: gameSetup.characterName || '',
    era: gameSetup.era || '',
    customEra: gameSetup.customEra || '',
    theme: gameSetup.theme || '',
    customTheme: gameSetup.customTheme || '',
    difficulty: gameSetup.difficulty || 0.5,
    generateBackstory: gameSetup.generateBackstory || false,
  });

  const [errors, setErrors] = useState({
    characterName: '',
    era: '',
    theme: '',
  });

  const [isValid, setIsValid] = useState(false);

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {
      characterName: '',
      era: '',
      theme: '',
    };

    let valid = true;

    // Character name validation
    if (!formData.characterName.trim()) {
      newErrors.characterName = 'Character name is required';
      valid = false;
    } else if (formData.characterName.trim().length < 2) {
      newErrors.characterName = 'Name must be at least 2 characters';
      valid = false;
    }

    // Era validation
    if (!formData.era) {
      newErrors.era = 'Please select a historical era';
      valid = false;
    } else if (formData.era === 'custom' && !formData.customEra.trim()) {
      newErrors.era = 'Please specify your custom era';
      valid = false;
    }

    // Theme validation
    if (!formData.theme) {
      newErrors.theme = 'Please select a story theme';
      valid = false;
    } else if (formData.theme === 'custom' && !formData.customTheme.trim()) {
      newErrors.theme = 'Please specify your custom theme';
      valid = false;
    }

    setErrors(newErrors);
    setIsValid(valid && Object.values(newErrors).every(error => !error));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update store immediately
    switch (field) {
      case 'characterName':
        setCharacterName(value);
        break;
      case 'era':
        setEra(value === 'custom' ? formData.customEra : value);
        break;
      case 'customEra':
        if (formData.era === 'custom') {
          setEra(value);
        }
        break;
      case 'theme':
        setTheme(value === 'custom' ? formData.customTheme : value);
        break;
      case 'customTheme':
        if (formData.theme === 'custom') {
          setTheme(value);
        }
        break;
      case 'difficulty':
        setDifficulty(value);
        break;
      case 'generateBackstory':
        setGenerateBackstory(value);
        break;
    }
  };

  const handleBeginChronicle = async () => {
    if (!isValid) {
      Alert.alert('Setup Incomplete', 'Please fill in all required fields.');
      return;
    }

    try {
      // Start new game with current setup
      await startNewGame();
      
      // Navigate to gameplay
      router.push('/game/play');
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start your chronicle. Please try again.');
    }
  };

  const getDifficultyLabel = (value: number | string) => {
    const numValue = typeof value === 'number' ? value : 0.5;
    if (numValue <= 0.2) return 'Hyper Realistic';
    if (numValue <= 0.4) return 'Historically Accurate';
    if (numValue <= 0.6) return 'Balanced';
    if (numValue <= 0.8) return 'Dramatic';
    return 'Pure Fantasy';
  };

  const getDifficultyDescription = (value: number | string) => {
    const numValue = typeof value === 'number' ? value : 0.5;
    if (numValue <= 0.2) return 'Strictly follows historical facts and realistic constraints';
    if (numValue <= 0.4) return 'Historically accurate with some narrative flexibility';
    if (numValue <= 0.6) return 'Balanced mix of realism and engaging storytelling';
    if (numValue <= 0.8) return 'Prioritizes dramatic narrative over strict realism';
    return 'Fantasy elements and creative liberties take precedence';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Chronicle</Text>
          <Text style={styles.subtitle}>
            Choose your character, era, and story focus to begin your historical adventure
          </Text>
        </View>

        {/* Character Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Name</Text>
          <TextInput
            value={formData.characterName}
            onChangeText={(value) => handleInputChange('characterName', value)}
            placeholder="Enter your character's name"
            error={errors.characterName}
          />
        </View>

        {/* Historical Era */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historical Era</Text>
          <Text style={styles.sectionDescription}>
            Choose the time period for your chronicle
          </Text>
          <View style={styles.optionsGrid}>
            {HISTORICAL_ERAS.map((era) => (
              <TouchableOpacity
                key={era.id}
                style={[
                  styles.optionCard,
                  formData.era === era.id && styles.optionCardSelected,
                  errors.era && formData.era !== era.id && styles.optionCardError,
                ]}
                onPress={() => handleInputChange('era', era.id)}
              >
                <View style={styles.optionHeader}>
                  <History size={20} color={formData.era === era.id ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.optionTitle,
                    formData.era === era.id && styles.optionTitleSelected,
                  ]}>
                    {era.name}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{era.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.era === 'custom' && (
            <View style={styles.customInput}>
              <TextInput
                value={formData.customEra}
                onChangeText={(value) => handleInputChange('customEra', value)}
                placeholder="Describe your custom historical era"
                error={errors.era}
              />
            </View>
          )}
        </View>

        {/* Story Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Story Theme</Text>
          <Text style={styles.sectionDescription}>
            What type of story do you want to experience?
          </Text>
          <View style={styles.optionsGrid}>
            {STORY_THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.optionCard,
                  formData.theme === theme.id && styles.optionCardSelected,
                  errors.theme && formData.theme !== theme.id && styles.optionCardError,
                ]}
                onPress={() => handleInputChange('theme', theme.id)}
              >
                <View style={styles.optionHeader}>
                  <Palette size={20} color={formData.theme === theme.id ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.optionTitle,
                    formData.theme === theme.id && styles.optionTitleSelected,
                  ]}>
                    {theme.name}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{theme.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.theme === 'custom' && (
            <View style={styles.customInput}>
              <TextInput
                value={formData.customTheme}
                onChangeText={(value) => handleInputChange('customTheme', value)}
                placeholder="Describe your custom story theme"
                error={errors.theme}
              />
            </View>
          )}
        </View>

        {/* Difficulty/Realism Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Realism Level</Text>
          <Text style={styles.sectionDescription}>
            {getDifficultyDescription(formData.difficulty)}
          </Text>
          <View style={styles.sliderContainer}>
            <CustomSlider
              value={formData.difficulty}
              onValueChange={(value) => handleInputChange('difficulty', value)}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              thumbStyle={{ backgroundColor: colors.primary }}
              trackStyle={{ backgroundColor: colors.border }}
              minimumTrackTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Hyper Real</Text>
              <Text style={styles.sliderLabel}>Pure Fantasy</Text>
            </View>
            <Text style={styles.difficultyLabel}>
              {getDifficultyLabel(formData.difficulty)}
            </Text>
          </View>
        </View>

        {/* AI Backstory Generation (Premium Feature) */}
        <View style={styles.section}>
          <SubscriptionGate
            requiredTier="premium"
            feature="AI Backstory Generation"
            featureDescription="Let AI create a rich, detailed backstory for your character based on your choices"
            benefits={[
              "AI-generated character background",
              "Historical context integration",
              "Personality traits and motivations",
              "Starting relationships and reputation"
            ]}
          >
            <View style={styles.premiumFeature}>
              <View style={styles.premiumHeader}>
                <Sparkles size={20} color={colors.economicsAccent} />
                <Text style={styles.premiumTitle}>AI Backstory Generation</Text>
                <Crown size={16} color={colors.economicsAccent} />
              </View>
              <Text style={styles.premiumDescription}>
                Let AI create a rich, detailed backstory for your character
              </Text>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.generateBackstory && styles.checkboxSelected,
                ]}
                onPress={() => handleInputChange('generateBackstory', !formData.generateBackstory)}
              >
                {formData.generateBackstory && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </SubscriptionGate>
        </View>

        {/* Begin Chronicle Button */}
        <View style={styles.footer}>
          <Button
            title="Begin Your Chronicle"
            onPress={handleBeginChronicle}
            disabled={!isValid}
            style={
              !isValid 
                ? [styles.beginButton, styles.beginButtonDisabled] 
                : styles.beginButton
            }
            textStyle={styles.beginButtonText}
          />
          {!isValid && (
            <Text style={styles.validationText}>
              Please complete all required fields to begin
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  optionCardError: {
    borderColor: colors.error,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  customInput: {
    marginTop: 16,
  },
  sliderContainer: {
    marginTop: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  premiumDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 14,
    color: colors.background,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  beginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
  },
  beginButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  beginButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
  validationText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
});