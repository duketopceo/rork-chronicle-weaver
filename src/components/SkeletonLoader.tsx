/**
 * Chronicle Weaver - Skeleton Loader Component
 * 
 * Provides skeleton loading states for various UI elements.
 * Used during data fetching to improve perceived performance.
 * 
 * Features:
 * - Animated skeleton placeholders
 * - Multiple skeleton types (text, cards, buttons)
 * - Responsive sizing
 * - Accessibility support
 * 
 * Last Updated: January 2025
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, layout, borderRadius } from '../constants/colors';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'button' | 'list' | 'custom';
  width?: number | string;
  height?: number;
  lines?: number;
  style?: any;
  animated?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SkeletonLoader({
  type = 'text',
  width = '100%',
  height = 20,
  lines = 1,
  style,
  animated = true
}: SkeletonLoaderProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [animated, shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <View style={styles.textContainer}>
            {Array.from({ length: lines }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.skeletonBase,
                  styles.textSkeleton,
                  {
                    width: index === lines - 1 ? '70%' : '100%',
                    marginBottom: index < lines - 1 ? spacing.sm : 0,
                  },
                  animated && shimmerStyle,
                ]}
              />
            ))}
          </View>
        );

      case 'card':
        return (
          <Animated.View
            style={[
              styles.skeletonBase,
              styles.cardSkeleton,
              { width, height },
              animated && shimmerStyle,
              style,
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View
                style={[
                  styles.skeletonBase,
                  styles.cardTitle,
                  animated && shimmerStyle,
                ]}
              />
            </View>
            <View style={styles.cardContent}>
              <Animated.View
                style={[
                  styles.skeletonBase,
                  styles.cardText,
                  animated && shimmerStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.skeletonBase,
                  styles.cardText,
                  { width: '80%' },
                  animated && shimmerStyle,
                ]}
              />
            </View>
          </Animated.View>
        );

      case 'button':
        return (
          <Animated.View
            style={[
              styles.skeletonBase,
              styles.buttonSkeleton,
              { width, height },
              animated && shimmerStyle,
              style,
            ]}
          />
        );

      case 'list':
        return (
          <View style={styles.listContainer}>
            {Array.from({ length: lines }).map((_, index) => (
              <View key={index} style={styles.listItem}>
                <Animated.View
                  style={[
                    styles.skeletonBase,
                    styles.listAvatar,
                    animated && shimmerStyle,
                  ]}
                />
                <View style={styles.listContent}>
                  <Animated.View
                    style={[
                      styles.skeletonBase,
                      styles.listTitle,
                      animated && shimmerStyle,
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.skeletonBase,
                      styles.listSubtitle,
                      animated && shimmerStyle,
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        );

      case 'custom':
        return (
          <Animated.View
            style={[
              styles.skeletonBase,
              { width, height },
              animated && shimmerStyle,
              style,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return renderSkeleton();
}

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.small,
  },
  textContainer: {
    width: '100%',
  },
  textSkeleton: {
    height: 16,
  },
  cardSkeleton: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    height: 20,
    width: '60%',
  },
  cardContent: {
    gap: spacing.xs,
  },
  cardText: {
    height: 14,
    width: '100%',
  },
  buttonSkeleton: {
    height: 48,
    borderRadius: borderRadius.medium,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  listContent: {
    flex: 1,
    gap: spacing.xs,
  },
  listTitle: {
    height: 16,
    width: '70%',
  },
  listSubtitle: {
    height: 12,
    width: '50%',
  },
});

// Predefined skeleton components for common use cases
export const GameCardSkeleton = () => (
  <SkeletonLoader type="card" width="100%" height={120} />
);

export const GameListSkeleton = () => (
  <SkeletonLoader type="list" lines={3} />
);

export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <SkeletonLoader type="text" lines={lines} />
);

export const ButtonSkeleton = ({ width = 120 }: { width?: number }) => (
  <SkeletonLoader type="button" width={width} height={48} />
);
