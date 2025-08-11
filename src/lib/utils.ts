// Utility functions for DMHCA CRM
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { LeadStatus, Qualification, SaleType } from '@/types';

// Tailwind CSS class utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, 'h:mm a')}`;
  }
  
  return format(dateObj, 'MMM dd, yyyy h:mm a');
};

export const formatDateShort = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
};

// Phone number formatting
export const formatPhoneNumber = (phone: string) => {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +, format international
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Add + if not present
  return `+${cleaned}`;
};

export const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// Email validation
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Lead status utilities
export const getStatusColor = (status: LeadStatus) => {
  const colors = {
    hot: 'bg-red-100 text-red-800 border-red-200',
    warm: 'bg-orange-100 text-orange-800 border-orange-200',
    followup: 'bg-blue-100 text-blue-800 border-blue-200',
    'not interested': 'bg-gray-100 text-gray-800 border-gray-200',
    junk: 'bg-red-100 text-red-600 border-red-200',
    fresh: 'bg-green-100 text-green-800 border-green-200',
    'admission done': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getStatusPriority = (status: LeadStatus) => {
  const priorities = {
    hot: 5,
    warm: 4,
    followup: 3,
    fresh: 2,
    'not interested': 1,
    junk: 0,
    'admission done': 6,
  };
  return priorities[status] || 0;
};

// Qualification utilities
export const getQualificationLabel = (qualification: Qualification) => {
  const labels = {
    mbbs: 'MBBS',
    md: 'MD',
    ms: 'MS',
    bds: 'BDS',
    ayush: 'AYUSH',
    'md/ms': 'MD/MS',
    others: 'Others',
  };
  return labels[qualification] || qualification;
};

// Currency formatting
export const formatCurrency = (amount: number, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Text utilities
export const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Lead scoring utilities
export const calculateLeadScore = (lead: any) => {
  let score = 0;
  
  // Qualification scoring
  const qualificationScores = {
    mbbs: 20,
    md: 25,
    ms: 25,
    bds: 15,
    ayush: 10,
    'md/ms': 30,
    others: 5,
  };
  
  score += qualificationScores[lead.qualification as Qualification] || 0;
  
  // Status scoring
  const statusScores = {
    hot: 30,
    warm: 20,
    followup: 15,
    fresh: 10,
    'not interested': -10,
    junk: -20,
    'admission done': 50,
  };
  
  score += statusScores[lead.status as LeadStatus] || 0;
  
  // Engagement scoring (based on communications)
  if (lead.lastContactDate) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceContact <= 1) score += 10;
    else if (daysSinceContact <= 3) score += 5;
    else if (daysSinceContact <= 7) score += 2;
    else if (daysSinceContact > 30) score -= 5;
  }
  
  // Source scoring
  const sourceScores = {
    'google-ads': 15,
    'facebook-ads': 12,
    'referral': 20,
    'website': 10,
    'walk-in': 25,
    'cold-call': 5,
  };
  
  score += sourceScores[lead.source as keyof typeof sourceScores] || 0;
  
  return Math.max(0, Math.min(100, score));
};

// File utilities
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const validateFileType = (file: File, allowedTypes: string[]) => {
  return allowedTypes.includes(file.type);
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((groups, item) => {
    const group = item[key] as string;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Color utilities
export const getRandomColor = () => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage utilities
export const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

export const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

// URL utilities
export const buildQueryString = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

// Time utilities
export const getTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDateShort(dateObj);
};

// Validation utilities
export const isValidURL = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Country utilities
export const getCountryFlag = (countryCode: string) => {
  const flags = {
    IN: '🇮🇳',
    US: '🇺🇸',
    GB: '🇬🇧',
    AU: '🇦🇺',
    CA: '🇨🇦',
    AE: '🇦🇪',
    SA: '🇸🇦',
    // Add more as needed
  };
  return flags[countryCode as keyof typeof flags] || '🌍';
};

export const getCountryName = (countryCode: string) => {
  const countries = {
    IN: 'India',
    US: 'United States',
    GB: 'United Kingdom',
    AU: 'Australia',
    CA: 'Canada',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    // Add more as needed
  };
  return countries[countryCode as keyof typeof countries] || countryCode;
};
