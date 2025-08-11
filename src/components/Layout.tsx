// Main layout component for DMHCA CRM
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  PhoneIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  UsersIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BRANCHES } from '@/types';
import RoleSwitcher from './RoleSwitcher';
import ClientOnly from './ClientOnly';
import NotificationBell from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and today\'s calls',
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: UserGroupIcon,
    description: 'Manage leads and follow-ups',
  },
  {
    name: 'Communications',
    href: '/communications',
    icon: PhoneIcon,
    description: 'WhatsApp, Email & Call logs',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Reports and performance metrics',
  },
  {
    name: 'Hospitals',
    href: '/hospitals',
    icon: MapIcon,
    description: 'Hospital locations and details',
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: AcademicCapIcon,
    description: 'Course catalog management',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
    description: 'System configuration',
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isManager, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // If on login page, render without sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If user is not authenticated and not on login page, don't render the full layout
  if (!user) {
    return <>{children}</>;
  }

  // Dynamic navigation based on user role
  const getNavigationItems = () => {
    const baseNavigation = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        description: 'Overview and today\'s calls',
      },
      {
        name: 'Leads',
        href: '/leads',
        icon: UserGroupIcon,
        description: 'Manage leads and follow-ups',
      },
      {
        name: 'Sales',
        href: '/sales',
        icon: BanknotesIcon,
        description: 'Sales reports and payment tracking',
      },
      {
        name: 'Communications',
        href: '/communications',
        icon: PhoneIcon,
        description: 'WhatsApp, Email & Call logs',
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: ChartBarIcon,
        description: 'Reports and performance metrics',
      },
      {
        name: 'Hospitals',
        href: '/hospitals',
        icon: MapIcon,
        description: 'Hospital locations and details',
      },
      {
        name: 'Courses',
        href: '/courses',
        icon: AcademicCapIcon,
        description: 'Course catalog management',
      },
    ];

    // Add Users management only for managers
    if (isManager()) {
      baseNavigation.splice(-2, 0, {
        name: 'Users',
        href: '/users',
        icon: UsersIcon,
        description: 'User management and permissions',
      });
    }

    baseNavigation.push({
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      description: 'System configuration',
    });

    return baseNavigation;
  };

  const navigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                DMHCA CRM
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                DMHCA CRM
              </span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delhi Medical Healthcare Academy CRM
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <UserCircleIcon className="h-6 w-6" />
                  <ClientOnly fallback={
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Loading...
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Role
                      </div>
                    </div>
                  }>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user?.role?.replace('_', ' ') || 'Role'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.branch && BRANCHES[user.branch]?.name || 'Branch'}
                      </div>
                    </div>
                  </ClientOnly>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Role Switcher for testing */}
      <RoleSwitcher />
    </div>
  );
}
