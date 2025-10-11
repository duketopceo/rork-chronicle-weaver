import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chronicle Weaver</Text>
        <Text style={styles.version}>Version 2.0</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.status}>🚧 Under Construction 🚧</Text>
        <Text style={styles.description}>
          We're building something amazing! Chronicle Weaver v2.0 is being rewritten from the ground up 
          with improved AI-powered narrative generation and a modern interface.
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureTitle}>Coming Soon:</Text>
          <Text style={styles.feature}>• AI-Powered Historical Narratives</Text>
          <Text style={styles.feature}>• Character Creation & Progression</Text>
          <Text style={styles.feature}>• Multiple Historical Eras</Text>
          <Text style={styles.feature}>• Choice-Driven Storytelling</Text>
          <Text style={styles.feature}>• Cloud Save & Sync</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Chronicle Weaver v2.0 - The Future of Historical Role-Playing
        </Text>
        <Text style={styles.footerText}>
          chronicleweaver.com
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d97706',
    textAlign: 'center',
    marginBottom: 10,
  },
  version: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  status: {
    fontSize: 32,
    color: '#fbbf24',
    marginBottom: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    maxWidth: 600,
  },
  features: {
    alignItems: 'flex-start',
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 15,
  },
  feature: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
});