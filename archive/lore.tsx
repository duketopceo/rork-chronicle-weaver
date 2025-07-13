/**
 * Lore and Knowledge Screen
 * 
 * Historical knowledge base and discovered lore repository.
 * 
 * Purpose: Displays accumulated knowledge and historical discoveries.
 * 
 * References:
 * - File: src/app/game/lore.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../store/gameStore";
import { colors } from "../../constants/colors";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import { LoreEntry } from "../../types/game";
import { BookOpen, User, MapPin, Calendar, Filter } from "lucide-react-native";

type CategoryFilter = "all" | "historical" | "character" | "location" | "event" | "politics" | "economics" | "war" | "culture" | "technology";

export default function LoreScreen() {
  const router = useRouter();
  const { currentGame } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedLore, setSelectedLore] = useState<LoreEntry | null>(null);

  if (!currentGame) {
    router.back();
    return null;
  }

  const { lore } = currentGame;

  const filteredLore = selectedCategory === "all" 
    ? lore 
    : lore.filter(item => item.category === selectedCategory);

  const handleCategorySelect = (category: CategoryFilter) => {
    setSelectedCategory(category);
    setSelectedLore(null);
  };

  const handleLoreSelect = (loreItem: LoreEntry) => {
    setSelectedLore(loreItem);
  };

  const handleBack = () => {
    if (selectedLore) {
      setSelectedLore(null);
    } else {
      router.back();
    }
  };

  const renderCategoryIcon = (category: CategoryFilter, isActive: boolean = false) => {
    const color = isActive ? colors.text : colors.primary;
    switch (category) {
      case "historical":
        return <BookOpen size={22} color={color} />;
      case "character":
        return <User size={22} color={color} />;
      case "location":
        return <MapPin size={22} color={color} />;
      case "event":
        return <Calendar size={22} color={color} />;
      default:
        return <Filter size={22} color={color} />;
    }
  };

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === "all") return lore.length;
    return lore.filter(item => item.category === category).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Story Lore</Text>
        <Text style={styles.subtitle}>
          Knowledge and discoveries from your journey through {currentGame.era}
        </Text>
      </View>

      {!selectedLore ? (
        <>
          <View style={styles.categoryFilters}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "all" && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategorySelect("all")}
            >
              {renderCategoryIcon("all", selectedCategory === "all")}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "all" && styles.categoryTextActive,
                ]}
              >
                All ({getCategoryCount("all")})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "historical" && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategorySelect("historical")}
            >
              {renderCategoryIcon("historical", selectedCategory === "historical")}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "historical" && styles.categoryTextActive,
                ]}
              >
                Historical ({getCategoryCount("historical")})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "character" && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategorySelect("character")}
            >
              {renderCategoryIcon("character", selectedCategory === "character")}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "character" && styles.categoryTextActive,
                ]}
              >
                Characters ({getCategoryCount("character")})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "location" && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategorySelect("location")}
            >
              {renderCategoryIcon("location", selectedCategory === "location")}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "location" && styles.categoryTextActive,
                ]}
              >
                Locations ({getCategoryCount("location")})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "event" && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategorySelect("event")}
            >
              {renderCategoryIcon("event", selectedCategory === "event")}
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "event" && styles.categoryTextActive,
                ]}
              >
                Events ({getCategoryCount("event")})
              </Text>
            </TouchableOpacity>
          </View>

          {filteredLore.length > 0 ? (
            <FlatList
              data={filteredLore}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.loreItem}
                  onPress={() => handleLoreSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.loreHeader}>
                    <View style={styles.loreTitle}>
                      {renderCategoryIcon(item.category)}
                      <Text style={styles.loreTitleText}>{item.title}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: `${colors.loreAccent}30` }]}>
                      <Text style={[styles.categoryBadgeText, { color: colors.loreAccent }]}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.lorePreview} numberOfLines={2}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <BookOpen size={56} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Entries Found</Text>
              <Text style={styles.emptyText}>
                {selectedCategory === "all" 
                  ? "Continue your story to discover knowledge and lore."
                  : `No ${selectedCategory} entries discovered yet. Explore more to uncover knowledge in this category.`
                }
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.loreDetailContainer}>
          <View style={styles.loreDetailHeader}>
            <View style={styles.loreDetailTitleContainer}>
              {renderCategoryIcon(selectedLore.category)}
              <Text style={styles.loreDetailTitle}>{selectedLore.title}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: `${colors.loreAccent}30` }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.loreAccent }]}>
                {selectedLore.category}
              </Text>
            </View>
          </View>
          <View style={styles.loreDetailContentContainer}>
            <Text style={styles.loreDetailContent}>{selectedLore.content}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={selectedLore ? "Back to Lore List" : "Return to Story"}
          onPress={handleBack}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    maxWidth: 800,
    marginHorizontal: "auto",
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
  categoryFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.background,
  },
  listContent: {
    padding: 24,
  },
  loreItem: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.loreAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loreTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  loreTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  lorePreview: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 340,
  },
  loreDetailContainer: {
    flex: 1,
    padding: 28,
  },
  loreDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  loreDetailTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    marginRight: 20,
  },
  loreDetailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  loreDetailContentContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loreDetailContent: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 28,
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