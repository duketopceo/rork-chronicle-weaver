/**
 * AI Logger Utility
 * 
 * Comprehensive logging system for AI operations with multiple log levels,
 * context tracking, and performance monitoring.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  provider?: string;
  model?: string;
  operation?: string;
  turnCount?: number;
  timestamp?: number;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: number;
  stack?: string;
}

class AILogger {
  private static instance: AILogger;
  private logLevel: LogLevel = LogLevel.DEBUG;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private sessionId: string;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.log(LogLevel.INFO, 'AILogger initialized', { sessionId: this.sessionId });
  }

  public static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.log(LogLevel.INFO, `Log level set to ${LogLevel[level]}`);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context: {
        ...context,
        sessionId: this.sessionId,
      },
      error,
      timestamp: Date.now(),
      stack: error?.stack,
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    this.consoleOutput(entry);
  }

  private consoleOutput(entry: LogEntry): void {
    const levelStr = LogLevel[entry.level];
    const timestamp = new Date(entry.timestamp).toISOString();
    
    // Format context based on environment for performance
    const contextStr = entry.context 
      ? (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
        ? JSON.stringify(entry.context, null, 2)
        : JSON.stringify(entry.context))
      : '';
    
    const prefix = `[${timestamp}] [${levelStr}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}`, contextStr);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}`, contextStr);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}`, contextStr);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${entry.message}`, contextStr, entry.error);
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public logAPIRequest(provider: string, messages: any[], context?: LogContext): void {
    this.info('AI API Request', {
      ...context,
      provider,
      messageCount: messages.length,
      firstMessageRole: messages[0]?.role,
      lastMessageRole: messages[messages.length - 1]?.role,
    });
  }

  public logAPIResponse(provider: string, response: any, duration: number, context?: LogContext): void {
    this.info('AI API Response', {
      ...context,
      provider,
      duration,
      hasResponse: !!response,
      responseType: typeof response,
    });
  }

  public logAPIError(provider: string, error: Error, context?: LogContext): void {
    this.error('AI API Error', {
      ...context,
      provider,
      errorMessage: error.message,
      errorName: error.name,
    }, error);
  }

  public logFailover(fromProvider: string, toProvider: string, reason: string, context?: LogContext): void {
    this.warn('AI Provider Failover', {
      ...context,
      fromProvider,
      toProvider,
      reason,
    });
  }

  public logContextUpdate(operation: string, contextSize: number, context?: LogContext): void {
    this.debug('Context Update', {
      ...context,
      operation,
      contextSize,
    });
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const aiLogger = AILogger.getInstance();

// Convenience functions
export const logAIDebug = (message: string, context?: LogContext) => aiLogger.debug(message, context);
export const logAIInfo = (message: string, context?: LogContext) => aiLogger.info(message, context);
export const logAIWarn = (message: string, context?: LogContext) => aiLogger.warn(message, context);
export const logAIError = (message: string, context?: LogContext, error?: Error) => aiLogger.error(message, context, error);
