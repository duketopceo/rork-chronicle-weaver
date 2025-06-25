/**
 * Character Management Screen
 * 
 * Character sheet and management interface for player progression.
 * 
 * Purpose: Allows players to view and manage their character attributes and progress.
 * 
 * References:
 * - File: src/app/game/character.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../store/gameStore";
import { colors } from "../../constants/colors";
import StatsBar from "../../components/StatsBar";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import { Shield, Brain, Coins, Award, User, MapPin, Palette } from "lucide-react-native";

export default function CharacterScreen() {
  const router = useRouter();
  const { currentGame } = useGameStore();

  if (!currentGame) {
    router.back();
    return null;
  }

  const { character, era, theme } = currentGame;
  const { name, stats } = character;

  const getCharacterLore = () => {
    return currentGame.lore.find(
      (lore) => 
        lore.category === "character" && 
        lore.title.toLowerCase().includes(name.toLowerCase())
    );
  };

  const characterLore = getCharacterLore();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={64} color={colors.primary} />
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>Protagonist in {era}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Statistics</Text>
          <StatsBar stats={stats} />
          
          <View style={styles.statsDetails}>
            <View style={styles.statDetail}>
              <Shield size={24} color={colors.accent} />
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Influence: {stats.influence}/10</Text>
                <Text style={styles.statDescription}>
                  Your ability to sway others and affect outcomes. Higher influence opens diplomatic options.
                </Text>
              </View>
            </View>
            
            <View style={styles.statDetail}>
              <Brain size={24} color={colors.secondary} />
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Knowledge: {stats.knowledge}/10</Text>
                <Text style={styles.statDescription}>
                  Your education, wisdom, and access to information. Knowledge reveals hidden opportunities.
                </Text>
              </View>
            </View>
            
            <View style={styles.statDetail}>
              <Coins size={24} color={colors.primary} />
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Resources: {stats.resources}/10</Text>
                <Text style={styles.statDescription}>
                  Your wealth, possessions, and material assets. Resources enable ambitious plans.
                </Text>
              </View>
            </View>
            
            <View style={styles.statDetail}>
              <Award size={24} color={colors.primaryLight} />
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Reputation: {stats.reputation}/10</Text>
                <Text style={styles.statDescription}>
                  How you are perceived by others. Reputation affects how people react to you.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Story Details</Text>
          
          <View style={styles.detailItem}>
            <MapPin size={24} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Story Setting</Text>
              <Text style={styles.detailValue}>{era}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Palette size={24} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Story Theme</Text>
              <Text style={styles.detailValue}>{theme}</Text>
            </View>
          </View>
        </View>

        {characterLore && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Character Background</Text>
            <View style={styles.backstoryContainer}>
              <Text style={styles.backstory}>{characterLore.content}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{currentGame.turnCount}</Text>
              <Text style={styles.progressLabel}>Turns Played</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{currentGame.memories.length}</Text>
              <Text style={styles.progressLabel}>Memories</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{currentGame.lore.length}</Text>
              <Text style={styles.progressLabel}>Lore Entries</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Return to Story"
          onPress={() => router.back()}
          size="large"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatarContainer: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  name: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  section: {
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 24,
  },
  statsDetails: {
    marginTop: 24,
    gap: 24,
  },
  statDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 26,
  },
  backstoryContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backstory: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 28,
  },
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: {
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  footer: {
    padding: 28,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    width: "100%",
  },
});