/**
 * Systems Screen
 *
 * Purpose:
 * - Provides an overview of world systems (politics, economics, war) for the chronicle.
 *
 * Interconnections:
 * - Reads `currentGame.worldSystems` from `src/store/gameStore.ts`.
 * - Shares data structures with `src/types/game.ts` (`WorldSystems`).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { colors } from '../../constants/colors';

export default function SystemsScreen() {
  const ws = useGameStore((s) => s.currentGame?.worldSystems);

  if (!ws) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>No world systems available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>World Systems</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Politics</Text>
        {ws.politics.length === 0 ? (
          <Text style={styles.body}>No known factions</Text>
        ) : (
          ws.politics.map((f) => (
            <Text key={f.id} style={styles.body}>• {f.name} (Power: {f.power})</Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Economics</Text>
        <Text style={styles.body}>Currency: {ws.economics.currency}</Text>
        <Text style={styles.body}>Wealth: {ws.economics.playerWealth}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>War</Text>
        <Text style={styles.body}>Role: {ws.war.playerRole}</Text>
        <Text style={styles.body}>Active Conflicts: {ws.war.activeConflicts.length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  empty: {
    color: colors.textSecondary,
  },
});

