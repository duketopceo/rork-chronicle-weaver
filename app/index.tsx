/**
 * Home Screen Component - Chronicle Weaver
 * 
 * This is the main landing screen for Chronicle Weaver, providing:
 * - App introduction and branding
 * - New game initialization
 * - Continue existing game functionality
 * - Feature highlights for the historical RPG experience
 * 
 * Key Features Displayed:
 * - Historical era flexibility (Ancient to Modern)
 * - Character archetype variety (Leaders, Explorers, etc.)
 * - Choice-driven narrative mechanics
 * - Rich visual design with gradients and icons
 * 
 * Navigation Flow:
 * - New Game → Game Setup Screen
 * - Continue → Main Gameplay Screen (if save exists)
 * 
 * State Management:
 * - Uses Zustand game store for save data and setup state
 * - Integrates with game reset functionality
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { useGameStore } from "@/store/gameStore";
import DebugPanel from "@/components/DebugPanel";
import { Scroll, Crown, Feather, History, Bug, X } from "lucide-react-native";

/**
 * Main Home Screen Component
 * 
 * Renders the welcome interface with game options and feature highlights.
 * Manages navigation to game setup or continuation of existing games.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { currentGame, resetSetup } = useGameStore();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  /**
   * Toggle Debug Panel Visibility
   * 
   * Shows/hides the full-screen debug panel for development monitoring.
   * Only available in development builds for security.
   */
  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
  };

  /**
   * Handle New Game Creation
   * 
   * Resets any existing setup state and navigates to the game setup screen.
   * This ensures a fresh start for character and world creation.
   */
  const handleNewGame = () => {
    resetSetup(); // Clear any previous setup data
    router.push("/game/setup");
  };

  /**
   * Handle Continue Game
   * 
   * Navigates directly to the main gameplay screen.
   * Assumes existing game state is available in the store.
   */
  const handleContinueGame = () => {
    router.push("/game/play");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Scroll size={64} color={colors.primary} />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>Chronicle Weaver</Text>
                <Text style={styles.subtitle}>Shape Your History</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <History size={28} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Any Historical Era</Text>
                <Text style={styles.featureText}>Ancient to modern times</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Crown size={28} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Political Systems</Text>
                <Text style={styles.featureText}>Navigate politics and alliances</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Feather size={28} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Custom Actions</Text>
                <Text style={styles.featureText}>Write your own choices</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Begin New Chronicle"
              onPress={handleNewGame}
              size="large"
              style={styles.primaryButton}
            />
            
            {currentGame && (
              <Button
                title="Continue Chronicle"
                onPress={handleContinueGame}
                variant="outline"
                size="large"
                style={styles.secondaryButton}
              />
            )}          </View>
        </ScrollView>
      </LinearGradient>

      {/* Development Debug Panel Toggle Button */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.debugToggle}
          onPress={toggleDebugPanel}
          activeOpacity={0.8}
        >
          <Bug size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      {/* Full-Screen Debug Panel Modal */}
      <Modal
        visible={showDebugPanel}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowDebugPanel(false)}
      >
        <SafeAreaView style={styles.debugModalContainer}>
          <View style={styles.debugHeader}>
            <Text style={styles.debugTitle}>Chronicle Weaver - Debug Panel</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDebugPanel(false)}
              activeOpacity={0.8}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <DebugPanel />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 20,
  },
  iconContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  titleTextContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    textAlign: "center",
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  featureContent: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },  secondaryButton: {
    borderColor: colors.primary,
    borderRadius: 16,
    borderWidth: 2,
  },
  debugToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    zIndex: 1000,
  },
  debugModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  debugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  debugTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: colors.error,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});