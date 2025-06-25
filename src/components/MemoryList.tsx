/**
 * Memory List Component
 * 
 * Display component for player memories and historical choices.
 * 
 * Purpose: Shows chronological list of player decisions and their consequences.
 * 
 * References:
 * - File: src/components/MemoryList.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Memory } from "../types/game";
import { colors } from "../constants/colors";
import { formatDate } from "../utils/dateUtils";
import { Clock, ChevronRight } from "lucide-react-native";

type MemoryListProps = {
  memories: Memory[];
  limit?: number;
  onMemoryPress?: (memory: Memory) => void;
};

export default function MemoryList({ memories, limit, onMemoryPress }: MemoryListProps) {
  const displayMemories = limit ? memories.slice(0, limit) : memories;

  if (displayMemories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={40} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No Memories Yet</Text>
        <Text style={styles.emptyText}>Your story memories will appear here as you make choices</Text>
      </View>
    );
  }

  const renderMemoryItem = ({ item, index }: { item: Memory; index: number }) => {
    const Container = onMemoryPress ? TouchableOpacity : View;
    const containerProps = onMemoryPress ? { 
      onPress: () => onMemoryPress(item),
      activeOpacity: 0.7 
    } : {};

    return (
      <Container style={styles.memoryItem} {...containerProps}>
        <View style={styles.memoryHeader}>
          <View style={styles.memoryTitleContainer}>
            <View style={[styles.memoryIndex, { backgroundColor: colors.memoryAccent }]}>
              <Text style={styles.memoryIndexText}>{index + 1}</Text>
            </View>
            <Text style={styles.memoryTitle}>{item.title}</Text>
          </View>
          <View style={styles.memoryMeta}>
            <Text style={styles.memoryDate}>{formatDate(item.timestamp)}</Text>
            {onMemoryPress && <ChevronRight size={18} color={colors.textMuted} />}
          </View>
        </View>
        <Text style={styles.memoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </Container>
    );
  };

  return (
    <FlatList
      data={displayMemories}
      keyExtractor={(item) => item.id}
      renderItem={renderMemoryItem}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  memoryItem: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.memoryAccent,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.memoryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  memoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  memoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  memoryIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  memoryIndexText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  memoryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  memoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memoryDate: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  memoryDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  separator: {
    height: 20,
  },
});