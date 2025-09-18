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
import { View, Platform, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import * as SplashScreen from "expo-splash-screen";
import { trpc, trpcClient } from "../lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeApp, getApps } from "firebase/app";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { logStep, updateStep, logError, startTimer } from "../utils/debugSystem";
import { onAuthStateChange } from "../services/firebaseUtils";
import { useGameStore } from "../store/gameStore";
import { errorLogger } from "../utils/errorLogger";

// Prevent the splash screen from auto-hiding before we're ready
// This ensures users see the branding while the app initializes
SplashScreen.preventAutoHideAsync();

// Create React Query client for data fetching and caching
// This manages server state, caching, and synchronization
const queryClient = new QueryClient();

// Firebase configuration for Chronicle Weaver
const firebaseConfig = {
  apiKey: "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
  authDomain: "chronicle-weaver-460713.firebaseapp.com",
  databaseURL: "https://chronicle-weaver-460713-default-rtdb.firebaseio.com",
  projectId: "chronicle-weaver-460713",
  storageBucket: "chronicle-weaver-460713.firebasestorage.app",
  messagingSenderId: "927289740022",
  appId: "1:927289740022:web:bcb19bdbcce16cb9227ad7",
  measurementId: "G-ENMCNZZZTJ"
};

// Initialize Firebase app instance
let app;
try {
  // Check if Firebase app is already initialized
  const existingApp = getApps()[0];
  app = existingApp || initializeApp(firebaseConfig);
  console.log('[Firebase] ✅ Firebase app initialized successfully');
} catch (error) {
  console.error('[Firebase] ❌ Firebase initialization failed:', error);
}

// Initialize Firebase Analytics only on web platform when supported
// This provides user engagement and performance analytics with proper cookie domain configuration
// Initialize Firebase Analytics if in web environment
if (app && typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        try {
          const analytics = getAnalytics(app);
          // Determine the correct cookie domain based on the current hostname
          const hostname = window.location.hostname;
          let shouldInitializeAnalytics = true;
          let cookieDomain = 'auto';
          
          // Only enable Analytics on the custom domain to avoid cookie issues
          if (hostname === 'chronicleweaver.com' || hostname.endsWith('.chronicleweaver.com')) {
            cookieDomain = '.chronicleweaver.com';
          } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
            // Allow Analytics on localhost for development
            cookieDomain = 'none';
          } else {
            // Disable Analytics on Firebase subdomains to prevent cookie errors
            console.log('Analytics disabled on Firebase subdomain to prevent cookie issues');
            shouldInitializeAnalytics = false;
          }
          
          if (shouldInitializeAnalytics) {
            // Wait a moment for gtag to be fully loaded
            setTimeout(() => {
              try {
                // Configure gtag BEFORE initializing Analytics
                const gtag = (window as any).gtag;
                if (typeof gtag === 'function') {
                  gtag('config', firebaseConfig.measurementId, {
                    cookie_domain: cookieDomain,
                    cookie_flags: 'SameSite=None;Secure',
                    anonymize_ip: true,
                    allow_google_signals: false,
                    allow_ad_personalization_signals: false
                  });
                  
                  // Now initialize Analytics
                  const analytics = getAnalytics(app);
                  console.log(`Firebase Analytics initialized with cookie domain: ${cookieDomain}`);
                } else {
                  console.warn('gtag function not available, Analytics not configured');
                }
              } catch (error) {
                console.warn('Firebase Analytics configuration failed:', error);
              }
            }, 100); // Small delay to ensure gtag is ready
          }
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
// Add styles for debug components
const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff4757',
    zIndex: 9999,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  debugTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#ff4757',
    padding: 8,
    borderRadius: 4,
  },
  debugButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  debugTextBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  debugText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  debugSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  debugSectionTitle: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default function RootLayout() {
  const [initTimer] = useState(() => startTimer('App Initialization'));
  const [showUltraDebug, setShowUltraDebug] = useState(true);
  const setUser = useGameStore(state => state.setUser);
  
  console.log('RootLayout component mounting...');
  const mountStepId = logStep('LAYOUT', 'RootLayout component mounting');
  
  useEffect(() => {
    const initStepId = logStep('LAYOUT', 'RootLayout useEffect running');
    
    // Set up authentication state monitoring
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAnonymous: firebaseUser.isAnonymous,
          isAuthenticated: true
        });
        logStep('AUTH', `User authenticated: ${firebaseUser.isAnonymous ? 'Guest' : firebaseUser.email}`);
      } else {
        setUser(null);
        logStep('AUTH', 'User signed out');
      }
    });
      // Handle splash screen hiding with platform-specific timing
    // iOS needs slightly more time for smooth transitions
    const hideSplash = async () => {
      const splashStepId = logStep('SPLASH', 'Attempting to hide splash screen');
      
      // For web development, we don't need to hide splash screen
      if (Platform.OS === 'web') {
        updateStep(splashStepId, 'success', 'Web platform - no splash screen to hide');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, Platform.select({ 
        ios: 1200,     // iOS needs more time for smooth animations
        android: 1000, // Android can hide splash sooner
        default: 500   // Faster for other platforms
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
        updateStep(initStepId, 'success', 'App initialization completed');
        initTimer(); // Complete the timer
      } catch (error) {
        updateStep(initStepId, 'error', 'App initialization failed');
        logError(error as Error, 'App Initialization', 'critical');      }
    };
    
    initializeApp();
    updateStep(mountStepId, 'success', 'RootLayout component mounted');
    
    // Cleanup auth listener on unmount
    return () => {
      unsubscribe();
    };
  }, [initTimer, mountStepId, setUser]);

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
                  name="game/play" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
              </Stack>
              
              {/* Debug Panel (Always Visible) */}
              <View style={styles.debugContainer}>
                <View style={styles.debugHeader}>
                  <Text style={styles.debugTitle}>Debug Panel</Text>
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={() => setShowUltraDebug(!showUltraDebug)}
                  >
                    <Text style={styles.debugButtonText}>{showUltraDebug ? '▼' : '▲'}</Text>
                  </TouchableOpacity>
                </View>
                {showUltraDebug && (
                  <View style={styles.debugSection}>
                    <Text style={styles.debugText}>App Version: 1.0.0</Text>
                    <Text style={styles.debugText}>Environment: Development</Text>
                    <Text style={styles.debugText}>Firebase: Connected</Text>
                  </View>
                )}
              </View>
            </ErrorBoundary>
          </View>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
} // End of RootLayout component