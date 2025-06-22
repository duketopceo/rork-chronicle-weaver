import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "../constants/colors";
import Button from "./Button";
import { X, Feather } from "lucide-react-native";

type CustomChoiceInputProps = {
  onSubmit: (customAction: string) => void;
  onCancel: () => void;
  disabled?: boolean;
};

export default function CustomChoiceInput({ onSubmit, onCancel, disabled }: CustomChoiceInputProps) {
  const [customAction, setCustomAction] = useState("");

  const handleSubmit = () => {
    if (customAction.trim()) {
      onSubmit(customAction.trim());
      setCustomAction("");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather size={Platform.select({ ios: 32, android: 28, default: 28 })} color={colors.primary} />
          <Text style={styles.headerTitle}>Write Your Action</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={Platform.select({ ios: 32, android: 28, default: 28 })} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="I want to..."
          placeholderTextColor={colors.textMuted}
          value={customAction}
          onChangeText={setCustomAction}
          multiline
          numberOfLines={Platform.select({ ios: 6, android: 5, default: 5 })}
          textAlignVertical="top"
          autoFocus
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          size="medium"
          style={styles.cancelButton}
        />
        <Button
          title="Take Action"
          onPress={handleSubmit}
          variant="primary"
          size="medium"
          disabled={!customAction.trim() || disabled}
          style={styles.submitButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 28, android: 24, default: 24 }),
    padding: Platform.select({ ios: 32, android: 28, default: 28 }),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 16, android: 12, default: 12 }) },
    shadowOpacity: 0.3,
    shadowRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.select({ ios: 20, android: 16, default: 16 }),
  },
  headerTitle: {
    fontSize: Platform.select({ ios: 28, android: 24, default: 24 }),
    fontWeight: "800",
    color: colors.text,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  closeButton: {
    padding: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  inputContainer: {
    marginBottom: Platform.select({ ios: 32, android: 28, default: 28 }),
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    padding: Platform.select({ ios: 28, android: 24, default: 24 }),
    fontSize: Platform.select({ ios: 22, android: 20, default: 20 }),
    color: colors.text,
    minHeight: Platform.select({ ios: 160, android: 140, default: 140 }),
    maxHeight: Platform.select({ ios: 220, android: 200, default: 200 }),
    lineHeight: Platform.select({ ios: 34, android: 32, default: 32 }),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});