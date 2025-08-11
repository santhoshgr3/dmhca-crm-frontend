'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { User, BRANCHES } from '@/types';

interface UserDetailModalProps {
  user: User;
  allUsers: User[];
  isOpen: boolean;
  onClose: () => void;
}

interface PerformanceMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  callsMade: number;
  avgResponseTime: number;
  monthlyTarget: number;
  achievement: number;
}

// Mock performance data
const getMockPerformance = (userId: string): PerformanceMetrics => {
  const performances: Record<string, PerformanceMetrics> = {
    '1': { // Manager
      totalLeads: 250,
      convertedLeads: 85,
      conversionRate: 34,
      revenue: 4250000,
      callsMade: 156,
      avgResponseTime: 2.5,
      monthlyTarget: 5000000,
      achievement: 85,
    },
    '2': { // Team Lead
      totalLeads: 120,
      convertedLeads: 48,
      conversionRate: 40,
      revenue: 2400000,
      callsMade: 180,
      avgResponseTime: 1.8,
      monthlyTarget: 2500000,
      achievement: 96,
    },
    '3': { // Counselor
      totalLeads: 80,
      convertedLeads: 28,
      conversionRate: 35,
      revenue: 1400000,
      callsMade: 220,
      avgResponseTime: 1.2,
      monthlyTarget: 1500000,
      achievement: 93,
    },
  };
  
  return performances[userId] || {
    totalLeads: Math.floor(Math.random() * 100) + 20,
    convertedLeads: Math.floor(Math.random() * 30) + 10,
    conversionRate: Math.floor(Math.random() * 40) + 20,
    revenue: Math.floor(Math.random() * 2000000) + 500000,
    callsMade: Math.floor(Math.random() * 200) + 50,
    avgResponseTime: Math.random() * 3 + 0.5,
    monthlyTarget: Math.floor(Math.random() * 3000000) + 1000000,
    achievement: Math.floor(Math.random() * 30) + 70,
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export default function UserDetailModal({ user, allUsers, isOpen, onClose }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'performance'>('overview');
  
  if (!isOpen) return null;

  const performance = getMockPerformance(user.id);
  
  // Get team members if user is a team lead
  const teamMembers = user.teamMembers 
    ? allUsers.filter(u => user.teamMembers?.includes(u.id))
    : [];

  // Get team lead if user is a counselor
  const teamLead = user.teamLeadId 
    ? allUsers.find(u => u.id === user.teamLeadId)
    : null;

  // Get all subordinates recursively (for managers)
  const getAllSubordinates = (userId: string): User[] => {
    const directReports = allUsers.filter(u => u.teamLeadId === userId);
    const teamLeads = allUsers.filter(u => u.role === 'team_lead' && directReports.some(r => r.id === u.id));
    
    let allSubordinates = [...directReports];
    teamLeads.forEach(lead => {
      if (lead.teamMembers) {
        const leadMembers = allUsers.filter(u => lead.teamMembers?.includes(u.id));
        allSubordinates = [...allSubordinates, ...leadMembers];
      }
    });
    
    return allSubordinates;
  };

  const allSubordinates = user.role === 'manager' ? getAllSubordinates(user.id) : [];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'team', name: 'Team', icon: UserGroupIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'team_lead' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'manager' ? 'Manager' : 
                   user.role === 'team_lead' ? 'Team Lead' : 'Counselor'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900 dark:text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-gray-900 dark:text-white">{BRANCHES[user.branch].name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {BRANCHES[user.branch].city}, {BRANCHES[user.branch].state}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-gray-900 dark:text-white">Joined</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-gray-900 dark:text-white">Last Login</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {performance.totalLeads}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {performance.convertedLeads}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Converted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {performance.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {performance.achievement}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Target Achievement</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Hierarchy</h3>
              
              {/* If user is a manager, show all subordinates */}
              {user.role === 'manager' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Total team members: {allSubordinates.length}
                  </div>
                  
                  {/* Team Leads */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Team Leads</h4>
                    {allUsers.filter(u => u.role === 'team_lead').map(teamLead => (
                      <div key={teamLead.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {teamLead.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{teamLead.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{teamLead.email}</div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {teamLead.teamMembers?.length || 0} members
                          </span>
                        </div>
                        
                        {/* Team Lead's Members */}
                        {teamLead.teamMembers && (
                          <div className="ml-6 space-y-2">
                            {allUsers.filter(u => teamLead.teamMembers?.includes(u.id)).map(member => (
                              <div key={member.id} className="flex items-center space-x-3 py-2">
                                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If user is a team lead, show team members */}
              {user.role === 'team_lead' && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Team size: {teamMembers.length} members
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map(member => (
                      <div key={member.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {BRANCHES[member.branch].name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If user is a counselor, show team lead */}
              {user.role === 'counselor' && teamLead && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Reports To</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {teamLead.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{teamLead.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{teamLead.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Team Lead</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
              
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Leads</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {formatNumber(performance.totalLeads)}
                      </p>
                    </div>
                    <UserGroupIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Converted</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                        {formatNumber(performance.convertedLeads)}
                      </p>
                    </div>
                    <TrophyIcon className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Revenue</p>
                      <p className="text-xl font-bold text-purple-800 dark:text-purple-300">
                        {formatCurrency(performance.revenue)}
                      </p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Achievement</p>
                      <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                        {performance.achievement}%
                      </p>
                    </div>
                    <TrophyIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Calls Made</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatNumber(performance.callsMade)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {performance.avgResponseTime.toFixed(1)} hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {performance.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Target Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Target</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(performance.monthlyTarget)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(performance.achievement, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {performance.achievement}% achieved
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
