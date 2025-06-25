/**
 * Upgrade Prompt Component
 * 
 * Modal component prompting users to upgrade to premium features.
 * 
 * Purpose: Encourages subscription upgrades and displays premium benefits.
 * 
 * References:
 * - File: src/components/UpgradePrompt.tsx
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */


import React from 'react';
import { View, Text, Button } from 'react-native';

interface UpgradePromptProps {
  feature: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature }) => {
  const handleUpgrade = () => {
    // Logic to handle the upgrade process
    // This could navigate to a billing screen or open a modal
    console.log(`Upgrade to access ${feature}`);
  };

  return (
    <View>
      <Text>You need to upgrade your subscription to use the {feature} feature.</Text>
      <Button title="Upgrade Now" onPress={handleUpgrade} />
    </View>
  );
};

export default UpgradePrompt;
