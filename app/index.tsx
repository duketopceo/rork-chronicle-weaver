import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { useGameStore } from "@/store/gameStore";
import { BookOpen, Clock, Sparkles, Scroll, Crown, Feather, Zap, Globe, Users, History, Shield, Sword } from "lucide-react-native";

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
                <Scroll size={72} color={colors.primary} />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>Chronicle Weaver</Text>
                <Text style={styles.subtitle}>Weave Your Own History</Text>
              </View>
            </View>
            <Text style={styles.description}>
              Step into any era, from the courts of Versailles to the battlefields of Troy. 
              Your choices shape history itself in these living, breathing worlds.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <History size={32} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Any Historical Era</Text>
                <Text style={styles.featureText}>From ancient civilizations to distant futures - every time period awaits</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Crown size={32} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Living Political Systems</Text>
                <Text style={styles.featureText}>Navigate complex politics, forge alliances, and shape the fate of nations</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Feather size={32} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Write Your Own Actions</Text>
                <Text style={styles.featureText}>Describe exactly what you want to do - the primary way to play</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Users size={32} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Speak with Kronos</Text>
                <Text style={styles.featureText}>Request deeper systems, more detail, or changes to your world</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Shield size={32} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Historical Authenticity</Text>
                <Text style={styles.featureText}>Experience meticulously researched historical periods with authentic details</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Sword size={32} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Epic Consequences</Text>
                <Text style={styles.featureText}>Every choice ripples through time, affecting politics, economics, and warfare</Text>
              </View>
            </View>
          </View>

          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Chronicle Inspirations</Text>
            <View style={styles.exampleGrid}>
              <Text style={styles.example}>"Rise through the ranks in Napoleon's Grande Armée"</Text>
              <Text style={styles.example}>"Navigate the political intrigue of Renaissance Florence"</Text>
              <Text style={styles.example}>"Lead a Viking expedition to unknown lands"</Text>
              <Text style={styles.example}>"Survive the court of Henry VIII as a noble"</Text>
              <Text style={styles.example}>"Build a trading empire in medieval Venice"</Text>
              <Text style={styles.example}>"Command legions in the height of Rome"</Text>
              <Text style={styles.example}>"Explore the New World with Spanish conquistadors"</Text>
              <Text style={styles.example}>"Navigate samurai honor in feudal Japan"</Text>
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
                title="Continue Your Chronicle"
                onPress={handleContinueGame}
                variant="outline"
                size="large"
                style={styles.secondaryButton}
              />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              "History is written by those who dare to shape it."
            </Text>
            <Text style={styles.freeTrialText}>
              Free for your first 10 turns • Experience the full Chronicle Weaver adventure
            </Text>
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
    gap: 24,
  },
  iconContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  titleTextContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  description: {
    fontSize: 17,
    color: colors.text,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 360,
    fontFamily: "serif",
  },
  featuresContainer: {
    marginBottom: 40,
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  featureContent: {
    marginLeft: 20,
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  examplesContainer: {
    marginBottom: 40,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  exampleGrid: {
    gap: 12,
  },
  example: {
    fontSize: 15,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    fontStyle: "italic",
    fontFamily: "serif",
  },
  buttonContainer: {
    gap: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  secondaryButton: {
    borderColor: colors.primary,
    borderRadius: 20,
    borderWidth: 2,
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 30,
  },
  footerText: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500",
    fontFamily: "serif",
    marginBottom: 16,
  },
  freeTrialText: {
    fontSize: 15,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});