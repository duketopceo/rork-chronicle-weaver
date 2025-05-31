import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from "react-native";
import { GameChoice } from "@/types/game";
import { colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
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
        <Feather size={18} color={colors.primary} style={styles.icon} />
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
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    flex: 1,
  },
});