/**
 * Root Layout Component for Chronicle Weaver
 * 
 * This is the main entry point and layout wrapper for the entire application.
 * It sets up essential providers, configurations, and global state management
 * required throughout the app.
 * 
 * Key Responsibilities:
 * - Initialize Firebase for authentication and data persistence
 * - Set up tRPC client for type-safe API communication
 * - Configure React Query for data fetching and caching
 * - Manage splash screen display and hiding
 * - Provide navigation structure with Expo Router
 * 
 * Architecture:
 * - Uses Expo Router for file-based navigation
 * - Integrates Firebase for backend services
 * - Implements tRPC for end-to-end type safety
 * - Manages global app state and providers
 */

import React from "react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Platform } from "react-native";
import { colors } from "@/constants/colors";
import * as SplashScreen from "expo-splash-screen";
import { trpc, trpcClient } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeApp } from "firebase/app";
import Constants from "expo-constants";

// Prevent the splash screen from auto-hiding before we're ready
// This ensures users see the branding while the app initializes
SplashScreen.preventAutoHideAsync();

// Create React Query client for data fetching and caching
// This manages server state, caching, and synchronization
const queryClient = new QueryClient();

// Firebase configuration for Chronicle Weaver
// Uses environment variables for security and flexibility across environments
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "chronicle-weaver-460713.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "chronicle-weaver-460713",
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "chronicle-weaver-460713.appspot.com",
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "927289740022",
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID || "1:927289740022:web:bcb19bdbcce16cb9227ad7",
  measurementId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ENMCNZZZTJ"
};

// Initialize Firebase app instance
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics only on web platform when supported
// This provides user engagement and performance analytics
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    });
  });
}

/**
 * Root Layout Component
 * 
 * Wraps the entire app with necessary providers and configurations.
 * Sets up the navigation structure and manages app initialization.
 */
export default function RootLayout() {
  useEffect(() => {
    // Handle splash screen hiding with platform-specific timing
    // iOS needs slightly more time for smooth transitions
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, Platform.select({ 
        ios: 1200,     // iOS needs more time for smooth animations
        android: 1000, // Android can hide splash sooner
        default: 1000  // Default for web and other platforms
      })));
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);  /**
   * Main App Render
   * 
   * Sets up the provider hierarchy and navigation structure:
   * 1. tRPC Provider - Enables type-safe API calls throughout the app
   * 2. React Query Provider - Manages server state and caching
   * 3. Navigation Stack - Defines screen routing and transitions
   */
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <View style={{ 
          flex: 1, 
          backgroundColor: colors.background,
          paddingTop: Platform.select({ ios: 0, android: 0, default: 0 })
        }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
                fontFamily: Platform.select({
                  ios: "Georgia",
                  android: "serif",
                  default: "serif",
                }),
              },
              contentStyle: {
                backgroundColor: colors.background,
              },
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen 
              name="game/setup" 
              options={{ 
                title: "Weave Your Chronicle",
                headerTitleStyle: {
                  fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
                  fontWeight: "700",
                }
              }} 
            />
            <Stack.Screen 
              name="game/play" 
              options={{ 
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="game/character" 
              options={{ 
                title: "Character",
                presentation: "modal",
                headerTitleStyle: {
                  fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
                }
              }} 
            />
            <Stack.Screen 
              name="game/memories" 
              options={{ 
                title: "Chronicle Memories",
                presentation: "modal",
                headerTitleStyle: {
                  fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
                }
              }} 
            />
            <Stack.Screen 
              name="game/lore" 
              options={{ 
                title: "Chronicle Lore",
                presentation: "modal",
                headerTitleStyle: {
                  fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
                }
              }} 
            />
            <Stack.Screen 
              name="game/systems" 
              options={{ 
                title: "World Systems",
                presentation: "modal",
                headerTitleStyle: {
                  fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
                }
              }} 
            />
            <Stack.Screen 
              name="game/kronos" 
              options={{ 
                title: "Speak with Kronos",
                presentation: "modal",
                headerTitleStyle: {
                  fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
                }
              }} 
            />
          </Stack>
        </View>
      </QueryClientProvider>
    </trpc.Provider>
  );
} // End of RootLayout component