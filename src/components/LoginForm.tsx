'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  error: string;
}

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});

  const fillCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(email, password);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <div className="text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none block w-full px-3 py-2 border ${
              validationErrors.email 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors(prev => ({ ...prev, email: undefined }));
              }
            }}
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {validationErrors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className={`appearance-none block w-full px-3 py-2 pr-10 border ${
              validationErrors.password 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
            )}
          </button>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {validationErrors.password}
            </p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
            isLoading
              ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400'
          } transition duration-150 ease-in-out`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </div>

      {/* Demo Credentials Helper */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p className="font-semibold text-blue-900 dark:text-blue-100">🔑 Demo Credentials (Copy & Paste):</p>
            <div className="space-y-2 font-mono text-xs">
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Manager:</strong></p>
                    <p>Email: admin@dmhca.edu</p>
                    <p>Password: password123</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@dmhca.edu', 'password123')}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded ml-2"
                    disabled={isLoading}
                  >
                    Use
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Team Lead:</strong></p>
                    <p>Email: john.smith@dmhca.edu</p>
                    <p>Password: password123</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials('john.smith@dmhca.edu', 'password123')}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded ml-2"
                    disabled={isLoading}
                  >
                    Use
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Counselor:</strong></p>
                    <p>Email: sarah.wilson@dmhca.edu</p>
                    <p>Password: password123</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials('sarah.wilson@dmhca.edu', 'password123')}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded ml-2"
                    disabled={isLoading}
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              💡 Tip: Use exactly "password123" (without quotes) for all demo accounts
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
