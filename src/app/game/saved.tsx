/**
 * Chronicle Weaver - Saved Games Screen
 * 
 * Displays user's saved games with options to continue, delete, or start new.
 * Provides robust game management with timestamps, progress indicators, and metadata.
 * 
 * Features:
 * - List all saved games with metadata
 * - Continue most recent game
 * - Delete individual games
 * - Game progress indicators
 * - Empty state handling
 * - Loading states and error handling
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../store/gameStore';
import { gameDataService } from '../../services/gameDataService';
import { colors, spacing, typography, layout, borderRadius } from '../../constants/colors';
import Button from '../../components/Button';
import ErrorBoundary from '../../components/ErrorBoundary';
import { GameListSkeleton } from '../../components/SkeletonLoader';
import { NetworkError } from '../../components/ErrorState';

interface SavedGame {
  id: string;
  era: string;
  theme: string;
  characterName: string;
  turnCount: number;
  lastPlayedAt: Date;
  createdAt: Date;
  status: string;
  currentSegment?: {
    text: string;
    choices: any[];
  };
}

export default function SavedGamesScreen() {
  const router = useRouter();
  const { user, continueMostRecentGame, deleteGameById } = useGameStore();
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.uid) {
        setError('Please sign in to view saved games');
        return;
      }

      const games = await gameDataService.listGames(user.uid);
      setSavedGames(games);
    } catch (err) {
      console.error('Error loading saved games:', err);
      setError('Failed to load saved games');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueGame = async (gameId: string) => {
    try {
      const success = await useGameStore.getState().loadGameById(gameId);
      if (success) {
        router.push('/game/play');
      } else {
        Alert.alert('Error', 'Failed to load game');
      }
    } catch (err) {
      console.error('Error continuing game:', err);
      Alert.alert('Error', 'Failed to continue game');
    }
  };

  const handleDeleteGame = (gameId: string, gameName: string) => {
    Alert.alert(
      'Delete Game',
      `Are you sure you want to delete "${gameName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteGameById(gameId);
              if (success) {
                setSavedGames(prev => prev.filter(game => game.id !== gameId));
              } else {
                Alert.alert('Error', 'Failed to delete game');
              }
            } catch (err) {
              console.error('Error deleting game:', err);
              Alert.alert('Error', 'Failed to delete game');
            }
          }
        }
      ]
    );
  };

  const handleContinueMostRecent = async () => {
    try {
      const success = await continueMostRecentGame();
      if (success) {
        router.push('/game/play');
      } else {
        Alert.alert('No Games', 'No saved games found');
      }
    } catch (err) {
      console.error('Error continuing most recent game:', err);
      Alert.alert('Error', 'Failed to continue game');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = (turnCount: number) => {
    // Estimate progress based on turn count (assuming ~20 turns for a complete story)
    return Math.min((turnCount / 20) * 100, 100);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Games</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your games...</Text>
          <GameListSkeleton />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Games</Text>
        </View>
        <NetworkError onRetry={loadSavedGames} message={error} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Games</Text>
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={() => router.push('/game/setup')}
          >
            <Text style={styles.newGameButtonText}>New Game</Text>
          </TouchableOpacity>
        </View>

        {savedGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Saved Games</Text>
            <Text style={styles.emptyDescription}>
              Start a new chronicle to begin your adventure!
            </Text>
            <Button
              title="Start New Game"
              onPress={() => router.push('/game/setup')}
              style={styles.startGameButton}
            />
          </View>
        ) : (
          <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
            {savedGames.map((game) => (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameTitle}>
                    {game.characterName}'s {game.era} Adventure
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteGame(game.id, `${game.characterName}'s Adventure`)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.gameTheme}>{game.theme}</Text>
                
                <View style={styles.gameStats}>
                  <Text style={styles.gameStat}>
                    Turn {game.turnCount} • {formatDate(game.lastPlayedAt)}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${getProgressPercentage(game.turnCount)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(getProgressPercentage(game.turnCount))}% Complete
                  </Text>
                </View>

                <View style={styles.gameActions}>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => handleContinueGame(game.id)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {savedGames.length > 0 && (
          <View style={styles.quickActions}>
            <Button
              title="Continue Most Recent"
              onPress={handleContinueMostRecent}
              style={styles.quickActionButton}
            />
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  newGameButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  newGameButtonText: {
    ...typography.button,
    color: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startGameButton: {
    backgroundColor: colors.primary,
  },
  gamesList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  gameTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameTheme: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  gameStats: {
    marginBottom: spacing.md,
  },
  gameStat: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  gameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.background,
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickActionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
