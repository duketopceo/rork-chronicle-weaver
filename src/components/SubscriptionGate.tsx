/**
 * Chronicle Weaver - Subscription Gate Component
 * 
 * Wrapper component that controls access to premium features based on subscription tier.
 * Shows upgrade prompts for free users and tracks feature access attempts.
 * 
 * Features:
 * - Shows content if user has required tier
 * - Shows upgrade prompt with feature benefits if not
 * - Tracks feature access attempts for analytics
 * - Smooth modal/dialog presentation
 * - Clear pricing and "Upgrade Now" CTA
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { stripeService } from '../services/stripeService';
import { Crown, Star, Lock, ArrowRight, X } from 'lucide-react-native';

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier: 'premium' | 'master';
  feature: string;
  featureDescription?: string;
  benefits?: string[];
  showUpgradePrompt?: boolean;
}

export default function SubscriptionGate({
  children,
  requiredTier,
  feature,
  featureDescription,
  benefits = [],
  showUpgradePrompt = true,
}: SubscriptionGateProps) {
  const { subscription } = useGameStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentTier = subscription?.plan || 'free';
  const hasAccess = checkAccess(currentTier, requiredTier);

  useEffect(() => {
    // Track feature access attempt for analytics
    if (!hasAccess) {
      trackFeatureAccess(feature, currentTier);
    }
  }, [hasAccess, feature, currentTier]);

  const checkAccess = (current: string, required: string): boolean => {
    const tierLevels = { free: 0, premium: 1, master: 2 };
    return tierLevels[current as keyof typeof tierLevels] >= tierLevels[required as keyof typeof tierLevels];
  };

  const trackFeatureAccess = async (featureName: string, tier: string) => {
    try {
      await stripeService.updateUsage('feature_access', {
        feature: featureName,
        tier,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking feature access:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const successUrl = window.location.origin + '/billing?success=true';
      const cancelUrl = window.location.origin + '/billing?canceled=true';
      
      await stripeService.redirectToCheckout(
        `price_${requiredTier}_monthly`,
        successUrl,
        cancelUrl
      );
    } catch (error) {
      console.error('Error starting upgrade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'premium':
        return {
          name: 'Premium',
          icon: Star,
          color: colors.primary,
          price: '$4.99/month',
          features: [
            'Unlimited story turns',
            'All historical eras (100+)',
            '5 saved games',
            'Priority AI processing',
            'No ads',
          ],
        };
      case 'master':
        return {
          name: 'Chronicle Master',
          icon: Crown,
          color: colors.gold,
          price: '$9.99/month',
          features: [
            'All Premium features',
            'Custom historical scenarios',
            'Advanced character customization',
            'Early access to new features',
            '20 saved games',
          ],
        };
      default:
        return null;
    }
  };

  const getDefaultBenefits = (tier: string) => {
    switch (tier) {
      case 'premium':
        return [
          'Unlimited AI story generation',
          'Access to all historical eras',
          'Multiple saved games',
          'Priority support',
        ];
      case 'master':
        return [
          'All Premium features',
          'Custom scenarios',
          'Advanced customization',
          'Early access to new content',
        ];
      default:
        return [];
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return (
      <View style={styles.lockedContainer}>
        <Lock size={24} color={colors.textSecondary} />
        <Text style={styles.lockedText}>Premium Feature</Text>
      </View>
    );
  }

  const tierInfo = getTierInfo(requiredTier);
  const displayBenefits = benefits.length > 0 ? benefits : getDefaultBenefits(requiredTier);

  return (
    <>
      <TouchableOpacity
        style={styles.upgradePrompt}
        onPress={() => setShowUpgradeModal(true)}
      >
        <View style={styles.promptContent}>
          <View style={styles.promptHeader}>
            <Lock size={20} color={colors.primary} />
            <Text style={styles.promptTitle}>Premium Feature</Text>
          </View>
          <Text style={styles.promptDescription}>
            {featureDescription || `This feature requires ${requiredTier} subscription.`}
          </Text>
          <View style={styles.promptAction}>
            <Text style={styles.upgradeText}>Upgrade to {tierInfo?.name}</Text>
            <ArrowRight size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showUpgradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upgrade to {tierInfo?.name}</Text>
            <TouchableOpacity
              onPress={() => setShowUpgradeModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <tierInfo?.icon size={32} color={tierInfo?.color} />
                <View style={styles.tierInfo}>
                  <Text style={[styles.tierName, { color: tierInfo?.color }]}>
                    {tierInfo?.name}
                  </Text>
                  <Text style={styles.tierPrice}>{tierInfo?.price}</Text>
                </View>
              </View>

              <Text style={styles.tierDescription}>
                Unlock {feature} and all other premium features
              </Text>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What you get:</Text>
              {displayBenefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.featureSection}>
              <Text style={styles.featureTitle}>About {feature}:</Text>
              <Text style={styles.featureDescription}>
                {featureDescription || `This premium feature enhances your Chronicle Weaver experience with advanced functionality.`}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: tierInfo?.color }]}
              onPress={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.upgradeButtonText}>Processing...</Text>
              ) : (
                <>
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                  <ArrowRight size={20} color={colors.background} />
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowUpgradeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  lockedText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  upgradePrompt: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  promptContent: {
    gap: 8,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  promptDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  promptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tierPrice: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tierDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 12,
    color: colors.background,
    fontWeight: 'bold',
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  featureSection: {
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
