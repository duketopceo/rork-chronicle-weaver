/**
 * Chronos Screen (Direct AI Chat)
 *
 * Purpose:
 * - Lets the player talk directly to Kronos (the storyteller) to request changes,
 *   clarifications, or guidance. Shows a simple chat history.
 *
 * Interconnections:
 * - Reads and writes messages via `src/store/gameStore.ts` (`chronosMessages`).
 * - Calls `processKronosMessage` from `src/services/aiService.ts` and updates
 *   responses using `updateChronosResponse` in the store.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { colors } from '../../constants/colors';
import { processKronosMessage } from '../../services/aiService';

export default function ChronosScreen() {
  const { currentGame, chronosMessages, addChronosMessage, updateChronosResponse } = useGameStore();
  const [text, setText] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const canChat = Boolean(currentGame);

  const handleSend = async () => {
    if (!text.trim() || !currentGame) return;
    const message = text.trim();
    setText('');

    // Add user message and keep its ID
    const id = Date.now().toString();
    addChronosMessage(message);
    setSendingId(id);

    try {
      const response = await processKronosMessage(currentGame, message);
      updateChronosResponse(id, response);
    } catch (e) {
      updateChronosResponse(id, 'Kronos is unavailable at the moment. Please try again.');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Talk to Kronos</Text>

      {!canChat && <Text style={styles.muted}>Start a game to chat with Kronos.</Text>}

      {canChat && (
        <>
          <FlatList
            data={chronosMessages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.message}>
                <Text style={styles.userMsg}>You: {item.message}</Text>
                {item.response && <Text style={styles.aiMsg}>Kronos: {item.response}</Text>}
              </View>
            )}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Ask Kronos..."
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity style={styles.send} onPress={handleSend} disabled={!text.trim() || Boolean(sendingId)}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  muted: {
    color: colors.textMuted,
  },
  list: {
    gap: 10,
    paddingBottom: 16,
  },
  message: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
  },
  userMsg: {
    color: colors.text,
    marginBottom: 6,
    fontWeight: '600',
  },
  aiMsg: {
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  send: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendText: {
    color: colors.background,
    fontWeight: '700',
  },
});

