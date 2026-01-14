/**
 * Chronicle Weaver - Error State Component
 * 
 * Provides comprehensive error handling and user feedback.
 * Used throughout the app for consistent error presentation.
 * 
 * Features:
 * - Multiple error types (network, validation, server, etc.)
 * - Retry mechanisms
 * - User-friendly error messages
 * - Accessibility support
 * 
 * Last Updated: January 2025
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, Wifi, Server, Shield, RefreshCw } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '../constants/colors';
import Button from './Button';

interface ErrorStateProps {
  type?: 'network' | 'server' | 'validation' | 'auth' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  retryText?: string;
  style?: any;
}

export default function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  onDismiss,
  showRetry = true,
  retryText = 'Try Again',
  style
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Please check your internet connection and try again.',
          iconColor: colors.warning,
        };
      case 'server':
        return {
          icon: Server,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Please try again later.',
          iconColor: colors.accent.error,
        };
      case 'validation':
        return {
          icon: AlertCircle,
          defaultTitle: 'Invalid Input',
          defaultMessage: 'Please check your input and try again.',
          iconColor: colors.warning,
        };
      case 'auth':
        return {
          icon: Shield,
          defaultTitle: 'Authentication Error',
          defaultMessage: 'Please sign in again to continue.',
          iconColor: colors.accent.error,
        };
      default:
        return {
          icon: AlertCircle,
          defaultTitle: 'Something Went Wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          iconColor: colors.accent.error,
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconComponent size={48} color={config.iconColor} />
        </View>
        
        <Text style={styles.title}>{title || config.defaultTitle}</Text>
        <Text style={styles.message}>{message || config.defaultMessage}</Text>
        
        {showRetry && onRetry && (
          <View style={styles.actions}>
            <Button
              title={retryText}
              onPress={onRetry}
              style={styles.retryButton}
              icon={<RefreshCw size={16} color={colors.background} />}
            />
            {onDismiss && (
              <Button
                title="Dismiss"
                onPress={onDismiss}
                style={styles.dismissButton}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  dismissButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
});

// Predefined error states for common use cases
export const NetworkError = ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
  <ErrorState
    type="network"
    onRetry={onRetry}
    message={message}
  />
);

export const ServerError = ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
  <ErrorState
    type="server"
    onRetry={onRetry}
    message={message}
  />
);

export const ValidationError = ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
  <ErrorState
    type="validation"
    onRetry={onRetry}
    message={message}
  />
);

export const AuthError = ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
  <ErrorState
    type="auth"
    onRetry={onRetry}
    message={message}
  />
);
