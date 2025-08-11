// Production Logger Configuration
// Replace console.log statements with this logger

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

class ProductionLogger {
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  error(message: string, data?: any) {
    if (this.isProduction) {
      // Send to error tracking service (Sentry, LogRocket, etc.)
      this.sendToErrorService('error', message, data);
    } else {
      console.error(message, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.isProduction) {
      this.sendToErrorService('warn', message, data);
    } else {
      console.warn(message, data);
    }
  }

  info(message: string, data?: any) {
    if (!this.isProduction) {
      console.info(message, data);
    }
    // In production, only log critical info
  }

  debug(message: string, data?: any) {
    if (!this.isProduction) {
      console.log(message, data);
    }
    // Never log debug in production
  }

  private sendToErrorService(level: string, message: string, data?: any) {
    // Implement your error tracking service here
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    // For now, store in local storage or send to your API
    try {
      if (typeof window !== 'undefined') {
        const logEntry = {
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        };
        
        // Option 1: Store locally (for later sending)
        const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('error_logs', JSON.stringify(logs.slice(-100))); // Keep last 100
        
        // Option 2: Send to your error tracking endpoint
        // fetch('/api/logs', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(logEntry)
        // });
      }
    } catch (error) {
      // Fail silently in production
    }
  }

  // Method to send collected logs to server
  async flushLogs() {
    if (typeof window !== 'undefined') {
      try {
        const logs = localStorage.getItem('error_logs');
        if (logs) {
          // Send to your server
          await fetch('/api/logs/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: logs
          });
          localStorage.removeItem('error_logs');
        }
      } catch (error) {
        // Fail silently
      }
    }
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Usage examples:
// Replace: console.log('Debug info', data)
// With: logger.debug('Debug info', data)

// Replace: console.error('API Error', error)
// With: logger.error('API Error', error)

// Replace: console.warn('Warning message')
// With: logger.warn('Warning message')
