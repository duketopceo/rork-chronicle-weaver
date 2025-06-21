import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { AlertTriangle, RefreshCw, Bug, Copy, Send } from 'lucide-react-native';
import { UltraDebugPanel } from './UltraDebugPanel';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDebug: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDebug: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('🚨 Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error service in production
    if (!__DEV__) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implement external error logging (e.g., Sentry, Crashlytics)
    console.log('📊 Logging error to external service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private getErrorDetails = () => {
    const { error, errorInfo } = this.state;
    if (!error) return '';

    return JSON.stringify({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    }, null, 2);
  };

  private copyErrorDetails = () => {
    // In a real app, you'd use Clipboard API
    console.log('📋 Error details copied:', this.getErrorDetails());
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <AlertTriangle size={48} color={colors.error} />
            <Text style={styles.title}>Application Error</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. You can try to reload or view the debug logs.
            </Text>
            <Text style={styles.errorId}>Error ID: {this.state.errorId}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
              <RefreshCw size={18} color={colors.background} />
              <Text style={styles.buttonText}>Reload Application</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.debugButton]} onPress={() => this.setState({ showDebug: true })}>
              <Bug size={18} color={colors.text} />
              <Text style={[styles.buttonText, styles.debugButtonText]}>Show Debug Panel</Text>
            </TouchableOpacity>
          </View>

          <UltraDebugPanel 
            visible={this.state.showDebug} 
            onClose={() => this.setState({ showDebug: false })} 
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  debugButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  debugButtonText: {
    color: colors.text,
  },
});
