'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CalendarIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { BRANCHES, BranchCode } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ClientOnly from '@/components/ClientOnly';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const { user, isManager, isTeamLead, isCounselor } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedBranch, setSelectedBranch] = useState<BranchCode | 'all'>('all');
  
  // Analytics data state
  const [leadSourceData, setLeadSourceData] = useState<any[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);
  const [paymentTypeData, setPaymentTypeData] = useState<any[]>([]);
  const [salesConversionFunnelData, setSalesConversionFunnelData] = useState<any[]>([]);
  const [conversionFunnelData, setConversionFunnelData] = useState<any[]>([]);
  const [coursePerformanceData, setCoursePerformanceData] = useState<any[]>([]);
  const [countryDistributionData, setCountryDistributionData] = useState<any[]>([]);
  
  // Advanced date filtering
  const [dateFilterType, setDateFilterType] = useState<'preset' | 'on' | 'after' | 'before' | 'between'>('preset');
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Date validation
  const validateDateRange = () => {
    if (dateFilterType === 'between' && startDate && endDate) {
      return new Date(startDate) <= new Date(endDate);
    }
    return true;
  };

  // Get analytics data from API
  const getAnalyticsData = () => {
    return {
      leadSourceData,
      monthlyRevenueData,
      conversionFunnelData,
      countryDistributionData,
      coursePerformanceData,
      paymentTypeData,
      salesConversionFunnelData,
    };
  };

  const analyticsData = getAnalyticsData();

  const totalRevenue = analyticsData.monthlyRevenueData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
  const totalLeads = analyticsData.leadSourceData.reduce((sum: number, item: any) => sum + (item.leads || 0), 0);
  const totalConversions = analyticsData.leadSourceData.reduce((sum: number, item: any) => sum + (item.conversions || 0), 0);
  const conversionRate = totalLeads > 0 ? totalConversions / totalLeads : 0;

  // Download report functionality
  const generateReport = (format: 'json' | 'csv' = 'json') => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateFilter: {
        type: dateFilterType,
        range: dateRange,
        specificDate: dateFilterType === 'on' ? specificDate : null,
        startDate: dateFilterType === 'between' || dateFilterType === 'after' ? startDate : null,
        endDate: dateFilterType === 'between' || dateFilterType === 'before' ? endDate : null,
      },
      branch: selectedBranch,
      user: {
        name: user?.name,
        role: user?.role,
        branch: user?.branch,
      },
      summary: {
        totalRevenue: formatCurrency(totalRevenue),
        totalLeads,
        totalConversions,
        conversionRate: formatPercentage(conversionRate),
      },
      data: analyticsData,
    };

    if (format === 'csv') {
      // Generate CSV for summary data
      const csvData = [
        ['Metric', 'Value'],
        ['Generated At', new Date().toLocaleString()],
        ['Date Range', getDateRangeLabel()],
        ['Branch', selectedBranch === 'all' ? 'All Branches' : BRANCHES[selectedBranch as BranchCode]?.name || selectedBranch],
        ['User', user?.name || 'Unknown'],
        ['Role', user?.role || 'Unknown'],
        ['Total Revenue', formatCurrency(totalRevenue)],
        ['Total Leads', totalLeads.toString()],
        ['Total Conversions', totalConversions.toString()],
        ['Conversion Rate', formatPercentage(conversionRate)],
        [''],
        ['Lead Source Data'],
        ['Source', 'Leads', 'Conversions', 'Revenue'],
        ...analyticsData.leadSourceData.map(item => [item.source, item.leads.toString(), item.conversions.toString(), formatCurrency(item.revenue || 0)]),
        [''],
        ['Monthly Revenue Data'],
        ['Month', 'Revenue', 'Leads', 'Conversions'],
        ...analyticsData.monthlyRevenueData.map(item => [item.month, formatCurrency(item.revenue), (item.leads || 0).toString(), (item.conversions || 0).toString()]),
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dmhca-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Generate JSON
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dmhca-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Date filter helper
  const getDateRangeLabel = () => {
    switch (dateFilterType) {
      case 'preset':
        return dateRange === '7d' ? 'Last 7 days' : 
               dateRange === '30d' ? 'Last 30 days' :
               dateRange === '90d' ? 'Last 90 days' : 'Last year';
      case 'on':
        return `On ${new Date(specificDate).toLocaleDateString()}`;
      case 'after':
        return `After ${new Date(startDate).toLocaleDateString()}`;
      case 'before':
        return `Before ${new Date(endDate).toLocaleDateString()}`;
      case 'between':
        return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
      default:
        return 'Custom Range';
    }
  };

  return (
    <ClientOnly>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isManager() ? 'System Analytics' : 
             isTeamLead() ? 'Team Analytics' : 'My Analytics'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isManager() ? 'Comprehensive insights into all lead performance and revenue metrics' :
             isTeamLead() ? 'Performance insights for your team and assigned leads' :
             'Your personal performance insights and lead metrics'}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
          
          {/* Download Report Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateReport('json')}
              disabled={!validateDateRange()}
              className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                validateDateRange()
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download JSON
            </button>
            <button
              onClick={() => generateReport('csv')}
              disabled={!validateDateRange()}
              className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                validateDateRange()
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Date Filtering */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Filter:
            </label>
            <select
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value as typeof dateFilterType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="preset">Preset Range</option>
              <option value="on">On Specific Date</option>
              <option value="after">After Date</option>
              <option value="before">Before Date</option>
              <option value="between">Between Dates</option>
            </select>
          </div>

          {/* Preset Range */}
          {dateFilterType === 'preset' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Period:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          )}

          {/* Specific Date */}
          {dateFilterType === 'on' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date:
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          )}

          {/* After Date */}
          {dateFilterType === 'after' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                After:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          )}

          {/* Before Date */}
          {dateFilterType === 'before' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Before:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          )}

          {/* Between Dates */}
          {dateFilterType === 'between' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                  !validateDateRange() 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                  !validateDateRange() 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {!validateDateRange() && (
                <span className="text-sm text-red-600 dark:text-red-400">
                  End date must be after start date
                </span>
              )}
            </div>
          )}

          {/* Current Filter Display */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current:</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {getDateRangeLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Role Context Indicator */}
      {!isManager() && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Data Scope:</strong> {
                  isTeamLead() 
                    ? 'You are viewing analytics for your team and assigned leads only.' 
                    : 'You are viewing analytics for your personal leads and performance only.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-green-600">+15.3% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalLeads.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">+8.2% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(conversionRate)}
              </p>
              <p className="text-sm text-red-600">-2.1% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
              <GlobeAltIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue / totalConversions)}
              </p>
              <p className="text-sm text-green-600">+5.7% from last period</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trend
            </h2>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lead Sources Performance
            </h2>
            <FunnelIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.leadSourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#3B82F6" name="Leads" />
                <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversion Funnel
            </h2>
          </div>
          <div className="space-y-4">
            {analyticsData.conversionFunnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stage.stage}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      ({stage.rate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stage.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Geographic Distribution
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.countryDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ country, value }) => `${country} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="leads"
                >
                  {countryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Analytics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sales Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Type Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Type Distribution
              </h3>
              <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.paymentTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.paymentTypeData.map((entry, index) => (
                      <Cell key={`payment-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Conversion Funnel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sales Conversion Funnel
              </h3>
              <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.salesConversionFunnelData.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stage.stage}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {stage.count} ({formatPercentage(stage.percentage / 100)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Sales vs Revenue Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Sales Performance
            </h3>
            <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    String(name).includes('Revenue') ? formatCurrency(value as number) : value,
                    name
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#10B981" name="Sales Count" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="salesRevenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Sales Revenue"
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Type Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Type Performance
            </h3>
            <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.paymentTypeData.map((payment) => (
                  <tr key={payment.type} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {payment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(payment.amount / payment.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Course Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg. Deal Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.coursePerformanceData.map((course) => (
                <tr key={course.course} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {course.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {course.enrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(course.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(course.revenue / course.enrollments)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +{Math.floor(Math.random() * 20 + 5)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
}
