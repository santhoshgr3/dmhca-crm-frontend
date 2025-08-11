'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Lead, LeadStatus, Qualification, Note, COUNTRIES, COURSES, BRANCHES, BranchCode, LEAD_SOURCES } from '@/types';
import { getStatusColor, formatDate, getQualificationLabel } from '@/lib/utils';
import { openWhatsAppChat, whatsappTemplates } from '@/lib/whatsapp';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/lib/api/client';
import ClientOnly from '@/components/ClientOnly';

const statusOptions: { value: LeadStatus; label: string; color: string; activeColor: string; icon: any }[] = [
  { 
    value: 'fresh', 
    label: 'Fresh', 
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700', 
    activeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600',
    icon: CheckCircleIcon 
  },
  { 
    value: 'hot', 
    label: 'Hot', 
    color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700', 
    activeColor: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600',
    icon: FireIcon 
  },
  { 
    value: 'warm', 
    label: 'Warm', 
    color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700', 
    activeColor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-800 dark:text-orange-100 dark:border-orange-600',
    icon: ClockIcon 
  },
  { 
    value: 'followup', 
    label: 'Follow-up', 
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700', 
    activeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-600',
    icon: CalendarIcon 
  },
  { 
    value: 'not interested', 
    label: 'Not Interested', 
    color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700', 
    activeColor: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
    icon: XMarkIcon 
  },
  { 
    value: 'junk', 
    label: 'Junk', 
    color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700', 
    activeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600',
    icon: TrashIcon 
  },
  { 
    value: 'admission done', 
    label: 'Admission Done', 
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700', 
    activeColor: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600',
    icon: CheckCircleIcon 
  },
];

const qualificationOptions: { value: Qualification; label: string }[] = [
  { value: 'mbbs', label: 'MBBS' },
  { value: 'md', label: 'MD' },
  { value: 'ms', label: 'MS' },
  { value: 'bds', label: 'BDS' },
  { value: 'ayush', label: 'AYUSH' },
  { value: 'md/ms', label: 'MD/MS' },
  { value: 'others', label: 'Others' },
];

// Country options with phone codes
const countryOptions = [
  { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966' },
  { code: 'IN', name: 'India', phoneCode: '+91' },
  { code: 'US', name: 'United States', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', phoneCode: '+61' },
  { code: 'DE', name: 'Germany', phoneCode: '+49' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
  { code: 'JP', name: 'Japan', phoneCode: '+81' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65' },
  { code: 'MY', name: 'Malaysia', phoneCode: '+60' },
  { code: 'TH', name: 'Thailand', phoneCode: '+66' },
  { code: 'PH', name: 'Philippines', phoneCode: '+63' },
  { code: 'BD', name: 'Bangladesh', phoneCode: '+880' },
  { code: 'PK', name: 'Pakistan', phoneCode: '+92' },
  { code: 'LK', name: 'Sri Lanka', phoneCode: '+94' },
  { code: 'NP', name: 'Nepal', phoneCode: '+977' },
  { code: 'EG', name: 'Egypt', phoneCode: '+20' },
  { code: 'ZA', name: 'South Africa', phoneCode: '+27' },
];

// Course options for medical education
const courseOptions = [
  'Fellowship in Emergency Medicine',
  'Fellowship in Cardiology',
  'Fellowship in Critical Care',
  'Fellowship in Anesthesiology',
  'Fellowship in Pediatrics',
  'Fellowship in Internal Medicine',
  'Fellowship in Surgery',
  'Fellowship in Orthopedics',
  'Fellowship in Radiology',
  'Fellowship in Pathology',
  'Diploma in Critical Care',
  'Diploma in Emergency Medicine',
  'Diploma in Anesthesiology',
  'Diploma in Radiology',
  'Certificate in Telemedicine',
  'Certificate in Medical Coding',
  'Certificate in Healthcare Management',
  'Certificate in Clinical Research',
  'Certificate in Medical Writing',
  'Certificate in Pharmacovigilance',
  'Advanced Course in Cardiac Care',
  'Advanced Course in Trauma Management',
  'Advanced Course in Pediatric Emergency',
  'Advanced Course in Geriatric Care',
  'Postgraduate Program in Public Health',
  'Postgraduate Program in Hospital Administration',
  'Masters in Medical Education',
  'Masters in Healthcare Quality',
];

export default function LeadsPage() {
  const { user, getAccessibleLeads, hasPermission, loading: authLoading } = useAuth();
  const { checkFollowUpReminders, addNotification } = useNotifications();
  const searchParams = useSearchParams();
  
  // Helper function to get country name from code
  const getCountryName = (countryCode: string) => {
    const country = countryOptions.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  };
  
  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counselors, setCounselors] = useState<{id: string, name: string, role: string}[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [qualificationFilter, setQualificationFilter] = useState<Qualification | 'all'>('all');
  const [assignedFilter, setAssignedFilter] = useState<string | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<BranchCode | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'on' | 'after' | 'before' | 'between'>('all');
  const [dateValue, setDateValue] = useState('');
  const [endDateValue, setEndDateValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Lead detail modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  
  // Add Lead functionality
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'IN',
    course: '',
    qualification: 'mbbs' as Qualification,
    status: 'fresh' as LeadStatus,
    branch: user?.branch || 'delhi',
    assignedTo: '',
    assignedCounselor: '',
    source: 'website',
    followUpDate: new Date().toISOString().split('T')[0],
    city: '',
    state: '',
    initialNotes: '',
  });
  
  // Transfer functionality
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferToUser, setTransferToUser] = useState('');
  
  // Bulk transfer functionality
  const [showBulkTransferModal, setShowBulkTransferModal] = useState(false);
  const [bulkTransferToUser, setBulkTransferToUser] = useState('');
  const [bulkTransferNotes, setBulkTransferNotes] = useState('');
  
  // Import/Export functionality
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // API Functions
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: [statusFilter] }),
        ...(branchFilter !== 'all' && { branch: [branchFilter] }),
        ...(sourceFilter !== 'all' && { source: [sourceFilter] }),
        ...(assignedFilter !== 'all' && { assignedTo: [assignedFilter] }),
      };
      
      const response = await apiClient.getLeads(params);
      setLeads(response.data);
      setFilteredLeads(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again.');
      
      // Fallback to empty array or sample data for development
      setLeads([]);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      const leadData = {
        fullName: newLeadForm.name,
        email: newLeadForm.email,
        phone: newLeadForm.phone,
        country: newLeadForm.country,
        city: newLeadForm.city,
        state: newLeadForm.state,
        courseInterested: newLeadForm.course,
        qualification: newLeadForm.qualification,
        status: newLeadForm.status,
        branch: newLeadForm.branch,
        assignedTo: newLeadForm.assignedTo || undefined,
        source: newLeadForm.source,
        initialNotes: newLeadForm.initialNotes,
      };
      
      await apiClient.createLead(leadData);
      setShowAddLeadModal(false);
      resetNewLeadForm();
      fetchLeads(); // Refresh the list
    } catch (err) {
      console.error('Error creating lead:', err);
      setError('Failed to create lead. Please try again.');
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      await apiClient.updateLead(leadId, updates);
      fetchLeads(); // Refresh the list
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead. Please try again.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await apiClient.deleteLead(leadId);
      fetchLeads(); // Refresh the list
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead. Please try again.');
    }
  };

  const handleAssignLead = async (leadId: string, assignedTo: string, reason?: string) => {
    try {
      await apiClient.assignLead(leadId, assignedTo, reason);
      fetchLeads(); // Refresh the list
      setShowTransferModal(false);
    } catch (err) {
      console.error('Error assigning lead:', err);
      setError('Failed to assign lead. Please try again.');
    }
  };

  const handleAddNote = async (leadId: string, note: string, noteType: string = 'general') => {
    try {
      await apiClient.addLeadNote(leadId, note);
      if (selectedLead && selectedLead.id === leadId) {
        // Refresh selected lead details
        const updatedLead = await apiClient.getLead(leadId);
        setSelectedLead(updatedLead);
      }
      setNewNote('');
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await apiClient.getUsers({ role: 'counselor' });
      setCounselors(response.data || []);
    } catch (err) {
      console.error('Error fetching counselors:', err);
      // Fallback to empty array
      setCounselors([]);
    }
  };

  const resetNewLeadForm = () => {
    setNewLeadForm({
      name: '',
      email: '',
      phone: '',
      country: 'IN',
      course: '',
      qualification: 'mbbs',
      status: 'fresh',
      branch: user?.branch || 'delhi',
      assignedTo: '',
      assignedCounselor: '',
      source: 'website',
      followUpDate: new Date().toISOString().split('T')[0],
      city: '',
      state: '',
      initialNotes: '',
    });
  };

  // Fetch leads on component mount and when filters change
  useEffect(() => {
    if (!authLoading && user) {
      fetchLeads();
      fetchCounselors();
    }
  }, [user, authLoading, pagination.page, pagination.limit, statusFilter, branchFilter, sourceFilter, assignedFilter, searchQuery]);

  // Check for follow-up reminders when leads change
  useEffect(() => {
    if (leads.length > 0 && user) {
      checkFollowUpReminders(leads);
    }
  }, [leads, user, checkFollowUpReminders]);

  // Handle URL parameters (e.g., ?action=add from dashboard)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add' && hasPermission('leads', 'create')) {
      setShowAddLeadModal(true);
    }
  }, [searchParams, hasPermission]);

  // Set up periodic check for follow-up reminders (every 5 minutes)
  useEffect(() => {
    if (!user || leads.length === 0) return;

    const interval = setInterval(() => {
      checkFollowUpReminders(leads);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [leads, user, checkFollowUpReminders]);

  // Helper function to get available counselors for assignment based on role
  const getAvailableCounselors = () => {
    // Return the counselors fetched from API
    return counselors;
  };

  // Check if current user can change counselor assignment
  const canChangeAssignment = () => {
    return hasPermission('leads', 'manage') || hasPermission('leads', 'update');
  };

  // Handle country change and update phone code
  const handleCountryChange = (countryCode: string) => {
    if (editingLead) {
      const selectedCountry = countryOptions.find(c => c.code === countryCode);
      if (selectedCountry) {
        // Update country
        const updatedLead = { ...editingLead, country: countryCode };
        
        // Update phone code if phone doesn't already have a country code
        if (editingLead.phone && !editingLead.phone.startsWith('+')) {
          updatedLead.phone = selectedCountry.phoneCode + '-' + editingLead.phone.replace(/^[+\-\s]+/, '');
        } else if (!editingLead.phone) {
          updatedLead.phone = selectedCountry.phoneCode + '-';
        }
        
        setEditingLead(updatedLead);
      }
    }
  };

  // Custom WhatsApp function with note tracking
  const handleWhatsAppChat = (lead: Lead, template: keyof typeof whatsappTemplates = 'initial') => {
    // Use the utility function to open WhatsApp
    openWhatsAppChat(lead, template);
    
    // Add a note to the lead about WhatsApp message sent
    const whatsappNote: Note = {
      id: Date.now().toString(),
      content: `WhatsApp message sent (${template} template)`,
      timestamp: new Date(),
      author: user?.name || 'System',
      isSystem: true,
    };
    
    const updatedLead = {
      ...lead,
      notes: [whatsappNote, ...lead.notes],
      updatedAt: new Date(),
    };
    
    const updatedLeads = leads.map(l =>
      l.id === lead.id ? updatedLead : l
    );
    setLeads(updatedLeads);
    
    // Update selectedLead if it's the same lead
    if (selectedLead && selectedLead.id === lead.id) {
      setSelectedLead(updatedLead);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.leadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Qualification filter
    if (qualificationFilter !== 'all') {
      filtered = filtered.filter(lead => lead.qualification === qualificationFilter);
    }

    // Assigned counselor filter
    if (assignedFilter !== 'all') {
      filtered = filtered.filter(lead => lead.assignedCounselor === assignedFilter);
    }

    // Date filter
    if (dateFilter !== 'all' && dateValue) {
      const filterDate = new Date(dateValue);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        switch (dateFilter) {
          case 'on':
            return leadDate.toDateString() === filterDate.toDateString();
          case 'after':
            return leadDate > filterDate;
          case 'before':
            return leadDate < filterDate;
          case 'between':
            if (endDateValue) {
              const endDate = new Date(endDateValue);
              return leadDate >= filterDate && leadDate <= endDate;
            }
            return leadDate >= filterDate;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLeads(filtered);
  }, [leads, searchQuery, statusFilter, qualificationFilter, assignedFilter, dateFilter, dateValue, endDateValue, sortField, sortDirection]);

  // Handle lead row click
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditingLead({ ...lead });
    setShowLeadModal(true);
  };

  // Handle lead update
  const handleLeadUpdate = (field: keyof Lead, value: any) => {
    if (editingLead) {
      setEditingLead({ ...editingLead, [field]: value });
    }
  };

  // Save lead changes
  const saveLeadChanges = () => {
    if (editingLead && selectedLead) {
      const updatedLeads = leads.map(lead =>
        lead.id === selectedLead.id ? editingLead : lead
      );
      setLeads(updatedLeads);
      setSelectedLead(editingLead);
    }
  };

  // Update phone number when country changes
  const handleCountryChangeInForm = (countryCode: string) => {
    const countryData = COUNTRIES[countryCode as keyof typeof COUNTRIES];
    if (countryData) {
      setNewLeadForm({
        ...newLeadForm,
        country: countryCode,
        phone: countryData.code,
      });
    }
  };

  // Add note to lead
  const addNoteToLead = () => {
    if (newNote.trim() && editingLead && user) {
      const note: Note = {
        id: `note-${Date.now()}`,
        content: newNote.trim(),
        author: user.name,
        timestamp: new Date(),
        isSystem: false
      };

      const updatedLead = {
        ...editingLead,
        notes: [...editingLead.notes, note]
      };

      setEditingLead(updatedLead);
      setNewNote('');

      // Update leads state
      const updatedLeads = leads.map(lead =>
        lead.id === editingLead.id ? updatedLead : lead
      );
      setLeads(updatedLeads);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowLeadModal(false);
    setSelectedLead(null);
    setEditingLead(null);
    setNewNote('');
  };

  // Transfer leads functionality
  const handleTransferLeads = () => {
    if (selectedLeads.length > 0 && transferToUser) {
      const updatedLeads = leads.map(lead =>
        selectedLeads.includes(lead.id)
          ? { ...lead, assignedCounselor: transferToUser }
          : lead
      );
      
      setLeads(updatedLeads);
      setSelectedLeads([]);
      setShowTransferModal(false);
      setTransferToUser('');
      
      // Add system note for transfer
      const transferredLeads = updatedLeads.filter(lead => selectedLeads.includes(lead.id));
      const counselorName = counselors.find(c => c.id === transferToUser)?.name || 'Unknown';
      
      transferredLeads.forEach(lead => {
        const note: Note = {
          id: `note-${Date.now()}-${lead.id}`,
          content: `Lead transferred to ${counselorName} by ${user?.name}`,
          author: 'System',
          timestamp: new Date(),
          isSystem: true
        };
        
        lead.notes.push(note);
      });
    }
  };

  // Close transfer modal
  const closeTransferModal = () => {
    setShowTransferModal(false);
    setTransferToUser('');
  };

  // Bulk transfer functionality
  const handleBulkTransfer = async () => {
    if (selectedLeads.length === 0 || !bulkTransferToUser) {
      alert('Please select leads and a counselor to transfer to.');
      return;
    }

    try {
      const updatedLeads = leads.map(lead =>
        selectedLeads.includes(lead.id)
          ? { ...lead, assignedCounselor: bulkTransferToUser }
          : lead
      );
      
      setLeads(updatedLeads);
      
      // Add system notes for bulk transfer
      const transferredLeads = updatedLeads.filter(lead => selectedLeads.includes(lead.id));
      const counselorName = counselors.find(c => c.id === bulkTransferToUser)?.name || 'Unknown';
      
      transferredLeads.forEach(lead => {
        const note: Note = {
          id: `note-${Date.now()}-${lead.id}`,
          content: `Lead bulk transferred to ${counselorName} by ${user?.name}${bulkTransferNotes ? `. Notes: ${bulkTransferNotes}` : ''}`,
          author: 'System',
          timestamp: new Date(),
          isSystem: true
        };
        
        lead.notes.push(note);
      });

      // Reset state
      setSelectedLeads([]);
      setShowBulkTransferModal(false);
      setBulkTransferToUser('');
      setBulkTransferNotes('');
      
      alert(`Successfully transferred ${transferredLeads.length} leads to ${counselorName}`);
    } catch (error) {
      console.error('Error during bulk transfer:', error);
      alert('Error transferring leads. Please try again.');
    }
  };

  const closeBulkTransferModal = () => {
    setShowBulkTransferModal(false);
    setBulkTransferToUser('');
    setBulkTransferNotes('');
  };

  // Import functionality
  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import.');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Expected headers: name, email, phone, course, qualification, status, branch, source, notes
      const expectedHeaders = ['name', 'email', 'phone', 'course', 'qualification', 'status', 'branch', 'source'];
      const optionalHeaders = ['notes', 'country', 'campaign', 'assignedCounselor'];
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        alert(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const newLeads: Lead[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        setImportProgress((i / lines.length) * 100);
        
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const leadData: any = {};
        
        headers.forEach((header, index) => {
          leadData[header] = values[index] || '';
        });

        // Validate required fields
        if (!leadData.name || !leadData.email || !leadData.phone) {
          errors.push(`Row ${i + 1}: Missing required fields (name, email, or phone)`);
          continue;
        }

        // Create lead object
        const newLead: Lead = {
          id: `imported-${Date.now()}-${i}`,
          leadId: `DMHCA-${new Date().getFullYear()}-${String(leads.length + newLeads.length + 1).padStart(3, '0')}`,
          name: leadData.name,
          email: leadData.email,
          country: leadData.country || 'IN',
          phone: leadData.phone,
          course: leadData.course || 'General Inquiry',
          qualification: (leadData.qualification as Qualification) || 'others',
          followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: (leadData.status as LeadStatus) || 'fresh',
          notes: leadData.notes ? [{
            id: `note-${Date.now()}-${i}`,
            content: leadData.notes,
            timestamp: new Date(),
            author: user?.name || 'System',
            isSystem: false
          }] : [],
          assignedCounselor: leadData.assignedCounselor || undefined,
          branch: (leadData.branch as BranchCode) || 'delhi',
          source: leadData.source || 'import',
          campaign: leadData.campaign || undefined,
          leadScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        newLeads.push(newLead);
      }

      // Add imported leads to the list
      setLeads(prevLeads => [...prevLeads, ...newLeads]);
      setImportProgress(100);
      
      let message = `Successfully imported ${newLeads.length} leads.`;
      if (errors.length > 0) {
        message += `\n\nErrors encountered:\n${errors.slice(0, 5).join('\n')}`;
        if (errors.length > 5) {
          message += `\n... and ${errors.length - 5} more errors.`;
        }
      }
      
      alert(message);
      setShowImportModal(false);
      setImportFile(null);
      
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing file. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Export functionality
  const handleExport = (format: 'csv' | 'excel') => {
    const leadsToExport = selectedLeads.length > 0 
      ? leads.filter(lead => selectedLeads.includes(lead.id))
      : filteredLeads;

    if (leadsToExport.length === 0) {
      alert('No leads to export.');
      return;
    }

    if (format === 'csv') {
      exportToCSV(leadsToExport);
    } else {
      exportToExcel(leadsToExport);
    }
    
    setShowExportModal(false);
  };

  const exportToCSV = (leadsData: Lead[]) => {
    const headers = [
      'Lead ID', 'Name', 'Email', 'Phone', 'Country', 'Course', 'Qualification',
      'Status', 'Follow-up Date', 'Branch', 'Source', 'Campaign', 'Lead Score',
      'Assigned Counselor', 'Notes', 'Created Date', 'Last Updated'
    ];

    const csvContent = [
      headers.join(','),
      ...leadsData.map(lead => [
        lead.leadId,
        `"${lead.name}"`,
        lead.email,
        lead.phone,
        lead.country,
        `"${lead.course}"`,
        lead.qualification,
        lead.status,
        lead.followUpDate.toISOString().split('T')[0],
        lead.branch,
        lead.source || '',
        lead.campaign || '',
        lead.leadScore,
        lead.assignedCounselor ? counselors.find(c => c.id === lead.assignedCounselor)?.name || '' : '',
        `"${lead.notes.map(note => note.content).join('; ')}"`,
        lead.createdAt.toISOString().split('T')[0],
        lead.updatedAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (leadsData: Lead[]) => {
    // For now, export as CSV (in a real app, you'd use a library like xlsx)
    alert('Excel export will be available soon. Exporting as CSV instead.');
    exportToCSV(leadsData);
  };

  // Download sample template
  const downloadTemplate = () => {
    const headers = [
      'name', 'email', 'phone', 'country', 'course', 'qualification', 
      'status', 'branch', 'source', 'campaign', 'assignedCounselor', 'notes'
    ];
    
    const sampleData = [
      'Sample Name', 'sample@email.com', '+91-9876543210', 'IN', 
      'Medical Coding', 'graduate', 'new', 'main-campus', 
      'website', 'Q1-2025', '', 'Sample notes - replace with actual data'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <ClientOnly>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'manager' ? 'All Leads' : 
             user?.role === 'team_lead' ? 'Team Leads' : 'My Leads'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'manager' ? 'Manage and track all leads in the system' :
             user?.role === 'team_lead' ? 'Manage your team\'s leads and performance' :
             'Manage and track your assigned leads'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          {user?.role === 'manager' && (
            <>
              <button 
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                Import
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
            </>
          )}
          {(hasPermission('leads', 'create') || user?.role === 'manager' || user?.role === 'team_lead' || user?.role === 'counselor') && (
            <button 
              onClick={() => setShowAddLeadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Lead
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
              showFilters
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {showFilters && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Status Filter Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                    statusFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  All ({filteredLeads.length})
                </button>
                {statusOptions.map((option) => {
                  const IconComponent = option.icon;
                  const leadCount = leads.filter(lead => lead.status === option.value).length;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium ${
                        statusFilter === option.value
                          ? option.activeColor + ' shadow-sm'
                          : option.color
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {option.label} ({leadCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Qualification Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qualification
                </label>
                <select
                  value={qualificationFilter}
                  onChange={(e) => setQualificationFilter(e.target.value as Qualification | 'all')}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Qualifications</option>
                  {qualificationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </label>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Counselors</option>
                  {counselors.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name} ({counselor.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Filter
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'all' | 'on' | 'after' | 'before' | 'between')}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Dates</option>
                  <option value="on">On Date</option>
                  <option value="after">After Date</option>
                  <option value="before">Before Date</option>
                  <option value="between">Between Dates</option>
                </select>
              </div>

              {/* Start Date Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {dateFilter === 'between' ? 'Start Date' : 'Select Date'}
                </label>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  disabled={dateFilter === 'all'}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                />
              </div>
            </div>

            {/* End Date for Between Filter */}
            {dateFilter === 'between' && (
              <div className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDateValue}
                      onChange={(e) => setEndDateValue(e.target.value)}
                      min={dateValue}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredLeads.length} of {leads.length} leads
          {selectedLeads.length > 0 && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              ({selectedLeads.length} selected)
            </span>
          )}
        </p>
        
        {/* Bulk Actions Bar - Only for Managers */}
        {selectedLeads.length > 0 && user?.role === 'manager' && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            <button
              onClick={() => setShowBulkTransferModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors duration-200"
            >
              <ArrowRightIcon className="h-4 w-4 mr-2" />
              Bulk Transfer
            </button>
            
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to assign ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} to yourself?`)) {
                  const updatedLeads = leads.map(lead =>
                    selectedLeads.includes(lead.id)
                      ? { ...lead, assignedCounselor: user.id }
                      : lead
                  );
                  setLeads(updatedLeads);
                  setSelectedLeads([]);
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors duration-200"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Assign to Me
            </button>
            
            <select
              onChange={(e) => {
                if (e.target.value && confirm(`Change status of ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} to "${e.target.value}"?`)) {
                  const updatedLeads = leads.map(lead =>
                    selectedLeads.includes(lead.id)
                      ? { ...lead, status: e.target.value as LeadStatus }
                      : lead
                  );
                  setLeads(updatedLeads);
                  setSelectedLeads([]);
                }
                e.target.value = '';
              }}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 border-none cursor-pointer"
            >
              <option value="">Bulk Status Change</option>
              <option value="hot">Mark as Hot</option>
              <option value="warm">Mark as Warm</option>
              <option value="followup">Mark for Follow-up</option>
              <option value="not interested">Mark Not Interested</option>
              <option value="fresh">Mark as Fresh</option>
              <option value="admission done">Mark as Admission Done</option>
            </select>
            
            <button
              onClick={() => exportToCSV(leads.filter(lead => selectedLeads.includes(lead.id)))}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Selected
            </button>
            
            <button
              onClick={() => setSelectedLeads([])}
              className="inline-flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-sm text-sm font-medium transition-colors duration-200"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        )}
        
        {/* Regular Transfer Button for Non-Managers */}
        {selectedLeads.length > 0 && user?.role !== 'manager' && canChangeAssignment() && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Transfer ({selectedLeads.length})
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''}
            </span>
          </button>
        )}
      </div>

      {/* Manager Features Info */}
      {user?.role === 'manager' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Manager Privileges Active
              </h3>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                • Select multiple leads using checkboxes for bulk operations
                • <strong>Bulk Transfer:</strong> Assign multiple leads to any counselor with notes
                • <strong>Assign to Me:</strong> Quickly take ownership of selected leads
                • <strong>Bulk Status Change:</strong> Update status of multiple leads simultaneously
                • <strong>Import/Export:</strong> Import leads from CSV files and export lead data
                • <strong>Export Selected:</strong> Export only selected leads from bulk actions
                • <strong>Individual Assignment:</strong> Assign leads one-by-one via action menu
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('name')}
                >
                  Lead
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('course')}
                >
                  Course & Qualification
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('followUpDate')}
                >
                  Follow-up
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('leadScore')}
                >
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => handleLeadClick(lead)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {lead.leadId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {lead.course}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {getQualificationLabel(lead.qualification)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(lead.followUpDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {lead.leadScore}
                      </div>
                      <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${lead.leadScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${lead.phone}`, '_self');
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        title="Call Lead"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppChat(lead, 'initial');
                        }}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                        title="WhatsApp Chat"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${lead.email}`, '_self');
                        }}
                        className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400"
                        title="Send Email"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLead(lead);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                        title="Edit Lead"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === lead.id ? null : lead.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="More Actions"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === lead.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppChat(lead, 'followup');
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 text-green-600" />
                                WhatsApp Follow-up
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppChat(lead, 'custom');
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 text-green-600" />
                                Custom WhatsApp
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setShowDetailModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <EyeIcon className="h-4 w-4 mr-2 text-indigo-600" />
                                View Details
                              </button>
                              
                              {/* Assign Lead - Only for Managers */}
                              {user?.role === 'manager' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLeads([lead.id]);
                                    setShowBulkTransferModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <ArrowRightIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  Assign Lead
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLead(lead.id);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete Lead
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No leads found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showLeadModal && selectedLead && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedLead.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLead.leadId}</p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Quick Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`tel:${selectedLead.phone}`, '_self')}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30"
                    title="Call Lead"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Call
                  </button>
                  <button
                    onClick={() => handleWhatsAppChat(selectedLead, 'initial')}
                    className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600 dark:hover:bg-green-900/30"
                    title="WhatsApp Chat"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${selectedLead.email}`, '_self')}
                    className="inline-flex items-center px-3 py-2 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-600 dark:hover:bg-purple-900/30"
                    title="Send Email"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    Email
                  </button>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingLead.name}
                    onChange={(e) => handleLeadUpdate('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => handleLeadUpdate('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editingLead.phone}
                    onChange={(e) => handleLeadUpdate('phone', e.target.value)}
                    placeholder="Country code will be added automatically"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <select
                    value={editingLead.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countryOptions.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.phoneCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course
                  </label>
                  <select
                    value={editingLead.course}
                    onChange={(e) => handleLeadUpdate('course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Course</option>
                    {courseOptions.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Qualification
                  </label>
                  <select
                    value={editingLead.qualification}
                    onChange={(e) => handleLeadUpdate('qualification', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {qualificationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingLead.status}
                    onChange={(e) => handleLeadUpdate('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editingLead.followUpDate ? new Date(editingLead.followUpDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleLeadUpdate('followUpDate', e.target.value ? new Date(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set a date and time for the next follow-up contact
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Counselor
                    {!canChangeAssignment() && (
                      <span className="text-xs text-gray-500 ml-2">(Read-only)</span>
                    )}
                  </label>
                  <select
                    value={editingLead.assignedCounselor || ''}
                    onChange={(e) => handleLeadUpdate('assignedCounselor', e.target.value || null)}
                    disabled={!canChangeAssignment()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500"
                  >
                    <option value="">Unassigned</option>
                    {getAvailableCounselors().map((counselor) => (
                      <option key={counselor.id} value={counselor.id}>
                        {counselor.name} ({counselor.role})
                      </option>
                    ))}
                  </select>
                  {!canChangeAssignment() && (
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.role === 'counselor' 
                        ? 'Counselors cannot change lead assignments' 
                        : 'You can only assign leads to your team members'
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notes</h3>
                
                {/* Add New Note */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={addNoteToLead}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add Note
                    </button>
                  </div>
                </div>

                {/* Existing Notes */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {editingLead.notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border ${
                        note.isSystem
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {note.author}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveLeadChanges();
                  closeModal();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transfer Leads
              </h2>
              <button
                onClick={closeTransferModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Transfer {selectedLeads.length} selected lead{selectedLeads.length > 1 ? 's' : ''} to:
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to Counselor
                </label>
                <select
                  value={transferToUser}
                  onChange={(e) => setTransferToUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a counselor...</option>
                  {getAvailableCounselors().map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name} ({counselor.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeTransferModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferLeads}
                  disabled={!transferToUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Transfer Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Transfer Modal */}
      {showBulkTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bulk Transfer Leads
              </h2>
              <button
                onClick={closeBulkTransferModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Transfer Summary</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You are about to transfer <span className="font-semibold">{selectedLeads.length}</span> lead{selectedLeads.length > 1 ? 's' : ''} to a new counselor.
                </p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Selected leads: {selectedLeads.map(id => {
                    const lead = leads.find(l => l.id === id);
                    return lead?.name;
                  }).join(', ')}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transfer to Counselor <span className="text-red-500">*</span>
                </label>
                <select
                  value={bulkTransferToUser}
                  onChange={(e) => setBulkTransferToUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a counselor...</option>
                  {getAvailableCounselors().map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name} ({counselor.role})
                      {counselor.id === user?.id ? ' - You' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transfer Notes (Optional)
                </label>
                <textarea
                  value={bulkTransferNotes}
                  onChange={(e) => setBulkTransferNotes(e.target.value)}
                  placeholder="Add any notes about this transfer..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeBulkTransferModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkTransfer}
                  disabled={!bulkTransferToUser}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  Transfer {selectedLeads.length} Lead{selectedLeads.length > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Import Leads
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Import Instructions</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Upload a CSV file with lead data</li>
                      <li>• Required columns: name, email, phone, course, qualification, status, branch, source</li>
                      <li>• Optional columns: country, campaign, assignedCounselor, notes</li>
                      <li>• Notes will be added as initial lead notes if provided</li>
                      <li>• First row should contain column headers</li>
                    </ul>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="flex-shrink-0 ml-4 inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                    Template
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select CSV File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {importFile && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Selected file:</strong> {importFile.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Size: {(importFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              )}

              {isImporting && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <span>Importing...</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  disabled={isImporting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  {isImporting ? 'Importing...' : 'Import Leads'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export Leads
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Export Summary</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {selectedLeads.length > 0 ? (
                    <>Export <span className="font-semibold">{selectedLeads.length}</span> selected leads</>
                  ) : (
                    <>Export all <span className="font-semibold">{filteredLeads.length}</span> filtered leads</>
                  )}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Choose Export Format
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-left"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <ArrowDownTrayIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">CSV Format</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Comma-separated values, compatible with Excel and Google Sheets</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-left"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ArrowDownTrayIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Excel Format</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Microsoft Excel format with formatting (Coming Soon)</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Lead
                </h3>
                <button
                  onClick={() => setShowAddLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Dr. John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="john.doe@example.com"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <select
                    value={newLeadForm.country}
                    onChange={(e) => handleCountryChangeInForm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.entries(COUNTRIES).map(([code, country]) => (
                      <option key={code} value={code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+91-9876543210"
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course of Interest *
                  </label>
                  <select
                    required
                    value={newLeadForm.course}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, course: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a course</option>
                    {COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Qualification *
                  </label>
                  <select
                    value={newLeadForm.qualification}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, qualification: e.target.value as Qualification })}
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

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Branch *
                  </label>
                  <select
                    value={newLeadForm.branch}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, branch: e.target.value as BranchCode })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={user?.role !== 'manager'} // Only managers can change branch
                  >
                    {Object.entries(BRANCHES).map(([code, branch]) => (
                      <option key={code} value={code}>
                        {branch.name} - {branch.city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Status
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="fresh">Fresh</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="followup">Follow-up</option>
                  </select>
                </div>

                {/* Assigned Counselor */}
                {getAvailableCounselors().length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assign to Counselor
                    </label>
                    <select
                      value={newLeadForm.assignedCounselor}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedCounselor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Auto-assign</option>
                      {getAvailableCounselors().map((counselor) => (
                        <option key={counselor.id} value={counselor.id}>
                          {counselor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Lead Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lead Source
                  </label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={newLeadForm.followUpDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLead}
                  disabled={!newLeadForm.name || !newLeadForm.email || !newLeadForm.course}
                  className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
                    !newLeadForm.name || !newLeadForm.email || !newLeadForm.course
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}
