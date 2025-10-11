/**
 * HOME SCREEN - Chronicle Weaver v2.0
 * 
 * Purpose: Main landing page and navigation hub
 * Features:
 * - Welcome message and app branding
 * - Quick access to start new game
 * - Continue existing game button
 * - Settings and profile access
 * - Recent games list
 * - Achievement/progress overview
 * 
 * Navigation Routes:
 * - /game/setup (new game)
 * - /game/continue (existing game)
 * - /settings (app settings)
 * - /auth (login/signup)
 * 
 * State Dependencies:
 * - User authentication status
 * - Recent games from game store
 * - User preferences
 * 
 * Usage: Entry point for authenticated and new users
 */

import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useTheme } from '@/hooks/useTheme';

// Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RecentGamesList } from '@/components/game/RecentGamesList';
import { WelcomeMessage } from '@/components/layout/WelcomeMessage';

/**
 * Home Screen Component
 * Main app entry point and navigation hub
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { recentGames, hasActiveGame } = useGameStore();
  const { theme } = useTheme();

  // Navigation handlers
  const handleNewGame = () => {
    router.push('/game/setup');
  };

  const handleContinueGame = () => {
    router.push('/game/continue');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleAuth = () => {
    router.push('/auth');
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header Section */}
      <View className="mb-8">
        <WelcomeMessage user={user} />
        
        {!isAuthenticated && (
          <Card className="mt-4 p-4 bg-blue-900/20 border-blue-500/30">
            <Text className="text-blue-300 text-center mb-2">
              Sign in to save your progress and access premium features
            </Text>
            <Button 
              variant="outline" 
              onPress={handleAuth}
              className="border-blue-500"
            >
              Sign In / Sign Up
            </Button>
          </Card>
        )}
      </View>

      {/* Main Actions */}
      <View className="mb-8 space-y-4">
        <Button 
          onPress={handleNewGame}
          className="bg-amber-600 py-4"
          size="large"
        >
          Start New Chronicle
        </Button>

        {hasActiveGame && (
          <Button 
            onPress={handleContinueGame}
            variant="outline"
            className="border-amber-600 py-4"
            size="large"
          >
            Continue Current Story
          </Button>
        )}
      </View>

      {/* Recent Games Section */}
      {recentGames.length > 0 && (
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Recent Chronicles
          </Text>
          <RecentGamesList games={recentGames} />
        </View>
      )}

      {/* Quick Access Section */}
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">
          Quick Access
        </Text>
        <View className="grid grid-cols-2 gap-4">
          <Pressable 
            onPress={() => router.push('/game/library')}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <Text className="text-white font-semibold">Chronicle Library</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Browse saved stories
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={handleSettings}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <Text className="text-white font-semibold">Settings</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Customize your experience
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-8 pt-8 border-t border-gray-700">
        <Text className="text-gray-500 text-center text-sm">
          Chronicle Weaver v2.0 - Weave your own historical tales
        </Text>
      </View>
    </ScrollView>
  );
}