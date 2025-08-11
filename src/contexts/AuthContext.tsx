'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission } from '@/types';
import { apiClient } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, action: string, scope?: string) => boolean;
  canAccessResource: (resource: string) => boolean;
  isManager: () => boolean;
  isTeamLead: () => boolean;
  isCounselor: () => boolean;
  getAccessibleLeads: (allLeads: any[]) => any[];
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default permissions for each role
const getDefaultPermissions = (role: UserRole): Permission[] => {
  switch (role) {
    case 'manager':
      return [
        { resource: 'leads', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
        { resource: 'analytics', actions: ['read'], scope: 'all' },
        { resource: 'sales', actions: ['read', 'manage'], scope: 'all' },
        { resource: 'communications', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
        { resource: 'settings', actions: ['read', 'update', 'manage'], scope: 'all' },
        { resource: 'hospitals', actions: ['read', 'update'], scope: 'all' },
        { resource: 'courses', actions: ['read', 'update'], scope: 'all' },
      ];
    
    case 'team_lead':
      return [
        { resource: 'leads', actions: ['create', 'read', 'update', 'delete'], scope: 'team' },
        { resource: 'analytics', actions: ['read'], scope: 'team' },
        { resource: 'sales', actions: ['read'], scope: 'team' },
        { resource: 'communications', actions: ['create', 'read', 'update'], scope: 'team' },
        { resource: 'users', actions: ['read'], scope: 'team' },
        { resource: 'settings', actions: ['read'], scope: 'own' },
        { resource: 'hospitals', actions: ['read'], scope: 'all' },
        { resource: 'courses', actions: ['read'], scope: 'all' },
      ];
    
    case 'counselor':
      return [
        { resource: 'leads', actions: ['create', 'read', 'update'], scope: 'own' },
        { resource: 'analytics', actions: ['read'], scope: 'own' },
        { resource: 'sales', actions: ['read'], scope: 'own' },
        { resource: 'communications', actions: ['create', 'read', 'update'], scope: 'own' },
        { resource: 'settings', actions: ['read'], scope: 'own' },
        { resource: 'hospitals', actions: ['read'], scope: 'all' },
        { resource: 'courses', actions: ['read'], scope: 'all' },
      ];
    
    default:
      return [];
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check for stored auth on mount and try to get current user
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user with stored token
          const currentUser = await apiClient.getCurrentUser();
          // Ensure user has permissions based on role
          if (!currentUser.permissions || currentUser.permissions.length === 0) {
            currentUser.permissions = getDefaultPermissions(currentUser.role);
          }
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
        setIsHydrated(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);
      
      // Ensure user has permissions based on role
      if (!response.user.permissions || response.user.permissions.length === 0) {
        response.user.permissions = getDefaultPermissions(response.user.role);
      }
      
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      // Ensure user has permissions based on role
      if (!currentUser.permissions || currentUser.permissions.length === 0) {
        currentUser.permissions = getDefaultPermissions(currentUser.role);
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!user) return false;
    
    const permission = user.permissions.find(p => p.resource === resource);
    if (!permission) return false;
    
    const hasAction = permission.actions.includes(action as any) || permission.actions.includes('manage');
    if (!hasAction) return false;
    
    if (scope && permission.scope !== 'all' && permission.scope !== scope) {
      return false;
    }
    
    return true;
  };

  const canAccessResource = (resource: string): boolean => {
    if (!user) return false;
    return user.permissions.some(p => p.resource === resource);
  };

  const isManager = (): boolean => user?.role === 'manager';
  const isTeamLead = (): boolean => user?.role === 'team_lead';
  const isCounselor = (): boolean => user?.role === 'counselor';

  const getAccessibleLeads = (allLeads: any[]): any[] => {
    if (!user) return [];
    
    if (user.role === 'manager') {
      return allLeads; // Managers see all leads from all branches
    } else if (user.role === 'team_lead') {
      // Team leads see their team's leads within their branch
      return allLeads.filter(lead => 
        lead.branch === user.branch && (
          lead.assignedCounselor === user.id || 
          (user.teamMembers && user.teamMembers.includes(lead.assignedCounselor))
        )
      );
    } else if (user.role === 'counselor') {
      // Counselors see only their leads within their branch
      return allLeads.filter(lead => 
        lead.branch === user.branch && lead.assignedCounselor === user.id
      );
    }
    
    return [];
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    canAccessResource,
    isManager,
    isTeamLead,
    isCounselor,
    getAccessibleLeads,
    refreshUser,
  };

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
