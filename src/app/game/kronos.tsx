import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../store/gameStore";
import { colors } from "../../constants/colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import { useRouter } from "expo-router";
import { processKronosMessage } from "../../services/aiService";
import { MessageCircle, Send, Clock, CheckCircle, History } from "lucide-react-native";

export default function KronosScreen() {
  const router = useRouter();
  const { 
    currentGame, 
    chronosMessages, 
    addChronosMessage, 
    updateChronosResponse,
    markChronosMessageResolved 
  } = useGameStore();
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!currentGame) {
    router.back();
    return null;
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageText = newMessage.trim();
    const messageId = Date.now().toString();
    setNewMessage("");
    setIsLoading(true);

    // Add message to store
    addChronosMessage(messageText);

    try {
      // Send to AI for processing
      const response = await processKronosMessage(currentGame, messageText);
      updateChronosResponse(messageId, response);
    } catch (error) {
      updateChronosResponse(messageId, "I apologize, but I'm having trouble responding right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkResolved = (messageId: string) => {
    markChronosMessageResolved(messageId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <History size={32} color={colors.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Speak with Kronos</Text>
            <Text style={styles.subtitle}>
              Request changes or ask questions
            </Text>
          </View>
        </View>

        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {chronosMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Direct Line to Kronos</Text>
              <Text style={styles.emptyText}>
                Ask me to enhance your world with deeper politics, economics, or any other systems.
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Examples:</Text>
                <Text style={styles.example}>• "Add political factions"</Text>
                <Text style={styles.example}>• "Create a credit system"</Text>
                <Text style={styles.example}>• "Add battle mechanics"</Text>
              </View>
            </View>
          ) : (
            <View style={styles.messagesList}>
              {chronosMessages.map((message) => (
                <View key={message.id} style={styles.messageThread}>
                  <View style={styles.userMessage}>
                    <Text style={styles.messageText}>{message.message}</Text>
                    <Text style={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  
                  {message.response ? (
                    <View style={styles.kronosMessage}>
                      <View style={styles.kronosHeader}>
                        <History size={20} color={colors.primary} />
                        <Text style={styles.kronosName}>Kronos</Text>
                      </View>
                      <Text style={styles.messageText}>{message.response}</Text>
                      {message.status !== "answered" && (
                        <TouchableOpacity 
                          style={styles.resolveButton}
                          onPress={() => handleMarkResolved(message.id)}
                        >
                          <CheckCircle size={16} color={colors.success} />
                          <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View style={styles.loadingMessage}>
                      <Text style={styles.loadingText}>Kronos is thinking...</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Ask Kronos to enhance your world..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            numberOfLines={3}
            style={styles.messageInput}
          />
          <Button
            title="Send"
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            loading={isLoading}
            style={styles.sendButton}
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="Return to Chronicle"
            onPress={() => router.back()}
            variant="outline"
            size="large"
            style={styles.backButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerIcon: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  exampleContainer: {
    width: "100%",
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  example: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    paddingLeft: 8,
  },
  messagesList: {
    gap: 24,
  },
  messageThread: {
    gap: 16,
  },
  userMessage: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderBottomRightRadius: 8,
  },
  kronosMessage: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kronosHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  kronosName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  messageTime: {
    fontSize: 12,
    color: colors.background,
    marginTop: 8,
    opacity: 0.8,
  },
  loadingMessage: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  resolveButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  resolveButtonText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    alignSelf: "flex-end",
    minWidth: 80,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: "100%",
  },
});