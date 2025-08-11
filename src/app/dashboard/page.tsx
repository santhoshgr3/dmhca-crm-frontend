'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserGroupIcon,
  FireIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercentage, formatTime, getStatusColor } from '@/lib/utils';
import { Lead, DashboardStats, BRANCHES, BranchCode } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';
import ClientOnly from '@/components/ClientOnly';
import { 
  apiService as dashboardApi, 
  formatStatValue, 
  calculatePercentageChange, 
  getTimeBasedGreeting, 
  getDashboardRefreshInterval 
} from '@/lib/api/dashboard';

// API service functions - Updated to use imported service
const fetchDashboardData = async (userRole: string, branchId?: string) => {
  const [dashboardStats, followUps, recommendations] = await Promise.all([
    dashboardApi.getDashboardStats(),
    dashboardApi.getTodaysFollowUps(),
    dashboardApi.getAIRecommendations(),
  ]);

  return { dashboardStats, followUps, recommendations };
};

const initialStats: DashboardStats = {
  totalLeads: 0,
  hotLeads: 0,
  todaysCalls: 0,
  conversions: 0,
  revenue: 0,
  conversionRate: 0,
  // Sales metrics
  totalSales: 0,
  totalSalesRevenue: 0,
  pendingPayments: 0,
  fullPayments: 0,
  emiPayments: 0,
  loanPayments: 0,
};

export default function DashboardPage() {
  const { user, isManager, isTeamLead, isCounselor } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [selectedBranch, setSelectedBranch] = useState<BranchCode | 'all'>('all');
  const [todaysCalls, setTodaysCalls] = useState<Lead[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { dashboardStats, followUps, recommendations } = await fetchDashboardData(
        user?.role || '', 
        selectedBranch !== 'all' ? selectedBranch : undefined
      );

      setStats(dashboardStats);
      setTodaysCalls(followUps);
      setAIRecommendations(recommendations);
    } catch (err) {
      logger.error('Error fetching dashboard data', err);
      const errorMessage = 'Failed to load dashboard data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // NO FALLBACK TO MOCK DATA - System requires backend connection
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedBranch]);

  // Real-time data refresh based on user role
  useEffect(() => {
    if (!user) return;
    
    const refreshInterval = getDashboardRefreshInterval();
    const interval = setInterval(() => {
      if (!loading) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [user, loading, selectedBranch]);

  // Quick Action Handlers
  const handleAddNewLead = () => {
    router.push('/leads?action=add');
  };

  const handleStartCalling = () => {
    // Navigate to leads page with filter for today's follow-ups
    router.push('/leads?filter=followup&date=today');
  };

  const handleViewReports = () => {
    router.push('/analytics');
  };

  const handleReviewAlerts = () => {
    // Navigate to leads page with urgent filter or show notifications
    router.push('/leads?filter=urgent');
  };

  // Handle stat card clicks for navigation
  const handleStatCardClick = (statType: string) => {
    switch (statType) {
      case 'totalLeads':
        router.push('/leads');
        break;
      case 'hotLeads':
        router.push('/leads?status=hot');
        break;
      case 'todaysCalls':
        router.push('/leads?filter=followup&date=today');
        break;
      case 'conversions':
        router.push('/leads?status=admission done');
        break;
      case 'totalSales':
        router.push('/sales');
        break;
      case 'salesRevenue':
        router.push('/sales');
        break;
      case 'pendingPayments':
        router.push('/sales?filter=pending');
        break;
      case 'revenue':
        router.push('/analytics');
        break;
      default:
        break;
    }
  };

  // Adjust stats based on user role - removed since we now fetch role-based data from API
  const adjustedStats = stats;

  const statCards = [
    {
      title: 'Total Leads',
      value: (adjustedStats.totalLeads || 0).toLocaleString(),
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive',
      action: 'totalLeads',
    },
    {
      title: 'Hot Leads',
      value: (adjustedStats.hotLeads || 0).toString(),
      icon: FireIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '+8%',
      changeType: 'positive',
      action: 'hotLeads',
    },
    {
      title: 'Total Sales',
      value: (adjustedStats.totalSales || 0).toString(),
      icon: BanknotesIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+18%',
      changeType: 'positive',
      action: 'totalSales',
    },
    {
      title: 'Sales Revenue',
      value: formatCurrency(adjustedStats.totalSalesRevenue || 0),
      icon: CurrencyRupeeIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      change: '+25%',
      changeType: 'positive',
      action: 'salesRevenue',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(adjustedStats.pendingPayments || 0),
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-5%',
      changeType: 'negative',
      action: 'pendingPayments',
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(stats.conversionRate || 0),
      icon: ArrowTrendingUpIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+2.3%',
      changeType: 'positive',
      action: 'conversions',
    },
  ];

  return (
    <ClientOnly>
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={fetchData}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
            </div>
          </div>
        )}

        {/* Page Header */}
        {!loading && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isManager() ? 'Management Dashboard' : 
                   isTeamLead() ? 'Team Dashboard' : 'My Dashboard'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.name}! Here's {isManager() ? 'the overall system overview' : 
                   isTeamLead() ? 'your team\'s performance today' : 'your personal performance today'}.
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  <button
                    onClick={fetchData}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Branch Filter - Only show for managers */}
              {isManager() && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Branch:
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value as BranchCode | 'all')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    disabled={loading}
                  >
                    <option value="all">All Branches</option>
                    {Object.entries(BRANCHES).map(([code, branch]) => (
                      <option key={code} value={code}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat: any) => (
              <div
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleStatCardClick(stat.action)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Calls */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Today's Follow-ups
                      </h2>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {todaysCalls.length} calls
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  {todaysCalls.length > 0 ? (
                    <div className="space-y-4">
                      {todaysCalls.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {lead.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {lead.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {lead.course}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatTime(lead.followUpDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full">
                              <PhoneIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No follow-ups scheduled
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        All caught up for today!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Recommendations
                    </h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {aiRecommendations.map((recommendation: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {recommendation.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {recommendation.description}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                              {recommendation.suggestedAction}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {Math.round(recommendation.confidence * 100)}% confident
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button 
                  onClick={handleAddNewLead}
                  className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Add New Lead
                </button>
                <button 
                  onClick={handleStartCalling}
                  className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Start Calling
                </button>
                <button 
                  onClick={handleViewReports}
                  className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                  View Reports
                </button>
                <button 
                  onClick={handleReviewAlerts}
                  className="flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Review Alerts
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ClientOnly>
  );
}
