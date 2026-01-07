/**
 * Chronicle Weaver - Redesigned Home Screen
 * 
 * Modern home screen with hero section, continue/new game CTAs,
 * saved games preview, and comprehensive feature showcase.
 * 
 * Features:
 * - Hero section with compelling tagline
 * - Quick start: "Continue Game" or "New Chronicle" prominent buttons
 * - Saved games carousel (if multiple games exist)
 * - Recent memories preview (last 3 interesting moments)
 * - Stats dashboard (total turns, eras explored, achievements)
 * - Settings gear icon → preferences panel
 * - Responsive design for all screen sizes
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography, shadows } from "../constants/colors";
import Button from "../components/Button";
import { useGameStore } from "../store/gameStore";
import { gameDataService } from "../services/gameDataService";
import { usageTracker } from "../services/usageTracker";
import { 
  Crown, 
  History, 
  Star, 
  User, 
  Settings, 
  Play, 
  BookOpen, 
  Trophy,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight
} from "lucide-react-native";

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, subscription, currentGame } = useGameStore();
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalTurns: 0,
    erasExplored: 0,
    gamesCompleted: 0,
    achievements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (user?.uid) {
        // Load saved games
        const games = await gameDataService.listGames(user.uid);
        setSavedGames(games.slice(0, 3)); // Show last 3 games
        
        // Load recent memories (mock data for now)
        setRecentMemories([
          { id: '1', title: 'Met Julius Caesar', description: 'Had a conversation with the great general', impact: 'high' },
          { id: '2', title: 'Discovered Ancient Artifact', description: 'Found a mysterious scroll in the library', impact: 'medium' },
          { id: '3', title: 'Formed Alliance', description: 'Gained the trust of a powerful merchant', impact: 'high' },
        ]);
        
        // Calculate user stats
        const totalTurns = games.reduce((sum, game) => sum + (game.turnCount || 0), 0);
        const erasExplored = new Set(games.map(game => game.era)).size;
        
        setUserStats({
          totalTurns,
          erasExplored,
          gamesCompleted: games.filter(game => game.status === 'completed').length,
          achievements: 0, // TODO: Implement achievements
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    router.push('/game/setup');
  };

  const handleContinueGame = async (gameId?: string) => {
    try {
      // Load game into store before navigation
      if (gameId) {
        const ok = await useGameStore.getState().loadGameById(gameId);
        if (ok) router.push('/game/play');
        return;
      }
      if (currentGame) {
        router.push('/game/play');
        return;
      }
      if (savedGames.length > 0) {
        const ok = await useGameStore.getState().loadGameById(savedGames[0].id);
        if (ok) router.push('/game/play');
      }
    } catch (e) {
      console.error('Failed to continue game:', e);
    }
  };

  const handleViewAllGames = () => {
    router.push('/game/saved');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    
    switch (subscription.plan) {
      case 'premium':
        return { icon: Star, color: colors.primary, text: 'Premium' };
      case 'master':
        return { icon: Crown, color: colors.gold, text: 'Master' };
      default:
        return null;
    }
  };

  const subscriptionBadge = getSubscriptionBadge();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
          <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.welcomeText}>
                {user?.email ? `Welcome back, ${user.email.split('@')[0]}` : 'Welcome to Chronicle Weaver'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {subscriptionBadge && (
            <View style={styles.subscriptionBadge}>
              <subscriptionBadge.icon size={16} color={subscriptionBadge.color} />
              <Text style={[styles.subscriptionText, { color: subscriptionBadge.color }]}>
                {subscriptionBadge.text}
              </Text>
            </View>
          )}
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary + '20', colors.background]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Crown size={48} color={colors.primary} />
              <Text style={styles.heroTitle}>Build Your Business Skills</Text>
              <Text style={styles.heroSubtitle}>
                Learn real-world business principles through AI-powered interactive scenarios
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleNewGame}
            >
              <View style={styles.actionContent}>
                <Play size={24} color={colors.background} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>New Scenario</Text>
                  <Text style={styles.actionSubtitle}>Start a new learning session</Text>
                </View>
                <ArrowRight size={20} color={colors.background} />
              </View>
            </TouchableOpacity>

            {savedGames.length > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => handleContinueGame()}
              >
                <View style={styles.actionContent}>
                  <BookOpen size={24} color={colors.primary} />
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Continue Learning</Text>
                    <Text style={styles.actionSubtitle}>
                      {savedGames[0].characterName} - {savedGames[0].era}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.primary} />
                </View>
            </TouchableOpacity>
            )}
          </View>
          </View>

        {/* Saved Games Preview */}
        {savedGames.length > 0 && (
          <View style={styles.savedGamesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Games</Text>
              <TouchableOpacity onPress={handleViewAllGames} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesCarousel}>
              {savedGames.map((game, index) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() => handleContinueGame(game.id)}
                >
                  <View style={styles.gameCardHeader}>
                    <History size={20} color={colors.primary} />
                    <Text style={styles.gameEra}>{game.era}</Text>
                  </View>
                  <Text style={styles.gameCharacter}>{game.characterName}</Text>
                  <Text style={styles.gameTurns}>Turn {game.turnCount || 0}</Text>
                  <View style={styles.gameStatus}>
                    <Clock size={12} color={colors.textSecondary} />
                    <Text style={styles.gameDate}>
                      {new Date(game.lastPlayedAt?.toDate?.() || game.lastPlayedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Memories */}
        {recentMemories.length > 0 && (
          <View style={styles.memoriesSection}>
            <Text style={styles.sectionTitle}>Recent Memories</Text>
            <View style={styles.memoriesList}>
              {recentMemories.slice(0, 3).map((memory) => (
                <View key={memory.id} style={styles.memoryItem}>
                  <View style={styles.memoryIcon}>
                    <Sparkles size={16} color={colors.memoryAccent} />
                  </View>
                  <View style={styles.memoryContent}>
                    <Text style={styles.memoryTitle}>{memory.title}</Text>
                    <Text style={styles.memoryDescription}>{memory.description}</Text>
                  </View>
                  <View style={[
                    styles.memoryImpact,
                    { backgroundColor: memory.impact === 'high' ? colors.success + '20' : colors.warning + '20' }
                  ]}>
                    <Text style={[
                      styles.memoryImpactText,
                      { color: memory.impact === 'high' ? colors.success : colors.warning }
                    ]}>
                      {memory.impact}
            </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Dashboard */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Trophy size={24} color={colors.primary} />
              <Text style={styles.statValue}>{userStats.totalTurns}</Text>
              <Text style={styles.statLabel}>Total Turns</Text>
            </View>
            <View style={styles.statCard}>
              <History size={24} color={colors.secondary} />
              <Text style={styles.statValue}>{userStats.erasExplored}</Text>
              <Text style={styles.statLabel}>Eras Explored</Text>
            </View>
            <View style={styles.statCard}>
              <BookOpen size={24} color={colors.accent} />
              <Text style={styles.statValue}>{userStats.gamesCompleted}</Text>
              <Text style={styles.statLabel}>Games Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={24} color={colors.gold} />
              <Text style={styles.statValue}>{userStats.achievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
          </View>

        {/* Feature Highlights */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Learn Through Real-World Scenarios</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <History size={20} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Business Management</Text>
                <Text style={styles.featureDescription}>
                  Experience authentic business scenarios with AI-powered guidance
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color={colors.gold} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI-Powered Scenarios</Text>
                <Text style={styles.featureDescription}>
                  Every choice creates unique, educational learning experiences
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Crown size={20} color={colors.accent} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Skill Development</Text>
                <Text style={styles.featureDescription}>
                  Build practical skills through meaningful business decisions
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  welcomeText: {
    ...typography.h3,
    color: colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  subscriptionText: {
    ...typography.caption,
    fontWeight: '600',
  },
  heroSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.medium,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  savedGamesSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  gamesCarousel: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: screenWidth * 0.7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gameEra: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  gameCharacter: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
  },
  gameTurns: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  gameStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gameDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  memoriesSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  memoriesList: {
    gap: spacing.sm,
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.memoryAccent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryContent: {
    flex: 1,
  },
  memoryTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  memoryDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  memoryImpact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  memoryImpactText: {
    ...typography.caption,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    width: (screenWidth - spacing.md * 3) / 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});