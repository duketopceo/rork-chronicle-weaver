import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { colors } from "@/constants/colors";
import * as SplashScreen from "expo-splash-screen";
import { trpc, trpcClient } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after a delay
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: "bold",
              },
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen 
              name="game/setup" 
              options={{ 
                title: "Weave Your Chronicle",
                headerBackTitle: "Back"
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
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="game/memories" 
              options={{ 
                title: "Chronicle Memories",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="game/lore" 
              options={{ 
                title: "Chronicle Lore",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="game/systems" 
              options={{ 
                title: "World Systems",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="game/kronos" 
              options={{ 
                title: "Speak with Kronos",
                presentation: "modal"
              }} 
            />
          </Stack>
        </View>
      </QueryClientProvider>
    </trpc.Provider>
  );
}