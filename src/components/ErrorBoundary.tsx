/**
 * Enhanced Error Boundary Component for Chronicle Weaver
 * 
 * Comprehensive error handling with logging integration
 * Provides user-friendly error displays and developer debugging tools
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { AlertTriangle, RefreshCw, Bug, Download } from 'lucide-react-native';
import { errorLogger } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to our logging system
    errorLogger.logError('React Error Boundary Caught Error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId,
      important: true
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    errorLogger.logInfo('User triggered error boundary retry', {
      errorId: this.state.errorId,
      important: true
    });
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    errorLogger.logInfo('User triggered page reload from error boundary', {
      errorId: this.state.errorId,
      important: true
    });
    
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleExportLogs = () => {
    try {
      const logs = errorLogger.exportLogs();
      if (typeof window !== 'undefined' && 'Blob' in window) {
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chronicle-weaver-error-logs-${this.state.errorId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        errorLogger.logInfo('User exported error logs', {
          errorId: this.state.errorId
        });
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error boundary UI
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={64} color={colors.error || '#ff4444'} />
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              Chronicle Weaver encountered an unexpected error. Our team has been automatically notified.
            </Text>
            
            <View style={styles.errorIdContainer}>
              <Text style={styles.errorIdLabel}>Error ID:</Text>
              <Text style={styles.errorId}>{this.state.errorId}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={this.handleRetry}>
                <RefreshCw size={20} color={colors.highContrastText} />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={this.handleReload}>
                <RefreshCw size={20} color={colors.primary || '#007bff'} />
                <Text style={styles.secondaryButtonText}>Reload App</Text>
              </TouchableOpacity>
            </View>

            {/* Developer Debug Section */}
            {process.env.NODE_ENV !== 'production' && (
              <View style={styles.debugSection}>
                <View style={styles.debugHeader}>
                  <Bug size={20} color={colors.textSecondary || '#666666'} />
                  <Text style={styles.debugTitle}>Debug Information</Text>
                </View>
                
                <ScrollView style={styles.debugScrollView}>
                  <Text style={styles.debugLabel}>Error:</Text>
                  <Text style={styles.debugText}>
                    {this.state.error?.name}: {this.state.error?.message}
                  </Text>
                  
                  <Text style={styles.debugLabel}>Stack Trace:</Text>
                  <Text style={styles.debugText}>
                    {this.state.error?.stack}
                  </Text>
                  
                  <Text style={styles.debugLabel}>Component Stack:</Text>
                  <Text style={styles.debugText}>
                    {this.state.errorInfo?.componentStack}
                  </Text>
                </ScrollView>

                <TouchableOpacity style={styles.exportButton} onPress={this.handleExportLogs}>
                  <Download size={16} color={colors.textSecondary || '#666666'} />
                  <Text style={styles.exportButtonText}>Export Logs</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text || '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary || '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorIdContainer: {
    backgroundColor: colors.surface || '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
  errorIdLabel: {
    fontSize: 12,
    color: colors.textSecondary || '#666666',
    marginBottom: 4,
  },
  errorId: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.text || '#000000',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: colors.primary || '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.highContrastText,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surface || '#f5f5f5',
    borderWidth: 1,
    borderColor: colors.primary || '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary || '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugSection: {
    marginTop: 32,
    width: '100%',
    backgroundColor: colors.surface || '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#000000',
  },
  debugScrollView: {
    maxHeight: 200,
    marginBottom: 16,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text || '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textSecondary || '#666666',
    backgroundColor: colors.background || '#ffffff',
    padding: 8,
    borderRadius: 4,
    lineHeight: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  exportButtonText: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
  },
});

export default ErrorBoundary;
