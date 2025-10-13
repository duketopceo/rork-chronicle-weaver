/**
 * Chronicle Weaver - Usage Indicator Component
 * 
 * Enhanced usage tracking display with progress bar, countdown timer, and premium unlimited state.
 * Shows daily usage limits and remaining turns for free users.
 * 
 * Features:
 * - Progress bar showing turns used (e.g., "3/5 turns today")
 * - Green → Yellow → Red color progression
 * - "Resets in X hours" countdown
 * - Upgrade CTA when approaching/at limit
 * - Celebratory state for premium users ("Unlimited ∞")
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { usageTracker, UsageData } from '../services/usageTracker';
import { stripeService } from '../services/stripeService';
import { Zap, Clock, Crown, Star, AlertTriangle } from 'lucide-react-native';

interface UsageIndicatorProps {
  onUpgrade?: () => void;
  showUpgradePrompt?: boolean;
  compact?: boolean;
}

export default function UsageIndicator({ 
  onUpgrade, 
  showUpgradePrompt = true,
  compact = false 
}: UsageIndicatorProps) {
  const { user } = useGameStore();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!user?.uid) return;

    loadUsageData();
    setupUsageTracking();
    updateTimeRemaining();

    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [user?.uid]);

  const loadUsageData = async () => {
    try {
      if (!user?.uid) return;
      
      const data = await usageTracker.getUsageData(user.uid);
      setUsageData(data);
      
      // Animate progress bar
      const progress = data.aiCalls / data.dailyLimit;
      Animated.timing(progressAnimation, {
        toValue: Math.min(progress, 1),
        duration: 500,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  };

  const setupUsageTracking = () => {
    const unsubscribe = usageTracker.onAlert((alert) => {
      if (alert.type === 'limit_reached' && showUpgradePrompt) {
        onUpgrade?.();
      }
    });

    return unsubscribe;
  };

  const updateTimeRemaining = () => {
    if (!usageData) return;

    const now = new Date();
    const resetTime = usageData.resetTime;
    const diff = resetTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Resets now');
      loadUsageData(); // Refresh data
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      setTimeRemaining(`Resets in ${hours}h ${minutes}m`);
    } else {
      setTimeRemaining(`Resets in ${minutes}m`);
    }
  };

  const getProgressColor = (usage: number, limit: number) => {
    const percentage = usage / limit;
    
    if (percentage >= 1) return colors.error;
    if (percentage >= 0.8) return colors.warning;
    if (percentage >= 0.6) return colors.gold;
    return colors.success;
  };

  const getStatusIcon = (tier: string, usage: number, limit: number) => {
    if (tier === 'premium' || tier === 'master') {
      return Crown;
    }
    
    if (usage >= limit) {
      return AlertTriangle;
    }
    
    if (usage >= limit * 0.8) {
      return Clock;
    }
    
    return Zap;
  };

  const getStatusText = (tier: string, usage: number, limit: number) => {
    if (tier === 'premium' || tier === 'master') {
      return 'Unlimited';
    }
    
    if (usage >= limit) {
      return 'Limit Reached';
    }
    
    return `${usage}/${limit} turns`;
  };

  const getStatusColor = (tier: string, usage: number, limit: number) => {
    if (tier === 'premium' || tier === 'master') {
      return colors.gold;
    }
    
    if (usage >= limit) {
      return colors.error;
    }
    
    if (usage >= limit * 0.8) {
      return colors.warning;
    }
    
    return colors.success;
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade flow
      stripeService.redirectToCheckout(
        'price_premium_monthly',
        window.location.origin + '/billing?success=true',
        window.location.origin + '/billing?canceled=true'
      );
    }
  };

  if (!usageData || !user?.uid) {
    return null;
  }

  const { aiCalls, dailyLimit, tier } = usageData;
  const isPremium = tier === 'premium' || tier === 'master';
  const isLimitReached = aiCalls >= dailyLimit;
  const isApproachingLimit = aiCalls >= dailyLimit * 0.8;
  
  const StatusIcon = getStatusIcon(tier, aiCalls, dailyLimit);
  const statusText = getStatusText(tier, aiCalls, dailyLimit);
  const statusColor = getStatusColor(tier, aiCalls, dailyLimit);
  const progressColor = getProgressColor(aiCalls, dailyLimit);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactContent}>
          <StatusIcon size={16} color={statusColor} />
          <Text style={[styles.compactText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
        {!isPremium && (isApproachingLimit || isLimitReached) && showUpgradePrompt && (
          <TouchableOpacity style={styles.compactUpgradeButton} onPress={handleUpgrade}>
            <Star size={12} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <StatusIcon size={20} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
        
        {!isPremium && (
          <Text style={styles.timeRemaining}>
            {timeRemaining}
          </Text>
        )}
      </View>

      {!isPremium && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: progressColor,
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {aiCalls} / {dailyLimit} turns used
          </Text>
        </View>
      )}

      {isPremium && (
        <View style={styles.unlimitedContainer}>
          <Crown size={24} color={colors.gold} />
          <Text style={styles.unlimitedText}>
            Unlimited story generation
          </Text>
        </View>
      )}

      {!isPremium && (isApproachingLimit || isLimitReached) && showUpgradePrompt && (
        <View style={styles.upgradePrompt}>
          <View style={styles.upgradeContent}>
            <AlertTriangle size={16} color={colors.warning} />
            <Text style={styles.upgradeText}>
              {isLimitReached 
                ? "You've reached your daily limit. Upgrade for unlimited access."
                : "You're approaching your daily limit. Upgrade to continue."
              }
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Star size={16} color={colors.background} />
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  unlimitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  unlimitedText: {
    fontSize: 16,
    color: colors.gold,
    fontWeight: '600',
  },
  upgradePrompt: {
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  upgradeText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  upgradeButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  compactUpgradeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});