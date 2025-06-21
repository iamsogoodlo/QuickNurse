
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NurseProfile, NurseStatus, ApiError, ServiceRequestSummaryForNurse } from '../types';
import { updateNurseStatus, getNurseProfile } from '../services/nurseService';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { NURSE_STATUS_OPTIONS } from '../constants';
import ServiceRequestCardNurseView from '../components/dashboard/nurse/ServiceRequestCardNurseView'; // New component
import { PowerIcon, UserCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';


// Mock data for incoming service requests
const mockRequests: ServiceRequestSummaryForNurse[] = [
  {
    request_id: 'req_1',
    patient_display_name: 'Patient A.B.',
    service_type: 'Wound Care',
    approx_distance_miles: 2.5,
    patient_city_state: 'Anytown, ST',
    estimated_earnings: 45,
    requested_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    status: 'pending',
  },
  {
    request_id: 'req_2',
    patient_display_name: 'Patient C.D.',
    service_type: 'IV Therapy',
    approx_distance_miles: 5.1,
    patient_city_state: 'Otherville, ST',
    estimated_earnings: 70,
    requested_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 minutes ago
    status: 'pending',
  },
];


const NurseDashboardPage: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [nurseProfile, setNurseProfile] = useState<NurseProfile | null>(user as NurseProfile);
  const [isOnline, setIsOnline] = useState<boolean>(nurseProfile?.is_online || false);
  const [currentStatus, setCurrentStatus] = useState<NurseStatus>(nurseProfile?.current_status || NurseStatus.OFFLINE);
  const [isLoading, setIsLoading] = useState<boolean>(!nurseProfile);
  const [isStatusUpdating, setIsStatusUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [incomingRequests, setIncomingRequests] = useState<ServiceRequestSummaryForNurse[]>(mockRequests);


  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        setIsLoading(true);
        const response = await getNurseProfile(token);
        setIsLoading(false);
        if (response.success && response.data) {
          setNurseProfile(response.data);
          setIsOnline(response.data.is_online);
          setCurrentStatus(response.data.current_status);
        } else {
          setError((response.error as ApiError)?.message || "Failed to load profile.");
          if (response.error && (typeof response.error === 'object' && 'message' in response.error && (response.error.message?.includes("401") || response.error.message?.includes("Unauthorized")))) {
            logout();
          }
        }
      }
    };
    if (!nurseProfile?.total_earnings && token) { 
        fetchProfile();
    } else if (!token) {
        setIsLoading(false);
        setError("Not authenticated.");
    }
  }, [token, logout, nurseProfile?.total_earnings]);

  const handleOnlineOfflineToggle = async () => {
    if (!token) {
      setError("Authentication token not found.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsStatusUpdating(true);

    const newIsOnlineState = !isOnline;
    const newCurrentStatusState = newIsOnlineState ? NurseStatus.AVAILABLE : NurseStatus.OFFLINE;

    const response = await updateNurseStatus({ is_online: newIsOnlineState, current_status: newCurrentStatusState }, token);
    setIsStatusUpdating(false);
    if (response.success && response.data) {
      setNurseProfile(response.data);
      setIsOnline(response.data.is_online);
      setCurrentStatus(response.data.current_status);
      setSuccessMessage(`You are now ${response.data.is_online ? 'Online' : 'Offline'}. Status set to ${response.data.current_status.replace(/_/g, ' ')}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setError((response.error as ApiError)?.message || "Failed to update online/offline status.");
    }
  };
  
  const handleStatusDropdownChange = async (newStatus: NurseStatus) => {
    if (!token) {
      setError("Authentication token not found.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsStatusUpdating(true);
    setCurrentStatus(newStatus); // Optimistic update for dropdown UI

    // If changing status to OFFLINE via dropdown, ensure isOnline is also false.
    // If changing to an "active" status, ensure isOnline is true.
    const newIsOnlineState = newStatus !== NurseStatus.OFFLINE;
    if (newIsOnlineState !== isOnline) {
        setIsOnline(newIsOnlineState); // keep UI toggle in sync
    }

    const response = await updateNurseStatus({ is_online: newIsOnlineState, current_status: newStatus }, token);
    setIsStatusUpdating(false);
    if (response.success && response.data) {
      setNurseProfile(response.data);
      setIsOnline(response.data.is_online); // Ensure state matches server response
      setCurrentStatus(response.data.current_status); // Ensure state matches server response
      setSuccessMessage(`Status updated to ${response.data.current_status.replace(/_/g, ' ')}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError((response.error as ApiError)?.message || "Failed to update status.");
      // Revert optimistic update if API call fails
      setCurrentStatus(nurseProfile?.current_status || NurseStatus.OFFLINE);
      setIsOnline(nurseProfile?.is_online || false);
    }
  };

  const handleRequestAction = (requestId: string, action: 'accept' | 'decline') => {
    alert(`Request ${requestId} ${action}ed. (Functionality not fully implemented)`);
    setIncomingRequests(prev => prev.filter(req => req.request_id !== requestId));
  };


  if (isLoading && !nurseProfile) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!nurseProfile) {
    return <div className="text-center text-red-500 p-4 mt-10">{error || "Nurse profile not available. Please try logging in again."}</div>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nurse Dashboard</h1>
          <p className="text-md sm:text-lg text-gray-600">Welcome, {nurseProfile.first_name}!</p>
        </div>
        {/* Prominent Online/Offline Toggle Switch */}
        <div className="mt-4 sm:mt-0">
            <label htmlFor="onlineToggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="onlineToggle" 
                        className="sr-only" 
                        checked={isOnline} 
                        onChange={handleOnlineOfflineToggle}
                        disabled={isStatusUpdating}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${isOnline ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isOnline ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className={`ml-3 font-medium ${isOnline ? 'text-teal-600' : 'text-gray-700'}`}>
                    {isStatusUpdating ? 'Updating...' : (isOnline ? 'You are ONLINE' : 'You are OFFLINE')}
                </div>
            </label>
        </div>
      </div>

      {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm transition-opacity duration-300">{error}</div>}
      {successMessage && <div className="p-3 mb-4 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm transition-opacity duration-300">{successMessage}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status and Profile */}
        <div className="lg:col-span-1 space-y-6">
            {/* Availability Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <PowerIcon className="h-6 w-6 text-teal-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-700">Manage Availability</h2>
                </div>
                <Select
                    id="nurse-current-status-dropdown"
                    label="Set Current Status:"
                    value={currentStatus}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleStatusDropdownChange(e.target.value as NurseStatus)}
                    options={NURSE_STATUS_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
                    disabled={(!isOnline && currentStatus !== NurseStatus.OFFLINE) || isStatusUpdating}
                    containerClassName="mb-1"
                />
                {(!isOnline && currentStatus !== NurseStatus.OFFLINE) && 
                    <p className="text-xs text-orange-600 mt-1">Note: To set an active status, you must first toggle to 'Online'.</p>
                }
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <div className="flex items-center mb-4">
                    <UserCircleIcon className="h-6 w-6 text-teal-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-700">Profile Summary</h2>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                    <p><strong>Email:</strong> {nurseProfile.email}</p>
                    <p><strong>License:</strong> {nurseProfile.license_type} - {nurseProfile.license_number} ({nurseProfile.license_state})</p>
                    <p><strong>Experience:</strong> {nurseProfile.years_experience} years</p>
                    <p><strong>Rate:</strong> ${nurseProfile.hourly_rate.toFixed(2)}/hr</p>
                    <p><strong>Specialties:</strong> {nurseProfile.specialties.length > 0 ? nurseProfile.specialties.map(s => s.replace(/_/g, ' ')).join(', ') : 'Not specified'}</p>
                    <p><strong>Account:</strong> <span className="capitalize font-medium">{nurseProfile.account_status}</span></p>
                    <p><strong>Verification:</strong> <span className="capitalize font-medium text-green-600">{nurseProfile.verification_status}</span></p>
                </div>
            </div>
        </div>
        
        {/* Right Column: Incoming Service Requests */}
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <div className="flex items-center mb-4">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-teal-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-700">Incoming Service Requests</h2>
                </div>
                {isStatusUpdating && <div className="py-2"><LoadingSpinner size="sm" /></div>}

                {!isOnline && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">You are currently offline.</p>
                        <p className="text-gray-400 text-sm">Go online to see new service requests.</p>
                    </div>
                )}

                {isOnline && incomingRequests.length === 0 && !isStatusUpdating && (
                     <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No new requests at the moment.</p>
                        <p className="text-gray-400 text-sm">We'll notify you when a new request comes in.</p>
                    </div>
                )}
                
                {isOnline && incomingRequests.length > 0 && (
                    <div className="space-y-4">
                        {incomingRequests.map(request => (
                            <ServiceRequestCardNurseView 
                                key={request.request_id} 
                                request={request}
                                onAccept={() => handleRequestAction(request.request_id, 'accept')}
                                onDecline={() => handleRequestAction(request.request_id, 'decline')}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboardPage;
