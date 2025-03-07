import { ipcRenderer } from 'electron';

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorDetails {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, unknown>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorDetails[] = [];
  private readonly maxLogSize = 100;

  private constructor() {
    this.setupWindowErrorListener();
    this.setupUnhandledRejectionListener();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupWindowErrorListener(): void {
    window.addEventListener('error', (event: ErrorEvent) => {
      this.handleError(event.error, 'high');
    });
  }

  private setupUnhandledRejectionListener(): void {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.handleError(event.reason, 'high');
    });
  }

  public handleError(error: Error | unknown, severity: ErrorSeverity = 'medium', context?: Record<string, unknown>): void {
    const errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      severity,
      timestamp: Date.now(),
      context
    };

    this.logError(errorDetails);
    this.notifyMain(errorDetails);

    if (severity === 'critical') {
      this.handleCriticalError(errorDetails);
    }
  }

  private logError(errorDetails: ErrorDetails): void {
    this.errorLog.push(errorDetails);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    console.error('[ErrorHandler]', errorDetails);
  }

  private notifyMain(errorDetails: ErrorDetails): void {
    ipcRenderer.send('error:report', errorDetails);
  }

  private handleCriticalError(errorDetails: ErrorDetails): void {
    // Implement application recovery or graceful shutdown logic
    ipcRenderer.send('error:critical', errorDetails);
  }

  public getErrorLog(): ErrorDetails[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

export default ErrorHandler;