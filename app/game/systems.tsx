import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
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
              activeTab === tab.id && { backgroundColor: tab.color + "20", borderColor: tab.color }
            ]}
            onPress={() => setActiveTab(tab.id as SystemTab)}
          >
            <tab.icon 
              size={20} 
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
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 24,
  },
  factionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.politicsAccent,
  },
  factionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  factionName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  powerIndicator: {
    backgroundColor: colors.politicsAccent + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  powerText: {
    color: colors.politicsAccent,
    fontSize: 13,
    fontWeight: "600",
  },
  factionDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  standingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  standingLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  standingValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  economicCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.economicsAccent,
  },
  economicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  economicTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  wealthValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.economicsAccent,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 16,
    color: colors.economicsAccent,
    fontWeight: "600",
  },
  tradeRoute: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  warCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.warAccent,
  },
  warHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  warTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  warValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.warAccent,
    marginBottom: 8,
  },
  warRank: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  warExperience: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  conflictItem: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  inventoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.inventoryAccent,
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemQuantity: {
    fontSize: 16,
    color: colors.inventoryAccent,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCategory: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: "capitalize",
    backgroundColor: colors.inventoryAccent + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemValue: {
    fontSize: 15,
    color: colors.economicsAccent,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
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