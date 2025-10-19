/**
 * Chronicle Weaver - Success Animation Component
 * 
 * Provides animated success feedback for user actions.
 * Used for game saves, achievements, and positive interactions.
 * 
 * Features:
 * - Animated checkmark or success icon
 * - Confetti or particle effects
 * - Customizable duration and style
 * - Accessibility support
 * 
 * Last Updated: January 2025
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { CheckCircle, Star, Crown } from 'lucide-react-native';
import { colors, spacing, typography } from '../constants/colors';

interface SuccessAnimationProps {
  visible: boolean;
  message?: string;
  type?: 'save' | 'achievement' | 'levelup' | 'custom';
  duration?: number;
  onComplete?: () => void;
  style?: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SuccessAnimation({
  visible,
  message = 'Success!',
  type = 'save',
  duration = 2000,
  onComplete,
  style
}: SuccessAnimationProps) {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const confettiAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onComplete]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'save':
        return <CheckCircle size={64} color={colors.accent.success} />;
      case 'achievement':
        return <Star size={64} color={colors.accent.warning} />;
      case 'levelup':
        return <Crown size={64} color={colors.accent.primary} />;
      default:
        return <CheckCircle size={64} color={colors.accent.success} />;
    }
  };

  const getConfettiParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 360;
      const distance = 100 + Math.random() * 50;
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.confettiParticle,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { scale: confettiAnimation },
                { rotate: `${angle}deg` },
              ],
              opacity: confettiAnimation,
            },
          ]}
        />
      );
    }
    return particles;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnimation,
          transform: [{ scale: scaleAnimation }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
      
      {/* Confetti effect */}
      <View style={styles.confettiContainer}>
        {getConfettiParticles()}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  message: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: colors.accent.primary,
    borderRadius: 4,
  },
});

// Predefined success animations for common use cases
export const SaveSuccessAnimation = ({ visible, onComplete }: { visible: boolean; onComplete?: () => void }) => (
  <SuccessAnimation
    visible={visible}
    message="Game Saved!"
    type="save"
    onComplete={onComplete}
  />
);

export const AchievementAnimation = ({ visible, message, onComplete }: { visible: boolean; message: string; onComplete?: () => void }) => (
  <SuccessAnimation
    visible={visible}
    message={message}
    type="achievement"
    onComplete={onComplete}
  />
);

export const LevelUpAnimation = ({ visible, onComplete }: { visible: boolean; onComplete?: () => void }) => (
  <SuccessAnimation
    visible={visible}
    message="Level Up!"
    type="levelup"
    onComplete={onComplete}
  />
);
