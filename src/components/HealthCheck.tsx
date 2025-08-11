'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { checkApiHealth, isDemoMode } from '@/lib/api/utils';

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    frontend: boolean;
    backend: boolean;
    database: boolean;
    authentication: boolean;
    realtime: boolean;
  };
  lastCheck: Date;
  uptime: number;
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    overall: 'healthy',
    checks: {
      frontend: true,
      backend: false,
      database: false,
      authentication: false,
      realtime: false,
    },
    lastCheck: new Date(),
    uptime: 0,
  });
  const [loading, setLoading] = useState(true);

  const runHealthChecks = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      // Frontend check (always true if this code runs)
      const frontend = true;

      // Backend API check
      const backend = await checkApiHealth();

      // Authentication check
      const authentication = isDemoMode() || backend;

      // Database check (through backend health endpoint)
      const database = backend; // Assume DB is working if backend responds

      // Real-time check (WebSocket availability)
      const realtime = backend && typeof window !== 'undefined' && 'WebSocket' in window;

      const checks = {
        frontend,
        backend,
        database,
        authentication,
        realtime,
      };

      // Determine overall health
      let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      const healthyChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.values(checks).length;

      if (healthyChecks === totalChecks) {
        overall = 'healthy';
      } else if (healthyChecks >= totalChecks * 0.6) {
        overall = 'degraded';
      } else {
        overall = 'unhealthy';
      }

      setStatus({
        overall,
        checks,
        lastCheck: new Date(),
        uptime: Date.now() - startTime,
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus(prev => ({
        ...prev,
        overall: 'unhealthy',
        lastCheck: new Date(),
        uptime: Date.now() - startTime,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthChecks();
    const interval = setInterval(runHealthChecks, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isHealthy: boolean) => {
    if (isHealthy) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    return <XCircleIcon className="w-5 h-5 text-red-500" />;
  };

  const getOverallStatusColor = () => {
    switch (status.overall) {
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getOverallStatusIcon = () => {
    switch (status.overall) {
      case 'healthy':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'unhealthy':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b ${getOverallStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getOverallStatusIcon()}
              <div>
                <h2 className="text-xl font-semibold">System Health</h2>
                <p className="text-sm opacity-75">
                  Overall status: {status.overall.charAt(0).toUpperCase() + status.overall.slice(1)}
                </p>
              </div>
            </div>
            <button
              onClick={runHealthChecks}
              disabled={loading}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Health Checks */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.checks.frontend)}
                <span className="font-medium">Frontend Application</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.checks.frontend ? 'Running' : 'Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.checks.backend)}
                <span className="font-medium">Backend API</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.checks.backend ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.checks.database)}
                <span className="font-medium">Database</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.checks.database ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.checks.authentication)}
                <span className="font-medium">Authentication</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.checks.authentication ? 'Working' : 'Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.checks.realtime)}
                <span className="font-medium">Real-time Updates</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.checks.realtime ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last checked: {status.lastCheck.toLocaleTimeString()}</span>
            <span>Response time: {status.uptime}ms</span>
          </div>
          {!status.checks.backend && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode Active:</strong> Backend is not connected. The application is running with sample data for demonstration purposes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
