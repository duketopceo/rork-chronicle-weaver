/**
 * Styled Text Input Component
 * 
 * Customizable text input component with consistent theming.
 * 
 * Purpose: Provides standardized text input interface across the application.
 * 
 * References:
 * - File: src/components/TextInput.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React from "react";
import { 
  TextInput as RNTextInput, 
  StyleSheet, 
  View, 
  Text,
  TextInputProps,
  ViewStyle,
  Platform
} from "react-native";
import { colors } from "../constants/colors";

type CustomTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export default function TextInput({
  label,
  error,
  containerStyle,
  style,
  placeholder,
  ...props
}: CustomTextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Platform.select({ ios: 28, android: 24, default: 24 }),
    width: "100%",
  },
  label: {
    fontSize: Platform.select({ ios: 18, android: 17, default: 17 }),
    fontWeight: "600",
    color: colors.text,
    marginBottom: Platform.select({ ios: 14, android: 12, default: 12 }),
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Platform.select({ ios: 16, android: 14, default: 14 }),
    padding: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontSize: Platform.select({ ios: 18, android: 17, default: 17 }),
    color: colors.text,
    width: "100%",
    minHeight: Platform.select({ ios: 60, android: 56, default: 56 }),
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: Platform.select({ ios: 16, android: 15, default: 15 }),
    marginTop: Platform.select({ ios: 12, android: 10, default: 10 }),
  },
});