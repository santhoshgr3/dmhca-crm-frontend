// API service layer for DMHCA CRM
import { 
  Lead, 
  LeadFormData, 
  Counselor, 
  CounselorFormData, 
  Sale, 
  Course, 
  Hospital, 
  Communication, 
  ApiResponse, 
  DashboardStats,
  FunnelMetrics,
  RevenueMetrics,
  AnalyticsFilter,
  WhatsAppTemplate,
  EmailTemplate,
  DripWorkflow,
  AutoAssignmentRule,
  AIRecommendation,
  AuditLog
} from '@/types';
import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage in browser environment
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error('API request failed', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Leads API
  async getLeads(filters?: any, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.request<Lead[]>(`/leads?${params}`);
  }

  async getLead(id: string) {
    return this.request<Lead>(`/leads/${id}`);
  }

  async createLead(data: LeadFormData) {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(id: string, data: Partial<Lead>) {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, { method: 'DELETE' });
  }

  async assignLead(leadId: string, counselorId: string) {
    return this.request(`/leads/${leadId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ counselorId }),
    });
  }

  async addLeadNote(leadId: string, content: string) {
    return this.request(`/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getTopLeads(limit = 10) {
    return this.request<Lead[]>(`/leads/top?limit=${limit}`);
  }

  async getTodaysFollowups() {
    return this.request<Lead[]>('/leads/followups/today');
  }

  // Counselors API
  async getCounselors() {
    return this.request<Counselor[]>('/counselors');
  }

  async getCounselor(id: string) {
    return this.request<Counselor>(`/counselors/${id}`);
  }

  async createCounselor(data: CounselorFormData) {
    return this.request<Counselor>('/counselors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCounselor(id: string, data: Partial<Counselor>) {
    return this.request<Counselor>(`/counselors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getCounselorPerformance(id: string, period = '30d') {
    return this.request(`/counselors/${id}/performance?period=${period}`);
  }

  // Sales API
  async getSales(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request<Sale[]>(`/sales?${params}`);
  }

  async createSale(data: Omit<Sale, 'id' | 'createdAt'>) {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRevenueMetrics(filters?: AnalyticsFilter) {
    return this.request<RevenueMetrics>('/analytics/revenue', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Courses API
  async getCourses() {
    return this.request<Course[]>('/courses');
  }

  async getPublicCourses() {
    return this.request<Course[]>('/public/courses');
  }

  async getCourse(id: string) {
    return this.request<Course>(`/courses/${id}`);
  }

  async createCourse(data: Omit<Course, 'id'>) {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Hospitals API
  async getHospitals() {
    return this.request<Hospital[]>('/hospitals');
  }

  async getHospital(id: string) {
    return this.request<Hospital>(`/hospitals/${id}`);
  }

  async searchHospitals(query: string, filters?: any) {
    const params = new URLSearchParams({ query, ...filters });
    return this.request<Hospital[]>(`/hospitals/search?${params}`);
  }

  // Communications API
  async getCommunications(leadId?: string) {
    const params = leadId ? `?leadId=${leadId}` : '';
    return this.request<Communication[]>(`/communications${params}`);
  }

  async sendWhatsApp(leadId: string, templateId: string, variables?: any) {
    return this.request('/communications/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ leadId, templateId, variables }),
    });
  }

  async sendEmail(leadId: string, templateId: string, variables?: any) {
    return this.request('/communications/email', {
      method: 'POST',
      body: JSON.stringify({ leadId, templateId, variables }),
    });
  }

  // Templates API
  async getWhatsAppTemplates() {
    return this.request<WhatsAppTemplate[]>('/templates/whatsapp');
  }

  async getEmailTemplates() {
    return this.request<EmailTemplate[]>('/templates/email');
  }

  // Workflows API
  async getDripWorkflows() {
    return this.request<DripWorkflow[]>('/workflows/drip');
  }

  async createDripWorkflow(data: Omit<DripWorkflow, 'id'>) {
    return this.request<DripWorkflow>('/workflows/drip', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Auto Assignment API
  async getAutoAssignmentRules() {
    return this.request<AutoAssignmentRule[]>('/auto-assignment/rules');
  }

  async createAutoAssignmentRule(data: Omit<AutoAssignmentRule, 'id'>) {
    return this.request<AutoAssignmentRule>('/auto-assignment/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics API
  async getDashboardStats() {
    return this.request<DashboardStats>('/analytics/dashboard');
  }

  async getFunnelMetrics(filters?: AnalyticsFilter) {
    return this.request<FunnelMetrics[]>('/analytics/funnel', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getCohortAnalytics(filters?: AnalyticsFilter) {
    return this.request('/analytics/cohort', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // AI Recommendations API
  async getAIRecommendations(leadId?: string) {
    const params = leadId ? `?leadId=${leadId}` : '';
    return this.request<AIRecommendation[]>(`/ai/recommendations${params}`);
  }

  async getChurnAlerts() {
    return this.request<AIRecommendation[]>('/ai/churn-alerts');
  }

  // Bulk Operations API
  async bulkImportLeads(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/leads/bulk-import', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async exportLeads(filters?: any) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/leads/export?${params}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
    return response.blob();
  }

  // Audit Logs API
  async getAuditLogs(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request<AuditLog[]>(`/audit-logs?${params}`);
  }

  // Translation API
  async translateText(text: string, targetLanguage: string) {
    return this.request<{ translatedText: string }>('/translation/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage }),
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
