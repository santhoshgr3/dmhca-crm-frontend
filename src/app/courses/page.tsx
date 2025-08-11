'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Course } from '@/types';
import { formatCurrency, getQualificationLabel } from '@/lib/utils';

// Mock courses data
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Fellowship in Emergency Medicine',
    category: 'fellowship',
    description: 'Comprehensive training program in emergency medicine with hands-on experience in critical care, trauma management, and emergency procedures.',
    duration: '12 months',
    fees: 250000,
    eligibility: ['mbbs', 'md', 'ms'],
    isActive: true,
    image: '/api/placeholder/400/300',
    brochureUrl: '/brochures/fellowship-em.pdf',
  },
  {
    id: '2',
    name: 'Diploma in Critical Care Medicine',
    category: 'diploma',
    description: 'Intensive program focusing on critical care management, ventilator support, and ICU protocols for healthcare professionals.',
    duration: '6 months',
    fees: 180000,
    eligibility: ['mbbs', 'md', 'ms', 'bds'],
    isActive: true,
    image: '/api/placeholder/400/300',
    brochureUrl: '/brochures/diploma-ccm.pdf',
  },
  {
    id: '3',
    name: 'Certificate in Telemedicine',
    category: 'certification',
    description: 'Learn the fundamentals of telemedicine, digital health technologies, and remote patient care delivery systems.',
    duration: '3 months',
    fees: 85000,
    eligibility: ['mbbs', 'md', 'ms', 'bds', 'ayush'],
    isActive: true,
    image: '/api/placeholder/400/300',
    brochureUrl: '/brochures/cert-telemedicine.pdf',
  },
  {
    id: '4',
    name: 'Fellowship in Interventional Cardiology',
    category: 'fellowship',
    description: 'Advanced training in cardiac catheterization, angioplasty, stent placement, and other interventional cardiac procedures.',
    duration: '18 months',
    fees: 350000,
    eligibility: ['md', 'ms', 'md/ms'],
    isActive: true,
    image: '/api/placeholder/400/300',
    brochureUrl: '/brochures/fellowship-cardio.pdf',
  },
  {
    id: '5',
    name: 'Diploma in Anesthesia Technology',
    category: 'diploma',
    description: 'Specialized program covering anesthesia equipment, patient monitoring, and perioperative care techniques.',
    duration: '8 months',
    fees: 150000,
    eligibility: ['mbbs', 'bds', 'ayush'],
    isActive: true,
    image: '/api/placeholder/400/300',
    brochureUrl: '/brochures/diploma-anesthesia.pdf',
  },
  {
    id: '6',
    name: 'Certificate in Medical Writing',
    category: 'certification',
    description: 'Develop skills in medical communication, research writing, regulatory documentation, and scientific publishing.',
    duration: '4 months',
    fees: 65000,
    eligibility: ['mbbs', 'md', 'ms', 'bds', 'ayush', 'others'],
    isActive: true,
    image: '/api/placeholder/400/300',
    brochureUrl: '/brochures/cert-medical-writing.pdf',
  },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'fellowship', label: 'Fellowships' },
  { value: 'diploma', label: 'Diplomas' },
  { value: 'certification', label: 'Certifications' },
];

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort courses
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'fees':
          return a.fees - b.fees;
        case 'duration':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchQuery, selectedCategory, sortBy]);

  const getCategoryIcon = (category: Course['category']) => {
    switch (category) {
      case 'fellowship':
        return '🎓';
      case 'diploma':
        return '📜';
      case 'certification':
        return '🏆';
      default:
        return '📚';
    }
  };

  const getCategoryColor = (category: Course['category']) => {
    switch (category) {
      case 'fellowship':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'diploma':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'certification':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              DMHCA Course Catalog
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Advance your medical career with our comprehensive fellowship programs, 
              diplomas, and certifications designed for healthcare professionals.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Browse Courses
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-0 flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="min-w-0 flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="fees">Sort by Fees</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
            <button className="p-2 text-blue-600 bg-blue-100 dark:bg-blue-900 rounded">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">{getCategoryIcon(course.category)}</span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getCategoryColor(course.category)}`}>
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {course.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* Course Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Duration: {course.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                    Fees: {formatCurrency(course.fees)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    Eligibility: {course.eligibility.map(q => getQualificationLabel(q)).join(', ')}
                  </div>
                </div>

                {/* Rating and Reviews */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-4 w-4 ${
                          star <= 4.5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    4.5 (89 reviews)
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                    Apply Now
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Brochure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No courses found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Advance Your Career?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have enhanced their skills 
            with DMHCA's world-class training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Get Started Today
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
