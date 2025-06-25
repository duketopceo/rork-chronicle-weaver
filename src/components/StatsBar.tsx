/**
 * Character Stats Bar Component
 * 
 * Visual representation of character statistics and attributes.
 * 
 * Purpose: Displays character progress and attribute values in gameplay.
 * 
 * References:
 * - File: src/components/StatsBar.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CharacterStats } from "../types/game";
import { colors } from "../constants/colors";
import { Shield, Brain, Coins, Award } from "lucide-react-native";

type StatsBarProps = {
  stats: CharacterStats;
  compact?: boolean;
};

export default function StatsBar({ stats, compact = false }: StatsBarProps) {
  const statItems = [
    { name: "Influence", value: stats.influence, icon: Shield, color: colors.accent },
    { name: "Knowledge", value: stats.knowledge, icon: Brain, color: colors.secondary },
    { name: "Resources", value: stats.resources, icon: Coins, color: colors.primary },
    { name: "Reputation", value: stats.reputation, icon: Award, color: colors.primaryLight },
  ];

  const getStatColor = (value: number) => {
    if (value <= 3) return colors.error;
    if (value <= 6) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {statItems.map((stat) => (
        <View key={stat.name} style={[styles.statItem, compact && styles.statItemCompact]}>
          <View style={styles.iconContainer}>
            <stat.icon size={compact ? 20 : 24} color={stat.color} />
          </View>
          {!compact && <Text style={styles.statName}>{stat.name}</Text>}
          <View style={styles.statValueContainer}>
            <Text style={[styles.statValue, { color: getStatColor(stat.value) }]}>
              {stat.value}
            </Text>
            {!compact && <Text style={styles.statMax}>/10</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  containerCompact: {
    padding: 16,
    marginVertical: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statItemCompact: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    marginBottom: 8,
  },
  statName: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    textAlign: "center",
    fontWeight: "600",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statMax: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 2,
  },
});