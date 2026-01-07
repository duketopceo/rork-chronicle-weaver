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
import { SubscriptionGate } from "../../components/SubscriptionGate";
import { User, Palette, Crown, History, Shuffle, Sparkles } from "lucide-react-native";

// Professional Role Options (Learning Scenarios)
const PROFESSIONAL_ROLES = [
  { id: "store_owner", name: "Store Owner", description: "Manage retail operations, inventory, and customer service" },
  { id: "bank_manager", name: "Bank Manager", description: "Make loan decisions, assess risk, and serve clients" },
  { id: "fund_manager", name: "Fund Manager", description: "Manage investments, analyze markets, and build portfolios" },
  { id: "restaurant_manager", name: "Restaurant Manager", description: "Oversee operations, staff, and quality control" },
  { id: "real_estate_investor", name: "Real Estate Investor", description: "Evaluate properties, secure financing, and manage tenants" },
  { id: "startup_founder", name: "Startup Founder", description: "Build products, raise capital, and grow your team" },
  { id: "custom", name: "Custom Role", description: "Create your own professional scenario" },
];

// Learning Focus Options
const LEARNING_FOCUSES = [
  { id: "financial_management", name: "Financial Management", description: "Budgeting, cash flow, and financial planning" },
  { id: "strategic_planning", name: "Strategic Planning", description: "Long-term goals, competitive analysis, and growth" },
  { id: "operations", name: "Operations Management", description: "Efficiency, processes, and quality control" },
  { id: "customer_relations", name: "Customer Relations", description: "Service, satisfaction, and relationship building" },
  { id: "leadership", name: "Leadership & Team Building", description: "Managing people, culture, and communication" },
  { id: "risk_management", name: "Risk Management", description: "Identify, assess, and mitigate business risks" },
  { id: "custom", name: "Custom Focus", description: "Define your own learning objectives" },
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

    // Role validation
    if (!formData.era) {
      newErrors.era = 'Please select a professional role';
      valid = false;
    } else if (formData.era === 'custom' && !formData.customEra.trim()) {
      newErrors.era = 'Please specify your custom role';
      valid = false;
    }

    // Learning focus validation
    if (!formData.theme) {
      newErrors.theme = 'Please select a learning focus';
      valid = false;
    } else if (formData.theme === 'custom' && !formData.customTheme.trim()) {
      newErrors.theme = 'Please specify your custom focus';
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

  const getDifficultyLabel = (value: number) => {
    if (value <= 0.2) return 'Highly Realistic';
    if (value <= 0.4) return 'Realistic';
    if (value <= 0.6) return 'Balanced';
    if (value <= 0.8) return 'Simplified';
    return 'Beginner Friendly';
  };

  const getDifficultyDescription = (value: number) => {
    if (value <= 0.2) return 'Complex real-world challenges with detailed business mechanics';
    if (value <= 0.4) return 'Realistic scenarios with some guidance and support';
    if (value <= 0.6) return 'Balanced difficulty with clear learning objectives';
    if (value <= 0.8) return 'Simplified scenarios focusing on core concepts';
    return 'Beginner-friendly with step-by-step guidance';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Begin Your Learning Journey</Text>
          <Text style={styles.subtitle}>
            Choose your professional role, learning focus, and difficulty to start
          </Text>
        </View>

        {/* Character Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Name</Text>
          <TextInput
            value={formData.characterName}
            onChangeText={(value) => handleInputChange('characterName', value)}
            placeholder="Enter your name"
            error={errors.characterName}
            icon={User}
          />
        </View>

        {/* Professional Role */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Role</Text>
          <Text style={styles.sectionDescription}>
            Choose the business scenario you want to learn about
          </Text>
          <View style={styles.optionsGrid}>
            {PROFESSIONAL_ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.optionCard,
                  formData.era === role.id && styles.optionCardSelected,
                  errors.era && formData.era !== role.id && styles.optionCardError,
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

        {/* Complexity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complexity Level</Text>
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
              <Text style={styles.sliderLabel}>Highly Realistic</Text>
              <Text style={styles.sliderLabel}>Beginner Friendly</Text>
            </View>
            <Text style={styles.difficultyLabel}>
              {getDifficultyLabel(formData.difficulty)}
            </Text>
          </View>
        </View>

        {/* AI Background Generation (Premium Feature) */}
        <View style={styles.section}>
          <SubscriptionGate
            requiredTier="premium"
            feature="AI Background Generation"
            featureDescription="Let AI create a rich, detailed background for your professional profile"
            benefits={[
              "AI-generated professional background",
              "Industry context integration",
              "Skills and experience traits",
              "Starting relationships and reputation"
            ]}
          >
            <View style={styles.premiumFeature}>
              <View style={styles.premiumHeader}>
                <Sparkles size={20} color={colors.gold} />
                <Text style={styles.premiumTitle}>AI Background Generation</Text>
                <Crown size={16} color={colors.gold} />
              </View>
              <Text style={styles.premiumDescription}>
                Let AI create a rich, detailed background for your professional profile
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

        {/* Begin Learning Journey Button */}
        <View style={styles.footer}>
          <Button
            title="Start Learning Journey"
            onPress={handleBeginChronicle}
            disabled={!isValid}
            style={[
              styles.beginButton,
              !isValid && styles.beginButtonDisabled,
            ]}
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
    borderLeftColor: colors.gold,
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