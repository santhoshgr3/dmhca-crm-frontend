'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
  backendInfo?: {
    status: string;
    version: string;
    database: boolean;
  };
}

export default function ConnectionMonitor() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
  });
  const [isVisible, setIsVisible] = useState(true);

  const checkConnection = async () => {
    try {
      const health = await apiClient.healthCheck();
      setStatus({
        isConnected: true,
        lastChecked: new Date(),
        backendInfo: health,
      });
    } catch (error: any) {
      setStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error.message || 'Backend connection failed',
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  if (status.isConnected) {
    // Show success message briefly then hide
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
        <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-green-800">
                <CheckCircleIcon className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium text-green-800 dark:text-green-200 text-sm">
                Connected to backend • Database: {status.backendInfo?.database ? 'Connected' : 'Disconnected'}
                {status.backendInfo?.version && ` • v${status.backendInfo.version}`}
              </p>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
              <button
                type="button"
                className="-mr-1 flex p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 sm:-mr-2"
                onClick={() => setIsVisible(false)}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-4 w-4 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state prominently
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-red-800">
              <ExclamationTriangleIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div className="ml-3">
              <p className="font-medium text-red-800 dark:text-red-200">
                Backend Connection Failed
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {status.error} • Last checked: {status.lastChecked.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3 space-x-2">
            <button
              type="button"
              className="bg-red-100 dark:bg-red-800 px-3 py-1 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
              onClick={checkConnection}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
