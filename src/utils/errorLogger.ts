/**
 * Advanced Error Logging System for Chronicle Weaver
 * 
 * Comprehensive error tracking and reporting for production deployment
 * Integrates with chronicleweaver.com logging infrastructure
 */

import { Platform } from 'react-native';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId: string;
  platform: string;
  version: string;
  url?: string;
  userAgent?: string;
}

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  name: string;
  value: number;
  unit: string;
  context?: Record<string, any>;
  sessionId: string;
}

class ErrorLoggingService {
  private sessionId: string;
  private userId?: string;
  private logs: ErrorLog[] = [];
  private metrics: PerformanceMetric[] = [];
  private isProduction: boolean;
  private apiEndpoint: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.apiEndpoint = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.chronicleweaver.com';
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Start session
    this.logInfo('Session started', { 
      platform: Platform.OS,
      sessionId: this.sessionId 
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // React Native error handler
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.logError('Global Error', error, { isFatal });
        originalHandler(error, isFatal);
      });
    }

    // Web error handlers
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.addEventListener('error', (event) => {
          this.logError('Window Error', new Error(event.message), {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            url: window.location.href
          });
        });

        window.addEventListener('unhandledrejection', (event) => {
          this.logError('Unhandled Promise Rejection', event.reason, {
            url: window.location.href
          });
        });

        // Performance observer for web vitals
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.logPerformance(entry.name, entry.duration, 'ms', {
                entryType: entry.entryType,
                startTime: entry.startTime
              });
            }
          });

          observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        }
      }
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.logInfo('User identified', { userId });
  }

  logError(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message,
      stack: error?.stack || error?.toString(),
      context: {
        ...context,
        error: error?.name || 'Unknown',
        errorMessage: error?.message || error?.toString()
      },
      userId: this.userId,
      sessionId: this.sessionId,
      platform: Platform.OS,
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      url: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.logs.push(errorLog);
    this.sendLogToServer(errorLog);

    // Console logging for development
    if (!this.isProduction) {
      console.error(`[ERROR] ${message}`, error, context);
    }
  }

  logWarning(message: string, context?: Record<string, any>): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warning',
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      platform: Platform.OS,
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      url: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.logs.push(warningLog);
    this.sendLogToServer(warningLog);

    if (!this.isProduction) {
      console.warn(`[WARNING] ${message}`, context);
    }
  }

  logInfo(message: string, context?: Record<string, any>): void {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      platform: Platform.OS,
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      url: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.logs.push(infoLog);
    
    // Only send info logs to server in production for important events
    if (this.isProduction && context?.important) {
      this.sendLogToServer(infoLog);
    }

    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  logDebug(message: string, context?: Record<string, any>): void {
    if (this.isProduction) return; // Skip debug logs in production

    const debugLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'debug',
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      platform: Platform.OS,
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      url: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : undefined
    };

    this.logs.push(debugLog);
    console.debug(`[DEBUG] ${message}`, context);
  }

  logPerformance(name: string, value: number, unit: string = 'ms', context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date(),
      name,
      value,
      unit,
      context,
      sessionId: this.sessionId
    };

    this.metrics.push(metric);
    
    if (this.isProduction) {
      this.sendMetricToServer(metric);
    }

    if (!this.isProduction) {
      console.log(`[PERF] ${name}: ${value}${unit}`, context);
    }
  }

  private async sendLogToServer(log: ErrorLog): Promise<void> {
    if (!this.isProduction) return;

    try {
      const response = await fetch(`${this.apiEndpoint}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
          'X-User-ID': this.userId || 'anonymous'
        },
        body: JSON.stringify(log)
      });

      if (!response.ok) {
        console.error('Failed to send log to server:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending log to server:', error);
    }
  }

  private async sendMetricToServer(metric: PerformanceMetric): Promise<void> {
    if (!this.isProduction) return;

    try {
      const response = await fetch(`${this.apiEndpoint}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify(metric)
      });

      if (!response.ok) {
        console.error('Failed to send metric to server:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending metric to server:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all logs for debugging
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  // Get all metrics for debugging
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear logs (useful for memory management)
  clearLogs(): void {
    this.logs = [];
    this.metrics = [];
  }

  // Export logs for manual analysis
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      userId: this.userId,
      logs: this.logs,
      metrics: this.metrics,
      timestamp: new Date(),
      platform: Platform.OS,
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0'
    }, null, 2);
  }
}

// Create singleton instance
export const errorLogger = new ErrorLoggingService();

export default errorLogger;
