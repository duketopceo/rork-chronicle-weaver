import React, { useEffect, useState, useRef } from "react";
import { Text, StyleSheet, View, ScrollView, Animated, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Crown, Feather } from "lucide-react-native";

type NarrativeTextProps = {
  text: string;
  animated?: boolean;
  speed?: number;
  onComplete?: () => void;
};

export default function NarrativeText({
  text,
  animated = false,
  speed = 25,
  onComplete,
}: NarrativeTextProps) {
  const [displayedText, setDisplayedText] = useState(animated ? "" : text);
  const [isComplete, setIsComplete] = useState(!animated);
  const fadeAnim = new Animated.Value(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);

  // Enhanced debug logging
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = data ? `${message} | ${JSON.stringify(data)}` : message;
    console.log(`[NARRATIVE DEBUG ${timestamp}] ${logMessage}`);
    setDebugInfo(prev => [`${timestamp}: ${logMessage}`, ...prev.slice(0, 9)]);
  };

  // Skip animation and show full text
  const skipAnimation = () => {
    addDebugLog("⏭️ Animation skipped by user");
    setIsSkipped(true);
    
    // Clear any existing animation timer
    if (animationTimer) {
      clearInterval(animationTimer);
      setAnimationTimer(null);
    }
    
    // Set full text immediately
    setDisplayedText(text);
    setIsComplete(true);
    
    // Call onComplete after a short delay
    setTimeout(() => {
      addDebugLog("✅ Calling onComplete after skip");
      onComplete?.();
    }, 100);
  };

  useEffect(() => {
    addDebugLog("=== 📚 NARRATIVE TEXT COMPONENT MOUNTED ===");
    addDebugLog("Text length", text?.length || 0);
    addDebugLog("Animated", animated);
    
    // Validate text
    if (!text || text.length === 0) {
      addDebugLog("❌ NO TEXT PROVIDED!");
      setDisplayedText("No narrative text available. Please check the game state.");
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    // Reset state when text changes
    setDisplayedText(animated ? "" : text);
    setIsComplete(!animated);
    setIsSkipped(false);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (!animated) {
      addDebugLog("📖 Not animated, setting text immediately");
      setDisplayedText(text);
      setIsComplete(true);
      // Call onComplete after a short delay to ensure UI updates
      setTimeout(() => {
        addDebugLog("✅ Calling onComplete for non-animated text");
        onComplete?.();
      }, 100);
      return;
    }

    addDebugLog("🎬 Starting typewriter animation");
    let index = 0;
    
    // Clear any existing timer
    if (animationTimer) {
      clearInterval(animationTimer);
    }
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((current) => {
          const newText = current + text.charAt(index);
          if (index % 100 === 0) { // Log progress every 100 characters
            addDebugLog(`Progress: ${index + 1}/${text.length} characters`);
          }
          return newText;
        });
        
        // Add subtle haptic feedback at punctuation marks
        if (Platform.OS !== "web" && index > 0 && ['.', '!', '?'].includes(text.charAt(index))) {
          Haptics.selectionAsync();
        }
        
        index++;
      } else {
        addDebugLog("✅ Animation complete, calling onComplete");
        clearInterval(timer);
        setAnimationTimer(null);
        setIsComplete(true);
        // Ensure onComplete is called
        setTimeout(() => {
          onComplete?.();
        }, 100);
      }
    }, speed);
    
    setAnimationTimer(timer);

    return () => {
      addDebugLog("🧹 Cleaning up timer");
      if (timer) clearInterval(timer);
    };
  }, [text, animated, speed, onComplete]);

  // Ensure we have text to display
  if (!text || text.length === 0) {
    addDebugLog("❌ No text provided, showing error message");
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.textContainer}>
          <View style={styles.errorHeader}>
            <Crown size={24} color={colors.error} />
            <Text style={styles.errorTitle}>Chronicle Unavailable</Text>
          </View>
          <Text style={styles.errorText}>
            Kronos is having trouble weaving your narrative. Please check your connection and try again.
          </Text>
          
          {/* Debug info for development */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              {debugInfo.slice(0, 3).map((info, index) => (
                <Text key={index} style={styles.debugText}>{info}</Text>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.textContainer}>
        {/* Header */}
        <View style={styles.narrativeHeader}>
          <Feather size={20} color={colors.primary} />
          <Text style={styles.narrativeTitle}>Chronicle Entry</Text>
          
          {/* Skip button */}
          {animated && !isComplete && !isSkipped && (
            <TouchableOpacity style={styles.skipButton} onPress={skipAnimation}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Narrative text */}
        <Text style={styles.text}>{displayedText}</Text>
        
        {/* Animated cursor */}
        {!isComplete && animated && !isSkipped && (
          <Animated.View style={styles.cursor} />
        )}
        
        {/* Debug info for development */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Narrative Debug:</Text>
            <Text style={styles.debugText}>Text Length: {displayedText.length}/{text.length}</Text>
            <Text style={styles.debugText}>Complete: {isComplete ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Animated: {animated ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Skipped: {isSkipped ? "Yes" : "No"}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    backgroundColor: colors.narrativeBackground,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    minHeight: 200,
  },
  narrativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  narrativeTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "serif",
    flex: 1,
  },
  skipButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  text: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: colors.error,
    fontSize: 17,
    lineHeight: 28,
    textAlign: "center",
    fontStyle: "italic",
  },
  cursor: {
    width: 3,
    height: 24,
    backgroundColor: colors.primary,
    opacity: 0.8,
    marginLeft: 4,
    marginTop: 6,
  },
  debugContainer: {
    backgroundColor: colors.surface + "80",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  debugText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
    fontFamily: "monospace",
  },
});