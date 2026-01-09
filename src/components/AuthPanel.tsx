/**
 * Chronicle Weaver - Complete Authentication Panel
 * 
 * Comprehensive authentication interface with sign-in, sign-up, password reset,
 * and session management. Handles all authentication flows with proper error handling.
 * 
 * Features:
 * - Email/password sign up with validation
 * - Email/password sign in
 * - Password reset flow
 * - Anonymous/guest user creation
 * - Session persistence across browser refreshes
 * - Auth state monitoring and automatic re-auth
 * - Graceful error handling and user feedback
 * 
 * Last Updated: January 2025
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { 
  signInWithEmail, 
  createAccount, 
  signInAsGuest, 
  signOutUser,
  sendPasswordResetEmail,
  updateUserProfile
} from '../services/firebaseUtils';
import Button from './Button';
import TextInput from './TextInput';
import { colors, spacing, typography } from '../constants/colors';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react-native';

interface AuthPanelProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function AuthPanel({ onClose, showCloseButton = false }: AuthPanelProps) {
  const { user, setUser, setSubscription } = useGameStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState<'signin' | 'signup' | 'reset' | 'profile'>('signin');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear errors when switching modes
  useEffect(() => {
    setErrors({});
  }, [authStep, isSignUp]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!displayName.trim()) {
        newErrors.displayName = 'Display name is required';
      } else if (displayName.trim().length < 2) {
        newErrors.displayName = 'Display name must be at least 2 characters';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let firebaseUser;
      
      if (isSignUp) {
        firebaseUser = await createAccount(email, password);
        if (firebaseUser) {
          // Update display name for new users
          await updateUserProfile({ displayName: displayName.trim() });
        }
      } else {
        firebaseUser = await signInWithEmail(email, password);
      }
      
      if (firebaseUser) {
        // User will be set automatically by auth state listener
        Alert.alert(
          'Success', 
          isSignUp ? 'Account created successfully!' : 'Signed in successfully!',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setIsLoading(true);
    try {
      const firebaseUser = await signInAsGuest();
      if (firebaseUser) {
        Alert.alert(
          'Welcome!', 
          'You can start playing immediately. Sign up later to save your progress.',
          [{ text: 'Start Playing', onPress: onClose }]
        );
      }
    } catch (error: any) {
      console.error('Guest authentication error:', error);
      Alert.alert('Error', 'Failed to start as guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      Alert.alert(
        'Reset Email Sent',
        'Check your email for password reset instructions.',
        [{ text: 'OK', onPress: () => setAuthStep('signin') }]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      Alert.alert('Signed Out', 'You have been signed out successfully.');
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const getAuthTitle = () => {
    switch (authStep) {
      case 'signup':
        return 'Create Account';
      case 'reset':
        return 'Reset Password';
      case 'profile':
        return 'User Profile';
      default:
        return 'Sign In';
    }
  };

  const getAuthSubtitle = () => {
    switch (authStep) {
      case 'signup':
        return 'Create your Chronicle Weaver account to save your progress';
      case 'reset':
        return 'Enter your email address to receive reset instructions';
      case 'profile':
        return 'Manage your account settings';
      default:
        return 'Sign in to continue your chronicle';
    }
  };

  // User is authenticated - show profile
  if (user && user.isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>User Profile</Text>
          {showCloseButton && onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileContent}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <User size={32} color={colors.primary} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user.email || 'Guest User'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user.isAnonymous ? 'Guest Account' : 'Registered User'}
                </Text>
              </View>
            </View>

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Account Type</Text>
                <Text style={styles.statValue}>
                  {user.isAnonymous ? 'Guest' : 'Registered'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  Active
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {user.isAnonymous && (
              <Button
                title="Create Account"
                onPress={() => setAuthStep('signup')}
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
              />
            )}
            
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Authentication forms
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getAuthTitle()}</Text>
        {showCloseButton && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>{getAuthSubtitle()}</Text>

        {authStep === 'reset' ? (
          <View style={styles.resetForm}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            
            <Button
              title="Send Reset Email"
              onPress={handlePasswordReset}
              disabled={isLoading}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
            
            <TouchableOpacity
              onPress={() => setAuthStep('signin')}
              style={styles.linkButton}
            >
              <ArrowLeft size={16} color={colors.primary} />
              <Text style={styles.linkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authForm}>
            {isSignUp && (
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                autoCapitalize="words"
                error={errors.displayName}
              />
            )}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                error={errors.password}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <View style={styles.passwordContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  error={errors.confirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleEmailAuth}
              disabled={isLoading}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />

            {!isSignUp && (
              <TouchableOpacity
                onPress={() => setAuthStep('reset')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Continue as Guest"
              onPress={handleGuestAuth}
              disabled={isLoading}
              style={styles.guestButton}
              textStyle={styles.guestButtonText}
            />

            <View style={styles.switchMode}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchButton}
              >
                <Text style={styles.switchButtonText}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isSignUp ? 'Creating account...' : 'Signing in...'}
            </Text>
          </View>
        )}
      </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  authForm: {
    gap: spacing.md,
  },
  resetForm: {
    gap: spacing.md,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.background,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  switchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  switchButton: {
    paddingVertical: spacing.sm,
  },
  switchButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  profileContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  profileStats: {
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  actionButtons: {
    gap: spacing.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
});