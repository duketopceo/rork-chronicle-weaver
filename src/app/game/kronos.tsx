/**
 * Kronos Timeline Screen
 *
 * Purpose:
 * - Presents a timeline view of the current and previous narrative segments,
 *   offering a quick way to review recent story progression.
 *
 * Interconnections:
 * - Reads `currentGame.currentSegment` and `currentGame.pastSegments` from `src/store/gameStore.ts`.
 * - Shares narrative structures with `src/types/game.ts` (`GameSegment`).
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { colors } from '../../constants/colors';

export default function KronosTimelineScreen() {
  const game = useGameStore((s) => s.currentGame);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>No active chronicle.</Text>
      </SafeAreaView>
    );
  }

  const segments = [
    ...(game.currentSegment ? [
      { id: game.currentSegment.id, text: game.currentSegment.text, label: 'Current Segment' },
    ] : []),
    ...[...game.pastSegments].reverse().map((s, idx) => ({ id: s.id + '_' + idx, text: s.text, label: 'Past Segment' })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Kronos Timeline</Text>
      <FlatList
        data={segments}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.badge}>{item.label}</Text>
            <Text style={styles.body}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No segments yet.</Text>}
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
  badge: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  empty: {
    color: colors.textMuted,
  },
});

