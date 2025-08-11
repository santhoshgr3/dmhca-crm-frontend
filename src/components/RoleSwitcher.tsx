'use client';

import { useState } from 'react';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSwitcher() {
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const testUsers = [
    { username: 'admin', name: 'Admin Manager', role: 'manager' },
    { username: 'john_lead', name: 'John Smith (Team Lead)', role: 'team_lead' },
    { username: 'sarah_counselor', name: 'Sarah Wilson (Counselor)', role: 'counselor' },
    { username: 'mike_counselor', name: 'Mike Johnson (Counselor)', role: 'counselor' },
  ];

  const handleRoleSwitch = async (username: string) => {
    await login(username, 'password'); // Mock login
    setIsOpen(false);
    window.location.reload(); // Refresh to update all components
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          Switch Role ({user.role.replace('_', ' ')})
        </button>
        
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-48">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                Test Different Roles:
              </div>
              {testUsers.map((testUser) => (
                <button
                  key={testUser.username}
                  onClick={() => handleRoleSwitch(testUser.username)}
                  className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    user.username === testUser.username 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="font-medium">{testUser.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {testUser.role.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
