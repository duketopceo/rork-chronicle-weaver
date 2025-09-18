/**
 * Memories Screen
 *
 * Purpose:
 * - Displays the player's memory log (choices, events, discoveries) for the current chronicle.
 *
 * Interconnections:
 * - Reads memories from `src/store/gameStore.ts` via `MemoryList`.
 * - Uses shared UI from `src/components/MemoryList.tsx` and theme from `src/constants/colors.ts`.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import MemoryList from '../../components/MemoryList';
import { useGameStore } from '../../store/gameStore';

export default function MemoriesScreen() {
  const currentGame = useGameStore((s) => s.currentGame);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>        
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.subtitle}>{currentGame ? currentGame.character.name : 'No active game'}</Text>
      </View>
      <MemoryList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
});

