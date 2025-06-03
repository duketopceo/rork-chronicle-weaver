import React, { useEffect, useState, useRef } from "react";
import { Text, StyleSheet, View, Animated, TouchableOpacity, Platform } from "react-native";
import { colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";
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
  speed = 1,
  onComplete,
}: NarrativeTextProps) {
  const [displayedText, setDisplayedText] = useState(animated ? "" : text);
  const [isComplete, setIsComplete] = useState(!animated);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(animated);
  const animationRef = useRef({ charIndex: 0 });

  // Skip animation and show full text
  const skipAnimation = () => {
    if (animationTimer) {
      clearInterval(animationTimer);
      setAnimationTimer(null);
    }
    
    setDisplayedText(text);
    setIsComplete(true);
    setIsAnimating(false);
    
    // Provide haptic feedback when skipping
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Call onComplete after a short delay
    setTimeout(() => {
      onComplete?.();
    }, 50);
  };

  useEffect(() => {
    // Validate text
    if (!text || text.length === 0) {
      setDisplayedText("No narrative text available. Please check the game state.");
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    // Reset state when text changes
    setDisplayedText(animated ? "" : text);
    setIsComplete(!animated);
    setIsSkipped(false);
    setIsAnimating(animated);
    animationRef.current.charIndex = 0;
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Platform.select({ ios: 400, android: 300, default: 300 }),
      useNativeDriver: true,
    }).start();

    if (!animated) {
      setDisplayedText(text);
      setIsComplete(true);
      setTimeout(() => {
        onComplete?.();
      }, 50);
      return;
    }

    // Clear any existing timer
    if (animationTimer) {
      clearInterval(animationTimer);
    }
    
    // Improved animation logic with larger batch updates for much faster appearance
    const batchSize = Platform.select({ ios: 60, android: 50, default: 50 }); // More characters per frame on iOS
    const timer = setInterval(() => {
      if (animationRef.current.charIndex < text.length) {
        setDisplayedText((current) => {
          let newText = current;
          // Process multiple characters per frame for smoother animation
          for (let i = 0; i < batchSize; i++) {
            if (animationRef.current.charIndex < text.length) {
              newText += text.charAt(animationRef.current.charIndex);
              
              // Add subtle haptic feedback at punctuation marks (less frequent)
              if (Platform.OS !== "web" && 
                  ['.', '!', '?'].includes(text.charAt(animationRef.current.charIndex)) && 
                  Math.random() > 0.95) { // Only trigger haptics 5% of the time for punctuation
                Haptics.selectionAsync();
              }
              
              animationRef.current.charIndex++;
            }
          }
          return newText;
        });
      } else {
        clearInterval(timer);
        setAnimationTimer(null);
        setIsComplete(true);
        setIsAnimating(false);
        setTimeout(() => {
          onComplete?.();
        }, 50);
      }
    }, speed);
    
    setAnimationTimer(timer);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [text, animated, speed, onComplete]);

  // Ensure we have text to display
  if (!text || text.length === 0) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.textContainer}>
          <View style={styles.errorHeader}>
            <Crown size={Platform.select({ ios: 28, android: 24, default: 24 })} color={colors.error} />
            <Text style={styles.errorTitle}>Chronicle Unavailable</Text>
          </View>
          <Text style={styles.errorText}>
            Kronos is having trouble weaving your narrative. Please check your connection and try again.
          </Text>
          
          {/* Debug info for development */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>Text prop is empty or undefined</Text>
              <TouchableOpacity style={styles.debugButton} onPress={() => console.log("Force re-render")}>
                <Text style={styles.debugButtonText}>🔄 Force Re-render</Text>
              </TouchableOpacity>
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
          <Feather size={Platform.select({ ios: 24, android: 20, default: 20 })} color={colors.primary} />
          <Text style={styles.narrativeTitle}>Chronicle Entry</Text>
          
          {/* Skip button - more prominent */}
          {animated && !isComplete && !isSkipped && (
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={skipAnimation}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Narrative text with improved paragraph spacing */}
        <Text style={styles.text}>
          {displayedText}
          {/* Animated cursor that blinks */}
          {isAnimating && !isComplete && !isSkipped && (
            <Animated.Text 
              style={[
                styles.cursor,
                {opacity: fadeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0]
                })}
              ]}
            >|</Animated.Text>
          )}
        </Text>
        
        {/* Debug info for development */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Narrative Debug:</Text>
            <Text style={styles.debugText}>Text Length: {displayedText.length}/{text.length}</Text>
            <Text style={styles.debugText}>Complete: {isComplete ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Animated: {animated ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Skipped: {isSkipped ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Speed: {speed}ms</Text>
            <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
            
            <View style={styles.debugButtonsRow}>
              <TouchableOpacity 
                style={[styles.debugButton, styles.debugButtonSmall]} 
                onPress={() => {
                  setDisplayedText(text);
                  setIsComplete(true);
                  onComplete?.();
                }}
              >
                <Text style={styles.debugButtonText}>Complete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.debugButton, styles.debugButtonSmall]} 
                onPress={skipAnimation}
              >
                <Text style={styles.debugButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  textContainer: {
    backgroundColor: colors.narrativeBackground,
    borderRadius: Platform.select({ ios: 20, android: 16, default: 16 }),
    padding: Platform.select({ ios: 28, android: 24, default: 24 }),
    margin: Platform.select({ ios: 20, android: 16, default: 16 }),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: Platform.select({ ios: 6, android: 4, default: 4 }) },
    shadowOpacity: 0.15,
    shadowRadius: Platform.select({ ios: 10, android: 8, default: 8 }),
    elevation: 4,
    borderLeftWidth: Platform.select({ ios: 4, android: 3, default: 3 }),
    borderLeftColor: colors.primary,
    minHeight: Platform.select({ ios: 240, android: 200, default: 200 }),
  },
  narrativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 24, android: 20, default: 20 }),
    gap: Platform.select({ ios: 12, android: 8, default: 8 }),
    paddingBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  narrativeTitle: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 18, android: 16, default: 16 }),
    fontWeight: "600",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
    flex: 1,
  },
  skipButton: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: Platform.select({ ios: 18, android: 14, default: 14 }),
    paddingVertical: Platform.select({ ios: 10, android: 8, default: 8 }),
    borderRadius: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 15, android: 13, default: 13 }),
    fontWeight: "600",
  },
  text: {
    color: colors.text,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    lineHeight: Platform.select({ ios: 32, android: 30, default: 30 }),
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
    textAlign: "left",
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.select({ ios: 20, android: 16, default: 16 }),
    gap: Platform.select({ ios: 16, android: 12, default: 12 }),
  },
  errorTitle: {
    color: colors.error,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "600",
  },
  errorText: {
    color: colors.error,
    fontSize: Platform.select({ ios: 18, android: 17, default: 17 }),
    lineHeight: Platform.select({ ios: 30, android: 28, default: 28 }),
    textAlign: "center",
    fontStyle: "italic",
  },
  cursor: {
    color: colors.primary,
    fontSize: Platform.select({ ios: 20, android: 18, default: 18 }),
    fontWeight: "bold",
  },
  debugContainer: {
    backgroundColor: colors.surface + "80",
    borderRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
    padding: Platform.select({ ios: 16, android: 12, default: 12 }),
    marginTop: Platform.select({ ios: 28, android: 24, default: 24 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugTitle: {
    color: colors.text,
    fontSize: Platform.select({ ios: 14, android: 12, default: 12 }),
    fontWeight: "700",
    marginBottom: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  debugText: {
    color: colors.textSecondary,
    fontSize: Platform.select({ ios: 12, android: 11, default: 11 }),
    marginBottom: Platform.select({ ios: 3, android: 2, default: 2 }),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  debugButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Platform.select({ ios: 12, android: 8, default: 8 }),
    gap: Platform.select({ ios: 12, android: 8, default: 8 }),
  },
  debugButton: {
    backgroundColor: colors.primary,
    borderRadius: Platform.select({ ios: 8, android: 6, default: 6 }),
    padding: Platform.select({ ios: 12, android: 8, default: 8 }),
    marginTop: Platform.select({ ios: 12, android: 8, default: 8 }),
    alignItems: "center",
  },
  debugButtonSmall: {
    flex: 1,
    paddingVertical: Platform.select({ ios: 8, android: 6, default: 6 }),
  },
  debugButtonText: {
    color: colors.background,
    fontSize: Platform.select({ ios: 12, android: 11, default: 11 }),
    fontWeight: "600",
  },
});