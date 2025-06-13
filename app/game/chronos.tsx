import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import { useRouter } from "expo-router";
import { processKronosMessage } from "@/services/aiService";
import { MessageCircle, Send, Clock, CheckCircle, History } from "lucide-react-native";

export default function ChronosScreen() {
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
            <Text style={styles.title}>Speak with Chronicles</Text>
            <Text style={styles.subtitle}>
              Request changes, improvements, or ask questions about your chronicle
            </Text>
          </View>
        </View>

        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {chronosMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Direct Line to Chronicles</Text>
              <Text style={styles.emptyText}>
                Ask me to enhance your world with deeper politics, economics, or any other systems. 
                I can also explain story elements or modify how things work in your chronicle.
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Example requests:</Text>
                <Text style={styles.example}>• "Chronicles, add more types of merchants to the marketplace"</Text>
                <Text style={styles.example}>• "Can we have a credit system for wealthy traders?"</Text>
                <Text style={styles.example}>• "Add political factions competing for power"</Text>
                <Text style={styles.example}>• "What horses are the enemy cavalry riding?"</Text>
                <Text style={styles.example}>• "Make the economics more detailed with banking"</Text>
                <Text style={styles.example}>• "Add a battle system with multiple turns"</Text>
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
                    <View style={styles.chronosMessage}>
                      <View style={styles.chronosHeader}>
                        <History size={20} color={colors.primary} />
                        <Text style={styles.chronosName}>Chronicles</Text>
                      </View>
                      <Text style={styles.messageText}>{message.response}</Text>
                      {!message.resolved && (
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
                      <Text style={styles.loadingText}>Chronicles is thinking...</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Ask Chronicles to enhance your world..."
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
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerIcon: {
    marginRight: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
  },
  exampleContainer: {
    width: "100%",
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  example: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 22,
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
    padding: 20,
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderBottomRightRadius: 8,
  },
  chronosMessage: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chronosHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  chronosName: {
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
    padding: 20,
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
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  messageInput: {
    flex: 1,
    maxHeight: 120,
  },
  sendButton: {
    alignSelf: "flex-end",
    minWidth: 80,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: "100%",
  },
});