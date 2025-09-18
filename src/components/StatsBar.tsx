/**
 * StatsBar Component
 * 
 * Purpose:
 * - Displays the current character's core stats in a compact horizontal bar.
 * 
 * Interconnections:
 * - Reads `currentGame.character.stats` from `src/store/gameStore.ts`.
 * - Used on gameplay-related screens to provide at-a-glance status.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { colors } from '../constants/colors';

export default function StatsBar() {
  const stats = useGameStore((s) => s.currentGame?.character.stats);

  if (!stats) return null;

  const items = [
    { key: 'Influence', value: stats.influence },
    { key: 'Knowledge', value: stats.knowledge },
    { key: 'Resources', value: stats.resources },
    { key: 'Reputation', value: stats.reputation },
  ];

  return (
    <View style={styles.container}>
      {items.map((it) => (
        <View key={it.key} style={styles.item}>
          <Text style={styles.label}>{it.key}</Text>
          <Text style={styles.value}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    gap: 12,
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    minWidth: 70,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

