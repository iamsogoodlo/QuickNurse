
import React, { useState, useEffect, ChangeEvent } from 'react';
import { findNearbyNurses } from '../../../services/nurseService';
import { NearbyNurse, ApiError, PatientProfile } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Select from '../../common/Select';
import LoadingSpinner from '../../common/LoadingSpinner';
import NurseCard from './NurseCard';
import { NURSE_SPECIALTY_OPTIONS } from '../../../constants';
import { MapPinIcon } from '@heroicons/react/24/outline'; // For map placeholder

const FindNursesPanel: React.FC = () => {
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [radius, setRadius] = useState<string>('15');
  const [specialty, setSpecialty] = useState<string>('all');
  const [serviceType, setServiceType] = useState<string>('general');
  
  const [nurses, setNurses] = useState<NearbyNurse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user, userType } = useAuth();

  useEffect(() => {
    if (userType === 'patient' && user) {
      const patientProfile = user as PatientProfile;
      if (patientProfile.address && patientProfile.address.coordinates) {
         setLat(patientProfile.address.coordinates[1].toString());
         setLng(patientProfile.address.coordinates[0].toString());
      }
    }
  }, [user, userType]);


  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lat || !lng) {
      setError("Please provide your current latitude and longitude for an accurate search. If this is your first time, these may be auto-filled from your profile if coordinates were successfully geocoded upon registration.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setNurses([]);

    const response = await findNearbyNurses(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius, 10),
      specialty,
      serviceType,
      token
    );
    setIsLoading(false);
    if (response.success && response.data) {
      setNurses(response.data);
      if(response.data.length === 0) {
        setError("No nurses found matching your criteria. Try expanding your search radius or changing specialty.");
      }
    } else {
      setError((response.error as ApiError)?.message || "Failed to fetch nurses. Please try again.");
    }
  };
  
  const serviceTypeOptions = [
    { value: 'general', label: 'General Checkup' },
    { value: 'fever_check', label: 'Fever Check' },
    { value: 'blood_pressure', label: 'Blood Pressure Monitoring' },
    { value: 'wound_care', label: 'Wound Care' },
    { value: 'medication_help', label: 'Medication Help' },
    { value: 'health_consultation', label: 'Health Consultation' },
    { value: 'diabetes_care', label: 'Diabetes Care' },
    { value: 'iv_therapy', label: 'IV Therapy' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Find Available Nurses</h2>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search Form Area */}
        <div className="lg:w-1/3 space-y-4 bg-gray-50 p-4 rounded-lg shadow">
           <p className="text-sm text-gray-600 mb-3">Enter your location and preferences to find a nurse.</p>
           <form onSubmit={handleSearch} className="space-y-3">
            <Input 
              id="patient-lat"
              label="Your Latitude" 
              type="number" 
              step="any"
              value={lat} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLat(e.target.value)} 
              placeholder="e.g. 34.0522"
              required 
            />
            <Input 
              id="patient-lng"
              label="Your Longitude" 
              type="number" 
              step="any"
              value={lng} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLng(e.target.value)} 
              placeholder="e.g. -118.2437"
              required 
            />
            <Input 
              id="search-radius"
              label="Search Radius (miles)" 
              type="number" 
              value={radius} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRadius(e.target.value)} 
              min="1"
              max="50"
              required 
            />
            <Select
              id="nurse-specialty-filter"
              label="Required Specialty"
              value={specialty}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSpecialty(e.target.value)}
              options={[
                { value: 'all', label: 'Any Specialty' },
                ...NURSE_SPECIALTY_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
              ]}
            />
            <Select
              id="service-type-filter"
              label="Service Type"
              value={serviceType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setServiceType(e.target.value)}
              options={serviceTypeOptions}
            />
            <Button type="submit" variant="primary" isLoading={isLoading} fullWidth className="h-11">
              Search Nurses
            </Button>
          </form>
        </div>

        {/* Map Placeholder and Results Area */}
        <div className="lg:w-2/3">
          {/* Map Placeholder */}
          <div className="bg-gray-200 h-64 lg:h-80 rounded-lg flex flex-col items-center justify-center text-center p-4 mb-6 shadow-inner">
            <MapPinIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500">Interactive Map View</h3>
            <p className="text-gray-400">Nearby nurses will be displayed here.</p>
            <p className="text-xs text-gray-400 mt-1">(Map functionality coming soon)</p>
          </div>

          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
          
          {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

          {!isLoading && nurses.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Available Nurses ({nurses.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-x-6 gap-y-8"> {/* Adjusted for potentially 2 cards per row on larger screens in this layout */}
                {nurses.map(nurse => (
                  <NurseCard key={nurse.nurse_id} nurse={nurse} serviceType={serviceType} />
                ))}
              </div>
            </div>
          )}
           {!isLoading && nurses.length === 0 && !error && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No results to display yet.</p>
                <p className="text-gray-400 text-sm">Use the form to search for nurses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindNursesPanel;
