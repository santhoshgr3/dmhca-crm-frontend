// Core CRM types and interfaces for DMHCA Education CRM

export type LeadStatus = 'hot' | 'warm' | 'followup' | 'not interested' | 'junk' | 'fresh' | 'admission done';

export type Qualification = 'mbbs' | 'md' | 'ms' | 'bds' | 'ayush' | 'md/ms' | 'others';

export type SaleType = 'loan' | 'emi' | 'full payment';

export type UserRole = 'manager' | 'team_lead' | 'counselor';

export type BranchCode = 'delhi' | 'hyderabad' | 'kashmir';

export interface Branch {
  code: BranchCode;
  name: string;
  city: string;
  state: string;
  region: string;
}

export interface Lead {
  id: string;
  leadId: string; // Custom lead ID
  name: string;
  email: string;
  country: string;
  phone: string; // With country code
  course: string;
  qualification: Qualification;
  followUpDate: Date;
  status: LeadStatus;
  notes: Note[];
  assignedCounselor?: string;
  branch: BranchCode; // Branch assignment
  source?: string;
  campaign?: string;
  leadScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  isSystem: boolean;
}

export interface Sale {
  id: string;
  leadId: string;
  fees: number;
  feesCollected: number;
  saleType: SaleType;
  course: string;
  counselor: string;
  saleDate: Date;
  createdAt: Date;
}

export interface Counselor {
  id: string;
  name: string;
  email: string;
  phone: string;
  regions: string[];
  languages: string[];
  qualifications: Qualification[];
  isActive: boolean;
  performanceMetrics: CounselorMetrics;
  createdAt: Date;
}

export interface CounselorMetrics {
  totalContacts: number;
  conversions: number;
  conversionRate: number;
  avgResponseTime: number; // in minutes
  revenue: number;
  activeLeads: number;
  monthlyTargets: number;
  monthlyAchieved: number;
}

export interface AutoAssignmentRule {
  id: string;
  name: string;
  criteria: {
    regions?: string[];
    languages?: string[];
    qualifications?: Qualification[];
    courses?: string[];
  };
  distributionType: 'round-robin' | 'performance-based' | 'workload-based';
  isActive: boolean;
  priority: number;
}

export interface Course {
  id: string;
  name: string;
  category: 'fellowship' | 'diploma' | 'certification';
  description: string;
  duration: string;
  fees: number;
  eligibility: Qualification[];
  isActive: boolean;
  image?: string;
  brochureUrl?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  specialties: string[];
  courses: string[];
  isActive: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'followup' | 'reminder' | 'promotional';
  content: string;
  variables: string[];
  isActive: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: 'welcome' | 'followup' | 'reminder' | 'promotional';
  variables: string[];
  isActive: boolean;
}

export interface Communication {
  id: string;
  leadId: string;
  type: 'whatsapp' | 'email' | 'call' | 'sms';
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  counselorId?: string;
}

export interface DripWorkflow {
  id: string;
  name: string;
  triggerConditions: {
    status?: LeadStatus[];
    qualification?: Qualification[];
    daysSinceLastContact?: number;
  };
  steps: DripStep[];
  isActive: boolean;
}

export interface DripStep {
  id: string;
  delay: number; // in hours
  action: 'send_whatsapp' | 'send_email' | 'create_task';
  templateId?: string;
  content?: string;
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  sources?: string[];
  courses?: string[];
  countries?: string[];
  counselors?: string[];
  statuses?: LeadStatus[];
  qualifications?: Qualification[];
}

export interface FunnelMetrics {
  stage: string;
  count: number;
  conversionRate: number;
  avgTimeInStage: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  ytdRevenue: number;
  revenueByCourse: Array<{ course: string; revenue: number; count: number }>;
  revenueByPaymentType: Array<{ type: SaleType; revenue: number; count: number }>;
  revenueGrowth: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  branch: BranchCode; // Branch assignment
  avatar?: string;
  teamLeadId?: string; // For counselors, references their team lead
  teamMembers?: string[]; // For team leads, array of counselor IDs
  isActive: boolean;
  permissions: Permission[];
  createdAt: Date;
  lastLogin?: Date;
  createdBy: string; // ID of the user who created this account
}

export interface Permission {
  resource: 'leads' | 'analytics' | 'sales' | 'communications' | 'users' | 'settings' | 'hospitals' | 'courses';
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  scope?: 'all' | 'team' | 'own'; // all = everything, team = team only, own = own data only
}

export interface UserFormData {
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch: BranchCode;
  teamLeadId?: string;
  isActive: boolean;
}

export interface PasswordChangeData {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AIRecommendation {
  type: 'next_action' | 'lead_priority' | 'churn_alert' | 'upsell_opportunity';
  leadId: string;
  title: string;
  description: string;
  confidence: number;
  suggestedAction: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Form Types
export interface LeadFormData {
  name: string;
  email: string;
  country: string;
  phone: string;
  course: string;
  qualification: Qualification;
  followUpDate: Date;
  status: LeadStatus;
  notes?: string;
}

export interface CounselorFormData {
  name: string;
  email: string;
  phone: string;
  regions: string[];
  languages: string[];
  qualifications: Qualification[];
}

// Dashboard Types
export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  todaysCalls: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  // Sales metrics
  totalSales: number;
  totalSalesRevenue: number;
  pendingPayments: number;
  fullPayments: number;
  emiPayments: number;
  loanPayments: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  reminderNotifications: boolean;
  reportNotifications: boolean;
}

// Branch data constants
export const BRANCHES: Record<BranchCode, Branch> = {
  delhi: {
    code: 'delhi',
    name: 'DMHCA Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    region: 'North India'
  },
  hyderabad: {
    code: 'hyderabad',
    name: 'DMHCA Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    region: 'South India'
  },
  kashmir: {
    code: 'kashmir',
    name: 'DMHCA Kashmir',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    region: 'North India'
  }
};

// Countries data
export const COUNTRIES = {
  'IN': { name: 'India', code: '+91', flag: '🇮🇳' },
  'US': { name: 'United States', code: '+1', flag: '🇺🇸' },
  'UK': { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  'AE': { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  'SA': { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  'CA': { name: 'Canada', code: '+1', flag: '🇨🇦' },
  'AU': { name: 'Australia', code: '+61', flag: '🇦🇺' },
  'NZ': { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  'SG': { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  'MY': { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
};

// Courses data
export const COURSES = [
  'Fellowship in Emergency Medicine',
  'Diploma in Critical Care Medicine',
  'Certificate in Telemedicine',
  'Fellowship in Cardiology',
  'Advanced Life Support Training',
  'Critical Care Nursing',
  'Emergency Medicine Certification',
  'Trauma Care Management',
  'Intensive Care Unit Management',
  'Medical Education Technology',
  'Healthcare Administration',
  'Digital Health Management',
  'Medical Research Methodology',
  'Clinical Skills Enhancement',
  'Healthcare Quality Management',
];

// Lead sources
export const LEAD_SOURCES = [
  'website',
  'linkedin',
  'facebook',
  'instagram',
  'google-ads',
  'referral',
  'email-campaign',
  'webinar',
  'conference',
  'direct-call',
  'walk-in',
  'partner',
  'other',
];
