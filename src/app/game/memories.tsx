import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import MemoryList from "@/components/MemoryList";
import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";

export default function MemoriesScreen() {
  const router = useRouter();
  const { currentGame } = useGameStore();

  if (!currentGame) {
    router.back();
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Clock size={32} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Story Memories</Text>
          <Text style={styles.subtitle}>
            A chronicle of your journey through {currentGame.era}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <MemoryList memories={currentGame.memories} />
      </View>

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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerIcon: {
    marginRight: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 24,
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