import React from "react";
import { 
  TextInput as RNTextInput, 
  StyleSheet, 
  View, 
  Text,
  TextInputProps,
  ViewStyle
} from "react-native";
import { colors } from "@/constants/colors";

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
    marginBottom: 24,
    width: "100%",
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    color: colors.text,
    width: "100%",
    minHeight: 56,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    marginTop: 10,
  },
});