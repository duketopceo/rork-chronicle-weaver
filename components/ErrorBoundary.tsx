import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { AlertTriangle, RefreshCw, Bug, Copy, Send } from 'lucide-react-native';

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
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <AlertTriangle size={48} color={colors.error} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              The app encountered an unexpected error
            </Text>
          </View>

          <View style={styles.errorDetails}>
            <Text style={styles.errorId}>Error ID: {this.state.errorId}</Text>
            
            {__DEV__ && (
              <ScrollView style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  {this.state.error?.message}
                </Text>
                
                {this.state.error?.stack && (
                  <View style={styles.stackTrace}>
                    <Text style={styles.stackTitle}>Stack Trace:</Text>
                    <Text style={styles.stackText}>
                      {this.state.error.stack}
                    </Text>
                  </View>
                )}
                
                {this.state.errorInfo?.componentStack && (
                  <View style={styles.componentStack}>
                    <Text style={styles.stackTitle}>Component Stack:</Text>
                    <Text style={styles.stackText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <RefreshCw size={20} color={colors.surface} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>

            {__DEV__ && (
              <TouchableOpacity style={styles.debugButton} onPress={this.copyErrorDetails}>
                <Copy size={20} color={colors.primary} />
                <Text style={styles.debugButtonText}>Copy Details</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              If this problem persists, please report it to the development team.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  errorDetails: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    maxHeight: 300,
  },
  errorId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  debugInfo: {
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.error,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  stackTrace: {
    marginTop: 12,
  },
  componentStack: {
    marginTop: 12,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  stackText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  debugButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
