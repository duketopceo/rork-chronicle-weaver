import React from 'react';
import { useGameStore } from '../store/gameStore';
import UpgradePrompt from '../components/UpgradePrompt';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string; // e.g., 'advanced-ai', 'unlimited-saves'
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children, feature }) => {
  const { subscription } = useGameStore(state => ({
    subscription: state.subscription,
  }));

  const hasAccess = () => {
    if (!subscription) {
      return false;
    }
    // Logic to check if the current subscription plan has access to the feature
    // This is a placeholder. You'll need to implement the actual logic based on your subscription plans.
    if (subscription.plan === 'premium' && feature === 'advanced-ai') {
      return true;
    }
    if (subscription.plan === 'premium' && feature === 'unlimited-saves') {
        return true;
    }
    if (subscription.plan === 'plus' && feature === 'unlimited-saves') {
        return true;
    }
    return false;
  };

  if (hasAccess()) {
    return <>{children}</>;
  } else {
    return <UpgradePrompt feature={feature} />;
  }
};

export default SubscriptionGate;
