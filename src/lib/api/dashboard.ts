// Production API utility for dashboard functionality - dmhcacrm.com
import { DashboardStats, Lead } from '@/types';
import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dmhcacrm.com/api/v1';

class ApiService {
  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      logger.error('Dashboard API error', error);
      throw new Error('Failed to load dashboard statistics. Please check your connection and try again.');
    }
  }

  // Get today's follow-ups
  async getTodaysFollowUps(): Promise<Lead[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/follow-ups/today`, {
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      logger.error('Follow-ups API error', error);
      throw new Error('Failed to load today\'s follow-ups. Please check your connection and try again.');
    }
  }

  // Get AI recommendations
  async getAIRecommendations(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/ai-recommendations`, {
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      logger.error('AI Recommendations API error', error);
      throw new Error('Failed to load AI recommendations. Please check your connection and try again.');
    }
  }

  // Update lead status
  async updateLeadStatus(leadId: string, status: string, notes?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      
      await this.handleResponse(response);
    } catch (error) {
      logger.error('Lead update API error', error);
      throw new Error('Failed to update lead status. Please check your connection and try again.');
    }
  }

  // Schedule follow-up
  async scheduleFollowUp(leadId: string, followUpDate: Date, notes: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/follow-up`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          followUpDate: followUpDate.toISOString(), 
          notes 
        }),
      });
      
      await this.handleResponse(response);
    } catch (error) {
      logger.error('Follow-up scheduling API error', error);
      throw new Error('Failed to schedule follow-up. Please check your connection and try again.');
    }
  }

  // Setup real-time updates
  setupRealTimeUpdates(onUpdate: (data: any) => void): () => void {
    // Production WebSocket connection
    const wsUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(`${wsUrl}/ws`);
      
      ws.onopen = () => {
        logger.debug('WebSocket connected for real-time updates');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          logger.error('WebSocket message parsing error', error);
        }
      };
      
      ws.onerror = (error) => {
        logger.error('WebSocket connection error', error);
      };
      
    } catch (error) {
      logger.error('WebSocket setup error', error);
    }

    // Return cleanup function
    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }
}

export const apiService = new ApiService();

// Utility functions
export const formatStatValue = (value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string => {
  if (type === 'currency') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  }
  
  if (type === 'percentage') {
    return `${value}%`;
  }
  
  return new Intl.NumberFormat('en-IN').format(value);
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getDashboardRefreshInterval = (): number => {
  // Refresh every 5 minutes in production
  return 5 * 60 * 1000;
};
