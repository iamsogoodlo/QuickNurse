
import React, { useState, useEffect, ChangeEvent } from 'react';
import { findNearbyNurses } from '../../../services/nurseService';
import { NearbyNurse, ApiError, PatientProfile } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Select from '../../common/Select';
import LoadingSpinner from '../../common/LoadingSpinner';
import NurseCard from './NurseCard';
import { NURSE_SPECIALTY_OPTIONS, CA_PROVINCES } from '../../../constants';
import RequestServiceModal from './RequestServiceModal';
import UserLocationMap from '../../common/UserLocationMap';
import { geocodeAddress } from '../../../services/geocodingService';

const FindNursesPanel: React.FC = () => {
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateProv, setStateProv] = useState<string>(CA_PROVINCES[0]);
  const [zip, setZip] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<string>('15');
  const [specialty, setSpecialty] = useState<string>('all');
  const [serviceType, setServiceType] = useState<string>('general');
  
  const [nurses, setNurses] = useState<NearbyNurse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user, userType } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalServiceType, setModalServiceType] = useState<string>('general');

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
      });
    }
  };

  useEffect(() => {
    if (userType === 'patient' && user) {
      const patientProfile = user as PatientProfile;
      if (patientProfile.address) {
        setStreet(patientProfile.address.street);
        setCity(patientProfile.address.city);
        setStateProv(patientProfile.address.state);
        setZip(patientProfile.address.zip_code);
        if (patientProfile.address.coordinates) {
          setCoords({ lat: patientProfile.address.coordinates[1], lng: patientProfile.address.coordinates[0] });
        }
      }
    }
  }, [user, userType]);


  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let position = coords;
    if (!position) {
      const geo = await geocodeAddress(`${street}, ${city}, ${stateProv} ${zip}`);
      if (!geo) {
        setError('Unable to geocode address.');
        return;
      }
      position = { lat: geo[0], lng: geo[1] };
      setCoords(position);
    }
    setError(null);
    setIsLoading(true);
    setNurses([]);

    const response = await findNearbyNurses(
      position.lat,
      position.lng,
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
              id="street"
              label="Street Address"
              value={street}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setStreet(e.target.value)}
              required
            />
            <Input
              id="city"
              label="City"
              value={city}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                id="state"
                label="State"
                value={stateProv}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStateProv(e.target.value)}
                options={CA_PROVINCES.map(p => ({ value: p, label: p }))}
              />
              <Input
                id="zip"
                label="Postal Code"
                value={zip}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setZip(e.target.value)}
                required
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleUseCurrentLocation} fullWidth>
              Use My Current Location
            </Button>
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
          <div className="mb-6">
            <UserLocationMap latitude={coords?.lat} longitude={coords?.lng} />
          </div>

          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
          
          {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

          {!isLoading && nurses.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Available Nurses ({nurses.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-x-6 gap-y-8"> {/* Adjusted for potentially 2 cards per row on larger screens in this layout */}
                {nurses.map(nurse => (
                  <NurseCard key={nurse.nurse_id} nurse={nurse} onRequest={() => { setModalServiceType(serviceType); setShowModal(true); }} />
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
      <RequestServiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultServiceType={modalServiceType}
      />
    </div>
  );
};

export default FindNursesPanel;
