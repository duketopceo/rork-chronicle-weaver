
import React from 'react';
import { View, StyleSheet } from 'react-native';
import BillingPanel from './BillingPanel';
import UsageIndicator from './UsageIndicator';
import UpgradePrompt from './UpgradePrompt';
import { useGameStore } from '../store/gameStore';

const SubscriptionPanel = () => {
  const { subscription } = useGameStore(state => ({ subscription: state.subscription }));

  return (
    <View style={styles.container}>
      {subscription && subscription.status === 'active' ? (
        <>
          <BillingPanel />
          <UsageIndicator />
        </>
      ) : (
        <UpgradePrompt feature="full access" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#1a1a1a',
  },
});

export default SubscriptionPanel;
