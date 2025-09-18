/**
 * Character Screen
 *
 * Purpose:
 * - Displays the current character's profile including stats, inventory, and relationships.
 *
 * Interconnections:
 * - Reads from `src/store/gameStore.ts` for character data.
 * - Uses `src/components/StatsBar.tsx` for stat display.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { colors } from '../../constants/colors';
import StatsBar from '../../components/StatsBar';

export default function CharacterScreen() {
  const game = useGameStore((s) => s.currentGame);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>No active game.</Text>
      </SafeAreaView>
    );
  }

  const { character } = game;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{character.name}</Text>
      <Text style={styles.sub}>{character.archetype}</Text>
      <StatsBar />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backstory</Text>
        <Text style={styles.body}>{character.backstory || 'No backstory available yet.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory</Text>
        {character.inventory.length === 0 ? (
          <Text style={styles.body}>Empty</Text>
        ) : (
          character.inventory.map((it) => (
            <Text key={it.id} style={styles.body}>• {it.name} x{it.quantity}</Text>
          ))
        )}
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
    fontSize: 24,
    fontWeight: '800',
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
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

