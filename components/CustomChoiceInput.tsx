import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
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
          <Feather size={Platform.select({ ios: 24, android: 20, default: 20 })} color={colors.primary} />
          <Text style={styles.headerTitle}>Write Your Action</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={Platform.select({ ios: 24, android: 20, default: 20 })} color={colors.textMuted} />
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
          numberOfLines={Platform.select({ ios: 5, android: 4, default: 4 })}
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
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 8, android: 6, default: 6 }) },
    shadowOpacity: 0.2,
    shadowRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.select({ ios: 12, android: 10, default: 10 }),
  },
  headerTitle: {
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "700",
    color: colors.text,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  closeButton: {
    padding: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  inputContainer: {
    marginBottom: Platform.select({ ios: 24, android: 20, default: 20 }),
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    padding: Platform.select({ ios: 20, android: 16, default: 16 }),
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.text,
    minHeight: Platform.select({ ios: 120, android: 100, default: 100 }),
    maxHeight: Platform.select({ ios: 180, android: 150, default: 150 }),
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});