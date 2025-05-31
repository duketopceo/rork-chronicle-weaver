import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { Send, X, Edit3, Feather } from "lucide-react-native";

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
          <Feather size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Write Your Action</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>
        Describe exactly what you want your character to do. Kronos will weave your action into the chronicle and respond with the consequences.
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="I want to..."
          placeholderTextColor={colors.textMuted}
          value={customAction}
          onChangeText={setCustomAction}
          multiline
          numberOfLines={4}
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
    borderRadius: 24,
    padding: 24,
    margin: 20,
    borderWidth: 2,
    borderColor: colors.primary + "30",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  closeButton: {
    padding: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    color: colors.text,
    minHeight: 120,
    maxHeight: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});