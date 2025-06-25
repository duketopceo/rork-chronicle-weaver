/**
 * Game Choice Button Component
 * 
 * Interactive button for player choices in narrative gameplay.
 * 
 * Purpose: Handles player decision inputs and choice selection in game scenes.
 * 
 * References:
 * - File: src/components/ChoiceButton.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated, Platform } from "react-native";
import { GameChoice } from "../types/game";
import { colors } from "../constants/colors";
import * as Haptics from "expo-haptics";
import { Feather } from "lucide-react-native";

type ChoiceButtonProps = {
  choice: GameChoice;
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
  index?: number;
};

export default function ChoiceButton({
  choice,
  onSelect,
  disabled = false,
  style,
  index = 0,
}: ChoiceButtonProps) {
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  React.useEffect(() => {
    // Staggered animation for choices
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onSelect(choice.id);
  };

  return (
    <Animated.View style={{ 
      transform: [{ scale: scaleAnim }], 
      opacity: opacityAnim 
    }}>
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled, style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Feather 
          size={Platform.select({ ios: 24, android: 20, default: 20 })} 
          color={colors.primary} 
          style={styles.icon} 
        />
        <Text style={styles.text}>{choice.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.choiceBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    marginVertical: Platform.select({ ios: 12, android: 10, default: 10 }),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 8, android: 6, default: 6 }) },
    shadowOpacity: 0.2,
    shadowRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    elevation: 6,
    borderLeftWidth: Platform.select({ ios: 5, android: 4, default: 4 }),
    borderLeftColor: colors.primary,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: Platform.select({ ios: 90, android: 80, default: 70 }),
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: Platform.select({ ios: 20, android: 16, default: 16 }),
    marginTop: Platform.select({ ios: 6, android: 4, default: 4 }),
  },
  text: {
    color: colors.text,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    lineHeight: Platform.select({ ios: 30, android: 28, default: 28 }),
    fontWeight: "600",
    flex: 1,
    paddingRight: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
});