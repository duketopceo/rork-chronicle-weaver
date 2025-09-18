/**
 * MemoryList Component
 *
 * Purpose:
 * - Displays the player's recent memories (choice history, events, discoveries).
 *
 * Interconnections:
 * - Reads `memories` from `src/store/gameStore.ts` (`currentGame.memories`).
 * - Used by gameplay screens like `src/app/game/memories.tsx` and can be embedded
 *   in debug panels for context.
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { colors } from '../constants/colors';
import { formatDate } from '../utils/dateUtils';

export default function MemoryList() {
  const memories = useGameStore((s) => s.currentGame?.memories || []);

  if (!memories.length) {
    return (
      <View style={styles.empty}>        
        <Text style={styles.emptyText}>No memories yet. Your chronicle awaits...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={memories}
      keyExtractor={(m) => m.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.item}>          
          <View style={styles.itemHeader}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{formatDate(item.timestamp)}</Text>
          </View>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

