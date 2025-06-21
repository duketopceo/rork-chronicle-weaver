/**
 * Development Debug System
 * 
 * This module provides comprehensive debugging capabilities for development mode.
 * It includes step-by-step logging, error tracking, performance monitoring,
 * and visual debug indicators.
 */

import React from 'react';

interface DebugStep {
  id: string;
  timestamp: number;
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  duration?: number;
}

interface DebugError {
  id: string;
  timestamp: number;
  error: Error;
  context: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DebugPerformanceMetric {
  id: string;
  timestamp: number;
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

// Type for React Native ErrorUtils
interface ReactNativeGlobal {
  ErrorUtils?: {
    getGlobalHandler: () => ((error: any, isFatal?: boolean) => void) | null;
    setGlobalHandler: (handler: (error: any, isFatal?: boolean) => void) => void;
  };
}

class DebugSystem {
  private steps: DebugStep[] = [];
  private errors: DebugError[] = [];
  private metrics: DebugPerformanceMetric[] = [];
  private isEnabled: boolean = __DEV__;
  private maxSteps: number = 100;
  private maxErrors: number = 50;
  private listeners: ((event: any) => void)[] = [];

  constructor() {
    if (this.isEnabled) {
      this.initializeDebugSystem();
    }
  }

  private initializeDebugSystem() {
    console.log('🔧 Debug System initialized');
    
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError(new Error(event.message), 'Global Error Handler', 'critical');
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(new Error(event.reason), 'Unhandled Promise Rejection', 'critical');
      });
    }    // React Native error handler
    if (typeof global !== 'undefined' && (global as any).ErrorUtils) {
      const errorUtils = (global as any).ErrorUtils;
      const originalHandler = errorUtils.getGlobalHandler();
      errorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
        this.logError(error, 'React Native Global Handler', isFatal ? 'critical' : 'high');
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }

  // Step-by-step logging
  logStep(step: string, message: string, data?: any): string {
    if (!this.isEnabled) return '';

    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const debugStep: DebugStep = {
      id: stepId,
      timestamp: Date.now(),
      step,
      status: 'pending',
      message,
      data,
    };

    this.steps.push(debugStep);
    this.trimSteps();

    console.log(`📝 [STEP] ${step}: ${message}`, data || '');
    this.notifyListeners({ type: 'step', data: debugStep });

    return stepId;
  }

  updateStep(stepId: string, status: DebugStep['status'], message?: string, data?: any) {
    if (!this.isEnabled) return;

    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      const startTime = step.timestamp;
      step.status = status;
      step.duration = Date.now() - startTime;
      if (message) step.message = message;
      if (data) step.data = data;

      const statusEmoji = {
        pending: '⏳',
        success: '✅',
        error: '❌',
        warning: '⚠️'
      };

      console.log(`${statusEmoji[status]} [${status.toUpperCase()}] ${step.step}: ${step.message} (${step.duration}ms)`);
      this.notifyListeners({ type: 'stepUpdate', data: step });
    }
  }

  // Error logging
  logError(error: Error, context: string, severity: DebugError['severity'] = 'medium'): string {
    if (!this.isEnabled) return '';

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const debugError: DebugError = {
      id: errorId,
      timestamp: Date.now(),
      error,
      context,
      stack: error.stack,
      severity,
    };

    this.errors.push(debugError);
    this.trimErrors();

    const severityEmoji = {
      low: '💙',
      medium: '💛',
      high: '🧡',
      critical: '❤️'
    };

    console.error(`${severityEmoji[severity]} [${severity.toUpperCase()}] ${context}:`, error);
    this.notifyListeners({ type: 'error', data: debugError });

    return errorId;
  }

  // Performance metrics
  logMetric(name: string, value: number, unit: string, threshold?: number): string {
    if (!this.isEnabled) return '';

    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let status: DebugPerformanceMetric['status'] = 'good';

    if (threshold) {
      if (value > threshold * 1.5) status = 'critical';
      else if (value > threshold) status = 'warning';
    }

    const metric: DebugPerformanceMetric = {
      id: metricId,
      timestamp: Date.now(),
      name,
      value,
      unit,
      threshold,
      status,
    };

    this.metrics.push(metric);
    this.trimMetrics();

    const statusEmoji = {
      good: '🟢',
      warning: '🟡',
      critical: '🔴'
    };

    console.log(`${statusEmoji[status]} [METRIC] ${name}: ${value}${unit}${threshold ? ` (threshold: ${threshold}${unit})` : ''}`);
    this.notifyListeners({ type: 'metric', data: metric });

    return metricId;
  }

  // Convenience methods for common operations
  startTimer(name: string): () => void {
    const startTime = Date.now();
    const stepId = this.logStep('TIMER', `Started: ${name}`);
    
    return () => {
      const duration = Date.now() - startTime;
      this.updateStep(stepId, 'success', `Completed: ${name}`, { duration });
      this.logMetric(name, duration, 'ms');
    };
  }

  async wrapAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const stepId = this.logStep('ASYNC', `Starting: ${name}`);
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.updateStep(stepId, 'success', `Completed: ${name}`, { duration });
      this.logMetric(`${name}_duration`, duration, 'ms');
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateStep(stepId, 'error', `Failed: ${name}`, { error, duration });
      this.logError(error as Error, `Async operation: ${name}`, 'high');
      throw error;
    }
  }

  // Data access methods
  getSteps(): DebugStep[] {
    return [...this.steps];
  }

  getErrors(): DebugError[] {
    return [...this.errors];
  }

  getMetrics(): DebugPerformanceMetric[] {
    return [...this.metrics];
  }

  getRecentSteps(count: number = 10): DebugStep[] {
    return this.steps.slice(-count);
  }

  getErrorsByContext(context: string): DebugError[] {
    return this.errors.filter(e => e.context.includes(context));
  }

  getCriticalErrors(): DebugError[] {
    return this.errors.filter(e => e.severity === 'critical');
  }

  // Event system
  onDebugEvent(listener: (event: any) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(event: any) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Debug system listener error:', error);
      }
    });
  }

  // Memory management
  private trimSteps() {
    if (this.steps.length > this.maxSteps) {
      this.steps = this.steps.slice(-this.maxSteps);
    }
  }

  private trimErrors() {
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  private trimMetrics() {
    if (this.metrics.length > this.maxSteps) {
      this.metrics = this.metrics.slice(-this.maxSteps);
    }
  }

  // Clear methods
  clearSteps() {
    this.steps = [];
    console.log('🧹 Debug steps cleared');
  }

  clearErrors() {
    this.errors = [];
    console.log('🧹 Debug errors cleared');
  }

  clearMetrics() {
    this.metrics = [];
    console.log('🧹 Debug metrics cleared');
  }

  clearAll() {
    this.clearSteps();
    this.clearErrors();
    this.clearMetrics();
    console.log('🧹 All debug data cleared');
  }

  // Export data for analysis
  exportDebugData() {
    const data = {
      timestamp: Date.now(),
      steps: this.getSteps(),
      errors: this.getErrors(),
      metrics: this.getMetrics(),
      summary: {
        totalSteps: this.steps.length,
        totalErrors: this.errors.length,
        criticalErrors: this.getCriticalErrors().length,
        totalMetrics: this.metrics.length,
      }
    };

    console.log('📊 Debug data export:', data);
    return data;
  }
}

// Create global debug instance
export const debugSystem = new DebugSystem();

// Export types for TypeScript
export type { DebugStep, DebugError, DebugPerformanceMetric };

// Convenience functions
export const logStep = (step: string, message: string, data?: any) => 
  debugSystem.logStep(step, message, data);

export const updateStep = (stepId: string, status: DebugStep['status'], message?: string, data?: any) => 
  debugSystem.updateStep(stepId, status, message, data);

export const logError = (error: Error, context: string, severity?: DebugError['severity']) => 
  debugSystem.logError(error, context, severity);

export const logMetric = (name: string, value: number, unit: string, threshold?: number) => 
  debugSystem.logMetric(name, value, unit, threshold);

export const startTimer = (name: string) => debugSystem.startTimer(name);

export const wrapAsync = <T>(name: string, fn: () => Promise<T>) => 
  debugSystem.wrapAsync(name, fn);

// React hooks for debug data
export const useDebugSteps = () => {
  const [steps, setSteps] = React.useState<DebugStep[]>(debugSystem.getSteps());
  
  React.useEffect(() => {
    const unsubscribe = debugSystem.onDebugEvent((event) => {
      if (event.type === 'step' || event.type === 'stepUpdate') {
        setSteps(debugSystem.getSteps());
      }
    });
    
    return unsubscribe;
  }, []);
  
  return steps;
};

export const useDebugErrors = () => {
  const [errors, setErrors] = React.useState<DebugError[]>(debugSystem.getErrors());
  
  React.useEffect(() => {
    const unsubscribe = debugSystem.onDebugEvent((event) => {
      if (event.type === 'error') {
        setErrors(debugSystem.getErrors());
      }
    });
    
    return unsubscribe;
  }, []);
  
  return errors;
};

export const useDebugMetrics = () => {
  const [metrics, setMetrics] = React.useState<DebugPerformanceMetric[]>(debugSystem.getMetrics());
  
  React.useEffect(() => {
    const unsubscribe = debugSystem.onDebugEvent((event) => {
      if (event.type === 'metric') {
        setMetrics(debugSystem.getMetrics());
      }
    });
    
    return unsubscribe;
  }, []);
  
  return metrics;
};
