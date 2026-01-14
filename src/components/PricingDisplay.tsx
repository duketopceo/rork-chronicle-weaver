/**
 * Chronicle Weaver - Pricing Display Component
 * 
 * Side-by-side tier comparison with feature checkmarks and prominent CTAs.
 * Shows subscription tiers with pricing, features, and upgrade options.
 * 
 * Features:
 * - Side-by-side tier comparison
 * - Highlight recommended plan (Premium)
 * - Feature checkmarks/crosses per tier
 * - Prominent CTAs
 * - "Currently Active" badge for user's plan
 * - Stripe-hosted checkout integration
 * 
 * Last Updated: January 2025
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { stripeService, SubscriptionTier } from '../services/stripeService';
import { Check, X, Star, Crown, ArrowRight } from 'lucide-react-native';

interface PricingDisplayProps {
  onClose?: () => void;
  showCloseButton?: boolean;
  highlightRecommended?: boolean;
}

export default function PricingDisplay({ 
  onClose, 
  showCloseButton = false,
  highlightRecommended = true 
}: PricingDisplayProps) {
  const { subscription } = useGameStore();
  const [loading, setLoading] = useState<string | null>(null);

  const tiers = stripeService.getSubscriptionTiers();
  const currentTier = subscription?.plan || 'free';

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') return;

    try {
      setLoading(tierId);
      const successUrl = window.location.origin + '/billing?success=true';
      const cancelUrl = window.location.origin + '/billing?canceled=true';
      
      await stripeService.redirectToCheckout(
        `price_${tierId}_monthly`,
        successUrl,
        cancelUrl
      );
    } catch (error) {
      console.error('Error starting upgrade:', error);
    } finally {
      setLoading(null);
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'premium':
        return Star;
      case 'master':
        return Crown;
      default:
        return Check;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'premium':
        return colors.primary;
      case 'master':
        return colors.economicsAccent;
      default:
        return colors.textSecondary;
    }
  };

  const isCurrentTier = (tierId: string) => {
    return currentTier === tierId;
  };

  const isRecommended = (tierId: string) => {
    return tierId === 'premium' && highlightRecommended;
  };

  const canUpgrade = (tierId: string) => {
    const tierLevels = { free: 0, premium: 1, master: 2 };
    const currentLevel = tierLevels[currentTier as keyof typeof tierLevels];
    const targetLevel = tierLevels[tierId as keyof typeof tierLevels];
    return targetLevel > currentLevel;
  };

  return (
    <View style={styles.container}>
      {showCloseButton && onClose && (
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tiersContainer}>
          {tiers.map((tier) => {
            const TierIcon = getTierIcon(tier.id);
            const tierColor = getTierColor(tier.id);
            const isCurrent = isCurrentTier(tier.id);
            const isRec = isRecommended(tier.id);
            const canUp = canUpgrade(tier.id);

            return (
              <View
                key={tier.id}
                style={[
                  styles.tierCard,
                  isRec && styles.recommendedCard,
                  isCurrent && styles.currentCard,
                ]}
              >
                {isRec && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}

                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current Plan</Text>
                  </View>
                )}

                <View style={styles.tierHeader}>
                  <View style={styles.tierIconContainer}>
                    <TierIcon size={32} color={tierColor} />
                  </View>
                  <View style={styles.tierInfo}>
                    <Text style={[styles.tierName, { color: tierColor }]}>
                      {tier.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>${tier.price}</Text>
                      <Text style={styles.period}>/{tier.interval}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {tier.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <View style={styles.featureIcon}>
                        <Check size={16} color={colors.success} />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.tierFooter}>
                  {isCurrent ? (
                    <View style={styles.currentButton}>
                      <Text style={styles.currentButtonText}>Current Plan</Text>
                    </View>
                  ) : canUp ? (
                    <TouchableOpacity
                      style={[
                        styles.upgradeButton,
                        { backgroundColor: tierColor },
                      ]}
                      onPress={() => handleUpgrade(tier.id)}
                      disabled={loading === tier.id}
                    >
                      {loading === tier.id ? (
                        <ActivityIndicator size="small" color={colors.background} />
                      ) : (
                        <>
                          <Text style={styles.upgradeButtonText}>
                            {tier.price === 0 ? 'Get Started' : 'Upgrade Now'}
                          </Text>
                          <ArrowRight size={16} color={colors.background} />
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.unavailableButton}>
                      <Text style={styles.unavailableText}>Downgrade</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All plans include secure payment processing and can be canceled anytime.
          </Text>
          <Text style={styles.footerText}>
            Questions? Contact our support team.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
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
  closeText: {
    fontSize: 18,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tiersContainer: {
    gap: 20,
    marginVertical: 20,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  recommendedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  currentCard: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  recommendedText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  currentBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    right: 20,
    backgroundColor: colors.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  currentText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  tierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  period: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  tierFooter: {
    marginTop: 'auto',
  },
  currentButton: {
    backgroundColor: colors.success + '20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentButtonText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '600',
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
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  unavailableButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  unavailableText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

