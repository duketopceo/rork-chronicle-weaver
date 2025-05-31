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
          <Feather size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Write Your Action</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={20} color={colors.textMuted} />
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
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "serif",
  },
  closeButton: {
    padding: 6,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    maxHeight: 150,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});