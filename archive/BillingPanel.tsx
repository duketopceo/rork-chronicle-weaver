/**
 * Billing Management Panel Component
 * 
 * Comprehensive billing and subscription management interface for Chronicle Weaver.
 * 
 * Purpose: Manages user subscriptions, payment methods, and billing history.
 * 
 * References:
 * - File: src/components/BillingPanel.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */


import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useGameStore } from '../store/gameStore';

const BillingPanel = () => {
  const { subscription } = useGameStore(state => ({ subscription: state.subscription }));

  const handleManageSubscription = () => {
    // Logic to redirect to Stripe's customer portal
    console.log('Redirecting to Stripe customer portal...');
  };

  if (!subscription) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billing</Text>
      <Text style={styles.text}>Plan: {subscription.plan}</Text>
      <Text style={styles.text}>Status: {subscription.status}</Text>
      <Text style={styles.text}>Billed: {subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toLocaleDateString() : 'N/A'}</Text>
      <Button title="Manage Subscription" onPress={handleManageSubscription} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
});

export default BillingPanel;
