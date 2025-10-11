/**
 * ROOT LAYOUT - Chronicle Weaver v2.0
 * 
 * Purpose: Main app layout with providers and global configuration
 * Features:
 * - Global state providers (Zustand stores)
 * - Theme provider for dark/light mode
 * - Authentication context
 * - Error boundary for crash protection
 * - Font loading and splash screen management
 * - Navigation structure setup
 * 
 * Dependencies:
 * - expo-router for navigation
 * - React Context for global state
 * - Error boundary component
 * - Theme provider
 * 
 * Usage: Wraps entire app, provides global context and navigation
 */

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Global providers
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { GameStateProvider } from '@/components/providers/GameStateProvider';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

// Styles
import '@/styles/global.css';

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

/**
 * Root Layout Component
 * Provides global app structure and context providers
 */
export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
    'EB-Garamond': require('@/assets/fonts/EBGaramond-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <GameStateProvider>
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="game" />
                <Stack.Screen name="settings" />
              </Stack>
            </GameStateProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}