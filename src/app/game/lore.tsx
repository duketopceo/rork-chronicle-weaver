/**
 * Lore Screen
 *
 * Purpose:
 * - Displays discovered lore entries that provide historical and narrative context.
 *
 * Interconnections:
 * - Reads `currentGame.lore` from `src/store/gameStore.ts`.
 * - Shares data structures with `src/types/game.ts` (`LoreEntry`).
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { colors } from '../../constants/colors';

export default function LoreScreen() {
  const lore = useGameStore((s) => s.currentGame?.lore || []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lore</Text>
      <FlatList
        data={lore}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.body}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No lore discovered yet.</Text>}
      />
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
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  category: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  body: {
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 14,
  },
  empty: {
    color: colors.textMuted,
  },
});

