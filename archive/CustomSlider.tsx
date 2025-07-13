/**
 * Custom Slider Component
 * 
 * Customizable slider component for numeric value selection.
 * 
 * Purpose: Provides interactive numeric input controls for game settings.
 * 
 * References:
 * - File: src/components/CustomSlider.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../constants/colors";

type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  containerStyle?: ViewStyle;
};

export default function CustomSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.1,
  label,
  leftLabel,
  rightLabel,
  containerStyle,
}: SliderProps) {
  const options = [
    { value: 0, label: "Hyper Realistic", description: "Strictly adhere to real-world facts" },
    { value: 0.25, label: "Historical", description: "Historically grounded with minor liberties" },
    { value: 0.5, label: "Balanced", description: "Balance realism with engaging narrative" },
    { value: 0.75, label: "Dramatic", description: "Prioritize drama over strict accuracy" },
    { value: 1, label: "Pure Fantasy", description: "Allow magical and fantastical elements" },
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[2];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonActive
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text style={[
              styles.optionText,
              value === option.value && styles.optionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {selectedOption.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  optionTextActive: {
    color: colors.background,
  },
  descriptionContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: "center",
  },
});