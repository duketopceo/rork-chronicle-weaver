import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated, Platform } from "react-native";
import { GameChoice } from "@/types/game";
import { colors } from "@/constants/colors";
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
          size={Platform.select({ ios: 20, android: 18, default: 18 })} 
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
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 20, android: 16, default: 16 }),
    marginVertical: Platform.select({ ios: 10, android: 8, default: 8 }),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 6, android: 4, default: 4 }) },
    shadowOpacity: 0.15,
    shadowRadius: Platform.select({ ios: 10, android: 8, default: 8 }),
    elevation: 4,
    borderLeftWidth: Platform.select({ ios: 4, android: 3, default: 3 }),
    borderLeftColor: colors.primary,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: Platform.select({ ios: 80, android: 70, default: 60 }),
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: Platform.select({ ios: 16, android: 12, default: 12 }),
    marginTop: Platform.select({ ios: 4, android: 2, default: 2 }),
  },
  text: {
    color: colors.text,
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
    fontWeight: "500",
    flex: 1,
    paddingRight: Platform.select({ ios: 8, android: 4, default: 0 }),
  },
});