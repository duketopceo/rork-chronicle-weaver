import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { signInWithEmail, createAccount, signInAsGuest, signOutUser } from '../services/firebaseUtils';
import Button from './Button';
import TextInput from './TextInput';
import { colors } from '../constants/colors';

const AuthPanel = () => {
  const { user } = useGameStore(state => ({ 
    user: state.user
  }));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const firebaseUser = isSignUp 
        ? await createAccount(email, password)
        : await signInWithEmail(email, password);
      
      if (firebaseUser) {
        // Note: setUser will be called automatically by the auth state listener in _layout.tsx
        Alert.alert('Success', isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      const firebaseUser = await signInAsGuest();
      if (firebaseUser) {
        // Note: setUser will be called automatically by the auth state listener in _layout.tsx
        Alert.alert('Success', 'Signed in as guest!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      // Note: setUser(null) will be called automatically by the auth state listener in _layout.tsx
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.text}>
          {user.isAnonymous ? 'Guest User' : `Email: ${user.email}`}
        </Text>
        <Text style={styles.text}>UID: {user.uid}</Text>
        <Button 
          title="Sign Out" 
          onPress={handleSignOut}
          disabled={isLoading}
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button 
        title={isSignUp ? 'Create Account' : 'Sign In'}
        onPress={handleEmailAuth}
        disabled={isLoading}
        style={styles.button}
      />
      
      <Button 
        title={isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        onPress={() => setIsSignUp(!isSignUp)}
        variant="outline"
        disabled={isLoading}
        style={styles.button}
      />
      
      <Button 
        title="Continue as Guest"
        onPress={handleGuestSignIn}
        variant="outline"
        disabled={isLoading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginBottom: 10,
  },
});

export default AuthPanel;
