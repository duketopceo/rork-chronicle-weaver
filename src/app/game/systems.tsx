import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { Crown, DollarSign, Sword, Users, Package, TrendingUp, Shield, Coins } from "lucide-react-native";

type SystemTab = "politics" | "economics" | "war" | "inventory";

export default function SystemsScreen() {
  const router = useRouter();
  const { currentGame } = useGameStore();
  const [activeTab, setActiveTab] = useState<SystemTab>("politics");

  if (!currentGame) {
    router.back();
    return null;
  }

  const { worldSystems, character } = currentGame;

  const renderPoliticsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Political Landscape</Text>
      {worldSystems.politics.length > 0 ? (
        worldSystems.politics.map((faction) => (
          <View key={faction.id} style={styles.factionCard}>
            <View style={styles.factionHeader}>
              <Text style={styles.factionName}>{faction.name}</Text>
              <View style={styles.powerIndicator}>
                <Text style={styles.powerText}>Power: {faction.power}/10</Text>
              </View>
            </View>
            <Text style={styles.factionDescription}>{faction.description}</Text>
            <View style={styles.standingContainer}>
              <Text style={styles.standingLabel}>Your Standing:</Text>
              <Text style={[
                styles.standingValue,
                { color: faction.playerStanding >= 0 ? colors.success : colors.error }
              ]}>
                {faction.playerStanding > 0 ? '+' : ''}{faction.playerStanding}/10
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Crown size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Political Factions</Text>
          <Text style={styles.emptyText}>Political systems will emerge as your chronicle unfolds</Text>
        </View>
      )}
    </View>
  );

  const renderEconomicsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Economic Systems</Text>
      
      <View style={styles.economicCard}>
        <View style={styles.economicHeader}>
          <Coins size={24} color={colors.economicsAccent} />
          <Text style={styles.economicTitle}>Personal Wealth</Text>
        </View>
        <Text style={styles.wealthValue}>
          {worldSystems.economics.playerWealth} {worldSystems.economics.currency}
        </Text>
      </View>

      {Object.keys(worldSystems.economics.marketPrices).length > 0 && (
        <View style={styles.economicCard}>
          <View style={styles.economicHeader}>
            <TrendingUp size={24} color={colors.economicsAccent} />
            <Text style={styles.economicTitle}>Market Prices</Text>
          </View>
          {Object.entries(worldSystems.economics.marketPrices).map(([item, price]) => (
            <View key={item} style={styles.priceRow}>
              <Text style={styles.itemName}>{item}</Text>
              <Text style={styles.itemPrice}>{price} {worldSystems.economics.currency}</Text>
            </View>
          ))}
        </View>
      )}

      {worldSystems.economics.tradeRoutes.length > 0 && (
        <View style={styles.economicCard}>
          <View style={styles.economicHeader}>
            <Package size={24} color={colors.economicsAccent} />
            <Text style={styles.economicTitle}>Trade Routes</Text>
          </View>
          {worldSystems.economics.tradeRoutes.map((route, index) => (
            <Text key={index} style={styles.tradeRoute}>• {route}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderWarTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Military Affairs</Text>
      
      <View style={styles.warCard}>
        <View style={styles.warHeader}>
          <Shield size={24} color={colors.warAccent} />
          <Text style={styles.warTitle}>Your Role</Text>
        </View>
        <Text style={styles.warValue}>{worldSystems.war.playerRole}</Text>
        {worldSystems.war.militaryRank && (
          <Text style={styles.warRank}>Rank: {worldSystems.war.militaryRank}</Text>
        )}
        <Text style={styles.warExperience}>
          Battle Experience: {worldSystems.war.battleExperience}
        </Text>
      </View>

      {worldSystems.war.activeConflicts.length > 0 ? (
        <View style={styles.warCard}>
          <View style={styles.warHeader}>
            <Sword size={24} color={colors.warAccent} />
            <Text style={styles.warTitle}>Active Conflicts</Text>
          </View>
          {worldSystems.war.activeConflicts.map((conflict, index) => (
            <Text key={index} style={styles.conflictItem}>• {conflict}</Text>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Sword size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Peaceful Times</Text>
          <Text style={styles.emptyText}>No active military conflicts at the moment</Text>
        </View>
      )}
    </View>
  );

  const renderInventoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Personal Inventory</Text>
      {character.inventory.length > 0 ? (
        character.inventory.map((item) => (
          <View key={item.id} style={styles.inventoryCard}>
            <View style={styles.inventoryHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemValue}>
                {item.value} {worldSystems.economics.currency}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Package size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Empty Inventory</Text>
          <Text style={styles.emptyText}>Items will appear here as you acquire them</Text>
        </View>
      )}
    </View>
  );

  const tabs = [
    { id: "politics", label: "Politics", icon: Crown, color: colors.politicsAccent },
    { id: "economics", label: "Economics", icon: DollarSign, color: colors.economicsAccent },
    { id: "war", label: "Military", icon: Sword, color: colors.warAccent },
    { id: "inventory", label: "Inventory", icon: Package, color: colors.inventoryAccent },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>World Systems</Text>
        <Text style={styles.subtitle}>
          The living systems that shape your chronicle
        </Text>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: tab.color + "25", borderColor: tab.color }
            ]}
            onPress={() => setActiveTab(tab.id as SystemTab)}
          >
            <tab.icon 
              size={Platform.select({ ios: 22, android: 20, default: 20 })} 
              color={activeTab === tab.id ? tab.color : colors.textMuted} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.id ? tab.color : colors.textMuted }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "politics" && renderPoliticsTab()}
        {activeTab === "economics" && renderEconomicsTab()}
        {activeTab === "war" && renderWarTab()}
        {activeTab === "inventory" && renderInventoryTab()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Return to Chronicle"
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
    padding: Platform.select({ ios: 32, android: 28, default: 28 }),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: Platform.select({ ios: 36, android: 32, default: 32 }),
    fontWeight: "800",
    color: colors.text,
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  subtitle: {
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    color: colors.textSecondary,
    lineHeight: Platform.select({ ios: 30, android: 28, default: 28 }),
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: Platform.select({ ios: 24, android: 20, default: 20 }),
    paddingVertical: Platform.select({ ios: 20, android: 16, default: 16 }),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Platform.select({ ios: 16, android: 12, default: 12 }),
    paddingHorizontal: Platform.select({ ios: 12, android: 8, default: 8 }),
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: "transparent",
    gap: Platform.select({ ios: 10, android: 8, default: 8 }),
  },
  tabText: {
    fontSize: Platform.select({ ios: 16, android: 14, default: 14 }),
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Platform.select({ ios: 28, android: 24, default: 24 }),
  },
  sectionTitle: {
    fontSize: Platform.select({ ios: 28, android: 24, default: 24 }),
    fontWeight: "800",
    color: colors.text,
    marginBottom: Platform.select({ ios: 28, android: 24, default: 24 }),
  },
  factionCard: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: Platform.select({ ios: 5, android: 4, default: 4 }),
    borderLeftColor: colors.politicsAccent,
  },
  factionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  factionName: {
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "800",
    color: colors.text,
    flex: 1,
  },
  powerIndicator: {
    backgroundColor: colors.politicsAccent + "25",
    paddingHorizontal: Platform.select({ ios: 16, android: 12, default: 12 }),
    paddingVertical: Platform.select({ ios: 8, android: 6, default: 6 }),
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  powerText: {
    color: colors.politicsAccent,
    fontSize: Platform.select({ ios: 15, android: 13, default: 13 }),
    fontWeight: "700",
  },
  factionDescription: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.textSecondary,
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  standingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  standingLabel: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.textSecondary,
    fontWeight: "600",
  },
  standingValue: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    fontWeight: "800",
  },
  economicCard: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: Platform.select({ ios: 5, android: 4, default: 4 }),
    borderLeftColor: colors.economicsAccent,
  },
  economicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    gap: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  economicTitle: {
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "800",
    color: colors.text,
  },
  wealthValue: {
    fontSize: Platform.select({ ios: 28, android: 24, default: 24 }),
    fontWeight: "800",
    color: colors.economicsAccent,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 8 }),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.text,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.economicsAccent,
    fontWeight: "700",
  },
  tradeRoute: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.textSecondary,
    marginBottom: Platform.select({ ios: 12, android: 8, default: 8 }),
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
  },
  warCard: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: Platform.select({ ios: 5, android: 4, default: 4 }),
    borderLeftColor: colors.warAccent,
  },
  warHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    gap: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  warTitle: {
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "800",
    color: colors.text,
  },
  warValue: {
    fontSize: Platform.select({ ios: 24, android: 20, default: 20 }),
    fontWeight: "800",
    color: colors.warAccent,
    marginBottom: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  warRank: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.textSecondary,
    marginBottom: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  warExperience: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.textSecondary,
  },
  conflictItem: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.textSecondary,
    marginBottom: Platform.select({ ios: 12, android: 8, default: 8 }),
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
  },
  inventoryCard: {
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 24, android: 20, default: 20 }),
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: Platform.select({ ios: 5, android: 4, default: 4 }),
    borderLeftColor: colors.inventoryAccent,
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  itemQuantity: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.inventoryAccent,
    fontWeight: "700",
  },
  itemDescription: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.textSecondary,
    lineHeight: Platform.select({ ios: 26, android: 24, default: 24 }),
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCategory: {
    fontSize: Platform.select({ ios: 15, android: 13, default: 13 }),
    color: colors.textMuted,
    textTransform: "capitalize",
    backgroundColor: colors.inventoryAccent + "25",
    paddingHorizontal: Platform.select({ ios: 12, android: 8, default: 8 }),
    paddingVertical: Platform.select({ ios: 6, android: 4, default: 4 }),
    borderRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  itemValue: {
    fontSize: Platform.select({ ios: 17, android: 15, default: 15 }),
    color: colors.economicsAccent,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: Platform.select({ ios: 60, android: 48, default: 48 }),
    backgroundColor: colors.surface,
    borderRadius: Platform.select({ ios: 24, android: 20, default: 20 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: Platform.select({ ios: 24, android: 20, default: 20 }),
    fontWeight: "700",
    color: colors.text,
    marginTop: Platform.select({ ios: 24, android: 20, default: 20 }),
    marginBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  emptyText: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: Platform.select({ ios: 28, android: 26, default: 26 }),
  },
  footer: {
    padding: Platform.select({ ios: 32, android: 28, default: 28 }),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    width: "100%",
  },
});