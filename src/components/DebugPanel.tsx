/**
 * Debug Panel Component (Simple)
 * 
 * Purpose:
 * - Lightweight, always-available debug panel for development builds.
 * - Complements `components/UltraDebugPanel.tsx` by providing a simpler, embeddable
 *   view into app health, recent steps, and errors.
 * 
 * Interconnections:
 * - Uses `src/utils/debugSystem.ts` hooks (`useDebugSteps`, `useDebugErrors`, `useDebugMetrics`)
 *   for live telemetry.
 * - Reads game state from `src\store\gameStore.ts` to show high-level status.
 * - Intended to be toggled or embedded within screens like `src/app/index.tsx` and
 *   `src/app/game/play.tsx` for quick diagnostics.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { useDebugSteps, useDebugErrors, useDebugMetrics } from '../utils/debugSystem';
import { useGameStore } from '../store/gameStore';

type DebugPanelProps = {
  title?: string;
  compact?: boolean;
};

export default function DebugPanel({ title = 'Debug Panel', compact = false }: DebugPanelProps) {
  const steps = useDebugSteps();
  const errors = useDebugErrors();
  const metrics = useDebugMetrics();
  const { currentGame, isLoading } = useGameStore((s) => ({ currentGame: s.currentGame, isLoading: s.isLoading }));
  // Guard render after hooks have been called to satisfy React Hooks rules
  if (!__DEV__) return null;

  const recentSteps = steps.slice(-5);
  const recentErrors = errors.slice(-3);
  const recentMetrics = metrics.slice(-3);

  return (
    <View style={[styles.container, compact && styles.compact]}>      
      <Text style={styles.title}>{title}</Text>

      <View style={styles.section}>        
        <Text style={styles.sectionTitle}>App</Text>
        <Text style={styles.kv}>State: <Text style={styles.value}>{isLoading ? 'Loading' : 'Ready'}</Text></Text>
        <Text style={styles.kv}>Game: <Text style={styles.value}>{currentGame ? 'Active' : 'None'}</Text></Text>
        {currentGame && (
          <>
            <Text style={styles.kv}>Era: <Text style={styles.value}>{currentGame.era}</Text></Text>
            <Text style={styles.kv}>Turns: <Text style={styles.value}>{currentGame.turnCount}</Text></Text>
          </>
        )}
      </View>

      <ScrollView style={styles.scroller} contentContainerStyle={styles.scrollerContent}>
        <View style={styles.section}>          
          <Text style={styles.sectionTitle}>Recent Steps</Text>
          {recentSteps.length === 0 && <Text style={styles.muted}>No steps yet</Text>}
          {recentSteps.map((s) => (
            <View key={s.id} style={styles.item}>              
              <Text style={styles.itemTitle}>{s.step}</Text>
              <Text style={styles.itemSub}>{s.message}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>          
          <Text style={styles.sectionTitle}>Errors</Text>
          {recentErrors.length === 0 && <Text style={styles.muted}>No errors</Text>}
          {recentErrors.map((e) => (
            <View key={e.id} style={[styles.item, styles.errorItem]}>              
              <Text style={styles.itemTitle}>{e.context}</Text>
              <Text style={[styles.itemSub, styles.errorText]}>{e.error.message}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>          
          <Text style={styles.sectionTitle}>Metrics</Text>
          {recentMetrics.length === 0 && <Text style={styles.muted}>No metrics</Text>}
          {recentMetrics.map((m) => (
            <View key={m.id} style={styles.item}>              
              <Text style={styles.itemTitle}>{m.name}</Text>
              <Text style={styles.itemSub}>{m.value}{m.unit}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  compact: {
    padding: 8,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  kv: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  scroller: {
    maxHeight: 200,
  },
  scrollerContent: {
    paddingBottom: 4,
  },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    backgroundColor: colors.background,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  itemSub: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 12,
  },
  errorItem: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
  }
});

