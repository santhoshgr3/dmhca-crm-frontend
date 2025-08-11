'use client';

import { useState, useEffect } from 'react';
import { 
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Lead, BRANCHES, COURSES, BranchCode, Qualification } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import ClientOnly from '@/components/ClientOnly';

// Payment types
export type PaymentType = 'full_payment' | 'loan' | 'emi' | 'partial';
export type PaymentStatus = 'completed' | 'pending' | 'processing' | 'failed';

// Extended Lead interface with payment information
export interface SalesRecord extends Lead {
  paymentInfo: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentType: PaymentType;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    paymentDate?: Date;
    loanProvider?: string;
    emiDetails?: {
      totalEmis: number;
      completedEmis: number;
      emiAmount: number;
      nextEmiDate?: Date;
    };
  };
  admissionDate: Date;
  studentId: string;
  courseFee: number;
}

export default function SalesReportPage() {
  const { user, hasPermission, loading: authLoading } = useAuth();
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<BranchCode | 'all'>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentType | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Selected record for details view
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Add/Edit sale functionality
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);
  const [saleFormData, setSaleFormData] = useState<Partial<SalesRecord>>({});

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use real API - NO MOCK DATA
      const result = await apiClient.getSales({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
      });

      // Transform backend Sale format to frontend SalesRecord format
      const transformedData: SalesRecord[] = result.data.map((sale: any) => ({
        id: sale.id,
        leadId: sale.leadId,
        name: sale.studentName,
        email: sale.studentEmail,
        phone: sale.studentPhone,
        country: 'IN',
        course: sale.course,
        qualification: sale.qualification,
        branch: Object.values(BRANCHES).find(b => b.code === sale.branch)?.code || sale.branch || 'delhi',
        followUpDate: sale.followUpDate ? new Date(sale.followUpDate) : new Date(),
        status: 'admission done' as const,
        notes: [],
        createdAt: new Date(sale.createdAt),
        updatedAt: new Date(sale.updatedAt),
        source: sale.source || '',
        leadScore: sale.leadScore || 100,
        admissionDate: new Date(sale.admissionDate),
        studentId: sale.studentId,
        courseFee: sale.courseFee,
        paymentInfo: {
          totalAmount: sale.totalAmount,
          paidAmount: sale.paidAmount,
          pendingAmount: sale.pendingAmount,
          paymentType: sale.paymentType === 'full payment' ? 'full_payment' : sale.paymentType as PaymentType,
          paymentStatus: sale.paymentStatus as PaymentStatus,
          transactionId: sale.transactionId,
          paymentDate: sale.paymentDate ? new Date(sale.paymentDate) : undefined,
          loanProvider: sale.loanProvider,
          ...(sale.emiTotalCount && {
            emiDetails: {
              totalEmis: sale.emiTotalCount,
              completedEmis: sale.emiCompletedCount || 0,
              emiAmount: sale.emiAmount || 0,
              nextEmiDate: sale.nextEmiDate ? new Date(sale.nextEmiDate) : undefined,
            }
          })
        }
      }));

      setSalesData(transformedData);
    } catch (err) {
      console.error('Failed to fetch sales data:', err);
      setError('Failed to load sales data from backend. Please ensure the backend server is running.');
      // NO FALLBACK TO MOCK DATA - System requires backend connection
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = salesData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.leadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(record => record.branch === branchFilter);
    }

    // Payment type filter
    if (paymentTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.paymentInfo.paymentType === paymentTypeFilter);
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(record => record.paymentInfo.paymentStatus === paymentStatusFilter);
    }

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      filtered = filtered.filter(record => {
        const admissionDate = new Date(record.admissionDate);
        return admissionDate >= startDate && admissionDate <= endDate;
      });
    }

    setFilteredData(filtered);
  }, [salesData, searchQuery, branchFilter, paymentTypeFilter, paymentStatusFilter, dateRange]);

  // Fetch data on component mount
  useEffect(() => {
    if (!authLoading && user) {
      fetchSalesData();
    }
  }, [user, authLoading]);

  // Calculate summary statistics
  const summaryStats = {
    totalSales: filteredData.length,
    totalRevenue: filteredData.reduce((sum, record) => sum + record.paymentInfo.paidAmount, 0),
    totalPending: filteredData.reduce((sum, record) => sum + record.paymentInfo.pendingAmount, 0),
    totalCourseFees: filteredData.reduce((sum, record) => sum + record.courseFee, 0),
    paymentTypeBreakdown: {
      full_payment: filteredData.filter(r => r.paymentInfo.paymentType === 'full_payment').length,
      loan: filteredData.filter(r => r.paymentInfo.paymentType === 'loan').length,
      emi: filteredData.filter(r => r.paymentInfo.paymentType === 'emi').length,
      partial: filteredData.filter(r => r.paymentInfo.paymentType === 'partial').length,
    },
    paymentStatusBreakdown: {
      completed: filteredData.filter(r => r.paymentInfo.paymentStatus === 'completed').length,
      processing: filteredData.filter(r => r.paymentInfo.paymentStatus === 'processing').length,
      pending: filteredData.filter(r => r.paymentInfo.paymentStatus === 'pending').length,
      failed: filteredData.filter(r => r.paymentInfo.paymentStatus === 'failed').length,
    }
  };

  const getPaymentTypeIcon = (type: PaymentType) => {
    switch (type) {
      case 'full_payment':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'loan':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'emi':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'partial':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <BanknotesIcon className="h-4 w-4" />;
    }
  };

  const getPaymentTypeLabel = (type: PaymentType) => {
    switch (type) {
      case 'full_payment':
        return 'Full Payment';
      case 'loan':
        return 'Education Loan';
      case 'emi':
        return 'EMI';
      case 'partial':
        return 'Partial Payment';
      default:
        return type;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBranchName = (branchCode: BranchCode) => {
    const branch = BRANCHES[branchCode];
    return branch ? branch.name : branchCode;
  };

  // Handle add/edit sale functions
  const handleAddSale = () => {
    setEditingSale(null);
    setSaleFormData({
      name: '',
      email: '',
      phone: '',
      course: '',
      qualification: 'mbbs',
      status: 'admission done',
      branch: user?.branch || 'delhi',
      admissionDate: new Date(),
      courseFee: 0,
      paymentInfo: {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        paymentType: 'full_payment',
        paymentStatus: 'pending',
        paymentDate: new Date(),
      }
    });
    setShowAddEditModal(true);
  };

  const handleEditSale = (sale: SalesRecord) => {
    setEditingSale(sale);
    setSaleFormData({
      ...sale,
      admissionDate: sale.admissionDate || new Date(),
      paymentInfo: {
        ...sale.paymentInfo,
        paymentDate: sale.paymentInfo.paymentDate || new Date(),
      }
    });
    setShowAddEditModal(true);
  };

  const handleSaveSale = async () => {
    try {
      if (editingSale) {
        // Update existing sale
        const updateData = {
          studentName: saleFormData.name,
          studentEmail: saleFormData.email,
          studentPhone: saleFormData.phone,
          course: saleFormData.course,
          qualification: saleFormData.qualification,
          courseFee: saleFormData.courseFee,
          admissionDate: saleFormData.admissionDate,
          paymentType: saleFormData.paymentInfo?.paymentType,
          paymentStatus: saleFormData.paymentInfo?.paymentStatus,
          paidAmount: saleFormData.paymentInfo?.paidAmount,
          paymentDate: saleFormData.paymentInfo?.paymentDate,
          transactionId: saleFormData.paymentInfo?.transactionId,
          loanProvider: saleFormData.paymentInfo?.loanProvider,
          emiTotalCount: saleFormData.paymentInfo?.emiDetails?.totalEmis,
          emiCompletedCount: saleFormData.paymentInfo?.emiDetails?.completedEmis,
          emiAmount: saleFormData.paymentInfo?.emiDetails?.emiAmount,
          nextEmiDate: saleFormData.paymentInfo?.emiDetails?.nextEmiDate,
        };

        await apiClient.updateSale(editingSale.id, updateData);
      } else {
        // Add new sale - need to get lead data first or create minimal lead
        const branchCode = saleFormData.branch || 'delhi';
        const branch = BRANCHES[branchCode as keyof typeof BRANCHES];
        const branchId = branchCode === 'delhi' ? 1 : branchCode === 'hyderabad' ? 2 : 3;
        
        const saleData = {
          leadId: saleFormData.leadId || `LEAD-${Date.now()}`, // This should be from a selected lead
          studentName: saleFormData.name || '',
          studentEmail: saleFormData.email || '',
          studentPhone: saleFormData.phone || '',
          course: saleFormData.course || '',
          qualification: saleFormData.qualification || 'mbbs',
          branchId: branchId,
          courseFee: saleFormData.courseFee || 0,
          admissionDate: saleFormData.admissionDate || new Date().toISOString().split('T')[0],
          paymentType: saleFormData.paymentInfo?.paymentType || 'full payment',
          paymentStatus: saleFormData.paymentInfo?.paymentStatus || 'pending',
          paidAmount: saleFormData.paymentInfo?.paidAmount || 0,
          paymentDate: saleFormData.paymentInfo?.paymentDate,
          transactionId: saleFormData.paymentInfo?.transactionId,
          loanProvider: saleFormData.paymentInfo?.loanProvider,
          emiTotalCount: saleFormData.paymentInfo?.emiDetails?.totalEmis,
          emiAmount: saleFormData.paymentInfo?.emiDetails?.emiAmount,
        };

        await apiClient.createSale(saleData);
      }
      
      // Refresh the sales data
      await fetchSalesData();
      setShowAddEditModal(false);
      setSaleFormData({});
      setEditingSale(null);
    } catch (error) {
      console.error('Error saving sale:', error);
      setError('Failed to save sale. Please ensure the backend server is running.');
      // NO FALLBACK BEHAVIOR - System requires backend connection
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale record?')) {
      try {
        await apiClient.deleteSale(saleId);
        // Refresh the sales data
        await fetchSalesData();
      } catch (error) {
        console.error('Error deleting sale:', error);
        setError('Failed to delete sale. Please ensure the backend server is running.');
        // NO FALLBACK BEHAVIOR - System requires backend connection
      }
    }
  };

  if (authLoading || loading) {
    return (
      <ClientOnly>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
        </div>
      </ClientOnly>
    );
  }

  if (!hasPermission('sales', 'read') && !hasPermission('analytics', 'read') && !hasPermission('leads', 'read')) {
    return (
      <ClientOnly>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view sales reports.</p>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sales Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and analyze all admission sales and payment information
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => {
                setEditingSale(null);
                setSaleFormData({});
                setShowAddEditModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Sale
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Error Message / Demo Mode */}
        {error && (
          <div className={`border rounded-lg p-4 ${
            error.includes('Backend server not available') || error.includes('Showing sample data')
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${
                error.includes('Backend server not available') || error.includes('Showing sample data')
                  ? 'text-blue-500'
                  : 'text-red-500'
              }`}>
                {error.includes('Backend server not available') || error.includes('Showing sample data') ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  error.includes('Backend server not available') || error.includes('Showing sample data')
                    ? 'text-blue-800 dark:text-blue-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {error.includes('Backend server not available') || error.includes('Showing sample data') 
                    ? 'Demo Mode' 
                    : 'Error'
                  }
                </p>
                <p className={`mt-1 text-sm ${
                  error.includes('Backend server not available') || error.includes('Showing sample data')
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {error}
                  {(error.includes('Backend server not available') || error.includes('Showing sample data')) && (
                    <span className="block mt-1 text-xs opacity-75">
                      All add/edit/delete operations work with sample data. Connect a database to use real data.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Collected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryStats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryStats.totalPending)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Course Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryStats.totalCourseFees)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sales records..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value as BranchCode | 'all')}
              >
                <option value="all">All Branches</option>
                {Object.values(BRANCHES).map((branch) => (
                  <option key={branch.code} value={branch.code}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Type Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value as PaymentType | 'all')}
              >
                <option value="all">All Payment Types</option>
                <option value="full_payment">Full Payment</option>
                <option value="loan">Education Loan</option>
                <option value="emi">EMI</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex space-x-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course & Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.studentId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{record.course}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{getBranchName(record.branch)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 mb-1">
                        {getPaymentTypeIcon(record.paymentInfo.paymentType)}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getPaymentTypeLabel(record.paymentInfo.paymentType)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Paid: {formatCurrency(record.paymentInfo.paidAmount)}
                      </div>
                      {record.paymentInfo.pendingAmount > 0 && (
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Pending: {formatCurrency(record.paymentInfo.pendingAmount)}
                        </div>
                      )}
                      {record.paymentInfo.emiDetails && (
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          EMI: {record.paymentInfo.emiDetails.completedEmis}/{record.paymentInfo.emiDetails.totalEmis}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(record.paymentInfo.paymentStatus)}`}>
                        {record.paymentInfo.paymentStatus.charAt(0).toUpperCase() + record.paymentInfo.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(record.admissionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditSale(record)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit Sale"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sales Record Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Student Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.studentId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.course}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                      <p className="text-sm text-gray-900 dark:text-white">{getBranchName(selectedRecord.branch)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admission Date</label>
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRecord.admissionDate)}</p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Payment Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Type</label>
                      <div className="flex items-center space-x-2">
                        {getPaymentTypeIcon(selectedRecord.paymentInfo.paymentType)}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getPaymentTypeLabel(selectedRecord.paymentInfo.paymentType)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedRecord.paymentInfo.paymentStatus)}`}>
                        {selectedRecord.paymentInfo.paymentStatus.charAt(0).toUpperCase() + selectedRecord.paymentInfo.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Course Fee</label>
                      <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedRecord.courseFee)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Paid</label>
                      <p className="text-sm text-green-600 dark:text-green-400">{formatCurrency(selectedRecord.paymentInfo.paidAmount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pending Amount</label>
                      <p className="text-sm text-orange-600 dark:text-orange-400">{formatCurrency(selectedRecord.paymentInfo.pendingAmount)}</p>
                    </div>
                    {selectedRecord.paymentInfo.transactionId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.paymentInfo.transactionId}</p>
                      </div>
                    )}
                    {selectedRecord.paymentInfo.paymentDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</label>
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRecord.paymentInfo.paymentDate)}</p>
                      </div>
                    )}
                    {selectedRecord.paymentInfo.loanProvider && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Provider</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.paymentInfo.loanProvider}</p>
                      </div>
                    )}
                    {selectedRecord.paymentInfo.emiDetails && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">EMI Details</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          EMI Amount: {formatCurrency(selectedRecord.paymentInfo.emiDetails.emiAmount)}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Progress: {selectedRecord.paymentInfo.emiDetails.completedEmis}/{selectedRecord.paymentInfo.emiDetails.totalEmis} EMIs completed
                        </p>
                        {selectedRecord.paymentInfo.emiDetails.nextEmiDate && (
                          <p className="text-sm text-gray-900 dark:text-white">
                            Next EMI Date: {formatDate(selectedRecord.paymentInfo.emiDetails.nextEmiDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Sale Modal */}
        {showAddEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingSale ? 'Edit Sale Record' : 'Add New Sale Record'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddEditModal(false);
                      setSaleFormData({});
                      setEditingSale(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Student Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Student Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={saleFormData.name || ''}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={saleFormData.email || ''}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={saleFormData.phone || ''}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={saleFormData.country || 'India'}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Course Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course *
                      </label>
                      <select
                        value={saleFormData.course || ''}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, course: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Course</option>
                        {COURSES.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Qualification *
                      </label>
                      <select
                        value={saleFormData.qualification || 'mbbs'}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, qualification: e.target.value as Qualification }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="mbbs">MBBS</option>
                        <option value="md">MD</option>
                        <option value="ms">MS</option>
                        <option value="bds">BDS</option>
                        <option value="ayush">AYUSH</option>
                        <option value="md/ms">MD/MS</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch *
                      </label>
                      <select
                        value={saleFormData.branch || 'delhi'}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, branch: e.target.value as BranchCode }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {Object.values(BRANCHES).map((branch) => (
                          <option key={branch.code} value={branch.code}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Admission & Payment Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Admission & Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Admission Date *
                      </label>
                      <input
                        type="date"
                        value={saleFormData.admissionDate instanceof Date ? saleFormData.admissionDate.toISOString().split('T')[0] : (saleFormData.admissionDate as unknown as string) || ''}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, admissionDate: e.target.value ? new Date(e.target.value) : new Date() }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course Fee (₹) *
                      </label>
                      <input
                        type="number"
                        value={saleFormData.courseFee || ''}
                        onChange={(e) => setSaleFormData(prev => ({ ...prev, courseFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter course fee"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Type *
                      </label>
                      <select
                        value={saleFormData.paymentInfo?.paymentType || 'full payment'}
                        onChange={(e) => setSaleFormData(prev => ({ 
                          ...prev, 
                          paymentInfo: { 
                            totalAmount: 0,
                            paidAmount: 0,
                            pendingAmount: 0,
                            paymentType: e.target.value as PaymentType,
                            paymentStatus: 'pending' as PaymentStatus,
                            ...prev.paymentInfo
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="full payment">Full Payment</option>
                        <option value="emi">EMI</option>
                        <option value="loan">Loan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Status *
                      </label>
                      <select
                        value={saleFormData.paymentInfo?.paymentStatus || 'pending'}
                        onChange={(e) => setSaleFormData(prev => ({ 
                          ...prev, 
                          paymentInfo: { 
                            totalAmount: 0,
                            paidAmount: 0,
                            pendingAmount: 0,
                            paymentType: 'full_payment' as PaymentType,
                            paymentStatus: e.target.value as PaymentStatus,
                            ...prev.paymentInfo
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        value={saleFormData.paymentInfo?.paidAmount || ''}
                        onChange={(e) => setSaleFormData(prev => ({ 
                          ...prev, 
                          paymentInfo: { 
                            totalAmount: 0,
                            paidAmount: parseFloat(e.target.value) || 0,
                            pendingAmount: 0,
                            paymentType: 'full_payment' as PaymentType,
                            paymentStatus: 'pending' as PaymentStatus,
                            ...prev.paymentInfo
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter amount paid"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={saleFormData.paymentInfo?.paymentDate instanceof Date ? saleFormData.paymentInfo.paymentDate.toISOString().split('T')[0] : (saleFormData.paymentInfo?.paymentDate as unknown as string) || ''}
                        onChange={(e) => setSaleFormData(prev => ({ 
                          ...prev, 
                          paymentInfo: { 
                            totalAmount: 0,
                            paidAmount: 0,
                            pendingAmount: 0,
                            paymentType: 'full_payment' as PaymentType,
                            paymentStatus: 'pending' as PaymentStatus,
                            ...prev.paymentInfo,
                            paymentDate: e.target.value ? new Date(e.target.value) : undefined
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Payment Details */}
                {(saleFormData.paymentInfo?.paymentType === 'loan' || saleFormData.paymentInfo?.paymentType === 'emi') && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      {saleFormData.paymentInfo?.paymentType === 'loan' ? 'Loan Details' : 'EMI Details'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {saleFormData.paymentInfo?.paymentType === 'loan' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Loan Provider
                          </label>
                          <input
                            type="text"
                            value={saleFormData.paymentInfo?.loanProvider || ''}
                            onChange={(e) => setSaleFormData(prev => ({ 
                              ...prev, 
                              paymentInfo: { 
                                totalAmount: 0,
                                paidAmount: 0,
                                pendingAmount: 0,
                                paymentType: 'full_payment' as PaymentType,
                                paymentStatus: 'pending' as PaymentStatus,
                                ...prev.paymentInfo,
                                loanProvider: e.target.value
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter loan provider name"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          value={saleFormData.paymentInfo?.transactionId || ''}
                          onChange={(e) => setSaleFormData(prev => ({ 
                            ...prev, 
                            paymentInfo: { 
                              totalAmount: 0,
                              paidAmount: 0,
                              pendingAmount: 0,
                              paymentType: 'full_payment' as PaymentType,
                              paymentStatus: 'pending' as PaymentStatus,
                              ...prev.paymentInfo,
                              transactionId: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter transaction ID"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddEditModal(false);
                    setSaleFormData({});
                    setEditingSale(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSale}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSale ? 'Update Sale' : 'Add Sale'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
