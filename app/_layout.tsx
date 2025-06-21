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
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Platform } from "react-native";
import { colors } from "@/constants/colors";
import * as SplashScreen from "expo-splash-screen";
import { trpc, trpcClient } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeApp } from "firebase/app";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logStep, updateStep, logError, startTimer } from "@/utils/debugSystem";

// Prevent the splash screen from auto-hiding before we're ready
// This ensures users see the branding while the app initializes
SplashScreen.preventAutoHideAsync();

// Create React Query client for data fetching and caching
// This manages server state, caching, and synchronization
const queryClient = new QueryClient();

// Firebase configuration for Chronicle Weaver
// Uses environment variables for security and flexibility across environments
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "chronicle-weaver-460713.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "chronicle-weaver-460713",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "chronicle-weaver-460713.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "927289740022",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:927289740022:web:bcb19bdbcce16cb9227ad7",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ENMCNZZZTJ"
};

// Initialize Firebase app instance
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Initialize Firebase Analytics only on web platform when supported
// This provides user engagement and performance analytics with proper cookie domain configuration
if (app && typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        try {
          // Determine the correct cookie domain based on the current hostname
          const hostname = window.location.hostname;
          let cookieDomain = 'auto'; // Default to auto-detection
          
          if (hostname === 'chronicleweaver.com' || hostname.endsWith('.chronicleweaver.com')) {
            cookieDomain = '.chronicleweaver.com';
          } else if (hostname.includes('chronicle-weaver-460713.web.app')) {
            cookieDomain = '.chronicle-weaver-460713.web.app';
          } else if (hostname.includes('firebaseapp.com')) {
            cookieDomain = hostname;
          }
          
          // Initialize Analytics with proper configuration
          const analytics = getAnalytics(app);
          
          // Configure Google Analytics with the correct cookie domain
          // Check if gtag is available (loaded by Firebase Analytics)
          const gtag = (window as any).gtag;
          if (typeof gtag === 'function') {
            gtag('config', firebaseConfig.measurementId, {
              cookie_domain: cookieDomain,
              cookie_flags: 'SameSite=None;Secure',
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          }
          
          console.log(`Firebase Analytics initialized with cookie domain: ${cookieDomain}`);
        } catch (error) {
          console.warn('Firebase Analytics failed to initialize:', error);
        }
      }
    }).catch((error) => {
      console.warn('Analytics support check failed:', error);
    });
  }).catch((error) => {
    console.warn('Firebase Analytics import failed:', error);
  });
}

/**
 * Root Layout Component
 * 
 * Wraps the entire app with necessary providers and configurations.
 * Sets up the navigation structure and manages app initialization.
 */
export default function RootLayout() {
  const [initTimer] = useState(() => startTimer('App Initialization'));
  const [isInitialized, setIsInitialized] = useState(false);
  
  console.log('RootLayout component mounting...');
  const mountStepId = logStep('LAYOUT', 'RootLayout component mounting');
  
  useEffect(() => {
    const initStepId = logStep('LAYOUT', 'RootLayout useEffect running');
    
    // Handle splash screen hiding with platform-specific timing
    // iOS needs slightly more time for smooth transitions
    const hideSplash = async () => {
      const splashStepId = logStep('SPLASH', 'Attempting to hide splash screen');
      
      await new Promise(resolve => setTimeout(resolve, Platform.select({ 
        ios: 1200,     // iOS needs more time for smooth animations
        android: 1000, // Android can hide splash sooner
        default: 1000  // Default for web and other platforms
      })));
      
      try {
        await SplashScreen.hideAsync();
        updateStep(splashStepId, 'success', 'Splash screen hidden successfully');
      } catch (error) {
        updateStep(splashStepId, 'error', 'Failed to hide splash screen');
        logError(error as Error, 'Splash Screen Hiding', 'medium');
      }
    };
    
    const initializeApp = async () => {
      try {
        await hideSplash();
        setIsInitialized(true);
        updateStep(initStepId, 'success', 'App initialization completed');
        initTimer(); // Complete the timer
      } catch (error) {
        updateStep(initStepId, 'error', 'App initialization failed');
        logError(error as Error, 'App Initialization', 'critical');
      }
    };
    
    initializeApp();
    updateStep(mountStepId, 'success', 'RootLayout component mounted');
  }, [initTimer, mountStepId]);

  const handleGlobalError = (error: Error, errorInfo: any) => {
    logError(error, 'Global Error Boundary', 'critical');
    console.error('🚨 Global Error Boundary triggered:', error, errorInfo);
  };

  /**
   * Main App Render
   * 
   * Sets up the provider hierarchy and navigation structure:
   * 1. Global Error Boundary - Catches and handles any React errors
   * 2. tRPC Provider - Enables type-safe API calls throughout the app
   * 3. React Query Provider - Manages server state and caching
   * 4. Navigation Stack - Defines screen routing and transitions
   */
  console.log('RootLayout rendering...');
  const renderStepId = logStep('LAYOUT', 'RootLayout rendering');
  
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.background,
            paddingTop: Platform.select({ ios: 0, android: 0, default: 0 })
          }}>
            <StatusBar style="light" />
            <ErrorBoundary onError={(error, errorInfo) => logError(error, 'Navigation Error Boundary', 'high')}>
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
                }              }} 
            />
          </Stack>
        </ErrorBoundary>
        </View>
      </QueryClientProvider>
    </trpc.Provider>
  </ErrorBoundary>
  );
} // End of RootLayout component