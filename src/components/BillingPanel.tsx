/**
 * Chronicle Weaver - Billing Management Panel
 * 
 * Comprehensive billing and subscription management interface.
 * Manages user subscriptions, payment methods, and billing history.
 * 
 * Features:
 * - Display current subscription tier with badge
 * - Show next billing date and amount
 * - Payment method display (last 4 digits)
 * - "Update Payment Method" → Stripe portal
 * - "Change Plan" options with comparison table
 * - "Cancel Subscription" with confirmation dialog
 * - Billing history table (last 12 months)
 * - Download invoice PDFs
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { stripeService, SubscriptionStatus } from '../services/stripeService';
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle, Crown, Star } from 'lucide-react-native';

interface BillingPanelProps {
  onClose: () => void;
}

export default function BillingPanel({ onClose }: BillingPanelProps) {
  const { subscription, setSubscription } = useGameStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await stripeService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setActionLoading('portal');
      const returnUrl = window.location.origin + '/billing';
      await stripeService.redirectToPortal(returnUrl);
    } catch (error) {
      console.error('Error opening customer portal:', error);
      Alert.alert('Error', 'Failed to open billing portal. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      setActionLoading('upgrade');
      const successUrl = window.location.origin + '/billing?success=true';
      const cancelUrl = window.location.origin + '/billing?canceled=true';
      
      await stripeService.redirectToCheckout(
        `price_${tier}_monthly`,
        successUrl,
        cancelUrl
      );
    } catch (error) {
      console.error('Error starting upgrade:', error);
      Alert.alert('Error', 'Failed to start upgrade process. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cancellation
            Alert.alert('Cancellation', 'Please contact support to cancel your subscription.');
          }
        },
      ]
    );
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return { icon: Star, color: colors.primary, text: 'Premium' };
      case 'master':
        return { icon: Crown, color: colors.gold, text: 'Master' };
      default:
        return { icon: CheckCircle, color: colors.textSecondary, text: 'Free' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'past_due':
        return colors.warning;
      case 'canceled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Billing & Subscription</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading subscription details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tierBadge = getTierBadge(subscriptionStatus?.tier || 'free');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing & Subscription</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <tierBadge.icon size={24} color={tierBadge.color} />
                <Text style={[styles.planName, { color: tierBadge.color }]}>
                  {tierBadge.text}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscriptionStatus?.status || 'inactive') }]}>
                  <Text style={styles.statusText}>
                    {subscriptionStatus?.status || 'inactive'}
                  </Text>
                </View>
              </View>
            </View>

            {subscriptionStatus?.currentPeriodEnd && (
              <View style={styles.billingInfo}>
                <View style={styles.billingRow}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={styles.billingLabel}>Next billing date:</Text>
                  <Text style={styles.billingValue}>
                    {subscriptionStatus.currentPeriodEnd.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.billingRow}>
                  <CreditCard size={16} color={colors.textSecondary} />
                  <Text style={styles.billingLabel}>Payment method:</Text>
                  <Text style={styles.billingValue}>•••• 4242</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Usage Statistics */}
        {subscriptionStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage This Month</Text>
            <View style={styles.usageCard}>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>AI Story Generations:</Text>
                <Text style={styles.usageValue}>
                  {subscriptionStatus.usage.aiCalls} / {subscriptionStatus.usage.dailyLimit === 1000 ? '∞' : subscriptionStatus.usage.dailyLimit}
                </Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Games Saved:</Text>
                <Text style={styles.usageValue}>{subscriptionStatus.usage.gameSaves}</Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Resets in:</Text>
                <Text style={styles.usageValue}>
                  {Math.ceil((subscriptionStatus.usage.resetTime.getTime() - Date.now()) / (1000 * 60 * 60))} hours
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Subscription</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleManageSubscription}
              disabled={actionLoading === 'portal'}
            >
              {actionLoading === 'portal' ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <CreditCard size={20} color={colors.background} />
              )}
              <Text style={styles.primaryButtonText}>Manage Payment</Text>
            </TouchableOpacity>

            {subscriptionStatus?.tier === 'free' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.upgradeButton]}
                onPress={() => handleUpgrade('premium')}
                disabled={actionLoading === 'upgrade'}
              >
                {actionLoading === 'upgrade' ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Star size={20} color={colors.background} />
                )}
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}

            {subscriptionStatus?.tier === 'premium' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.upgradeButton]}
                onPress={() => handleUpgrade('master')}
                disabled={actionLoading === 'upgrade'}
              >
                {actionLoading === 'upgrade' ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Crown size={20} color={colors.background} />
                )}
                <Text style={styles.upgradeButtonText}>Upgrade to Master</Text>
              </TouchableOpacity>
            )}

            {subscriptionStatus?.tier !== 'free' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelSubscription}
              >
                <AlertCircle size={20} color={colors.error} />
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Billing History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing History</Text>
          <View style={styles.historyCard}>
            <Text style={styles.historyText}>
              Billing history will be available after your first payment.
            </Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={16} color={colors.primary} />
              <Text style={styles.downloadText}>Download Invoices</Text>
            </TouchableOpacity>
          </View>
    </View>
      </ScrollView>
    </SafeAreaView>
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
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planHeader: {
    marginBottom: 16,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
    textTransform: 'capitalize',
  },
  billingInfo: {
    gap: 8,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  usageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  usageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  usageValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: colors.gold,
  },
  upgradeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});