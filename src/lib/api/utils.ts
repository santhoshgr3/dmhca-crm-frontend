// Production-ready API utilities and error handling
import { toast } from 'react-hot-toast';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export class ApiClientError extends Error implements ApiError {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://dmhcacrm.com/api/v1',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Network status detection
export const isOnline = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

// Request timeout utility
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = API_CONFIG.TIMEOUT
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
};

// Retry utility with exponential backoff
export const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }

    // Don't retry on client errors (4xx)
    if (error instanceof ApiClientError && error.status && error.status >= 400 && error.status < 500) {
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, attempts - 1, delay * 2);
  }
};

// Enhanced error handler
export const handleApiError = (error: any, context?: string): ApiError => {
  let apiError: ApiError;

  if (error instanceof ApiClientError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiClientError(error.message);
  } else if (typeof error === 'string') {
    apiError = new ApiClientError(error);
  } else {
    apiError = new ApiClientError('An unexpected error occurred');
  }

  // Add context if provided
  if (context) {
    apiError.message = `${context}: ${apiError.message}`;
  }

  // Log error for monitoring
  console.error('API Error:', {
    message: apiError.message,
    status: apiError.status,
    code: apiError.code,
    context,
    timestamp: new Date().toISOString(),
  });

  return apiError;
};

// Response validator
export const validateResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails: any = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      // Response body is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiClientError(
      errorMessage,
      response.status,
      response.status.toString(),
      errorDetails
    );
  }

  try {
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    throw new ApiClientError('Invalid response format');
  }
};

// User-friendly error messages
export const getErrorMessage = (error: ApiError): string => {
  if (!error.status) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message || 'An unexpected error occurred.';
  }

  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with existing data.';
    case 422:
      return 'The provided data is invalid. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An error occurred while processing your request.';
  }
};

// Show user-friendly error notifications
export const showErrorNotification = (error: ApiError, context?: string): void => {
  const message = getErrorMessage(error);
  
  if (error.status === 401) {
    toast.error('Session expired. Please log in again.', {
      duration: 5000,
      position: 'top-center',
    });
  } else if (error.status && error.status >= 500) {
    toast.error(message, {
      duration: 8000,
      position: 'top-center',
    });
  } else {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  }
};

// Success notification helper
export const showSuccessNotification = (message: string): void => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

// Connection status monitoring
export const monitorConnection = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    toast.success('Connection restored', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleOffline = () => {
    toast.error('Connection lost. Some features may not work.', {
      duration: 0, // Keep showing until online
      position: 'top-center',
    });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Demo mode detection
export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  return !token || token.startsWith('mock-');
};

// Production readiness checks
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '')}/health`, {
      method: 'GET',
      timeout: 5000,
    } as any);

    return response.ok;
  } catch (error) {
    return false;
  }
};
