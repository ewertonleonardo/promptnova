import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorDetails {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, unknown>;
}

class MainErrorHandler {
  private static instance: MainErrorHandler;
  private errorLog: ErrorDetails[] = [];
  private readonly maxLogSize = 1000;
  private readonly logFilePath: string;

  private constructor() {
    this.logFilePath = path.join(app.getPath('userData'), 'error.log');
    this.setupIpcHandlers();
    this.setupProcessHandlers();
  }

  public static getInstance(): MainErrorHandler {
    if (!MainErrorHandler.instance) {
      MainErrorHandler.instance = new MainErrorHandler();
    }
    return MainErrorHandler.instance;
  }

  private setupIpcHandlers(): void {
    ipcMain.on('error:report', (_, errorDetails: ErrorDetails) => {
      this.handleError(errorDetails);
    });

    ipcMain.on('error:critical', (_, errorDetails: ErrorDetails) => {
      this.handleCriticalError(errorDetails);
    });
  }

  private setupProcessHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      this.handleError({
        message: error.message,
        stack: error.stack,
        severity: 'critical',
        timestamp: Date.now()
      });
    });

    process.on('unhandledRejection', (reason: unknown) => {
      this.handleError({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        severity: 'high',
        timestamp: Date.now()
      });
    });
  }

  public handleError(errorDetails: ErrorDetails): void {
    this.logError(errorDetails);
    this.persistError(errorDetails);

    if (errorDetails.severity === 'critical') {
      this.handleCriticalError(errorDetails);
    }
  }

  private logError(errorDetails: ErrorDetails): void {
    this.errorLog.push(errorDetails);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    console.error('[MainErrorHandler]', errorDetails);
  }

  private persistError(errorDetails: ErrorDetails): void {
    const logEntry = `${new Date(errorDetails.timestamp).toISOString()} [${errorDetails.severity}] ${errorDetails.message}\n${errorDetails.stack || ''}\n\n`;
    
    fs.appendFile(this.logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Failed to write to error log file:', err);
      }
    });
  }

  private handleCriticalError(errorDetails: ErrorDetails): void {
    // Log the critical error
    console.error('[CRITICAL ERROR]', errorDetails);

    // Attempt to save any unsaved data or perform cleanup
    this.performEmergencyCleanup();

    // Restart the application after a brief delay
    setTimeout(() => {
      app.relaunch();
      app.exit(1);
    }, 1000);
  }

  private performEmergencyCleanup(): void {
    // Implement cleanup logic here
    // For example: save application state, close connections, etc.
  }

  public getErrorLog(): ErrorDetails[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public getLogFilePath(): string {
    return this.logFilePath;
  }
}

export default MainErrorHandler;