// Production API Client - No Mock Data or Fallbacks
import { Lead, User, DashboardStats, Course, Branch } from '@/types';
import { 
  validateResponse, 
  withTimeout, 
  withRetry, 
  handleApiError, 
  API_CONFIG,
  ApiClientError 
} from './utils';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new ApiClientError('Authentication required. Please login first.', 401);
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw new ApiClientError('Authentication expired. Please login again.', 401);
    }
    
    return await validateResponse<T>(response);
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    return withRetry(async () => {
      const response = await withTimeout(
        fetch(url, requestOptions),
        API_CONFIG.TIMEOUT
      );
      return this.handleResponse<T>(response);
    });
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const data = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!data.ok) {
      const error = await data.json().catch(() => ({ message: 'Login failed' }));
      throw new ApiClientError(error.message || 'Invalid credentials', data.status);
    }

    const result = await data.json();

    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    
    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } finally {
      // Always clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    return await this.makeRequest<User>(`${API_BASE_URL}/auth/me`);
  }

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      throw new ApiClientError('No refresh token available', 401);
    }

    const data = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!data.ok) {
      throw new ApiClientError('Token refresh failed', 401);
    }

    const result = await data.json();

    // Store new tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
    }

    return result;
  }

  // Lead APIs
  async getLeads(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    status?: string[];
    source?: string[];
    qualification?: string[];
    branch?: string[];
    assignedTo?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: Lead[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) params.status.forEach(s => searchParams.append('status', s));
    if (params?.source) params.source.forEach(s => searchParams.append('source', s));
    if (params?.qualification) params.qualification.forEach(q => searchParams.append('qualification', q));
    if (params?.branch) params.branch.forEach(b => searchParams.append('branch', b));
    if (params?.assignedTo) params.assignedTo.forEach(a => searchParams.append('assignedTo', a));
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    
    return await this.makeRequest<{ data: Lead[]; pagination: any }>(
      `${API_BASE_URL}/leads?${searchParams}`
    );
  }

  async getLead(leadId: string): Promise<Lead> {
    return await this.makeRequest<Lead>(`${API_BASE_URL}/leads/${leadId}`);
  }

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    return await this.makeRequest<Lead>(`${API_BASE_URL}/leads`, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(leadId: string, leadData: Partial<Lead>): Promise<Lead> {
    return await this.makeRequest<Lead>(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(leadId: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'DELETE',
    });
  }

  async addLeadNote(leadId: string, note: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async assignLead(leadId: string, assignedTo: string, reason?: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/leads/${leadId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo, reason }),
    });
  }

  async updateLeadStatus(leadId: string, status: string, note?: string): Promise<Lead> {
    return await this.makeRequest<Lead>(`${API_BASE_URL}/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // User APIs
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; branch?: string }): Promise<{ data: User[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.branch) searchParams.append('branch', params.branch);
    
    return await this.makeRequest<{ data: User[]; pagination: any }>(
      `${API_BASE_URL}/users?${searchParams}`
    );
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    return await this.makeRequest<User>(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return await this.makeRequest<User>(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard APIs
  async getDashboardStats(branch?: string, dateFrom?: string, dateTo?: string): Promise<DashboardStats> {
    const searchParams = new URLSearchParams();
    if (branch) searchParams.append('branch', branch);
    if (dateFrom) searchParams.append('dateFrom', dateFrom);
    if (dateTo) searchParams.append('dateTo', dateTo);
    
    return await this.makeRequest<DashboardStats>(
      `${API_BASE_URL}/analytics/dashboard?${searchParams}`
    );
  }

  async getTodaysFollowUps(): Promise<Lead[]> {
    return await this.makeRequest<Lead[]>(`${API_BASE_URL}/analytics/followups/today`);
  }

  async getRecentActivities(limit?: number): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());
    
    return await this.makeRequest<any[]>(
      `${API_BASE_URL}/analytics/activities/recent?${searchParams}`
    );
  }

  // Sales APIs
  async getSales(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    paymentStatus?: string[];
    paymentType?: string[];
    branch?: string[];
    qualification?: string[];
    counselor?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.paymentStatus) params.paymentStatus.forEach(status => searchParams.append('paymentStatus', status));
    if (params?.paymentType) params.paymentType.forEach(type => searchParams.append('paymentType', type));
    if (params?.branch) params.branch.forEach(branch => searchParams.append('branch', branch));
    if (params?.qualification) params.qualification.forEach(qual => searchParams.append('qualification', qual));
    if (params?.counselor) params.counselor.forEach(counselor => searchParams.append('counselor', counselor));
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    
    return await this.makeRequest<{ data: any[]; pagination: any }>(
      `${API_BASE_URL}/sales?${searchParams}`
    );
  }

  async getSale(saleId: string): Promise<any> {
    return await this.makeRequest<any>(`${API_BASE_URL}/sales/${saleId}`);
  }

  async createSale(saleData: any): Promise<any> {
    return await this.makeRequest<any>(`${API_BASE_URL}/sales`, {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async updateSale(saleId: string, saleData: any): Promise<any> {
    return await this.makeRequest<any>(`${API_BASE_URL}/sales/${saleId}`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    });
  }

  async deleteSale(saleId: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/sales/${saleId}`, {
      method: 'DELETE',
    });
  }

  // Branch APIs
  async getBranches(): Promise<Branch[]> {
    return await this.makeRequest<Branch[]>(`${API_BASE_URL}/branches`);
  }

  // Course APIs
  async getCourses(): Promise<Course[]> {
    return await this.makeRequest<Course[]>(`${API_BASE_URL}/courses`);
  }

  // Communication APIs
  async getCommunications(leadId: string): Promise<any[]> {
    return await this.makeRequest<any[]>(`${API_BASE_URL}/communications/lead/${leadId}`);
  }

  async createCommunication(communicationData: any): Promise<any> {
    return await this.makeRequest<any>(`${API_BASE_URL}/communications`, {
      method: 'POST',
      body: JSON.stringify(communicationData),
    });
  }

  // Notification APIs
  async getNotifications(page?: number, limit?: number): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());
    
    return await this.makeRequest<{ data: any[]; pagination: any }>(
      `${API_BASE_URL}/notifications?${searchParams}`
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
    });
  }

  // Analytics APIs
  async getAnalytics(type: string, params?: any): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          searchParams.append(key, params[key].toString());
        }
      });
    }
    
    return await this.makeRequest<any>(
      `${API_BASE_URL}/analytics/${type}?${searchParams}`
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; database: boolean; version: string }> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiClientError('Backend server is not available', 503);
    }

    return await response.json();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export commonly used methods for convenience
export const {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addLeadNote,
  updateLeadStatus,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  getTodaysFollowUps,
  getRecentActivities,
  getBranches,
  getCourses,
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getCommunications,
  createCommunication,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAnalytics,
  healthCheck,
} = apiClient;
