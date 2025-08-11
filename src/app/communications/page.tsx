'use client';

import { useState, useEffect } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { Communication, Lead } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';

// Mock data
const mockCommunications: (Communication & { leadName: string })[] = [
  {
    id: '1',
    leadId: 'lead-1',
    leadName: 'Dr. Priya Sharma',
    type: 'whatsapp',
    direction: 'outbound',
    content: 'Hi Dr. Sharma! Thank you for your interest in our Fellowship in Emergency Medicine program. I\'d love to discuss the details with you.',
    status: 'delivered',
    timestamp: new Date('2024-08-04T09:30:00'),
    counselorId: 'counselor-1',
  },
  {
    id: '2',
    leadId: 'lead-1',
    leadName: 'Dr. Priya Sharma',
    type: 'whatsapp',
    direction: 'inbound',
    content: 'Yes, I\'m very interested! Can you tell me more about the curriculum and admission process?',
    status: 'read',
    timestamp: new Date('2024-08-04T09:45:00'),
  },
  {
    id: '3',
    leadId: 'lead-2',
    leadName: 'Dr. Rajesh Kumar',
    type: 'email',
    direction: 'outbound',
    content: 'Subject: Welcome to DMHCA - Your Medical Training Journey Begins Here!\n\nDear Dr. Kumar,\n\nThank you for showing interest in our Diploma in Critical Care program...',
    status: 'sent',
    timestamp: new Date('2024-08-04T08:15:00'),
    counselorId: 'counselor-2',
  },
  {
    id: '4',
    leadId: 'lead-3',
    leadName: 'Dr. Sarah Johnson',
    type: 'call',
    direction: 'outbound',
    content: 'Follow-up call regarding Certificate in Telemedicine program. Duration: 15 minutes. Outcome: Interested, sending brochure.',
    status: 'delivered',
    timestamp: new Date('2024-08-04T10:00:00'),
    counselorId: 'counselor-1',
  },
];

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Message',
    type: 'whatsapp' as const,
    content: 'Hi {{name}}! Welcome to DMHCA. Thank you for your interest in {{course}}. Our counselor will contact you shortly.',
  },
  {
    id: '2',
    name: 'Follow-up Reminder',
    type: 'whatsapp' as const,
    content: 'Hi {{name}}, just following up on your interest in {{course}}. Do you have any questions I can help with?',
  },
  {
    id: '3',
    name: 'Course Information',
    type: 'email' as const,
    content: 'Subject: Complete Information about {{course}}\n\nDear {{name}},\n\nAttached please find detailed information about {{course}} including curriculum, fees, and admission process.',
  },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Calls' },
  { value: 'sms', label: 'SMS' },
];

const directionOptions = [
  { value: 'all', label: 'All Directions' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
];

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState(mockCommunications);
  const [filteredCommunications, setFilteredCommunications] = useState(mockCommunications);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<any>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'templates'>('inbox');

  // Filter communications
  useEffect(() => {
    let filtered = communications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(comm =>
        comm.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(comm => comm.type === typeFilter);
    }

    // Direction filter
    if (directionFilter !== 'all') {
      filtered = filtered.filter(comm => comm.direction === directionFilter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredCommunications(filtered);
  }, [communications, searchQuery, typeFilter, directionFilter]);

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'whatsapp':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'call':
        return <PhoneIcon className="h-4 w-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Communication['type']) => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'call':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sms':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Communication['status']) => {
    switch (status) {
      case 'sent':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      case 'read':
        return 'text-green-700';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unified inbox for WhatsApp, Email, and Call management
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowComposeModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Compose
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inbox'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Unified Inbox
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Templates
          </button>
        </nav>
      </div>

      {activeTab === 'inbox' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communications..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Direction
                    </label>
                    <select
                      value={directionFilter}
                      onChange={(e) => setDirectionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {directionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Communications List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCommunications.map((communication) => (
                <div
                  key={communication.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedCommunication(communication)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Type Icon */}
                      <div className={`p-2 rounded-lg border ${getTypeColor(communication.type)}`}>
                        {getTypeIcon(communication.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {communication.leadName}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(communication.type)}`}>
                            {communication.type}
                          </span>
                          <span className={`text-xs ${communication.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'}`}>
                            {communication.direction === 'inbound' ? '→' : '←'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {communication.content}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(communication.timestamp)}</span>
                          <span className={getStatusColor(communication.status)}>
                            {communication.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCommunications.length === 0 && (
              <div className="p-12 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No communications found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Message Templates
              </h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Template
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockTemplates.map((template) => (
              <div key={template.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {template.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Communication Detail Modal */}
      {selectedCommunication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Communication Details
              </h3>
              <button
                onClick={() => setSelectedCommunication(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg border ${getTypeColor(selectedCommunication.type)}`}>
                  {getTypeIcon(selectedCommunication.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {selectedCommunication.leadName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCommunication.type} • {selectedCommunication.direction} • {formatDate(selectedCommunication.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedCommunication.content}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                  Reply
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
