'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead } from '@/types';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'followup' | 'reminder' | 'alert' | 'success' | 'warning';
  title: string;
  message: string;
  leadId?: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  checkFollowUpReminders: (leads: Lead[]) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permission granted and urgent
    if (notificationPermission === 'granted' && notification.urgent) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
        requireInteraction: true,
      });
    }

    return newNotification.id;
  }, [notificationPermission]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear single notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Check for follow-up reminders
  const checkFollowUpReminders = useCallback((leads: Lead[]) => {
    if (!user) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Filter leads that need follow-up
    const userLeads = leads.filter(lead => {
      // For managers, check all leads
      if (user.role === 'manager') return true;
      // For others, only their assigned leads
      return lead.assignedCounselor === user.id;
    });

    const overdueLeads = userLeads.filter(lead => {
      const followUpDate = new Date(lead.followUpDate);
      return followUpDate < todayStart && lead.status !== 'admission done' && lead.status !== 'not interested';
    });

    const todayLeads = userLeads.filter(lead => {
      const followUpDate = new Date(lead.followUpDate);
      return followUpDate >= todayStart && followUpDate < todayEnd && lead.status !== 'admission done' && lead.status !== 'not interested';
    });

    // Create notifications for overdue leads
    overdueLeads.forEach(lead => {
      const daysPastDue = Math.floor((now.getTime() - new Date(lead.followUpDate).getTime()) / (1000 * 60 * 60 * 24));
      
      addNotification({
        type: 'followup',
        title: 'Overdue Follow-up',
        message: `${lead.name} - Follow-up was due ${daysPastDue} day${daysPastDue === 1 ? '' : 's'} ago`,
        leadId: lead.id,
        urgent: daysPastDue > 2,
      });
    });

    // Create notifications for today's follow-ups
    todayLeads.forEach(lead => {
      addNotification({
        type: 'reminder',
        title: 'Follow-up Reminder',
        message: `${lead.name} - Follow-up scheduled for today`,
        leadId: lead.id,
        urgent: true,
      });
    });

  }, [user, addNotification]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    checkFollowUpReminders,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
