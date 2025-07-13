/**
 * Usage Indicator Component
 * 
 * Visual indicator showing API usage, quotas, and limits.
 * 
 * Purpose: Displays current usage statistics and remaining quotas.
 * 
 * References:
 * - File: src/components/UsageIndicator.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';

const UsageIndicator = () => {
  const { currentGame, userType } = useGameStore(state => ({ 
    currentGame: state.currentGame,
    userType: state.userType 
  }));

  if (!currentGame) {
    return null;
  }

  const turnLimit = userType === 'free' ? 50 : 10000;
  const turnsUsed = currentGame.turnCount;
  const turnsRemaining = turnLimit - turnsUsed;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Turns Used: {turnsUsed} / {turnLimit}</Text>
      <Text style={styles.text}>Turns Remaining: {turnsRemaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default UsageIndicator;
