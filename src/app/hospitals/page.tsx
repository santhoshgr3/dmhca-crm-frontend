'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { Hospital } from '@/types';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Fix for Leaflet marker icons in Next.js
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Mock hospital data
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    address: 'Ansari Nagar, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.5672,
    longitude: 77.2098,
    phone: '+91-11-26588500',
    email: 'info@aiims.edu',
    website: 'https://www.aiims.edu',
    specialties: ['Emergency Medicine', 'Critical Care', 'Cardiology', 'Neurosurgery'],
    courses: ['Fellowship in Emergency Medicine', 'Diploma in Critical Care'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Apollo Hospital',
    address: 'Sarita Vihar, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.5355,
    longitude: 77.2767,
    phone: '+91-11-26925858',
    email: 'info@apollohospitals.com',
    website: 'https://www.apollohospitals.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    courses: ['Fellowship in Cardiology', 'Certificate in Telemedicine'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Fortis Healthcare',
    address: 'Sector 62, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    latitude: 28.6203,
    longitude: 77.3678,
    phone: '+91-120-5200400',
    email: 'info@fortishealthcare.com',
    website: 'https://www.fortishealthcare.com',
    specialties: ['Emergency Medicine', 'Critical Care', 'Pediatrics'],
    courses: ['Diploma in Critical Care', 'Fellowship in Emergency Medicine'],
    isActive: true,
  },
  {
    id: '4',
    name: 'Max Healthcare',
    address: 'Saket, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.5244,
    longitude: 77.2066,
    phone: '+91-11-26515050',
    email: 'info@maxhealthcare.com',
    website: 'https://www.maxhealthcare.in',
    specialties: ['Cardiology', 'Neurosurgery', 'Oncology', 'Gastroenterology'],
    courses: ['Fellowship in Cardiology', 'Diploma in Anesthesia'],
    isActive: true,
  },
];

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(mockHospitals);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Delhi center

  // Get unique cities and specialties for filters
  const cities = Array.from(new Set(hospitals.map(h => h.city)));
  const specialties = Array.from(new Set(hospitals.flatMap(h => h.specialties)));

  // Filter hospitals based on search and filters
  useEffect(() => {
    let filtered = hospitals;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // City filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(hospital => hospital.city === selectedCity);
    }

    // Specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(hospital => 
        hospital.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedCity, selectedSpecialty]);

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setMapCenter([hospital.latitude, hospital.longitude]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Locations</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive map of partner hospitals and training centers
        </p>
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
                placeholder="Search hospitals..."
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
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospital List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hospitals ({filteredHospitals.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedHospital?.id === hospital.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {hospital.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <MapPinIcon className="h-3 w-3 inline mr-1" />
                        {hospital.city}, {hospital.state}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hospital.specialties.slice(0, 2).map((specialty) => (
                          <span
                            key={specialty}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {hospital.specialties.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{hospital.specialties.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-96 relative">
              {typeof window !== 'undefined' && (
                <MapContainer
                  center={mapCenter}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredHospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      position={[hospital.latitude, hospital.longitude]}
                      eventHandlers={{
                        click: () => setSelectedHospital(hospital),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-sm">{hospital.name}</h3>
                          <p className="text-xs text-gray-600">{hospital.address}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {hospital.phone}
                            </div>
                            <div className="flex items-center text-xs">
                              <EnvelopeIcon className="h-3 w-3 mr-1" />
                              {hospital.email}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Details */}
      {selectedHospital && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedHospital.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {selectedHospital.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {selectedHospital.email}
                    </div>
                    {selectedHospital.website && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <GlobeAltIcon className="h-4 w-4 mr-2" />
                        <a 
                          href={selectedHospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedHospital.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Available Courses
                  </h3>
                  <div className="space-y-1">
                    {selectedHospital.courses.map((course) => (
                      <div
                        key={course}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        • {course}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
