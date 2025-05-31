import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { useGameStore } from "@/store/gameStore";
import { Scroll, Crown, Feather, History } from "lucide-react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { currentGame, resetSetup } = useGameStore();

  const handleNewGame = () => {
    resetSetup();
    router.push("/game/setup");
  };

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
            )}
          </View>
        </ScrollView>
      </LinearGradient>
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
  },
  secondaryButton: {
    borderColor: colors.primary,
    borderRadius: 16,
    borderWidth: 2,
  },
});